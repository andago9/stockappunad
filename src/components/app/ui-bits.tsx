import { Construction } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { StockLevel } from "@/lib/products";

export function PageHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div><h1 className="text-2xl font-bold tracking-tight">{title}</h1>{subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}</div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

const tones = {
  success: "bg-success/15 text-success",
  warning: "bg-warning/20 text-warning-foreground",
  danger: "bg-destructive/12 text-destructive",
  info: "bg-info/15 text-info",
  muted: "bg-muted text-muted-foreground",
};
export function Pill({ tone, children }: { tone: keyof typeof tones; children: ReactNode }) {
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", tones[tone])}>{children}</span>;
}

export function StockPill({ level }: { level: StockLevel }) {
  if (level === "out") return <Pill tone="danger">Agotado</Pill>;
  if (level === "low") return <Pill tone="warning">Stock bajo</Pill>;
  return <Pill tone="success">Disponible</Pill>;
}

export function InDevelopment({ title }: { title: string }) {
  return (
    <div>
      <PageHeader title={title} />
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card px-6 py-20 text-center">
        <Construction className="h-10 w-10 text-primary" />
        <h2 className="mt-4 text-lg font-semibold">Módulo en desarrollo</h2>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">Esta sección estará disponible en una próxima etapa del sistema.</p>
      </div>
    </div>
  );
}
