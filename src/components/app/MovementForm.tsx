import { Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addMovement, validateMovement, type MovementType } from "@/lib/movements";
import { adjustStock, type Product } from "@/lib/products";

type Props = { kind: "entrada" | "salida"; products: Product[]; user: string };

export function MovementForm({ kind, products, user }: Props) {
  const type: MovementType = kind === "entrada" ? "Entrada" : "Salida";
  const active = [...products].filter((p) => p.active).sort((a, b) => a.name.localeCompare(b.name));
  const [v, setV] = useState({ productId: "", qty: "", note: "" });
  const [errors, setErrors] = useState<Partial<Record<"productId" | "qty" | "note", string>>>({});
  const selected = active.find((p) => p.id === v.productId);
  const set = (k: keyof typeof v, val: string) => setV((s) => ({ ...s, [k]: val }));

  function submit(e: FormEvent) {
    e.preventDefault();
    const errs = validateMovement(v, kind, selected?.stock);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    const p = selected!;
    const qty = +v.qty;
    adjustStock(p.id, kind === "entrada" ? qty : -qty);
    addMovement({ productId: p.id, product: p.name, type, qty, note: v.note.trim(), user });
    toast.success(kind === "entrada" ? `Entrada registrada: +${qty} · ${p.name}` : `Salida registrada: −${qty} · ${p.name}`);
    setV({ productId: "", qty: "", note: "" });
    setErrors({});
  }

  return (
    <form onSubmit={submit} noValidate className="max-w-3xl space-y-6 rounded-xl border bg-card p-6 shadow-card">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="product">Producto <span className="text-destructive">*</span></Label>
          <Select value={v.productId} onValueChange={(c) => set("productId", c)}>
            <SelectTrigger id="product"><SelectValue placeholder="Selecciona un producto" /></SelectTrigger>
            <SelectContent>
              {active.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name} · {p.code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selected && <p className="text-xs text-muted-foreground">Existencias actuales: {selected.stock} unidades</p>}
          {errors.productId && <p className="text-sm text-destructive">{errors.productId}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="qty">Cantidad <span className="text-destructive">*</span></Label>
          <Input id="qty" type="number" min={1} value={v.qty} onChange={(e) => set("qty", e.target.value)} placeholder="0" />
          {errors.qty && <p className="text-sm text-destructive">{errors.qty}</p>}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="note">Nota</Label>
        <Textarea id="note" value={v.note} onChange={(e) => set("note", e.target.value)} placeholder="Observaciones del movimiento (opcional)" />
      </div>
      <div className="flex gap-2 border-t pt-5">
        <Button type="submit">{kind === "entrada" ? "Registrar entrada" : "Registrar salida"}</Button>
        <Button variant="outline" asChild><Link to="/movimientos">Ver movimientos</Link></Button>
      </div>
    </form>
  );
}
