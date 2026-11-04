import { getPassage, type Passage } from "../data/passages";
import { useStore } from "./useStore";

/** The passage the whole site is currently showing: a sample, or the visitor's basic-mode preview. */
export function useActivePassage(): Passage {
  const id = useStore((s) => s.passageId);
  const custom = useStore((s) => s.custom);
  return custom ?? getPassage(id);
}
