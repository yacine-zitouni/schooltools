import { courseDocuments, decks, quizQuestions } from "@/data/studia";

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export type TutorSource = { docId: string; title: string; page: number; excerpt: string };
export type TutorReply = { text: string; sources: TutorSource[] };

function source(docId: string, page: number): TutorSource {
  const doc = courseDocuments.find(d => d.id === docId) ?? courseDocuments[0]!;
  return { docId: doc.id, title: doc.title, page, excerpt: doc.excerpt };
}

export async function mockTutor(message: string): Promise<TutorReply> {
  await wait(700);
  const m = message.toLowerCase();
  if (m.includes("dériv")) return { text: "### La dérivée, en clair\nLa dérivée mesure **la vitesse à laquelle une fonction change**. Graphiquement, c’est la pente de la tangente à la courbe.\n\n- Pour f(x) = x², on a `f′(x) = 2x`\n- En x = 3, la pente vaut donc **6**\n- Règle générale : `(xⁿ)′ = n × xⁿ⁻¹`\n\nTu veux essayer avec x³ ? 😊", sources: [source("doc-derivees", 2), source("doc-derivees", 5)] };
  if (m.includes("métaphore") || m.includes("figure")) return { text: "### La métaphore\nUne métaphore rapproche deux réalités **sans outil de comparaison** (pas de « comme », « tel que »…).\n\n1. Comparaison : *Il est fort comme un lion.*\n2. Métaphore : *Cet homme est un lion.*\n\nAstuce : si tu peux ajouter « comme » sans changer le sens, c’est sûrement une métaphore !", sources: [source("doc-figures", 3)] };
  if (m.includes("énergie") || m.includes("cinétique")) return { text: "### L’énergie cinétique\nC’est l’énergie liée au **mouvement** d’un objet :\n\n`Ec = ½ × m × v²`\n\n- **m** : la masse en kg\n- **v** : la vitesse en m/s\n- **Ec** : l’énergie en joules (J)\n\nExemple : un vélo de 80 kg à 5 m/s a une énergie de **1 000 J**.", sources: [source("doc-energie", 4)] };
  if (m.includes("réviser") || m.includes("question")) return { text: "### Petit entraînement 💪\nRéponds dans ta tête, puis vérifie :\n\n1. Quelle est la dérivée de x³ ?\n2. Qu’est-ce qu’un oxymore ?\n3. Quelle est l’unité de l’énergie ?\n\nQuand tu es prêt, écris-moi tes réponses et je te corrige !", sources: [source("doc-derivees", 7), source("doc-figures", 5), source("doc-energie", 2)] };
  return { text: "### Décomposons ensemble\nVoici une méthode simple :\n\n1. **Repère** la notion principale dans ton cours\n2. **Reformule**-la avec tes propres mots\n3. **Illustre**-la avec un exemple concret\n\nQuelle partie souhaites-tu approfondir ?", sources: [source("doc-derivees", 1)] };
}

export type GeneratorKind = "Questions" | "Quiz" | "Carte mentale" | "Flashcards";
export type GeneratedQuestion = { id: string; text: string };
export type GeneratedQuiz = { id: string; question: string; answers: string[]; correct: number };
export type GeneratedBranch = { id: string; branch: string; children: string[] };
export type GeneratedCard = { id: string; front: string; back: string };
export type GeneratedResult =
  | { kind: "Questions"; items: GeneratedQuestion[] }
  | { kind: "Quiz"; items: GeneratedQuiz[] }
  | { kind: "Carte mentale"; center: string; items: GeneratedBranch[] }
  | { kind: "Flashcards"; items: GeneratedCard[] };

const openQuestions = ["Définis la notion de dérivée et donne un exemple.", "Calcule la dérivée de f(x) = x² + 3x.", "Explique le lien entre dérivée et pente d’une tangente.", "Étudie le sens de variation de f(x) = x³ − 3x.", "Pourquoi la dérivée d’une constante est-elle nulle ?", "Donne l’équation de la tangente à f(x) = x² en x = 1."];
const branches = [
  { branch: "Définition", children: ["Taux de variation", "Nombre dérivé f′(a)"] },
  { branch: "Règles de calcul", children: ["(xⁿ)′ = n xⁿ⁻¹", "(u + v)′", "(u × v)′"] },
  { branch: "Interprétation", children: ["Pente de la tangente", "Vitesse instantanée"] },
  { branch: "Applications", children: ["Sens de variation", "Extremums"] },
  { branch: "Exemples", children: ["x² → 2x", "x³ → 3x²"] },
  { branch: "Pièges", children: ["Oublier le coefficient", "Confondre f et f′"] },
];

export async function mockGenerate(kind: GeneratorKind, count: number): Promise<GeneratedResult> {
  await wait(1800);
  const ids = Array.from({ length: count }, (_, i) => `${kind}-${Date.now()}-${i}`);
  if (kind === "Questions") return { kind, items: ids.map((id, i) => ({ id, text: openQuestions[i % openQuestions.length]! })) };
  if (kind === "Quiz") return { kind, items: ids.map((id, i) => { const q = quizQuestions[i % quizQuestions.length]!; return { id, question: q.question, answers: [...q.answers], correct: q.correct }; }) };
  if (kind === "Carte mentale") return { kind, center: "Les dérivées", items: ids.slice(0, Math.min(count, branches.length)).map((id, i) => ({ id, ...branches[i]!, children: [...branches[i]!.children] })) };
  const cards = decks.flatMap(d => d.cards);
  return { kind, items: ids.map((id, i) => { const c = cards[i % cards.length]!; return { id, front: c.front, back: c.back }; }) };
}
