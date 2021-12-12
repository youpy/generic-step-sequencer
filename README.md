# generic-step-sequencer

A purpose-agnostic step sequencer implementation

## Installation

```
$ yarn add generic-step-sequencer
```

## Usage

see https://github.com/youpy/generic-step-sequencer/blob/main/examples/basic/index.ts

implement a step executor

```typescript
import { StepExecutor, Sequencer, State } from "generic-step-sequencer";

interface MyParameter {
  foo: string;
}

class MyStepExecutor implements StepExecutor<MyParameter> {
  execute(parameters: MyParameter): void {
    console.log(`executing step ${parameter.foo}`);
  }
}
```

create and start a seuqencer

```typescript
const sequencer = new Sequencer<MyParameter, MyStepExecuter>(
  new MyStepExecutor()
);

sequencer.addTrack({ foo: "track1" }, 8, [0, 2, 4, 6]);
sequencer.addTrack({ foo: "track2" }, 8, [1, 3, 5, 7]);
sequencer.setBpm(250);
sequencer.start();
```

### Use with React

see https://github.com/youpy/generic-step-sequencer/tree/main/examples/midi-sequencer

```typescript
type Props = {
  seq: Sequencer<MyParameter, MyStepExecuter>;
};

funcion App(props: Props) {
  const { seq } = props
  const [seqState, setSeqState] = useState<State<MyParameter>>({
    tracks: [],
    bpm: 300,
  });

  seq.setCallback(state => setSeqState(state));

  // construct view from seqState
  return ...
}
```
