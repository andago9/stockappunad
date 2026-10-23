import { createFileRoute } from "@tanstack/react-router";
import { InDevelopment } from "@/components/app/ui-bits";

export const Route = createFileRoute("/_authenticated/reportes")({
  head: () => ({ meta: [{ title: "Reportes · stockapp UNAD" }, { name: "description", content: "Módulo de Reportes en desarrollo." }] }),
  component: () => <InDevelopment title="Reportes" />,
});
