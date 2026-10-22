import { describe, expect, it } from "vitest";
import { stockLevel, validateProduct, type ProductInput } from "./products";

const base: ProductInput = { code: "X-1", name: "A", description: "", category: "Aseo", price: "10", stock: "0", minStock: "1", active: true };

describe("product rules", () => {
  it("rejects negative price", () => expect(validateProduct({ ...base, price: "-1" }, []).price).toBeTruthy());
  it("rejects negative initial stock", () => expect(validateProduct({ ...base, stock: "-2" }, []).stock).toBeTruthy());
  it("rejects negative min stock", () => expect(validateProduct({ ...base, minStock: "-2" }, []).minStock).toBeTruthy());
  it("requires mandatory fields", () => {
    const e = validateProduct({ ...base, code: "", name: "", category: "", price: "", minStock: "" }, []);
    expect(Object.keys(e).sort()).toEqual(["category", "code", "minStock", "name", "price"]);
  });
  it("accepts valid product", () => expect(validateProduct(base, [])).toEqual({}));
  it("classifies stock", () => {
    expect(stockLevel({ stock: 0, minStock: 5 })).toBe("out");
    expect(stockLevel({ stock: 5, minStock: 5 })).toBe("low");
    expect(stockLevel({ stock: 6, minStock: 5 })).toBe("ok");
  });
});
