import { useState, useEffect, useRef, useCallback } from "react";
import { useGoalCtx, getDateStr, calcStreak } from "@/hooks/useGoal";
import { useCountdown } from "@/hooks/useCountdown";
import { useLangCtx } from "@/context/LangContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target, Plus, CheckCircle2, Flag, Zap, Languages, Flame, Clock,
  AlertTriangle, CalendarCheck, Pencil, MousePointerClick, Share2, X,
  Play, Pause, RotateCcw, Timer
} from "lucide-react";
import { LegalFooter } from "@/components/LegalModal";

/* ─── Quotes ─────────────────────────────────────────────────────────────── */
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

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
function formatNum(n: number) { return n.toString().padStart(2, "0"); }

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
      <div className={`px-4 py-3 rounded-2xl font-black font-mono text-5xl md:text-7xl tabular-nums shadow-sm transition-all duration-300 select-none ${bouncing ? 'scale-105' : 'scale-100'} ${isLow ? 'bg-destructive/10 text-destructive border-2 border-destructive/25' : 'bg-white border-2 border-border/50 text-foreground'}`}>
        {formatNum(value)}
      </div>
      <span className={`text-xs font-bold uppercase tracking-widest mt-2 ${isLow ? 'text-destructive' : 'text-muted-foreground'}`}>{label}</span>
    </div>
  );
}

/* ─── Checkin form ─────────────────────────────────────────────────────────── */
function CheckinForm({ defaultHours, onSubmit, onCancel, t }: {
  defaultHours?: number;
  onSubmit: (hours: number, note: string) => void;
  onCancel?: () => void;
  t: (en: string, zh: string) => string;
}) {
  const [hours, setHours] = useState(defaultHours ?? 12);
  const [note, setNote] = useState("");
  const handle = (e: React.FormEvent) => { e.preventDefault(); onSubmit(hours, note.trim()); };
  return (
    <motion.form onSubmit={handle} className="space-y-3 pt-2" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
      <div className="space-y-1">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("Hours spent today", "今天花了多少小时")}</label>
        <div className="flex items-center gap-3">
          <input type="range" min={0} max={24} step={0.5} value={hours} onChange={(e) => setHours(Number(e.target.value))} className="flex-1 accent-primary h-2 cursor-pointer" />
          <span className="font-black text-foreground text-lg w-14 text-right tabular-nums">{hours}h</span>
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground/60 px-0.5">
          <span>0h</span>
          <span className="text-primary font-bold">12h target</span>
          <span>24h</span>
        </div>
      </div>
      <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder={t("What did you work on? (optional)", "今天做了什么？（可选）")} className="bg-white border-2 border-border/60 focus-visible:border-primary rounded-xl font-medium" />
      <div className="flex gap-2">
        <Button type="submit" className="flex-1 font-bold rounded-xl">
          <CalendarCheck className="w-4 h-4 mr-1.5" />{t("Check In", "打卡")}
        </Button>
        {onCancel && <Button type="button" variant="ghost" onClick={onCancel} className="rounded-xl">{t("Cancel", "取消")}</Button>}
      </div>
    </motion.form>
  );
}

/* ─── Share card modal ─────────────────────────────────────────────────────── */
function ShareCard({ goal, streak, totalHours, daysLeft, onClose, t }: {
  goal: string; streak: number; totalHours: number; daysLeft: number; onClose: () => void;
  t: (en: string, zh: string) => string;
}) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-sm"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* The shareable card */}
        <div className="bg-gradient-to-br from-[#fff8f0] via-[#fff3e8] to-[#ffe8d6] rounded-3xl p-7 border-2 border-primary/20 shadow-2xl space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-primary/15 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <span className="font-black text-sm text-primary tracking-wide">LOCK IN</span>
            </div>
            <span className="text-xs font-bold text-muted-foreground/60">{daysLeft}d left</span>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">
              {t("I'm locked in on:", "我正在全力攻克：")}
            </p>
            <h2 className="text-2xl font-black text-foreground leading-snug">{goal}</h2>
          </div>

          <div className="flex gap-4">
            <div className="flex-1 bg-white/70 rounded-2xl p-3 text-center border border-primary/10">
              <div className="flex items-center justify-center gap-1 mb-0.5">
                <Flame className={`w-4 h-4 ${streak > 0 ? 'text-orange-500' : 'text-muted-foreground/40'}`} />
                <span className="text-xl font-black text-foreground">{streak}</span>
              </div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                {t("Day Streak", "连续天数")}
              </span>
            </div>
            <div className="flex-1 bg-white/70 rounded-2xl p-3 text-center border border-primary/10">
              <div className="flex items-center justify-center gap-1 mb-0.5">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-xl font-black text-foreground">{totalHours}h</span>
              </div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                {t("Total Hours", "累计工时")}
              </span>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground font-bold">
            {t("One thing. Full send. No excuses.", "一件事。全力以赴。不找借口。")}
          </p>
        </div>

        {/* Instructions */}
        <div className="mt-3 text-center space-y-2">
          <p className="text-white/90 text-sm font-bold">
            {t("📸 Screenshot the card above to share!", "📸 截图上面的卡片分享！")}
          </p>
          <button onClick={onClose} className="flex items-center gap-1.5 mx-auto text-white/60 text-xs font-bold hover:text-white/90 transition-colors">
            <X className="w-3.5 h-3.5" />
            {t("Close", "关闭")}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Pomodoro ─────────────────────────────────────────────────────────────── */
function PomodoroTimer({ onComplete, t }: {
  onComplete: () => void;
  t: (en: string, zh: string) => string;
}) {
  const [duration, setDuration] = useState<25 | 50>(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const completedRef = useRef(false);

  const reset = useCallback((d: 25 | 50) => {
    setRunning(false);
    setDone(false);
    completedRef.current = false;
    setSecondsLeft(d * 60);
  }, []);

  const switchMode = (d: 25 | 50) => {
    setDuration(d);
    reset(d);
  };

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          setRunning(false);
          setDone(true);
          if (!completedRef.current) {
            completedRef.current = true;
            onComplete();
            if (Notification.permission === 'granted') {
              new Notification(t('🍅 Pomodoro done!', '🍅 番茄时间结束！'), {
                body: t('Take a 5-minute break. You earned it.', '休息5分钟，你赢得了它。'),
              });
            }
          }
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, onComplete, t]);

  const pct = ((duration * 60 - secondsLeft) / (duration * 60)) * 100;
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const r = 44;
  const circ = 2 * Math.PI * r;

  return (
    <div className="space-y-4">
      {/* Mode toggle */}
      <div className="flex gap-2">
        {([25, 50] as const).map((d) => (
          <button
            key={d}
            onClick={() => switchMode(d)}
            className={`flex-1 py-1.5 text-sm font-black rounded-xl border-2 transition-all ${duration === d ? 'bg-primary/10 border-primary text-primary' : 'border-border text-muted-foreground hover:border-primary/40'}`}
          >
            {d} {t("min", "分钟")}
          </button>
        ))}
      </div>

      {/* Circle timer */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-28 h-28">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r={r} fill="none" stroke="currentColor" strokeWidth="8" className="text-border/30" />
            <circle
              cx="50" cy="50" r={r} fill="none"
              stroke="currentColor" strokeWidth="8"
              strokeLinecap="round"
              className={done ? 'text-green-500' : running ? 'text-primary' : 'text-primary/40'}
              strokeDasharray={circ}
              strokeDashoffset={circ * (1 - pct / 100)}
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {done
              ? <span className="text-2xl">🍅</span>
              : <span className="text-2xl font-black font-mono text-foreground tabular-nums">{formatNum(mins)}:{formatNum(secs)}</span>
            }
          </div>
        </div>

        <div className="flex gap-2">
          {!done && (
            <Button
              size="sm"
              onClick={() => setRunning((r) => !r)}
              className="rounded-xl font-bold px-6"
              variant={running ? "outline" : "default"}
            >
              {running ? <><Pause className="w-4 h-4 mr-1" />{t("Pause", "暂停")}</> : <><Play className="w-4 h-4 mr-1" />{t("Start", "开始")}</>}
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={() => reset(duration)} className="rounded-xl">
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        {done && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm font-black text-green-600 text-center">
            {t("Session complete! Take a break.", "完成！休息一下。")}
          </motion.p>
        )}
      </div>
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────────────────── */
export default function MissionControl() {
  const { state, addLog, addCheckin, addDistraction, incrementPomodoro, completeGoal, resetGoal, editGoal } = useGoalCtx();
  const { lang, toggle, t } = useLangCtx();
  const { days, hours, minutes, seconds, progressPercent, isLowTime, isExpired } = useCountdown(state.startTime, state.deadline);

  const quotes = lang === 'zh' ? QUOTES_ZH : QUOTES_EN;
  const [quoteIndex, setQuoteIndex] = useState(() => Math.floor(Math.random() * quotes.length));
  const [newLogText, setNewLogText] = useState("");
  const [isLogging, setIsLogging] = useState(false);
  const [showCheckinForm, setShowCheckinForm] = useState(false);
  const [showShareCard, setShowShareCard] = useState(false);
  const [distractionBounce, setDistractionBounce] = useState(false);

  /* rotating quotes */
  useEffect(() => {
    const interval = setInterval(() => setQuoteIndex((p) => (p + 1) % quotes.length), 10000);
    return () => clearInterval(interval);
  }, [quotes.length]);

  /* auto-complete on expiry */
  const prevExpired = useRef(isExpired);
  useEffect(() => {
    if (isExpired && !prevExpired.current && state.status === 'active') completeGoal(false);
    prevExpired.current = isExpired;
  }, [isExpired, state.status, completeGoal]);

  /* browser notifications — check all reminder times */
  useEffect(() => {
    if (!state.reminderTimes?.length || Notification.permission !== 'granted') return;
    const check = () => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const todayStr = getDateStr(now);
      const notifiedKey = `24h_hustle_notified_${todayStr}`;
      const notifiedToday: string[] = JSON.parse(localStorage.getItem(notifiedKey) ?? '[]');

      for (const rt of state.reminderTimes) {
        if (currentTime === rt && !notifiedToday.includes(rt)) {
          notifiedToday.push(rt);
          localStorage.setItem(notifiedKey, JSON.stringify(notifiedToday));
          const todayCheckin = state.checkins.find((c) => c.date === todayStr);
          const body = todayCheckin
            ? t(`You've logged ${todayCheckin.hours}h today. Keep pushing!`, `今天已记录${todayCheckin.hours}小时，继续加油！`)
            : t(`Time to check in! Goal: "${state.goal}"`, `打卡时间到！目标：「${state.goal}」`);
          new Notification(t('⚡ Lock In Reminder', '⚡ 打卡提醒'), { body });
        }
      }
    };
    const id = setInterval(check, 60000);
    check();
    return () => clearInterval(id);
  }, [state.reminderTimes, state.goal, state.checkins, t]);

  /* check-in helpers */
  const todayStr = getDateStr(new Date());
  const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getDateStr(yesterday);
  const todayCheckin = state.checkins.find((c) => c.date === todayStr);
  const yesterdayCheckin = state.checkins.find((c) => c.date === yesterdayStr);
  const goalStartDay = state.startTime ? getDateStr(new Date(state.startTime)) : todayStr;
  const goalStartedBeforeYesterday = goalStartDay < yesterdayStr;
  const yesterdayMissed = goalStartedBeforeYesterday && (!yesterdayCheckin || yesterdayCheckin.hours < 12);
  const yesterdayShortfall = yesterdayCheckin ? Math.max(0, 12 - yesterdayCheckin.hours) : 12;
  const streak = calcStreak(state.checkins);
  const totalHours = state.checkins.reduce((sum, c) => sum + c.hours, 0);

  /* log form */
  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLogText.trim()) return;
    addLog(newLogText.trim());
    setNewLogText("");
    setIsLogging(false);
  };

  /* distraction */
  const handleDistraction = () => {
    addDistraction();
    setDistractionBounce(true);
    setTimeout(() => setDistractionBounce(false), 400);
  };

  const remainingPct = Math.max(0, 100 - progressPercent);
  const daysLeft = state.deadline ? Math.max(0, Math.ceil((state.deadline - Date.now()) / 86400000)) : 0;
  const timeLabels = lang === 'zh' ? ['天', '时', '分', '秒'] : ['days', 'hrs', 'min', 'sec'];

  return (
    <div className="min-h-screen relative pb-24">

      {/* Top progress stripe */}
      <div className="h-1.5 w-full bg-border/40">
        <motion.div className={`h-full transition-colors duration-1000 ${isLowTime ? 'bg-destructive' : 'bg-primary'}`} initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} transition={{ duration: 0.8 }} />
      </div>

      {/* Stake banner */}
      <AnimatePresence>
        {state.stake && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-red-600 text-white px-4 py-2.5 overflow-hidden"
          >
            <p className="text-center text-sm font-black max-w-2xl mx-auto">
              ⚠️ {t("If you quit:", "如果放弃：")} <span className="underline underline-offset-2">{state.stake}</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Blobs */}
      <div className="absolute top-10 right-0 w-80 h-80 bg-primary/8 rounded-full blur-3xl pointer-events-none translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/15 rounded-full blur-3xl pointer-events-none -translate-x-1/4" />

      <main className="max-w-2xl mx-auto px-4 md:px-6 py-8 space-y-6 relative z-10">

        {/* Top bar */}
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${isLowTime ? 'bg-destructive/10 text-destructive border-destructive/25' : 'bg-primary/10 text-primary border-primary/20'}`}>
            <Zap className="w-3.5 h-3.5" />
            {isLowTime ? t("CRUNCH TIME!", "紧急时刻！") : t("Mission Active", "任务进行中")}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowShareCard(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-border text-xs font-bold text-muted-foreground hover:text-primary transition-colors shadow-xs" title={t("Share progress", "分享进度")}>
              <Share2 className="w-3.5 h-3.5" />
              {t("Share", "分享")}
            </button>
            <button onClick={toggle} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-border text-xs font-bold text-muted-foreground hover:text-foreground transition-colors shadow-xs">
              <Languages className="w-3.5 h-3.5" />
              {lang === 'en' ? '中文' : 'English'}
            </button>
          </div>
        </div>

        {/* Goal card */}
        <div className="bg-white rounded-3xl p-6 border border-border/50 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <Target className="w-4 h-4 text-primary" />
              {t("Your Mission", "你的任务")}
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground/60 hover:text-primary transition-colors px-2 py-1 rounded-lg hover:bg-primary/5">
                  <Pencil className="w-3.5 h-3.5" />{t("Edit", "修改")}
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-white rounded-3xl border border-border/60 shadow-xl">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-xl font-black">{t("Edit goal settings?", "修改目标设置？")}</AlertDialogTitle>
                  <AlertDialogDescription className="text-base text-muted-foreground font-medium">
                    {t("Your check-ins, logs and streak are kept. Only the goal, deadline and hours estimate will change.", "打卡记录、日志和连击数会保留，只更新目标文字、截止时间和预估小时。")}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-2">
                  <AlertDialogCancel className="rounded-2xl font-bold">{t("Never mind", "算了")}</AlertDialogCancel>
                  <AlertDialogAction onClick={editGoal} className="bg-primary font-bold rounded-2xl">{t("Yes, edit it", "是，去修改")}</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-foreground leading-snug break-words">{state.goal}</h2>
          {state.deadline && (
            <p className="text-xs text-muted-foreground font-mono">
              {t("Deadline:", "截止：")} {new Date(state.deadline).toLocaleString()}
            </p>
          )}
        </div>

        {/* Countdown */}
        <div className="bg-white rounded-3xl p-6 border border-border/50 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{t("Time Left", "剩余时间")}</span>
            <span className={`text-sm font-black ${isLowTime ? 'text-destructive animate-pulse' : 'text-primary'}`}>{remainingPct.toFixed(1)}% {t("remaining", "剩余")}</span>
          </div>
          <div className="flex items-start justify-center gap-3 md:gap-5">
            {days > 0 && (<><CountdownBlock value={days} label={timeLabels[0]} isLow={isLowTime} /><span className="text-4xl md:text-6xl font-black text-muted-foreground/30 mt-1">:</span></>)}
            <CountdownBlock value={hours} label={timeLabels[1]} isLow={isLowTime} />
            <span className="text-4xl md:text-6xl font-black text-muted-foreground/30 mt-1">:</span>
            <CountdownBlock value={minutes} label={timeLabels[2]} isLow={isLowTime} />
            <span className="text-4xl md:text-6xl font-black text-muted-foreground/30 mt-1">:</span>
            <CountdownBlock value={seconds} label={timeLabels[3]} isLow={isLowTime} />
          </div>
          <div className="h-2.5 w-full rounded-full bg-border/40 overflow-hidden">
            <motion.div className={`h-full rounded-full transition-colors duration-500 ${isLowTime ? 'bg-destructive' : 'bg-primary'}`} animate={{ width: `${progressPercent}%` }} transition={{ duration: 0.5 }} />
          </div>
        </div>

        {/* ── Time Budget ── */}
        {state.estimatedHours != null && (() => {
          const availableHoursLeft = daysLeft * 12;
          const donePercent = Math.min(100, Math.round((totalHours / state.estimatedHours) * 100));
          const remaining = Math.max(0, state.estimatedHours - totalHours);
          const urgent = availableHoursLeft > 0 && remaining > availableHoursLeft;
          const done = donePercent >= 100;

          return (
            <div className={`bg-white rounded-3xl p-5 border shadow-sm space-y-4 ${urgent ? 'border-red-300' : 'border-border/50'}`}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {t("Time Budget", "时间预算")}
                </span>
                {done
                  ? <span className="text-xs font-black text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">✓ {t("Goal reached!", "目标达成！")}</span>
                  : urgent
                    ? <span className="text-xs font-black text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-200 animate-pulse">⚠ {t("Behind pace!", "落后进度！")}</span>
                    : <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">{donePercent}% {t("done", "完成")}</span>
                }
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="h-3 w-full rounded-full bg-border/40 overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${done ? 'bg-green-500' : urgent ? 'bg-red-500' : 'bg-primary'}`}
                    animate={{ width: `${donePercent}%` }}
                    transition={{ duration: 0.6 }}
                  />
                </div>
                <div className="flex justify-between text-xs font-bold text-muted-foreground">
                  <span>{totalHours}h {t("logged", "已打卡")}</span>
                  <span>{state.estimatedHours}h {t("estimated", "预估")}</span>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-background rounded-2xl py-3 px-2 border border-border/40">
                  <div className="text-xl font-black tabular-nums">{remaining > 0 ? remaining.toFixed(1) : 0}</div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-0.5">{t("hrs left", "剩余小时")}</div>
                </div>
                <div className={`rounded-2xl py-3 px-2 border ${urgent ? 'bg-red-50 border-red-200' : 'bg-background border-border/40'}`}>
                  <div className={`text-xl font-black tabular-nums ${urgent ? 'text-red-600' : ''}`}>{availableHoursLeft}</div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-0.5">{t("hrs available", "可用小时")}</div>
                </div>
                <div className="bg-background rounded-2xl py-3 px-2 border border-border/40">
                  <div className="text-xl font-black tabular-nums">{daysLeft > 0 && remaining > 0 ? (remaining / daysLeft).toFixed(1) : '—'}</div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-0.5">{t("hrs/day needed", "每天需投入")}</div>
                </div>
              </div>

              {urgent && !done && (
                <p className="text-xs font-bold text-red-600 text-center">
                  {t(
                    `You need ${remaining.toFixed(1)}h more but only have ${availableHoursLeft}h left. Time to hustle harder.`,
                    `还需 ${remaining.toFixed(1)} 小时，但只剩 ${availableHoursLeft} 小时可用。要加速了！`
                  )}
                </p>
              )}
            </div>
          );
        })()}

        {/* ── Daily check-in ── */}
        <div className="bg-white rounded-3xl border border-border/50 shadow-sm overflow-hidden">
          <div className="flex divide-x divide-border/40">
            <div className="flex-1 flex flex-col items-center py-4 gap-1">
              <div className="flex items-center gap-1.5">
                <Flame className={`w-5 h-5 ${streak > 0 ? 'text-orange-500' : 'text-muted-foreground/40'}`} />
                <span className="text-2xl font-black tabular-nums">{streak}</span>
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{t("Streak", "连续")}</span>
            </div>
            <div className="flex-1 flex flex-col items-center py-4 gap-1">
              <div className="flex items-center gap-1.5">
                <Clock className="w-5 h-5 text-primary" />
                <span className="text-2xl font-black tabular-nums">{totalHours}</span>
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{t("Hours", "总时长")}</span>
            </div>
            <div className="flex-1 flex flex-col items-center py-4 gap-1">
              <div className="flex items-center gap-1.5">
                <CalendarCheck className={`w-5 h-5 ${todayCheckin ? 'text-green-500' : 'text-muted-foreground/40'}`} />
                <span className="text-2xl font-black tabular-nums">{todayCheckin ? `${todayCheckin.hours}h` : '--'}</span>
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{t("Today", "今日")}</span>
            </div>
          </div>

          <AnimatePresence>
            {yesterdayMissed && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mx-4 mb-3 mt-1 bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-3 items-start">
                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-black text-red-700">
                    {yesterdayCheckin ? t(`Yesterday: only ${yesterdayCheckin.hours}h / 12h`, `昨天只干了${yesterdayCheckin.hours}小时`) : t("Yesterday: no check-in", "昨天没有打卡")}
                  </p>
                  <p className="text-xs text-red-500 font-medium">{t(`Owe ${yesterdayShortfall}h — make today count double.`, `欠了${yesterdayShortfall}小时，今天补回来！`)}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="px-4 pb-4">
            <AnimatePresence mode="wait">
              {todayCheckin && !showCheckinForm ? (
                <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between bg-green-50 border border-green-200 rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="font-black text-green-800 text-sm">{t(`Today: ${todayCheckin.hours}h logged`, `今天已打卡：${todayCheckin.hours}小时`)}</p>
                      {todayCheckin.note && <p className="text-xs text-green-600 mt-0.5">{todayCheckin.note}</p>}
                    </div>
                  </div>
                  <button onClick={() => setShowCheckinForm(true)} className="text-xs text-green-600 underline font-bold hover:text-green-800">{t("Edit", "修改")}</button>
                </motion.div>
              ) : !showCheckinForm ? (
                <motion.button key="cta" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setShowCheckinForm(true)} className="w-full py-4 text-base font-black border-2 border-dashed border-primary/30 hover:border-primary hover:bg-primary/5 rounded-2xl text-muted-foreground hover:text-primary transition-all flex items-center justify-center gap-2" data-testid="button-checkin">
                  <CalendarCheck className="w-5 h-5" />{t("Check in today's hours", "打卡今日工时")}
                </motion.button>
              ) : (
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <CheckinForm defaultHours={todayCheckin?.hours ?? 12} onSubmit={(h, note) => { addCheckin(todayStr, h, note || undefined); setShowCheckinForm(false); }} onCancel={() => setShowCheckinForm(false)} t={t} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Distraction counter + Pomodoro row ── */}
        <div className="grid grid-cols-2 gap-4">
          {/* Distraction counter */}
          <div className="bg-white rounded-3xl border border-border/50 shadow-sm p-5 flex flex-col items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <MousePointerClick className="w-4 h-4" />
              {t("Distractions", "分心次数")}
            </div>
            <motion.div
              animate={distractionBounce ? { scale: [1, 1.3, 0.9, 1.1, 1] } : {}}
              transition={{ duration: 0.4 }}
              className="text-5xl font-black text-foreground tabular-nums"
            >
              {state.distractionCount}
            </motion.div>
            <Button
              onClick={handleDistraction}
              variant="outline"
              size="sm"
              className="w-full font-bold rounded-xl border-2 border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300"
              data-testid="button-distraction"
            >
              {t("I got distracted", "我走神了")}
            </Button>
          </div>

          {/* Pomodoro */}
          <div className="bg-white rounded-3xl border border-border/50 shadow-sm p-5">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
              <Timer className="w-4 h-4" />
              {t("Focus Timer", "番茄钟")} {state.pomodoroCount > 0 && <span className="ml-auto text-primary">×{state.pomodoroCount}</span>}
            </div>
            <PomodoroTimer onComplete={incrementPomodoro} t={t} />
          </div>
        </div>

        {/* Quote */}
        <div className="bg-accent/20 border border-accent/40 rounded-3xl px-6 py-5 min-h-[80px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p key={`${quoteIndex}-${lang}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.4 }} className="text-base md:text-lg font-bold text-center text-accent-foreground leading-relaxed">
              {quotes[quoteIndex % quotes.length]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Progress log */}
        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {state.logs.map((log) => (
              <motion.div key={log.id} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-3 p-4 rounded-2xl bg-white border border-border/50 shadow-xs">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">{log.note}</p>
                  <span className="text-xs font-mono text-muted-foreground">{new Date(log.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {!isLogging ? (
            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              <Button onClick={() => setIsLogging(true)} variant="outline" className="w-full py-6 text-base font-bold border-2 border-dashed border-primary/30 hover:border-primary hover:bg-primary/5 rounded-2xl text-muted-foreground hover:text-primary transition-all" data-testid="button-add-progress">
                <Plus className="w-5 h-5 mr-2" />{t("Log a win! (even small ones count)", "记录进展！（小进步也算）")}
              </Button>
            </motion.div>
          ) : (
            <motion.form onSubmit={handleAddLog} className="flex gap-2" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
              <Input autoFocus value={newLogText} onChange={(e) => setNewLogText(e.target.value)} placeholder={t("What did you just accomplish?", "你刚刚完成了什么？")} className="flex-1 text-base py-5 bg-white border-2 border-primary/30 focus-visible:border-primary rounded-2xl font-semibold" data-testid="input-progress-note" />
              <Button type="submit" className="py-5 px-6 rounded-2xl font-bold" disabled={!newLogText.trim()}>{t("Add", "提交")}</Button>
              <Button type="button" variant="ghost" onClick={() => setIsLogging(false)} className="py-5 rounded-2xl">{t("Nope", "取消")}</Button>
            </motion.form>
          )}
        </div>

        <LegalFooter />
      </main>

      {/* Fixed footer — abandon */}
      <div className="fixed bottom-0 left-0 w-full flex justify-center p-4 bg-gradient-to-t from-background via-background/90 to-transparent">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" className="text-muted-foreground hover:text-destructive hover:bg-destructive/8 rounded-full font-bold text-sm" data-testid="button-abandon-goal">
              <Flag className="w-4 h-4 mr-1.5" />{t("Give up (we won't judge... much)", "放弃（我们不会评判你……太多）")}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-white rounded-3xl border border-border/60 shadow-xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl font-black">{t("Really? You're quitting?", "真的要放弃吗？")}</AlertDialogTitle>
              <AlertDialogDescription className="text-base text-muted-foreground font-medium leading-relaxed">
                {state.stake
                  ? t(`Don't forget: you said if you quit, you'd "${state.stake}". Still quitting?`, `别忘了：你说过放弃的话要「${state.stake}」。还要放弃？`)
                  : t("Your future self called. They're disappointed. Also your mom. But hey — it's your choice.", "你未来的自己打来电话了。他很失望。你妈妈也是。但——这是你的选择。")
                }
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2">
              <AlertDialogCancel className="rounded-2xl font-bold">{t("Wait, I'm back!", "等等，我回来了！")}</AlertDialogCancel>
              <AlertDialogAction onClick={() => completeGoal(true)} className="bg-destructive hover:bg-destructive/90 text-white font-bold rounded-2xl" data-testid="button-confirm-abandon">
                {t("Yeah, I quit.", "算了，我放弃。")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Share card overlay */}
      <AnimatePresence>
        {showShareCard && (
          <ShareCard
            goal={state.goal ?? ''}
            streak={streak}
            totalHours={totalHours}
            daysLeft={daysLeft}
            onClose={() => setShowShareCard(false)}
            t={t}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
