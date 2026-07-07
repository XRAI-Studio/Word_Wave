import { MobileNav } from "@/components/mobile-nav";
import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        {/* bottom padding clears the mobile tab bar */}
        <main className="flex-1 pb-20 sm:pb-0">{children}</main>
      </div>
      <MobileNav />
    </div>
  );
}
