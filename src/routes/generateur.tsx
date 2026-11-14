import { createFileRoute } from "@tanstack/react-router";
import { GeneratorPage } from "@/components/studia/pages/generator-page";

export const Route = createFileRoute("/generateur")({
  head: () => ({
    meta: [
      { title: "Générateur · SchoolTools" },
      { name: "description", content: "Transforme tes cours en questions, quiz, cartes mentales ou flashcards." },
    ],
  }),
  component: GeneratorPage,
});
