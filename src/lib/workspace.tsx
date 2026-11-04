import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { ChartResult, ChartRequest } from "../schemas/chart";
import { birthDraftSchema, type BirthDraft } from "../schemas/birth";
export type { BirthDraft, PlaceOption } from "../schemas/birth";
const INITIAL: BirthDraft = {
  name: "Alex Morgan",
  email: "",
  gender: "Prefer not to say",
  date: "1994-09-18",
  time: "14:30",
  language: "English",
  place: { id: 5128581, name: "New York", region: "New York", country: "United States" },
};

const Context = createContext<{
  readingInput: ChartRequest | null;
  setReadingInput: (input: ChartRequest) => void;
  ready: boolean;
  draft: BirthDraft;
  setDraft: (draft: BirthDraft) => void;
  result: ChartResult | null;
  setResult: (result: ChartResult) => void;
  resultName: string;
  setResultName: (name: string) => void;
}>({
  readingInput: null,
  setReadingInput: () => {},
  ready: !import.meta.env.DEV,
  draft: INITIAL,
  setDraft: () => {},
  result: null,
  setResult: () => {},
  resultName: "",
  setResultName: () => {},
});
export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [readingInput, setReadingInput] = useState<ChartRequest | null>(null);
  const [ready, setReady] = useState(!import.meta.env.DEV);
  const [draft, setDraft] = useState(INITIAL),
    [result, setResult] = useState<ChartResult | null>(null),
    [resultName, setResultName] = useState("");
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const controller = new AbortController();
    void (async () => {
      try {
        const response = await fetch("/__local/birth-data", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (response.status === 200) {
          const draft = birthDraftSchema.parse(await response.json());
          if (!controller.signal.aborted) setDraft(draft);
        } else if (response.status !== 204)
          console.warn("Local birth prefill could not be loaded.");
      } catch (error) {
        if (!controller.signal.aborted)
          console.warn("Local birth prefill could not be loaded.", error);
      } finally {
        if (!controller.signal.aborted) setReady(true);
      }
    })();
    return () => controller.abort();
  }, []);
  return (
    <Context.Provider
      value={{
        ready,
        draft,
        setDraft,
        result,
        setResult,
        resultName,
        setResultName,
        readingInput,
        setReadingInput,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export const useWorkspace = () => useContext(Context);
