import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState, type FormEvent } from "react";
import { Plus, ShoppingCart, Trash2, Download, Receipt } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/ui-bits";
import { SalesTable } from "@/components/app/SalesTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { getSession } from "@/lib/auth";
import { money, useProducts } from "@/lib/products";
import { recordSale, useSales, validateSale, type CartItem } from "@/lib/sales";
import { downloadCsv, inDateRange, salesSummary } from "@/lib/reports";

export const Route = createFileRoute("/_authenticated/ventas")({
  head: () => ({ meta: [{ title: "Ventas · stockapp UNAD" }, { name: "description", content: "Registro y consulta de ventas de stockapp UNAD." }, { property: "og:title", content: "Ventas · stockapp UNAD" }, { property: "og:description", content: "Registro y consulta de ventas de stockapp UNAD." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: VentasPage,
});

function VentasPage() {
  const products = useProducts();
  const sales = useSales();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [productId, setProductId] = useState("");
  const [qty, setQty] = useState("1");
  const [customer, setCustomer] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState(false);
  const saving = useRef(false);
  const [q, setQ] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const invalidRange = Boolean(from && to && from > to);
  const selected = products.find((p) => p.id === productId);
  const total = cart.reduce((sum, item) => sum + (products.find((p) => p.id === item.productId)?.price ?? 0) * item.qty, 0);
  const filtered = invalidRange ? [] : sales.filter((sale) => inDateRange(sale.date, from, to) && [sale.number, sale.customer, sale.user, ...sale.items.map((i) => i.name)].some((s) => s.toLowerCase().includes(q.trim().toLowerCase())));
  const stats = salesSummary(filtered);

  function add(e: FormEvent) {
    e.preventDefault();
    if (!productId) { setError("Selecciona un producto."); return; }
    const next = [...cart, { productId, qty: Number(qty) }];
    const issue = validateSale(next, products);
    if (issue) { setError(issue); return; }
    setCart((items) => {
      const existing = items.find((i) => i.productId === productId);
      return existing ? items.map((i) => i.productId === productId ? { ...i, qty: i.qty + Number(qty) } : i) : next;
    });
    setProductId(""); setQty("1"); setError("");
  }
  function askConfirm() {
    const issue = validateSale(cart, products);
    setError(issue ?? "");
    if (!issue) setConfirm(true);
  }
  function save() {
    if (saving.current) return;
    saving.current = true;
    try {
      const session = getSession();
      if (!session) throw new Error("Inicia sesión para registrar la venta.");
      const sale = recordSale(cart, customer, note, session.name);
      setCart([]); setCustomer(""); setNote(""); setError(""); setConfirm(false);
      toast.success(`Venta ${sale.number} registrada · ${money(sale.total)}`);
    } catch (err) { setError(err instanceof Error ? err.message : "No se pudo guardar la venta."); setConfirm(false); }
    finally { saving.current = false; }
  }

  return <div className="space-y-8">
    <PageHeader title="Ventas" subtitle={`${sales.length} ventas registradas`} />
    <section className="grid gap-6 border-b pb-8 xl:grid-cols-[minmax(0,1fr)_280px]">
      <div className="min-w-0 space-y-5">
        <h2 className="flex items-center gap-2 text-lg font-semibold"><ShoppingCart className="h-5 w-5 text-primary" /> Nueva venta</h2>
        <form onSubmit={add} className="flex flex-wrap items-end gap-3" noValidate>
          <div className="min-w-0 flex-1 basis-60 space-y-2"><Label htmlFor="sale-product">Producto</Label><Select value={productId} onValueChange={setProductId}><SelectTrigger id="sale-product" className="w-full"><SelectValue placeholder="Seleccionar producto" /></SelectTrigger><SelectContent>{products.filter((p) => p.active).map((p) => <SelectItem key={p.id} value={p.id} disabled={p.stock <= 0}>{p.name} · {p.stock} disponibles</SelectItem>)}</SelectContent></Select></div>
          <div className="w-24 space-y-2"><Label htmlFor="sale-qty">Cantidad</Label><Input id="sale-qty" type="number" min="1" step="1" value={qty} onChange={(e) => setQty(e.target.value)} /></div>
          <Button type="submit" variant="outline"><Plus /> Agregar</Button>
        </form>
        {selected && <p className="text-sm text-muted-foreground">{selected.code} · {money(selected.price)} por unidad · {selected.stock} disponibles</p>}
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <div className="overflow-hidden rounded-lg border bg-card"><Table>
          <TableHeader><TableRow><TableHead>Producto</TableHead><TableHead className="text-right">Precio</TableHead><TableHead className="text-right">Cantidad</TableHead><TableHead className="text-right">Subtotal</TableHead><TableHead><span className="sr-only">Quitar</span></TableHead></TableRow></TableHeader>
          <TableBody>{!cart.length && <TableRow><TableCell colSpan={5} className="py-10 text-center text-muted-foreground">La venta aún no tiene productos.</TableCell></TableRow>}
            {cart.map((item) => { const p = products.find((p) => p.id === item.productId); return <TableRow key={item.productId}><TableCell className="min-w-32"><p className="font-medium">{p?.name ?? "Producto no disponible"}</p><p className="text-xs text-muted-foreground">{p?.code}</p></TableCell><TableCell className="whitespace-nowrap text-right">{money(p?.price ?? 0)}</TableCell><TableCell className="text-right"><Input aria-label={`Cantidad de ${p?.name}`} className="ml-auto w-20" type="number" min="1" step="1" value={Number.isNaN(item.qty) ? "" : item.qty} onChange={(e) => { setError(""); setCart(cart.map((i) => i.productId === item.productId ? { ...i, qty: e.target.value === "" ? NaN : Number(e.target.value) } : i)); }} /></TableCell><TableCell className="whitespace-nowrap text-right font-medium">{money(Number.isFinite(item.qty) ? item.qty * (p?.price ?? 0) : 0)}</TableCell><TableCell><Button variant="ghost" size="icon" title={`Quitar ${p?.name}`} aria-label={`Quitar ${p?.name}`} onClick={() => { setCart(cart.filter((i) => i.productId !== item.productId)); setError(""); }}><Trash2 className="text-destructive" /></Button></TableCell></TableRow>; })}
          </TableBody>
        </Table></div>
      </div>
      <div className="space-y-5 xl:border-l xl:pl-6">
        <h2 className="text-lg font-semibold">Resumen de venta</h2>
        <div className="space-y-2"><Label htmlFor="sale-customer">Cliente (opcional)</Label><Input id="sale-customer" maxLength={120} placeholder="Consumidor final" value={customer} onChange={(e) => setCustomer(e.target.value)} /></div>
        <div className="space-y-2"><Label htmlFor="sale-note">Observaciones (opcional)</Label><Textarea id="sale-note" maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} /></div>
        <div className="border-t pt-4"><p className="text-sm text-muted-foreground">Total · COP</p><p className="break-words text-2xl font-bold">{money(Number.isFinite(total) ? total : 0)}</p></div>
        <Button className="w-full" onClick={askConfirm} disabled={!cart.length}><Receipt /> Registrar venta</Button>
      </div>
    </section>
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-semibold">Historial de ventas</h2><Button variant="outline" disabled={!filtered.length} onClick={() => downloadCsv("stockapp-UNAD-ventas.csv", ["Venta", "Fecha", "Cliente", "Unidades", "Total COP", "Usuario", "Nota"], filtered.map((s) => [s.number, s.date, s.customer, s.items.reduce((n, i) => n + i.qty, 0), s.total, s.user, s.note]))}><Download /> Exportar CSV</Button></div>
      <div className="flex flex-wrap items-end gap-3"><div className="min-w-0 flex-1 basis-56 space-y-2"><Label htmlFor="sales-search">Buscar venta</Label><Input id="sales-search" placeholder="Número, cliente o producto" value={q} onChange={(e) => setQ(e.target.value)} /></div><div className="space-y-2"><Label htmlFor="sales-from">Desde</Label><Input id="sales-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></div><div className="space-y-2"><Label htmlFor="sales-to">Hasta</Label><Input id="sales-to" type="date" value={to} onChange={(e) => setTo(e.target.value)} /></div>{(q || from || to) && <Button variant="ghost" onClick={() => { setQ(""); setFrom(""); setTo(""); }}>Limpiar filtros</Button>}</div>
      {invalidRange && <p role="alert" className="text-sm text-destructive">La fecha inicial no puede ser posterior a la fecha final.</p>}
      <p className="text-sm text-muted-foreground">{stats.count} ventas · {stats.units} unidades · <span className="font-semibold text-foreground">{money(stats.revenue)}</span></p>
      <SalesTable sales={filtered} />
    </section>
    <AlertDialog open={confirm} onOpenChange={setConfirm}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>¿Registrar esta venta?</AlertDialogTitle><AlertDialogDescription>Total: {money(Number.isFinite(total) ? total : 0)}. Cliente: {customer.trim() || "Consumidor final"}. Se descontarán las unidades del inventario y se registrarán los movimientos.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><Button onClick={save}>Confirmar venta</Button></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </div>;
}
