import { describe, expect, it } from "vitest";
import { SEED_MOVEMENTS, validateMovement } from "./movements";

describe("movement rules", () => {
  it("records movements from Angie Quiroga in the seed history", () => {
    const users = SEED_MOVEMENTS.map((m) => m.user);
    expect(users).toContain("Angie Quiroga");
    expect(users).not.toContain("Laura Pérez");
  });

  it("requires a product and a positive quantity", () => {
    const e = validateMovement({ productId: "", qty: "", note: "" }, "entrada");
    expect(e.productId).toBeTruthy();
    expect(e.qty).toBeTruthy();
  });

  it("rejects zero or negative quantity", () => {
    expect(validateMovement({ productId: "1", qty: "0", note: "" }, "entrada").qty).toBeTruthy();
    expect(validateMovement({ productId: "1", qty: "-3", note: "" }, "salida").qty).toBeTruthy();
  });

  it("rejects an exit larger than the available stock", () => {
    const e = validateMovement({ productId: "1", qty: "11", note: "" }, "salida", 10);
    expect(e.qty).toContain("10");
    expect(validateMovement({ productId: "1", qty: "10", note: "" }, "salida", 10).qty).toBeUndefined();
  });

  it("allows an entry larger than the current stock", () => {
    expect(validateMovement({ productId: "1", qty: "50", note: "" }, "entrada", 10).qty).toBeUndefined();
  });
});
