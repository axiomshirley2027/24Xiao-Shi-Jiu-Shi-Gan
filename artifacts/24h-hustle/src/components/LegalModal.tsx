import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useLangCtx } from "@/context/LangContext";
import { ScrollArea } from "@/components/ui/scroll-area";

function TermsContent({ lang }: { lang: string }) {
  if (lang === 'zh') return (
    <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
      <p className="text-xs text-muted-foreground/60">最后更新：2025年</p>
      <section className="space-y-1">
        <h3 className="font-black text-foreground">1. 接受条款</h3>
        <p>使用「24小时就是干」即表示你同意以下条款。如不同意，请停止使用本应用。</p>
      </section>
      <section className="space-y-1">
        <h3 className="font-black text-foreground">2. 服务描述</h3>
        <p>本应用是一款免费的个人专注工具。所有数据仅存储在你的本地浏览器中（localStorage），无需注册账号，我们不收集任何个人信息。</p>
      </section>
      <section className="space-y-1">
        <h3 className="font-black text-foreground">3. 免责声明</h3>
        <p>本应用按「现状」提供，不提供任何明示或暗示的保证。我们不对因使用本应用导致的任何数据丢失、目标未完成或生产力损失负责（你没完成目标是你自己的事）。</p>
      </section>
      <section className="space-y-1">
        <h3 className="font-black text-foreground">4. 数据责任</h3>
        <p>你的所有数据存储在浏览器本地。清除浏览器缓存、更换设备或使用隐身模式会导致数据丢失，对此我们不承担责任。</p>
      </section>
      <section className="space-y-1">
        <h3 className="font-black text-foreground">5. 服务变更</h3>
        <p>我们保留随时修改、暂停或终止服务的权利，恕不另行通知。</p>
      </section>
      <section className="space-y-1">
        <h3 className="font-black text-foreground">6. 适用法律</h3>
        <p>本条款受通用法律原则约束。如有争议，双方应友好协商解决。</p>
      </section>
    </div>
  );

  return (
    <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
      <p className="text-xs text-muted-foreground/60">Last updated: 2025</p>
      <section className="space-y-1">
        <h3 className="font-black text-foreground">1. Acceptance of Terms</h3>
        <p>By using "Lock In / 24小时就是干", you agree to these terms. If you don't agree, please stop using the app.</p>
      </section>
      <section className="space-y-1">
        <h3 className="font-black text-foreground">2. Description of Service</h3>
        <p>This is a free personal focus tool. All data is stored exclusively in your browser's local storage. No account registration is required and we collect no personal information.</p>
      </section>
      <section className="space-y-1">
        <h3 className="font-black text-foreground">3. Disclaimer of Warranties</h3>
        <p>The app is provided "as is" without warranties of any kind. We are not responsible for any data loss, unfinished goals, or missed deadlines resulting from use of this app. (Not finishing is on you.)</p>
      </section>
      <section className="space-y-1">
        <h3 className="font-black text-foreground">4. Data Responsibility</h3>
        <p>Your data lives in your browser. Clearing browser storage, switching devices, or using private/incognito mode will erase your data. We are not liable for any such loss.</p>
      </section>
      <section className="space-y-1">
        <h3 className="font-black text-foreground">5. Service Changes</h3>
        <p>We reserve the right to modify, suspend, or discontinue the service at any time without notice.</p>
      </section>
      <section className="space-y-1">
        <h3 className="font-black text-foreground">6. Governing Law</h3>
        <p>These terms are governed by general legal principles. Any disputes should be resolved amicably.</p>
      </section>
    </div>
  );
}

function PrivacyContent({ lang }: { lang: string }) {
  if (lang === 'zh') return (
    <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
      <p className="text-xs text-muted-foreground/60">最后更新：2025年</p>
      <section className="space-y-1">
        <h3 className="font-black text-foreground">我们不收集你的任何数据</h3>
        <p>「24小时就是干」是一款纯前端应用。你输入的所有内容（目标、打卡记录、日志）仅保存在你自己的浏览器本地存储（localStorage）中，不会传输到任何服务器。</p>
      </section>
      <section className="space-y-1">
        <h3 className="font-black text-foreground">没有 Cookie 追踪</h3>
        <p>我们不使用任何追踪 Cookie、广告 Cookie 或分析工具。</p>
      </section>
      <section className="space-y-1">
        <h3 className="font-black text-foreground">没有第三方共享</h3>
        <p>由于我们不收集任何数据，也就无从与任何第三方共享你的信息。</p>
      </section>
      <section className="space-y-1">
        <h3 className="font-black text-foreground">浏览器通知</h3>
        <p>如果你开启了浏览器通知权限，通知仅在你的设备本地触发，相关权限由你的浏览器管理，我们不存储任何通知相关数据。</p>
      </section>
      <section className="space-y-1">
        <h3 className="font-black text-foreground">如何删除数据</h3>
        <p>在浏览器设置中清除「24h_hustle_」开头的 localStorage 条目，或直接清除本网站的所有本地存储数据即可。</p>
      </section>
      <section className="space-y-1">
        <h3 className="font-black text-foreground">联系我们</h3>
        <p>如有隐私相关问题，欢迎通过应用内反馈联系我们。</p>
      </section>
    </div>
  );

  return (
    <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
      <p className="text-xs text-muted-foreground/60">Last updated: 2025</p>
      <section className="space-y-1">
        <h3 className="font-black text-foreground">We collect zero data about you</h3>
        <p>"Lock In / 24小时就是干" is a fully client-side app. Everything you type — goals, check-ins, logs — stays in your browser's localStorage and never leaves your device.</p>
      </section>
      <section className="space-y-1">
        <h3 className="font-black text-foreground">No tracking cookies</h3>
        <p>We use no tracking cookies, advertising cookies, or analytics platforms of any kind.</p>
      </section>
      <section className="space-y-1">
        <h3 className="font-black text-foreground">No third-party sharing</h3>
        <p>Since we collect nothing, there is nothing to share with anyone.</p>
      </section>
      <section className="space-y-1">
        <h3 className="font-black text-foreground">Browser notifications</h3>
        <p>If you grant notification permission, reminders are triggered locally on your device. We do not store or transmit notification data.</p>
      </section>
      <section className="space-y-1">
        <h3 className="font-black text-foreground">How to delete your data</h3>
        <p>Clear localStorage entries prefixed with "24h_hustle_" in your browser's developer tools, or clear all site data for this domain.</p>
      </section>
      <section className="space-y-1">
        <h3 className="font-black text-foreground">Contact</h3>
        <p>For any privacy questions, please reach out via the app's feedback channel.</p>
      </section>
    </div>
  );
}

export function LegalFooter() {
  const { lang, t } = useLangCtx();

  return (
    <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground/50 font-medium flex-wrap">
      <Dialog>
        <DialogTrigger asChild>
          <button className="hover:text-muted-foreground transition-colors underline underline-offset-2">
            {t("Terms of Service", "服务条款")}
          </button>
        </DialogTrigger>
        <DialogContent className="bg-white rounded-3xl border border-border/60 shadow-xl max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">{t("Terms of Service", "服务条款")}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-3">
            <TermsContent lang={lang} />
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <span className="text-muted-foreground/30">·</span>

      <Dialog>
        <DialogTrigger asChild>
          <button className="hover:text-muted-foreground transition-colors underline underline-offset-2">
            {t("Privacy Policy", "隐私政策")}
          </button>
        </DialogTrigger>
        <DialogContent className="bg-white rounded-3xl border border-border/60 shadow-xl max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">{t("Privacy Policy", "隐私政策")}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-3">
            <PrivacyContent lang={lang} />
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <span className="text-muted-foreground/30">·</span>

      <span>© 2025 Lock In</span>
    </div>
  );
}
