import { createFileRoute } from "@tanstack/react-router";
import { MindMapPage } from "@/components/studia/pages/mind-map-page";

export const Route = createFileRoute("/carte-mentale")({
  head: () => ({
    meta: [
      { title: "Carte mentale · SchoolTools" },
      { name: "description", content: "Organise tes idées visuellement et exporte ta carte mentale." },
    ],
  }),
  component: MindMapPage,
});
