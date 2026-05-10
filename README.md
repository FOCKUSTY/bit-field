# fbit-field

Мощная TypeScript-библиотека для работы с битовыми полями на `BigInt`.  
Идеально подходит для прав доступа (RBAC), флагов функций, переключателей и компактного хранения множества состояний.

[![npm version](https://img.shields.io/npm/v/fbit-field.svg)](https://www.npmjs.com/package/fbit-field)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/node/v/fbit-field.svg)](https://nodejs.org)

## Особенности

- 🚀 **Производительность** – использует `BigInt`, поддерживает сотни битов без потери точности.
- 🔧 **Гибкий API** – операции `add`, `remove`, `has`, `and`, `or`, `xor`, `not`, сдвиги, диапазоны.
- 📦 **Генерация битовых конфигураций** – новый метод `BitBuilder.fromConfig` создаёт готовые объекты `available`/`default`/`raw` из простой декларации.
- 🧩 **Итератор по установленным битам** – легко перебирать активные флаги.
- 📝 **Полная типизация** – строгая проверка типов, вывод типов для имён битов.
- 🧪 **Готовая поддержка** Node.js 12+ и современных браузеров.

## Установка

```bash
npm install fbit-field
```

## Быстрый старт

### Базовое использование

```typescript
import BitField from "fbit-field";

const flags = new BitField(0b1010);
flags.has(0b1000); // true
flags.has(0b0010); // false

const newFlags = flags.add(0b0001); // 0b1011
newFlags.has(0b0001); // true

const cleared = flags.remove(0b1000); // 0b0010
```

### Генерация конфигурации прав (рекомендуемый способ)

Вместо ручного перечисления битов используйте `BitBuilder.fromConfig`:

```typescript
import { BitBuilder } from "fbit-field";

const rightsConfig = {
  user: { include: ["VIEW", "EDIT"], exclude: ["DELETE"] },
  admin: { include: ["VIEW", "EDIT", "DELETE"], exclude: [] },
};

const bits = BitBuilder.fromConfig(rightsConfig);
// bits.available.user: { VIEW: 1n<<0n, EDIT: 1n<<1n, DELETE: 1n<<2n }
// bits.default.user:   { VIEW: 1n<<0n, EDIT: 1n<<1n, DELETE: 0n }
// bits.raw.user:       ["VIEW", "EDIT", "DELETE"]

// Использование в коде
const userPermissions = new BitField(bits.default.user);
userPermissions.has(bits.available.user.EDIT); // true
```

Для получения итогового числа (суммы флагов) используйте `resolveConfig`:

```typescript
const perms = BitBuilder.resolveConfig(bits);
// perms.available.user → 7n
// perms.default.user → 3n

### Работа с именованными флагами через `BitBuilder.execute`

```typescript
const builder = new BitBuilder(["READ", "WRITE", "EXECUTE"]);
const permissions = builder.execute();
// { READ: 1n << 0n, WRITE: 1n << 1n, EXECUTE: 1n << 2n }
```

### (Устаревший способ) Компилятор

> ⚠️ **Устаревший API** – начиная с версии 3.1.0, рекомендуется использовать `BitBuilder.fromConfig`. Класс `Compiler` будет удалён в будущих версиях.

Старый способ генерации TypeScript-файла:

```typescript
import { Compiler } from "fbit-field/compiler";

const compiler = new Compiler({...}, "./flags.ts");
compiler.execute();
```

## Документация

- Полное описание API и примеры – в [DETAILED.md](./DETAILED.md).
- [Репозиторий на GitHub](https://github.com/FOCKUSTY/bit-field)

## Лицензия

MIT © [FOCKUSTY](https://github.com/FOCKUSTY)
