import { NextResponse } from "next/server";

import { getBankSnapshot } from "@/lib/bank-repository";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(request: Request) {
  const user = getUserFromRequest(request);

  if (!user) {
    return NextResponse.json(
      {
        error: "Authentication required."
      },
      { status: 401 }
    );
  }

  try {
    const snapshot = await getBankSnapshot(user.id);
    return NextResponse.json(snapshot);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to load MongoDB banking data."
      },
      { status: 500 }
    );
  }
}
