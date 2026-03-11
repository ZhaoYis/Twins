"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Session } from "next-auth";
import { logout } from "@/lib/auth/actions";

interface HeaderProps {
  session?: Session | null;
}

export function Header({ session }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold gradient-text">
          Twins
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
            How It Works
          </Link>
          <Link href="https://github.com/ZhaoYis/Twins" className="text-muted-foreground hover:text-foreground transition-colors">
            GitHub
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {session ? (
            <>
              <Button variant="ghost" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <form action={logout}>
                <Button variant="outline" type="submit">
                  Sign Out
                </Button>
              </form>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/auth/signin">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/dashboard">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
