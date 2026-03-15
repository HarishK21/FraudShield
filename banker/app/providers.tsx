"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { TelemetryProvider } from "@/lib/telemetry";
import { useBankStore } from "@/lib/bank-store";

function BankBootstrap() {
  const initialize = useBankStore((state) => state.initialize);
  const pathname = usePathname();

  useEffect(() => {
    if (pathname?.startsWith("/login")) {
      return;
    }

    void initialize();
  }, [initialize, pathname]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TelemetryProvider>
      <BankBootstrap />
      {children}
    </TelemetryProvider>
  );
}
