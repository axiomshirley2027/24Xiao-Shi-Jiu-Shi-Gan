import { useGoal } from "@/hooks/useGoal";
import Setup from "@/pages/Setup";
import MissionControl from "@/pages/MissionControl";
import Completion from "@/pages/Completion";
import { AnimatePresence, motion } from "framer-motion";

function AppContent() {
  const { state } = useGoal();

  return (
    <div className="min-h-screen w-full bg-background text-foreground overflow-hidden selection:bg-primary/30">
      <AnimatePresence mode="wait">
        {state.status === 'none' && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="min-h-screen w-full"
          >
            <Setup />
          </motion.div>
        )}
        
        {state.status === 'active' && (
          <motion.div
            key="mission"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
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
            transition={{ duration: 0.5 }}
            className="min-h-screen w-full"
          >
            <Completion />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function App() {
  return (
    <div className="dark">
      <AppContent />
    </div>
  );
}

export default App;
