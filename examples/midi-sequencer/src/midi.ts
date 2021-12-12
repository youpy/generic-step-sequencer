import Timer from "taimaa";
import { Track } from "../../../src/sequencer";

export interface MidiParameter {
  channel: number;
  noteNumber: number;
}

export class MidiStepExecutor {
  private outputs: WebMidi.MIDIOutput[];
  private timer: Timer;

  constructor(outputs: WebMidi.MIDIOutput[]) {
    this.outputs = outputs;
    this.timer = new Timer(new AudioContext());
  }

  execute(track: Track<MidiParameter>): void {
    const { channel, noteNumber } = track.parameters;

    this.outputs.forEach((output) => {
      const noteOnMessage = [0x90 | channel, noteNumber, 0x7f];
      const noteOffMessage = [0x80 | channel, noteNumber, 0x7f];

      output.send(noteOnMessage);

      this.timer.setTimeout(() => {
        output.send(noteOffMessage);
      }, 200);
    });
  }
}
