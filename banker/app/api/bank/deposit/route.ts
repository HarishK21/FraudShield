import { NextResponse } from "next/server";
import { createDeposit } from "@/lib/bank-repository";
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
    const { accountId, amount } = await request.json();

    if (!accountId || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "Invalid deposit input." }, { status: 400 });
    }

    const snapshot = await createDeposit(user.id, accountId, amount);
    return NextResponse.json(snapshot);
  } catch (error) {
    console.error("[Deposit Error]", error);
    return NextResponse.json({ error: "Failed to process deposit." }, { status: 500 });
  }
}
