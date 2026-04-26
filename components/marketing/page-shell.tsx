import type { ReactNode } from "react";
import { MarketingHeader } from "./header";
import { MarketingFooter } from "./footer";

export function MarketingShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col app-shell-bg text-slate-900">
      <MarketingHeader />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  );
}
