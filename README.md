# fbit-field

Библиотека для работы с битовыми полями на TypeScript/JavaScript.  
Использует `bigint` для эффективного хранения и комбинации флагов (прав доступа, настроек и т.п.).

## Установка

```bash
npm install fbit-field
```

## Обзор

**fbit-field** предоставляет набор инструментов для работы с битовыми полями:

- **`BitField`** – основной класс со статическими и экземплярными методами для битовых операций.
- **`BitBuilder`** – генерирует значения битов из списка имён, автоматически управляя смещениями.
- **`Compiler`** – создаёт TypeScript-декларации из конфигурационного объекта (удобно для типизированных наборов прав).

---

## BitField

Класс `BitField` предлагает как статические утилиты, так и методы экземпляра для работы с битовыми полями.

### Статические методы

#### `BitField.equals(first: Bit, second: Bit): boolean`

Сравнивает два битовых значения (приводит к `bigint`) на равенство.

```ts
BitField.equals(1n, 1n);   // true
BitField.equals(1n, "1");   // true
BitField.equals(1n, 2n);    // false
```

#### `BitField.summarize(...bits: Bit[]): bigint`

Выполняет побитовое ИЛИ над всеми переданными значениями. Дубликаты игнорируются.

```ts
BitField.summarize(1n, 2n, 4n); // 7n
BitField.summarize(2n, 2n, 4n); // 6n (2|2|4 = 6)
```

#### `BitField.add(bit: Bit, ...add: Bit[]): bigint`

Аналог `summarize`, но с обязательным первым аргументом.  
Эквивалентно `bit | summarize(...add)`.

```ts
BitField.add(1n, 2n, 4n); // 7n
```

#### `BitField.remove(bit: Bit, ...remove: Bit[]): bigint`

Удаляет указанные биты с помощью И и дополнения.

```ts
BitField.remove(7n, 4n, 2n); // 1n
BitField.remove(14n, 4n, 2n); // 8n (14 & ~(4|2) = 8)
```

#### `BitField.logarithm2(bigint: Bit): bigint`

Возвращает целую часть двоичного логарифма числа. Полезна для определения позиции старшего установленного бита.

```ts
BitField.logarithm2(1n << 10n); // 10n
BitField.logarithm2(2n << 10n); // 11n (так как 2<<10 = 2048, log2≈11)
```

#### `BitField.max(...values: Bit[]): bigint`

Возвращает наибольшее `bigint` среди аргументов.

```ts
BitField.max(1n, 2n, 3n, 4n); // 4n
```

### Методы экземпляра

Конструктор экземпляра принимает одно битовое значение (по умолчанию `0n`).

```ts
const field = new BitField(1n);
```

#### `add(...bits: Bit[]): bigint`

Добавляет биты к текущему значению и возвращает новое значение (исходный экземпляр не изменяется).

```ts
field.add(2n, 4n); // 7n
```

#### `remove(...bits: Bit[]): bigint`

Удаляет биты из текущего значения и возвращает новое значение.

```ts
field.remove(2n); // 1n (поле было 1n, удаление 2n ничего не меняет)
```

#### `has(...bits: Bit[]): boolean`

Проверяет, равно ли текущее значение побитовому ИЛИ переданных битов.

```ts
field.has(1n);        // true
field.has(1n, 2n);    // false, если поле не равно 1|2
```

---

## BitBuilder

`BitBuilder` помогает сгенерировать набор именованных битовых значений (например, прав) с автоматическим управлением смещениями. Полезно, когда есть несколько категорий флагов, которые должны занимать непересекающиеся диапазоны битов.

### Конструктор

```ts
new BitBuilder<T extends string>(bits: T[] | Readonly<T[]>)
```

- `bits` – массив строк – имён будущих битов (например, `['READ', 'WRITE', 'DELETE']`).

### Статические методы

#### `BitBuilder.resolve(bits: IObject): bigint`

Объединяет объект именованных битов в одно число (вызывает `BitField.summarize`).

```ts
const perms = { READ: 1n, WRITE: 2n };
BitBuilder.resolve(perms); // 3n
```

### Методы экземпляра

#### `execute(offset?: bigint | IObject, exclude?: T[], include?: T[]): Record<T, bigint>`

Генерирует битовые значения для каждого имени из исходного массива `bits`.

- `offset` – начальный индекс бита (`bigint`) или объект с ранее сгенерированными битами. Если передан объект, следующий свободный бит вычисляется автоматически как `max(существующие биты) + 1`.
- `exclude` – массив имён, которые нужно исключить (получат `0n`).
- `include` – если указан, только имена из этого массива получат ненулевые значения; все остальные – `0n`.

**Возвращает**: объект, отображающий имя в его `bigint`-значение.

```ts
const builder = new BitBuilder(['READ', 'WRITE', 'DELETE']);
const bits = builder.execute(10n);
// { READ: 1n << 10n, WRITE: 1n << 11n, DELETE: 1n << 12n }

// Использование ранее сгенерированного объекта
const first = builder.execute(); // начинается с 0n
const second = new BitBuilder(['EXECUTE']).execute(first); // следующий свободный бит
```

#### `resolve(bits: IObject): bigint`

Экземплярный вариант статического `resolve`.

---

## Compiler

Класс `Compiler` автоматизирует создание TypeScript-деклараций из конфигурационного объекта. Особенно полезен, когда у вас есть несколько категорий прав и вы хотите создать типизированный файл-констант.

### Конфигурация

Компилятор принимает объект конфигурации (`Partial<Config>`):

```ts
type Config = {
  name: string;               // Имя генерируемого объекта-константы (по умолчанию 'settings')
  writeInCompiler: boolean;    // Если true – изменяет существующий файл, используя специальные комментарии
  defaultExportOn: boolean;    // Добавлять ли экспорт по умолчанию (по умолчанию true)
};
```

Специальные комментарии в целевом файле (при `writeInCompiler: true`):

- `// ## { WRITE_COMPILED_HERE } ## \\` – заменяется на сгенерированный объект-константу.
- `// ## { WRITE_VALUES_HERE } ## \\` – заменяется на пользовательские значения (если переданы).
- `// ## { WRITE_EXPORT_HERE } ## \\` – заменяется на экспорты типов.

### Использование

```ts
import { Compiler } from 'fbit-field';

const settings = {
  permissions: ['READ', 'WRITE', 'DELETE'],
  roles: ['ADMIN', 'USER', 'GUEST']
};

const compiler = new Compiler(settings, './output.ts', {}, {
  name: 'mySettings',
  defaultExportOn: true
});

compiler.execute(); // создаст файл output.ts со сгенерированными константами
```

### Пользовательское форматирование

Вы можете переопределить стандартное форматирование имён (которое преобразует `SOME_NAME` в `someName`), передав функцию `settingsFormat` в параметре `methods` конструктора.

```ts
const compiler = new Compiler(
  settings,
  './output.ts',
  {
    settingsFormat: (arr) => arr.map(s => s.toLowerCase()) // оставить как есть, в нижнем регистре
  }
);
```

**Внимание:** объект `methods` также позволяет переопределить `writeFile`, `compile` и другие методы. Используйте осторожно – они напрямую работают с файловой системой.

---

## Типы

Библиотека экспортирует несколько вспомогательных типов:

- `Bit` – `bigint | number | string | boolean` (любое значение, которое можно привести к `bigint`).
- `MustArray<T>` – гарантирует хотя бы один элемент.
- `ArrayOrType<T>` – `MustArray<T> | T`.
- `ConstArray<T>` – `T[] | readonly T[]` (используется в компиляторе).
- `ISettings<T>` – `Record<T, ConstArray<string>>` (входные данные для компилятора).

---

## Лицензия

MIT © FOCKUSTY