import { Timer, DefaultTimer } from "./timer";

interface Tickable {
  onTick(): void;
}

interface Ticker {
  tick(): void;
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

  set bpm(bpm: number) {
    this._bpm = bpm;

    if (this.isStarting) {
      this.stop();
      this.start();
    }
  }

  get isStarting(): boolean {
    return this.intervalId !== undefined;
  }

  start(): void {
    const stepIntervalMS = 60000 / this.bpm;

    this.stop();
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
