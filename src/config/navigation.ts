import type { SidebarItem } from "@/types";

/** Sidebar keys for core daily-use pages only. Billing and Settings live in the account menu. */
export const SIDEBAR_NAV_KEYS = [
  "dashboard",
  "market",
  "signals",
  "positions",
  "watchlist",
  "portfolio",
  "analysis",
  "ai-insights",
] as const;

export type AccountMenuLinkItem = {
  type: "link";
  /** i18n key (e.g. account.planBilling) */
  labelKey: string;
  path: string;
  icon: string;
  description?: string;
};

export const accountMenuItems: AccountMenuLinkItem[] = [
  {
    type: "link",
    labelKey: "account.profile",
    path: "/app/profile",
    icon: "User",
  },
  {
    type: "link",
    labelKey: "account.planBilling",
    path: "/app/billing",
    icon: "CreditCard",
  },
  {
    type: "link",
    labelKey: "account.settings",
    path: "/app/settings",
    icon: "Settings",
  },
];

/** Filter sidebar items to only include core nav (excludes billing, settings). */
export function getSidebarNavItems(allItems: SidebarItem[]): SidebarItem[] {
  return allItems.filter((item) =>
    SIDEBAR_NAV_KEYS.includes(item.key as (typeof SIDEBAR_NAV_KEYS)[number]),
  );
}
