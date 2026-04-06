import { useState } from "react";
import { useGoal } from "@/hooks/useGoal";
import { useLangCtx } from "@/App";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Rocket, CalendarDays, Languages } from "lucide-react";

const FUNNY_PLACEHOLDERS_EN = [
  "Write a novel (no, seriously, this time)",
  "Finally finish that side project",
  "Learn piano before the family reunion",
  "Build a startup and retire early",
  "Get that promotion (hint: start working)",
];

const FUNNY_PLACEHOLDERS_ZH = [
  "写完那本小说（这次是认真的）",
  "终于把那个副业项目做完",
  "在聚会前学会弹钢琴",
  "创业成功提早退休",
  "拿到晋升（提示：先开始工作）",
];

export default function Setup() {
  const { setGoal } = useGoal();
  const { lang, toggle, t } = useLangCtx();
  const [goal, setGoalInput] = useState("");

  const today = new Date();
  const defaultDate = new Date(today);
  defaultDate.setDate(defaultDate.getDate() + 7);
  const formatDateForInput = (d: Date) => d.toISOString().slice(0, 16);

  const [deadline, setDeadline] = useState(formatDateForInput(defaultDate));

  const placeholders = lang === 'zh' ? FUNNY_PLACEHOLDERS_ZH : FUNNY_PLACEHOLDERS_EN;
  const placeholder = placeholders[Math.floor(Math.random() * placeholders.length)];

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim() || !deadline) return;
    const deadlineTs = new Date(deadline).getTime();
    if (deadlineTs <= Date.now()) return;
    setGoal(goal.trim(), deadlineTs);
  };

  const isValid = goal.trim() && deadline && new Date(deadline).getTime() > Date.now();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative">

      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl pointer-events-none translate-y-1/3 -translate-x-1/4" />
      <div className="absolute top-1/3 left-1/4 w-40 h-40 bg-secondary/30 rounded-full blur-2xl pointer-events-none" />

      {/* Lang toggle */}
      <motion.button
        onClick={toggle}
        className="absolute top-5 right-5 flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-border shadow-sm text-sm font-bold text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        data-testid="button-lang-toggle"
      >
        <Languages className="w-4 h-4" />
        {lang === 'en' ? '中文' : 'English'}
      </motion.button>

      <div className="w-full max-w-xl relative z-10 space-y-10">

        {/* Header */}
        <motion.div
          className="text-center space-y-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-3xl mb-2 shadow-sm"
            animate={{ rotate: [0, -5, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <Rocket className="w-10 h-10 text-primary" />
          </motion.div>

          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground leading-tight">
            {t("24 Hours. Just Do It.", "24小时就是干！")}
          </h1>

          <p className="text-lg text-muted-foreground font-bold">
            {t(
              "One thing. Full send. No excuses.",
              "一件事。全力以赴。不找借口。"
            )}
          </p>

          <div className="inline-block bg-accent/30 text-accent-foreground text-sm font-bold px-4 py-1.5 rounded-full border border-accent/40">
            {t(
              "Warning: may cause extreme productivity",
              "警告：可能导致极度高效"
            )}
          </div>
        </motion.div>

        {/* Form Card */}
        <motion.div
          className="bg-white rounded-3xl shadow-lg border border-border/60 p-8 space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <form onSubmit={handleStart} className="space-y-5">

            <div className="space-y-2">
              <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                {t("What are you ACTUALLY going to do?", "你到底要做什么？")}
              </label>
              <Input
                type="text"
                value={goal}
                onChange={(e) => setGoalInput(e.target.value)}
                placeholder={placeholder}
                className="text-lg p-5 h-auto bg-background border-2 border-border/60 focus-visible:border-primary focus-visible:ring-primary/20 rounded-2xl font-semibold transition-all placeholder:text-muted-foreground/40"
                data-testid="input-goal"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4" />
                {t("Deadline (because 'someday' isn't a day)", "截止日期（因为「以后」不是日期）")}
              </label>
              <div className="flex items-center bg-background border-2 border-border/60 rounded-2xl px-5 py-3 focus-within:border-primary transition-colors">
                <input
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  min={formatDateForInput(today)}
                  className="bg-transparent text-base font-semibold text-foreground outline-none w-full cursor-pointer [color-scheme:light]"
                  data-testid="input-deadline"
                  required
                />
              </div>
            </div>

            <motion.div whileHover={isValid ? { scale: 1.02 } : {}} whileTap={isValid ? { scale: 0.97 } : {}}>
              <Button
                type="submit"
                disabled={!isValid}
                className="w-full h-auto py-5 text-xl font-black rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed"
                data-testid="button-start"
              >
                {!goal.trim()
                  ? t("Type your goal above first...", "先在上面输入你的目标...")
                  : t("Let's GO!", "开战！")}
              </Button>
            </motion.div>
          </form>

          <p className="text-center text-xs text-muted-foreground/60 font-medium">
            {t(
              "Your progress is saved locally. No accounts, no drama.",
              "进度保存在本地。无需账号，无需麻烦。"
            )}
          </p>
        </motion.div>

        {/* Fun footnote */}
        <motion.p
          className="text-center text-sm text-muted-foreground/70 font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {t(
            "Side effects include: getting things done, feeling good about yourself, and mild caffeine addiction.",
            "副作用包括：把事情做完、对自己感觉良好，以及轻微咖啡因成瘾。"
          )}
        </motion.p>

      </div>
    </div>
  );
}
