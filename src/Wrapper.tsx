import { useContext } from "react";
import { Sequencer } from "./sequencer";
import { MidiStepExecuter, MidiParameter } from "./midi";
import { MidiContext } from "./WithMidi";
import App from "./App";
import "./App.scss";

function Wrapper() {
  const outputs = useContext(MidiContext);

  if (!outputs) {
    return null;
  }

  return (
    <App
      seq={
        new Sequencer<MidiParameter, MidiStepExecuter>(
          new MidiStepExecuter(outputs)
        )
      }
    />
  );
}

export default Wrapper;
