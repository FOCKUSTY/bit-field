# Детальная документация fbit-field

## Содержание

1. [Класс BitField](#класс-bitfield)
2. [Класс BitFieldView](#класс-bitfieldview)
3. [Класс BitFieldOperations](#класс-bitfieldoperations)
4. [Класс BitBuilder](#класс-bitbuilder)
5. [Компилятор (Compiler, CodeGenerator, FileManager)](#компилятор)
6. [Типы и константы](#типы-и-константы)
7. [Примеры](#примеры)

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
| `toNumber(): number`                             | Опасно для значений > 2^53.                                 |
| `toString(): string`                             | Десятичная строка.                                          |
| `[Symbol.iterator]()`                            | Итератор по установленным битам (от младшего к старшему).   |

### Пример

```typescript
const bf = new BitField(0b1011);
for (const bit of bf) {
  console.log(bit.toString(2)); // "1", "10", "1000" (но в bigint)
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

Генерирует объект с битовыми значениями для списка имён, автоматически вычисляя смещения.

```typescript
const builder = new BitBuilder(["READ", "WRITE", "EXECUTE"]);
const bits = builder.execute();
// { READ: 1n << 0n, WRITE: 1n << 1n, EXECUTE: 1n << 2n }
```

### Конструктор

```typescript
constructor(public readonly bits: T[])
```

### Методы

| Метод                                                           | Описание                                                                                                                           |
| --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `static resolve(bits: BigIntRecord): bigint`                    | Побитовое ИЛИ значений объекта.                                                                                                    |
| `execute(data?: Partial<BuilderBitData<T>>): Record<T, bigint>` | Генерирует объект. `data.offset` может быть `bigint` или объектом предыдущих битов – тогда смещение будет вычислено автоматически. |
| `resolve(bits: BigIntRecord): bigint`                           | Экземплярный вариант статического `resolve`.                                                                                       |

### Пример со смещением

```typescript
const first = new BitBuilder(["A", "B"]).execute(); // A=1<<0, B=1<<1
const second = new BitBuilder(["C", "D"]).execute({ offset: first });
// C = 1<<2, D = 1<<3
```

---

## Компилятор

Модуль `fbit-field/compiler` предоставляет инструменты для автоматической генерации TypeScript-файлов с битовыми константами из описания категорий.

### Compiler<T>

Основной класс.

```typescript
const compiler = new Compiler(
  {
    permissions: ["read", "write", "delete"],
    roles: ["admin", "user", "guest"],
  },
  "./src/generated/bit-flags.ts",
  {
    /* опциональные переопределения методов */
  },
  { name: "myFlags", defaultExportOn: true },
);
compiler.execute();
```

#### Параметры конструктора

- `settings` – `Record<T, string[]>` – категории и списки имён.
- `filePath` – путь к выходному файлу.
- `methods` – необязательные переопределения:
  - `settingsFormat` – функция форматирования имён (по умолчанию приводит к camelCase).
  - `writeFile`, `compile`, `formatFile`, `resolveForCompiled`.
- `config` – частичная конфигурация:
  - `name` – имя константы (по умолчанию `"settings"`).
  - `writeInCompiler` – если `true`, обновляет существующий файл, заменяя маркеры.
  - `defaultExportOn` – добавлять `export default` (по умолчанию `true`).

#### Методы

- `execute(values?: string): string` – запускает генерацию.
- `parse(type: T): string[]` – возвращает отформатированные имена для категории.
- `compile(): Record<string, Record<string, string>>` – возвращает сырую структуру.
- `resolveForCompiled(): string` – возвращает строку с кодом константы.
- `writeFile(me, values?: string): string` – записывает файл.

### CodeGenerator

Используется внутри `Compiler`. Может быть применён отдельно.

```typescript
const generator = new CodeGenerator(settings);
const structure = generator.generateStructure();
const code = generator.toCodeString(structure);
const exportBlock = generator.generateExportBlock("myConst", true);
```

### FileManager

Утилита для работы с файлами: чтение, запись, замена маркеров.

Маркеры по умолчанию:

```typescript
// ## { COMPILED__WRITE_COMPILED_HERE } ## \
// ## { COMPILED__WRITE_VALUES_HERE } ## \
// ## { COMPILED__WRITE_EXPORT_HERE } ## \
```

---

## Типы и константы

### Экспортируемые типы

| Тип                 | Описание                                        |
| ------------------- | ----------------------------------------------- |
| `MustArray<T>`      | Кортеж с хотя бы одним элементом `[T, ...T[]]`. |
| `ArrayOrType<T>`    | `T \| MustArray<T>`.                            |
| `Bit`               | `bigint \| number \| string \| boolean`.        |
| `BigIntRecord`      | `Record<string, bigint>`.                       |
| `BuilderBitData<T>` | Параметры для `BitBuilder.execute`.             |
| `BitFieldInput`     | `Bit \| BitField`.                              |
| `ISettings<T>`      | `Record<T, string[]>` – для компилятора.        |
| `CompilerConfig`    | Конфигурация компилятора.                       |

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

### Права доступа (RBAC)

```typescript
import BitField from "fbit-field";

enum Permission {
  Read = 1n << 0n,
  Write = 1n << 1n,
  Delete = 1n << 2n,
  Share = 1n << 3n,
}

const userPerms = new BitField(Permission.Read | Permission.Write);
userPerms.has(Permission.Delete); // false

const adminPerms = userPerms.add(Permission.Delete, Permission.Share);
adminPerms.has(Permission.Share); // true
```

### Функции с флагами

```typescript
function process(mode: BitField) {
  if (mode.has(Flag.Verbose)) console.log("Подробный вывод");
  if (mode.has(Flag.DryRun)) console.log("Сухой запуск");
}
```

### Автоматическая генерация конфигурации через Compiler

Создайте файл `scripts/generate-flags.ts`:

```typescript
import { Compiler } from "fbit-field/compiler";

const compiler = new Compiler(
  {
    ui: ["showSidebar", "enableDarkMode", "compactView"],
    api: ["canCreate", "canEdit", "canDelete"],
  },
  "./src/flags.ts",
  {},
  { name: "featureFlags", defaultExportOn: true },
);
compiler.execute();
```

Затем запустите `ts-node scripts/generate-flags.ts`. В результате получите готовый TypeScript-файл с константами и типами.

---

## Лицензия

MIT.
