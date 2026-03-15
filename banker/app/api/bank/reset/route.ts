import { NextResponse } from "next/server";
import { resetUserData } from "@/lib/bank-repository";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(request: Request) {
  const user = getUserFromRequest(request);

  if (!user) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 }
    );
  }

  try {
    const snapshot = await resetUserData(user.id);
    return NextResponse.json(snapshot);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to reset data." },
      { status: 500 }
    );
  }
}
