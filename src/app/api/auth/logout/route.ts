import { NextResponse } from "next/server";
import { removeSessionCookie } from "@/lib/auth";

export async function POST() {
  try {
    await removeSessionCookie();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
