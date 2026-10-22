import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-32 text-center">
      <p className="text-sm font-semibold text-accent">404</p>
      <h1 className="mt-2 text-3xl font-bold">This tool doesn&apos;t exist (yet)</h1>
      <p className="mt-3 text-muted">The page you&apos;re looking for isn&apos;t here. Browse all tools instead.</p>
      <Link href="/" className="btn-primary mt-8">
        See all tools
      </Link>
    </div>
  );
}
