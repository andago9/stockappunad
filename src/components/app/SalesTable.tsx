import { useState } from "react";
import { Eye, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { money } from "@/lib/products";
import type { Sale } from "@/lib/sales";
import { downloadCsv } from "@/lib/reports";

export function SalesTable({ sales }: { sales: Sale[] }) {
  const [selected, setSelected] = useState<Sale | null>(null);
  return <>
    <div className="overflow-hidden rounded-lg border bg-card">
      <Table>
        <TableHeader><TableRow><TableHead>Venta</TableHead><TableHead>Fecha</TableHead><TableHead>Cliente</TableHead><TableHead className="text-right">Unidades</TableHead><TableHead className="text-right">Total</TableHead><TableHead>Usuario</TableHead><TableHead><span className="sr-only">Detalle</span></TableHead></TableRow></TableHeader>
        <TableBody>
          {!sales.length && <TableRow><TableCell colSpan={7} className="py-12 text-center text-muted-foreground">No hay ventas para mostrar.</TableCell></TableRow>}
          {sales.map((sale) => <TableRow key={sale.id}>
            <TableCell className="whitespace-nowrap font-semibold">{sale.number}</TableCell>
            <TableCell className="whitespace-nowrap text-muted-foreground">{sale.date}</TableCell>
            <TableCell className="max-w-48 break-words">{sale.customer}</TableCell>
            <TableCell className="text-right">{sale.items.reduce((s, i) => s + i.qty, 0)}</TableCell>
            <TableCell className="whitespace-nowrap text-right font-semibold">{money(sale.total)}</TableCell>
            <TableCell className="whitespace-nowrap">{sale.user}</TableCell>
            <TableCell><Button variant="ghost" size="icon" aria-label={`Ver venta ${sale.number}`} title={`Ver venta ${sale.number}`} onClick={() => setSelected(sale)}><Eye /></Button></TableCell>
          </TableRow>)}
        </TableBody>
      </Table>
    </div>
    <Dialog open={selected !== null} onOpenChange={(open) => { if (!open) setSelected(null); }}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader><DialogTitle>Venta {selected?.number}</DialogTitle><DialogDescription>{selected?.date} · {selected?.user}</DialogDescription></DialogHeader>
        {selected && <>
          <p className="break-words text-sm"><span className="text-muted-foreground">Cliente: </span>{selected.customer}</p>
          <Table><TableHeader><TableRow><TableHead>Producto</TableHead><TableHead className="text-right">Cantidad</TableHead><TableHead className="text-right">Precio unitario</TableHead><TableHead className="text-right">Subtotal</TableHead></TableRow></TableHeader>
            <TableBody>{selected.items.map((item) => <TableRow key={item.productId}><TableCell><p className="font-medium">{item.name}</p><p className="text-xs text-muted-foreground">{item.code}</p></TableCell><TableCell className="text-right">{item.qty}</TableCell><TableCell className="whitespace-nowrap text-right">{money(item.price)}</TableCell><TableCell className="whitespace-nowrap text-right">{money(item.qty * item.price)}</TableCell></TableRow>)}</TableBody>
          </Table>
          {selected.note && <p className="whitespace-pre-wrap break-words text-sm text-muted-foreground">{selected.note}</p>}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
            <Button variant="outline" onClick={() => downloadCsv(`stockapp-UNAD-${selected.number}.csv`, ["Venta", "Fecha", "Cliente", "Código", "Producto", "Cantidad", "Precio unitario COP", "Subtotal COP", "Usuario", "Nota"], selected.items.map((i) => [selected.number, selected.date, selected.customer, i.code, i.name, i.qty, i.price, i.qty * i.price, selected.user, selected.note]))}><Download /> Descargar detalle</Button>
            <p className="text-lg font-bold">Total {money(selected.total)}</p>
          </div>
        </>}
      </DialogContent>
    </Dialog>
  </>;
}