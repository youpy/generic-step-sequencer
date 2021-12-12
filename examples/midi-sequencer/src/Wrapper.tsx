import { useContext } from "react";
import { Sequencer } from "../../../src/sequencer";
import { MidiStepExecutor, MidiParameter } from "./midi";
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
        new Sequencer<MidiParameter, MidiStepExecutor>(
          new MidiStepExecutor(outputs)
        )
      }
    />
  );
}

export default Wrapper;
