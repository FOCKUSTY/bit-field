/**
 * Значение бита по умолчанию (0).
 */
export const ZERO_BIT = 0n as const;

/**
 * Единичный бит (1).
 */
export const ONE_BIT = 1n as const;

/** Регулярное выражение для проверки двоичной строки (только 0 и 1). */
export const BINARY_REGULAR_EXPRESSION = /^[01]+$/;

/** Регулярное выражение для проверки шестнадцатеричной строки (0-9, a-f, A-F). */
export const HEX_REGULAR_EXPRESSION = /^[0-9a-fA-F]+$/;

/** Основание двоичной системы счисления. */
export const BINARY_RADIX = 2 as const;

/** Смещение для пересчёта длины битовой строки в позицию старшего бита (длина - 1). */
export const INDEX_OFFSET = 1 as const;

/** Префикс двоичного литерала для `BigInt`. */
export const BINARY_PREFIX = "0b" as const;

/** Префикс шестнадцатеричного литерала для `BigInt`. */
export const HEX_PREFIX = "0x" as const;
