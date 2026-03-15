import { NextResponse } from "next/server";

import { AUTH_USER_COOKIE } from "@/lib/auth";
import { getBankUserById } from "@/lib/test-users";

const AUTH_COOKIE_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const userId = typeof body?.userId === "string" ? body.userId.trim() : "";
  const user = userId ? getBankUserById(userId) : null;

  if (!user) {
    return NextResponse.json(
      {
        ok: false,
        error: "A valid userId is required."
      },
      { status: 400 }
    );
  }

  const response = NextResponse.json({
    ok: true,
    user
  });

  response.cookies.set({
    name: AUTH_USER_COOKIE,
    value: user.id,
    path: "/",
    maxAge: AUTH_COOKIE_MAX_AGE_SECONDS,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });

  return response;
}
