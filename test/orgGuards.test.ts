import { describe, it, expect, vi } from "vitest";
import { sameOrg, getUserInOrg } from "@/lib/auth/orgGuards";

describe("orgGuards: sameOrg", () => {
  it("should return true when org ids match", () => {
    expect(sameOrg("org-1", "org-1")).toBe(true);
  });

  it("should return false when org ids do not match", () => {
    expect(sameOrg("org-1", "org-2")).toBe(false);
  });

  it("should handle empty strings", () => {
    expect(sameOrg("", "")).toBe(true);
    expect(sameOrg("", "org-1")).toBe(false);
  });

  it("should be case-sensitive", () => {
    expect(sameOrg("ORG-1", "org-1")).toBe(false);
  });
});

describe("orgGuards: getUserInOrg", () => {
  it("should return user when found and in same org", async () => {
    const mockPrisma = {
      user: {
        findFirst: vi.fn().mockResolvedValue({
          id: "user-1",
          email: "user@example.com",
          firstName: "John",
          lastName: "Doe",
          role: "TEACHER",
          organizationId: "org-1",
          createdByUserId: "admin-1",
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      },
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await getUserInOrg(mockPrisma as any, "user-1", "org-1");
    expect(result).not.toBeNull();
    expect(result?.email).toBe("user@example.com");
    expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
      where: { id: "user-1", organizationId: "org-1" },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        organizationId: true,
        createdByUserId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  });

  it("should return null when user not found", async () => {
    const mockPrisma = {
      user: {
        findFirst: vi.fn().mockResolvedValue(null),
      },
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await getUserInOrg(mockPrisma as any, "user-1", "org-2");
    expect(result).toBeNull();
  });

  it("should enforce org boundary in query", async () => {
    const mockPrisma = {
      user: {
        findFirst: vi.fn().mockResolvedValue(null),
      },
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await getUserInOrg(mockPrisma as any, "user-1", "org-1");

    // Verify that the query includes organizationId constraint
    const callArgs = mockPrisma.user.findFirst.mock.calls[0][0];
    expect(callArgs.where).toHaveProperty("organizationId", "org-1");
    expect(callArgs.where).toHaveProperty("id", "user-1");
  });
});
