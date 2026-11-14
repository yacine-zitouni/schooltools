import { parse, type MathNode, ConstantNode } from "mathjs";

/** Average weighted by coefficient, rounded to one decimal. */
export function weightedAverage(rows: { grade: number; coefficient: number }[]) {
  const weight = rows.reduce((s, r) => s + r.coefficient, 0);
  if (!weight) return 0;
  return Math.round((rows.reduce((s, r) => s + r.grade * r.coefficient, 0) / weight) * 10) / 10;
}

/** Trailing moving average over `window` points. */
export function movingAverage(values: number[], window = 3) {
  return values.map((_, i) => {
    const slice = values.slice(Math.max(0, i - window + 1), i + 1);
    return Math.round((slice.reduce((s, v) => s + v, 0) / slice.length) * 100) / 100;
  });
}

export function formatNumber(value: number) {
  if (!Number.isFinite(value)) return String(value);
  return String(Math.round(value * 1e8) / 1e8).replace(".", ",");
}

/** Reduces an arithmetic expression one operation at a time, innermost first. */
export function expressionSteps(expression: string): { steps: string[]; result: number } {
  let node: MathNode = parse(expression);
  const steps = [node.toString()];
  const isConst = (n: MathNode) => n.type === "ConstantNode";
  for (let guard = 0; guard < 40 && !isConst(node); guard++) {
    let done = false;
    node = node.transform((n) => {
      if (done) return n;
      if (n.type === "SymbolNode" && ["pi", "e"].includes((n as unknown as { name: string }).name)) { done = true; return new ConstantNode(Number(n.evaluate().toFixed(6))); }
      if (n.type === "ParenthesisNode") { const inner = (n as unknown as { content: MathNode }).content; if (isConst(inner)) { done = true; return inner; } return n; }
      if ((n.type === "OperatorNode" || n.type === "FunctionNode") && (n as unknown as { args: MathNode[] }).args.every(isConst)) {
        done = true; const v = n.evaluate() as number; return new ConstantNode(Math.round(v * 1e6) / 1e6);
      }
      return n;
    });
    if (!done) break;
    const text = node.toString();
    if (text !== steps.at(-1)) steps.push(text);
  }
  return { steps, result: Number(parse(expression).evaluate()) };
}

/** Solves a linear equation in x such as "2x + 3 = 7". Returns null when it is not linear. */
export function solveLinear(equation: string): { a: number; b: number; c: number; x: number; steps: string[] } | null {
  const [left, right] = equation.split("=");
  if (!left || right === undefined) return null;
  const f = parse(`(${left}) - (${right})`).compile();
  const at = (x: number) => Number(f.evaluate({ x }));
  const b0 = at(0), a = at(1) - b0;
  if (!a || Math.abs(at(2) - (2 * a + b0)) > 1e-9) return null;
  const x = Math.round((-b0 / a) * 1e6) / 1e6;
  const c = -b0;
  return { a, b: 0, c, x, steps: [
    `${equation.trim()}`,
    `On regroupe les termes en x à gauche : ${formatNumber(a)}x = ${formatNumber(c)}`,
    `On divise par ${formatNumber(a)} : x = ${formatNumber(c)} ÷ ${formatNumber(a)}`,
    `x = ${formatNumber(x)}`,
  ] };
}
