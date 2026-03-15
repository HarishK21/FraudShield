import { NextResponse } from "next/server";

import { getUserFromRequest } from "@/lib/auth";

export async function GET(request: Request) {
  const user = getUserFromRequest(request);

  return NextResponse.json({
    authenticated: Boolean(user),
    user
  });
}
