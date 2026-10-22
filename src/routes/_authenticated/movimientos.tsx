import { createFileRoute } from "@tanstack/react-router";
import { InDevelopment } from "@/components/app/ui-bits";

export const Route = createFileRoute("/_authenticated/movimientos")({
  head: () => ({ meta: [{ title: "Movimientos · Stocka" }, { name: "description", content: "Módulo de Movimientos en desarrollo." }] }),
  component: () => <InDevelopment title="Movimientos" />,
});
