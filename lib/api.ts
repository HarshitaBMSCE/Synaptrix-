import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AuthRequiredError, ForbiddenError, SuspendedUserError } from "@/lib/auth";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ ok: true, success: true, data }, init);
}

export function fail(message: string, status = 400, details?: unknown, code?: string) {
  const resolvedCode =
    code ??
    (status === 401
      ? "UNAUTHENTICATED"
      : status === 403
        ? "FORBIDDEN"
        : status === 404
          ? "NOT_FOUND"
          : status === 422
            ? "VALIDATION_ERROR"
            : "INTERNAL_ERROR");
  return NextResponse.json({ ok: false, success: false, error: { code: resolvedCode, message, details: details ?? {} } }, { status });
}

export function handleApiError(error: unknown) {
  if (error instanceof AuthRequiredError) {
    return fail(error.message, 401);
  }
  if (error instanceof ForbiddenError || error instanceof SuspendedUserError) {
    return fail(error.message, 403);
  }
  if (error instanceof ZodError) {
    return fail("Invalid request payload", 422, error.flatten());
  }
  if (error instanceof Error) {
    return fail(error.message, 500);
  }
  return fail("Unexpected server error", 500);
}
