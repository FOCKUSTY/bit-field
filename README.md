# fbit-field

Мощная TypeScript-библиотека для работы с битовыми полями на `BigInt`.  
Идеально подходит для прав доступа (RBAC), флагов функций, переключателей и компактного хранения множества состояний.

[![npm version](https://img.shields.io/npm/v/fbit-field.svg)](https://www.npmjs.com/package/fbit-field)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/node/v/fbit-field.svg)](https://nodejs.org)

## Особенности

- 🚀 **Производительность** – использует `BigInt`, поддерживает сотни битов без потери точности.
- 🔧 **Гибкий API** – операции `add`, `remove`, `has`, `and`, `or`, `xor`, `not`, сдвиги, диапазоны.
- 📦 **Генератор битовых конфигураций** – автоматическое создание TypeScript-констант из описания категорий.
- 🧩 **Итератор по установленным битам** – легко перебирать активные флаги.
- 📝 **Полная типизация** – строгая проверка типов, вывод типов для имён битов.
- 🧪 **Готовая поддержка** Node.js 12+ и современных браузеров.

## Установка

```bash
npm install fbit-field
# или
yarn add fbit-field
# или
pnpm add fbit-field
```

## Быстрый старт

### Базовое использование

```typescript
import BitField from "fbit-field";

// Создание битового поля из числа, строки, bigint или другого BitField
const flags = new BitField(0b1010); // 10

// Проверка наличия бита
flags.has(0b1000); // true
flags.has(0b0010); // false

// Добавление (установка) битов
const newFlags = flags.add(0b0001); // 0b1011
newFlags.has(0b0001); // true

// Удаление битов
const cleared = flags.remove(0b1000); // 0b0010

// Комбинации
const combined = flags.add(0b0100).remove(0b1000); // 0b0110
```

### Работа с именованными флагами через `BitBuilder`

```typescript
import { BitBuilder } from "fbit-field";

const builder = new BitBuilder(["READ", "WRITE", "EXECUTE"]);
const permissions = builder.execute();
// { READ: 1n << 0n, WRITE: 1n << 1n, EXECUTE: 1n << 2n }

// Объединение флагов в число
const mask = builder.resolve(permissions); // 0b111
```

### Генерация TypeScript-конфигурации (компилятор)

```typescript
import { Compiler } from "fbit-field/compiler";

const settings = {
  file: ["read", "write", "delete"],
  user: ["view", "edit", "share"],
};

const compiler = new Compiler(settings, "./src/generated/flags.ts");
compiler.execute(); // создаст файл с константой settings и вспомогательными типами
```

Сгенерированный файл будет содержать:

```typescript
export const settings = {
  file: {
    read: 1n << 0n,
    write: 1n << 1n,
    delete: 1n << 2n,
  },
  user: {
    view: 1n << 3n,
    edit: 1n << 4n,
    share: 1n << 5n,
  },
} as const;
```

## Использование с TypeScript

Библиотека написана на TypeScript и полностью типизирована. Вы получаете автодополнение и проверку типов для всех методов.

```typescript
import BitField from "fbit-field";

const bf = new BitField(0b1100);
bf.has(0b1000); // true
// bf.has('не число') // ошибка компиляции
```

## Документация

- Полное описание API и примеры – в [DETAILED.md](./DETAILED.md).
- [Репозиторий на GitHub](https://github.com/FOCKUSTY/bit-field)

## Лицензия

MIT © [FOCKUSTY](https://github.com/FOCKUSTY)
