import childProcces = require("child_process");

import BitField, { BitBuilder } from "./index";

import { join, parse } from "path";
import { existsSync, unlinkSync, writeFileSync } from "fs";

const format = (string: string, capitalize: boolean) =>
  capitalize
    ? string.charAt(0).toUpperCase() + string.slice(1)
    : string.charAt(0).toLowerCase() + string.slice(1);

const formatSettings = <T extends string>(
  settings: T[] | readonly T[]
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
      false
    )
  );

type ISettings<T extends string> = Record<Capitalize<T>, string[]|readonly string[]>;

class Compiler<T extends string> {
  public constructor(
    public readonly settings: ISettings<T>,
    public readonly keys: T[],
    public readonly filePath: string
  ) {
    this.keys = Array.from(new Set(keys));
    this.filePath = join(__dirname, filePath);
  }

  public execute() {
    this.createFile();
    this.writeFile();
    this.formatFile();
  }

  public format(type: Capitalize<T>) {
    const settings = this.settings[type];

    if (settings.length === 0) return [];

    return formatSettings(settings);
  }

  private createFile() {
    if (existsSync(this.filePath)) unlinkSync(this.filePath);

    writeFileSync(this.filePath, "", "utf-8");
  }

  private compile() {
    const settings = Object.fromEntries(
      this.keys.map((key) => [
        key,
        this.format(format(key, true) as Capitalize<T>)
      ])
    );

    let offset = 0n;
    return Object.fromEntries(
      Object.keys(settings).map((key) => {
        const bits = new BitBuilder(settings[key]).execute(offset);

        offset |= BitBuilder.resolve(bits);

        return [
          key,
          Object.fromEntries(
            Object.keys(bits).map((key) => [
              `/** @value ${bits[key]} */'\n'` + key,
              `1n << ${BitField.logarithm2(bits[key])}n`
            ])
          )
        ];
      })
    );
  }

  private writeFile() {
    const data = JSON.stringify(this.compile(), undefined, 2)
      .replaceAll('"', "")
      .replaceAll("}", "} as const")
      .replaceAll("'\\n'", "\n")
      .replaceAll("as const,", "as const,\n")
      .replaceAll("n,", "n,\n");

    const file =
      "\n/**" +
      `\n * - this file was auto genereted by ${parse(__filename).name} ` +
      "\n * - if you see inconsistencies: https://github.com/FOCKUSTY/bit-field/issues " +
      "\n */" +
      `\nexport const settings = ${data};` +
      "\n" +
      "\nexport type Keys = keyof typeof settings;" +
      "\nexport type Settings<T extends Keys> = (typeof settings)[T];" +
      "\nexport type SettingsKeys<T extends Keys> = keyof Settings<T>;" +
      "\n\nexport default settings;\n";

    writeFileSync(this.filePath, file, "utf-8");
  }

  private formatFile() {
    childProcces.exec(`prettier ${this.filePath} -w`);
  }
}

export { Compiler };

export default Compiler;
