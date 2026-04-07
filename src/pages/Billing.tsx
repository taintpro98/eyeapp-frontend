import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { SectionCard } from "@/components/SectionCard";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { PlanBadge } from "@/components/PlanBadge";
import { mockPlans, mockInvoices } from "@/data/mockBilling";

export function BillingPage() {
  const { t } = useTranslation();

  const invoiceColumns = useMemo(
    () => [
      { key: "id", header: t("billing.columns.invoice") },
      { key: "date", header: t("billing.columns.date") },
      { key: "amount", header: t("billing.columns.amount") },
      {
        key: "status",
        header: t("billing.columns.status"),
        render: (row: (typeof mockInvoices)[number]) =>
          row.status === "Paid" ? t("billing.invoicePaid") : row.status,
      },
    ],
    [t],
  );

  return (
    <div className="space-y-8">
      <PageHeader title={t("billing.title")} subtitle={t("billing.subtitle")} />

      <SectionCard title={t("billing.currentPlan")}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <PlanBadge label={t("billing.plans.free.name")} variant="default" />
            <div>
              <p className="font-medium">{t("billing.freePlan")}</p>
              <p className="text-sm text-text-secondary">
                {t("billing.nextBilling")}
              </p>
            </div>
          </div>
          <Button>{t("billing.upgradePlan")}</Button>
        </div>
      </SectionCard>

      <SectionCard
        title={t("billing.comparePlans")}
        subtitle={t("billing.comparePlansSubtitle")}
      >
        <div className="grid gap-4 md:grid-cols-3">
          {mockPlans.map((plan) => {
            const features = t(`billing.plans.${plan.code}.features`, {
              returnObjects: true,
            }) as string[];
            return (
              <div
                key={plan.code}
                className={`rounded-card border p-6 ${
                  plan.current
                    ? "border-brand-primary bg-brand-primary/5"
                    : "border-surface-border"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">
                    {t(`billing.plans.${plan.code}.name`)}
                  </h3>
                  {plan.current && (
                    <PlanBadge
                      label={t("billing.cta.current")}
                      variant="default"
                    />
                  )}
                </div>
                <p className="mt-2 text-2xl font-bold text-text-primary">
                  {plan.price}
                </p>
                <ul className="mt-4 space-y-2">
                  {features.map((f, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 text-sm text-text-secondary"
                    >
                      <Check className="h-4 w-4 text-brand-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
                {!plan.current && (
                  <Button
                    className="mt-4 w-full"
                    variant={plan.current ? "outline" : "default"}
                  >
                    {plan.code === "free"
                      ? t("billing.cta.current")
                      : t("billing.cta.upgrade")}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard title={t("billing.invoiceHistory")}>
        <DataTable columns={invoiceColumns} data={mockInvoices} />
      </SectionCard>
    </div>
  );
}
