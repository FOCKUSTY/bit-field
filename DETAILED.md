# Детальная документация fbit-field

## Содержание

1. [Класс BitField](#класс-bitfield)
2. [Класс BitFieldView](#класс-bitfieldview)
3. [Класс BitFieldOperations](#класс-bitfieldoperations)
4. [Класс BitBuilder](#класс-bitbuilder)
   - [BitBuilder.fromConfig (новый)](#bitbuilderfromconfig)
   - [BitBuilder.fromData](#bitbuilderfromdata)
   - [Методы execute и resolve](#методы-execute-и-resolve)
5. [Компилятор (устаревший)](#компилятор-устаревший)
6. [Типы и константы](#типы-и-константы)
7. [Примеры](#примеры)

---

## Класс BitField

[без изменений, остаётся как в вашей версии]

---

## Класс BitFieldView

[без изменений]

---

## Класс BitFieldOperations

[без изменений]

---

## Класс BitBuilder

### `BitBuilder.fromConfig`

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

> ⚠️ **Устаревший API** – начиная с версии 3.1.0, рекомендуется использовать `BitBuilder.fromConfig`. Класс `Compiler` будет удалён в будущих версиях.

Компилятор предназначен для генерации TypeScript-файлов с константами. Его функциональность полностью покрывается `BitBuilder.fromConfig` + ручной записью в файл (или использованием вашего `FileManager`). Если вы всё же используете старый код, обратитесь к предыдущим версиям документации.

---

## Типы и константы

### Дополнительные типы для `BitBuilder.fromConfig`

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

Остальные типы описаны в [README.md](./README.md).

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
const guest = new BitField(perms.default.comments);          // только view, create
const editor = new BitField(perms.available.posts);          // все права на посты
const moderator = guest.add(perms.available.comments.moderate); // добавили moderate

// 4. Проверяем
editor.has(perms.available.posts.delete);      // true
moderator.has(perms.available.comments.delete) // false (был исключён)
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
