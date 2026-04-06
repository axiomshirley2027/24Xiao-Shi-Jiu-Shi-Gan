import { useState, useEffect, useRef } from "react";
import { useGoalCtx } from "@/hooks/useGoal";
import { useCountdown } from "@/hooks/useCountdown";
import { useLangCtx } from "@/context/LangContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { Target, Plus, CheckCircle2, Flag, Zap, Languages } from "lucide-react";

const QUOTES_EN = [
  "Your couch is not going anywhere. The deadline is.",
  "Sleep is for people who've already finished.",
  "Your future self is watching. Don't disappoint them.",
  "The Wi-Fi will still be there after you finish. Probably.",
  "Plot twist: you actually do it this time.",
  "Stop reading motivational quotes and go DO THE THING.",
  "Caffeine is optional. Effort is not.",
  "One day you'll tell this story. Make it interesting.",
  "The best time to start was yesterday. The second best is now.",
  "Your competition isn't taking a break. (Neither is the clock.)",
  "Every hour you waste is an hour you can't get back. No pressure though.",
  "Done is better than perfect. Perfect is never done.",
  "You didn't come this far to only come this far.",
  "Imagine how good it'll feel when you're done. Go get that feeling.",
  "The only bad workout is the one that didn't happen. Same rule applies here.",
];

const QUOTES_ZH = [
  "你的沙发不会消失，但截止日期会到来。",
  "睡觉是留给做完的人的。",
  "你未来的自己正在看着你。别让他失望。",
  "做完之后Wi-Fi还在，放心。",
  "反转剧情：这次你真的做到了。",
  "别看激励语录了，去做那件事！",
  "咖啡因是可选的，但努力不是。",
  "有一天你会讲这个故事。让它精彩一些。",
  "开始的最佳时机是昨天，第二好的时机是现在。",
  "你的竞争对手没有休息。时钟也没有。",
  "每浪费一小时，就少一小时。没压力。",
  "完成比完美更重要。完美永远做不完。",
  "你不是走到这里只是为了走到这里的。",
  "想象一下做完时的感觉。去拿那种感觉。",
  "唯一不好的锻炼是没发生的那次。这里也一样。",
];

function formatNum(n: number) {
  return n.toString().padStart(2, "0");
}

function CountdownBlock({ value, label, isLow }: { value: number; label: string; isLow: boolean }) {
  const prev = useRef(value);
  const [bouncing, setBouncing] = useState(false);

  useEffect(() => {
    if (prev.current !== value) {
      setBouncing(true);
      prev.current = value;
      const t = setTimeout(() => setBouncing(false), 300);
      return () => clearTimeout(t);
    }
  }, [value]);

  return (
    <div className="flex flex-col items-center">
      <div
        className={`
          px-4 py-3 rounded-2xl font-black font-mono text-5xl md:text-7xl tabular-nums
          shadow-sm transition-all duration-300 select-none
          ${bouncing ? 'scale-105' : 'scale-100'}
          ${isLow
            ? 'bg-destructive/10 text-destructive border-2 border-destructive/25'
            : 'bg-white border-2 border-border/50 text-foreground'}
        `}
      >
        {formatNum(value)}
      </div>
      <span className={`text-xs font-bold uppercase tracking-widest mt-2 ${isLow ? 'text-destructive' : 'text-muted-foreground'}`}>
        {label}
      </span>
    </div>
  );
}

export default function MissionControl() {
  const { state, addLog, completeGoal } = useGoalCtx();
  const { lang, toggle, t } = useLangCtx();
  const { days, hours, minutes, seconds, progressPercent, isLowTime, isExpired } = useCountdown(state.startTime, state.deadline);

  const quotes = lang === 'zh' ? QUOTES_ZH : QUOTES_EN;
  const [quoteIndex, setQuoteIndex] = useState(() => Math.floor(Math.random() * quotes.length));
  const [newLogText, setNewLogText] = useState("");
  const [isLogging, setIsLogging] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [quotes.length]);

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

  const remainingPct = Math.max(0, 100 - progressPercent);

  const timeLabels = lang === 'zh'
    ? ['天', '时', '分', '秒']
    : ['days', 'hrs', 'min', 'sec'];

  return (
    <div className="min-h-screen relative pb-24">

      {/* Top progress stripe */}
      <div className="h-1.5 w-full bg-border/40">
        <motion.div
          className={`h-full transition-colors duration-1000 ${isLowTime ? 'bg-destructive' : 'bg-primary'}`}
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.8 }}
        />
      </div>

      {/* Decorative blobs */}
      <div className="absolute top-10 right-0 w-80 h-80 bg-primary/8 rounded-full blur-3xl pointer-events-none translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/15 rounded-full blur-3xl pointer-events-none -translate-x-1/4" />

      <main className="max-w-2xl mx-auto px-4 md:px-6 py-8 space-y-8 relative z-10">

        {/* Top bar */}
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${
            isLowTime
              ? 'bg-destructive/10 text-destructive border-destructive/25'
              : 'bg-primary/10 text-primary border-primary/20'
          }`}>
            <Zap className="w-3.5 h-3.5" />
            {isLowTime ? t("CRUNCH TIME!", "紧急时刻！") : t("Mission Active", "任务进行中")}
          </div>

          <button
            onClick={toggle}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-border text-xs font-bold text-muted-foreground hover:text-foreground transition-colors shadow-xs"
            data-testid="button-lang-toggle-mission"
          >
            <Languages className="w-3.5 h-3.5" />
            {lang === 'en' ? '中文' : 'English'}
          </button>
        </div>

        {/* Goal display */}
        <div className="bg-white rounded-3xl p-6 border border-border/50 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <Target className="w-4 h-4 text-primary" />
            {t("Your Mission", "你的任务")}
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-foreground leading-snug break-words">
            {state.goal}
          </h2>
        </div>

        {/* Countdown */}
        <div className="bg-white rounded-3xl p-6 border border-border/50 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
              {t("Time Left", "剩余时间")}
            </span>
            <span className={`text-sm font-black ${isLowTime ? 'text-destructive animate-pulse' : 'text-primary'}`}>
              {remainingPct.toFixed(1)}% {t("remaining", "剩余")}
            </span>
          </div>

          <div className="flex items-start justify-center gap-3 md:gap-5">
            {days > 0 && (
              <>
                <CountdownBlock value={days} label={timeLabels[0]} isLow={isLowTime} />
                <span className="text-4xl md:text-6xl font-black text-muted-foreground/30 mt-1">:</span>
              </>
            )}
            <CountdownBlock value={hours} label={timeLabels[1]} isLow={isLowTime} />
            <span className="text-4xl md:text-6xl font-black text-muted-foreground/30 mt-1">:</span>
            <CountdownBlock value={minutes} label={timeLabels[2]} isLow={isLowTime} />
            <span className="text-4xl md:text-6xl font-black text-muted-foreground/30 mt-1">:</span>
            <CountdownBlock value={seconds} label={timeLabels[3]} isLow={isLowTime} />
          </div>

          {/* Progress bar */}
          <div className="h-2.5 w-full rounded-full bg-border/40 overflow-hidden">
            <motion.div
              className={`h-full rounded-full transition-colors duration-500 ${isLowTime ? 'bg-destructive' : 'bg-primary'}`}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Motivational quote */}
        <div className="bg-accent/20 border border-accent/40 rounded-3xl px-6 py-5 min-h-[80px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={`${quoteIndex}-${lang}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.4 }}
              className="text-base md:text-lg font-bold text-center text-accent-foreground leading-relaxed"
            >
              {quotes[quoteIndex % quotes.length]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Progress log */}
        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {state.logs.map((log) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3 p-4 rounded-2xl bg-white border border-border/50 shadow-xs"
              >
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">{log.note}</p>
                  <span className="text-xs font-mono text-muted-foreground">
                    {new Date(log.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {!isLogging ? (
            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              <Button
                onClick={() => setIsLogging(true)}
                variant="outline"
                className="w-full py-6 text-base font-bold border-2 border-dashed border-primary/30 hover:border-primary hover:bg-primary/5 rounded-2xl text-muted-foreground hover:text-primary transition-all"
                data-testid="button-add-progress"
              >
                <Plus className="w-5 h-5 mr-2" />
                {t("Log a win! (even small ones count)", "记录进展！（小进步也算）")}
              </Button>
            </motion.div>
          ) : (
            <motion.form
              onSubmit={handleAddLog}
              className="flex gap-2"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Input
                autoFocus
                value={newLogText}
                onChange={(e) => setNewLogText(e.target.value)}
                placeholder={t("What did you just accomplish?", "你刚刚完成了什么？")}
                className="flex-1 text-base py-5 bg-white border-2 border-primary/30 focus-visible:border-primary rounded-2xl font-semibold"
                data-testid="input-progress-note"
              />
              <Button type="submit" className="py-5 px-6 rounded-2xl font-bold" disabled={!newLogText.trim()}>
                {t("Add", "提交")}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setIsLogging(false)} className="py-5 rounded-2xl">
                {t("Nope", "取消")}
              </Button>
            </motion.form>
          )}
        </div>

      </main>

      {/* Fixed footer with abandon */}
      <div className="fixed bottom-0 left-0 w-full flex justify-center p-4 bg-gradient-to-t from-background via-background/90 to-transparent">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/8 rounded-full font-bold text-sm"
              data-testid="button-abandon-goal"
            >
              <Flag className="w-4 h-4 mr-1.5" />
              {t("Give up (we won't judge... much)", "放弃（我们不会评判你……太多）")}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-white rounded-3xl border border-border/60 shadow-xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl font-black text-foreground">
                {t("Really? You're quitting?", "真的要放弃吗？")}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-base text-muted-foreground font-medium leading-relaxed">
                {t(
                  "Your future self called. They're disappointed. Also your mom. But hey — it's your choice.",
                  "你未来的自己打来电话了。他很失望。你妈妈也是。但是——这是你的选择。"
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2">
              <AlertDialogCancel className="rounded-2xl font-bold border-border/60 hover:bg-background">
                {t("Wait, I'm back!", "等等，我回来了！")}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => completeGoal(true)}
                className="bg-destructive hover:bg-destructive/90 text-white font-bold rounded-2xl"
                data-testid="button-confirm-abandon"
              >
                {t("Yeah, I quit.", "算了，我放弃。")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
