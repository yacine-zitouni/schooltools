import{o as e}from"./button-BHTMuiVW.js";import{a as t,f as n,i as r}from"./studia-CVo8YGWu.js";var i=e(`loader-circle`,[[`path`,{d:`M21 12a9 9 0 1 1-6.219-8.56`,key:`13zald`}]]),a=e=>new Promise(t=>setTimeout(t,e));function o(e,t){let n=r.find(t=>t.id===e)??r[0];return{docId:n.id,title:n.title,page:t,excerpt:n.excerpt}}async function s(e){await a(700);let t=e.toLowerCase();return t.includes(`dériv`)?{text:`### La dérivée, en clair
La dérivée mesure **la vitesse à laquelle une fonction change**. Graphiquement, c’est la pente de la tangente à la courbe.

- Pour f(x) = x², on a \`f′(x) = 2x\`
- En x = 3, la pente vaut donc **6**
- Règle générale : \`(xⁿ)′ = n × xⁿ⁻¹\`

Tu veux essayer avec x³ ? 😊`,sources:[o(`doc-derivees`,2),o(`doc-derivees`,5)]}:t.includes(`métaphore`)||t.includes(`figure`)?{text:`### La métaphore
Une métaphore rapproche deux réalités **sans outil de comparaison** (pas de « comme », « tel que »…).

1. Comparaison : *Il est fort comme un lion.*
2. Métaphore : *Cet homme est un lion.*

Astuce : si tu peux ajouter « comme » sans changer le sens, c’est sûrement une métaphore !`,sources:[o(`doc-figures`,3)]}:t.includes(`énergie`)||t.includes(`cinétique`)?{text:`### L’énergie cinétique
C’est l’énergie liée au **mouvement** d’un objet :

\`Ec = ½ × m × v²\`

- **m** : la masse en kg
- **v** : la vitesse en m/s
- **Ec** : l’énergie en joules (J)

Exemple : un vélo de 80 kg à 5 m/s a une énergie de **1 000 J**.`,sources:[o(`doc-energie`,4)]}:t.includes(`réviser`)||t.includes(`question`)?{text:`### Petit entraînement 💪
Réponds dans ta tête, puis vérifie :

1. Quelle est la dérivée de x³ ?
2. Qu’est-ce qu’un oxymore ?
3. Quelle est l’unité de l’énergie ?

Quand tu es prêt, écris-moi tes réponses et je te corrige !`,sources:[o(`doc-derivees`,7),o(`doc-figures`,5),o(`doc-energie`,2)]}:{text:`### Décomposons ensemble
Voici une méthode simple :

1. **Repère** la notion principale dans ton cours
2. **Reformule**-la avec tes propres mots
3. **Illustre**-la avec un exemple concret

Quelle partie souhaites-tu approfondir ?`,sources:[o(`doc-derivees`,1)]}}var c=[`Définis la notion de dérivée et donne un exemple.`,`Calcule la dérivée de f(x) = x² + 3x.`,`Explique le lien entre dérivée et pente d’une tangente.`,`Étudie le sens de variation de f(x) = x³ − 3x.`,`Pourquoi la dérivée d’une constante est-elle nulle ?`,`Donne l’équation de la tangente à f(x) = x² en x = 1.`],l=[{branch:`Définition`,children:[`Taux de variation`,`Nombre dérivé f′(a)`]},{branch:`Règles de calcul`,children:[`(xⁿ)′ = n xⁿ⁻¹`,`(u + v)′`,`(u × v)′`]},{branch:`Interprétation`,children:[`Pente de la tangente`,`Vitesse instantanée`]},{branch:`Applications`,children:[`Sens de variation`,`Extremums`]},{branch:`Exemples`,children:[`x² → 2x`,`x³ → 3x²`]},{branch:`Pièges`,children:[`Oublier le coefficient`,`Confondre f et f′`]}];async function u(e,r){await a(1800);let i=Array.from({length:r},(t,n)=>`${e}-${Date.now()}-${n}`);if(e===`Questions`)return{kind:e,items:i.map((e,t)=>({id:e,text:c[t%c.length]}))};if(e===`Quiz`)return{kind:e,items:i.map((e,t)=>{let r=n[t%n.length];return{id:e,question:r.question,answers:[...r.answers],correct:r.correct}})};if(e===`Carte mentale`)return{kind:e,center:`Les dérivées`,items:i.slice(0,Math.min(r,l.length)).map((e,t)=>({id:e,...l[t],children:[...l[t].children]}))};let o=t.flatMap(e=>e.cards);return{kind:e,items:i.map((e,t)=>{let n=o[t%o.length];return{id:e,front:n.front,back:n.back}})}}export{s as n,i as r,u as t};