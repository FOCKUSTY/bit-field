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
 * Либо только для чтения, либо обычный тип.
 */
export type MaybeReadonly<T> = Readonly<T> | T;

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
export interface StaticBuilderBitData<I extends string[], E extends string[]> {
  offset: bigint | BigIntRecord;
  include: MaybeReadonly<I>;
  exclude: MaybeReadonly<E>;
}

/**
 * Параметры для генерации битов через BitBuilder.
 * @template T Тип строковых имён битов.
 */
export interface BuilderBitData<T extends string> {
  /** Начальное смещение (число) или объект с предыдущими битами. */
  offset: bigint | BigIntRecord;
  /** Имена битов, которые должны быть исключены (получат 0). */
  exclude: MaybeReadonly<T[]>;
  /** Если указан, только перечисленные имена получат ненулевые значения. */
  include?: MaybeReadonly<T[]>;
}

/** Подсказка для примитивного преобразования (используется в некоторых утилитах). */
export type PrimitiveHint = "string" | "number" | "default";

/**
 * Входной тип для всех операций с битовыми полями: примитив, который можно преобразовать в bigint, или экземпляр BitField.
 */
export type BitFieldInput = Bit | BitField;

export type DefaultConfig = Record<
  string,
  { include: string[]; exclude: string[] }
>;

export type ConfigKeys<Config extends DefaultConfig, K extends keyof Config> = (
  | Config[K]["include"]
  | Config[K]["exclude"]
)[number];

export type BitConfig<Config extends DefaultConfig> = {
  available: {
    [Key in keyof Config]: Record<ConfigKeys<Config, Key>, bigint>;
  };

  default: {
    [Key in keyof Config]: Record<ConfigKeys<Config, Key>, bigint>;
  };

  raw: {
    [Key in keyof Config]: ConfigKeys<Config, Key>[];
  };
};
