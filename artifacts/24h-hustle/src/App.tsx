import { useGoal, GoalContext } from "@/hooks/useGoal";
import { useLang } from "@/hooks/useLang";
import { LangContext } from "@/context/LangContext";
import Setup from "@/pages/Setup";
import MissionControl from "@/pages/MissionControl";
import Completion from "@/pages/Completion";
import { AnimatePresence, motion } from "framer-motion";

function App() {
  const goal = useGoal();
  const langUtils = useLang();
  const { state } = goal;

  return (
    <GoalContext.Provider value={goal}>
      <LangContext.Provider value={langUtils}>
        <div className="min-h-screen w-full bg-background text-foreground overflow-hidden selection:bg-primary/20">
          <AnimatePresence mode="wait">
            {(state.status === 'none' || state.status === 'editing') && (
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
    </GoalContext.Provider>
  );
}

export default App;
