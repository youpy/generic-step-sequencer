import { useEffect, useState } from "react";
import Timer from "taimaa";
import { Sequencer, State } from "../../../src/sequencer";
import { MidiStepExecutor, MidiParameter } from "./midi";
import "./App.scss";

interface AppProps {
  seq: Sequencer<MidiParameter, MidiStepExecutor>;
}

function App(props: AppProps) {
  const { seq } = props;
  const [seqState, setSeqState] = useState<State<MidiParameter>>({
    tracks: [],
    bpm: 300,
  });

  useEffect(() => {
    const json = localStorage.getItem("seqState");

    seq.setTimer(new Timer(new AudioContext()));
    seq.onStateChange(setSeqState);
    seq.start();

    if (json) {
      seq.load(JSON.parse(json) as State<MidiParameter>);
    }

    return () => {
      seq.stop();
    };
  }, []);

  return (
    <div className="App">
      <div className="sequencer">
        {seqState.tracks.map((t, i) => (
          <pre key={i}>
            <select
              value={t.parameters.channel}
              onChange={(e) =>
                seq.setParameters(i, {
                  channel: Number(e.target.value),
                  noteNumber: t.parameters.noteNumber,
                })
              }
            >
              {[...Array(16)].map((v, i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
            <select
              value={t.parameters.noteNumber}
              onChange={(e) =>
                seq.setParameters(i, {
                  channel: t.parameters.channel,
                  noteNumber: Number(e.target.value),
                })
              }
            >
              {[...Array(128)].map((v, i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
            <code>
              <span className="controls">
                <a href="#" onClick={() => seq.removeTrack(i)}>
                  x
                </a>
                /
                <a
                  href="#"
                  onClick={() => seq.setNumberOfSteps(i, t.steps.length + 1)}
                >
                  +
                </a>
                /
                <a
                  href="#"
                  onClick={() =>
                    seq.setNumberOfSteps(i, Math.max(t.steps.length - 1, 1))
                  }
                >
                  -
                </a>
              </span>
              {t.steps.map((step, j) => (
                <span
                  key={j}
                  className={`step ${step.current ? "current" : ""}`}
                  onClick={() => seq.toggleStep(i, j)}
                >
                  {step.active ? "X" : "."}
                </span>
              ))}
            </code>
          </pre>
        ))}
        <pre>
          <code>
            <a
              href="#"
              onClick={() =>
                seq.addTrack({ channel: 0, noteNumber: 60 }, 8, [])
              }
            >
              +
            </a>
          </code>
        </pre>
        <div>
          <input
            type="range"
            min="30"
            max="400"
            step="10"
            value={seqState.bpm}
            onChange={(e) => seq.setBpm(parseInt(e.target.value))}
          />
          {seqState.bpm}
        </div>
        <div>
          <a
            href="#"
            onClick={() =>
              localStorage.setItem("seqState", JSON.stringify(seqState))
            }
          >
            💾
          </a>
        </div>
      </div>
    </div>
  );
}

export default App;
