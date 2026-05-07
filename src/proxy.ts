import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";

const publicPaths = [
  "/login",
  "/register",
  "/api/auth/register",
  "/api/auth/login",
  "/api/auth/me",
];

const authorApiPaths = [
  "/api/posts",
  "/api/upload",
];

export async function proxy(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  const pathname = request.nextUrl.pathname;
  const method = request.method;

  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  if (pathname === "/api/posts" && method === "GET") {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/posts/") && method === "GET") {
    const rest = pathname.replace("/api/posts/", "");
    if (rest === "comments" || rest.startsWith("comments/") ||
        rest === "likes" || rest.startsWith("likes/")) {
      if (!session) {
        return NextResponse.json(
          { success: false, error: "Unauthorized" },
          { status: 401 }
        );
      }
      return NextResponse.next();
    }
    return NextResponse.next();
  }

  if (pathname === "/api/posts/search" && method === "GET") {
    return NextResponse.next();
  }

  if (authorApiPaths.some((path) => pathname.startsWith(path))) {
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    if (session.role !== "author") {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }
  }

  if (pathname.startsWith("/dashboard") || pathname.startsWith("/create")) {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
    if (session.role !== "author") {
      const homeUrl = new URL("/", request.url);
      return NextResponse.redirect(homeUrl);
    }
  }

  if (pathname.startsWith("/posts/")) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public|uploads).*)"],
};
