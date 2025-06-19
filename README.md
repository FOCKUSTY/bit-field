# bit-field
Simple bit field for some systems: rights, permissions, configs and more...

## How to use `BitField` class?

```ts
import { BitField } from "fbit-field";

// BitField.equals
// compares two values
BitField.equals(1n, 1n)  // true
BitField.equals(1n, "1") // true
BitField.equals(1n, 2n)  // false
BitField.equals(1n, "2") // false

// BitField.summarize
// summurize values
BitField.summarize([1n, 2n, 4n]) // 7n
BitField.summarize([2n, 2n, 4n]) // 6n
BitField.summarize([1n, 4n]) // 5n
BitField.summarize([1n, 1n]) // 1n
BitField.summarize(1n) // 1n

// BitField.add
// summurize values
BitField.add(1n, [2n, 4n]) // 7n
BitField.add(2n, [2n, 4n]) // 6n
BitField.add(1n, 4n) // 5n
BitField.add(1n, 1n) // 1n

// BitField.remove
// subtract values
BitField.remove(7n, [4n, 2n]) // 1n
BitField.remove(14n, [4n, 2n]) // 8n
BitField.remove(14n, [4n, 2n, 1n]) // 8n
BitField.remove(14n, [1n]) // 14n

// BitField.logarithm2
// takes the logarithm of a number
BitField.logarithm2(1n << 10n) // 10n
BitField.logarithm2(1n << MULTIPLIER) // MULTIPLIER
BitField.logarithm2(2n << 10n) // 11n
BitField.logarithm2(4n << 10n) // 12n

// BitField.max
// takes max value of values
BitField.max(1n, 2n, 3n, 4n) // 4n

// new BitField().add
// summurize values
new BitField(1n).add([2n, 4n]) // 7n
new BitField(2n).add([2n, 4n]) // 6n
new BitField(1n).add(4n) // 5n
new BitField(1n).add(1n) // 1n

// new BitField().remove
// subtract values
new BitField(7n).remove([4n, 2n]) // 1n
new BitField(14n).remove([4n, 2n]) // 8n
new BitField(14n).remove([4n, 2n, 1n]) // 8n
new BitField(14n).remove([1n]) // 14n

// new BitField().has
// checking bits equals
new BitField(1n).has(1n)  // true
new BitField(1n).has("1") // true
new BitField(1n).has(2n)  // false
new BitField(1n).has("2") // false
```