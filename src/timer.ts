export interface Timer {
  setInterval(callback: () => void, ms: number): number;
  clearInterval(intervalId: number | undefined): void;
}

export class DefaultTimer {
  setInterval(callback: () => void, ms: number): number {
    return setInterval(callback, ms);
  }

  clearInterval(intervalId: number | undefined): void {
    clearInterval(intervalId);
  }
}
