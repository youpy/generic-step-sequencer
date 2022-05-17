import { Timer, DefaultTimer } from "./timer";

interface Tickable {
  onTick(): void;
}

interface Ticker {
  tick(tickable: Tickable): void;
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
