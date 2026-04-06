import { useState } from "react";
import { useGoal } from "@/hooks/useGoal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Flame, CalendarDays } from "lucide-react";
import { motion } from "framer-motion";

export default function Setup() {
  const { setGoal } = useGoal();
  const [goal, setGoalInput] = useState("");

  const today = new Date();
  const defaultDate = new Date(today);
  defaultDate.setDate(defaultDate.getDate() + 7);
  const formatDateForInput = (d: Date) => d.toISOString().slice(0, 16);

  const [deadline, setDeadline] = useState(formatDateForInput(defaultDate));

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim() || !deadline) return;
    const deadlineTs = new Date(deadline).getTime();
    if (deadlineTs <= Date.now()) return;
    setGoal(goal.trim(), deadlineTs);
  };

  const isValid = goal.trim() && deadline && new Date(deadline).getTime() > Date.now();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 max-w-3xl mx-auto">
      <div className="w-full space-y-12">
        <motion.div
          className="space-y-4 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-4">
            <Flame className="w-12 h-12 text-primary animate-pulse" />
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight uppercase text-transparent bg-clip-text bg-gradient-to-br from-white to-white/60">
            你要去做什么？
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground font-bold tracking-widest">
            输入这件事，按下开战！
          </p>
        </motion.div>

        <motion.form
          onSubmit={handleStart}
          className="space-y-8 w-full max-w-xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        >
          <div className="space-y-6">
            <Input
              type="text"
              value={goal}
              onChange={(e) => setGoalInput(e.target.value)}
              placeholder="例如：完成产品原型的设计"
              className="text-2xl md:text-3xl p-8 h-auto bg-black/50 border-2 border-primary/30 focus-visible:border-primary focus-visible:ring-primary/50 rounded-xl text-center placeholder:text-muted-foreground/50 transition-all font-bold"
              data-testid="input-goal"
              required
            />

            <div className="flex items-center justify-center gap-4">
              <CalendarDays className="w-6 h-6 text-muted-foreground flex-shrink-0" />
              <div className="flex flex-col gap-1 bg-black/50 border-2 border-border rounded-xl p-3 px-5 focus-within:border-primary/50 transition-colors w-full max-w-xs">
                <span className="text-muted-foreground font-bold text-sm tracking-widest">截止日期</span>
                <input
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  min={formatDateForInput(today)}
                  className="bg-transparent text-lg font-mono text-white outline-none cursor-pointer [color-scheme:dark]"
                  data-testid="input-deadline"
                  required
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={!isValid}
            className="w-full h-auto py-6 text-3xl font-black uppercase tracking-widest bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-[0_0_40px_-10px_hsl(var(--primary))] hover:shadow-[0_0_60px_-10px_hsl(var(--primary))] transition-all disabled:opacity-50 disabled:shadow-none hover:scale-[1.02] active:scale-95"
            data-testid="button-start-war"
          >
            开战！
          </Button>
        </motion.form>
      </div>
    </div>
  );
}
