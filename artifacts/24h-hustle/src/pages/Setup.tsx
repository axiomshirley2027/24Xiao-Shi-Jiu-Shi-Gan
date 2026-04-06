import { useState } from "react";
import { useGoalCtx } from "@/hooks/useGoal";
import { useLangCtx } from "@/context/LangContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Rocket, CalendarDays, Languages, ChevronDown, ShieldAlert, Bell, Plus, X, Clock } from "lucide-react";
import { LegalFooter } from "@/components/LegalModal";

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
  const { state, setGoal, updateGoal } = useGoalCtx();
  const { lang, toggle, t } = useLangCtx();
  const isEditing = state.status === 'editing';

  const today = new Date();
  const defaultDate = new Date(today);
  defaultDate.setDate(defaultDate.getDate() + 7);
  const formatDateForInput = (d: Date) => d.toISOString().slice(0, 16);

  const [goal, setGoalInput] = useState(isEditing && state.goal ? state.goal : "");
  const [stake, setStake] = useState(isEditing && state.stake ? state.stake : "");
  const [estimatedHours, setEstimatedHours] = useState<string>(
    isEditing && state.estimatedHours ? String(state.estimatedHours) : ""
  );
  const [reminderTimes, setReminderTimes] = useState<string[]>(
    isEditing && state.reminderTimes?.length ? state.reminderTimes : ["09:00"]
  );
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    isEditing && (state.reminderTimes?.length ?? 0) > 0 && Notification.permission === 'granted'
  );
  const [showAdvanced, setShowAdvanced] = useState(isEditing && !!(state.stake || (state.reminderTimes?.length ?? 0) > 0));
  const [notifStatus, setNotifStatus] = useState<'idle' | 'granted' | 'denied'>(
    Notification.permission === 'granted' ? 'granted' : Notification.permission === 'denied' ? 'denied' : 'idle'
  );

  const [deadline, setDeadline] = useState(
    isEditing && state.deadline
      ? formatDateForInput(new Date(state.deadline))
      : formatDateForInput(defaultDate)
  );

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
    const estH = estimatedHours ? parseFloat(estimatedHours) : undefined;
    const opts = {
      stake: stake.trim() || undefined,
      reminderTimes: notificationsEnabled ? reminderTimes.filter(Boolean) : undefined,
      estimatedHours: estH && estH > 0 ? estH : undefined,
    };
    if (isEditing) {
      updateGoal(goal.trim(), deadlineTs, opts);
    } else {
      setGoal(goal.trim(), deadlineTs, opts);
    }
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
            {isEditing ? t("Update Your Mission", "修改任务设置") : t("24 Hours. Just Do It.", "24小时就是干！")}
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

            {/* Estimated hours */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {t("How many hours will this take? (optional)", "预计需要多少小时？（可选）")}
              </label>
              <div className="flex items-center gap-3">
                <div className="flex-1 flex items-center bg-background border-2 border-border/60 rounded-2xl px-5 py-3 focus-within:border-primary transition-colors">
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    step="0.5"
                    value={estimatedHours}
                    onChange={(e) => setEstimatedHours(e.target.value)}
                    placeholder={t("e.g. 40", "例如：40")}
                    className="bg-transparent text-base font-semibold text-foreground outline-none w-full [color-scheme:light]"
                  />
                  <span className="text-sm font-bold text-muted-foreground ml-2 shrink-0">{t("hrs", "小时")}</span>
                </div>
                {estimatedHours && (() => {
                  const daysTotal = deadline ? Math.max(1, Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000)) : 1;
                  const available = daysTotal * 12;
                  const est = parseFloat(estimatedHours);
                  const pct = Math.min(100, Math.round((est / available) * 100));
                  const tight = pct > 80;
                  return (
                    <div className={`text-xs font-bold px-3 py-2 rounded-xl shrink-0 ${tight ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                      {pct}% {t("of budget", "占用可用时间")}
                    </div>
                  );
                })()}
              </div>
              <p className="text-xs text-muted-foreground/60 font-medium">
                {(() => {
                  const daysTotal = deadline ? Math.max(1, Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000)) : 7;
                  const available = daysTotal * 12;
                  return t(
                    `${daysTotal}d × 12 usable hrs/day = ${available}h available (excludes sleep)`,
                    `${daysTotal}天 × 12小时/天 = ${available}小时可用（扣除睡眠）`
                  );
                })()}
              </p>
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

                  {/* Daily reminder — multiple times */}
                  <div className="space-y-3 p-4 rounded-2xl bg-blue-50 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-black text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
                        <Bell className="w-4 h-4" />
                        {t("Daily reminders", "每日提醒")}
                      </label>
                      <div className="flex items-center gap-2">
                        {notifStatus === 'idle' && (
                          <Button type="button" variant="outline" onClick={handleEnableNotifications} className="border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 rounded-xl text-xs font-bold h-7 px-2">
                            {t("Enable", "开启")}
                          </Button>
                        )}
                        {notifStatus === 'granted' && <span className="text-xs font-bold text-green-600">✓ {t("On", "已开")}</span>}
                        {notifStatus === 'denied' && <span className="text-xs font-bold text-red-500">{t("Blocked", "已屏蔽")}</span>}
                      </div>
                    </div>

                    <div className="space-y-2">
                      {reminderTimes.map((time, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <input
                            type="time"
                            value={time}
                            onChange={(e) => {
                              const next = [...reminderTimes];
                              next[i] = e.target.value;
                              setReminderTimes(next);
                            }}
                            className="flex-1 bg-white border-2 border-blue-200 focus:border-blue-400 rounded-xl px-3 py-2 font-bold text-foreground outline-none [color-scheme:light] cursor-pointer"
                          />
                          {reminderTimes.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setReminderTimes(reminderTimes.filter((_, j) => j !== i))}
                              className="p-1.5 rounded-lg text-blue-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => setReminderTimes([...reminderTimes, "12:00"])}
                      disabled={reminderTimes.length >= 6}
                      className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      {t("Add another time", "添加提醒时间")}
                    </button>

                    <p className="text-xs text-blue-500 font-medium">
                      {t(
                        "Browser notifies you at each time daily (requires browser open).",
                        "每天到点提醒（需要浏览器保持开启）。"
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
                  : isEditing
                    ? t("Save changes", "保存修改")
                    : t("Let's GO!", "开战！")}
              </Button>
            </motion.div>
          </form>

          {isEditing ? (
            <button
              type="button"
              onClick={() => updateGoal(state.goal!, state.deadline!, {
                stake: state.stake ?? undefined,
                reminderTimes: state.reminderTimes,
                estimatedHours: state.estimatedHours ?? undefined,
              })}
              className="w-full text-center text-sm font-bold text-muted-foreground/60 hover:text-muted-foreground transition-colors py-1"
            >
              ← {t("Cancel — go back to mission", "取消，回到任务")}
            </button>
          ) : (
            <p className="text-center text-xs text-muted-foreground/60 font-medium">
              {t(
                "Your progress is saved locally. No accounts, no drama.",
                "进度保存在本地。无需账号，无需麻烦。"
              )}
            </p>
          )}
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

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
          <LegalFooter />
        </motion.div>
      </div>
    </div>
  );
}
