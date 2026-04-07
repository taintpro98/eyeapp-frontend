import { Lock } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { PageHeader } from "@/components/PageHeader";
import { SectionCard } from "@/components/SectionCard";
import { DataTable } from "@/components/DataTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlanBadge } from "@/components/PlanBadge";
import { mockSignalsList } from "@/data/mockSignals";
import { cn } from "@/lib/utils";

export function SignalsPage() {
  const openUpgradeModal = useAppStore((s) => s.openUpgradeModal);
  return (
    <div className="space-y-5 sm:space-y-8">
      <PageHeader
        title="Signals"
        subtitle="Trading signals and alerts"
        children={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Input
              placeholder="Filter by symbol..."
              className="w-full min-w-0 sm:w-48"
            />
            <Button variant="outline" className="w-full shrink-0 sm:w-auto">
              Filters
            </Button>
          </div>
        }
      />

      <SectionCard
        title="Active Signals"
        subtitle="Market-aware signals"
        className="p-3 sm:p-4 md:p-6"
      >
        <DataTable
          columns={[
            { key: "symbol", header: "Symbol" },
            { key: "type", header: "Type" },
            { key: "strength", header: "Strength" },
            {
              key: "confidence",
              header: "Confidence",
              render: (row) => (
                <span
                  className={
                    row.confidence >= 80
                      ? "font-medium text-green-600 dark:text-green-400"
                      : ""
                  }
                >
                  {row.confidence}%
                </span>
              ),
            },
            { key: "time", header: "Time" },
            {
              key: "premium",
              header: "",
              render: (row) =>
                row.premium ? <PlanBadge label="Pro" variant="pro" /> : null,
            },
          ]}
          data={mockSignalsList}
          renderMobileCard={(row) => (
            <div
              className={cn(
                "rounded-lg border border-surface-border bg-surface-card p-3 sm:p-4",
                "dark:bg-zinc-900/40",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-lg font-semibold text-text-primary">
                  {row.symbol}
                </span>
                {row.premium ? <PlanBadge label="Pro" variant="pro" /> : null}
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-3 text-sm">
                <div>
                  <dt className="text-[11px] font-medium uppercase tracking-wide text-text-secondary">
                    Type
                  </dt>
                  <dd className="mt-0.5 font-medium text-text-primary">
                    {row.type}
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] font-medium uppercase tracking-wide text-text-secondary">
                    Strength
                  </dt>
                  <dd className="mt-0.5 font-medium text-text-primary">
                    {row.strength}
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] font-medium uppercase tracking-wide text-text-secondary">
                    Confidence
                  </dt>
                  <dd
                    className={cn(
                      "mt-0.5 font-medium tabular-nums",
                      row.confidence >= 80 &&
                        "text-green-600 dark:text-green-400",
                    )}
                  >
                    {row.confidence}%
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] font-medium uppercase tracking-wide text-text-secondary">
                    Time
                  </dt>
                  <dd className="mt-0.5 text-text-primary">{row.time}</dd>
                </div>
              </dl>
            </div>
          )}
        />
      </SectionCard>

      <SectionCard
        title="Advanced Signal Analytics"
        subtitle="Premium feature — Unlock with Pro plan"
        className="relative overflow-hidden p-3 sm:p-4 md:p-6"
      >
        <div className="pointer-events-none select-none blur-sm">
          <div className="h-48 rounded-lg border border-surface-border bg-surface-warm/50 p-4">
            <p className="text-text-secondary">
              Correlation matrix, backtest results, and custom alerts...
            </p>
          </div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center px-3">
          <Button
            className="w-full max-w-sm sm:w-auto"
            onClick={() =>
              openUpgradeModal({
                feature: "Advanced Signal Analytics",
                reason: "Pro plan",
              })
            }
          >
            <Lock className="mr-2 h-4 w-4" />
            Unlock Advanced Analytics
          </Button>
        </div>
      </SectionCard>
    </div>
  );
}
