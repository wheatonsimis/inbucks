import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container px-6 flex flex-col md:flex-row items-center justify-between gap-4 md:h-14">
        <p className="text-sm text-muted-foreground">
          © 2025 inBucks™. All rights reserved.
        </p>
        <div className="flex items-center gap-4">
          <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Privacy Policy
          </Link>
          <span className="text-muted-foreground">|</span>
          <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
}