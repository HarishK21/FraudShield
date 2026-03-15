import { NextResponse } from "next/server";
import { availableBankUsers } from "@/lib/test-users";

export async function GET() {
  return NextResponse.json({
    users: availableBankUsers
  });
}

