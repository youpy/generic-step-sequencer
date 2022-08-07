import { Step, StepExecutor } from "./step.js";

export interface TrackState<T> {
  steps: Step[];
  parameters: T;
}

export interface NextStepStrategy<T> {
  (track: Track<T>): number;
}

export const forward = <T>(track: Track<T>): number => {
  return (track.currentStep + 1) % track.numberOfSteps;
};

export const backward = <T>(track: Track<T>): number => {
  return (track.currentStep + track.numberOfSteps - 1) % track.numberOfSteps;
};

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

  reset() {
    this._currentStep = 0;
  }
}
