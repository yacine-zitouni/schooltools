export async function mockTutor(message: string) {
  await new Promise(resolve => setTimeout(resolve, 900));
  return message.toLowerCase().includes("dériv") ? "La dérivée mesure la variation d’une fonction. Pour f(x) = x², on a f′(x) = 2x. Par exemple, en x = 3, la pente vaut 6. On utilise la règle : (xⁿ)′ = n × xⁿ⁻¹. Tu veux essayer avec x³ ?" : "Décomposons ce sujet ensemble ! Commence par identifier la notion principale dans ton cours, puis reformule-la avec tes propres mots. Un exemple concret permet souvent de mieux comprendre. Quelle partie souhaites-tu approfondir ?";
}
export async function mockGenerate(kind: string, count: number) {
  await new Promise(resolve => setTimeout(resolve, 1100));
  return Array.from({ length: count }, (_, i) => `${kind} ${i + 1} — ${["Définis la notion de dérivée et donne un exemple.", "Calcule la dérivée de f(x) = x² + 3x.", "Explique le lien entre dérivée et pente d’une tangente."][i % 3]}`);
}