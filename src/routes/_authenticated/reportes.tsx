import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Download, Package, Banknote, History, AlertTriangle } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader, Pill, StockPill } from "@/components/app/ui-bits";
import { SalesTable } from "@/components/app/SalesTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { money, stockLevel, useProducts } from "@/lib/products";
import { useMovements } from "@/lib/movements";
import { useSales } from "@/lib/sales";
import { dailySales, downloadCsv, inDateRange, salesSummary } from "@/lib/reports";

export const Route = createFileRoute("/_authenticated/reportes")({
  head: () => ({ meta: [{ title: "Reportes · stockapp UNAD" }, { name: "description", content: "Reportes de inventario, ventas y movimientos de stockapp UNAD." }, { property: "og:title", content: "Reportes · stockapp UNAD" }, { property: "og:description", content: "Reportes de inventario, ventas y movimientos de stockapp UNAD." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: ReportesPage,
});

function ReportesPage() {
  const products = useProducts();
  const movements = useMovements();
  const sales = useSales();
  const [tab, setTab] = useState("inventario");
  const [q, setQ] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [category, setCategory] = useState("todas");
  const [level, setLevel] = useState("todos");
  const [active, setActive] = useState("todos");
  const [type, setType] = useState("todos");
  const term = q.trim().toLowerCase();
  const invalidRange = Boolean(tab !== "inventario" && from && to && from > to);
  const inventory = products.filter((p) => (!term || `${p.name} ${p.code}`.toLowerCase().includes(term)) && (category === "todas" || category === p.category) && (level === "todos" || stockLevel(p) === level) && (active === "todos" || p.active === (active === "activos")));
  const saleList = invalidRange ? [] : sales.filter((s) => inDateRange(s.date, from, to) && [s.number, s.customer, s.user, ...s.items.map((i) => i.name)].some((f) => f.toLowerCase().includes(term)));
  const movementList = invalidRange ? [] : movements.filter((m) => inDateRange(m.date, from, to) && (type === "todos" || m.type === type) && [m.product, m.user, m.note].some((f) => f.toLowerCase().includes(term)));
  const summary = salesSummary(saleList);
  const units = inventory.reduce((s, p) => s + p.stock, 0);
  const valuation = inventory.reduce((s, p) => s + p.stock * p.price, 0);
  const incoming = movementList.filter((m) => m.type === "Entrada").reduce((s, m) => s + m.qty, 0);
  const outgoing = movementList.filter((m) => m.type !== "Entrada").reduce((s, m) => s + m.qty, 0);
  const stats = tab === "inventario" ? [
    { label: "Productos", value: inventory.length, icon: Package, tone: "text-info bg-info/15" },
    { label: "Unidades disponibles", value: units, icon: Package, tone: "text-success bg-success/15" },
    { label: "Valor a precio de venta", value: money(valuation), icon: Banknote, tone: "text-primary bg-primary/15" },
    { label: "Stock bajo o agotado", value: inventory.filter((p) => stockLevel(p) !== "ok").length, icon: AlertTriangle, tone: "text-warning-foreground bg-warning/20" },
  ] : tab === "ventas" ? [
    { label: "Ventas registradas", value: summary.count, icon: Banknote, tone: "text-info bg-info/15" },
    { label: "Total vendido", value: money(summary.revenue), icon: Banknote, tone: "text-success bg-success/15" },
    { label: "Unidades vendidas", value: summary.units, icon: Package, tone: "text-primary bg-primary/15" },
    { label: "Promedio por venta", value: money(summary.average), icon: Banknote, tone: "text-warning-foreground bg-warning/20" },
  ] : [
    { label: "Movimientos", value: movementList.length, icon: History, tone: "text-info bg-info/15" },
    { label: "Unidades ingresadas", value: incoming, icon: Package, tone: "text-success bg-success/15" },
    { label: "Unidades egresadas", value: outgoing, icon: Package, tone: "text-warning-foreground bg-warning/20" },
    { label: "Balance de unidades", value: incoming - outgoing, icon: History, tone: "text-primary bg-primary/15" },
  ];
  const chart = tab === "ventas" ? dailySales(saleList) : [...new Set(inventory.map((p) => p.category))].map((name) => ({ date: name, total: inventory.filter((p) => p.category === name).reduce((s, p) => s + p.stock, 0) }));
  const count = tab === "inventario" ? inventory.length : tab === "ventas" ? saleList.length : movementList.length;

  function exportReport() {
    if (tab === "inventario") downloadCsv("stockapp-UNAD-inventario.csv", ["Código", "Producto", "Categoría", "Existencias", "Stock mínimo", "Precio unitario COP", "Valor a precio de venta COP", "Estado stock", "Activo"], inventory.map((p) => [p.code, p.name, p.category, p.stock, p.minStock, p.price, p.stock * p.price, stockLevel(p) === "ok" ? "Disponible" : stockLevel(p) === "low" ? "Stock bajo" : "Agotado", p.active ? "Sí" : "No"]));
    else if (tab === "ventas") downloadCsv("stockapp-UNAD-reporte-ventas.csv", ["Venta", "Fecha", "Cliente", "Código", "Producto", "Cantidad", "Precio unitario COP", "Subtotal COP", "Total venta COP", "Usuario", "Nota"], saleList.flatMap((s) => s.items.map((i) => [s.number, s.date, s.customer, i.code, i.name, i.qty, i.price, i.qty * i.price, s.total, s.user, s.note])));
    else downloadCsv("stockapp-UNAD-movimientos.csv", ["Fecha", "Producto", "Tipo", "Cantidad", "Usuario", "Nota"], movementList.map((m) => [m.date, m.product, m.type, m.type === "Entrada" ? m.qty : -m.qty, m.user, m.note]));
  }
  function clear() { setQ(""); setFrom(""); setTo(""); setCategory("todas"); setLevel("todos"); setActive("todos"); setType("todos"); }

  return <div className="space-y-6">
    <PageHeader title="Reportes" subtitle="Inventario, ventas y movimientos"><Button variant="outline" onClick={exportReport} disabled={!count || invalidRange}><Download /> Exportar CSV</Button></PageHeader>
    <Tabs value={tab} onValueChange={(value) => { setTab(value); setQ(""); }}><TabsList className="w-full sm:w-auto"><TabsTrigger value="inventario"><Package className="h-4 w-4" /> Inventario</TabsTrigger><TabsTrigger value="ventas"><Banknote className="h-4 w-4" /> Ventas</TabsTrigger><TabsTrigger value="movimientos"><History className="h-4 w-4" /> Movimientos</TabsTrigger></TabsList></Tabs>
    <section aria-label="Filtros del reporte" className="flex flex-wrap items-end gap-3 border-b pb-6">
      <div className="min-w-0 flex-1 basis-56 space-y-2"><Label htmlFor="report-search">Buscar</Label><Input id="report-search" placeholder={tab === "inventario" ? "Nombre o código del producto" : tab === "ventas" ? "Venta, cliente o producto" : "Producto, usuario o nota"} value={q} onChange={(e) => setQ(e.target.value)} /></div>
      {tab === "inventario" ? <>
        <div className="w-40 space-y-2"><Label htmlFor="report-category">Categoría</Label><Select value={category} onValueChange={setCategory}><SelectTrigger id="report-category" className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="todas">Todas</SelectItem>{[...new Set(products.map((p) => p.category))].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
        <div className="w-40 space-y-2"><Label htmlFor="report-level">Existencias</Label><Select value={level} onValueChange={setLevel}><SelectTrigger id="report-level" className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="todos">Todos</SelectItem><SelectItem value="ok">Disponible</SelectItem><SelectItem value="low">Stock bajo</SelectItem><SelectItem value="out">Agotado</SelectItem></SelectContent></Select></div>
        <div className="w-36 space-y-2"><Label htmlFor="report-active">Estado</Label><Select value={active} onValueChange={setActive}><SelectTrigger id="report-active" className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="todos">Todos</SelectItem><SelectItem value="activos">Activos</SelectItem><SelectItem value="inactivos">Inactivos</SelectItem></SelectContent></Select></div>
      </> : <>
        <div className="space-y-2"><Label htmlFor="report-from">Desde</Label><Input id="report-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
        <div className="space-y-2"><Label htmlFor="report-to">Hasta</Label><Input id="report-to" type="date" value={to} onChange={(e) => setTo(e.target.value)} /></div>
        {tab === "movimientos" && <div className="w-40 space-y-2"><Label htmlFor="report-type">Tipo</Label><Select value={type} onValueChange={setType}><SelectTrigger id="report-type" className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="todos">Todos</SelectItem><SelectItem value="Entrada">Entradas</SelectItem><SelectItem value="Salida">Salidas</SelectItem><SelectItem value="Venta">Ventas</SelectItem></SelectContent></Select></div>}
      </>}
      <Button variant="ghost" onClick={clear}>Limpiar filtros</Button>
    </section>
    {invalidRange && <p role="alert" className="text-sm text-destructive">La fecha inicial no puede ser posterior a la fecha final.</p>}
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map((s) => <div key={s.label} className="min-w-0 rounded-lg border bg-card p-5 shadow-card"><div className={`mb-3 inline-flex rounded-lg p-2 ${s.tone}`}><s.icon className="h-5 w-5" /></div><p className="break-words text-2xl font-bold">{s.value}</p><p className="text-sm text-muted-foreground">{s.label}</p></div>)}</div>
    {tab !== "movimientos" && <section className="space-y-4 border-b pb-6"><h2 className="font-semibold">{tab === "ventas" ? "Ventas por día" : "Unidades por categoría"}</h2>{!chart.length ? <p className="py-8 text-center text-sm text-muted-foreground">No hay datos en este reporte.</p> : <div className="h-64 w-full min-w-0"><ResponsiveContainer width="100%" height="100%"><BarChart data={chart} margin={{ left: 4, right: 16, bottom: 8 }}><CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={11} /><YAxis stroke="var(--muted-foreground)" fontSize={11} tickFormatter={(n: number) => tab === "ventas" ? `${Math.round(n / 1000)} mil` : String(n)} /><Tooltip cursor={{ fill: "var(--muted)" }} formatter={(value: number) => tab === "ventas" ? money(value) : `${value} unidades`} /><Bar name={tab === "ventas" ? "Total vendido" : "Existencias"} dataKey="total" fill="var(--primary)" radius={[4, 4, 0, 0]} maxBarSize={64} /></BarChart></ResponsiveContainer></div>}</section>}
    <section className="space-y-3"><div className="flex flex-wrap items-center justify-between gap-2"><h2 className="font-semibold">{tab === "inventario" ? "Inventario actual" : tab === "ventas" ? "Detalle de ventas" : "Detalle de movimientos"}</h2><p className="text-sm text-muted-foreground">{count} registros</p></div>
      {tab === "ventas" ? <SalesTable sales={saleList} /> : <div className="overflow-hidden rounded-lg border bg-card"><Table>
        {tab === "inventario" ? <><TableHeader><TableRow><TableHead>Código</TableHead><TableHead>Producto</TableHead><TableHead>Categoría</TableHead><TableHead className="text-right">Stock</TableHead><TableHead className="text-right">Mínimo</TableHead><TableHead className="text-right">Valor a precio de venta</TableHead><TableHead>Existencias</TableHead><TableHead>Estado</TableHead></TableRow></TableHeader><TableBody>{!inventory.length && <TableRow><TableCell colSpan={8} className="py-12 text-center text-muted-foreground">No se encontraron productos.</TableCell></TableRow>}{inventory.map((p) => <TableRow key={p.id}><TableCell className="whitespace-nowrap text-muted-foreground">{p.code}</TableCell><TableCell className="font-medium">{p.name}</TableCell><TableCell>{p.category}</TableCell><TableCell className="text-right">{p.stock}</TableCell><TableCell className="text-right">{p.minStock}</TableCell><TableCell className="whitespace-nowrap text-right">{money(p.stock * p.price)}</TableCell><TableCell><StockPill level={stockLevel(p)} /></TableCell><TableCell><Pill tone={p.active ? "success" : "muted"}>{p.active ? "Activo" : "Inactivo"}</Pill></TableCell></TableRow>)}</TableBody></> : <><TableHeader><TableRow><TableHead>Fecha</TableHead><TableHead>Producto</TableHead><TableHead>Tipo</TableHead><TableHead className="text-right">Cantidad</TableHead><TableHead>Usuario</TableHead><TableHead>Nota</TableHead></TableRow></TableHeader><TableBody>{!movementList.length && <TableRow><TableCell colSpan={6} className="py-12 text-center text-muted-foreground">No se encontraron movimientos.</TableCell></TableRow>}{movementList.map((m) => <TableRow key={m.id}><TableCell className="whitespace-nowrap text-muted-foreground">{m.date}</TableCell><TableCell className="font-medium">{m.product}</TableCell><TableCell><Pill tone={m.type === "Entrada" ? "success" : m.type === "Venta" ? "info" : "warning"}>{m.type}</Pill></TableCell><TableCell className="text-right font-semibold">{m.type === "Entrada" ? "+" : "−"}{m.qty}</TableCell><TableCell className="whitespace-nowrap">{m.user}</TableCell><TableCell className="min-w-40 max-w-80 break-words text-muted-foreground">{m.note || "—"}</TableCell></TableRow>)}</TableBody></>}
      </Table></div>}
    </section>
  </div>;
}
