import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import * as Tabs from "@radix-ui/react-tabs";
import { PageHeader } from "@/components/PageHeader";
import { FaOverviewPanel } from "@/components/fundamental/FaOverviewPanel";
import { FundamentalMarketGuard } from "@/components/fundamental/FundamentalMarketGuard";
import { IndustryBenchmarkPanel } from "@/components/fundamental/IndustryBenchmarkPanel";
import { ScreenerPanel } from "@/components/fundamental/ScreenerPanel";
import { TickerSearch } from "@/components/fundamental/TickerSearch";

const TABS = ["screener", "industry"] as const;
type Tab = (typeof TABS)[number];

const triggerClass =
  "relative -mb-px border-b-2 border-transparent px-1 pb-2.5 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary " +
  "data-[state=active]:border-brand-primary data-[state=active]:text-text-primary dark:data-[state=active]:border-brand-light";

export function FundamentalPage() {
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();
  const raw = params.get("tab");
  const tab: Tab = TABS.includes(raw as Tab) ? (raw as Tab) : "screener";

  // Keep the tab in the URL so it survives reloads and back/forward.
  const changeTab = (next: string) => {
    const nextParams = new URLSearchParams(params);
    if (next === "screener") nextParams.delete("tab");
    else nextParams.set("tab", next);
    setParams(nextParams, { replace: true });
  };

  return (
    <FundamentalMarketGuard>
      <div className="space-y-6">
        <PageHeader title={t("fa.page.title")} subtitle={t("fa.page.subtitle")}>
          <TickerSearch />
        </PageHeader>

        <FaOverviewPanel />

        <Tabs.Root value={tab} onValueChange={changeTab} className="space-y-4">
          <Tabs.List className="flex gap-6 border-b border-surface-border" aria-label={t("fa.page.tabsLabel")}>
            <Tabs.Trigger value="screener" className={triggerClass}>
              {t("fa.page.tabs.screener")}
            </Tabs.Trigger>
            <Tabs.Trigger value="industry" className={triggerClass}>
              {t("fa.page.tabs.industry")}
            </Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="screener" className="focus:outline-none">
            <ScreenerPanel />
          </Tabs.Content>
          <Tabs.Content value="industry" className="focus:outline-none">
            <IndustryBenchmarkPanel />
          </Tabs.Content>
        </Tabs.Root>

        <p className="text-center text-xs text-text-secondary">{t("fa.disclaimer")}</p>
      </div>
    </FundamentalMarketGuard>
  );
}
