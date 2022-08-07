import { useEffect, useState } from "react";
import {
  Sequencer,
  PeriodicTicker,
  SequencerState,
  Track,
  forward,
  backward,
} from "../../../src/";
import { MidiStepExecutor, MidiParameter } from "./midi";
import "./App.scss";

interface AppProps {
  seq: Sequencer<MidiParameter, MidiStepExecutor>;
  ticker: PeriodicTicker;
}

const backAndForth = (track: Track<MidiParameter>): number => {
  switch (track.currentStep) {
    case 0:
      track.parameters.dir = 1;
      break;
    case track.numberOfSteps - 1:
      track.parameters.dir = 0;
  }

  return track.parameters.dir === 1 ? forward(track) : backward(track);
};

const random = (track: Track<MidiParameter>): number =>
  Math.floor(Math.random() * track.numberOfSteps);

const directions = {
  forward: forward,
  backward: backward,
  backAndForth: backAndForth,
  random: random,
};

function App(props: AppProps) {
  const { seq, ticker } = props;
  const [seqState, setSeqState] = useState<SequencerState<MidiParameter>>({
    tracks: [],
  });
  const [direction, setDirection] =
    useState<keyof typeof directions>("forward");
  const [bpm, setBpm] = useState(120);

  useEffect(() => {
    const json = localStorage.getItem("seqState");

    seq.onStateChange(setSeqState);

    if (json) {
      seq.load(JSON.parse(json) as SequencerState<MidiParameter>);
    }

    return () => {
      ticker.stop();
    };
  }, []);

  useEffect(() => {
    seq.setNextStepStrategy(directions[direction]);
  }, [direction]);

  useEffect(() => {
    ticker.bpm = bpm;
  }, [bpm]);

  const onClickTickButton = () => {
    seq.onTick();
  };

  const onClickStartButton = () => {
    ticker.start();
  };

  const onClickStopButton = () => {
    ticker.stop();
  };

  const onClickResetButton = () => {
    seq.reset();
  };

  return (
    <div className="App">
      <div className="sequencer">
        {seqState.tracks.map((t, i) => (
          <pre
            className={`track ${t.parameters.enabled ? "enabled" : ""}`}
            key={i}
          >
            <input
              name="enabled"
              type="checkbox"
              checked={t.parameters.enabled}
              onChange={(e) => {
                seq.setParameters(i, {
                  channel: t.parameters.channel,
                  noteNumber: t.parameters.noteNumber,
                  dir: t.parameters.dir,
                  enabled: e.target.checked,
                });
              }}
            />
            <select
              value={t.parameters.channel}
              onChange={(e) =>
                seq.setParameters(i, {
                  channel: Number(e.target.value),
                  noteNumber: t.parameters.noteNumber,
                  dir: t.parameters.dir,
                  enabled: t.parameters.enabled,
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
                  dir: t.parameters.dir,
                  enabled: t.parameters.enabled,
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
              onClick={() => {
                const steps =
                  seqState.tracks.length > 0
                    ? seqState.tracks[seqState.tracks.length - 1].steps.length
                    : 8;

                seq.addTrack(
                  { channel: 0, noteNumber: 60, dir: 0, enabled: true },
                  steps,
                  []
                );
              }}
            >
              +
            </a>
          </code>
        </pre>
        <div className="controls">
          <div className="buttons">
            <button onClick={onClickTickButton}>Tick</button>
            <button onClick={onClickStartButton}>Start</button>
            <button onClick={onClickStopButton}>Stop</button>
            <button onClick={onClickResetButton}>Reset</button>
          </div>
          <div>
            <input
              type="range"
              min="1"
              max="800"
              step="1"
              value={bpm}
              onChange={(e) => setBpm(parseInt(e.target.value))}
            />
            {bpm}
          </div>
          <div>
            <select
              value={direction}
              onChange={(e) =>
                setDirection(e.target.value as keyof typeof directions)
              }
            >
              {Object.keys(directions).map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
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
    </div>
  );
}

export default App;
