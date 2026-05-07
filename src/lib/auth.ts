import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
const EXPIRATION = process.env.JWT_EXPIRATION || "7d";

export interface UserPayload extends JWTPayload {
  id: string;
  email: string;
  name: string;
  role: "author" | "reader";
}

export async function signToken(payload: UserPayload) {
  return await new SignJWT(payload as JWTPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(EXPIRATION)
    .sign(secret);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as UserPayload;
  } catch {
    return null;
  }
}

export async function getSession(request?: NextRequest | Request) {
  let token: string | undefined;

  if (request && 'cookies' in request) {
    // Middleware / Request context
    token = (request as NextRequest).cookies.get("token")?.value;
  } else {
    // Server Component / Route Handler context
    try {
      const cookieStore = await cookies();
      token = cookieStore.get("token")?.value;
    } catch {
      // Fallback if cookies() is not available (e.g. build time or non-standard context)
      return null;
    }
  }

  if (!token) return null;
  return await verifyToken(token);
}

export async function getSessionFromRequest(request: NextRequest) {
  return getSession(request);
}

export function setSessionCookie(response: NextResponse, token: string) {
  response.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}

export function removeSessionCookie(response: NextResponse) {
  response.cookies.set("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
}