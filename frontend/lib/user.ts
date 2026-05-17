import { cache } from "react";
import { cookies } from "next/headers";

const BACKEND_URL =
  process.env.BACKEND_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8080";

export type User = {
  id: string;
  name: string;
  email: string;
  avatar_url: string;
};

async function fetchUser(cookieHeader: string): Promise<User | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/v1/auth/me`, {
      headers: { Cookie: cookieHeader },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data ?? null;
  } catch {
    return null;
  }
}

// Memoised per request — called by both Navbar and (app)/layout without double-fetching.
export const getUser = cache(async (): Promise<User | null> => {
  const cookieStore = await cookies();
  return fetchUser(cookieStore.toString());
});
