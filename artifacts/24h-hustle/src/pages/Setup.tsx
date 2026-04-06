import { useState } from "react";
import { useGoalCtx } from "@/hooks/useGoal";
import { useLangCtx } from "@/context/LangContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Rocket, CalendarDays, Languages, ChevronDown, ShieldAlert, Bell } from "lucide-react";

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

async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

export default function Setup() {
  const { setGoal } = useGoalCtx();
  const { lang, toggle, t } = useLangCtx();
  const [goal, setGoalInput] = useState("");
  const [stake, setStake] = useState("");
  const [reminderTime, setReminderTime] = useState("09:00");
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [notifStatus, setNotifStatus] = useState<'idle' | 'granted' | 'denied'>('idle');

  const today = new Date();
  const defaultDate = new Date(today);
  defaultDate.setDate(defaultDate.getDate() + 7);
  const formatDateForInput = (d: Date) => d.toISOString().slice(0, 16);

  const [deadline, setDeadline] = useState(formatDateForInput(defaultDate));

  const placeholders = lang === 'zh' ? FUNNY_PLACEHOLDERS_ZH : FUNNY_PLACEHOLDERS_EN;
  const placeholder = placeholders[Math.floor(Math.random() * placeholders.length)];

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotifStatus(granted ? 'granted' : 'denied');
    setNotificationsEnabled(granted);
  };

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim() || !deadline) return;
    const deadlineTs = new Date(deadline).getTime();
    if (deadlineTs <= Date.now()) return;
    setGoal(goal.trim(), deadlineTs, {
      stake: stake.trim() || undefined,
      reminderTime: notificationsEnabled ? reminderTime : undefined,
    });
  };

  const isValid = goal.trim() && deadline && new Date(deadline).getTime() > Date.now();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative">

      <div className="absolute top-0 right-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl pointer-events-none translate-y-1/3 -translate-x-1/4" />
      <div className="absolute top-1/3 left-1/4 w-40 h-40 bg-secondary/30 rounded-full blur-2xl pointer-events-none" />

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

      <div className="w-full max-w-xl relative z-10 space-y-8">

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
            {t("One thing. Full send. No excuses.", "一件事。全力以赴。不找借口。")}
          </p>

          <div className="inline-block bg-accent/30 text-accent-foreground text-sm font-bold px-4 py-1.5 rounded-full border border-accent/40">
            {t("Warning: may cause extreme productivity", "警告：可能导致极度高效")}
          </div>
        </motion.div>

        <motion.div
          className="bg-white rounded-3xl shadow-lg border border-border/60 p-8 space-y-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <form onSubmit={handleStart} className="space-y-5">

            {/* Goal input */}
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

            {/* Deadline */}
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

            {/* Advanced options toggle */}
            <button
              type="button"
              onClick={() => setShowAdvanced((v) => !v)}
              className="w-full flex items-center justify-between py-2 text-sm font-bold text-muted-foreground/70 hover:text-muted-foreground transition-colors"
            >
              <span>{t("+ Power-ups (optional)", "+ 强化选项（可选）")}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 overflow-hidden"
                >
                  {/* Commitment stake */}
                  <div className="space-y-2 p-4 rounded-2xl bg-red-50 border border-red-200">
                    <label className="text-sm font-black text-red-700 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4" />
                      {t("If I quit, I will...", "如果我放弃，我就...")}
                    </label>
                    <Input
                      type="text"
                      value={stake}
                      onChange={(e) => setStake(e.target.value)}
                      placeholder={t(
                        "e.g. buy everyone coffee, do 100 push-ups, delete TikTok",
                        "例如：请全组喝奶茶、做100个俯卧撑、删除抖音"
                      )}
                      className="bg-white border-2 border-red-200 focus-visible:border-red-400 focus-visible:ring-red-200 rounded-xl font-semibold text-sm"
                    />
                    <p className="text-xs text-red-500 font-medium">
                      {t(
                        "This will be shown on your mission screen as a constant reminder.",
                        "这将在任务界面持续显示，提醒你不能放弃。"
                      )}
                    </p>
                  </div>

                  {/* Daily reminder */}
                  <div className="space-y-2 p-4 rounded-2xl bg-blue-50 border border-blue-200">
                    <label className="text-sm font-black text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Bell className="w-4 h-4" />
                      {t("Daily reminder", "每日提醒")}
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="time"
                        value={reminderTime}
                        onChange={(e) => setReminderTime(e.target.value)}
                        className="bg-white border-2 border-blue-200 focus:border-blue-400 rounded-xl px-3 py-2 font-bold text-foreground outline-none [color-scheme:light] cursor-pointer"
                        disabled={!notificationsEnabled}
                      />
                      {notifStatus === 'idle' && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleEnableNotifications}
                          className="border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 rounded-xl text-sm font-bold"
                        >
                          {t("Enable", "开启通知")}
                        </Button>
                      )}
                      {notifStatus === 'granted' && (
                        <span className="text-xs font-bold text-green-600">✓ {t("Enabled!", "已开启！")}</span>
                      )}
                      {notifStatus === 'denied' && (
                        <span className="text-xs font-bold text-red-500">{t("Blocked by browser", "浏览器已屏蔽")}</span>
                      )}
                    </div>
                    <p className="text-xs text-blue-500 font-medium">
                      {t(
                        "Browser will remind you to check in at this time daily (only works while browser is open).",
                        "浏览器会在每天此时提醒你打卡（需要浏览器保持开启）。"
                      )}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

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
