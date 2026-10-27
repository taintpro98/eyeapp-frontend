export type ScreenerFilterState = {
  query: string;
  exchange: string;
  rating: string;
  minScore: string;
  watchedOnly: boolean;
  pageSize: number;
};

export const DEFAULT_SCREENER_FILTERS: ScreenerFilterState = {
  query: "",
  exchange: "",
  rating: "",
  minScore: "",
  watchedOnly: true,
  pageSize: 20,
};
