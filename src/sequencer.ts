import Timer from "taimaa";

export interface StepExecuter<T> {
  execute(parameters: T): void; // execute a step
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
  bpm: number;
}

export class Sequencer<T, U extends StepExecuter<T>> {
  private executer: U;
  private tracks: Track<T>[] = [];
  private _bpm: number = 120;
  private intervalId: number | undefined;
  private cb: (state: State<T>) => void = () => {};
  private timer: Timer;

  constructor(executer: U) {
    this.executer = executer;
    this.timer = new Timer(new AudioContext());
  }

  addTrack(parameters: T, numberOfSteps: number, activeSteps: number[]) {
    this.tracks.push(new Track<T>(parameters, numberOfSteps, activeSteps));
    this.update();
  }

  private get bpm(): number {
    return this._bpm;
  }

  setBpm(bpm: number) {
    this._bpm = bpm;

    this.stop();
    this.start();
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

  setCallback(cb: (state: State<T>) => void) {
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
      track.nextStep(this.executer);
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
    this._bpm = state.bpm;

    this.stop();
    this.start();
    this.update();
  }

  start() {
    const stepIntervalMS = 60000 / this._bpm;

    this.step();
    this.intervalId = this.timer.setInterval(() => {
      this.step();
      this.update();
    }, stepIntervalMS);
  }

  update() {
    this.cb({
      tracks: this.tracks.map((track) => {
        return track.state;
      }),
      bpm: this.bpm,
    });
  }

  stop() {
    this.timer.clearInterval(this.intervalId);
  }
}

export class Track<T> {
  private numberOfSteps: number;
  private currentStep: number;
  private activeSteps: number[];
  private parameters: T;

  constructor(parameters: T, numberOfsteps: number, activeSteps: number[]) {
    this.parameters = parameters;
    this.currentStep = 0;
    this.numberOfSteps = numberOfsteps;
    this.activeSteps = activeSteps;
  }

  setParameters(parameters: T) {
    this.parameters = parameters;
  }

  setNumberOfSteps(numberOfSteps: number) {
    this.numberOfSteps = numberOfSteps;
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

    for (let i = 0; i < this.numberOfSteps; i++) {
      steps.push({
        active: this.activeSteps.includes(i),
        current: i === this.currentStep,
      });
    }

    return {
      steps,
      parameters: this.parameters,
    };
  }

  nextStep(executer: StepExecuter<T>) {
    this.currentStep = (this.currentStep + 1) % this.numberOfSteps;
    if (!this.activeSteps.includes(this.currentStep)) {
      return;
    }

    executer.execute(this.parameters);
  }
}
