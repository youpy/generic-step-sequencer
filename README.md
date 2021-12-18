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
  execute(track: Track<MyParameter>): void {
    console.log(
      `executing step ${track.currentStep} on ${track.parameters.foo}`
    );
  }
}
```

create and start a seuqencer

```typescript
const sequencer = new Sequencer<MyParameter, MyStepExecutor>(
  new MyStepExecutor()
);

sequencer.addTrack({ foo: "track1" }, 8, [0, 2, 4, 6]);
sequencer.addTrack({ foo: "track2" }, 8, [1, 3, 5, 7]);
sequencer.setBpm(250);
sequencer.start();
```

### Use with React

- https://github.com/youpy/generic-step-sequencer/tree/main/examples/midi-sequencer
- https://twitter.com/youpy/status/1469315687999217664

```typescript
type Props = {
  seq: Sequencer<MyParameter, MyStepExecutor>;
};

funcion App(props: Props) {
  const { seq } = props
  const [seqState, setSeqState] = useState<State<MyParameter>>({
    tracks: [],
    bpm: 300,
  });

  useEffect(() => {
    seq.onStateChange(setSeqState);
  });

  // construct view from seqState
  return ...
}
```

### Use custom timer

You can replace the default timer with a custom timer implementation that implements the [`Timer`](https://github.com/youpy/generic-step-sequencer/blob/2c1ab3d703ac062224d786ca54a0a033adea3ef8/src/sequencer.ts#L20-L23) interface

```typescript
seq.setTimer(new MyTimer());
```
