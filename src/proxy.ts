import { NextResponse, type NextRequest } from "next/server";
import { tools } from "@/tools/registry";

// Only categories that contain at least one tool have a page.
const known = new Set([
  ...tools.map((t) => `/tools/${t.slug}`),
  ...tools.map((t) => `/category/${t.category}`),
]);

/**
 * Tool and category pages stream, so a notFound() inside them would still
 * answer 200. Unknown slugs are rewritten to an unmatched path here instead,
 * which renders not-found.tsx with a real 404 status.
 */
export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname.replace(/\/$/, "");
  if (known.has(path)) return NextResponse.next();
  return NextResponse.rewrite(new URL("/__not-found", request.url));
}

export const config = {
  matcher: ["/tools/:slug", "/category/:slug"],
};
