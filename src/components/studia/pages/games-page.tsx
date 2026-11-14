import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Check, Gamepad2, RotateCcw, Sparkles, Trophy, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Confetti } from "../confetti";
import { Fino } from "../fino";
import { PageTitle } from "../page-title";
import { associationPairs, flashQuiz, leaderboard, memoryPairs } from "@/data/studia";
import { toast } from "sonner";

type GameTab = "memory" | "flash" | "assoc";
type MemoryCard = { id: string; pairId: number; text: string; kind: "term" | "def" };

function buildInitialMemory(): MemoryCard[] {
  const terms = memoryPairs.map((p, i) => ({ id: `t-${i}`, pairId: i, text: p.term, kind: "term" as const }));
  const defs = memoryPairs.map((p, i) => ({ id: `d-${i}`, pairId: i, text: p.definition, kind: "def" as const }));
  // Deterministic interleaved layout so server and client match initially
  const order = [terms[0]!, defs[3]!, terms[2]!, defs[0]!, terms[4]!, defs[1]!, terms[1]!, defs[5]!, terms[3]!, defs[2]!, terms[5]!, defs[4]!];
  return order;
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}

export function GamesPage() {
  const [tab, setTab] = useState<GameTab>("memory");
  const [sessionXp, setSessionXp] = useState(0);

  const ranked = useMemo(() => {
    return leaderboard
      .map(entry => (entry.me ? { ...entry, xp: entry.xp + sessionXp } : entry))
      .sort((a, b) => b.xp - a.xp);
  }, [sessionXp]);

  function earnXp(amount: number, reason: string) {
    setSessionXp(x => x + amount);
    toast.success(`+${amount} XP gagnés !`, { description: reason });
  }

  return <>
    <PageTitle title="Jeux éducatifs" subtitle="Révise tes notions en t’amusant et grimpe dans le classement." />
    <div className="grid lg:grid-cols-[1fr_300px] gap-6 items-start">
      <section className="panel p-6">
        <div className="segmented mb-6" role="tablist" aria-label="Mini-jeux">
          <button type="button" role="tab" aria-selected={tab === "memory"} className={tab === "memory" ? "active" : ""} onClick={() => setTab("memory")}>
            Memory
          </button>
          <button type="button" role="tab" aria-selected={tab === "flash"} className={tab === "flash" ? "active" : ""} onClick={() => setTab("flash")}>
            Quiz éclair
          </button>
          <button type="button" role="tab" aria-selected={tab === "assoc"} className={tab === "assoc" ? "active" : ""} onClick={() => setTab("assoc")}>
            Associations
          </button>
        </div>

        {tab === "memory" && <MemoryGame onWin={moves => earnXp(moves <= 10 ? 50 : 30, "Partie de Memory terminée !")} />}
        {tab === "flash" && <FlashQuizGame onFinish={score => earnXp(score * 5, `Quiz éclair : ${score}/${flashQuiz.length}`)} />}
        {tab === "assoc" && <AssociationGame onWin={() => earnXp(35, "Toutes les paires associées !")} />}
      </section>

      <aside className="space-y-5">
        <section className="panel p-5 bg-primary-soft/50">
          <div className="flex items-center gap-3">
            <Fino mood="encouraging" className="w-14 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-primary flex items-center gap-1"><Zap size={14} fill="currentColor" />XP de cette session</p>
              <p className="font-display text-2xl font-extrabold mt-0.5">+{sessionXp} XP</p>
            </div>
          </div>
        </section>

        <section className="panel p-5">
          <h2 className="panel-title mb-4"><Trophy size={17} className="text-reward" />Classement de la semaine</h2>
          <ul className="space-y-2.5">
            {ranked.map((player, idx) => (
              <li
                key={player.name}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs ${
                  player.me ? "bg-primary-soft border border-primary/30 font-semibold" : "bg-background border"
                }`}
              >
                <span className={`w-6 h-6 rounded-full grid place-items-center text-[11px] font-bold ${
                  idx === 0 ? "bg-reward-soft text-reward" : "bg-muted text-muted-foreground"
                }`}>
                  {idx + 1}
                </span>
                <span className="flex-1 truncate">{player.name} {player.me && <span className="text-[10px] text-primary">(toi)</span>}</span>
                <span className="text-[10px] text-muted-foreground">Niv. {player.level}</span>
                <span className="font-display font-bold tabular-nums">{player.xp} XP</span>
              </li>
            ))}
          </ul>
        </section>
      </aside>
    </div>
  </>;
}

function MemoryGame({ onWin }: { onWin: (moves: number) => void }) {
  const [cards, setCards] = useState<MemoryCard[]>(buildInitialMemory);
  const [openIds, setOpenIds] = useState<string[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [locked, setLocked] = useState(false);

  const won = matched.length === memoryPairs.length;

  function flip(card: MemoryCard) {
    if (locked || openIds.includes(card.id) || matched.includes(card.pairId)) return;
    const nextOpen = [...openIds, card.id];
    setOpenIds(nextOpen);

    if (nextOpen.length === 2) {
      setMoves(m => m + 1);
      const first = cards.find(c => c.id === nextOpen[0])!;
      if (first.pairId === card.pairId) {
        const nextMatched = [...matched, card.pairId];
        setMatched(nextMatched);
        setOpenIds([]);
        if (nextMatched.length === memoryPairs.length) onWin(moves + 1);
      } else {
        setLocked(true);
        setTimeout(() => {
          setOpenIds([]);
          setLocked(false);
        }, 700);
      }
    }
  }

  function restart() {
    setCards(shuffle(buildInitialMemory()));
    setOpenIds([]);
    setMatched([]);
    setMoves(0);
    setLocked(false);
  }

  return <div>
    {won && <Confetti count={55} />}
    <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
      <div className="flex items-center gap-3 text-xs">
        <span className="subject-pill bg-primary-soft text-primary">{matched.length} / {memoryPairs.length} paires</span>
        <span className="text-muted-foreground tabular-nums">{moves} essai{moves > 1 ? "s" : ""}</span>
      </div>
      <Button type="button" variant="outline" size="sm" onClick={restart}><RotateCcw />Mélanger</Button>
    </div>

    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {cards.map(card => {
        const revealed = openIds.includes(card.id) || matched.includes(card.pairId);
        const isMatched = matched.includes(card.pairId);
        return (
          <motion.button
            key={card.id}
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={() => flip(card)}
            className={`min-h-24 rounded-xl border p-3 text-center flex flex-col items-center justify-center transition-colors ${
              isMatched
                ? "bg-success-soft border-success/40 text-success"
                : revealed
                  ? "bg-primary-soft border-primary text-foreground"
                  : "bg-background hover:bg-muted/70 text-muted-foreground"
            }`}
          >
            {revealed ? (
              <>
                <span className="text-[9px] uppercase tracking-wider font-semibold opacity-70 mb-1">
                  {card.kind === "term" ? "Notion" : "Définition"}
                </span>
                <span className="text-xs font-semibold leading-snug">{card.text}</span>
              </>
            ) : (
              <Gamepad2 size={20} className="opacity-45" />
            )}
          </motion.button>
        );
      })}
    </div>
  </div>;
}

function FlashQuizGame({ onFinish }: { onFinish: (score: number) => void }) {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [picked, setPicked] = useState<boolean | null>(null);
  const [done, setDone] = useState(false);

  const current = flashQuiz[index];

  function answer(choice: boolean) {
    if (picked !== null || !current) return;
    const ok = choice === current.a;
    setPicked(choice);
    const nextScore = ok ? score + 1 : score;
    if (ok) {
      setScore(nextScore);
      setStreak(s => s + 1);
    } else {
      setStreak(0);
    }
    setTimeout(() => {
      setPicked(null);
      if (index + 1 < flashQuiz.length) setIndex(i => i + 1);
      else {
        setDone(true);
        onFinish(nextScore);
      }
    }, 650);
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (done) return;
      if (e.key === "ArrowLeft" || e.key.toLowerCase() === "v") answer(true);
      if (e.key === "ArrowRight" || e.key.toLowerCase() === "f") answer(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (done) {
    return <div className="py-8 text-center">
      {score >= 8 && <Confetti count={50} />}
      <Sparkles className="text-reward mx-auto mb-2" size={32} />
      <h3 className="font-display text-2xl font-extrabold">{score} / {flashQuiz.length}</h3>
      <p className="text-sm text-muted-foreground mt-1 mb-5">Bien joué ! Tu as gagné +{score * 5} XP sur ce quiz éclair.</p>
      <Button onClick={() => { setIndex(0); setScore(0); setStreak(0); setDone(false); }}><RotateCcw />Rejouer</Button>
    </div>;
  }

  return <div className="max-w-lg mx-auto py-4 text-center">
    <div className="flex items-center justify-between text-xs mb-4">
      <span className="font-semibold">Affirmation {index + 1} / {flashQuiz.length}</span>
      <span className="subject-pill bg-reward-soft text-reward">Série : {streak}</span>
    </div>
    <div className="progress-track mb-6"><div className="progress-fill" style={{ width: `${((index + 1) / flashQuiz.length) * 100}%` }} /></div>
    <div className="rounded-2xl border bg-background p-8 mb-6 min-h-36 grid place-items-center">
      <p className="font-display text-xl font-bold leading-snug">{current?.q}</p>
    </div>
    <div className="grid grid-cols-2 gap-3">
      <Button
        type="button"
        size="lg"
        variant={picked === true ? (current?.a === true ? "default" : "destructive") : "outline"}
        className="h-14 text-base"
        disabled={picked !== null}
        onClick={() => answer(true)}
      >
        <Check />Vrai
      </Button>
      <Button
        type="button"
        size="lg"
        variant={picked === false ? (current?.a === false ? "default" : "destructive") : "outline"}
        className="h-14 text-base"
        disabled={picked !== null}
        onClick={() => answer(false)}
      >
        <X />Faux
      </Button>
    </div>
    <p className="text-[11px] text-muted-foreground mt-4">Raccourci : touches V / F ou flèches gauche / droite</p>
  </div>;
}

function AssociationGame({ onWin }: { onWin: () => void }) {
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);
  const [solved, setSolved] = useState<string[]>([]);
  const [wrong, setWrong] = useState<string | null>(null);

  const defs = useMemo(() => {
    // Deterministic permutation so left and right columns do not align 1:1
    return [associationPairs[2]!, associationPairs[0]!, associationPairs[3]!, associationPairs[1]!];
  }, []);

  function pickDef(defTerm: string) {
    if (!selectedTerm || solved.includes(defTerm)) return;
    if (selectedTerm === defTerm) {
      const next = [...solved, defTerm];
      setSolved(next);
      setSelectedTerm(null);
      if (next.length === associationPairs.length) onWin();
    } else {
      setWrong(defTerm);
      setTimeout(() => setWrong(null), 450);
    }
  }

  return <div>
    {solved.length === associationPairs.length && <Confetti count={45} />}
    <div className="flex items-center justify-between mb-4">
      <p className="text-xs text-muted-foreground">Sélectionne une notion à gauche, puis sa définition à droite.</p>
      <Button type="button" variant="outline" size="sm" onClick={() => { setSolved([]); setSelectedTerm(null); }}>
        <RotateCcw />Réinitialiser
      </Button>
    </div>
    <div className="grid sm:grid-cols-2 gap-4">
      <div className="space-y-2.5">
        {associationPairs.map(pair => {
          const isSolved = solved.includes(pair.term);
          const isSelected = selectedTerm === pair.term;
          return (
            <button
              key={pair.term}
              type="button"
              disabled={isSolved}
              onClick={() => setSelectedTerm(pair.term)}
              className={`w-full text-left rounded-xl border p-3.5 text-sm font-semibold transition-colors ${
                isSolved
                  ? "bg-success-soft border-success/40 text-success"
                  : isSelected
                    ? "bg-primary-soft border-primary text-primary"
                    : "bg-background hover:bg-muted/70"
              }`}
            >
              {pair.term}
            </button>
          );
        })}
      </div>
      <div className="space-y-2.5">
        {defs.map(pair => {
          const isSolved = solved.includes(pair.term);
          const isWrong = wrong === pair.term;
          return (
            <button
              key={pair.term}
              type="button"
              disabled={isSolved}
              onClick={() => pickDef(pair.term)}
              className={`w-full text-left rounded-xl border p-3.5 text-sm transition-colors ${
                isSolved
                  ? "bg-success-soft border-success/40 text-success font-medium"
                  : isWrong
                    ? "bg-reward-soft border-reward text-reward"
                    : "bg-background hover:bg-muted/70"
              }`}
            >
              {pair.definition}
            </button>
          );
        })}
      </div>
    </div>
  </div>;
}
