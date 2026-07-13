import { MobileNav } from "@/components/mobile-nav";
import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";
import { db } from "@/lib/db";

// The course ships in three difficulty levels (prisma/course-data-level*.ts);
// the level split isn't stored in the database, only its sections are.
const COURSE_LEVELS = 3;

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const [sections, units, lessons] = await Promise.all([
    db.section.count(),
    db.unit.count(),
    db.lesson.count(),
  ]);

  return (
    <div className="flex min-h-dvh">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar courseStats={{ levels: COURSE_LEVELS, sections, units, lessons }} />
        {/* bottom padding clears the mobile tab bar */}
        <main className="flex-1 pb-20 sm:pb-0">{children}</main>
      </div>
      <MobileNav />
    </div>
  );
}
