import type { BitField } from "./bit-field";

/**
 * Гарантирует, что массив содержит хотя бы один элемент.
 * @template T Тип элементов.
 * @template K Тип остальных элементов (по умолчанию совпадает с T).
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

/** Запись строковых ключей с bigint-значениями. */
export type BigIntRecord = Record<string, bigint>;

/**
 * Параметры для генерации битов через BitBuilder.
 * @template T Тип строковых имён битов.
 */
export interface BuilderBitData<T extends string> {
  /** Начальное смещение (число) или объект с предыдущими битами. */
  offset: bigint | BigIntRecord;
  /** Имена битов, которые должны быть исключены (получат 0). */
  exclude: T[];
  /** Если указан, только перечисленные имена получат ненулевые значения. */
  include?: T[];
}

/** Подсказка для примитивного преобразования (используется в некоторых утилитах). */
export type PrimitiveHint = "string" | "number" | "default";

/**
 * Входной тип для всех операций с битовыми полями: примитив, который можно преобразовать в bigint, или экземпляр BitField.
 */
export type BitFieldInput = Bit | BitField;
