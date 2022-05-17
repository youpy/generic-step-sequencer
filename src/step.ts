import { Track } from "./track";

export interface StepExecutor<T> {
  execute(track: Track<T>): void; // execute a step
}

export interface Step {
  active: boolean;
  current: boolean;
}
