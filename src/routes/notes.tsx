import { createFileRoute } from "@tanstack/react-router";
import { GradesPage } from "@/components/studia/pages/grades-page";

export const Route = createFileRoute("/notes")({
  head: () => ({
    meta: [
      { title: "Mes notes · SchoolTools" },
      { name: "description", content: "Calcule ta moyenne pondérée et suis ta progression par matière." },
    ],
  }),
  component: GradesPage,
});
