import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/store/useAuthStore";
import { useAppStore } from "@/store/useAppStore";
import { accountMenuItems } from "@/config/navigation";
import { getIcon } from "@/lib/icons";
import { Search, Bell, ChevronDown, Menu, Lock } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Input } from "@/components/ui/input";
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
      <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden sm:gap-6">
        <h2 className="truncate text-base font-semibold text-text-primary sm:text-lg">
          {pageTitle}
        </h2>
        <div className="hidden min-w-0 shrink sm:block">
          <MarketToggle
            items={marketToggleItems}
            selectedMarket={selectedMarket}
            onSelect={onMarketSelect}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="shrink-0 sm:hidden">
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
      </div>
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
          <Input
            placeholder={t("common.searchCmdK")}
            className="w-40 pl-9 lg:w-64"
            readOnly
          />
        </div>
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
            <Button variant="ghost" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary/20 text-sm font-medium text-brand-primary">
                {userDisplayName.charAt(0)}
              </div>
              <span className="hidden sm:inline">{userDisplayName}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
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
