import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { GET as UsersGET } from "../app/api/users/route";

vi.mock("@/lib/auth/getSessionUser", () => ({
  getSessionUser: vi.fn(),
}));

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    user: {
      findMany: vi.fn(),
    },
  },
}));

import { getSessionUser } from "@/lib/auth/getSessionUser";
import { prisma } from "@/lib/db/prisma";

describe("GET /api/users (collection)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 when not authenticated", async () => {
    vi.mocked(getSessionUser).mockResolvedValue(null);

    const res = await UsersGET();
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json).toEqual({ error: "unauthorized" });
  });

  it("should return 403 when user is not ADMIN", async () => {
    vi.mocked(getSessionUser).mockResolvedValue({
      userId: "user-1",
      email: "teacher@example.com",
      role: "TEACHER",
      organizationId: "org-1",
      firstName: "John",
      lastName: "Doe",
    });

    const res = await UsersGET();
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json).toEqual({ error: "forbidden" });
  });

  it("should return org-scoped list of users when authenticated as ADMIN", async () => {
    const adminUser = {
      userId: "admin-1",
      email: "admin@example.com",
      role: "ADMIN",
      organizationId: "org-1",
      firstName: "Admin",
      lastName: "User",
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mockUsers: any[] = [
      {
        id: "user-1",
        email: "teacher@example.com",
        firstName: "John",
        lastName: "Doe",
        role: "TEACHER",
        organizationId: "org-1",
        createdByUserId: "admin-1",
        createdAt: new Date("2025-01-01"),
        updatedAt: new Date("2025-01-01"),
      },
      {
        id: "user-2",
        email: "student@example.com",
        firstName: "Jane",
        lastName: "Smith",
        role: "STUDENT",
        organizationId: "org-1",
        createdByUserId: "admin-1",
        createdAt: new Date("2025-01-02"),
        updatedAt: new Date("2025-01-02"),
      },
    ];

    vi.mocked(getSessionUser).mockResolvedValue(adminUser);
    vi.mocked(prisma.user.findMany).mockResolvedValue(mockUsers);

    const res = await UsersGET();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.users).toHaveLength(2);
    expect(json.users[0].email).toBe("teacher@example.com");
    expect(json.users[1].email).toBe("student@example.com");
  });

  it("should query with org scope constraint", async () => {
    const adminUser = {
      userId: "admin-1",
      email: "admin@example.com",
      role: "ADMIN",
      organizationId: "org-1",
      firstName: "Admin",
      lastName: "User",
    };

    vi.mocked(getSessionUser).mockResolvedValue(adminUser);
    vi.mocked(prisma.user.findMany).mockResolvedValue([]);

    await UsersGET();

    expect(vi.mocked(prisma.user.findMany)).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { organizationId: "org-1" },
      })
    );
  });

  it("should return empty list when no users exist", async () => {
    const adminUser = {
      userId: "admin-1",
      email: "admin@example.com",
      role: "ADMIN",
      organizationId: "org-1",
      firstName: "Admin",
      lastName: "User",
    };

    vi.mocked(getSessionUser).mockResolvedValue(adminUser);
    vi.mocked(prisma.user.findMany).mockResolvedValue([]);

    const res = await UsersGET();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.users).toEqual([]);
  });
});
