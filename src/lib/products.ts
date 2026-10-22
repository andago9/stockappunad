import { useSyncExternalStore } from "react";

export type Product = {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  minStock: number;
  active: boolean;
};

export const CATEGORIES = ["Papelería", "Tecnología", "Aseo", "Alimentos", "Herramientas"];

const SEED: Product[] = [
  { id: "1", code: "P-001", name: "Resma papel carta", description: "Papel bond 75g, 500 hojas", category: "Papelería", price: 18500, stock: 42, minStock: 10, active: true },
  { id: "2", code: "P-002", name: "Bolígrafo azul", description: "Caja x 12 unidades", category: "Papelería", price: 9800, stock: 6, minStock: 15, active: true },
  { id: "3", code: "T-001", name: "Mouse inalámbrico", description: "USB 2.4GHz", category: "Tecnología", price: 45000, stock: 18, minStock: 5, active: true },
  { id: "4", code: "T-002", name: "Teclado USB", description: "Español latino", category: "Tecnología", price: 62000, stock: 0, minStock: 4, active: true },
  { id: "5", code: "A-001", name: "Jabón líquido 1L", description: "Antibacterial", category: "Aseo", price: 12500, stock: 3, minStock: 8, active: true },
  { id: "6", code: "A-002", name: "Toallas de papel", description: "Paquete x 6 rollos", category: "Aseo", price: 15900, stock: 27, minStock: 10, active: true },
  { id: "7", code: "L-001", name: "Café molido 500g", description: "Tostión media", category: "Alimentos", price: 21000, stock: 0, minStock: 6, active: false },
  { id: "8", code: "H-001", name: "Destornillador set", description: "6 piezas", category: "Herramientas", price: 38000, stock: 11, minStock: 3, active: true },
];

const KEY = "inv_products";
let cache: Product[] | null = null;
const listeners = new Set<() => void>();

function load(): Product[] {
  if (cache) return cache;
  if (typeof window === "undefined") return SEED;
  try {
    const raw = localStorage.getItem(KEY);
    cache = raw ? JSON.parse(raw) : SEED;
  } catch {
    cache = SEED;
  }
  return cache!;
}

function save(next: Product[]) {
  cache = next;
  localStorage.setItem(KEY, JSON.stringify(next));
  listeners.forEach((l) => l());
}

export function useProducts() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    load,
    () => SEED,
  );
}

export const getProduct = (id: string) => load().find((p) => p.id === id);

export function createProduct(p: Omit<Product, "id">) {
  save([...load(), { ...p, id: crypto.randomUUID() }]);
}
export function updateProduct(id: string, p: Omit<Product, "id">) {
  save(load().map((x) => (x.id === id ? { ...p, id } : x)));
}
export function setActive(id: string, active: boolean) {
  save(load().map((x) => (x.id === id ? { ...x, active } : x)));
}

export type StockLevel = "ok" | "low" | "out";
export function stockLevel(p: Pick<Product, "stock" | "minStock">): StockLevel {
  if (p.stock <= 0) return "out";
  if (p.stock <= p.minStock) return "low";
  return "ok";
}

export type ProductInput = {
  code: string; name: string; description: string; category: string;
  price: string; stock: string; minStock: string; active: boolean;
};

export function validateProduct(v: ProductInput, existing: Product[], selfId?: string) {
  const e: Partial<Record<keyof ProductInput, string>> = {};
  if (!v.code.trim()) e.code = "El código es obligatorio.";
  else if (existing.some((p) => p.code.toLowerCase() === v.code.trim().toLowerCase() && p.id !== selfId))
    e.code = "Ya existe un producto con este código.";
  if (!v.name.trim()) e.name = "El nombre es obligatorio.";
  if (!v.category) e.category = "Selecciona una categoría.";
  if (v.price.trim() === "") e.price = "El precio es obligatorio.";
  else if (isNaN(+v.price) || +v.price < 0) e.price = "El precio no puede ser negativo.";
  if (v.stock.trim() !== "" && (isNaN(+v.stock) || +v.stock < 0)) e.stock = "El stock inicial no puede ser negativo.";
  if (v.minStock.trim() === "") e.minStock = "El stock mínimo es obligatorio.";
  else if (isNaN(+v.minStock) || +v.minStock < 0) e.minStock = "El stock mínimo no puede ser negativo.";
  return e;
}

export const money = (n: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);

export const MOVEMENTS = [
  { date: "2026-10-22 08:10", product: "Resma papel carta", type: "Entrada", qty: 20, user: "Andrés González" },
  { date: "2026-10-21 16:42", product: "Mouse inalámbrico", type: "Venta", qty: 2, user: "Laura Pérez" },
  { date: "2026-10-21 11:05", product: "Jabón líquido 1L", type: "Salida", qty: 5, user: "Andrés González" },
  { date: "2026-10-20 15:30", product: "Teclado USB", type: "Venta", qty: 4, user: "Laura Pérez" },
  { date: "2026-10-20 09:12", product: "Toallas de papel", type: "Entrada", qty: 15, user: "Andrés González" },
] as const;
