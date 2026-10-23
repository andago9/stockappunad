import { createFileRoute } from "@tanstack/react-router";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MovementForm } from "@/components/app/MovementForm";
import { PageHeader, Pill } from "@/components/app/ui-bits";
import { useMovements } from "@/lib/movements";
import { useProducts } from "@/lib/products";
import { getSession } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/entradas")({
  head: () => ({ meta: [{ title: "Entradas · Stocka" }, { name: "description", content: "Registro de entradas de mercancía al inventario." }] }),
  component: EntradasPage,
});

function EntradasPage() {
  const products = useProducts();
  const movements = useMovements();
  const entradas = movements.filter((m) => m.type === "Entrada");

  return (
    <div className="space-y-6">
      <PageHeader title="Entradas" subtitle="Registra la mercancía que ingresa al inventario" />
      <MovementForm kind="entrada" products={products} user={getSession()?.name ?? "Andrés González"} />
      <section className="rounded-xl border bg-card shadow-card">
        <h2 className="px-5 pt-5 font-semibold">Entradas recientes</h2>
        <div className="p-5">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead><TableHead>Producto</TableHead>
                <TableHead className="text-right">Cantidad</TableHead><TableHead>Usuario</TableHead><TableHead>Nota</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entradas.length === 0 && (
                <TableRow><TableCell colSpan={5} className="py-10 text-center text-muted-foreground">Aún no hay entradas registradas.</TableCell></TableRow>
              )}
              {entradas.slice(0, 8).map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="whitespace-nowrap text-muted-foreground">{m.date}</TableCell>
                  <TableCell className="font-medium">{m.product}</TableCell>
                  <TableCell className="text-right"><Pill tone="success">+{m.qty}</Pill></TableCell>
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
