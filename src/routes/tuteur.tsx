import { createFileRoute } from "@tanstack/react-router";
import { TutorPage } from "@/components/studia/pages/tutor-page";

export const Route = createFileRoute("/tuteur")({
  head: () => ({
    meta: [
      { title: "Tuteur IA · SchoolTools" },
      { name: "description", content: "Pose tes questions à Fino à partir de tes documents de cours." },
    ],
  }),
  component: TutorPage,
});
