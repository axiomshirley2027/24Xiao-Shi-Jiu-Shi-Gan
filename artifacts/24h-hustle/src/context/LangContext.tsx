import { createContext, useContext } from "react";
import type { Lang } from "@/hooks/useLang";

export interface LangCtxValue {
  lang: Lang;
  toggle: () => void;
  t: (en: string, zh: string) => string;
}

export const LangContext = createContext<LangCtxValue>({
  lang: 'en',
  toggle: () => {},
  t: (en) => en,
});

export function useLangCtx() {
  return useContext(LangContext);
}
