import { createFileRoute } from "@tanstack/react-router";
import { InDevelopment } from "@/components/app/ui-bits";

export const Route = createFileRoute("/_authenticated/ventas")({
  head: () => ({ meta: [{ title: "Ventas · stockapp UNAD" }, { name: "description", content: "Módulo de Ventas en desarrollo." }] }),
  component: () => <InDevelopment title="Ventas" />,
});
