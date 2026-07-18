import { redirect } from "next/navigation";
import { MobileNav } from "@/components/mobile-nav";
import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  // Proxy already gated on the session cookie; resolve the active course here.
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!user.activeCourseId) redirect("/welcome");
  const course = await db.course.findUnique({ where: { id: user.activeCourseId } });
  if (!course) redirect("/welcome");

  const isProd = process.env.NODE_ENV === "production";
  const [sections, units, lessons, levelRows, courses] = await Promise.all([
    db.section.count({ where: { courseId: course.id } }),
    db.unit.count({ where: { section: { courseId: course.id } } }),
    db.lesson.count({ where: { unit: { section: { courseId: course.id } } } }),
    db.section.findMany({ where: { courseId: course.id }, select: { level: true }, distinct: ["level"] }),
    db.course.findMany({
      where: isProd ? { isAvailable: true } : {},
      orderBy: { order: "asc" },
      select: { code: true, name: true, emblem: true },
    }),
  ]);
  const levels = new Set(levelRows.map((r) => r.level)).size;

  return (
    <div className="flex min-h-dvh">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          courseStats={{ levels, sections, units, lessons }}
          activeCourse={{ code: course.code, name: course.name, emblem: course.emblem }}
          courses={courses}
        />
        {/* bottom padding clears the mobile tab bar */}
        <main className="flex-1 pb-20 sm:pb-0">{children}</main>
      </div>
      <MobileNav />
    </div>
  );
}
