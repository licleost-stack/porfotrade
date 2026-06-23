export interface StockPosition {
  id: string;
  symbol: string;
  qty: number;
  pricePaid: number;
  dateAcquired: string;
  notes?: string;
}

export interface Portfolio {
  positions: StockPosition[];
  cash: number;
}

export interface QuoteData {
  c: number;   // Current price
  d: number;   // Change
  dp: number;  // Percent change
  h: number;   // High
  l: number;   // Low
  o: number;   // Open
  pc: number;  // Previous close
  error?: string;
}

export interface MarketMetrics {
  currentPrice: number;
  previousClose: number;
  change: number;
  changePercent: number;
  value: number;
  cost: number;
  dayGain: number;
  dayGainPercent: number;
  totalGain: number;
  totalGainPercent: number;
}

export interface SearchResult {
  description: string;
  displaySymbol: string;
  symbol: string;
  type: string;
}
