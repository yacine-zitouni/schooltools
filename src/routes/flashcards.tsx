import { createFileRoute } from "@tanstack/react-router";
import { FlashcardsPage } from "@/components/studia/pages/flashcards-page";

export const Route = createFileRoute("/flashcards")({
  head: () => ({
    meta: [
      { title: "Flashcards · SchoolTools" },
      { name: "description", content: "Révise tes cartes avec la répétition espacée et suis tes paquets." },
    ],
  }),
  component: FlashcardsPage,
});
