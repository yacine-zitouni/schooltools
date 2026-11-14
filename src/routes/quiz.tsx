import { createFileRoute } from "@tanstack/react-router";
import { QuizPage } from "@/components/studia/pages/quiz-page";

export const Route = createFileRoute("/quiz")({
  head: () => ({
    meta: [
      { title: "Quiz · SchoolTools" },
      { name: "description", content: "Entraîne-toi avec des quiz chronométrés et des explications détaillées." },
    ],
  }),
  component: QuizPage,
});
