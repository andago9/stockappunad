import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, Pill, StockPill } from "@/components/app/ui-bits";
import { money, stockLevel, useProducts } from "@/lib/products";

export const Route = createFileRoute("/_authenticated/productos/$id")({
  head: () => ({ meta: [{ title: "Detalle de producto · stockapp UNAD" }, { name: "description", content: "Información del producto." }] }),
  component: ProductDetail,
});

function ProductDetail() {
  const { id } = Route.useParams();
  const p = useProducts().find((x) => x.id === id);
  if (!p) return <div className="text-muted-foreground">Producto no encontrado. <Link to="/productos" className="text-primary underline">Volver</Link></div>;
  const rows = [
    ["Código", p.code], ["Categoría", p.category], ["Precio", money(p.price)],
    ["Existencias", String(p.stock)], ["Stock mínimo", String(p.minStock)],
  ];
  return (
    <div>
      <PageHeader title={p.name} subtitle={p.description || "Sin descripción"}>
        <Button variant="outline" asChild><Link to="/productos"><ArrowLeft className="h-4 w-4" /> Volver</Link></Button>
        <Button asChild><Link to="/productos/$id/editar" params={{ id }}><Pencil className="h-4 w-4" /> Editar</Link></Button>
      </PageHeader>
      <div className="max-w-3xl rounded-xl border bg-card p-6 shadow-card">
        <div className="mb-6 flex gap-2">{p.active ? <Pill tone="success">Activo</Pill> : <Pill tone="muted">Inactivo</Pill>}<StockPill level={stockLevel(p)} /></div>
        <dl className="grid gap-5 sm:grid-cols-2">
          {rows.map(([k, val]) => <div key={k}><dt className="text-xs uppercase tracking-wide text-muted-foreground">{k}</dt><dd className="mt-1 text-lg font-semibold">{val}</dd></div>)}
        </dl>
      </div>
    </div>
  );
}
