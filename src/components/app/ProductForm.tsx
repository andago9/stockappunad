import { Link } from "@tanstack/react-router";
import { useState, type FormEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORIES, validateProduct, type Product, type ProductInput } from "@/lib/products";

type Props = { initial?: Product; products: Product[]; onSave: (p: Omit<Product, "id">) => void };

export function ProductForm({ initial, products, onSave }: Props) {
  const [v, setV] = useState<ProductInput>({
    code: initial?.code ?? "", name: initial?.name ?? "", description: initial?.description ?? "", category: initial?.category ?? "",
    price: initial ? String(initial.price) : "", stock: initial ? String(initial.stock) : "0", minStock: initial ? String(initial.minStock) : "",
    active: initial?.active ?? true,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ProductInput, string>>>({});
  const set = <K extends keyof ProductInput>(k: K, val: ProductInput[K]) => setV((s) => ({ ...s, [k]: val }));

  function submit(e: FormEvent) {
    e.preventDefault();
    const errs = validateProduct(v, products, initial?.id);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    onSave({ code: v.code.trim(), name: v.name.trim(), description: v.description.trim(), category: v.category,
      price: +v.price, stock: v.stock.trim() === "" ? 0 : +v.stock, minStock: +v.minStock, active: v.active });
  }

  const F = ({ id, label, req, children }: { id: keyof ProductInput; label: string; req?: boolean; children: ReactNode }) => (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}{req && <span className="text-destructive"> *</span>}</Label>
      {children}
      {errors[id] && <p className="text-sm text-destructive">{errors[id]}</p>}
    </div>
  );

  return (
    <form onSubmit={submit} noValidate className="max-w-3xl space-y-6 rounded-xl border bg-card p-6 shadow-card">
      <div className="grid gap-5 sm:grid-cols-2">
        {F({ id: "code", label: "Código", req: true, children: <Input id="code" value={v.code} onChange={(e) => set("code", e.target.value)} placeholder="P-010" /> })}
        {F({ id: "name", label: "Nombre", req: true, children: <Input id="name" value={v.name} onChange={(e) => set("name", e.target.value)} /> })}
      </div>
      {F({ id: "description", label: "Descripción", children: <Textarea id="description" value={v.description} onChange={(e) => set("description", e.target.value)} /> })}
      <div className="grid gap-5 sm:grid-cols-2">
        {F({ id: "category", label: "Categoría", req: true, children: (
          <Select value={v.category} onValueChange={(c) => set("category", c)}>
            <SelectTrigger id="category"><SelectValue placeholder="Selecciona una categoría" /></SelectTrigger>
            <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        ) })}
        {F({ id: "price", label: "Precio (COP)", req: true, children: <Input id="price" type="number" min={0} value={v.price} onChange={(e) => set("price", e.target.value)} /> })}
        {F({ id: "stock", label: "Stock inicial", children: <Input id="stock" type="number" min={0} value={v.stock} onChange={(e) => set("stock", e.target.value)} /> })}
        {F({ id: "minStock", label: "Stock mínimo", req: true, children: <Input id="minStock" type="number" min={0} value={v.minStock} onChange={(e) => set("minStock", e.target.value)} /> })}
      </div>
      <div className="flex items-center gap-3">
        <Switch id="active" checked={v.active} onCheckedChange={(c) => set("active", c)} />
        <Label htmlFor="active">Estado: {v.active ? "Activo" : "Inactivo"}</Label>
      </div>
      <p className="text-xs text-muted-foreground">Los campos marcados con * son obligatorios.</p>
      <div className="flex gap-2 border-t pt-5">
        <Button type="submit">Guardar producto</Button>
        <Button variant="outline" asChild><Link to="/productos">Cancelar</Link></Button>
      </div>
    </form>
  );
}
