import { useContext } from "react";
import Timer from "taimaa";
import { Sequencer, PeriodicTicker } from "../../../src/";
import { MidiStepExecutor, MidiParameter } from "./midi";
import { MidiContext } from "./WithMidi";
import App from "./App";
import "./App.scss";

function Wrapper() {
  const outputs = useContext(MidiContext);

  if (!outputs) {
    return null;
  }

  const seq = new Sequencer<MidiParameter, MidiStepExecutor>(
    new MidiStepExecutor(outputs)
  );
  const ticker = new PeriodicTicker(seq, new Timer(new AudioContext()));

  console.log(outputs.length);

  return <App seq={seq} ticker={ticker} />;
}

export default Wrapper;
