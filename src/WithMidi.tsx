import { useEffect, useState, createContext } from "react";

type Props = {
  children: React.ReactNode;
};

type ContextValue = WebMidi.MIDIOutput[] | null;

export const MidiContext = createContext<ContextValue>(null);
export function WithMidi({ children }: Props) {
  const [outputs, setOutputs] = useState<ContextValue>(null);

  useEffect(() => {
    (async () => {
      const outputs: WebMidi.MIDIOutput[] = [];
      const midiAccess = await navigator.requestMIDIAccess();
      const outputIterator = midiAccess.outputs.values();

      for (
        let output = outputIterator.next();
        !output.done;
        output = outputIterator.next()
      ) {
        outputs.push(output.value);
      }

      setOutputs(outputs);
    })();
  }, []);

  if (!outputs) {
    return null;
  }

  return (
    <MidiContext.Provider value={outputs}>{children}</MidiContext.Provider>
  );
}
