import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/PageHeader";
import { SectionCard } from "@/components/SectionCard";
import { PortfolioAllocation } from "@/components/portfolio/PortfolioAllocation";
import { mockPortfolioSlices } from "@/data/mockPortfolio";

export function PortfolioPage() {
  const { t } = useTranslation();
  return (
    <div className="space-y-5 sm:space-y-8">
      <PageHeader
        title={t("portfolio.title")}
        subtitle={t("portfolio.subtitle")}
      />

      <SectionCard
        title={t("portfolio.allocation")}
        className="relative overflow-hidden border-brand-primary/10 bg-gradient-to-br from-brand-primary/[0.04] via-transparent to-brand-light/[0.03] p-3 shadow-soft sm:p-4 md:p-6 dark:from-brand-primary/[0.07] dark:to-transparent"
      >
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand-primary/5 blur-3xl dark:bg-brand-light/10"
          aria-hidden
        />
        <div className="relative">
          <PortfolioAllocation slices={mockPortfolioSlices} />
        </div>
      </SectionCard>
    </div>
  );
}
