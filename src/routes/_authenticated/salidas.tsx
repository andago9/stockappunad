import { createFileRoute } from "@tanstack/react-router";
import { InDevelopment } from "@/components/app/ui-bits";

export const Route = createFileRoute("/_authenticated/salidas")({
  head: () => ({ meta: [{ title: "Salidas · Stocka" }, { name: "description", content: "Módulo de Salidas en desarrollo." }] }),
  component: () => <InDevelopment title="Salidas" />,
});
