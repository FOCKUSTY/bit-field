# Детальная документация fbit-field

## Содержание

1. [Содержание](#содержание)
1. [Класс BitField](#класс-bitfield)
    - [Конструктор](#конструктор)
    - [Статические методы](#статические-методы)
    - [Свойства](#свойства)
    - [Методы (возвращают новый `BitField`)](#методы-возвращают-новый-bitfield)
    - [Методы проверки](#методы-проверки)
    - [Прочие методы](#прочие-методы)
    - [Пример](#пример)
1. [Класс BitFieldView](#класс-bitfieldview)
    - [Методы](#методы)
    - [Пример](#пример-2)
1. [Класс BitFieldOperations](#класс-bitfieldoperations)
1. [Класс BitBuilder](#класс-bitbuilder)
    - [`BitBuilder.fromConfig` (рекомендуемый способ)](#bitbuilderfromconfig-рекомендуемый-способ)
    - [`BitBuilder.fromData`](#bitbuilderfromdata)
    - [Методы execute и resolve](#методы-execute-и-resolve)
1. [Компилятор (устаревший)](#компилятор-устаревший)
1. [Типы и константы](#типы-и-константы)
    - [Основные типы](#основные-типы)
    - [Типы для `BitBuilder.fromConfig`](#типы-для-bitbuilderfromconfig)
    - [Константы](#константы)
1. [Примеры](#примеры)
    - [Полноценная система прав (RBAC) с `fromConfig`](#полноценная-система-прав-rbac-с-fromconfig)
    - [Динамическое добавление прав](#динамическое-добавление-прав)
1. [Лицензия](#лицензия)

---

## Класс BitField

Основной класс для работы с битовым полем. Наследует `BitFieldView`.

### Конструктор

```typescript
constructor(bit: BitFieldInput = 0n)
```

- `bit` – может быть `bigint`, `number`, `string`, `boolean` или экземпляр `BitField`.

### Статические методы

| Метод                                               | Описание                                                    |
| --------------------------------------------------- | ----------------------------------------------------------- |
| `static fromBinary(binaryString: string): BitField` | Создаёт поле из двоичной строки (например, `"1010"`).       |
| `static fromHex(hexString: string): BitField`       | Создаёт поле из шестнадцатеричной строки (например, `"a"`). |

### Свойства

| Свойство | Тип      | Описание                               |
| -------- | -------- | -------------------------------------- |
| `bit`    | `bigint` | Текущее значение поля (только чтение). |

### Методы (возвращают новый `BitField`)

| Метод                                                 | Описание                                         |
| ----------------------------------------------------- | ------------------------------------------------ |
| `clone(): BitField`                                   | Копия.                                           |
| `set(bit: BitFieldInput): BitField`                   | Заменяет значение.                               |
| `add(...bits: MustArray<BitFieldInput>): BitField`    | Устанавливает переданные биты.                   |
| `remove(...bits: MustArray<BitFieldInput>): BitField` | Сбрасывает переданные биты.                      |
| `clear(): BitField`                                   | Обнуляет поле.                                   |
| `and(bit: BitFieldInput): BitField`                   | Побитовое И.                                     |
| `or(bit: BitFieldInput): BitField`                    | Побитовое ИЛИ.                                   |
| `xor(bit: BitFieldInput): BitField`                   | Побитовое исключающее ИЛИ.                       |
| `not(bitLength?: number): BitField`                   | Побитовое НЕ с маскированием по `bitLength`.     |
| `shiftLeft(bits: number): BitField`                   | Сдвиг влево.                                     |
| `shiftRight(bits: number): BitField`                  | Сдвиг вправо (беззнаковый).                      |
| `setRange(from: number, to: number): BitField`        | Устанавливает все биты в диапазоне `[from, to]`. |
| `clearRange(from: number, to: number): BitField`      | Сбрасывает все биты в диапазоне.                 |

### Методы проверки

| Метод                                                 | Возвращает | Описание                                          |
| ----------------------------------------------------- | ---------- | ------------------------------------------------- |
| `equals(bit: BitFieldInput): boolean`                 | `boolean`  | Равенство значений.                               |
| `isSubsetOf(bit: BitFieldInput): boolean`             | `boolean`  | Все ли биты текущего поля присутствуют в `bit`.   |
| `hasOne(bit: BitFieldInput): boolean`                 | `boolean`  | Установлен ли указанный бит (или все биты маски). |
| `hasSome(...bits: MustArray<BitFieldInput>): boolean` | `boolean`  | Установлен ли хотя бы один из переданных битов.   |
| `has(...bits: MustArray<BitFieldInput>): boolean`     | `boolean`  | Установлены ли все переданные биты.               |
| `hasRange(from: number, to: number): boolean`         | `boolean`  | Установлены ли все биты диапазона.                |

### Прочие методы

| Метод                                | Описание                                                                                       |
| ------------------------------------ | ---------------------------------------------------------------------------------------------- |
| `getLowestSetBit(): bigint \| null`  | Возвращает значение младшего установленного бита (`1n << k`) или `null`, если поле равно нулю. |
| `getHighestSetBit(): bigint \| null` | Возвращает значение старшего установленного бита.                                              |

### Пример

```typescript
const bf = new BitField(0b1100);
console.log(bf.getLowestSetBit()); // 1n << 2n (4)
console.log(bf.getHighestSetBit()); // 1n << 3n (8)

const bf2 = bf.add(0b0010); // 0b1110
console.log(bf2.hasRange(1, 2)); // true (биты 1 и 2 установлены)
```

---

## Класс BitFieldView

Абстрактный класс, предоставляющий методы преобразования и итерации.  
`BitField` наследует их.

### Методы

| Метод                                            | Описание                                                    |
| ------------------------------------------------ | ----------------------------------------------------------- |
| `toArray(): bigint[]`                            | Массив значений установленных битов (каждый как `1n << k`). |
| `forEach(callback: (bit: bigint) => void): void` | Выполняет callback для каждого установленного бита.         |
| `toJSON(): string`                               | Возвращает десятичную строку (для `JSON.stringify`).        |
| `toHexString(): string`                          | Шестнадцатеричное представление без префикса.               |
| `toBinaryString(): string`                       | Двоичное представление.                                     |
| `toNumber(): number`                             | ⚠️ Опасно для значений > 2⁵³.                               |
| `toString(): string`                             | Десятичная строка.                                          |
| `[Symbol.iterator]()`                            | Итератор по установленным битам (от младшего к старшему).   |

### Пример

```typescript
const bf = new BitField(0b1011);
for (const bit of bf) {
  console.log(bit.toString(2)); // "1", "10", "1000" (в bigint)
}
// или
bf.forEach((bit) => console.log(bit));
```

---

## Класс BitFieldOperations

Статический класс с утилитами для низкоуровневой работы.

| Метод                                             | Описание                                          |
| ------------------------------------------------- | ------------------------------------------------- |
| `toBigInt(bit: BitFieldInput): bigint`            | Приведение к `bigint`.                            |
| `equals(first, second): boolean`                  | Сравнение.                                        |
| `notEquals(first, second): boolean`               | Обратное сравнение.                               |
| `summarize(...bits): bigint`                      | Побитовое ИЛИ всех аргументов.                    |
| `add(bit, ...add): bigint`                        | `bit \| OR(add)`.                                 |
| `remove(bit, ...remove): bigint`                  | `bit & ~OR(remove)`.                              |
| `logarithm2(bit): bigint`                         | floor(log2(x)) для x > 0.                         |
| `max(...bits): bigint`                            | Максимальное значение.                            |
| `maskOfLength(bits: number): bigint`              | Маска из `bits` младших единиц.                   |
| `maskRange(from: number, length: number): bigint` | Маска, начиная с позиции `from`, длиной `length`. |

---

## Класс BitBuilder

### `BitBuilder.fromConfig` (рекомендуемый способ)

Создаёт полную конфигурацию битов для нескольких категорий из декларативного описания.

```typescript
static fromConfig<Config extends DefaultConfig>(config: Config): BitConfig<Config>
```

**Параметры:**

- `config` – объект, где каждый ключ – имя категории, значение – объект с полями:
  - `include: string[]` – имена, которые должны получить ненулевые значения.
  - `exclude: string[]` – имена, которые получат нулевые значения (приоритет выше).

**Возвращает:** объект с тремя полями:

- `available` – все возможные биты (все имена из `include` и `exclude`) с вычисленными значениями.
- `default` – биты, где `exclude` заменены на `0n`.
- `raw` – массив всех имён.

Категории обрабатываются последовательно, смещения автоматически продолжаются.

**Пример:**

```typescript
const config = {
  user: { include: ["VIEW", "EDIT"], exclude: ["DELETE"] },
  admin: { include: ["VIEW", "EDIT", "DELETE"], exclude: [] },
};

const bits = BitBuilder.fromConfig(config);
// bits.available.user: { VIEW: 1n << 0n, EDIT: 1n << 1n, DELETE: 1n << 2n }
// bits.default.user:   { VIEW: 1n << 0n, EDIT: 1n << 1n, DELETE: 0n }
// bits.available.admin: { VIEW: 1n << 3n, EDIT: 1n << 4n, DELETE: 1n << 5n }

// Применение в BitField
const userPerms = new BitField(bits.default.user);
userPerms.has(bits.available.user.EDIT); // true
userPerms.has(bits.available.user.DELETE); // false
```

### `BitBuilder.fromData`

Генерирует биты для одного набора (категории) без автоматического продолжения между категориями.

```typescript
static fromData<Include extends string[], Exclude extends string[]>(
  data: StaticBuilderBitData<Include, Exclude>
): { all, include, exclude, bitBuilder, available, default }
```

**Параметры:**

- `include` – массив имён, которые получат ненулевые значения.
- `exclude` – массив имён, которые получат нулевые значения.
- `offset` – начальное смещение (`bigint` или объект предыдущих битов).

**Возвращает:** объект с полями `available` (все биты) и `default` (с исключёнными нулями), а также вспомогательные данные.

**Пример:**

```typescript
const { available, default } = BitBuilder.fromData({
  include: ["READ", "WRITE"],
  exclude: ["DELETE"],
  offset: 5n,
});
// available: { READ: 1n << 5n, WRITE: 1n << 6n, DELETE: 1n << 7n }
// default:   { READ: 1n << 5n, WRITE: 1n << 6n, DELETE: 0n }
```

### Методы execute и resolve

`execute` генерирует объект битов для текущего набора имён (без категорий).  
`resolve` суммирует значения объекта в одно число.

```typescript
const builder = new BitBuilder(["A", "B"]);
const bits = builder.execute({ offset: 3n }); // { A: 1n << 3n, B: 1n << 4n }
const sum = builder.resolve(bits); // (1n << 3n) | (1n << 4n)
```

---

## Компилятор (устаревший)

> ⚠️ **Устаревший API** – начиная с версии **3.1.0**, рекомендуется использовать `BitBuilder.fromConfig`. Класс `Compiler` будет удалён в будущих версиях.

Компилятор предназначен для генерации TypeScript-файлов с константами. Его функциональность полностью покрывается `BitBuilder.fromConfig` + ручной записью в файл (или использованием вашего `FileManager`). Если вы всё же используете старый код, обратитесь к предыдущим версиям документации.

---

## Типы и константы

### Основные типы

| Тип                 | Описание                                        |
| ------------------- | ----------------------------------------------- |
| `MustArray<T>`      | Кортеж с хотя бы одним элементом `[T, ...T[]]`. |
| `ArrayOrType<T>`    | `T \| MustArray<T>`.                            |
| `Bit`               | `bigint \| number \| string \| boolean`.        |
| `BigIntRecord`      | `Record<string, bigint>`.                       |
| `BuilderBitData<T>` | Параметры для `BitBuilder.execute`.             |
| `BitFieldInput`     | `Bit \| BitField`.                              |

### Типы для `BitBuilder.fromConfig`

```typescript
type DefaultConfig = Record<string, { include: string[]; exclude: string[] }>;

type ConfigKeys<Config extends DefaultConfig, K extends keyof Config> =
  | Config[K]["include"][number]
  | Config[K]["exclude"][number];

type BitConfig<Config extends DefaultConfig> = {
  available: { [Key in keyof Config]: Record<ConfigKeys<Config, Key>, bigint> };
  default:   { [Key in keyof Config]: Record<ConfigKeys<Config, Key>, bigint> };
  raw:       { [Key in keyof Config]: ConfigKeys<Config, Key>[] };
};
```

### Константы

| Константа                   | Значение           | Описание                      |
| --------------------------- | ------------------ | ----------------------------- |
| `ZERO_BIT`                  | `0n`               | Ноль.                         |
| `ONE_BIT`                   | `1n`               | Единица.                      |
| `BINARY_RADIX`              | `2`                | Основание двоичной системы.   |
| `INDEX_OFFSET`              | `1`                | Смещение для пересчёта длины. |
| `BINARY_PREFIX`             | `"0b"`             | Префикс для `BigInt`.         |
| `HEX_PREFIX`                | `"0x"`             | Шестнадцатеричный префикс.    |
| `BINARY_REGULAR_EXPRESSION` | `/^[01]+$/`        | Проверка двоичной строки.     |
| `HEX_REGULAR_EXPRESSION`    | `/^[0-9a-fA-F]+$/` | Проверка hex-строки.          |

---

## Примеры

### Полноценная система прав (RBAC) с `fromConfig`

```typescript
import { BitBuilder, BitField } from "fbit-field";

// 1. Описываем права
const rights = {
  posts: { include: ["create", "edit", "delete"], exclude: [] },
  comments: { include: ["view", "create", "moderate"], exclude: ["delete"] },
};

// 2. Генерируем конфигурацию
const perms = BitBuilder.fromConfig(rights);

// 3. Создаём роли
const guest = new BitField(perms.default.comments);      // только view, create
const editor = new BitField(perms.available.posts);       // все права на посты
const moderator = guest.add(perms.available.comments.moderate); // добавили moderate

// 4. Проверяем
editor.has(perms.available.posts.delete);     // true
moderator.has(perms.available.comments.delete); // false (был исключён)
```

### Динамическое добавление прав

```typescript
const userPerms = new BitField();
// ... позже
userPerms.add(perms.available.posts.create);
```

---

## Лицензия

MIT.
