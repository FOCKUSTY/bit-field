/**
 * Преобразует строку в формат camelCase с возможностью капитализации первой буквы.
 *
 * @param str - Исходная строка.
 * @param capitalize - Если true, первая буква заглавная, иначе строчная.
 * @returns Преобразованная строка.
 *
 * @example
 * ```ts
 * format("hello_world", false) // "helloWorld"
 * format("hello_world", true)  // "HelloWorld"
 * ```
 */
export const format = (str: string, capitalize: boolean): string =>
  capitalize
    ? str.charAt(0).toUpperCase() + str.slice(1)
    : str.charAt(0).toLowerCase() + str.slice(1);

/**
 * Функция форматирования имён битов по умолчанию.
 * Приводит к нижнему регистру, заменяет `__` и `_` на пробелы, разбивает на слова,
 * каждое слово делает с заглавной буквы, затем объединяет в camelCase.
 *
 * @param settings - Массив исходных имён (обычно в верхнем регистре с подчёркиваниями).
 * @returns Массив отформатированных имён в camelCase.
 *
 * @example
 * ```ts
 * defaultSettingsFormat(["READ__WRITE", "CONTROL_FLAG"]) // ["readWrite", "controlFlag"]
 * ```
 */
export const defaultSettingsFormat = <const T extends string>(
  settings: T[],
): string[] =>
  settings.map((s: T) =>
    format(
      s
        .toLowerCase()
        .replaceAll("__", " ")
        .replaceAll("_", " ")
        .split(" ")
        .map((v) => format(v, true))
        .join(""),
      false,
    ),
  );

/** Маркеры для вставки сгенерированных блоков в файл. */
export const MARKERS = {
  compiled: {
    line: "// ## { COMPILED__WRITE_COMPILED_HERE } ## \\",
    pattern:
      /(\/\/ ## { COMPILED__WRITE_COMPILED_HERE } ## \\[.\s\S]*\/\/ ## { COMPILED__WRITE_COMPILED_HERE } ## \\)|(\/\/ ## { WRITE_COMPILED_HERE } ## \\)/gi,
  },
  export: {
    line: "// ## { COMPILED__WRITE_EXPORT_HERE } ## \\",
    pattern:
      /(\/\/ ## { COMPILED__WRITE_EXPORT_HERE } ## \\[.\s\S]*\/\/ ## { COMPILED__WRITE_EXPORT_HERE } ## \\)|(\/\/ ## { WRITE_EXPORT_HERE } ## \\)/gi,
  },
  values: {
    line: "// ## { COMPILED__WRITE_VALUES_HERE } ## \\",
    pattern:
      /(\/\/ ## { COMPILED__WRITE_VALUES_HERE } ## \\[.\s\S]*\/\/ ## { COMPILED__WRITE_VALUES_HERE } ## \\)|(\/\/ ## { WRITE_VALUES_HERE } ## \\)/gi,
  },
};
