export interface StepExecutor<T> {
  execute(track: Track<T>): void; // execute a step
}

export interface Step {
  active: boolean;
  current: boolean;
}

export interface TrackState<T> {
  steps: Step[];
  parameters: T;
}

export interface State<T> {
  tracks: TrackState<T>[];
}

interface NextStepStrategy<T> {
  (track: Track<T>): number;
}

export const forward = <T>(track: Track<T>): number => {
  return (track.currentStep + 1) % track.numberOfSteps;
};

export const backward = <T>(track: Track<T>): number => {
  return (track.currentStep + track.numberOfSteps - 1) % track.numberOfSteps;
};

interface Tickable {
  onTick(): void;
}

interface Ticker {
  tick(tickable: Tickable): void;
}

interface Timer {
  setInterval(callback: () => void, ms: number): number;
  clearInterval(intervalId: number | undefined): void;
}

class DefaultTimer {
  setInterval(callback: () => void, ms: number): number {
    return setInterval(callback, ms);
  }

  clearInterval(intervalId: number | undefined): void {
    clearInterval(intervalId);
  }
}

export class PeriodicTicker implements Ticker {
  private intervalId: number | undefined;

  constructor(
    private tickable: Tickable,
    private timer: Timer = new DefaultTimer(),
    private _bpm: number = 120
  ) {
    this.timer = timer;
    this._bpm = _bpm;
    this.tickable = tickable;
  }

  get bpm(): number {
    return this._bpm;
  }

  setBpm(bpm: number) {
    this._bpm = bpm;

    this.stop();
    this.start();
  }

  start(): void {
    const stepIntervalMS = 60000 / this.bpm;

    this.tick();
    this.intervalId = this.timer.setInterval(() => {
      this.tick();
    }, stepIntervalMS);
  }

  tick(): void {
    this.tickable.onTick();
  }

  stop(): void {
    this.timer.clearInterval(this.intervalId);
  }
}

export class Sequencer<T, U extends StepExecutor<T>> {
  private executor: U;
  private tracks: Track<T>[] = [];
  private cb: (state: State<T>) => void = () => {};
  private nextStepStrategy: NextStepStrategy<T>;

  constructor(executor: U, nextStepStrategy: NextStepStrategy<T> = forward) {
    this.executor = executor;
    this.nextStepStrategy = nextStepStrategy;
  }

  addTrack(parameters: T, numberOfSteps: number, activeSteps: number[]) {
    this.tracks.push(new Track<T>(parameters, numberOfSteps, activeSteps));
    this.update();
  }

  setParameters(i: number, parameters: T) {
    this.tracks[i].setParameters(parameters);
    this.update();
  }

  setNumberOfSteps(i: number, numberOfSteps: number) {
    this.tracks[i].setNumberOfSteps(numberOfSteps);
    this.update();
  }

  setNextStepStrategy(nextStepStrategy: NextStepStrategy<T>) {
    this.nextStepStrategy = nextStepStrategy;
  }

  onStateChange(cb: (state: State<T>) => void) {
    this.cb = cb;
  }

  removeTrack(i: number) {
    this.tracks.splice(i, 1);
    this.update();
  }

  toggleStep(i: number, j: number) {
    this.tracks[i].toggleStep(j);
    this.update();
  }

  step() {
    this.tracks.forEach((track) => {
      track.step(this.executor, this.nextStepStrategy);
    });
  }

  load(state: State<T>) {
    const tracks: Track<T>[] = state.tracks.map((track) => {
      const activeSteps = track.steps.reduce<number[]>((out, step, index) => {
        if (step.active) {
          out.push(index);
        }

        return out;
      }, []);

      return new Track(track.parameters, track.steps.length, activeSteps);
    });

    this.tracks = tracks;

    this.update();
  }

  update() {
    this.cb({
      tracks: this.tracks.map((track) => {
        return track.state;
      }),
    });
  }

  onTick() {
    this.step();
    this.update();
  }
}

export class Track<T> {
  private _numberOfSteps: number;
  private _currentStep: number;
  private activeSteps: number[];
  private _parameters: T;

  constructor(parameters: T, numberOfsteps: number, activeSteps: number[]) {
    this._parameters = parameters;
    this._currentStep = 0;
    this._numberOfSteps = numberOfsteps;
    this.activeSteps = activeSteps;
  }

  get parameters(): T {
    return this._parameters;
  }

  get numberOfSteps(): number {
    return this._numberOfSteps;
  }

  get currentStep(): number {
    return this._currentStep;
  }

  setParameters(parameters: T) {
    this._parameters = parameters;
  }

  setNumberOfSteps(numberOfSteps: number) {
    this._numberOfSteps = numberOfSteps;
  }

  toggleStep(i: number) {
    if (this.activeSteps.includes(i)) {
      this.activeSteps = this.activeSteps.filter((step) => step !== i);
    } else {
      this.activeSteps.push(i);
    }
  }

  get state(): TrackState<T> {
    const steps: Step[] = [];

    for (let i = 0; i < this._numberOfSteps; i++) {
      steps.push({
        active: this.activeSteps.includes(i),
        current: i === this._currentStep,
      });
    }

    return {
      steps,
      parameters: this._parameters,
    };
  }

  step(executor: StepExecutor<T>, nextStepStrategy: NextStepStrategy<T>) {
    this._currentStep = nextStepStrategy(this);

    if (this.activeSteps.includes(this._currentStep)) {
      executor.execute(this);
    }
  }
}
