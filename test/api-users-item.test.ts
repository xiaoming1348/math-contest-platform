import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { GET as UserItemGET } from "../app/api/users/[id]/route";

vi.mock("@/lib/auth/getSessionUser", () => ({
  getSessionUser: vi.fn(),
}));

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    user: {
      findFirst: vi.fn(),
    },
  },
}));

import { getSessionUser } from "@/lib/auth/getSessionUser";
import { prisma } from "@/lib/db/prisma";

describe("GET /api/users/[id] (item)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should return 400 when id param is missing", async () => {
    vi.mocked(getSessionUser).mockResolvedValue(null);

    const res = await UserItemGET(new Request("http://test"), {
      params: Promise.resolve({}),
    } as any);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("missing_id_param");
  });

  it("should return 401 when not authenticated", async () => {
    vi.mocked(getSessionUser).mockResolvedValue(null);

    const res = await UserItemGET(new Request("http://test"), {
      params: Promise.resolve({ id: "user-1" }),
    } as any);

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

    const res = await UserItemGET(new Request("http://test"), {
      params: Promise.resolve({ id: "user-2" }),
    } as any);

    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json).toEqual({ error: "forbidden" });
  });

  it("should return 404 when user not found", async () => {
    const adminUser = {
      userId: "admin-1",
      email: "admin@example.com",
      role: "ADMIN",
      organizationId: "org-1",
      firstName: "Admin",
      lastName: "User",
    };

    vi.mocked(getSessionUser).mockResolvedValue(adminUser);
    vi.mocked(prisma.user.findFirst).mockResolvedValue(null);

    const res = await UserItemGET(new Request("http://test"), {
      params: Promise.resolve({ id: "nonexistent-user" }),
    } as any);

    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json).toEqual({ error: "not_found" });
  });

  it("should return user when found and authenticated as ADMIN", async () => {
    const adminUser = {
      userId: "admin-1",
      email: "admin@example.com",
      role: "ADMIN",
      organizationId: "org-1",
      firstName: "Admin",
      lastName: "User",
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mockUser: any = {
      id: "user-1",
      email: "teacher@example.com",
      firstName: "John",
      lastName: "Doe",
      role: "TEACHER",
      organizationId: "org-1",
      createdByUserId: "admin-1",
      createdAt: new Date("2025-01-01"),
      updatedAt: new Date("2025-01-01"),
    };

    vi.mocked(getSessionUser).mockResolvedValue(adminUser);
    vi.mocked(prisma.user.findFirst).mockResolvedValue(mockUser);

    const res = await UserItemGET(new Request("http://test"), {
      params: Promise.resolve({ id: "user-1" }),
    } as any);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.user.id).toBe("user-1");
    expect(json.user.email).toBe("teacher@example.com");
  });

  it("should enforce org scope when querying for user", async () => {
    const adminUser = {
      userId: "admin-1",
      email: "admin@example.com",
      role: "ADMIN",
      organizationId: "org-1",
      firstName: "Admin",
      lastName: "User",
    };

    vi.mocked(getSessionUser).mockResolvedValue(adminUser);
    vi.mocked(prisma.user.findFirst).mockResolvedValue(null);

    await UserItemGET(new Request("http://test"), {
      params: Promise.resolve({ id: "user-1" }),
    } as any);

    // Verify that findFirst was called with both id and organizationId constraints
    expect(vi.mocked(prisma.user.findFirst)).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: "user-1",
          organizationId: "org-1",
        },
      })
    );
  });

  it("should prevent cross-org access", async () => {
    const adminUser = {
      userId: "admin-1",
      email: "admin@example.com",
      role: "ADMIN",
      organizationId: "org-1",
      firstName: "Admin",
      lastName: "User",
    };

    vi.mocked(getSessionUser).mockResolvedValue(adminUser);
    vi.mocked(prisma.user.findFirst).mockResolvedValue(null);

    const res = await UserItemGET(new Request("http://test"), {
      params: Promise.resolve({ id: "user-from-org-2" }),
    } as any);

    expect(res.status).toBe(404);
    const callArgs = vi.mocked(prisma.user.findFirst).mock.calls[0]?.[0];
    if (callArgs && typeof callArgs === "object" && "where" in callArgs) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((callArgs as any).where.organizationId).toBe("org-1");
    }
  });
});
