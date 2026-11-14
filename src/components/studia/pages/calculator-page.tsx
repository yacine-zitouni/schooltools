import { useState, type FormEvent } from "react";
import { Calculator, Delete, Equal, History, Lightbulb, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Fino } from "../fino";
import { PageTitle } from "../page-title";
import { expressionSteps, formatNumber, solveLinear } from "@/lib/study-math";

type CalcEntry = { id: string; expr: string; result: string; steps: string[] };

const calcExamples = ["(3 + 5) * 2 - 4", "sqrt(144) + 2^3", "2 * pi * 5", "(18 - 6) / 3 + 4^2"];
const equationExamples = ["2x + 3 = 7", "5x - 10 = 2x + 5", "-3x + 9 = 0", "4(x - 1) = 12"];

const sciKeys = [
  { label: "(", insert: "(" }, { label: ")", insert: ")" }, { label: "^", insert: "^" },
  { label: "√", insert: "sqrt(" }, { label: "π", insert: "pi" },
  { label: "e", insert: "e" }, { label: "sin", insert: "sin(" }, { label: "cos", insert: "cos(" },
  { label: "tan", insert: "tan(" }, { label: "log", insert: "log10(" },
];

export function CalculatorPage() {
  const [mode, setMode] = useState<"calc" | "equation">("calc");
  const [expr, setExpr] = useState("(3 + 5) * 2 - 4");
  const [ans, setAns] = useState<string>("12");
  const [output, setOutput] = useState<{ result: string; steps: string[]; error?: string }>(() => {
    const initial = expressionSteps("(3 + 5) * 2 - 4");
    return { result: formatNumber(initial.result), steps: initial.steps };
  });
  const [history, setHistory] = useState<CalcEntry[]>([
    { id: "h1", expr: "(3 + 5) * 2 - 4", result: "12", steps: ["(3 + 5) * 2 - 4", "8 * 2 - 4", "16 - 4", "12"] },
  ]);

  const [equation, setEquation] = useState("2x + 3 = 7");
  const [solution, setSolution] = useState(() => solveLinear("2x + 3 = 7"));
  const [eqError, setEqError] = useState<string | null>(null);

  function evaluate(raw = expr) {
    const cleaned = raw.trim().replace(/×/g, "*").replace(/÷/g, "/").replace(/,/g, ".");
    if (!cleaned) return;
    try {
      const { steps, result } = expressionSteps(cleaned);
      if (!Number.isFinite(result)) throw new Error("Résultat infini");
      const formatted = formatNumber(result);
      setOutput({ result: formatted, steps });
      setAns(String(result));
      setHistory(prev => [{ id: `${Date.now()}`, expr: raw.trim(), result: formatted, steps }, ...prev].slice(0, 12));
    } catch {
      setOutput({ result: "—", steps: [], error: "Expression incomplète ou invalide. Vérifie les parenthèses et les opérateurs." });
    }
  }

  function appendToken(token: string) {
    setExpr(prev => (prev === "0" ? token : prev + token));
  }

  function handleEquation(e?: FormEvent, nextEq = equation) {
    if (e) e.preventDefault();
    try {
      const res = solveLinear(nextEq);
      if (!res) {
        setSolution(null);
        setEqError("Entre une équation du 1er degré valide en x, par exemple : 2x + 3 = 7.");
        return;
      }
      setEqError(null);
      setSolution(res);
    } catch {
      setSolution(null);
      setEqError("Syntaxe non reconnue. Exemple attendu : 3x - 4 = 11.");
    }
  }

  return <>
    <PageTitle title="Calculatrice intelligente" subtitle="Calcule, visualise chaque étape et résous des équations du 1er degré." />

    <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
      <section className="panel p-6">
        <div className="segmented mb-6" role="tablist" aria-label="Mode de calcul">
          <button type="button" role="tab" aria-selected={mode === "calc"} className={mode === "calc" ? "active" : ""} onClick={() => setMode("calc")}>
            Calculatrice scientifique
          </button>
          <button type="button" role="tab" aria-selected={mode === "equation"} className={mode === "equation" ? "active" : ""} onClick={() => setMode("equation")}>
            Résolveur d’équation
          </button>
        </div>

        {mode === "calc" ? (
          <div>
            <form onSubmit={e => { e.preventDefault(); evaluate(); }} className="rounded-2xl border bg-background p-4 mb-4">
              <label className="sr-only" htmlFor="calc-input">Expression mathématique</label>
              <input
                id="calc-input"
                value={expr}
                onChange={e => setExpr(e.target.value)}
                placeholder="Ex : (3 + 5) * 2 - 4"
                className="w-full bg-transparent text-right font-mono text-base sm:text-lg outline-none text-muted-foreground"
              />
              <div className="text-right font-display text-3xl sm:text-4xl font-extrabold mt-2 tabular-nums text-foreground">
                {output.error ? <span className="text-sm font-sans font-medium text-reward">{output.error}</span> : `= ${output.result}`}
              </div>
            </form>

            <div className="flex flex-wrap gap-1.5 mb-4">
              {calcExamples.map(ex => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => { setExpr(ex); evaluate(ex); }}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  {ex}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-5 gap-2 mb-2">
              {sciKeys.map(k => (
                <button key={k.label} type="button" className="calc-key fn" onClick={() => appendToken(k.insert)}>
                  {k.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-5 gap-2">
              {[
                { label: "7", val: "7" }, { label: "8", val: "8" }, { label: "9", val: "9" },
                { label: "÷", val: " / ", cls: "op" }, { label: "⌫", action: "back", cls: "fn" },
                { label: "4", val: "4" }, { label: "5", val: "5" }, { label: "6", val: "6" },
                { label: "×", val: " * ", cls: "op" }, { label: "C", action: "clear", cls: "fn" },
                { label: "1", val: "1" }, { label: "2", val: "2" }, { label: "3", val: "3" },
                { label: "−", val: " - ", cls: "op" }, { label: "Ans", val: ans, cls: "fn" },
                { label: "0", val: "0" }, { label: ".", val: "." }, { label: "%", val: " / 100" },
                { label: "+", val: " + ", cls: "op" }, { label: "=", action: "eval", cls: "eq" },
              ].map((btn, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={btn.action === "back" ? "Effacer le dernier caractère" : btn.action === "clear" ? "Tout effacer" : btn.label}
                  className={`calc-key ${btn.cls ?? ""}`}
                  onClick={() => {
                    if (btn.action === "back") setExpr(p => p.slice(0, -1));
                    else if (btn.action === "clear") { setExpr(""); setOutput({ result: "0", steps: [] }); }
                    else if (btn.action === "eval") evaluate();
                    else if (btn.val) appendToken(btn.val);
                  }}
                >
                  {btn.action === "back" ? <Delete size={17} /> : btn.action === "eval" ? <Equal size={18} /> : btn.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <form onSubmit={e => handleEquation(e)} className="flex flex-col sm:flex-row gap-2 mb-4">
              <input
                aria-label="Équation à résoudre"
                className="field font-mono text-base flex-1"
                value={equation}
                onChange={e => setEquation(e.target.value)}
                placeholder="Ex : 2x + 3 = 7"
              />
              <Button type="submit" className="h-11 px-6"><Calculator />Résoudre</Button>
            </form>

            <div className="flex flex-wrap gap-1.5 mb-5">
              {equationExamples.map(ex => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => { setEquation(ex); handleEquation(undefined, ex); }}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  {ex}
                </button>
              ))}
            </div>

            {eqError && (
              <div className="rounded-xl bg-reward-soft text-reward p-4 text-sm font-medium">{eqError}</div>
            )}

            {solution && (
              <div className="rounded-2xl border bg-background p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="subject-pill bg-success-soft text-success"><Sparkles size={12} />Solution trouvée</span>
                  <span className="font-display text-2xl font-extrabold text-primary">x = {formatNumber(solution.x)}</span>
                </div>
                <ol className="space-y-2.5">
                  {solution.steps.map((s, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                      <span className="result-index">{i + 1}</span>
                      <span className={i === solution.steps.length - 1 ? "font-bold text-primary" : "text-foreground/90"}>{s}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        )}
      </section>

      <aside className="space-y-5">
        {mode === "calc" && (
          <section className="panel p-5">
            <h2 className="panel-title mb-3"><Lightbulb size={17} className="text-reward" />Étape par étape</h2>
            {output.steps.length > 0 ? (
              <ol className="space-y-2">
                {output.steps.map((step, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-xs font-mono">
                    <span className="result-index">{i + 1}</span>
                    <span className={i === output.steps.length - 1 ? "font-bold text-primary" : "text-muted-foreground"}>{step}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-xs text-muted-foreground">Entre un calcul pour voir sa décomposition priorité par priorité.</p>
            )}
          </section>
        )}

        <section className="panel p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="panel-title"><History size={17} className="text-primary" />Historique</h2>
            {history.length > 0 && (
              <button type="button" className="text-[11px] text-muted-foreground hover:text-foreground" onClick={() => setHistory([])}>
                Effacer
              </button>
            )}
          </div>
          {history.length > 0 ? (
            <ul className="space-y-2">
              {history.map(item => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => { setMode("calc"); setExpr(item.expr); setOutput({ result: item.result, steps: item.steps }); }}
                    className="w-full text-left rounded-xl border p-3 hover:bg-muted/60 transition-colors"
                  >
                    <p className="font-mono text-xs text-muted-foreground truncate">{item.expr}</p>
                    <p className="font-display font-bold text-sm text-foreground mt-0.5">= {item.result}</p>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground">Aucun calcul récent.</p>
          )}
        </section>

        <section className="panel p-4 flex items-center gap-3 bg-primary-soft/50">
          <Fino mood="encouraging" className="w-12 shrink-0" />
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Astuce : observe l’ordre des parenthèses et des puissances dans la décomposition étape par étape !
          </p>
        </section>
      </aside>
    </div>
  </>;
}
