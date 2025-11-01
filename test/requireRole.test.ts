import { describe, it, expect } from "vitest";
import { hasRole } from "@/lib/auth/requireRole";

describe("requireRole: hasRole", () => {
  it("should return true when userRole is in allowed list", () => {
    expect(hasRole("ADMIN", ["ADMIN"])).toBe(true);
  });

  it("should return false when userRole is not in allowed list", () => {
    expect(hasRole("TEACHER", ["ADMIN"])).toBe(false);
  });

  it("should return true when role is one of multiple allowed", () => {
    expect(hasRole("TEACHER", ["ADMIN", "TEACHER"])).toBe(true);
  });

  it("should return false for STUDENT when not in allowed", () => {
    expect(hasRole("STUDENT", ["ADMIN", "TEACHER"])).toBe(false);
  });

  it("should handle case sensitivity (enum-based)", () => {
    expect(hasRole("ADMIN", ["ADMIN"])).toBe(true);
    expect(hasRole("admin", ["ADMIN"])).toBe(false);
  });
});
