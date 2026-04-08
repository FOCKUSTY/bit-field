import type {
  BigIntRecord,
  BitConfig,
  BuilderBitData,
  DefaultConfig,
  MaybeReadonly,
  StaticBuilderBitData,
} from "./types";

import { ONE_BIT, ZERO_BIT } from "./constants";
import { BitFieldOperations } from "./bit-field-operations";

/**
 * Генерирует набор битовых значений для списка имён с автоматическим смещением.
 *
 * @template T - Строковые литералы имён битов (например, `'READ' | 'WRITE'`).
 *
 * @example
 * ```ts
 * const builder = new BitBuilder(['READ', 'WRITE']);
 * const bits = builder.execute(); // { READ: 1n << 0n, WRITE: 1n << 1n }
 * ```
 */
export class BitBuilder<const T extends string> {
  /**
   * Создаёт конфигурацию битов для нескольких категорий на основе декларативного описания.
   * Для каждой категории генерирует:
   * - `available` – все возможные биты (из `include` и `exclude`),
   * - `default` – биты, исключая указанные в `exclude`,
   * - `raw` – массив всех имён.
   *
   * Категории обрабатываются последовательно, причём следующая категория автоматически
   * получает смещение, следующее за максимальным битом предыдущей категории.
   *
   * @template Config - Тип конфигурации, должен соответствовать `DefaultConfig`.
   *                    Ожидается объект, где ключи – названия категорий,
   *                    а значения – объекты с полями `include` и `exclude` (массивы строк).
   *
   * @param config - Объект конфигурации вида:
   *                 `{ категория: { include: string[], exclude: string[] } }`.
   *
   * @returns Объект с тремя полями (`available`, `default`, `raw`),
   *          каждое из которых содержит записи для каждой категории.
   *
   * @example
   * ```ts
   * const rights = {
   *   user: { include: ["VIEW", "EDIT"], exclude: ["DELETE"] },
   *   admin: { include: ["VIEW", "EDIT", "DELETE"], exclude: [] }
   * };
   *
   * const bits = BitBuilder.fromConfig(rights);
   * // bits.available.user: { VIEW: 1n<<0n, EDIT: 1n<<1n, DELETE: 1n<<2n }
   * // bits.default.user:   { VIEW: 1n<<0n, EDIT: 1n<<1n, DELETE: 0n }
   * // bits.raw.user:       ["VIEW", "EDIT", "DELETE"]
   * ```
   */
  public static fromConfig<const Config extends DefaultConfig>(
    config: Config,
  ): BitConfig<Config> {
    let offset: bigint = ZERO_BIT;

    const keys = Object.keys(config) as (keyof Config)[];
    const bitConfig = {
      available: {},
      default: {},
      raw: {},
    } as BitConfig<Config>;

    for (const key of keys) {
      const { include, exclude } = config[key];

      const all = [...include, ...exclude];
      const builder = new BitBuilder(all);

      const availableBits = builder.execute({ offset });
      const defaultBits = builder.execute({ offset, exclude });

      bitConfig.available[key] = availableBits;
      bitConfig.default[key] = defaultBits;
      bitConfig.raw[key] = all;

      const maxBit = BitFieldOperations.max(...Object.values(availableBits));
      offset = BitFieldOperations.logarithm2(maxBit) + ONE_BIT;
    }

    return bitConfig;
  }

  /**
   * Создаёт битовые значения для одного набора данных (категории).
   * Позволяет гибко задать включаемые и исключаемые имена, а также начальное смещение.
   *
   * @template Include - Тип массива строк для включения (например, `['READ', 'WRITE']`).
   * @template Exclude - Тип массива строк для исключения.
   *
   * @param data - Параметры генерации:
   *   - `include` – массив имён, которые должны получить ненулевые значения.
   *   - `exclude` – массив имён, которые получат нулевые значения.
   *   - `offset` – начальное смещение (число `bigint` или объект с предыдущими битами).
   *
   * @returns Объект, содержащий:
   *   - `all` – объединённый массив всех имён (сначала `include`, затем `exclude`).
   *   - `include` – исходный массив включаемых имён.
   *   - `exclude` – исходный массив исключаемых имён.
   *   - `bitBuilder` – экземпляр `BitBuilder`, использованный для генерации.
   *   - `available` – объект со всеми битами (все имена из `all` с их значениями).
   *   - `default` – объект, где имена из `exclude` имеют значение `0n`.
   *
   * @example
   * ```ts
   * const data = BitBuilder.fromData({
   *   include: ['READ', 'WRITE'],
   *   exclude: ['DELETE'],
   *   offset: 5n
   * });
   * // data.available: { READ: 1n<<5n, WRITE: 1n<<6n, DELETE: 1n<<7n }
   * // data.default:   { READ: 1n<<5n, WRITE: 1n<<6n, DELETE: 0n }
   * ```
   */
  public static fromData<const Include extends string[], const Exclude extends string[]>(
    data: StaticBuilderBitData<Include, Exclude>,
  ) {
    const all = [...data.include, ...data.exclude];
    const exclude = data.exclude;
    const include = data.include;

    const bitBuilder = new BitBuilder(all);
    const availableBits = bitBuilder.execute({ offset: data.offset });
    const defaultBits = bitBuilder.execute({
      offset: data.offset,
      exclude: exclude,
    });

    return {
      all,
      include,
      exclude,
      bitBuilder,
      available: availableBits,
      default: defaultBits,
    } as const;
  }

  /**
   * @param bits - Массив имён битов в порядке их следования.
   */
  public constructor(public readonly bits: MaybeReadonly<T[]>) {}

  /**
   * Объединяет объект именованных битов в одно число (побитовое ИЛИ).
   *
   * @param bits - Объект, где значения — битовые флаги.
   * @returns Результат побитового ИЛИ всех переданных значений.
   *
   * @example
   * ```ts
   * const flags = { READ: 1n, WRITE: 2n };
   * const combined = BitBuilder.resolve(flags); // 3n
   * ```
   */
  public static resolve(bits: BigIntRecord): bigint {
    return BitFieldOperations.summarize(...Object.values(bits));
  }

  /**
   * Генерирует объект с битовыми значениями для каждого имени из `bits`.
   *
   * @param data - Настройки генерации (необязательно).
   * @param data.offset - Начальное смещение (число) или объект ранее сгенерированных битов.
   *                      При передаче объекта следующий свободный бит вычисляется как
   *                      `log2(max(значения)) + 1`. По умолчанию `0n`.
   * @param data.exclude - Имена, которые получат нулевое значение (имеют приоритет над `include`).
   * @param data.include - Если указан, только эти имена получат ненулевые значения.
   * @returns Объект с битовыми значениями для каждого имени.
   *
   * @example
   * ```ts
   * const builder = new BitBuilder(['READ', 'WRITE']);
   * builder.execute({ offset: 10n });        // { READ: 1n<<10n, WRITE: 1n<<11n }
   *
   * const first = builder.execute();         // { READ: 1n<<0n, WRITE: 1n<<1n }
   * const second = new BitBuilder(['EXECUTE']).execute({ offset: first }); // { EXECUTE: 1n<<2n }
   * ```
   */
  public execute(data?: Partial<BuilderBitData<T>>): Record<T, bigint> {
    const bits = this.bits.map((bit, index) => {
      const computedBit = this.computeBit({
        bit,
        index,
        offset: ZERO_BIT,
        exclude: [],
        ...(data || {}),
      });

      return [bit, computedBit];
    });

    return Object.fromEntries(bits);
  }

  /**
   * Экземплярный вариант статического метода `resolve`.
   *
   * @param bits - Объект с битовыми значениями.
   * @returns Побитовое ИЛИ всех значений.
   */
  public resolve(bits: BigIntRecord): bigint {
    return BitBuilder.resolve(bits);
  }

  /**
   * Вычисляет значение для одного бита с учётом смещения, исключений и включений.
   *
   * @param params - Параметры вычисления.
   * @returns Битовое значение (0 или 1 сдвинутое на нужную позицию).
   */
  private computeBit({
    bit,
    exclude,
    index,
    offset,
    include,
  }: {
    bit: T;
    index: number;
  } & BuilderBitData<T>): bigint {
    const modifier = this.resolveOffset(offset) + BigInt(index);
    const excluded = exclude.includes(bit);
    const included = (() => {
      if (include) {
        return include.includes(bit);
      }
      return true;
    })();

    if (excluded || !included) {
      return ZERO_BIT << modifier;
    }
    return ONE_BIT << modifier;
  }

  /**
   * Вычисляет итоговое смещение для первого бита.
   *
   * @param offset - Число (BigInt) или объект ранее сгенерированных битов.
   * @returns Смещение как BigInt.
   */
  private resolveOffset(offset: bigint | BigIntRecord): bigint {
    if (typeof offset === "bigint") {
      return offset;
    }

    const keys = Object.keys(offset);
    if (keys.length === 0) {
      return ZERO_BIT;
    }

    const bits = keys.map((key) => offset[key]);
    const maxBit = BitFieldOperations.max(...bits);
    if (maxBit === ZERO_BIT) {
      return ZERO_BIT;
    }
    return BitFieldOperations.logarithm2(maxBit) + ONE_BIT;
  }
}

export default BitBuilder;
