"use client";

import { Award, ExternalLink, ShoppingBag } from "lucide-react";
import { PORTAL } from "@/lib/api-fetch";

// Achievements, quests and the shop (streak freezes and more) belong to the school
// portal now, shared across every class (spec §4). This page points there.
export default function AwardsPage() {
  const links = [
    {
      href: `${PORTAL}/achievements`,
      icon: <Award className="size-6 text-saffron-deep" aria-hidden />,
      title: "Achievements",
      body: "Word Wave's badges sit alongside every other class's.",
    },
    {
      href: `${PORTAL}/shop`,
      icon: <ShoppingBag className="size-6 text-brand" aria-hidden />,
      title: "Shop",
      body: "Spend gems on streak freezes and more.",
    },
  ];
  return (
    <div className="mx-auto w-full max-w-xl px-4 py-10">
      <h1 className="font-display text-2xl font-extrabold">Awards</h1>
      <p className="mt-1 text-ink-soft">Your awards live on your school account.</p>
      <div className="mt-6 space-y-3">
        {links.map((l) => (
          <a
            key={l.href}
            href={l.href}
            className="flex items-center gap-4 rounded-2xl border-b-4 border-line bg-white px-4 py-4"
          >
            {l.icon}
            <span className="flex-1">
              <span className="block font-display font-extrabold">{l.title}</span>
              <span className="block text-sm text-ink-soft">{l.body}</span>
            </span>
            <ExternalLink className="size-4 text-ink-soft" aria-hidden />
          </a>
        ))}
      </div>
    </div>
  );
}
