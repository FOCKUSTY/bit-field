// ## { COMPILED__WRITE_COMPILED_HERE } ## \\

/**
 * - this file was auto genereted by compiler
 * - if you see inconsistencies: https://github.com/FOCKUSTY/bit-field/issues
 */
export const settings = {
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
// ## COMPILED__WRITE_VALUES_HERE ## \\

// ## COMPILED__WRITE_VALUES_HERE ## \\
// ## { COMPILED__WRITE_EXPORT_HERE } ## \\

export type Keys = keyof typeof settings;
export type Settings<T extends Keys> = (typeof settings)[T];
export type SettingsKeys<T extends Keys> = keyof Settings<T>;

export default settings;

// ## { COMPILED__WRITE_EXPORT_HERE } ## \\
