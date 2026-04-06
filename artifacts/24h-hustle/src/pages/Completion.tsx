import { useGoal } from "@/hooks/useGoal";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";

export default function Completion() {
  const { state, resetGoal } = useGoal();
  const isAbandoned = state.status === 'abandoned';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 max-w-3xl mx-auto space-y-12">
      
      <div className="text-center space-y-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="flex justify-center"
        >
          {isAbandoned ? (
            <div className="p-6 rounded-full bg-destructive/10 mb-6">
              <XCircle className="w-24 h-24 text-destructive" />
            </div>
          ) : (
            <div className="p-6 rounded-full bg-primary/10 mb-6">
              <CheckCircle className="w-24 h-24 text-primary" />
            </div>
          )}
        </motion.div>

        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white">
          {isAbandoned ? "目标已放弃" : "时间已到！"}
        </h1>
        <p className="text-2xl text-muted-foreground font-bold">
          任务: {state.goal}
        </p>
      </div>

      <div className="w-full max-w-xl space-y-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <h3 className="text-xl font-bold uppercase tracking-widest text-primary mb-6">战报总结</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-white/10">
              <span className="text-muted-foreground font-bold">总时长</span>
              <span className="font-mono text-xl text-white">
                {state.startTime && state.deadline 
                  ? `${Math.round((state.deadline - state.startTime) / (1000 * 60 * 60))} 小时`
                  : '-'}
              </span>
            </div>
            
            <div className="flex justify-between items-center pb-4 border-b border-white/10">
              <span className="text-muted-foreground font-bold">进展记录次数</span>
              <span className="font-mono text-xl text-white">{state.logs.length} 次</span>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            {state.logs.length > 0 ? (
              state.logs.map((log) => (
                <div key={log.id} className="text-white/80 bg-black/30 p-3 rounded-lg border border-white/5">
                  <span className="text-xs text-muted-foreground font-mono mr-3">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  {log.note}
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-4 italic">
                没有任何进展记录。
              </div>
            )}
          </div>
        </div>

        <Button 
          onClick={resetGoal}
          className="w-full py-8 text-2xl font-black uppercase tracking-widest bg-white text-black hover:bg-white/90 rounded-xl"
          data-testid="button-start-new"
        >
          <RotateCcw className="w-6 h-6 mr-2" />
          开始新目标
        </Button>
      </div>

    </div>
  );
}
