import { createFileRoute } from "@tanstack/react-router";
import { ProfilePage } from "@/components/studia/pages/profile-page";

export const Route = createFileRoute("/profil")({
  head: () => ({
    meta: [
      { title: "Profil & récompenses · SchoolTools" },
      { name: "description", content: "Ton niveau, ton activité, tes badges et tes préférences SchoolTools." },
    ],
  }),
  component: ProfilePage,
});
