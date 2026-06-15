import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { fetchOnboardingMarkets, fetchUserMarkets, subscribeFreeMarket } from "@/api/markets";
import type { Market } from "@/api/markets";

function formatFeature(code: string): string {
  return code.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function MarketCard({
  market,
  onSelect,
  loading,
}: {
  market: Market;
  onSelect: (marketId: number) => void;
  loading: boolean;
}) {
  const freePlan = market.plans.find((p) => p.code === "free");
  if (!freePlan) return null;

  return (
    <div className="flex flex-col rounded-xl border border-surface-border bg-surface-card p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text-primary">{market.name}</h2>
        <span className="rounded-full bg-brand-primary/10 px-3 py-0.5 text-xs font-medium text-brand-primary">
          Free
        </span>
      </div>

      <ul className="mb-6 flex-1 space-y-2.5">
        {freePlan.features.map((code) => (
          <li key={code} className="flex items-center gap-2 text-sm text-text-primary">
            <Check className="h-4 w-4 shrink-0 text-brand-primary" />
            {formatFeature(code)}
          </li>
        ))}
      </ul>

      <Button
        className="w-full"
        onClick={() => onSelect(market.market_id)}
        disabled={loading}
      >
        {loading ? "Setting up…" : "Get Started"}
      </Button>
    </div>
  );
}

export function OnboardingPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [subscribing, setSubscribing] = useState<number | null>(null);
  const [error, setError] = useState("");

  const { data: allMarkets = [] } = useQuery({
    queryKey: ["markets/onboarding"],
    queryFn: fetchOnboardingMarkets,
  });

  const { data: userMarkets = [], isSuccess: marketsLoaded } = useQuery({
    queryKey: ["me/markets"],
    queryFn: fetchUserMarkets,
  });

  useEffect(() => {
    if (marketsLoaded && userMarkets.length > 0) {
      navigate(`/app/${userMarkets[0].code}/dashboard`, { replace: true });
    }
  }, [marketsLoaded, userMarkets, navigate]);

  const handleSelect = async (marketId: number) => {
    setSubscribing(marketId);
    setError("");
    try {
      const market = allMarkets.find((m) => m.market_id === marketId);
      await subscribeFreeMarket(marketId);
      await queryClient.invalidateQueries({ queryKey: ["me/markets"] });
      navigate(`/app/${market?.code ?? "stocks"}/dashboard`, { replace: true });
    } catch {
      setError("Something went wrong. Please try again.");
      setSubscribing(null);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-surface-bg px-4 py-12">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-2xl space-y-8">
        <div className="flex flex-col items-center text-center">
          <img src="/logo.png" alt="ALumiEye" className="mb-6 h-10 w-auto" />
          <h1 className="text-2xl font-bold text-text-primary">Choose your market</h1>
          <p className="mt-2 text-sm text-text-secondary">
            Pick one to get started for free. You can add more markets later from Billing.
          </p>
        </div>

        {error && (
          <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-center text-sm text-red-500">
            {error}
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          {allMarkets.map((market) => (
            <MarketCard
              key={market.market_id}
              market={market}
              onSelect={handleSelect}
              loading={subscribing === market.market_id}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
