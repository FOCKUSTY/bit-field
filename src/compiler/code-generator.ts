import type { ISettings } from "./compiler.types";
import { defaultSettingsFormat, format, SPACE } from "./compiler.utils";

import { BitFieldOperations } from "../bit-field-operations";
import { BitBuilder } from "../bit-builder";

/**
 * Генератор TypeScript-кода для битовых конфигураций.
 * Принимает описание категорий и имён битов, вычисляет их числовые значения и формирует объект-константу.
 *
 * @template T - Строковые литералы категорий.
 */
export class CodeGenerator<const T extends string> {
  /**
   * @param settings - Объект, где ключи — категории, значения — массивы имён битов.
   * @param settingsFormat - Функция для форматирования имён битов (по умолчанию приводит к camelCase).
   */
  public constructor(
    private readonly settings: ISettings<T>,
    private readonly settingsFormat: (
      array: string[],
    ) => string[] = defaultSettingsFormat,
  ) {}

  /**
   * Генерирует структуру объекта с битовыми значениями для всех категорий.
   * Категории обрабатываются последовательно, каждая следующая использует смещение, вычисленное из предыдущей.
   *
   * @returns Объект вида `{ категория: { имяБита: "1n << N" } }`.
   */
  public generateStructure(
    jsdocs?: boolean,
  ): Record<string, Record<string, string>> {
    const categories = Object.keys(this.settings) as T[];
    const result: Record<string, Record<string, string>> = {};

    let currentOffset: Record<string, bigint> = {};

    for (const category of categories) {
      const { categories: categoriesMap, offset } = this.processCategory(
        category,
        currentOffset,
        jsdocs,
      );
      result[category] = categoriesMap;
      currentOffset = offset;
    }

    return result;
  }

  /**
   * Преобразует структуру в строку с TypeScript-кодом (константа с `as const`).
   *
   * @param structure - Объект, полученный из `generateStructure`.
   * @returns Строка, представляющая валидный TS-код.
   */
  public toCodeString(
    structure: Record<string, Record<string, string>>,
  ): string {
    return JSON.stringify(structure, null, 2)
      .replaceAll('"', "")
      .replaceAll(SPACE, " ")
      .replaceAll("}", "} as const")
      .replaceAll("as const,", "as const,\n");
  }

  /**
   * Генерирует блок экспорта типов и, возможно, дефолтного экспорта.
   *
   * @param constName - Имя генерируемой константы.
   * @param defaultExportOn - Следует ли добавить `export default`.
   * @returns Строка с TypeScript-экспортами.
   */
  public generateExportBlock(
    constName: string,
    defaultExportOn: boolean,
  ): string {
    const capitalized = format(constName, true);

    let exports = `
export type Keys = keyof typeof ${constName};
export type ${capitalized}<T extends Keys> = (typeof ${constName})[T];
export type ${capitalized}Keys<T extends Keys> = keyof ${capitalized}<T>;`;
    if (defaultExportOn) {
      exports += `\n\nexport default ${constName};\n`;
    }
    return exports;
  }

  /**
   * Генерирует комментарий-предупреждение об автоматической генерации файла.
   *
   * @param generatorName - Имя генератора (обычно имя скрипта).
   * @returns Строка с комментарием.
   */
  public static generateWarningComment(generatorName: string): string {
    return `
/**
 * - этот файл автоматически сгенерирован ${generatorName}
 * - если вы нашли несоответствия: https://github.com/FOCKUSTY/bit-field/issues
 */`;
  }

  /**
   * Форматирует одну пару (имя бита, значение) в запись для результирующего объекта.
   *
   * @param name - Имя бита.
   * @param bitValue - Числовое значение бита (степень двойки).
   * @returns Кортеж `[ ключ, значение ]`, где значение — строка `"1n << N"`.
   */
  private formatBitEntry(
    name: string,
    bitValue: bigint,
    jsdocs?: boolean,
  ): [string, string] {
    return [
      jsdocs ? `/** @value ${bitValue} */${SPACE}${name}` : name,
      `1n << ${BitFieldOperations.logarithm2(bitValue)}n`,
    ];
  }

  /**
   * Генерирует битовые значения для одной категории и преобразует их в формат вывода.
   *
   * @param category - Название категории.
   * @param offset - Объект предыдущих битов (для вычисления следующего свободного смещения).
   * @returns Объект с отформатированной картой битов и обновлённым смещением.
   */
  private processCategory(
    category: T,
    offset: Record<string, bigint>,
    jsdocs?: boolean,
  ): {
    categories: Record<string, string>;
    offset: Record<string, bigint>;
  } {
    const formattedNames = this.settingsFormat(this.settings[category]);
    const bits = new BitBuilder(formattedNames).execute({ offset });

    const categories = Object.fromEntries(
      Object.entries(bits).map(([name, bitValue]) => {
        return this.formatBitEntry(name, bitValue, jsdocs);
      }),
    );

    return { categories, offset: bits };
  }
}

export default CodeGenerator;
