import { createFileRoute } from "@tanstack/react-router";
import { FocusPage } from "@/components/studia/pages/focus-page";

export const Route = createFileRoute("/temps")({
  head: () => ({
    meta: [
      { title: "Temps & concentration · SchoolTools" },
      { name: "description", content: "Minuteur Pomodoro, minuteur intelligent et suivi de tes sessions d’étude." },
    ],
  }),
  component: FocusPage,
});
