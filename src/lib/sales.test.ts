import { beforeEach, describe, expect, it } from "vitest";
import { saleTotal, validateSale, recordSale } from "./sales";
import { getProduct } from "./products";
import type { Product } from "./products";
import { csvText, inDateRange, salesSummary, dailySales } from "./reports";

const product: Product = { id: "1", code: "P-001", name: "Resma papel carta", description: "", category: "Papelería", price: 18500, stock: 42, minStock: 10, active: true };
describe("sales rules", () => {
  it("requires products", () => expect(validateSale([], [product])).not.toBeNull());
  it("rejects fractional, zero and non-finite quantities", () => {
    for (const qty of [0, -1, 1.5, Infinity, NaN]) expect(validateSale([{ productId: "1", qty }], [product])).not.toBeNull();
  });
  it("checks combined stock for duplicate lines", () => {
    expect(validateSale([{ productId: "1", qty: 22 }, { productId: "1", qty: 21 }], [product])).not.toBeNull();
    expect(validateSale([{ productId: "1", qty: 42 }], [product])).toBeNull();
  });
  it("rejects inactive products", () => expect(validateSale([{ productId: "1", qty: 1 }], [{ ...product, active: false }])).not.toBeNull());
  it("calculates line prices exactly", () => expect(saleTotal([{ qty: 2, price: 18500 }, { qty: 1, price: 45000 }])).toBe(82000));
});

describe("sale registration", () => {
  beforeEach(() => localStorage.clear());
  it("decreases stock and records a priced sale and a movement", () => {
    const before = getProduct("1")?.stock ?? 0;
    const sale = recordSale([{ productId: "1", qty: 2 }], "Cliente prueba", "", "Andrés González");
    expect(sale.total).toBe(37000);
    expect(sale.items[0]?.price).toBe(18500);
    expect(getProduct("1")?.stock).toBe(before - 2);
    expect(JSON.parse(localStorage.getItem("inv_sales") ?? "[]")[0].id).toBe(sale.id);
    const movement = JSON.parse(localStorage.getItem("inv_movements") ?? "[]")[0];
    expect(movement.type).toBe("Venta");
    expect(movement.qty).toBe(2);
    expect(movement.note).toContain(sale.number);
  });
});

describe("reports rules", () => {
  it("includes both date boundaries", () => {
    expect(inDateRange("2026-11-22 22:00", "2026-11-22", "2026-11-22")).toBe(true);
    expect(inDateRange("2026-11-21 23:59", "2026-11-22", "")).toBe(false);
    expect(inDateRange("2026-11-23 00:00", "", "2026-11-22")).toBe(false);
  });
  it("handles empty sales without NaN", () => expect(salesSummary([])).toEqual({ revenue: 0, units: 0, count: 0, average: 0 }));
  it("aggregates historical sale prices rather than current catalog prices", () => {
    const sales = [{ id: "s", number: "V-00001", date: "2026-11-22 10:00", customer: "Cliente", note: "", user: "Andrés", total: 37000, items: [{ productId: "1", code: "P-001", name: "Papel", price: 18500, qty: 2 }] }];
    expect(salesSummary(sales)).toEqual({ count: 1, revenue: 37000, units: 2, average: 37000 });
    expect(dailySales(sales)).toEqual([{ date: "2026-11-22", total: 37000 }]);
  });
  it("escapes CSV quotes and neutralizes spreadsheet formulas", () => {
    expect(csvText(["Cliente", "Total"], [['=HYPERLINK("x")', 37000]])).toContain('"\'=HYPERLINK(""x"")";"37000"');
  });
});