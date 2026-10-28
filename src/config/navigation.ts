import type { SidebarItem } from "@/types";

/**
 * Sidebar keys for core daily-use pages only, in display order. Billing and Settings
 * live in the account menu.
 */
export const SIDEBAR_NAV_KEYS = [
  "dashboard",
  "market",
  "fundamental",
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

/** Sidebar keys that only make sense on the VN stock market (FA data covers listed Vietnamese companies). */
export const VN_STOCK_ONLY_NAV_KEYS = ["fundamental"] as const;

/** Core nav items only (excludes billing, settings), ordered as in SIDEBAR_NAV_KEYS. */
export function getSidebarNavItems(allItems: SidebarItem[]): SidebarItem[] {
  const order = (item: SidebarItem) => SIDEBAR_NAV_KEYS.indexOf(item.key as (typeof SIDEBAR_NAV_KEYS)[number]);
  return allItems.filter((item) => order(item) >= 0).sort((a, b) => order(a) - order(b));
}
