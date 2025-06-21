import childProcces = require("child_process");

import BitField, { BitBuilder } from "./index";

import { join, parse } from "path";
import { existsSync, readFileSync, unlinkSync, writeFileSync } from "fs";

export type ConstArray<T> = T[] | readonly T[];
export type ISettings<T extends string> = Record<T, ConstArray<string>>;

export const format = (string: string, capitalize: boolean) =>
  capitalize
    ? string.charAt(0).toUpperCase() + string.slice(1)
    : string.charAt(0).toLowerCase() + string.slice(1);

export const defaultSettingsFormat = <T extends string>(
  settings: ConstArray<T>
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

/**
 * Compiler for `BitBuilder`'s values
 * 
 * ---
 * 
 * @constructor @settingsFormat
 * Formattings settings value
 * 
 * @example
 * input:
 *   [ "SOME_VALUE_ONE", "SOME_VALUE_TWO", "SOME_DIRECTIVE__SOME_VALUE" ]
 * output:
 *   [ "someValueOne", "someValueTwo", "someDirectiveSomeValue" ]
 * 
 * @default
 * (used in `@example`)
 * ```ts
 * const defaultSettingsFormat = <T extends string>(
 * settings: T[] | readonly T[]
 *  ) =>
 *    settings.map((string: T) =>
 *      capitilize(
 *        string
 *          .toLowerCase()
 *          .replaceAll("__", " ")
 *          .replaceAll("_", " ")
 *          .split(" ")
 *          .map((v) => capitilize(v))
 *          .join("")
 *      )
 *    );
 * ```
 * 
 */  
class Compiler<T extends string> {
  public readonly keys: T[];

  public constructor(
    public readonly settings: ISettings<T>,
    public readonly filePath: string,
    /**
     * - !! WARNING !!
     * - !! WARNING !!
     * - !! WARNING !!
     * 
     * ---
     * 
     * YOU WORKING WITH FILE SYSTEM, BE CAREFUL.
     * @recomendation PLEASE, USE DEFAULT METHOS.
     */
    methods?: {
      /**
       * Formattings settings value
       * 
       * @example
       * input:
       *   [ "SOME_VALUE_ONE", "SOME_VALUE_TWO", "SOME_DIRECTIVE__SOME_VALUE" ]
       * output:
       *   [ "someValueOne", "someValueTwo", "someDirectiveSomeValue" ]
       * 
       * @default
       * (used in `@example`)
       * ```ts
       * const defaultSettingsFormat = <T extends string>(
       * settings: T[] | readonly T[]
       *  ) =>
       *    settings.map((string: T) =>
       *      capitilize(
       *        string
       *          .toLowerCase()
       *          .replaceAll("__", " ")
       *          .replaceAll("_", " ")
       *          .split(" ")
       *          .map((v) => capitilize(v))
       *          .join("")
       *      )
       *    );
       * ```
       */
      settingsFormat?: (settings: ISettings<T>[T]) => ConstArray<string>;
      /**
       * - !! WARNING !!
       * - !! WARNING !!
       * - !! WARNING !!
       * 
       * ---
       * 
       * YOU WORKING WITH FILE SYSTEM, BE CAREFUL.
       * @recomendation PLEASE, USE DEFAULT METHOS.
       */
      writeFile?: (me: Compiler<T>, values?: string) => string;
      /**
       * - !! WARNING !!
       * - !! WARNING !!
       * - !! WARNING !!
       * 
       * ---
       * 
       * YOU WORKING WITH FILE SYSTEM. BE CAREFUL.
       * @recomendation PLEASE, USE DEFAULT METHOS.
       */
      compile?: <K = unknown>(me: Compiler<T>) => K;
    }
  ) {
    this.keys = Object.keys(settings) as T[];
    this.filePath = join(filePath);

    if (methods) {
      (Object.keys(methods) as (keyof typeof methods)[]).forEach((key) => {
        if (methods[key]) {
          this[key] = methods[key] as any;
        };
      });
    }
  }

  public execute() {
    this.createFile();
    this.writeFile(this);
    this.formatFile();

    return readFileSync(this.filePath);
  }

  public parse(type: T) {
    const settings = this.settings[type];

    if (settings.length === 0) return [];

    return this.settingsFormat(settings);
  }

  public settingsFormat = defaultSettingsFormat;

  public compile(me: this) {
    const settings = Object.fromEntries(
      this.keys.map((key) => [key, this.parse(key)]),
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
              `1n << ${BitField.logarithm2(bits[key])}n`,
            ]),
          ),
        ];
      }),
    );
  }

  public writeFile(me: this, values: string = "") {
    const data = JSON.stringify(this.compile(me), undefined, 2)
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
      "\n" + values + "\n" +
      "\nexport type Keys = keyof typeof settings;" +
      "\nexport type Settings<T extends Keys> = (typeof settings)[T];" +
      "\nexport type SettingsKeys<T extends Keys> = keyof Settings<T>;" +
      "\n\nexport default settings;\n";

    writeFileSync(this.filePath, file, "utf-8");

    return file;
  }
  
  private createFile() {
    if (existsSync(this.filePath)) unlinkSync(this.filePath);

    writeFileSync(this.filePath, "", "utf-8");
  }

  private formatFile() {
    childProcces.exec(`prettier ${this.filePath} -w`);
  }
}

export { Compiler };

export default Compiler;
