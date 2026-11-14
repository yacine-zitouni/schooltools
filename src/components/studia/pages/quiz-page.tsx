import { useEffect, useState } from "react";
import { animate, AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, Clock, RotateCcw, Trophy, X, Zap, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Fino } from "../fino";
import { Confetti } from "../confetti";
import { PageTitle } from "../page-title";
import { quizQuestions } from "@/data/studia";
import { toast } from "sonner";

const PER_QUESTION = 30;
type Answer = { selected: number | null; correct: boolean; time: number };

export function QuizPage() {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [left, setLeft] = useState(PER_QUESTION);
  const [total, setTotal] = useState(0);
  const [finished, setFinished] = useState(false);
  const q = quizQuestions[index]!;
  const revealed = selected !== null || left === 0;

  useEffect(() => { if (finished || revealed) return; const t = setInterval(() => { setLeft(s => Math.max(0, s - 1)); setTotal(s => s + 1); }, 1000); return () => clearInterval(t); }, [finished, revealed]);
  useEffect(() => { if (left === 0 && selected === null && !finished && answers.length === index) setAnswers(a => [...a, { selected: null, correct: false, time: PER_QUESTION }]); }, [left, selected, finished, answers.length, index]);

  function choose(i: number) { if (revealed) return; setSelected(i); setAnswers(a => [...a, { selected: i, correct: i === q.correct, time: PER_QUESTION - left }]); }
  function next() { if (index < quizQuestions.length - 1) { setIndex(index + 1); setSelected(null); setLeft(PER_QUESTION); } else { setFinished(true); toast.success("Quiz terminé ! Tes efforts comptent."); } }
  function restart() { setIndex(0); setSelected(null); setAnswers([]); setLeft(PER_QUESTION); setTotal(0); setFinished(false); }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (finished) return; const n = Number(e.key); if (n >= 1 && n <= q.answers.length) choose(n - 1); if (e.key === "Enter" && revealed) next(); };
    window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey);
  });

  const score = answers.filter(a => a.correct).length;
  if (finished) return <Results score={score} answers={answers} seconds={total} onRestart={restart} />;
  const ratio = left / PER_QUESTION;
  return <>
    <PageTitle title="À toi de jouer !" subtitle="Les dérivées · Mathématiques · Niveau intermédiaire" />
    <section className="panel max-w-3xl mx-auto p-6 sm:p-9">
      <div className="flex items-center justify-between gap-4 mb-3">
        <span className="text-xs font-semibold">Question {index + 1} <span className="text-muted-foreground font-normal">sur {quizQuestions.length}</span></span>
        <div className={`quiz-timer ${left <= 10 ? "urgent" : ""}`} aria-label={`${left} secondes restantes`}>
          <svg viewBox="0 0 36 36" className="w-9 h-9 -rotate-90"><circle cx="18" cy="18" r="15" className="timer-track" /><circle cx="18" cy="18" r="15" className="timer-progress" strokeDasharray={94.25} strokeDashoffset={94.25 * (1 - ratio)} /></svg>
          <span className="flex items-center gap-1 text-xs font-bold tabular-nums"><Clock size={13} />{left}s</span>
        </div>
      </div>
      <div className="flex gap-1.5 mb-8">{quizQuestions.map((_, i) => <span key={i} className={`h-2 flex-1 rounded-full transition-colors ${i < answers.length ? (answers[i]!.correct ? "bg-success" : "bg-reward") : i === index ? "bg-primary" : "bg-muted"}`} />)}</div>
      <AnimatePresence mode="wait"><motion.div key={index} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: .25 }}>
        <h2 className="text-xl font-bold mb-7 leading-snug">{q.question}</h2>
        <div className="grid gap-3">{q.answers.map((a, i) => {
          const state = !revealed ? "" : i === q.correct ? "correct" : i === selected ? "wrong" : "dim";
          return <motion.button key={a} type="button" disabled={revealed} onClick={() => choose(i)} className={`answer-option ${state}`} animate={state === "wrong" ? { x: [0, -8, 8, -5, 5, 0] } : state === "correct" ? { scale: [1, 1.02, 1] } : {}} transition={{ duration: .4 }}>
            <span className="answer-key">{String.fromCharCode(65 + i)}</span><span className="flex-1 text-left">{a}</span>{state === "correct" && <Check className="text-success" />}{state === "wrong" && <X className="text-reward" />}
          </motion.button>;
        })}</div>
        {revealed && <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
          <div className={`p-4 rounded-xl mb-5 flex gap-3 ${selected === q.correct ? "bg-success-soft" : "bg-reward-soft"}`}><Fino mood={selected === q.correct ? "encouraging" : "sad"} className="w-14 shrink-0" /><div><strong className={selected === q.correct ? "text-success" : "text-reward"}>{selected === q.correct ? "Bien joué ! +20 XP" : selected === null ? "Temps écoulé !" : "On apprend aussi en se trompant."}</strong><p className="mt-1.5 text-sm text-foreground/80">{q.explanation}</p></div></div>
          <div className="flex items-center justify-between"><span className="text-[11px] text-muted-foreground hidden sm:block">Astuce : touches 1 à 4 pour répondre, Entrée pour continuer</span><Button onClick={next} className="ml-auto">{index === quizQuestions.length - 1 ? "Voir mes résultats" : "Question suivante"}<ArrowRight /></Button></div>
        </motion.div>}
      </motion.div></AnimatePresence>
    </section>
  </>;
}

function Results({ score, answers, seconds, onRestart }: { score: number; answers: Answer[]; seconds: number; onRestart: () => void }) {
  const total = quizQuestions.length;
  const percent = Math.round((score / total) * 100);
  const [shown, setShown] = useState(0);
  useEffect(() => { const c = animate(0, percent, { duration: 1.4, ease: "easeOut", onUpdate: v => setShown(Math.round(v)) }); return () => c.stop(); }, [percent]);
  const avg = Math.round(answers.reduce((s, a) => s + a.time, 0) / Math.max(1, answers.length));
  return <>
    {percent >= 50 && <Confetti />}
    <PageTitle title="Tes résultats" subtitle="Les dérivées · Mathématiques" />
    <section className="panel max-w-3xl mx-auto p-7 sm:p-10 text-center">
      <div className="relative w-44 h-44 mx-auto">
        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90"><circle cx="60" cy="60" r="52" className="score-track" /><motion.circle cx="60" cy="60" r="52" className="score-progress" strokeDasharray={326.7} initial={{ strokeDashoffset: 326.7 }} animate={{ strokeDashoffset: 326.7 * (1 - percent / 100) }} transition={{ duration: 1.4, ease: "easeOut" }} /></svg>
        <div className="absolute inset-0 grid place-content-center"><span className="font-display text-4xl font-extrabold tabular-nums">{shown}%</span><span className="text-xs text-muted-foreground">{score} / {total}</span></div>
      </div>
      <h2 className="text-2xl font-extrabold mt-6">{percent === 100 ? "Sans faute ! 🏆" : percent >= 50 ? "Très beau travail !" : "Chaque essai te fait progresser."}</h2>
      <p className="text-muted-foreground mt-2 text-sm">{percent === 100 ? "Tu peux être fier de toi." : "Revois les explications des questions manquées, puis retente ta chance."}</p>
      <div className="grid grid-cols-3 gap-3 my-7">
        <div className="rounded-xl bg-primary-soft p-4"><Zap className="text-primary mx-auto mb-1.5" size={18} /><p className="font-bold text-primary">+{score * 20} XP</p><p className="text-[10px] text-muted-foreground">gagnés</p></div>
        <div className="rounded-xl bg-success-soft p-4"><Target className="text-success mx-auto mb-1.5" size={18} /><p className="font-bold text-success">{score} bonnes</p><p className="text-[10px] text-muted-foreground">réponses</p></div>
        <div className="rounded-xl bg-reward-soft p-4"><Clock className="text-reward mx-auto mb-1.5" size={18} /><p className="font-bold text-reward">{avg}s</p><p className="text-[10px] text-muted-foreground">par question · {seconds}s au total</p></div>
      </div>
      <ul className="text-left space-y-2 mb-7">{quizQuestions.map((q, i) => <li key={i} className="flex gap-3 items-start text-xs border-b pb-2"><span className={`w-5 h-5 rounded-full grid place-items-center shrink-0 ${answers[i]?.correct ? "bg-success-soft text-success" : "bg-reward-soft text-reward"}`}>{answers[i]?.correct ? <Check size={12} /> : <X size={12} />}</span><span className="flex-1">{q.question}</span><span className="text-muted-foreground">{q.answers[q.correct]}</span></li>)}</ul>
      <div className="flex justify-center gap-3"><Button variant="outline" onClick={onRestart}><RotateCcw />Recommencer</Button><Button onClick={onRestart}><Trophy />Nouveau défi</Button></div>
    </section>
  </>;
}
