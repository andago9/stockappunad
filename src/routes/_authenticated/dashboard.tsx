import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2, Package, XCircle } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader, Pill } from "@/components/app/ui-bits";
import { stockLevel, useProducts } from "@/lib/products";
import { useMovements } from "@/lib/movements";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard · stockapp UNAD" }, { name: "description", content: "Estado general del inventario." }] }),
  component: Dashboard,
});

function Dashboard() {
  const products = useProducts();
  const movements = useMovements();
  const cards = [
    { label: "Total de productos", value: products.length, icon: Package, cls: "bg-info/15 text-info" },
    { label: "Con existencias", value: products.filter((p) => p.stock > 0).length, icon: CheckCircle2, cls: "bg-success/15 text-success" },
    { label: "Stock bajo", value: products.filter((p) => stockLevel(p) === "low").length, icon: AlertTriangle, cls: "bg-warning/20 text-warning-foreground" },
    { label: "Agotados", value: products.filter((p) => stockLevel(p) === "out").length, icon: XCircle, cls: "bg-destructive/12 text-destructive" },
  ];
  const chart = products.filter((p) => p.active).map((p) => ({ name: p.name.split(" ").slice(0, 2).join(" "), stock: p.stock }));
  const tone = { Entrada: "success", Salida: "warning", Venta: "info" } as const;

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" subtitle="Resumen del estado de tu inventario" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border bg-card p-5 shadow-card">
            <div className={`mb-4 inline-flex rounded-lg p-2 ${c.cls}`}><c.icon className="h-5 w-5" /></div>
            <p className="text-3xl font-bold">{c.value}</p>
            <p className="text-sm text-muted-foreground">{c.label}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-5">
        <section className="rounded-xl border bg-card p-5 shadow-card xl:col-span-2">
          <h2 className="mb-4 font-semibold">Existencias por producto</h2>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={chart} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis type="category" dataKey="name" width={110} stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip cursor={{ fill: "var(--muted)" }} />
                <Bar dataKey="stock" name="Existencias" fill="var(--primary)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="rounded-xl border bg-card p-5 shadow-card xl:col-span-3">
          <h2 className="mb-4 font-semibold">Movimientos recientes</h2>
          <Table>
            <TableHeader><TableRow><TableHead>Fecha</TableHead><TableHead>Producto</TableHead><TableHead>Tipo</TableHead><TableHead className="text-right">Cantidad</TableHead><TableHead>Usuario</TableHead></TableRow></TableHeader>
            <TableBody>
              {movements.slice(0, 5).map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="whitespace-nowrap text-muted-foreground">{m.date}</TableCell>
                  <TableCell className="font-medium">{m.product}</TableCell>
                  <TableCell><Pill tone={tone[m.type]}>{m.type}</Pill></TableCell>
                  <TableCell className="text-right">{m.qty}</TableCell>
                  <TableCell className="whitespace-nowrap">{m.user}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>
      </div>
    </div>
  );
}
