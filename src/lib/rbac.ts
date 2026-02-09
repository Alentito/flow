import type { Session } from "next-auth";

export type AppRole = "VISITOR" | "MEMBER" | "ADMIN";

export type SignedInSession = Session & {
  user: NonNullable<Session["user"]> & { id: string };
};

export type MemberSession = SignedInSession & {
  user: NonNullable<Session["user"]> & { id: string; role: "MEMBER" | "ADMIN" };
};

export function requireSignedIn(session: Session | null) {
  if (!session?.user?.id) {
    return { ok: false as const, status: 401 as const, error: "Unauthorized" };
  }
  return { ok: true as const };
}

export function requireMember(session: Session | null) {
  const signedIn = requireSignedIn(session);
  if (!signedIn.ok) return signedIn;

  const role = session?.user?.role as AppRole | undefined;
  if (role !== "MEMBER" && role !== "ADMIN") {
    return { ok: false as const, status: 403 as const, error: "Forbidden" };
  }
  return { ok: true as const };
}

export function isSignedInSession(session: Session | null): session is SignedInSession {
  return Boolean(session?.user?.id);
}

export function isMemberSession(session: Session | null): session is MemberSession {
  const role = session?.user?.role as AppRole | undefined;
  return Boolean(session?.user?.id) && (role === "MEMBER" || role === "ADMIN");
}

export function isAdmin(session: Session | null) {
  const role = session?.user?.role as AppRole | undefined;
  return role === "ADMIN";
}
