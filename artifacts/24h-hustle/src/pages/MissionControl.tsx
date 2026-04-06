import { useState, useEffect, useRef } from "react";
import { useGoal } from "@/hooks/useGoal";
import { useCountdown } from "@/hooks/useCountdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { Target, Flag, Plus, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const MOTIVATIONAL_QUOTES = [
  "睡觉是留给成功之后的事！",
  "别人在睡觉，你在超越他们！",
  "停下来的那一刻，你就输了！",
  "现在放弃，一生遗憾！",
  "全力以赴，不留遗憾！",
  "你不逼自己，没人会帮你！",
  "每一秒都在决定你的结果！",
  "只要还没到截止日期，战斗就没结束！",
  "100%的专注，0%的借口！",
  "成功不会来找你，你要去找它！",
  "汗水换荣耀，努力终有回报！",
  "当你想放弃时，想想你为什么开始！",
  "时间不等人，行动起来！",
  "你的梦想在等你去追！"
];

function formatNumber(num: number) {
  return num.toString().padStart(2, "0");
}

function Digit({ value, label, isLowTime }: { value: number; label: string, isLowTime: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <div className={`text-6xl md:text-9xl font-black font-mono tracking-tighter tabular-nums ${isLowTime ? 'glow-text-intense' : 'glow-text text-white'}`}>
        {formatNumber(value)}
      </div>
      <span className={`text-sm md:text-xl font-bold uppercase tracking-widest mt-2 ${isLowTime ? 'text-destructive' : 'text-primary'}`}>
        {label}
      </span>
    </div>
  );
}

export default function MissionControl() {
  const { state, addLog, completeGoal } = useGoal();
  const { days, hours, minutes, seconds, progressPercent, isLowTime, isExpired } = useCountdown(state.startTime, state.deadline);
  
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [newLogText, setNewLogText] = useState("");
  const [isLogging, setIsLogging] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Watch for expiration
  const prevExpired = useRef(isExpired);
  useEffect(() => {
    if (isExpired && !prevExpired.current && state.status === 'active') {
      completeGoal(false);
    }
    prevExpired.current = isExpired;
  }, [isExpired, state.status, completeGoal]);

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLogText.trim()) return;
    addLog(newLogText.trim());
    setNewLogText("");
    setIsLogging(false);
  };

  const remainingPercent = Math.max(0, 100 - progressPercent);

  return (
    <div className={`min-h-screen flex flex-col relative transition-colors duration-1000 ${isLowTime ? 'bg-destructive/10' : ''}`}>
      {/* Background intensity indicator */}
      <div 
        className="absolute top-0 left-0 h-1 bg-primary transition-all duration-1000 ease-linear z-50"
        style={{ width: `${progressPercent}%`, backgroundColor: isLowTime ? 'hsl(var(--destructive))' : 'hsl(var(--primary))' }}
      />
      
      <main className="flex-1 flex flex-col items-center w-full max-w-5xl mx-auto p-4 md:p-8 space-y-12">
        
        {/* Goal Header */}
        <div className="w-full text-center mt-8 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm font-bold tracking-widest uppercase text-muted-foreground">
            <Target className="w-4 h-4 text-primary" />
            当前作战目标
          </div>
          <h2 className="text-4xl md:text-6xl font-black leading-tight text-white tracking-tight break-words">
            {state.goal}
          </h2>
        </div>

        {/* Massive Timer */}
        <div className="w-full flex justify-center items-center gap-4 md:gap-8">
          {days > 0 && (
            <>
              <Digit value={days} label="天" isLowTime={isLowTime} />
              <div className={`text-6xl md:text-9xl font-black ${isLowTime ? 'text-destructive' : 'text-white/20'}`}>:</div>
            </>
          )}
          <Digit value={hours} label="时" isLowTime={isLowTime} />
          <div className={`text-6xl md:text-9xl font-black pb-8 md:pb-12 ${isLowTime ? 'text-destructive' : 'text-white/20'}`}>:</div>
          <Digit value={minutes} label="分" isLowTime={isLowTime} />
          <div className={`text-6xl md:text-9xl font-black pb-8 md:pb-12 ${isLowTime ? 'text-destructive' : 'text-white/20'}`}>:</div>
          <Digit value={seconds} label="秒" isLowTime={isLowTime} />
        </div>

        {/* Urgency Meter */}
        <div className="w-full max-w-2xl space-y-2">
          <div className="flex justify-between text-sm font-bold uppercase tracking-widest text-muted-foreground">
            <span>时间已流逝 {progressPercent.toFixed(1)}%</span>
            <span className={isLowTime ? 'text-destructive animate-pulse' : 'text-primary'}>
              还剩 {remainingPercent.toFixed(1)}% 的时间
            </span>
          </div>
          <Progress 
            value={progressPercent} 
            className="h-4 bg-white/5" 
            indicatorClassName={isLowTime ? 'bg-destructive' : 'bg-primary'}
          />
        </div>

        {/* Rotating Quote */}
        <div className="h-16 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={quoteIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              className="text-2xl md:text-3xl font-black text-center text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70"
            >
              "{MOTIVATIONAL_QUOTES[quoteIndex]}"
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Action Area */}
        <div className="w-full max-w-2xl space-y-8 pb-20">
          {!isLogging ? (
            <Button 
              onClick={() => setIsLogging(true)}
              className="w-full py-8 text-xl md:text-2xl font-bold bg-white/5 hover:bg-primary/20 border-2 border-dashed border-white/20 hover:border-primary text-white transition-all rounded-xl"
              data-testid="button-add-progress"
            >
              <Plus className="w-6 h-6 mr-2" />
              我刚刚完成了一些进展！
            </Button>
          ) : (
            <form onSubmit={handleAddLog} className="flex gap-2">
              <Input
                autoFocus
                value={newLogText}
                onChange={(e) => setNewLogText(e.target.value)}
                placeholder="记录你的战果..."
                className="flex-1 text-lg py-6 bg-black/50 border-primary focus-visible:ring-primary rounded-xl"
                data-testid="input-progress-note"
              />
              <Button type="submit" className="py-6 px-8 text-lg font-bold rounded-xl" disabled={!newLogText.trim()}>
                提交
              </Button>
              <Button type="button" variant="ghost" onClick={() => setIsLogging(false)} className="py-6 rounded-xl">
                取消
              </Button>
            </form>
          )}

          {/* Logs */}
          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {state.logs.map((log) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10"
                >
                  <CheckCircle2 className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-lg font-bold text-white/90">{log.note}</p>
                    <span className="text-sm font-mono text-muted-foreground">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

      </main>

      {/* Footer Actions */}
      <div className="fixed bottom-0 left-0 w-full p-4 bg-gradient-to-t from-background via-background to-transparent flex justify-center">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 uppercase tracking-widest font-bold" data-testid="button-abandon-goal">
              <Flag className="w-4 h-4 mr-2" />
              放弃这个目标
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-background border-destructive/30">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl font-black text-destructive">你确定要认输吗？</AlertDialogTitle>
              <AlertDialogDescription className="text-lg text-white/70">
                时间还在走，战争还没结束。现在放弃，前面的努力就全部白费了。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="font-bold border-white/20 hover:bg-white/10">继续战斗</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => completeGoal(true)}
                className="bg-destructive hover:bg-destructive/90 text-white font-bold"
                data-testid="button-confirm-abandon"
              >
                我是懦夫，我放弃
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
