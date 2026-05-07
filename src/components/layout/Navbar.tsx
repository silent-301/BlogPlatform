"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";

export function Navbar() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <nav className="border-b border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold text-zinc-900 dark:text-white">
            BlogPlatform
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white"
            >
              Home
            </Link>

            {loading ? (
              <div className="h-4 w-16 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
            ) : user ? (
              <>
                {user.role === "author" && (
                  <Link
                    href="/dashboard/create"
                    className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white"
                  >
                    Write
                  </Link>
                )}
                {user.role === "author" && (
                  <Link
                    href="/dashboard/posts"
                    className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white"
                  >
                    My Posts
                  </Link>
                )}
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  {user.name}
                </span>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
