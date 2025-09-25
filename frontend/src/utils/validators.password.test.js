import { describe, it, expect } from "vitest";
import { isValidPassword, validatePassword } from "./validators";

describe("password validators", () => {
  it("rejects password without number", () => {
    expect(isValidPassword("NoNumberPassword")).toBe(false);
  });
  it("accepts strong mixed password", () => {
    expect(isValidPassword("Str0ngPass")).toBe(true);
  });
  it("returns detailed error for short password", () => {
    const { isValid, error } = validatePassword("Aa1");
    expect(isValid).toBe(false);
    expect(error).toMatch(/at least 8/);
  });
  it("valid password passes validatePassword", () => {
    const res = validatePassword("GoodPass1");
    expect(res.isValid).toBe(true);
    expect(res.error).toBeNull();
  });
});
