"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type DemoUser } from "@/lib/types";

type AuthUsersPayload = {
  users: DemoUser[];
};

function sanitizeParam(value: string | null) {
  if (!value) {
    return "";
  }

  return value.trim();
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preferredUserId = useMemo(
    () =>
      sanitizeParam(searchParams.get("userId")) ||
      sanitizeParam(searchParams.get("user_id")),
    [searchParams]
  );
  const returnTo = useMemo(
    () => sanitizeParam(searchParams.get("returnTo")) || "/",
    [searchParams]
  );
  const autoLoginEnabled = useMemo(
    () =>
      ["1", "true", "yes"].includes(
        sanitizeParam(searchParams.get("autologin")).toLowerCase()
      ),
    [searchParams]
  );

  const [users, setUsers] = useState<DemoUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const autoSubmitDoneRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function loadUsers() {
      try {
        const response = await fetch("/api/auth/users", {
          method: "GET",
          cache: "no-store"
        });

        if (!response.ok) {
          throw new Error("Unable to load test users.");
        }

        const payload = (await response.json()) as AuthUsersPayload;
        if (cancelled) {
          return;
        }

        const nextUsers = Array.isArray(payload.users) ? payload.users : [];
        setUsers(nextUsers);
        setSelectedUserId((current) => {
          if (current) {
            return current;
          }

          if (
            preferredUserId &&
            nextUsers.some((user) => user.id === preferredUserId)
          ) {
            return preferredUserId;
          }

          return nextUsers[0]?.id ?? "";
        });
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error ? loadError.message : "Unable to load users."
          );
        }
      }
    }

    void loadUsers();

    return () => {
      cancelled = true;
    };
  }, [preferredUserId]);

  async function signIn(userId: string) {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ userId })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? "Unable to sign in.");
      }

      router.replace(returnTo);
      router.refresh();
    } catch (signInError) {
      setError(signInError instanceof Error ? signInError.message : "Sign-in failed.");
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    if (!autoLoginEnabled || !selectedUserId || autoSubmitDoneRef.current) {
      return;
    }

    autoSubmitDoneRef.current = true;
    void signIn(selectedUserId);
  }, [autoLoginEnabled, selectedUserId]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-bank-50 via-white to-bank-100 px-4 py-10">
      <Card className="w-full max-w-xl shadow-xl">
        <CardHeader>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-bank-700">
            NorthMaple Bank
          </p>
          <CardTitle className="text-3xl">Sign in for testing</CardTitle>
          <CardDescription>
            Select a seeded user profile so each simulated agent has isolated data and telemetry.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-ink">Test account</span>
            <select
              value={selectedUserId}
              onChange={(event) => setSelectedUserId(event.target.value)}
              className="flex h-11 w-full rounded-xl border border-border bg-white px-3 text-sm text-ink shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bank-300"
              disabled={users.length === 0 || isSubmitting}
            >
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.displayName} ({user.id})
                </option>
              ))}
            </select>
          </label>

          {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}

          <Button
            type="button"
            disabled={!selectedUserId || isSubmitting}
            onClick={() => void signIn(selectedUserId)}
            className="w-full"
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
