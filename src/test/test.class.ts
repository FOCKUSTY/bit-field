import assert from "assert";

class Test<T = any> {
  private readonly _tests: [T, T, any?][];
  private readonly _name: string;

  public constructor(name: string, tests: [T, T, any?][]) {
    this._name = name;
    this._tests = tests;
  }

  public readonly execute = () => {
    describe(this._name, () => {
      for (const index in this._tests) {
        const test = this._tests[index];
        const answer = test[0];
        const programmAnswer = test[1];

        it(`[${+index + 1}] Должен вовзращать "${answer}"${test[2] ? `. При "${test[2].toString()}"` : ""}`, () => {
          assert.equal(answer, programmAnswer, `Вернул ${programmAnswer}`);
        });
      }
    });
  };
}

export { Test };

export default Test;
