import { useMemo, useState } from "react";
import { Award, Calendar, Check, Flame, Lock, Settings, Sparkles, Trophy, Zap } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from "recharts";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Fino } from "../fino";
import { PageTitle, toneClasses } from "../page-title";
import { activityDays, badges, subjects, weeklyMinutes, type Subject } from "@/data/studia";
import { toast } from "sonner";

function activityLevel(minutes: number) {
  if (minutes === 0) return "bg-muted";
  if (minutes < 25) return "bg-primary/25";
  if (minutes < 50) return "bg-primary/55";
  return "bg-primary";
}

export function ProfilePage() {
  const [level, setLevel] = useState("Lycée");
  const [favorites, setFavorites] = useState<Subject[]>(["Mathématiques", "Français", "Physique"]);
  const [dailyGoal, setDailyGoal] = useState(40);
  const [reminders, setReminders] = useState(true);
  const [hoveredDay, setHoveredDay] = useState<{ date: string; minutes: number } | null>(null);

  const weeks = useMemo(() => {
    const cols: { date: string; minutes: number }[][] = [];
    for (let i = 0; i < activityDays.length; i += 7) {
      cols.push(activityDays.slice(i, i + 7));
    }
    return cols;
  }, []);

  const totalWeekMinutes = useMemo(() => weeklyMinutes.reduce((s, d) => s + d.minutes, 0), []);
  const unlockedCount = badges.filter(b => b.unlocked).length;

  function toggleSubject(s: Subject) {
    setFavorites(prev => (prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]));
  }

  return <>
    <PageTitle title="Profil & récompenses" subtitle="Retrouve ta progression, tes trophées et tes préférences d’apprentissage." />

    <section className="panel p-6 mb-6 flex flex-wrap items-center gap-6">
      <div className="w-20 h-20 rounded-2xl bg-primary-soft grid place-items-center shrink-0 overflow-hidden">
        <Fino mood="encouraging" className="w-18 h-18" />
      </div>
      <div className="flex-1 min-w-[220px]">
        <div className="flex flex-wrap items-center gap-2.5">
          <h2 className="font-display text-xl font-extrabold">Yacine</h2>
          <span className="subject-pill bg-primary-soft text-primary">Niveau 8 · Explorateur</span>
          <span className="subject-pill bg-reward-soft text-reward"><Flame size={12} fill="currentColor" />7 jours de série</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">{level} · {favorites.join(", ") || "Aucune matière sélectionnée"}</p>
        <div className="mt-3 max-w-md">
          <div className="flex justify-between text-[11px] mb-1.5">
            <span className="font-semibold text-primary flex items-center gap-1"><Zap size={12} fill="currentColor" />1 250 / 1 500 XP</span>
            <span className="text-muted-foreground">Plus que 250 XP pour le niveau 9</span>
          </div>
          <div className="progress-track"><div className="progress-fill" style={{ width: "83%" }} /></div>
        </div>
      </div>
      <div className="flex gap-4 text-center">
        <div className="rounded-xl bg-background border px-4 py-3">
          <p className="font-display text-xl font-extrabold">{unlockedCount}/{badges.length}</p>
          <p className="text-[10px] text-muted-foreground">Badges</p>
        </div>
        <div className="rounded-xl bg-background border px-4 py-3">
          <p className="font-display text-xl font-extrabold">{totalWeekMinutes} min</p>
          <p className="text-[10px] text-muted-foreground">Cette semaine</p>
        </div>
      </div>
    </section>

    <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
      <div className="space-y-6">
        <section className="panel p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <h2 className="panel-title"><Calendar size={17} className="text-primary" />Régularité sur 18 semaines</h2>
            <span className="text-xs text-muted-foreground">
              {hoveredDay ? `${hoveredDay.date} : ${hoveredDay.minutes} min` : "Survole une case pour voir le détail"}
            </span>
          </div>
          <div className="overflow-x-auto pb-1">
            <div className="inline-flex gap-1.5" role="grid" aria-label="Calendrier d’activité">
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-1.5">
                  {week.map(day => (
                    <button
                      key={day.date}
                      type="button"
                      aria-label={`${day.date} : ${day.minutes} minutes`}
                      onMouseEnter={() => setHoveredDay(day)}
                      onFocus={() => setHoveredDay(day)}
                      className={`w-3.5 h-3.5 rounded-[4px] transition-transform hover:scale-125 ${activityLevel(day.minutes)}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-end gap-1.5 mt-3 text-[10px] text-muted-foreground">
            <span>Moins</span>
            <span className="w-3 h-3 rounded-[3px] bg-muted" />
            <span className="w-3 h-3 rounded-[3px] bg-primary/25" />
            <span className="w-3 h-3 rounded-[3px] bg-primary/55" />
            <span className="w-3 h-3 rounded-[3px] bg-primary" />
            <span>Plus</span>
          </div>
        </section>

        <section className="panel p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="panel-title"><Sparkles size={17} className="text-success" />Temps d’étude cette semaine</h2>
            <span className="subject-pill bg-success-soft text-success">{totalWeekMinutes} min au total</span>
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyMinutes} margin={{ top: 8, right: 6, bottom: 0, left: -20 }}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "var(--card)", borderColor: "var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="minutes" name="Minutes" fill="var(--success)" radius={[7, 7, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="panel p-6">
          <h2 className="panel-title mb-4"><Trophy size={17} className="text-reward" />Mes badges & trophées</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {badges.map(b => {
              const t = toneClasses[b.tone];
              return (
                <div key={b.id} className={`rounded-xl border p-4 flex gap-3 items-start ${b.unlocked ? "bg-background" : "bg-muted/40 opacity-80"}`}>
                  <span className={`metric-icon shrink-0 ${b.unlocked ? t.soft : "bg-muted text-muted-foreground"}`}>
                    {b.unlocked ? <Award /> : <Lock />}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-xs truncate">{b.name}</h3>
                      {b.unlocked && <Check size={14} className="text-success shrink-0" />}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">{b.description}</p>
                    {!b.unlocked && (
                      <div className="mt-2.5 flex items-center gap-2">
                        <div className="progress-track flex-1"><div className={`progress-fill ${t.fill}`} style={{ width: `${b.progress}%` }} /></div>
                        <span className="text-[10px] font-semibold tabular-nums">{b.progress}%</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <aside className="panel p-5 space-y-5">
        <h2 className="panel-title"><Settings size={17} className="text-primary" />Mes préférences</h2>

        <div>
          <span className="form-label">Niveau scolaire</span>
          <div className="grid grid-cols-3 gap-1.5">
            {["Collège", "Lycée", "Supérieur"].map(v => (
              <button
                key={v}
                type="button"
                onClick={() => setLevel(v)}
                className={`py-2 px-2 rounded-lg border text-xs font-semibold transition-colors ${
                  level === v ? "bg-primary-soft border-primary text-primary" : "bg-background text-muted-foreground"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="form-label">Matières suivies</span>
          <div className="flex flex-wrap gap-1.5">
            {subjects.map(s => {
              const active = favorites.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSubject(s)}
                  className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-medium transition-colors ${
                    active ? "bg-primary-soft border-primary text-primary font-semibold" : "bg-background text-muted-foreground"
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="flex justify-between form-label">
            <span>Objectif quotidien</span>
            <span className="text-primary font-bold">{dailyGoal} min / jour</span>
          </div>
          <Slider min={15} max={90} step={5} value={[dailyGoal]} onValueChange={v => setDailyGoal(v[0] ?? 40)} aria-label="Objectif quotidien en minutes" />
        </div>

        <label className="flex items-center justify-between gap-3 pt-1 cursor-pointer">
          <div>
            <p className="text-xs font-semibold">Rappels bienveillants</p>
            <p className="text-[10px] text-muted-foreground">Un petit message de Fino chaque soir</p>
          </div>
          <Switch checked={reminders} onCheckedChange={setReminders} aria-label="Activer les rappels" />
        </label>

        <Button
          type="button"
          className="w-full"
          onClick={() => toast.success("Préférences enregistrées !", { description: `${level} · ${dailyGoal} min par jour` })}
        >
          Enregistrer
        </Button>
      </aside>
    </div>
  </>;
}
