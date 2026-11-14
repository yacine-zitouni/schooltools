import { createFileRoute } from "@tanstack/react-router";
import { CalculatorPage } from "@/components/studia/pages/calculator-page";

export const Route = createFileRoute("/calculatrice")({
  head: () => ({
    meta: [
      { title: "Calculatrice · SchoolTools" },
      { name: "description", content: "Calculatrice scientifique avec décomposition étape par étape et solveur d’équations." },
    ],
  }),
  component: CalculatorPage,
});
