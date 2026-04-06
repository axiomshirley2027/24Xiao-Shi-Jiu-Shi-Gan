# 24小时就是干 · Lock In

> One goal. Full send. No excuses.

A bilingual (English / 中文) personal focus app that helps you commit to one high-priority goal, track your time investment, and stay accountable until the deadline.

**Live app:** _deploy and add your URL here_  
**GitHub:** [axiomshirley2027/24Xiao-Shi-Jiu-Shi-Gan](https://github.com/axiomshirley2027/24Xiao-Shi-Jiu-Shi-Gan)

---

## What it does

- **One goal at a time** — declare your goal and a hard deadline
- **Countdown timer** — live days / hours / minutes / seconds until the deadline
- **Time budget** — set an estimated hour target; the app tells you how many hours you still need and how many are left (based on 12 usable hours per day, excluding sleep)
- **Daily check-in** — log how many hours you worked each day, track your streak 🔥
- **Commitment stake** — write a consequence for quitting ("buy everyone coffee") shown as a persistent banner
- **Distraction counter** — tap a button every time you get distracted; builds self-awareness
- **Pomodoro timer** — built-in 25 / 50-minute focus sessions with browser notifications on completion
- **Multiple daily reminders** — set up to 6 browser notification times per day
- **Shareable progress card** — screenshot-ready card showing your goal, streak, and hours logged
- **Completion screen** — full summary with check-in history, stats, and distraction count
- **Edit without losing data** — update goal text, deadline, or hour estimate while keeping all check-in history

---

## Tech stack

- **React + Vite** (TypeScript)
- **Tailwind CSS** + shadcn/ui components
- **Framer Motion** for animations
- **localStorage** — all data stays in the user's browser, zero backend
- **Web Notifications API** for reminders and pomodoro alerts

---

## Getting started (local dev)

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm --filter @workspace/24h-hustle run dev
```

---

## Privacy

No data is ever sent to a server. Everything is stored in your browser's `localStorage` under keys prefixed with `24h_hustle_`. Clearing site data removes everything.

---

## License

MIT — free to use, fork, and build on.
