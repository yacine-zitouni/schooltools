import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { WandSparkles, Download, Plus, Trash2, Check, CircleHelp, ListChecks, Network, Layers, FileText, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Fino } from "../fino";
import { PageTitle } from "../page-title";
import { courseDocuments } from "@/data/studia";
import { mockGenerate, type GeneratedResult, type GeneratorKind } from "@/services/mock";
import { downloadText } from "@/lib/download";

const kinds: { id: GeneratorKind; icon: typeof CircleHelp; types: string[]; to: "/quiz" | "/carte-mentale" | "/flashcards" | null }[] = [
  { id: "Questions", icon: CircleHelp, types: ["Questions ouvertes", "Vrai / Faux", "Questions de cours"], to: null },
  { id: "Quiz", icon: ListChecks, types: ["QCM", "Mixte", "Chronométré"], to: "/quiz" },
  { id: "Carte mentale", icon: Network, types: ["Radiale", "Hiérarchique"], to: "/carte-mentale" },
  { id: "Flashcards", icon: Layers, types: ["Définitions", "Questions / réponses", "Formules"], to: "/flashcards" },
];
const difficulties = ["Facile", "Intermédiaire", "Avancé"] as const;
const loadingSteps = ["Lecture de ton cours…", "Repérage des notions clés…", "Rédaction du contenu…", "Dernières vérifications…"];

export function GeneratorPage() {
  const [kind, setKind] = useState<GeneratorKind>("Questions");
  const [source, setSource] = useState(courseDocuments[0]!.id);
  const [difficulty, setDifficulty] = useState<(typeof difficulties)[number]>("Intermédiaire");
  const [count, setCount] = useState(5);
  const [type, setType] = useState("Questions ouvertes");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<GeneratedResult | null>(null);
  const config = kinds.find(k => k.id === kind)!;

  useEffect(() => { if (!loading) return; setStep(0); const t = setInterval(() => setStep(s => Math.min(s + 1, loadingSteps.length - 1)), 450); return () => clearInterval(t); }, [loading]);

  async function generate() { setLoading(true); setResult(null); const r = await mockGenerate(kind, kind === "Carte mentale" ? Math.min(count, 6) : count); setResult(r); setLoading(false); }
  function changeKind(next: string) { const k = kinds.find(x => x.id === next)!; setKind(k.id); setType(k.types[0]!); setResult(null); if (k.id === "Carte mentale") setCount(c => Math.min(c, 6)); }
  function exportResult() {
    if (!result) return;
    let text = "";
    if (result.kind === "Questions") text = result.items.map((q, i) => `${i + 1}. ${q.text}`).join("\n");
    if (result.kind === "Quiz") text = result.items.map((q, i) => `${i + 1}. ${q.question}\n${q.answers.map((a, j) => `   ${j === q.correct ? "✔" : "○"} ${a}`).join("\n")}`).join("\n\n");
    if (result.kind === "Carte mentale") text = `${result.center}\n${result.items.map(b => `- ${b.branch}\n${b.children.map(c => `  - ${c}`).join("\n")}`).join("\n")}`;
    if (result.kind === "Flashcards") text = result.items.map(c => `${c.front}\t${c.back}`).join("\n");
    downloadText(`schooltools-${kind.toLowerCase().replace(" ", "-")}.txt`, text);
  }

  return <>
    <PageTitle title="Le générateur" subtitle="Un cours, mille façons d’apprendre. Choisis ton format, Fino s’occupe du reste." />
    <Tabs value={kind} onValueChange={changeKind} className="mb-6">
      <TabsList className="h-auto flex-wrap bg-card border p-1.5 gap-1">{kinds.map(k => <TabsTrigger key={k.id} value={k.id} className="gap-2 px-4 py-2 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><k.icon size={15} />{k.id}</TabsTrigger>)}</TabsList>
    </Tabs>
    <div className="grid lg:grid-cols-[330px_1fr] gap-6 items-start">
      <form className="panel p-6 space-y-6" onSubmit={e => { e.preventDefault(); void generate(); }}>
        <h2 className="panel-title"><WandSparkles size={17} className="text-primary" />Paramètres</h2>
        <fieldset><legend className="form-label">Source du cours</legend><div className="space-y-2">{courseDocuments.map(d => <label key={d.id} className={`choice-row ${source === d.id ? "active" : ""}`}><input type="radio" name="source" className="sr-only" checked={source === d.id} onChange={() => setSource(d.id)} /><FileText size={15} /><span className="flex-1 text-xs font-medium truncate">{d.title}</span><span className="text-[10px] text-muted-foreground">{d.pages} p.</span></label>)}</div></fieldset>
        <fieldset><legend className="form-label">Difficulté</legend><div className="segmented">{difficulties.map(d => <button key={d} type="button" className={difficulty === d ? "active" : ""} onClick={() => setDifficulty(d)}>{d}</button>)}</div></fieldset>
        <div><div className="flex justify-between form-label"><span>Nombre d’éléments</span><span className="text-primary font-bold">{count}</span></div><Slider min={1} max={kind === "Carte mentale" ? 6 : 15} step={1} value={[count]} onValueChange={v => setCount(v[0] ?? 1)} aria-label="Nombre d’éléments" /></div>
        <label className="block"><span className="form-label">Type</span><select className="field text-xs" value={type} onChange={e => setType(e.target.value)}>{config.types.map(t => <option key={t}>{t}</option>)}</select></label>
        <Button type="submit" className="w-full h-11 generate-button" disabled={loading}>{loading ? <Loader2 className="animate-spin" /> : <WandSparkles />}{loading ? "Création en cours…" : `Générer ${count} ${kind === "Carte mentale" ? "branches" : "éléments"}`}</Button>
      </form>

      <section className="panel p-6 min-h-[480px]">
        <AnimatePresence mode="wait">
          {loading ? <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="flex items-center gap-4 mb-6"><motion.div animate={{ rotate: [0, -8, 8, 0], y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 1.2 }}><Fino reading mood="focused" className="w-20" /></motion.div><div><p className="font-bold text-sm">{loadingSteps[step]}</p><div className="progress-track w-56 mt-3"><motion.div className="progress-fill" initial={{ width: "5%" }} animate={{ width: "95%" }} transition={{ duration: 1.8 }} /></div></div></div>
            <div className="space-y-3">{Array.from({ length: Math.min(count, 4) }, (_, i) => <div key={i} className="shimmer h-16 rounded-xl" style={{ animationDelay: `${i * 120}ms` }} />)}</div>
          </motion.div>
          : result ? <motion.div key="result" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex flex-wrap items-center gap-3 mb-5"><h2 className="panel-title"><Check size={17} className="text-success" />Ton contenu est prêt</h2><span className="subject-pill bg-primary-soft text-primary">{difficulty}</span><span className="subject-pill bg-muted text-muted-foreground">{type}</span><span className="text-[11px] text-muted-foreground ml-auto">Tout est modifiable ✏️</span></div>
            <ResultEditor result={result} onChange={setResult} />
            <div className="flex flex-wrap gap-2 mt-6 pt-5 border-t"><Button variant="outline" onClick={exportResult}><Download />Exporter</Button>{config.to && <Button asChild><Link to={config.to}>Utiliser maintenant<ArrowRight /></Link></Button>}<Button variant="ghost" className="ml-auto" onClick={() => void generate()}><WandSparkles />Regénérer</Button></div>
          </motion.div>
          : <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-14 text-center"><Fino mood="focused" reading className="w-44 mx-auto" /><h2 className="font-bold text-lg mt-3">Que va-t-on apprendre aujourd’hui ?</h2><p className="text-muted-foreground text-sm mt-2 max-w-sm mx-auto">Choisis un cours et un format à gauche, puis clique sur « Générer ».</p></motion.div>}
        </AnimatePresence>
      </section>
    </div>
  </>;
}

function ResultEditor({ result, onChange }: { result: GeneratedResult; onChange: (r: GeneratedResult) => void }) {
  const newId = () => crypto.randomUUID();
  if (result.kind === "Questions") return <ol className="space-y-3">{result.items.map((q, i) => <li key={q.id} className="result-item"><span className="result-index">{i + 1}</span><textarea aria-label={`Question ${i + 1}`} rows={2} className="flex-1 bg-transparent resize-none outline-none text-sm" value={q.text} onChange={e => onChange({ ...result, items: result.items.map(x => x.id === q.id ? { ...x, text: e.target.value } : x) })} /><RemoveButton onClick={() => onChange({ ...result, items: result.items.filter(x => x.id !== q.id) })} /></li>)}<AddButton onClick={() => onChange({ ...result, items: [...result.items, { id: newId(), text: "Nouvelle question" }] })} /></ol>;
  if (result.kind === "Quiz") return <ol className="space-y-4">{result.items.map((q, i) => <li key={q.id} className="result-item flex-col items-stretch"><div className="flex gap-3 items-center"><span className="result-index">{i + 1}</span><input aria-label={`Question ${i + 1}`} className="flex-1 bg-transparent outline-none text-sm font-semibold" value={q.question} onChange={e => onChange({ ...result, items: result.items.map(x => x.id === q.id ? { ...x, question: e.target.value } : x) })} /><RemoveButton onClick={() => onChange({ ...result, items: result.items.filter(x => x.id !== q.id) })} /></div><div className="grid sm:grid-cols-2 gap-2 mt-3">{q.answers.map((a, j) => <label key={j} className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${q.correct === j ? "border-success bg-success-soft" : "bg-background"}`}><input type="radio" name={`correct-${q.id}`} aria-label={`Bonne réponse : ${a}`} className="accent-[var(--success)]" checked={q.correct === j} onChange={() => onChange({ ...result, items: result.items.map(x => x.id === q.id ? { ...x, correct: j } : x) })} /><input aria-label={`Réponse ${j + 1}`} className="flex-1 bg-transparent outline-none text-xs" value={a} onChange={e => onChange({ ...result, items: result.items.map(x => x.id === q.id ? { ...x, answers: x.answers.map((v, k) => k === j ? e.target.value : v) } : x) })} /></label>)}</div></li>)}<AddButton onClick={() => onChange({ ...result, items: [...result.items, { id: newId(), question: "Nouvelle question", answers: ["Réponse A", "Réponse B", "Réponse C", "Réponse D"], correct: 0 }] })} /></ol>;
  if (result.kind === "Carte mentale") return <div><input aria-label="Thème central" className="field text-center font-bold text-primary bg-primary-soft mb-4" value={result.center} onChange={e => onChange({ ...result, center: e.target.value })} /><div className="grid sm:grid-cols-2 gap-3">{result.items.map((b, i) => <div key={b.id} className="result-item flex-col items-stretch"><div className="flex items-center gap-2"><span className={`w-2.5 h-2.5 rounded-full ${["bg-primary", "bg-success", "bg-reward", "bg-rose"][i % 4]}`} /><input aria-label={`Branche ${i + 1}`} className="flex-1 bg-transparent outline-none text-sm font-semibold" value={b.branch} onChange={e => onChange({ ...result, items: result.items.map(x => x.id === b.id ? { ...x, branch: e.target.value } : x) })} /><RemoveButton onClick={() => onChange({ ...result, items: result.items.filter(x => x.id !== b.id) })} /></div><ul className="mt-2 space-y-1.5 pl-4 border-l ml-1">{b.children.map((c, j) => <li key={j}><input aria-label={`Sous-idée ${j + 1} de ${b.branch}`} className="w-full bg-transparent outline-none text-xs text-muted-foreground" value={c} onChange={e => onChange({ ...result, items: result.items.map(x => x.id === b.id ? { ...x, children: x.children.map((v, k) => k === j ? e.target.value : v) } : x) })} /></li>)}<li><button type="button" className="text-[11px] text-primary" onClick={() => onChange({ ...result, items: result.items.map(x => x.id === b.id ? { ...x, children: [...x.children, "Nouvelle idée"] } : x) })}>+ sous-idée</button></li></ul></div>)}</div><AddButton onClick={() => onChange({ ...result, items: [...result.items, { id: newId(), branch: "Nouvelle branche", children: [] }] })} /></div>;
  return <div className="grid sm:grid-cols-2 gap-3">{result.items.map((c, i) => <div key={c.id} className="result-item flex-col items-stretch gap-0 p-0 overflow-hidden"><div className="flex items-center gap-2 px-4 pt-3"><span className="text-[10px] font-semibold text-primary">RECTO · {i + 1}</span><span className="ml-auto"><RemoveButton onClick={() => onChange({ ...result, items: result.items.filter(x => x.id !== c.id) })} /></span></div><textarea aria-label={`Recto ${i + 1}`} rows={2} className="bg-transparent resize-none outline-none text-sm font-semibold px-4 pb-3" value={c.front} onChange={e => onChange({ ...result, items: result.items.map(x => x.id === c.id ? { ...x, front: e.target.value } : x) })} /><div className="bg-primary-soft px-4 py-3"><span className="text-[10px] font-semibold text-primary">VERSO</span><textarea aria-label={`Verso ${i + 1}`} rows={2} className="w-full bg-transparent resize-none outline-none text-xs mt-1" value={c.back} onChange={e => onChange({ ...result, items: result.items.map(x => x.id === c.id ? { ...x, back: e.target.value } : x) })} /></div></div>)}<AddButton onClick={() => onChange({ ...result, items: [...result.items, { id: newId(), front: "Nouvelle question", back: "Réponse" }] })} /></div>;
}
function RemoveButton({ onClick }: { onClick: () => void }) { return <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" aria-label="Supprimer" onClick={onClick}><Trash2 /></Button>; }
function AddButton({ onClick }: { onClick: () => void }) { return <Button type="button" variant="ghost" className="mt-3 text-primary text-xs" onClick={onClick}><Plus />Ajouter un élément</Button>; }
