import Link from "next/link";

export function Footer() {
  return (
    <footer className="py-12 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold gradient-text">Twins</span>
            <span className="text-muted-foreground text-sm">by dsx.plus</span>
          </div>

          <nav className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/dashboard" className="hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <Link href="https://github.com/ZhaoYis/Twins" className="hover:text-foreground transition-colors">
              GitHub
            </Link>
          </nav>

          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Twins. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
