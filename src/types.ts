/**
 * Гарантирует, что массив содержит хотя бы один элемент.
 */
export type MustArray<T, K = T> = [T, ...K[]];

/**
 * Либо один элемент, либо массив с хотя бы одним элементом.
 */
export type ArrayOrType<T> = MustArray<T> | T;

/**
 * Тип, который может быть преобразован в BigInt.
 */
export type Bit = bigint | number | string | boolean;
