import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, Pencil, Plus, Power, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PageHeader, Pill, StockPill } from "@/components/app/ui-bits";
import { money, setActive, stockLevel, useProducts, type Product } from "@/lib/products";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/productos/")({
  head: () => ({ meta: [{ title: "Productos · Stocka" }, { name: "description", content: "Registro y consulta de productos." }] }),
  component: ProductsPage,
});

function ProductsPage() {
  const products = useProducts();
  const [q, setQ] = useState("");
  const [target, setTarget] = useState<Product | null>(null);
  const term = q.trim().toLowerCase();
  const list = products.filter((p) => !term || [p.code, p.name, p.category].some((f) => f.toLowerCase().includes(term)));

  return (
    <div>
      <PageHeader title="Productos" subtitle={`${products.length} productos registrados`}>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input className="w-64 pl-9" placeholder="Buscar por código, nombre o categoría" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Button asChild><Link to="/productos/nuevo"><Plus className="h-4 w-4" /> Nuevo producto</Link></Button>
      </PageHeader>
      <div className="rounded-xl border bg-card shadow-card">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Código</TableHead><TableHead>Producto</TableHead><TableHead>Categoría</TableHead><TableHead className="text-right">Precio</TableHead>
            <TableHead className="text-right">Existencias</TableHead><TableHead>Estado</TableHead><TableHead className="text-right">Acciones</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {list.length === 0 && <TableRow><TableCell colSpan={7} className="py-12 text-center text-muted-foreground">No se encontraron productos.</TableCell></TableRow>}
            {list.map((p) => (
              <TableRow key={p.id} className={cn(!p.active && "opacity-60")}>
                <TableCell className="font-mono text-xs">{p.code}</TableCell>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell>{p.category}</TableCell>
                <TableCell className="text-right">{money(p.price)}</TableCell>
                <TableCell className="text-right"><div className="flex items-center justify-end gap-2"><span className="font-semibold">{p.stock}</span><StockPill level={stockLevel(p)} /></div></TableCell>
                <TableCell>{p.active ? <Pill tone="success">Activo</Pill> : <Pill tone="muted">Inactivo</Pill>}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" asChild title="Ver"><Link to="/productos/$id" params={{ id: p.id }}><Eye className="h-4 w-4" /></Link></Button>
                    <Button variant="ghost" size="icon" asChild title="Editar"><Link to="/productos/$id/editar" params={{ id: p.id }}><Pencil className="h-4 w-4" /></Link></Button>
                    <Button variant="ghost" size="icon" title={p.active ? "Desactivar" : "Activar"} onClick={() => setTarget(p)}>
                      <Power className={cn("h-4 w-4", p.active ? "text-destructive" : "text-success")} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <AlertDialog open={!!target} onOpenChange={(o) => !o && setTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{target?.active ? "¿Desactivar producto?" : "¿Activar producto?"}</AlertDialogTitle>
            <AlertDialogDescription>
              {target?.active ? `"${target?.name}" seguirá registrado pero quedará marcado como inactivo.` : `"${target?.name}" volverá a estar activo.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (target) { setActive(target.id, !target.active); toast.success(target.active ? "Producto desactivado" : "Producto activado"); } setTarget(null); }}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
