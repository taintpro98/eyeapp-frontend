import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/store/useAuthStore";
import { useAppStore } from "@/store/useAppStore";
import { accountMenuItems } from "@/config/navigation";
import { getIcon } from "@/lib/icons";
import { Bell, ChevronDown, Menu, Lock } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { MarketToggle } from "./MarketToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { MarketToggleItem } from "@/types";

type TopBarProps = {
  marketToggleItems: MarketToggleItem[];
  selectedMarket: string;
  onMarketSelect: (code: string) => void;
  userDisplayName: string;
  planCode?: string;
};

export function TopBar({
  marketToggleItems,
  selectedMarket,
  onMarketSelect,
  userDisplayName,
  planCode,
}: TopBarProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const setSidebarOpen = useAppStore((s) => s.setSidebarOpen);
  const openUpgradeModal = useAppStore((s) => s.openUpgradeModal);
  const route = location.pathname.split("/").pop() ?? "dashboard";
  const pageTitle = t(`nav.${route}`, { defaultValue: route });

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-2 border-b border-surface-border bg-surface-card/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-surface-card/80 sm:gap-4 sm:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0 lg:hidden"
        onClick={() => setSidebarOpen(true)}
        aria-label={t("common.openMenu")}
      >
        <Menu className="h-5 w-5" />
      </Button>
      <h2 className="shrink-0 text-base font-semibold text-text-primary sm:text-lg">
        {pageTitle}
      </h2>
      <div className="hidden shrink-0 sm:block">
        <MarketToggle
          items={marketToggleItems}
          selectedMarket={selectedMarket}
          onSelect={onMarketSelect}
        />
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="shrink-0 bg-brand-primary text-white hover:bg-brand-primary/90 hover:text-white sm:hidden">
            {marketToggleItems.find((m) => m.code === selectedMarket)
              ?.label ?? t("common.market")}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {marketToggleItems.map((item) => (
            <DropdownMenuItem
              key={item.code}
              onClick={() =>
                item.accessible
                  ? onMarketSelect(item.code)
                  : openUpgradeModal({
                      market: item.label,
                      marketCode: item.code,
                      reason: item.reason ?? undefined,
                      reasonKey:
                        item.code === "crypto" ? "upgradeToPro" : undefined,
                    })
              }
            >
              {item.label}
              {!item.accessible && (
                <Lock className="ml-auto h-3.5 w-3.5 text-text-secondary" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <div className="flex-1" />
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <LanguageSwitcher />
        <ThemeToggle />
        <Button
          variant="ghost"
          size="icon"
          aria-label={t("common.notifications")}
        >
          <Bell className="h-5 w-5" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex cursor-pointer items-center gap-2 rounded-full px-1 py-1 transition-colors hover:bg-surface-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary sm:rounded-lg sm:px-2.5 sm:py-1.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-primary text-sm font-semibold text-white ring-2 ring-brand-primary/30">
                {userDisplayName.charAt(0).toUpperCase()}
              </div>
              <span className="hidden text-sm font-medium text-text-primary sm:inline">{userDisplayName}</span>
              <ChevronDown className="hidden h-4 w-4 text-text-secondary sm:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>{t("account.myAccount")}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {accountMenuItems.map((item) => {
              if (item.type !== "link") return null;
              const Icon = getIcon(item.icon);
              const isPlanBilling = item.path === "/app/billing";
              const planLabel = planCode
                ? planCode.charAt(0).toUpperCase() + planCode.slice(1)
                : null;
              return (
                <DropdownMenuItem
                  key={item.path}
                  onClick={() => navigate(item.path)}
                >
                  <div className="flex flex-col">
                    <span className="flex items-center gap-2">
                      <Icon className="h-4 w-4 shrink-0" />
                      {t(item.labelKey)}
                    </span>
                    {isPlanBilling && planLabel && (
                      <span className="ml-6 text-xs text-text-secondary">
                        {t("account.currentPlan", { plan: planLabel })}
                      </span>
                    )}
                  </div>
                </DropdownMenuItem>
              );
            })}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600"
              onClick={async () => {
                await logout();
                navigate("/sign-in");
              }}
            >
              {t("account.signOut")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
