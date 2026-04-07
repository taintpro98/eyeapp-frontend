import { create } from "zustand";

export type UpgradeModalContext = {
  /** Raw label for fallback */
  feature?: string;
  /** Key under `upgrade.features.*.title` */
  featureKey?: string;
  market?: string;
  /** For i18n: `marketToggle.${marketCode}` */
  marketCode?: string;
  reason?: string;
  /** Key under `upgrade.reasons.*` */
  reasonKey?: string;
};

type AppState = {
  selectedMarket: string;
  sidebarCollapsed: boolean;
  sidebarOpen: boolean;
  upgradeModalOpen: boolean;
  upgradeModalContext: UpgradeModalContext | null;
  setSelectedMarket: (market: string) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
  openUpgradeModal: (context?: UpgradeModalContext) => void;
  closeUpgradeModal: () => void;
};

export const useAppStore = create<AppState>((set) => ({
  selectedMarket: "stocks",
  sidebarCollapsed: false,
  sidebarOpen: false,
  upgradeModalOpen: false,
  upgradeModalContext: null,
  setSelectedMarket: (market) => set({ selectedMarket: market }),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  openUpgradeModal: (context) =>
    set({ upgradeModalOpen: true, upgradeModalContext: context ?? null }),
  closeUpgradeModal: () =>
    set({ upgradeModalOpen: false, upgradeModalContext: null }),
}));
