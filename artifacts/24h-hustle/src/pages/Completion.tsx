import { useGoalCtx } from "@/hooks/useGoal";
import { useLangCtx } from "@/context/LangContext";
import { Button } from "@/components/ui/button";
import { RotateCcw, PartyPopper, HeartCrack } from "lucide-react";
import { motion } from "framer-motion";

function formatDuration(ms: number, lang: string) {
  const totalMin = Math.floor(ms / 60000);
  const days = Math.floor(totalMin / 1440);
  const hours = Math.floor((totalMin % 1440) / 60);
  const mins = totalMin % 60;
  if (lang === 'zh') {
    if (days > 0) return `${days}天 ${hours}时 ${mins}分`;
    if (hours > 0) return `${hours}时 ${mins}分`;
    return `${mins}分钟`;
  }
  if (days > 0) return `${days}d ${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins} min`;
}

export default function Completion() {
  const { state, resetGoal } = useGoalCtx();
  const { lang, t } = useLangCtx();
  const isAbandoned = state.status === 'abandoned';

  const duration = state.startTime && state.deadline
    ? formatDuration(state.deadline - state.startTime, lang)
    : '-';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative">

      {/* Blobs */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none -translate-y-1/3 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl pointer-events-none translate-y-1/3 -translate-x-1/4" />

      <div className="w-full max-w-lg relative z-10 space-y-8">

        {/* Icon + headline */}
        <motion.div
          className="text-center space-y-4"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className={`inline-flex items-center justify-center w-24 h-24 rounded-3xl shadow-sm mb-2 ${
              isAbandoned ? 'bg-destructive/10' : 'bg-primary/10'
            }`}
            initial={{ scale: 0.5, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          >
            {isAbandoned
              ? <HeartCrack className="w-12 h-12 text-destructive" />
              : <PartyPopper className="w-12 h-12 text-primary" />
            }
          </motion.div>

          <h1 className="text-4xl md:text-5xl font-black text-foreground">
            {isAbandoned
              ? t("You quit. That's okay.", "你放弃了。没关系。")
              : t("Time's up! How'd it go?", "时间到！结果怎么样？")
            }
          </h1>

          <p className="text-lg text-muted-foreground font-medium leading-relaxed">
            {isAbandoned
              ? t(
                  "At least you started. Most people never even do that. Come back when you're ready.",
                  "至少你开始了。大多数人连这一步都做不到。准备好了就回来。"
                )
              : t(
                  "The deadline is done. Whether you crushed it or just survived — you showed up. That counts.",
                  "截止日期到了。不管你是大获全胜还是勉强撑过来的——你坚持下来了。这很重要。"
                )
            }
          </p>
        </motion.div>

        {/* Summary card */}
        <motion.div
          className="bg-white rounded-3xl border border-border/50 shadow-sm p-6 space-y-5"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <h3 className="text-xs font-bold uppercase tracking-widest text-primary">
            {t("Mission Report", "任务总结")}
          </h3>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center py-3 border-b border-border/40">
              <span className="text-muted-foreground font-semibold">{t("Goal", "目标")}</span>
              <span className="font-black text-foreground text-right max-w-[60%] break-words">{state.goal}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-border/40">
              <span className="text-muted-foreground font-semibold">{t("Total time given", "给予的总时间")}</span>
              <span className="font-black text-foreground font-mono">{duration}</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-muted-foreground font-semibold">{t("Progress notes", "进展记录")}</span>
              <span className="font-black text-foreground">
                {state.logs.length} {t(state.logs.length === 1 ? "entry" : "entries", "条")}
              </span>
            </div>
          </div>

          {state.logs.length > 0 && (
            <div className="space-y-2 pt-2">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {t("What you got done:", "你完成了什么：")}
              </p>
              <div className="space-y-2 max-h-52 overflow-y-auto">
                {state.logs.map((log) => (
                  <div key={log.id} className="bg-background rounded-xl p-3 border border-border/40">
                    <span className="text-xs text-muted-foreground font-mono mr-2">
                      {new Date(log.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-sm font-semibold text-foreground">{log.note}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* New goal button */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            onClick={resetGoal}
            className="w-full py-6 text-xl font-black rounded-2xl shadow-sm hover:shadow-md transition-all"
            data-testid="button-start-new"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            {t("Start a New Mission", "开始新目标")}
          </Button>
        </motion.div>

        <p className="text-center text-xs text-muted-foreground/60 font-medium">
          {isAbandoned
            ? t("It took courage to try. Try again.", "能开始就是勇气。再试一次。")
            : t("The clock stopped. You didn't.", "时钟停了，你没有。")
          }
        </p>
      </div>
    </div>
  );
}
