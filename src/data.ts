import { StockPosition } from "./types";

export const INITIAL_POSITIONS: StockPosition[] = [
  {
    id: "pos_1",
    symbol: "BND",
    qty: 7.0000,
    pricePaid: 74.0457,
    dateAcquired: "2026-04-17"
  },
  {
    id: "pos_2",
    symbol: "COPX",
    qty: 5.0000,
    pricePaid: 79.5060,
    dateAcquired: "2026-06-11"
  },
  {
    id: "pos_3",
    symbol: "EWZ",
    qty: 11.0000,
    pricePaid: 34.2791,
    dateAcquired: "2026-02-23"
  },
  {
    id: "pos_4",
    symbol: "FTSL",
    qty: 20.0000,
    pricePaid: 45.0300,
    dateAcquired: "2026-04-22"
  },
  {
    id: "pos_5",
    symbol: "GOOGL",
    qty: 3.0000,
    pricePaid: 346.1000,
    dateAcquired: "2026-06-22"
  },
  {
    id: "pos_6",
    symbol: "IVV",
    qty: 1.0000,
    pricePaid: 713.1700,
    dateAcquired: "2026-04-17"
  },
  {
    id: "pos_7",
    symbol: "IYK",
    qty: 10.0000,
    pricePaid: 69.8400,
    dateAcquired: "2025-07-15"
  },
  {
    id: "pos_8",
    symbol: "JHMM",
    qty: 4.0000,
    pricePaid: 71.9450,
    dateAcquired: "2026-04-17"
  },
  {
    id: "pos_10",
    symbol: "MELI",
    qty: 1.0000,
    pricePaid: 1847.7300,
    dateAcquired: "2026-05-06"
  },
  {
    id: "pos_11",
    symbol: "MSFT",
    qty: 5.0000,
    pricePaid: 372.1260,
    dateAcquired: "2026-04-06"
  },
  {
    id: "pos_12",
    symbol: "NVDA",
    qty: 2.0000,
    pricePaid: 206.2950,
    dateAcquired: "2026-06-10"
  },
  {
    id: "pos_13",
    symbol: "SPDW",
    qty: 12.0000,
    pricePaid: 49.5650,
    dateAcquired: "2026-04-17"
  },
  {
    id: "pos_14",
    symbol: "SPY",
    qty: 2.0000,
    pricePaid: 614.3800,
    dateAcquired: "2025-06-20"
  },
  {
    id: "pos_15",
    symbol: "VHT",
    qty: 1.0000,
    pricePaid: 286.0100,
    dateAcquired: "2026-06-11"
  }
];

export const INITIAL_CASH = 1674.73;

export const FALLBACK_QUOTES: Record<string, { c: number; d: number; dp: number; pc: number }> = {
  BND: { c: 73.225, d: 0.09, dp: 0.12, pc: 73.135 },
  COPX: { c: 79.58, d: -5.31, dp: -6.26, pc: 84.89 },
  EWZ: { c: 34.105, d: -0.17, dp: -0.48, pc: 34.275 },
  FTSL: { c: 44.95, d: -0.04, dp: -0.09, pc: 44.99 },
  GOOGL: { c: 346.92, d: -2.76, dp: -0.79, pc: 349.68 },
  IVV: { c: 737.81, d: -9.97, dp: -1.33, pc: 747.78 },
  IYK: { c: 72.265, d: 1.19, dp: 1.67, pc: 71.075 },
  JHMM: { c: 73.66, d: -0.57, dp: -0.77, pc: 74.23 },
  MELI: { c: 1587.25, d: -2.20, dp: -0.14, pc: 1589.45 },
  MSFT: { c: 373.26, d: 5.92, dp: 1.61, pc: 367.34 },
  NVDA: { c: 201.07, d: -7.58, dp: -3.63, pc: 208.65 },
  SPDW: { c: 49.725, d: -1.42, dp: -2.77, pc: 51.145 },
  SPY: { c: 734.505, d: -9.88, dp: -1.33, pc: 744.385 },
  VHT: { c: 286.415, d: 3.40, dp: 1.20, pc: 283.015 }
};

