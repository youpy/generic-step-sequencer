import Timer from "taimaa";
export interface MidiParameter {
  channel: number;
  noteNumber: number;
}

export class MidiStepExecuter {
  private outputs: WebMidi.MIDIOutput[];
  private timer: Timer;

  constructor(outputs: WebMidi.MIDIOutput[]) {
    this.outputs = outputs;
    this.timer = new Timer(new AudioContext());
  }

  execute(parameters: MidiParameter): void {
    this.outputs.forEach((output) => {
      const noteOnMessage = [
        0x90 | parameters.channel,
        parameters.noteNumber,
        0x7f,
      ];
      const noteOffMessage = [
        0x80 | parameters.channel,
        parameters.noteNumber,
        0x7f,
      ];

      output.send(noteOnMessage);

      this.timer.setTimeout(() => {
        output.send(noteOffMessage);
      }, 200);
    });
  }
}
