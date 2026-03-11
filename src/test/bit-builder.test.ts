import Test from "./test.class";

import { BitBuilder } from "../index";
import { Compiler } from "../compiler";

const settings = {
  one: ["ONE_ONE1", "ONE_ONE2", "ONE_ONE3", "ONE_ONE4"] as const,

  two: ["TWO_TWO1", "TWO_TWO2", "TWO_TWO3", "TWO_TWO4", "TWO_TWO5"] as const,

  three: [
    "THREE_THREE1",
    "THREE_THREE2",
    "THREE_THREE3",
    "THREE_THREE4",
    "THREE_THREE5",
  ] as const,
};

// ## { COMPILED__WRITE_COMPILED_HERE } ## \\

/**
 * - this file was auto genereted by compiler
 * - if you see inconsistencies: https://github.com/FOCKUSTY/bit-field/issues
 */
export const settings_compiled = {
  one: {
    /** @value 1 */
    oneOne1: 1n << 0n,

    /** @value 2 */
    oneOne2: 1n << 1n,

    /** @value 4 */
    oneOne3: 1n << 2n,

    /** @value 8 */
    oneOne4: 1n << 3n,
  } as const,

  two: {
    /** @value 16 */
    twoTwo1: 1n << 4n,

    /** @value 32 */
    twoTwo2: 1n << 5n,

    /** @value 64 */
    twoTwo3: 1n << 6n,

    /** @value 128 */
    twoTwo4: 1n << 7n,

    /** @value 256 */
    twoTwo5: 1n << 8n,
  } as const,

  three: {
    /** @value 512 */
    threeThree1: 1n << 9n,

    /** @value 1024 */
    threeThree2: 1n << 10n,

    /** @value 2048 */
    threeThree3: 1n << 11n,

    /** @value 4096 */
    threeThree4: 1n << 12n,

    /** @value 8192 */
    threeThree5: 1n << 13n,
  } as const,
} as const;
// ## { COMPILED__WRITE_COMPILED_HERE } ## \\

const builder1 = new BitBuilder(settings.one);
const one = builder1.execute();
const rawOne = builder1.resolve(one);

const builder2 = new BitBuilder(settings.two);
const two = builder2.execute(one);
const rawTwo = builder2.resolve(one);

const builder3 = new BitBuilder(settings.three);
const three = builder3.execute(two);
const rawThree = builder3.resolve(one);

console.log({
  one,
  two,
  three,
});

new Compiler(settings, __dirname + "\\builded-test.ts").execute();

new Compiler(
  settings,
  __dirname + "\\bit-builder.test.ts",
  {},
  {
    name: "settings_compiled",
    writeInCompiler: true,
  },
).execute();

// ## { COMPILED__WRITE_EXPORT_HERE } ## \\

export type Keys = keyof typeof settings_compiled;
export type Settings_compiled<T extends Keys> = (typeof settings_compiled)[T];
export type Settings_compiledKeys<T extends Keys> = keyof Settings_compiled<T>;

export default settings_compiled;

// ## { COMPILED__WRITE_EXPORT_HERE } ## \\
