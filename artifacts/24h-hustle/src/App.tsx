import { createContext, useContext } from "react";
import { useGoal } from "@/hooks/useGoal";
import { useLang, type Lang } from "@/hooks/useLang";
import Setup from "@/pages/Setup";
import MissionControl from "@/pages/MissionControl";
import Completion from "@/pages/Completion";
import { AnimatePresence, motion } from "framer-motion";

interface LangCtx {
  lang: Lang;
  toggle: () => void;
  t: (en: string, zh: string) => string;
}

export const LangContext = createContext<LangCtx>({
  lang: 'en',
  toggle: () => {},
  t: (en) => en,
});

export function useLangCtx() {
  return useContext(LangContext);
}

function AppContent() {
  const { state } = useGoal();
  const langUtils = useLang();

  return (
    <LangContext.Provider value={langUtils}>
      <div className="min-h-screen w-full bg-background text-foreground overflow-hidden selection:bg-primary/20">
        <AnimatePresence mode="wait">
          {state.status === 'none' && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16, scale: 0.97 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="min-h-screen w-full"
            >
              <Setup />
            </motion.div>
          )}

          {state.status === 'active' && (
            <motion.div
              key="mission"
              initial={{ opacity: 0, scale: 1.03 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="min-h-screen w-full"
            >
              <MissionControl />
            </motion.div>
          )}

          {(state.status === 'completed' || state.status === 'abandoned') && (
            <motion.div
              key="completion"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="min-h-screen w-full"
            >
              <Completion />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </LangContext.Provider>
  );
}

function App() {
  return <AppContent />;
}

export default App;
