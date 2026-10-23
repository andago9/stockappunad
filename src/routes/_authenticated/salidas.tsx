import { createFileRoute } from "@tanstack/react-router";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MovementForm } from "@/components/app/MovementForm";
import { PageHeader, Pill } from "@/components/app/ui-bits";
import { useMovements } from "@/lib/movements";
import { useProducts } from "@/lib/products";
import { getSession } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/salidas")({
  head: () => ({ meta: [{ title: "Salidas · stockapp UNAD" }, { name: "description", content: "Registro de salidas de mercancía del inventario." }] }),
  component: SalidasPage,
});

function SalidasPage() {
  const products = useProducts();
  const movements = useMovements();
  const salidas = movements.filter((m) => m.type === "Salida" || m.type === "Venta");

  return (
    <div className="space-y-6">
      <PageHeader title="Salidas" subtitle="Registra la mercancía que sale del inventario" />
      <MovementForm kind="salida" products={products} user={getSession()?.name ?? "Andrés González"} />
      <section className="rounded-xl border bg-card shadow-card">
        <h2 className="px-5 pt-5 font-semibold">Salidas recientes</h2>
        <div className="p-5">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead><TableHead>Producto</TableHead><TableHead>Tipo</TableHead>
                <TableHead className="text-right">Cantidad</TableHead><TableHead>Usuario</TableHead><TableHead>Nota</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salidas.length === 0 && (
                <TableRow><TableCell colSpan={6} className="py-10 text-center text-muted-foreground">Aún no hay salidas registradas.</TableCell></TableRow>
              )}
              {salidas.slice(0, 8).map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="whitespace-nowrap text-muted-foreground">{m.date}</TableCell>
                  <TableCell className="font-medium">{m.product}</TableCell>
                  <TableCell><Pill tone={m.type === "Venta" ? "info" : "warning"}>{m.type}</Pill></TableCell>
                  <TableCell className="text-right">−{m.qty}</TableCell>
                  <TableCell className="whitespace-nowrap">{m.user}</TableCell>
                  <TableCell className="max-w-64 truncate text-muted-foreground">{m.note || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}
