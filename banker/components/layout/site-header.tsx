"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useBankStore } from "@/lib/bank-store";

export function SiteHeader() {
  const user = useBankStore((state) => state.user);
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    setIsSigningOut(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST"
      });
    } finally {
      window.location.assign("/login");
    }
  }

  return (
    <header className="border-b border-border/80 bg-white/80 backdrop-blur">
      <div className="mx-auto flex w-full items-center justify-between gap-4 px-4 py-4 lg:px-8">
        <div className="space-y-1">
          <p className="font-[family-name:var(--font-display)] text-2xl font-semibold text-ink">
            NorthMaple Bank
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void handleSignOut()}
            disabled={isSigningOut}
          >
            {isSigningOut ? "Switching..." : "Switch User"}
          </Button>
          <div className="flex items-center gap-3 rounded-full border border-border bg-white px-3 py-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-bank-100 text-sm font-semibold text-bank-700">
              {user.avatarInitials}
            </div>
            <div className="hidden text-sm sm:block">
              <p className="font-semibold text-ink">{user.displayName}</p>
              <p className="text-slate-500">Personal profile</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
