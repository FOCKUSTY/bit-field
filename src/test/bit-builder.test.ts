import Test from "./test.class";

import { BitBuilder } from "../index";

const settings = {
  one: [
    "ONE_ONE1",
    "ONE_ONE2",
    "ONE_ONE3",
    "ONE_ONE4",
  ] as const,

  two: [
    "TWO_TWO1",
    "TWO_TWO2",
    "TWO_TWO3",
    "TWO_TWO4",
    "TWO_TWO5",
  ] as const,

  three: [
    "THREE_THREE1",
    "THREE_THREE2",
    "THREE_THREE3",
    "THREE_THREE4",
    "THREE_THREE5",
  ] as const,
}

const builder1 = new BitBuilder(settings.one);
const one = builder1.execute();
const rawOne = builder1.resolve(one);

const builder2 = new BitBuilder(settings.two);
const two = builder2.execute(one);
const rawTwo = builder2.resolve(one);

const builder3 = new BitBuilder(settings.three);
const three = builder3.execute(two);
const rawThree = builder3.resolve(one);

console.log({
  one,
  two,
  three
});
