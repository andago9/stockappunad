import { createFileRoute } from "@tanstack/react-router";
import { InDevelopment } from "@/components/app/ui-bits";

export const Route = createFileRoute("/_authenticated/entradas")({
  head: () => ({ meta: [{ title: "Entradas · Stocka" }, { name: "description", content: "Módulo de Entradas en desarrollo." }] }),
  component: () => <InDevelopment title="Entradas" />,
});
