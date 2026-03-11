import BitField, { BitBuilder } from "./index";

import { join, parse } from "path";
import { existsSync, readFileSync, writeFileSync } from "fs";

/**
 * Тип для массива констант (можно изменяемый или неизменяемый).
 */
export type ConstArray<T> = T[] | readonly T[];

/**
 * Конфигурация для компилятора: категории и их значения.
 */
export type ISettings<T extends string> = Record<T, ConstArray<string>>;

/**
 * Настройки компилятора.
 */
export type Config = {
  /**
   * Имя генерируемого объекта-константы.
   * @default 'settings'
   */
  name: string;
  /**
   * Если `true`, компилятор будет искать в целевом файле специальные комментарии
   * и заменять их на сгенерированный код.
   * @default false
   */
  writeInCompiler: boolean;
  /**
   * Включать ли экспорт по умолчанию.
   * @default true
   */
  defaultExportOn: boolean;
};

/**
 * Константы с регулярными выражениями для замены в файле.
 */
export const replaceKeys = {
  compiled: [
    "// ## { COMPILED__WRITE_COMPILED_HERE } ## \\\\",
    /(\/\/ ## { COMPILED__WRITE_COMPILED_HERE } ## \\\\[.\s\S]*\/\/ ## { COMPILED__WRITE_COMPILED_HERE } ## \\\\)|(\/\/ ## { WRITE_COMPILED_HERE } ## \\\\)/gi,
  ],
  export: [
    "// ## { COMPILED__WRITE_EXPORT_HERE } ## \\\\",
    /(\/\/ ## { COMPILED__WRITE_EXPORT_HERE } ## \\\\[.\s\S]*\/\/ ## { COMPILED__WRITE_EXPORT_HERE } ## \\\\)|(\/\/ ## { WRITE_EXPORT_HERE } ## \\\\)/gi,
  ],
  values: [
    "// ## { COMPILED__WRITE_VALUES_HERE } ## \\\\",
    /(\/\/ ## { COMPILED__WRITE_VALUES_HERE } ## \\\\[.\s\S]*\/\/ ## { COMPILED__WRITE_VALUES_HERE } ## \\\\)|(\/\/ ## { WRITE_VALUES_HERE } ## \\\\)/gi,
  ],
} as const;

/**
 * Вспомогательная функция: оборачивает данные в маркеры для замены.
 *
 * @param key - Ключ из `replaceKeys`
 * @param data - Текст для вставки
 * @returns Строка с маркерами
 */
const formatToReplace = (key: keyof typeof replaceKeys, data: string) => {
  return `${replaceKeys[key][0]}\n${data}\n${replaceKeys[key][0]}`;
};

/**
 * Изменяет регистр первого символа строки.
 *
 * @param string - Исходная строка
 * @param capitalize - Если `true`, первый символ делается заглавным, иначе строчным
 * @returns Преобразованная строка
 */
export const format = (string: string, capitalize: boolean) =>
  capitalize
    ? string.charAt(0).toUpperCase() + string.slice(1)
    : string.charAt(0).toLowerCase() + string.slice(1);

/**
 * Форматирует массив строк по умолчанию: приводит к lowerCamelCase.
 *
 * @example
 * Вход: ["SOME_VALUE_ONE", "SOME_DIRECTIVE__SOME_VALUE"]
 * Выход: ["someValueOne", "someDirectiveSomeValue"]
 *
 * @param settings - Массив исходных строк
 * @returns Отформатированный массив
 */
export const defaultSettingsFormat = <T extends string>(
  settings: ConstArray<T>,
) =>
  settings.map((string: T) =>
    format(
      string
        .toLowerCase()
        .replaceAll("__", " ")
        .replaceAll("_", " ")
        .split(" ")
        .map((v) => format(v, true))
        .join(""),
      false,
    ),
  );

/**
 * Компилятор для генерации TypeScript-файла с константами битовых полей
 * на основе конфигурации категорий и значений.
 *
 * @typeParam T - Тип ключей категорий (строковые литералы)
 */
export class Compiler<T extends string> {
  /** Массив ключей категорий из входной конфигурации */
  public readonly keys: T[];

  /** Конфигурация компилятора */
  public readonly config: Config = {
    name: "settings",
    writeInCompiler: false,
    defaultExportOn: true,
  };

  /**
   * Создаёт экземпляр компилятора.
   *
   * @param settings - Объект, где ключи — имена категорий, а значения — массивы строк (имена битов)
   * @param filePath - Путь к выходному файлу
   * @param methods - Необязательные пользовательские реализации методов
   * @param config - Частичная конфигурация (переопределяет значения по умолчанию)
   */
  public constructor(
    public readonly settings: ISettings<T>,
    public readonly filePath: string,
    methods?: {
      /**
       * Пользовательская функция форматирования строк (например, для преобразования имён).
       */
      settingsFormat?: (settings: ISettings<T>[T]) => ConstArray<string>;
      /**
       * Пользовательская функция записи файла.
       * @warning Работает с файловой системой, будьте осторожны.
       */
      writeFile?: (me: Compiler<T>, values?: string) => string;
      /**
       * Пользовательская функция компиляции.
       * @warning Работает с файловой системой, будьте осторожны.
       */
      compile?: <K = unknown>(me: Compiler<T>) => K;
      /**
       * Пользовательская функция форматирования итогового файла.
       */
      formatFile?: (me: Compiler<T>) => any;
      /**
       * Пользовательская функция формирования строки для вставки в файл.
       */
      resolveForCompiled?: (me: Compiler<T>) => string;
    },
    config?: Partial<Config>,
  ) {
    this.keys = Object.keys(settings) as T[];
    this.filePath = join(filePath);

    this.config = config
      ? {
          ...this.config,
          ...config,
        }
      : this.config;

    if (methods) {
      (Object.keys(methods) as (keyof typeof methods)[]).forEach((key) => {
        if (methods[key]) {
          this[key] = methods[key] as any;
        }
      });
    }
  }

  /**
   * Запускает полный цикл компиляции:
   * - создаёт файл (если нужно),
   * - записывает сгенерированный код,
   * - форматирует (опционально),
   * - возвращает содержимое файла.
   *
   * @param values - Пользовательские значения для вставки в маркер `WRITE_VALUES_HERE`
   * @returns Содержимое итогового файла
   */
  public execute(values: string = "") {
    this.createFile();
    this.writeFile(this, values);
    this.formatFile();

    return readFileSync(this.filePath, "utf-8");
  }

  /**
   * Возвращает отформатированный массив строк для указанной категории.
   *
   * @param type - Ключ категории
   * @returns Массив строк, обработанный функцией `settingsFormat`
   */
  public parse(type: T) {
    const settings = this.settings[type];

    if (settings.length === 0) return [];

    return this.settingsFormat(settings);
  }

  /**
   * Функция форматирования имён (по умолчанию `defaultSettingsFormat`).
   * Может быть переопределена через `methods`.
   */
  public settingsFormat = defaultSettingsFormat;

  /**
   * Генерирует структуру объекта с битовыми значениями для всех категорий.
   *
   * @param me - Ссылка на экземпляр (для рекурсивного вызова)
   * @returns Объект вида `{ категория: { имя: выражение } }`
   */
  public compile(me: this = this) {
    const settings = Object.fromEntries(
      this.keys.map((key) => [key, this.parse(key)]),
    );

    let offset = {};
    return Object.fromEntries(
      Object.keys(settings).map((key) => {
        const bits = new BitBuilder(settings[key]).execute(offset);
        offset = bits;

        return [
          key,
          Object.fromEntries(
            Object.keys(bits).map((key) => [
              `/** @value ${bits[key]} */'\n'` + key,
              `1n << ${BitField.logarithm2(bits[key])}n`,
            ]),
          ),
        ];
      }),
    );
  }

  /**
   * Преобразует результат `compile` в строку, готовую для вставки в файл.
   *
   * @param me - Ссылка на экземпляр
   * @returns Строка с TypeScript-кодом (константа с аннотацией `as const`)
   */
  public resolveForCompiled(me: this = this) {
    return JSON.stringify(this.compile(), undefined, 2)
      .replaceAll('"', "")
      .replaceAll("}", "} as const")
      .replaceAll("'\\n'", "\n")
      .replaceAll("as const,", "as const,\n")
      .replaceAll("n,", "n,\n");
  }

  /**
   * Записывает сгенерированный код в файл, заменяя специальные маркеры или создавая файл с нуля.
   *
   * @param me - Ссылка на экземпляр
   * @param values - Строка для вставки в маркер `WRITE_VALUES_HERE`
   * @returns Строка, которая была записана в файл
   */
  public writeFile(me: this, values: string = "") {
    const data = this.resolveForCompiled(me);

    let file = "";

    const name = this.config.name;
    const capitalizeName = format(name, true);
    const settingsData =
      "\n/**" +
      `\n * - этот файл автоматически сгенерирован ${parse(__filename).name}` +
      "\n * - если вы нашли несоответствия: https://github.com/FOCKUSTY/bit-field/issues" +
      "\n */" +
      `\nexport const ${name} = ${data};`;

    const exportData =
      `\nexport type Keys = keyof typeof ${name};` +
      `\nexport type ${capitalizeName}<T extends Keys> = (typeof ${name})[T];` +
      `\nexport type ${capitalizeName}Keys<T extends Keys> = keyof ${capitalizeName}<T>;` +
      `${this.config.defaultExportOn ? `\n\nexport default ${name};\n` : ""}`;

    if (this.config.writeInCompiler) {
      file = this.readFile()
        .replaceAll(
          replaceKeys.compiled[1],
          formatToReplace("compiled", settingsData),
        )
        .replaceAll(
          replaceKeys.export[1],
          formatToReplace("export", exportData),
        )
        .replaceAll(replaceKeys.values[1], formatToReplace("values", values));
    } else {
      file = `${formatToReplace("compiled", settingsData)}\n${formatToReplace("values", values)}\n${formatToReplace("export", exportData)}`;
    }

    writeFileSync(this.filePath, file, "utf-8");

    return file;
  }

  /**
   * Читает содержимое целевого файла (если он существует и включён режим `writeInCompiler`).
   *
   * @returns Содержимое файла или пустую строку
   * @internal
   */
  private readFile() {
    if (!this.config.writeInCompiler) return "";
    if (!existsSync(this.filePath)) return "";

    return readFileSync(this.filePath, "utf-8");
  }

  /**
   * Создаёт пустой файл, если режим `writeInCompiler` выключен.
   * @internal
   */
  private createFile() {
    if (this.config.writeInCompiler) return;

    writeFileSync(this.filePath, "", "utf-8");
  }

  /**
   * Дополнительное форматирование файла (по умолчанию ничего не делает).
   * Может быть переопределено через `methods`.
   * @internal
   */
  private formatFile(me: this = this) {}
}

export default Compiler;
