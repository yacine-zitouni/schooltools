export const grades = [
  { date: "14 oct.", math: 11, french: 13, physics: 10 }, { date: "21 oct.", math: 13, french: 12, physics: 12 },
  { date: "28 oct.", math: 12, french: 14, physics: 11 }, { date: "4 nov.", math: 15, french: 13, physics: 14 },
  { date: "11 nov.", math: 14, french: 15, physics: 13 }, { date: "14 nov.", math: 17, french: 16, physics: 15 },
];
export const quizQuestions = [
  { question: "Quelle est la dérivée de la fonction f(x) = x² ?", answers: ["f′(x) = x", "f′(x) = 2x", "f′(x) = 2", "f′(x) = x³"], correct: 1, explanation: "La dérivée de xⁿ est n × xⁿ⁻¹. Pour x², on obtient donc 2x." },
  { question: "Quelle est la dérivée de f(x) = 3x + 5 ?", answers: ["3x", "5", "3", "8"], correct: 2, explanation: "La dérivée d’une fonction affine ax + b est la constante a." },
  { question: "Quelle est la dérivée d’une constante ?", answers: ["0", "1", "La constante", "x"], correct: 0, explanation: "Une constante ne varie pas : son taux de variation est nul." },
];
export const flashcards = [
  { front: "Quelle est la dérivée de x² ?", back: "2x", subject: "Les dérivées" },
  { front: "Qu’est-ce qu’une métaphore ?", back: "Une comparaison sans outil de comparaison.", subject: "Figures de style" },
  { front: "Quelle est la formule de l’énergie cinétique ?", back: "Ec = ½ × m × v²", subject: "Énergie et mouvement" },
];
export const documents = ["Mathématiques · Les dérivées.pdf", "Français · Figures de style.pdf", "Physique · Énergie et mouvement.pdf"];