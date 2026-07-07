"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, RotateCcw, Trophy, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/learn", label: "Learn", icon: Map },
  { href: "/review", label: "Review", icon: RotateCcw },
  { href: "/awards", label: "Awards", icon: Trophy },
  { href: "/profile", label: "Profile", icon: UserRound },
];

// Bottom tab bar for phones; the sidebar covers sm and up.
export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-20 flex border-t-2 border-line bg-white pb-[env(safe-area-inset-bottom)] sm:hidden"
    >
      {items.map(({ href, label, icon: Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 py-2 font-display text-[10px] font-bold uppercase tracking-wide",
              active ? "text-brand" : "text-ink-soft"
            )}
          >
            <Icon className={cn("size-6", active && "fill-brand-soft")} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
