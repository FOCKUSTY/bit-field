import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

/** Описание маркера для замены в файле. */
export interface ReplaceMarker {
  /** Регулярное выражение для поиска маркера. */
  pattern: RegExp;
  /** Строка-заменитель (обычно содержит маркер и новый блок). */
  placeholder: string;
}

/** Утилита для работы с файлами: чтение, запись, замена маркеров. */
export class FileManager {
  /**
   * @param filePath - Путь к файлу (будет нормализован через `path.join`).
   */
  public constructor(private readonly filePath: string) {
    this.filePath = join(filePath);
  }

  /** Проверяет существование файла. */
  public exists(): boolean {
    return existsSync(this.filePath);
  }

  /** Считывает содержимое файла (если файл не существует, возвращает пустую строку). */
  public read(): string {
    if (!this.exists()) return "";
    return readFileSync(this.filePath, "utf-8");
  }

  /** Записывает строку в файл. */
  public write(content: string): void {
    writeFileSync(this.filePath, content, "utf-8");
  }

  /** Создаёт пустой файл, если он не существует. */
  public createEmpty(): void {
    if (!this.exists()) {
      this.write("");
    }
  }

  /**
   * Заменяет в файле все маркеры на соответствующие блоки.
   *
   * @param markers - Массив объектов с полями `pattern` и `replacement`.
   * @returns Содержимое файла после всех замен.
   */
  public replaceMarkers(
    markers: Array<{ pattern: RegExp; replacement: string }>,
  ): string {
    let content = this.read();
    for (const { pattern, replacement } of markers) {
      content = content.replace(pattern, replacement);
    }
    return content;
  }

  /**
   * Обрамляет блок кода маркером (строка маркера сверху и снизу).
   *
   * @param markerLine - Строка маркера (например, `// ## { ... } ## \\`).
   * @param block - Содержимое блока.
   * @returns Блок, обёрнутый в маркер.
   */
  public static wrapWithMarker(markerLine: string, block: string): string {
    return `${markerLine}\n${block}\n${markerLine}`;
  }
}
