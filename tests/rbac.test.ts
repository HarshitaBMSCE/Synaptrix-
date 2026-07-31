import { describe, expect, it } from "vitest";
import { ForbiddenError, assertResourceOwner, canAccessResource } from "@/lib/auth";

describe("RBAC helpers", () => {
  it("allows owners to access their own records", () => {
    expect(() => assertResourceOwner("worker-1", "worker-1")).not.toThrow();
  });

  it("blocks workers from another worker's records", () => {
    expect(() => assertResourceOwner("worker-2", "worker-1")).toThrow(ForbiddenError);
  });

  it("allows admins to access resources through central helper", () => {
    expect(canAccessResource("worker-2", { clerkUserId: "admin-1", role: "admin" })).toBe(true);
  });

  it("does not allow workers to access another worker through central helper", () => {
    expect(canAccessResource("worker-2", { clerkUserId: "worker-1", role: "worker" })).toBe(false);
  });
});
