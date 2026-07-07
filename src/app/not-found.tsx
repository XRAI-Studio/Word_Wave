import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <h1 className="font-display text-2xl font-extrabold">Page not found</h1>
      <p className="mt-2 text-ink-soft">That page isn&apos;t on the path.</p>
      <Link href="/learn" className="mt-6 font-bold text-brand underline">
        Back to the path
      </Link>
    </div>
  );
}
