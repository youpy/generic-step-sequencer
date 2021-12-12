import { StepExecuter, Sequencer } from "../../src/sequencer.js";

interface MyParameter {
  foo: string;
}

class MyStepExecuter implements StepExecuter<MyParameter> {
  execute(parameters: MyParameter): void {
    console.log(`executing step ${parameters.foo}`);
  }
}

const sequencer = new Sequencer<MyParameter, MyStepExecuter>(
  new MyStepExecuter()
);

sequencer.addTrack({ foo: "track1" }, 8, [0, 2, 4, 6]);
sequencer.addTrack({ foo: "track2" }, 8, [1, 3, 5, 7]);
sequencer.start();
