import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Layers, RotateCcw, ArrowLeft, Flame, CalendarCheck, Plus, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Fino } from "../fino";
import { Confetti } from "../confetti";
import { PageTitle, toneClasses } from "../page-title";
import { decks, type Deck, type Flashcard } from "@/data/studia";
import { toast } from "sonner";

const ratings = [
  { id: "again", label: "À revoir", hint: "< 1 min", cls: "rate-again" },
  { id: "hard", label: "Difficile", hint: "6 min", cls: "rate-hard" },
  { id: "good", label: "Bien", hint: "1 jour", cls: "rate-good" },
  { id: "easy", label: "Facile", hint: "4 jours", cls: "rate-easy" },
] as const;
type Rating = (typeof ratings)[number]["id"];
const DAILY_GOAL = 20;

export function FlashcardsPage() {
  const [view, setView] = useState<"study" | "decks">("study");
  const [deckId, setDeckId] = useState(decks[0]!.id);
  const [reviewedToday, setReviewedToday] = useState(6);
  const deck = decks.find(d => d.id === deckId)!;
  return <>
    <PageTitle title="Tes flashcards" subtitle="Un peu de répétition, beaucoup de confiance." action={<div className="segmented w-auto"><button type="button" className={view === "study" ? "active" : ""} onClick={() => setView("study")}>Révision du jour</button><button type="button" className={view === "decks" ? "active" : ""} onClick={() => setView("decks")}><Layers size={14} className="inline mr-1.5 -mt-0.5" />Mes paquets</button></div>} />
    <div className="grid lg:grid-cols-[1fr_290px] gap-6 items-start">
      {view === "decks"
        ? <DeckGrid onOpen={id => { setDeckId(id); setView("study"); }} />
        : <StudySession key={deckId} deck={deck} onReviewed={() => setReviewedToday(n => n + 1)} onBack={() => setView("decks")} />}
      <aside className="space-y-5">
        <section className="panel p-5"><h2 className="panel-title mb-4"><CalendarCheck size={17} className="text-primary" />Aujourd’hui</h2>
          <div className="flex items-end gap-2 mb-3"><span className="font-display text-3xl font-extrabold tabular-nums">{reviewedToday}</span><span className="text-muted-foreground text-xs mb-1">/ {DAILY_GOAL} cartes</span></div>
          <div className="progress-track"><motion.div className="progress-fill" animate={{ width: `${Math.min(100, (reviewedToday / DAILY_GOAL) * 100)}%` }} /></div>
          <p className="text-[11px] text-muted-foreground mt-3">{reviewedToday >= DAILY_GOAL ? "Objectif atteint, bravo ! 🎉" : `Encore ${DAILY_GOAL - reviewedToday} cartes pour ton objectif.`}</p>
        </section>
        <section className="panel p-5"><h2 className="panel-title mb-4">À réviser par paquet</h2><ul className="space-y-3">{decks.map(d => <li key={d.id}><button type="button" className="w-full flex items-center gap-3 text-left" onClick={() => { setDeckId(d.id); setView("study"); }}><span className={`w-2 h-8 rounded-full ${toneClasses[d.tone].fill}`} /><span className="flex-1 min-w-0"><span className="block text-xs font-semibold truncate">{d.name}</span><span className="block text-[10px] text-muted-foreground">{d.subject}</span></span><span className={`subject-pill ${toneClasses[d.tone].soft}`}>{d.cards.length}</span></button></li>)}</ul></section>
        <section className="panel p-5 bg-reward-soft/50"><div className="flex items-center gap-2 text-reward font-semibold text-xs"><Flame size={16} fill="currentColor" />7 jours de suite</div><p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">La répétition espacée te fait retenir 2× plus longtemps. Continue comme ça !</p></section>
      </aside>
    </div>
  </>;
}

function DeckGrid({ onOpen }: { onOpen: (id: string) => void }) {
  return <div className="grid sm:grid-cols-2 gap-4">{decks.map(d => <DeckCard key={d.id} deck={d} onOpen={() => onOpen(d.id)} />)}
    <button type="button" className="panel border-dashed p-6 min-h-48 grid place-content-center text-center text-muted-foreground hover:text-primary hover:border-primary transition-colors" onClick={() => toast("Crée un paquet depuis le Générateur.", { description: "Importe un cours et choisis « Flashcards »." })}><Plus className="mx-auto mb-2" /><span className="font-semibold text-sm">Nouveau paquet</span></button>
  </div>;
}
function DeckCard({ deck, onOpen }: { deck: Deck; onOpen: () => void }) {
  const t = toneClasses[deck.tone];
  return <motion.div whileHover={{ y: -4 }} className="deck-stack"><div className={`deck-shadow ${t.soft}`} /><div className="panel p-5 relative h-full">
    <div className="flex items-start justify-between mb-5"><span className={`metric-icon ${t.soft}`}><Layers /></span><span className="subject-pill bg-muted text-muted-foreground">{deck.subject}</span></div>
    <h3 className="font-bold text-base">{deck.name}</h3><p className="text-[11px] text-muted-foreground mt-1">{deck.cards.length} cartes · {Math.ceil(deck.cards.length * 0.6)} à réviser</p>
    <div className="flex items-center gap-3 mt-4"><div className="progress-track flex-1"><div className={`progress-fill ${t.fill}`} style={{ width: `${deck.mastery}%` }} /></div><span className={`text-[11px] font-semibold ${t.text}`}>{deck.mastery}%</span></div>
    <Button size="sm" className="mt-5 w-full" onClick={onOpen}><Play />Réviser</Button>
  </div></motion.div>;
}

function StudySession({ deck, onReviewed, onBack }: { deck: Deck; onReviewed: () => void; onBack: () => void }) {
  const [queue, setQueue] = useState<Flashcard[]>(deck.cards);
  const [flipped, setFlipped] = useState(false);
  const [counts, setCounts] = useState<Record<Rating, number>>({ again: 0, hard: 0, good: 0, easy: 0 });
  const done = useMemo(() => counts.hard + counts.good + counts.easy, [counts]);
  const card = queue[0];

  function rate(r: Rating) {
    if (!card || !flipped) return;
    setCounts(c => ({ ...c, [r]: c[r] + 1 }));
    setQueue(q => r === "again" ? [...q.slice(1), q[0]!] : q.slice(1));
    setFlipped(false); onReviewed();
    if (r === "again") toast("Carte remise en fin de paquet.");
  }
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if ((e.target as HTMLElement).closest("input, textarea")) return; if (e.key === " ") { e.preventDefault(); setFlipped(f => !f); } const i = Number(e.key) - 1; if (i >= 0 && i < 4) rate(ratings[i]!.id); };
    window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey);
  });

  if (!card) return <section className="panel p-9 text-center"><Confetti count={50} /><Fino mood="encouraging" className="w-36 mx-auto" /><h2 className="text-xl font-bold mt-2">Paquet terminé !</h2><p className="my-3 text-success font-semibold">+{done * 5} XP, et des connaissances en plus.</p>
    <div className="flex justify-center gap-6 text-xs my-6">{ratings.map(r => <div key={r.id}><p className="font-display text-xl font-bold">{counts[r.id]}</p><p className="text-muted-foreground">{r.label}</p></div>)}</div>
    <div className="flex justify-center gap-3"><Button variant="outline" onClick={onBack}><Layers />Mes paquets</Button><Button onClick={() => { setQueue(deck.cards); setCounts({ again: 0, hard: 0, good: 0, easy: 0 }); }}><RotateCcw />Recommencer</Button></div></section>;

  const t = toneClasses[deck.tone];
  return <section>
    <div className="flex items-center gap-3 mb-4"><Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft />Paquets</Button><span className={`subject-pill ${t.soft}`}>{deck.name}</span><span className="ml-auto text-xs text-muted-foreground tabular-nums">{done} / {deck.cards.length} maîtrisées · {queue.length} restantes</span></div>
    <div className="progress-track mb-6"><motion.div className="progress-fill" animate={{ width: `${(done / deck.cards.length) * 100}%` }} /></div>
    <AnimatePresence mode="popLayout"><motion.div key={card.id + queue.length} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: .22 }} className="flip-scene">
      <button type="button" className={`flip-card ${flipped ? "flipped" : ""}`} onClick={() => setFlipped(f => !f)} aria-label={flipped ? "Voir la question" : "Retourner la carte pour voir la réponse"}>
        <span className="flip-face front"><span className="text-[10px] font-semibold tracking-widest text-primary mb-6">QUESTION</span><span className="text-xl sm:text-2xl font-bold font-display leading-snug">{card.front}</span><span className="mt-8 text-[11px] text-muted-foreground flex items-center gap-1.5"><RotateCcw size={13} />Clique ou appuie sur Espace</span></span>
        <span className="flip-face back"><span className="text-[10px] font-semibold tracking-widest text-success mb-6">RÉPONSE</span><span className="text-xl sm:text-2xl font-bold font-display leading-snug">{card.back}</span><span className="mt-8 text-[11px] text-muted-foreground">Comment t’en es-tu sorti ?</span></span>
      </button>
    </motion.div></AnimatePresence>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">{ratings.map((r, i) => <button key={r.id} type="button" disabled={!flipped} onClick={() => rate(r.id)} className={`rate-button ${r.cls}`}><span className="font-semibold text-sm">{r.label}</span><span className="text-[10px] opacity-75">{r.hint} · touche {i + 1}</span></button>)}</div>
  </section>;
}
