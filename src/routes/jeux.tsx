import { createFileRoute } from "@tanstack/react-router";
import { GamesPage } from "@/components/studia/pages/games-page";

export const Route = createFileRoute("/jeux")({
  head: () => ({
    meta: [
      { title: "Jeux éducatifs · SchoolTools" },
      { name: "description", content: "Memory, quiz éclair et associations pour apprendre en t’amusant." },
    ],
  }),
  component: GamesPage,
});
