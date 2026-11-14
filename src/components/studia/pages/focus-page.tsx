import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, SkipForward, Check, Clock, Flame, Sparkles, Coffee, Brain, Timer } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from "recharts";
import { Button } from "@/components/ui/button";
import { Fino } from "../fino";
import { PageTitle } from "../page-title";
import { focusHistory, studySessions, subjects, type StudySession, type Subject } from "@/data/studia";
import { toast } from "sonner";

type FocusMode = "Pomodoro" | "Minuteur intelligent" | "Chronomètre";

const modeConfigs: { id: FocusMode; icon: typeof Timer; description: string }[] = [
  { id: "Pomodoro", icon: Timer, description: "25 min de travail · 5 min de pause" },
  { id: "Minuteur intelligent", icon: Brain, description: "Durée modulable avec pause suggérée" },
  { id: "Chronomètre", icon: Clock, description: "Temps libre, enregistre quand tu termines" },
];

const smartPresets = [15, 30, 45, 60] as const;

function formatClock(totalSeconds: number) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export function FocusPage() {
  const [mode, setMode] = useState<FocusMode>("Pomodoro");
  const [subject, setSubject] = useState<Subject>("Mathématiques");
  const [phase, setPhase] = useState<"focus" | "break">("focus");
  const [smartMinutes, setSmartMinutes] = useState<number>(30);
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(25 * 60);
  const [sessions, setSessions] = useState<StudySession[]>(studySessions);

  const targetSeconds = useMemo(() => {
    if (mode === "Pomodoro") return (phase === "focus" ? 25 : 5) * 60;
    if (mode === "Minuteur intelligent") return smartMinutes * 60;
    return 0;
  }, [mode, phase, smartMinutes]);

  function switchMode(next: FocusMode) {
    setRunning(false);
    setMode(next);
    setPhase("focus");
    if (next === "Pomodoro") setSeconds(25 * 60);
    else if (next === "Minuteur intelligent") setSeconds(smartMinutes * 60);
    else setSeconds(0);
  }

  function resetTimer() {
    setRunning(false);
    setSeconds(mode === "Chronomètre" ? 0 : targetSeconds);
  }

  function completeSession(loggedMinutes: number, nextPhase?: "focus" | "break") {
    const mins = Math.max(1, loggedMinutes);
    const entry: StudySession = {
      id: `s-${Date.now()}`,
      subject,
      mode,
      minutes: mins,
      when: "À l’instant",
    };
    setSessions(prev => [entry, ...prev]);
    toast.success(`Session de ${mins} min enregistrée !`, {
      description: `${subject} · +${Math.min(50, mins * 2)} XP gagnés.`,
    });
    if (mode === "Pomodoro" && nextPhase) {
      setPhase(nextPhase);
      setSeconds((nextPhase === "focus" ? 25 : 5) * 60);
    } else {
      setSeconds(mode === "Chronomètre" ? 0 : targetSeconds);
    }
  }

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSeconds(prev => {
        if (mode === "Chronomètre") return prev + 1;
        if (prev <= 1) {
          setRunning(false);
          if (mode === "Pomodoro") {
            if (phase === "focus") {
              completeSession(25, "break");
            } else {
              toast("Pause terminée ! Prêt pour un nouveau cycle ?");
              setPhase("focus");
              return 25 * 60;
            }
          } else {
            completeSession(smartMinutes);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  });

  const progress = mode === "Chronomètre"
    ? Math.min(1, (seconds % 3600) / 3600)
    : targetSeconds > 0 ? 1 - seconds / targetSeconds : 0;

  const circumference = 2 * Math.PI * 106;
  const todayMinutes = useMemo(
    () => sessions.filter(s => s.when.startsWith("Aujourd") || s.when.startsWith("À l")).reduce((sum, s) => sum + s.minutes, 0),
    [sessions],
  );
  const trendData = useMemo(
    () => ["J-6", "J-5", "J-4", "J-3", "J-2", "Hier", "Auj."].map((day, i) => ({
      day,
      minutes: i === 6 ? Math.max(focusHistory[6] ?? 0, todayMinutes) : (focusHistory[i] ?? 0),
    })),
    [todayMinutes],
  );

  return <>
    <PageTitle title="Temps & concentration" subtitle="Des sessions rythmées pour avancer sereinement, sans t’épuiser." />
    <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
      <section className="panel p-6 sm:p-8">
        <div className="segmented mb-6" role="tablist" aria-label="Modes de concentration">
          {modeConfigs.map(m => (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={mode === m.id}
              className={mode === m.id ? "active" : ""}
              onClick={() => switchMode(m.id)}
            >
              {m.id}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex flex-wrap items-center gap-1.5">
            {subjects.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setSubject(s)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition-colors ${
                  subject === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          {mode === "Pomodoro" && (
            <span className={`subject-pill ${phase === "focus" ? "bg-primary-soft text-primary" : "bg-success-soft text-success"}`}>
              {phase === "focus" ? <><Sparkles size={12} />Concentration</> : <><Coffee size={12} />Pause active</>}
            </span>
          )}
        </div>

        {mode === "Minuteur intelligent" && (
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            <span className="text-xs text-muted-foreground mr-1">Durée :</span>
            {smartPresets.map(min => (
              <Button
                key={min}
                type="button"
                size="sm"
                variant={smartMinutes === min ? "default" : "outline"}
                className="h-8 text-xs"
                onClick={() => {
                  setRunning(false);
                  setSmartMinutes(min);
                  setSeconds(min * 60);
                }}
              >
                {min} min
              </Button>
            ))}
          </div>
        )}

        <div className="relative w-64 h-64 mx-auto my-7 grid place-items-center">
          <svg viewBox="0 0 240 240" className="w-full h-full -rotate-90">
            <circle cx="120" cy="120" r="106" fill="none" stroke="var(--muted)" strokeWidth="12" />
            <motion.circle
              cx="120"
              cy="120"
              r="106"
              fill="none"
              stroke={phase === "break" ? "var(--success)" : "var(--primary)"}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              animate={{ strokeDashoffset: circumference * (1 - progress) }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              {mode === "Chronomètre" ? "Temps écoulé" : phase === "break" ? "Pause" : subject}
            </span>
            <span className="font-display text-5xl font-extrabold tabular-nums tracking-tight">
              {formatClock(seconds)}
            </span>
            <span className="text-[11px] text-muted-foreground mt-2">
              {modeConfigs.find(m => m.id === mode)?.description}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" className="px-7" onClick={() => setRunning(r => !r)}>
            {running ? <><Pause />Pause</> : <><Play />{seconds === targetSeconds || (mode === "Chronomètre" && seconds === 0) ? "Démarrer" : "Reprendre"}</>}
          </Button>
          <Button type="button" variant="outline" size="lg" onClick={resetTimer} aria-label="Réinitialiser">
            <RotateCcw />Réinitialiser
          </Button>
          {mode === "Pomodoro" && (
            <Button
              type="button"
              variant="ghost"
              size="lg"
              onClick={() => {
                setRunning(false);
                const next = phase === "focus" ? "break" : "focus";
                setPhase(next);
                setSeconds((next === "focus" ? 25 : 5) * 60);
              }}
            >
              <SkipForward />{phase === "focus" ? "Passer à la pause" : "Reprendre le travail"}
            </Button>
          )}
          {mode === "Chronomètre" && seconds >= 60 && (
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={() => {
                setRunning(false);
                completeSession(Math.round(seconds / 60));
              }}
            >
              <Check />Enregistrer ({Math.round(seconds / 60)} min)
            </Button>
          )}
        </div>
      </section>

      <aside className="space-y-5">
        <section className="panel p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="panel-title"><Flame size={17} className="text-reward" />Aujourd’hui</h2>
            <span className="subject-pill bg-reward-soft text-reward">{todayMinutes} / 90 min</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${Math.min(100, (todayMinutes / 90) * 100)}%` }} />
          </div>
          <div className="flex items-center gap-3 mt-4 pt-3 border-t">
            <Fino mood="focused" className="w-12 shrink-0" />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {running ? "Fino garde le silence pendant que tu te concentres." : "Choisis une matière et lance une session à ton rythme."}
            </p>
          </div>
        </section>

        <section className="panel p-5">
          <h2 className="panel-title mb-3">7 derniers jours (min)</h2>
          <div className="h-32 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData} margin={{ top: 8, right: 4, bottom: 0, left: 4 }}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} />
                <Tooltip contentStyle={{ background: "var(--card)", borderColor: "var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="minutes" name="Minutes" fill="var(--primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="panel p-5">
          <h2 className="panel-title mb-4">Historique récent</h2>
          <ul className="space-y-3">
            {sessions.slice(0, 6).map(s => (
              <li key={s.id} className="flex items-center justify-between gap-2 text-xs border-b pb-2.5 last:border-b-0 last:pb-0">
                <div className="min-w-0">
                  <p className="font-semibold truncate">{s.subject}</p>
                  <p className="text-[10px] text-muted-foreground">{s.mode} · {s.when}</p>
                </div>
                <span className="subject-pill bg-primary-soft text-primary shrink-0">{s.minutes} min</span>
              </li>
            ))}
          </ul>
        </section>
      </aside>
    </div>
  </>;
}
