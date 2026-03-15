import { cookies } from "next/headers";
import { type DemoUser } from "@/lib/types";
import { getBankUserById } from "@/lib/test-users";

export const AUTH_USER_COOKIE = "northmaple_user_id";
const TEST_USER_HEADER = "x-test-user-id";

function parseCookieValue(cookieHeader: string, name: string) {
  const items = cookieHeader.split(";").map((item) => item.trim());
  const pair = items.find((item) => item.startsWith(`${name}=`));
  return pair ? decodeURIComponent(pair.slice(name.length + 1)) : null;
}

export function getUserIdFromRequest(request: Request) {
  const headerUserId = request.headers.get(TEST_USER_HEADER);
  if (headerUserId) {
    return headerUserId.trim();
  }

  const cookieHeader = request.headers.get("cookie") ?? "";
  return parseCookieValue(cookieHeader, AUTH_USER_COOKIE);
}

export async function getUserIdFromServerCookie() {
  const store = await cookies();
  return store.get(AUTH_USER_COOKIE)?.value ?? null;
}

export function getUserFromRequest(request: Request): DemoUser | null {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return null;
  }

  return getBankUserById(userId);
}

export async function getUserFromServerCookie() {
  const userId = await getUserIdFromServerCookie();
  if (!userId) {
    return null;
  }

  return getBankUserById(userId);
}
