import type { MaybeReadonly } from "../types";

import type { ISettings, CompilerConfig } from "./compiler.types";
import { MARKERS, defaultSettingsFormat } from "./compiler.utils";

import { CodeGenerator } from "./code-generator";
import { FileManager } from "./file-manager";

import { parse } from "path";

/**
 * Компилятор для преобразования описания битовых категорий в TypeScript-файл с константой и типами.
 * Умеет как создавать новый файл, так и обновлять существующий (используя маркеры).
 *
 * @template T - Строковые литералы категорий.
 *
 * @deprecated use a `BitBuilder.fromConfig` method
 */
export class Compiler<const T extends string> {
  /** Список ключей категорий. */
  public readonly keys: T[];
  /** Конфигурация компилятора. */
  public readonly config: CompilerConfig = {
    name: "settings",
    writeInCompiler: false,
    defaultExportOn: true,
  };

  private readonly fileManager: FileManager;
  private readonly codeGenerator: CodeGenerator<T>;

  /**
   * @param settings - Объект настроек: категория → массив имён битов.
   * @param filePath - Путь к файлу, в который будет сгенерирован код.
   * @param methods - Дополнительные методы для переопределения поведения.
   * @param config - Частичная конфигурация (имя константы, флаги).
   */
  public constructor(
    public readonly settings: MaybeReadonly<ISettings<T>>,
    public readonly filePath: string,
    methods?: {
      settingsFormat?: (settings: ISettings<T>[T]) => string[];
      writeFile?: (me: Compiler<T>, values?: string) => string;
      compile?: <K = unknown>(me: Compiler<T>) => K;
      formatFile?: (me: Compiler<T>) => any;
      resolveForCompiled?: (me: Compiler<T>) => string;
    },
    config?: Partial<CompilerConfig>,
  ) {
    this.keys = Object.keys(settings) as T[];
    this.fileManager = new FileManager(filePath);
    const settingsFormat = methods?.settingsFormat ?? defaultSettingsFormat;
    this.codeGenerator = new CodeGenerator(settings, settingsFormat);

    if (config) {
      this.config = { ...this.config, ...config };
    }

    if (methods) {
      (Object.keys(methods) as (keyof typeof methods)[]).forEach((key) => {
        if (methods[key]) {
          this[key] = methods[key] as any;
        }
      });
    }
  }

  /**
   * Запускает компиляцию: создаёт файл (если требуется), записывает в него сгенерированный код,
   * выполняет форматирование и возвращает содержимое файла.
   *
   * @param values - Дополнительный пользовательский код, который будет вставлен в блок VALUES.
   * @returns Содержимое итогового файла.
   */
  public execute(values: string = ""): string {
    this.createFile();
    this.writeFile(this, values);
    this.formatFile();
    return this.fileManager.read();
  }

  /**
   * Возвращает отформатированный массив имён битов для указанной категории.
   *
   * @param type - Категория.
   * @returns Массив строк после применения `settingsFormat`.
   */
  public parse(type: T): string[] {
    const settings = this.settings[type];
    if (settings.length === 0) {
      return [];
    }
    return this.settingsFormat(settings);
  }

  /** Функция форматирования имён (по умолчанию — `defaultSettingsFormat`). */
  public settingsFormat = defaultSettingsFormat;

  /**
   * Компилирует настройки в структуру (вызов `CodeGenerator.generateStructure`).
   *
   * @returns Объект, представляющий генерируемую константу.
   */
  public compile(): Record<string, Record<string, string>> {
    return this.codeGenerator.generateStructure(this.config.jsdocs);
  }

  /**
   * Возвращает строковое представление скомпилированной константы.
   *
   * @returns Код вида `{ ... } as const`.
   */
  public resolveForCompiled(): string {
    const structure = this.compile();
    return this.codeGenerator.toCodeString(structure);
  }

  /**
   * Записывает сгенерированный код в файл.
   *
   * @param _me - Ссылка на экземпляр компилятора (не используется, но сохраняется для совместимости).
   * @param values - Дополнительный код для блока VALUES.
   * @returns Строка, записанная в файл.
   */
  public writeFile(_me: this, values: string = ""): string {
    const constName = this.config.name;
    const compiledBlock = this.createCompiledBlock(constName);
    const exportBlock = this.createExportBlock(constName);
    const valuesBlock = this.createValuesBlock(values);

    const content = this.config.writeInCompiler
      ? this.updateExistingContent(compiledBlock, valuesBlock, exportBlock)
      : this.buildFreshContent(compiledBlock, valuesBlock, exportBlock);

    this.fileManager.write(content);
    return content;
  }

  /** Создаёт блок скомпилированной константы (с предупреждением). */
  private createCompiledBlock(constName: string): string {
    const warningComment = CodeGenerator.generateWarningComment(
      parse(__filename).name,
    );
    return `${warningComment}\nexport const ${constName} = ${this.resolveForCompiled()};`;
  }

  /** Создаёт блок экспорта. */
  private createExportBlock(constName: string): string {
    return this.codeGenerator.generateExportBlock(
      constName,
      this.config.defaultExportOn,
    );
  }

  /** Создаёт блок пользовательских значений. */
  private createValuesBlock(values: string): string {
    return values;
  }

  /** Формирует содержимое для нового файла (с маркерами). */
  private buildFreshContent(
    compiledBlock: string,
    valuesBlock: string,
    exportBlock: string,
  ): string {
    return [
      FileManager.wrapWithMarker(MARKERS.compiled.line, compiledBlock),
      FileManager.wrapWithMarker(MARKERS.values.line, valuesBlock),
      FileManager.wrapWithMarker(MARKERS.export.line, exportBlock),
    ].join("\n");
  }

  /** Обновляет существующий файл, заменяя маркеры. */
  private updateExistingContent(
    compiledBlock: string,
    valuesBlock: string,
    exportBlock: string,
  ): string {
    const markers = [
      {
        pattern: MARKERS.compiled.pattern,
        replacement: FileManager.wrapWithMarker(
          MARKERS.compiled.line,
          compiledBlock,
        ),
      },
      {
        pattern: MARKERS.export.pattern,
        replacement: FileManager.wrapWithMarker(
          MARKERS.export.line,
          exportBlock,
        ),
      },
      {
        pattern: MARKERS.values.pattern,
        replacement: FileManager.wrapWithMarker(
          MARKERS.values.line,
          valuesBlock,
        ),
      },
    ];
    return this.fileManager.replaceMarkers(markers);
  }

  /** Создаёт пустой файл, если он не существует и `writeInCompiler === false`. */
  private createFile(): void {
    if (!this.config.writeInCompiler) {
      this.fileManager.createEmpty();
    }
  }

  /** Заглушка для форматирования файла (может быть переопределена). */
  private formatFile(): void {}
}

export default Compiler;
