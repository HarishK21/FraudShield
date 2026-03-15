import { NextResponse } from "next/server";
import { updateUserProfile } from "@/lib/bank-repository";
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
    const body = await request.json();
    const snapshot = await updateUserProfile(user.id, {
      email: body.email,
      phone: body.phone,
      address: body.address
    });
    return NextResponse.json(snapshot);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update profile." },
      { status: 500 }
    );
  }
}
