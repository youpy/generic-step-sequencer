import { StepExecutor } from "./step";
import { NextStepStrategy, Track, TrackState, forward } from "./track";

export interface SequencerState<T> {
  tracks: TrackState<T>[];
}

export class Sequencer<T, U extends StepExecutor<T>> {
  private executor: U;
  private tracks: Track<T>[] = [];
  private cb: (state: SequencerState<T>) => void = () => {};
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
    this.update();
  }

  onStateChange(cb: (state: SequencerState<T>) => void) {
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

  load(state: SequencerState<T>) {
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

  private step() {
    this.tracks.forEach((track) => {
      track.step(this.executor, this.nextStepStrategy);
    });
  }

  private update() {
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
