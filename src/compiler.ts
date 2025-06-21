import childProcces = require("child_process");

import BitField, { BitBuilder } from "./index";

import { join, parse } from "path";
import { existsSync, readFileSync, writeFileSync } from "fs";

export type ConstArray<T> = T[] | readonly T[];
export type ISettings<T extends string> = Record<T, ConstArray<string>>;

export type Config = {
  /**
   * @description name of settings
   * @default settings
   */
  name: string,
  /**
   * write in compiler-file:
   * 
   * @use `// ## { WRITE_COMPILED_HERE } ## \\`
   * to write compiled file where you need
   * 
   * @use `// ## { WRITE_EXPORT_HERE } ## \\ `
   * to write export where you need
   * @default end of file
   * 
   */
  writeInCompiler: boolean,
  /**
   * switch on/off prettier for file
   * @default true
   */
  prettierOn: boolean,
  /**
   * switch on/off default export in file
   * @default true
   */
  defaultExportOn: boolean,
};

export const replaceKeys = {
  compiled: [
    "// ## { COMPILED__WRITE_COMPILED_HERE } ## \\\\",
    /(\/\/ ## { COMPILED__WRITE_COMPILED_HERE } ## \\\\[.\s\S]*\/\/ ## { COMPILED__WRITE_COMPILED_HERE } ## \\\\)|(\/\/ ## { WRITE_COMPILED_HERE } ## \\\\)/gi
  ],
  export: [
    "// ## { COMPILED__WRITE_EXPORT_HERE } ## \\\\",
    /(\/\/ ## { COMPILED__WRITE_EXPORT_HERE } ## \\\\[.\s\S]*\/\/ ## { COMPILED__WRITE_EXPORT_HERE } ## \\\\)|(\/\/ ## { WRITE_EXPORT_HERE } ## \\\\)/gi
  ],
  values: [
    "// ## COMPILED__WRITE_VALUES_HERE ## \\\\",
    /(\/\/ ## { COMPILED__WRITE_VALUES_HERE } ## \\\\[.\s\S]*\/\/ ## { COMPILED__WRITE_VALUES_HERE } ## \\\\)|(\/\/ ## { WRITE_VALUES_HERE } ## \\\\)/gi
  ]
} as const;

const formatToReplace = (key: keyof typeof replaceKeys, data: string) => {
  return `${replaceKeys[key][0]}\n${data}\n${replaceKeys[key][0]}`;
};

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

  public readonly config: Config = {
    name: "settings",
    prettierOn: true,
    writeInCompiler: false,
    defaultExportOn: true
  };

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

      /**
       * - WARNING
       * 
       * ---
       * 
       * You working with compiler formatter options. be carefule.
       * @recomendation please, use default method.
       */
      resolveForCompiled?: (me: Compiler<T>) => string;
    },
    /**
     * config of compiler options
     */
    config?: Partial<Config>
  ) {
    this.keys = Object.keys(settings) as T[];
    this.filePath = join(filePath);

    this.config = config
      ? {
        ...this.config,
        ...config
      }
      : this.config;

    if (methods) {
      (Object.keys(methods) as (keyof typeof methods)[]).forEach((key) => {
        if (methods[key]) {
          this[key] = methods[key] as any;
        };
      });
    }
  }

  public execute(values: string = "") {
    this.createFile();
    this.writeFile(this, values);
    this.formatFile();

    return readFileSync(this.filePath, "utf-8");
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

  public resolveForCompiled(me: this) {
    return JSON.stringify(this.compile(me), undefined, 2)
      .replaceAll('"', "")
      .replaceAll("}", "} as const")
      .replaceAll("'\\n'", "\n")
      .replaceAll("as const,", "as const,\n")
      .replaceAll("n,", "n,\n");
  };

  /**
   * @param values
   * @use `// ## WRITE_VALUES_HERE ## \\`
   * to write values where you need
   */
  public writeFile(
    me: this,
    /**
     * @use `// ## WRITE_VALUES_HERE ## \\`
     * to write values where you need
     */
    values: string = ""
  ) {
    const data = this.resolveForCompiled(me);

    let file = "";

    const name = this.config.name;
    const capitalizeName = format(name, true);
    const settingsData =
      "\n/**" +
      `\n * - this file was auto genereted by ${parse(__filename).name} ` +
      "\n * - if you see inconsistencies: https://github.com/FOCKUSTY/bit-field/issues " +
      "\n */" +
      `\nexport const ${name} = ${data};`;

    const exportData =
      `\nexport type Keys = keyof typeof ${name};` +
      `\nexport type ${capitalizeName}<T extends Keys> = (typeof ${name})[T];` +
      `\nexport type ${capitalizeName}Keys<T extends Keys> = keyof ${capitalizeName}<T>;` +
      `${this.config.defaultExportOn ? `\n\nexport default ${name};\n` : ""}`;

    if (this.config.writeInCompiler) {
      console.log(this.readFile().match(replaceKeys.compiled[1]))
      file = this.readFile()
        .replaceAll(replaceKeys.compiled[1], formatToReplace("compiled", settingsData))
        .replaceAll(replaceKeys.export[1], formatToReplace("export", exportData))
        .replaceAll(replaceKeys.values[1], formatToReplace("values", values));
    } else {
      file = `${formatToReplace("compiled", settingsData)}\n${formatToReplace("values", values)}\n${formatToReplace("export", exportData)}`;
    };

    writeFileSync(this.filePath, file, "utf-8");

    return file;
  }
  
  private readFile() {
    if (!this.config.writeInCompiler) return "";
    if (!existsSync(this.filePath)) return "";
    
    return readFileSync(this.filePath, "utf-8");
  };

  private createFile() {
    if (this.config.writeInCompiler) return;

    writeFileSync(this.filePath, "", "utf-8");
  }

  private formatFile() {
    if (!this.config.prettierOn) return;

    childProcces.exec(`prettier ${this.filePath} -w`);
  }
}

export { Compiler };

export default Compiler;
