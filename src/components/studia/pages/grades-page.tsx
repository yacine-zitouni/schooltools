import { useMemo, useState, type FormEvent } from "react";
import { Plus, Trash2, TrendingUp, Award, BookOpen, ChartNoAxesCombined } from "lucide-react";
import { ResponsiveContainer, ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { PageTitle } from "../page-title";
import { gradeRows, subjects, type GradeRow, type Subject } from "@/data/studia";
import { formatNumber, movingAverage, weightedAverage } from "@/lib/study-math";
import { toast } from "sonner";

const subjectColor: Record<Subject, string> = {
  "Mathématiques": "bg-primary-soft text-primary",
  "Français": "bg-success-soft text-success",
  "Physique": "bg-reward-soft text-reward",
  "Histoire": "bg-rose-soft text-rose",
  "Anglais": "bg-primary-soft text-primary",
};

export function GradesPage() {
  const [rows, setRows] = useState<GradeRow[]>(gradeRows);
  const [filter, setFilter] = useState<"Toutes" | Subject>("Toutes");
  const [dialogOpen, setDialogOpen] = useState(false);

  const [newSubject, setNewSubject] = useState<Subject>("Mathématiques");
  const [newName, setNewName] = useState("");
  const [newGrade, setNewGrade] = useState("15");
  const [newCoeff, setNewCoeff] = useState("1");

  const filtered = useMemo(
    () => (filter === "Toutes" ? rows : rows.filter(r => r.subject === filter)),
    [rows, filter],
  );

  const overallAvg = useMemo(() => weightedAverage(filtered), [filtered]);
  const totalCoeff = useMemo(() => filtered.reduce((s, r) => s + r.coefficient, 0), [filtered]);

  const subjectSummaries = useMemo(() => {
    return subjects
      .map(s => {
        const items = rows.filter(r => r.subject === s);
        return { subject: s, count: items.length, avg: weightedAverage(items) };
      })
      .filter(s => s.count > 0)
      .sort((a, b) => b.avg - a.avg);
  }, [rows]);

  const chartData = useMemo(() => {
    const sorted = [...filtered].sort((a, b) => a.date.localeCompare(b.date));
    const trend = movingAverage(sorted.map(r => r.grade), 3);
    return sorted.map((r, i) => ({
      name: r.date.slice(5),
      label: r.name,
      grade: r.grade,
      trend: trend[i] ?? r.grade,
    }));
  }, [filtered]);

  function addGrade(e: FormEvent) {
    e.preventDefault();
    const g = Math.min(20, Math.max(0, Number(newGrade.replace(",", "."))));
    const c = Math.min(10, Math.max(0.5, Number(newCoeff.replace(",", "."))));
    if (!newName.trim() || !Number.isFinite(g) || !Number.isFinite(c)) {
      toast.error("Vérifie le nom et les valeurs saisies.");
      return;
    }
    const created: GradeRow = {
      id: `g-${Date.now()}`,
      subject: newSubject,
      name: newName.trim(),
      grade: Math.round(g * 10) / 10,
      coefficient: c,
      date: "2026-11-14",
    };
    setRows(prev => [...prev, created]);
    setNewName("");
    setDialogOpen(false);
    toast.success("Note ajoutée !", { description: `${created.subject} · ${formatNumber(created.grade)} / 20` });
  }

  function removeGrade(id: string) {
    setRows(prev => prev.filter(r => r.id !== id));
    toast("Note supprimée.");
  }

  const bestSubject = subjectSummaries[0];

  return <>
    <PageTitle
      title="Mes notes"
      subtitle="Suis ta moyenne pondérée, ta tendance et tes progrès par matière."
      action={<Button onClick={() => setDialogOpen(true)}><Plus />Ajouter une note</Button>}
    />

    <div className="grid sm:grid-cols-3 gap-4 mb-6">
      <div className="panel p-5 flex items-center gap-4">
        <span className="metric-icon bg-primary-soft text-primary"><ChartNoAxesCombined /></span>
        <div>
          <p className="font-display text-2xl font-extrabold tabular-nums">{formatNumber(overallAvg)} <span className="text-sm font-semibold text-muted-foreground">/ 20</span></p>
          <p className="text-xs text-muted-foreground">Moyenne {filter === "Toutes" ? "générale" : filter}</p>
        </div>
      </div>
      <div className="panel p-5 flex items-center gap-4">
        <span className="metric-icon bg-success-soft text-success"><Award /></span>
        <div>
          <p className="font-display text-xl font-extrabold truncate">{bestSubject ? bestSubject.subject : "—"}</p>
          <p className="text-xs text-muted-foreground">{bestSubject ? `Meilleure matière (${formatNumber(bestSubject.avg)} / 20)` : "Aucune note"}</p>
        </div>
      </div>
      <div className="panel p-5 flex items-center gap-4">
        <span className="metric-icon bg-reward-soft text-reward"><BookOpen /></span>
        <div>
          <p className="font-display text-2xl font-extrabold tabular-nums">{filtered.length}</p>
          <p className="text-xs text-muted-foreground">Évaluations · coeff. total {formatNumber(totalCoeff)}</p>
        </div>
      </div>
    </div>

    <div className="flex flex-wrap gap-2 mb-6">
      {(["Toutes", ...subjects] as const).map(item => (
        <button
          key={item}
          type="button"
          onClick={() => setFilter(item)}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
            filter === item
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card text-muted-foreground border-border hover:text-foreground"
          }`}
        >
          {item}
        </button>
      ))}
    </div>

    <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
      <div className="space-y-6">
        <section className="panel p-6">
          <div className="flex items-center justify-between gap-2 mb-4">
            <h2 className="panel-title"><TrendingUp size={17} className="text-primary" />Évolution et moyenne glissante</h2>
            <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5"><i className="w-2.5 h-2.5 rounded-sm bg-primary/25" />Note</span>
              <span className="flex items-center gap-1.5"><i className="w-2.5 h-0.5 bg-primary" />Tendance</span>
            </div>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 12, bottom: 0, left: -20 }}>
                <CartesianGrid stroke="var(--border)" vertical={false} strokeDasharray="3 4" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} />
                <YAxis domain={[0, 20]} ticks={[0, 5, 10, 15, 20]} axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} />
                <Tooltip contentStyle={{ background: "var(--card)", borderColor: "var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="grade" name="Note" fill="color-mix(in oklch, var(--primary) 26%, transparent)" radius={[6, 6, 0, 0]} barSize={22} />
                <Line type="monotone" dataKey="trend" name="Moyenne glissante" stroke="var(--primary)" strokeWidth={2.5} dot={{ r: 3, fill: "var(--primary)" }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="panel p-6">
          <h2 className="panel-title mb-4">Détail des évaluations</h2>
          <div className="divide-y">
            {[...filtered].reverse().map(row => (
              <div key={row.id} className="py-3 first:pt-0 last:pb-0 flex items-center gap-3">
                <span className={`subject-pill shrink-0 ${subjectColor[row.subject]}`}>{row.subject}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{row.name}</p>
                  <p className="text-[11px] text-muted-foreground">{row.date} · Coeff. {formatNumber(row.coefficient)}</p>
                </div>
                <span className={`font-display text-base font-extrabold tabular-nums ${row.grade >= 14 ? "text-success" : row.grade >= 10 ? "text-foreground" : "text-reward"}`}>
                  {formatNumber(row.grade)}<span className="text-[11px] font-normal text-muted-foreground"> / 20</span>
                </span>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" aria-label={`Supprimer ${row.name}`} onClick={() => removeGrade(row.id)}>
                  <Trash2 size={15} />
                </Button>
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="text-sm text-muted-foreground py-6 text-center">Aucune note pour cette matière pour le moment.</p>
            )}
          </div>
        </section>
      </div>

      <aside className="panel p-5 space-y-4">
        <h2 className="panel-title">Moyennes par matière</h2>
        <div className="space-y-4">
          {subjectSummaries.map(s => (
            <div key={s.subject}>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold">{s.subject}</span>
                <span className="font-display font-bold tabular-nums">{formatNumber(s.avg)} / 20</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${(s.avg / 20) * 100}%` }} />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">{s.count} évaluation{s.count > 1 ? "s" : ""}</p>
            </div>
          ))}
        </div>
      </aside>
    </div>

    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent>
        <DialogTitle>Ajouter une note</DialogTitle>
        <DialogDescription>Enregistre une nouvelle évaluation pour mettre à jour ta moyenne.</DialogDescription>
        <form onSubmit={addGrade} className="space-y-4 mt-2">
          <label className="block">
            <span className="form-label">Matière</span>
            <select className="field text-sm" value={newSubject} onChange={e => setNewSubject(e.target.value as Subject)}>
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="form-label">Intitulé</span>
            <input className="field text-sm" placeholder="Ex : Contrôle sur les dérivées" value={newName} onChange={e => setNewName(e.target.value)} required />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="form-label">Note (/ 20)</span>
              <input className="field text-sm" type="number" step="0.5" min="0" max="20" value={newGrade} onChange={e => setNewGrade(e.target.value)} required />
            </label>
            <label className="block">
              <span className="form-label">Coefficient</span>
              <input className="field text-sm" type="number" step="0.5" min="0.5" max="10" value={newCoeff} onChange={e => setNewCoeff(e.target.value)} required />
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
            <Button type="submit">Enregistrer</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  </>;
}
