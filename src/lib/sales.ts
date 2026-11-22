import { useSyncExternalStore } from "react";
import { addMovement, formatDate } from "./movements";
import { adjustStock, getProduct, type Product } from "./products";

export type SaleItem = { productId: string; code: string; name: string; qty: number; price: number };
export type Sale = { id: string; number: string; date: string; customer: string; note: string; user: string; items: SaleItem[]; total: number };
export type CartItem = { productId: string; qty: number };
const KEY = "inv_sales";
const EMPTY: Sale[] = [];
let cache: Sale[] | null = null;
const listeners = new Set<() => void>();

function load(): Sale[] {
  if (cache) return cache;
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = localStorage.getItem(KEY);
    cache = raw ? JSON.parse(raw) as Sale[] : EMPTY;
  } catch { cache = EMPTY; }
  return cache ?? EMPTY;
}

export function useSales() {
  return useSyncExternalStore((cb) => { listeners.add(cb); return () => listeners.delete(cb); }, load, () => EMPTY);
}

export function validateSale(cart: CartItem[], products: Product[]): string | null {
  if (!cart.length) return "Agrega al menos un producto a la venta.";
  const quantities = new Map<string, number>();
  for (const item of cart) {
    if (!Number.isFinite(item.qty) || !Number.isInteger(item.qty) || item.qty <= 0)
      return "La cantidad debe ser un número entero mayor que cero.";
    quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.qty);
  }
  for (const [id, qty] of quantities) {
    const product = products.find((p) => p.id === id);
    if (!product || !product.active) return "Uno de los productos ya no está disponible para la venta.";
    if (qty > product.stock) return `Solo hay ${product.stock} unidades disponibles de ${product.name}.`;
    if (!Number.isFinite(product.price) || product.price < 0) return `Revisa el precio de ${product.name}.`;
  }
  return null;
}

export const saleTotal = (items: Pick<SaleItem, "qty" | "price">[]) => items.reduce((sum, i) => sum + i.qty * i.price, 0);

export function recordSale(cart: CartItem[], customer: string, note: string, user: string): Sale {
  // Read current stock again at confirmation, not the form's earlier snapshot.
  const products = cart.flatMap((item) => { const p = getProduct(item.productId); return p ? [p] : []; });
  const error = validateSale(cart, products);
  if (error) throw new Error(error);
  const quantities = new Map<string, number>();
  cart.forEach((item) => quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.qty));
  const items: SaleItem[] = [];
  for (const [productId, qty] of quantities) {
    const p = products.find((product) => product.id === productId);
    if (!p) throw new Error("Producto no disponible.");
    items.push({ productId, code: p.code, name: p.name, qty, price: p.price });
  }
  const previous = load();
  const sale: Sale = {
    id: crypto.randomUUID(), number: `V-${String(previous.length + 1).padStart(5, "0")}`,
    date: formatDate(new Date()), customer: customer.trim() || "Consumidor final", note: note.trim(), user,
    items, total: saleTotal(items),
  };
  // Persist the complete sale before notifying subscribers.
  const next = [sale, ...previous];
  localStorage.setItem(KEY, JSON.stringify(next));
  cache = next;
  for (const item of items) {
    adjustStock(item.productId, -item.qty);
    addMovement({ productId: item.productId, product: item.name, type: "Venta", qty: item.qty, user,
      note: `${sale.number} · ${sale.customer}${sale.note ? ` · ${sale.note}` : ""}` });
  }
  listeners.forEach((cb) => cb());
  return sale;
}