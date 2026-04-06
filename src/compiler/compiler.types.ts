/**
 * Тип настроек компилятора: категория → массив имён битов.
 * @template T - Строковые литералы категорий.
 */
export type ISettings<T extends string> = Record<T, string[]>;

/** Конфигурация компилятора. */
export interface CompilerConfig {
  /** Имя генерируемой константы (по умолчанию `"settings"`). */
  name: string;
  /** Если true, компилятор попытается обновить существующий файл, заменяя маркеры. */
  writeInCompiler: boolean;
  /** Добавлять ли `export default constName` в конец файла. */
  defaultExportOn: boolean;
}
