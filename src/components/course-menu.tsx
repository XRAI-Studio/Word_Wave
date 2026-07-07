"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, Check, ChevronDown, Star } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface CourseData {
  activeLessonId: string | null;
  sections: {
    id: string;
    title: string;
    units: {
      id: string;
      title: string;
      lessons: { id: string; title: string; completed: boolean }[];
    }[];
  }[];
}

// Sidebar dropdown to jump straight to any lesson in the course.
export function CourseMenu() {
  const router = useRouter();
  const pathname = usePathname();
  const [course, setCourse] = useState<CourseData | null>(null);

  // Refetch when the route changes so completion marks stay fresh.
  useEffect(() => {
    fetch("/api/units")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setCourse)
      .catch(() => {});
  }, [pathname]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Jump to a lesson"
        className={cn(
          "flex items-center gap-3 rounded-xl px-3 py-2.5 font-display font-bold uppercase tracking-wide text-sm",
          "text-ink-soft hover:bg-paper border border-transparent",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        )}
      >
        <BookOpen className="size-5 shrink-0" />
        <span className="hidden lg:inline flex-1 text-left">Jump to…</span>
        <ChevronDown className="hidden lg:block size-4" />
      </DropdownMenuTrigger>

      <DropdownMenuContent side="right" align="start" className="max-h-[70vh] w-64 overflow-y-auto">
        {!course && (
          <DropdownMenuGroup>
            <DropdownMenuLabel>Loading course…</DropdownMenuLabel>
          </DropdownMenuGroup>
        )}
        {course?.sections.map((section, si) => (
          <div key={section.id}>
            {si > 0 && <DropdownMenuSeparator />}
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-display uppercase tracking-widest text-xs text-ink-soft">
                {section.title}
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            {section.units.map((unit, ui) => (
              <DropdownMenuGroup key={unit.id}>
                <DropdownMenuLabel className="pt-2 font-display text-brand">
                  {ui + 1} · {unit.title}
                </DropdownMenuLabel>
                {unit.lessons.map((lesson) => (
                  <DropdownMenuItem
                    key={lesson.id}
                    onClick={() => router.push(`/lesson/${lesson.id}`)}
                    className="pl-6"
                  >
                    <span className="flex-1">{lesson.title}</span>
                    {lesson.completed ? (
                      <Check className="size-4 text-verde" aria-label="completed" />
                    ) : lesson.id === course.activeLessonId ? (
                      <Star className="size-4 fill-current text-saffron-deep" aria-label="up next" />
                    ) : null}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            ))}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
