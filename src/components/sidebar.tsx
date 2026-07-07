"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, RotateCcw, Trophy, UserRound } from "lucide-react";
import { CourseMenu } from "@/components/course-menu";
import { cn } from "@/lib/utils";

const items = [
  { href: "/learn", label: "Learn", icon: Map },
  { href: "/review", label: "Review", icon: RotateCcw },
  { href: "/awards", label: "Awards", icon: Trophy },
  { href: "/profile", label: "Profile", icon: UserRound },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden sm:flex flex-col gap-2 border-r border-line bg-white px-3 py-6 w-16 lg:w-56 shrink-0">
      <Link href="/learn" className="mb-6 px-2 font-display text-2xl font-extrabold text-brand">
        <span className="lg:hidden">L</span>
        <span className="hidden lg:inline">LingoDuo</span>
      </Link>
      {items.map(({ href, label, icon: Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 font-display font-bold uppercase tracking-wide text-sm",
              active
                ? "bg-brand-soft text-brand border border-brand/40"
                : "text-ink-soft hover:bg-paper border border-transparent"
            )}
          >
            <Icon className="size-5 shrink-0" />
            <span className="hidden lg:inline">{label}</span>
          </Link>
        );
      })}
      <CourseMenu />
    </aside>
  );
}
