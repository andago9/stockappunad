import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowDownToLine, ArrowUpFromLine, History } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader, Pill } from "@/components/app/ui-bits";
import { useMovements, type MovementType } from "@/lib/movements";

export const Route = createFileRoute("/_authenticated/movimientos")({
  head: () => ({ meta: [{ title: "Movimientos · stockapp UNAD" }, { name: "description", content: "Historial completo de movimientos del inventario." }] }),
  component: MovimientosPage,
});

function MovimientosPage() {
  const movements = useMovements();
  const [q, setQ] = useState("");
  const [type, setType] = useState<"todos" | MovementType>("todos");

  const term = q.trim().toLowerCase();
  const list = movements.filter(
    (m) =>
      (type === "todos" || m.type === type) &&
      (!term || [m.product, m.user, m.note].some((f) => f.toLowerCase().includes(term))),
  );

  const ingresadas = movements.filter((m) => m.type === "Entrada").reduce((s, m) => s + m.qty, 0);
  const egresadas = movements.filter((m) => m.type !== "Entrada").reduce((s, m) => s + m.qty, 0);
  const stats = [
    { label: "Movimientos", value: movements.length, icon: History, cls: "bg-info/15 text-info" },
    { label: "Unidades ingresadas", value: `+${ingresadas}`, icon: ArrowDownToLine, cls: "bg-success/15 text-success" },
    { label: "Unidades egresadas", value: `−${egresadas}`, icon: ArrowUpFromLine, cls: "bg-warning/20 text-warning-foreground" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Movimientos" subtitle={`${movements.length} movimientos registrados`} />
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="flex items-center gap-4 rounded-xl border bg-card p-5 shadow-card">
            <div className={`inline-flex rounded-lg p-2 ${s.cls}`}><s.icon className="h-5 w-5" /></div>
            <div><p className="text-2xl font-bold">{s.value}</p><p className="text-sm text-muted-foreground">{s.label}</p></div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Input className="w-64" placeholder="Buscar por producto, usuario o nota" value={q} onChange={(e) => setQ(e.target.value)} />
        <Select value={type} onValueChange={(t) => setType(t as typeof type)}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los tipos</SelectItem>
            <SelectItem value="Entrada">Entradas</SelectItem>
            <SelectItem value="Salida">Salidas</SelectItem>
            <SelectItem value="Venta">Ventas</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="rounded-xl border bg-card shadow-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead><TableHead>Producto</TableHead><TableHead>Tipo</TableHead>
              <TableHead className="text-right">Cantidad</TableHead><TableHead>Usuario</TableHead><TableHead>Nota</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.length === 0 && (
              <TableRow><TableCell colSpan={6} className="py-12 text-center text-muted-foreground">No se encontraron movimientos.</TableCell></TableRow>
            )}
            {list.map((m) => (
              <TableRow key={m.id}>
                <TableCell className="whitespace-nowrap text-muted-foreground">{m.date}</TableCell>
                <TableCell className="font-medium">{m.product}</TableCell>
                <TableCell>
                  <Pill tone={m.type === "Entrada" ? "success" : m.type === "Venta" ? "info" : "warning"}>{m.type}</Pill>
                </TableCell>
                <TableCell className="text-right font-semibold">{m.type === "Entrada" ? `+${m.qty}` : `−${m.qty}`}</TableCell>
                <TableCell className="whitespace-nowrap">{m.user}</TableCell>
                <TableCell className="max-w-64 truncate text-muted-foreground">{m.note || "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
