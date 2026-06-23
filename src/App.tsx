import { useState, useEffect, useCallback, useMemo } from "react";
import { RefreshCw, Landmark, Key, Wifi, WifiOff } from "lucide-react";
import { INITIAL_POSITIONS, INITIAL_CASH, FALLBACK_QUOTES } from "./data";
import { StockPosition, QuoteData, MarketMetrics } from "./types";
import { fetchQuotes } from "./lib/api";

import PortfolioSummary from "./components/PortfolioSummary";
import PortfolioTable from "./components/PortfolioTable";
import PortfolioCharts from "./components/PortfolioCharts";
import AddPositionForm from "./components/AddPositionForm";
import ApiKeyInstructions from "./components/ApiKeyInstructions";

export default function App() {
  // 1. Portfolio State
  const [positions, setPositions] = useState<StockPosition[]>(() => {
    const saved = localStorage.getItem("portfolio_positions");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error loading positions from localStorage", e);
      }
    }
    return INITIAL_POSITIONS;
  });

  const [cash, setCash] = useState<number>(() => {
    const saved = localStorage.getItem("portfolio_cash");
    if (saved) {
      const parsed = parseFloat(saved);
      if (!isNaN(parsed)) return parsed;
    }
    return INITIAL_CASH;
  });

  // 2. Client-side API Key State
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem("finnhub_api_key") || "";
  });

  // 3. Market Quotes State
  const [quotes, setQuotes] = useState<Record<string, QuoteData>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  // Save portfolio state to localStorage when changed
  useEffect(() => {
    localStorage.setItem("portfolio_positions", JSON.stringify(positions));
  }, [positions]);

  useEffect(() => {
    localStorage.setItem("portfolio_cash", cash.toString());
  }, [cash]);

  // 4. Refresh Action (Manual or trigger on symbols list change)
  const handleRefresh = useCallback(async (customKey?: string) => {
    const activeKey = customKey !== undefined ? customKey : apiKey;
    if (positions.length === 0) return;
    
    if (!activeKey) {
      // Clear live quotes to fallback to static spreadsheet data
      setQuotes({});
      setLastRefreshed(null);
      setApiError(null);
      return;
    }

    setIsRefreshing(true);
    setApiError(null);

    // Get unique symbols list (excluding CASH)
    const symbols = Array.from(new Set(positions.map((p) => p.symbol))) as string[];

    try {
      const fetched = await fetchQuotes(symbols, activeKey);
      
      // Check if any of the fetched quotes have errors or if everything returned empty/invalid
      const hasValidQuote = Object.values(fetched).some(q => q.c > 0);
      if (!hasValidQuote && symbols.length > 0) {
        setApiError("No se pudieron obtener cotizaciones. Verifica si la API Key es válida o si alcanzaste el límite de peticiones de Finnhub (60/min).");
      }

      setQuotes(fetched);
      setLastRefreshed(new Date());
    } catch (err: any) {
      console.error("Error refreshing quotes client-side:", err);
      setApiError(err.message || "Error al conectar con la API de Finnhub.");
    } finally {
      setIsRefreshing(false);
    }
  }, [positions, apiKey]);

  // Trigger initial load when positions symbols change, or when apiKey changes
  useEffect(() => {
    handleRefresh();
  }, [positions.length, apiKey]);

  // 5. API Key Actions
  const handleSaveApiKey = (newKey: string) => {
    localStorage.setItem("finnhub_api_key", newKey);
    setApiKey(newKey);
    handleRefresh(newKey);
  };

  const handleClearApiKey = () => {
    localStorage.removeItem("finnhub_api_key");
    setApiKey("");
    setQuotes({});
    setLastRefreshed(null);
    setApiError(null);
  };

  // 6. Portfolio Actions
  const handleAddPosition = (newPos: {
    symbol: string;
    qty: number;
    pricePaid: number;
    dateAcquired: string;
  }) => {
    // Check if position already exists for that symbol, merge if so (avg price paid)
    const existingIndex = positions.findIndex(
      (p) => p.symbol.toUpperCase() === newPos.symbol.toUpperCase()
    );

    if (existingIndex >= 0) {
      const existing = positions[existingIndex];
      const mergedQty = existing.qty + newPos.qty;
      const mergedPricePaid =
        (existing.qty * existing.pricePaid + newPos.qty * newPos.pricePaid) /
        mergedQty;

      const updated = [...positions];
      updated[existingIndex] = {
        ...existing,
        qty: mergedQty,
        pricePaid: mergedPricePaid,
        dateAcquired: existing.dateAcquired || newPos.dateAcquired,
      };
      setPositions(updated);
    } else {
      setPositions([
        ...positions,
        {
          id: `pos_${Date.now()}`,
          symbol: newPos.symbol.toUpperCase(),
          qty: newPos.qty,
          pricePaid: newPos.pricePaid,
          dateAcquired: newPos.dateAcquired,
        },
      ]);
    }
  };

  const handleUpdatePosition = (id: string, updatedFields: Partial<StockPosition>) => {
    setPositions(
      positions.map((pos) => (pos.id === id ? { ...pos, ...updatedFields } : pos))
    );
  };

  const handleRemovePosition = (id: string) => {
    setPositions(positions.filter((pos) => pos.id !== id));
  };

  const handleUpdateCash = (newCash: number) => {
    setCash(newCash);
  };

  const handleImportPortfolio = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data && (Array.isArray(data.positions) || typeof data.cash === "number")) {
        if (Array.isArray(data.positions)) {
          // Filter out MBRFY
          const cleanPos = data.positions.filter(
            (p: any) => p && typeof p.symbol === "string" && p.symbol.toUpperCase() !== "MBRFY"
          );
          setPositions(cleanPos);
        }
        if (typeof data.cash === "number") {
          setCash(data.cash);
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const handleExportPortfolio = () => {
    const data = {
      positions,
      cash,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `portfolio_backup_${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // 7. Calculations Engine (Memoized)
  const portfolioMetrics = useMemo(() => {
    const metrics: Record<string, MarketMetrics> = {};
    let totalCost = 0;
    let totalStockValue = 0;
    let dayGainSum = 0;
    let prevStockValueSum = 0;

    positions.forEach((pos) => {
      const sym = pos.symbol;
      const apiQuote = quotes[sym];
      const fallbackQuote = FALLBACK_QUOTES[sym];

      // Retrieve prices
      let currentPrice = pos.pricePaid; // Worst case fallback is cost price
      let previousClose = pos.pricePaid;
      let change = 0;
      let changePercent = 0;

      if (apiKey && apiQuote && typeof apiQuote.c === "number" && apiQuote.c !== 0) {
        currentPrice = apiQuote.c;
        previousClose = typeof apiQuote.pc === "number" ? apiQuote.pc : apiQuote.c - (apiQuote.d || 0);
        change = apiQuote.d || 0;
        changePercent = apiQuote.dp || 0;
      } else if (fallbackQuote) {
        currentPrice = fallbackQuote.c;
        previousClose = fallbackQuote.pc;
        change = fallbackQuote.d;
        changePercent = fallbackQuote.dp;
      }

      // Calculate position metrics
      const cost = pos.qty * pos.pricePaid;
      const value = pos.qty * currentPrice;
      const totalGain = value - cost;
      const totalGainPercent = cost > 0 ? (totalGain / cost) * 100 : 0;

      // Daily gain calculations
      const dayGain = (currentPrice - previousClose) * pos.qty;
      const dayGainPercent = previousClose > 0 ? ((currentPrice - previousClose) / previousClose) * 100 : 0;

      totalCost += cost;
      totalStockValue += value;
      dayGainSum += dayGain;
      prevStockValueSum += previousClose * pos.qty;

      metrics[sym] = {
        currentPrice,
        previousClose,
        change,
        changePercent,
        value,
        cost,
        dayGain,
        dayGainPercent,
        totalGain,
        totalGainPercent,
      };
    });

    const netAccountValue = totalStockValue + cash;
    const totalGainSum = netAccountValue - totalCost - cash; // (value - cost) sum
    const totalGainPercent = totalCost > 0 ? (totalGainSum / totalCost) * 100 : 0;
    
    // Portfolio wide day gain percentage
    const totalPrevValue = prevStockValueSum + cash;
    const dayGainPercentSum = totalPrevValue > 0 ? (dayGainSum / totalPrevValue) * 100 : 0;

    return {
      metrics,
      totalCost,
      netAccountValue,
      totalGain: totalGainSum,
      totalGainPercent,
      dayGain: dayGainSum,
      dayGainPercent: dayGainPercentSum,
    };
  }, [positions, quotes, cash, apiKey]);

  return (
    <div className="min-h-screen bg-slate-50/50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER SECTION */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8" id="app-header">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-blue-600 text-white rounded-xl">
                <Landmark className="w-6 h-6" />
              </span>
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Mi Portafolio Financiero
                </h1>
                <p className="text-sm text-slate-500 font-medium">
                  Monitoreo de inversiones y cálculo de retornos en tiempo real.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Status Indicator */}
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border ${
              apiKey ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-blue-50 text-blue-700 border-blue-100"
            }`}>
              {apiKey ? (
                <>
                  <Wifi className="w-3.5 h-3.5" />
                  Online
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5" />
                  Offline
                </>
              )}
            </span>

            {/* Last Refreshed label */}
            {lastRefreshed && (
              <span className="text-xs font-mono text-slate-400">
                Act.: {lastRefreshed.toLocaleTimeString()}
              </span>
            )}
            
            <button
              onClick={() => handleRefresh()}
              disabled={isRefreshing}
              className={`px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-sm shrink-0 cursor-pointer disabled:opacity-50`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              Refrescar Precios
            </button>
          </div>
        </header>

        {/* API STATUS ERROR TOAST */}
        {apiError && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-800 text-xs rounded-xl flex items-center justify-between shadow-sm">
            <span><strong>Información de API:</strong> {apiError}</span>
            <button onClick={() => setApiError(null)} className="text-rose-400 hover:text-rose-600 font-bold px-2">
              ✕
            </button>
          </div>
        )}

        {/* FINANCIAL SUMMARY CARDS */}
        <PortfolioSummary
          netAccountValue={portfolioMetrics.netAccountValue}
          totalCost={portfolioMetrics.totalCost}
          totalGain={portfolioMetrics.totalGain}
          totalGainPercent={portfolioMetrics.totalGainPercent}
          dayGain={portfolioMetrics.dayGain}
          dayGainPercent={portfolioMetrics.dayGainPercent}
          cash={cash}
          onUpdateCash={handleUpdateCash}
          isRealtime={!!apiKey}
          onRefresh={() => handleRefresh()}
          isRefreshing={isRefreshing}
          hasApiKey={!!apiKey}
        />

        {/* CHARTS CONTAINER */}
        <PortfolioCharts
          positions={positions}
          metrics={portfolioMetrics.metrics}
          cash={cash}
        />

        {/* ADD NEW ACTION FORM */}
        <AddPositionForm 
          onAddPosition={handleAddPosition} 
          apiKey={apiKey} 
        />

        {/* PORTFOLIO POSITION TABLE */}
        <div className="mb-8">
          <PortfolioTable
            positions={positions}
            metrics={portfolioMetrics.metrics}
            onRemovePosition={handleRemovePosition}
            onUpdatePosition={handleUpdatePosition}
            isRealtime={!!apiKey}
            isRefreshing={isRefreshing}
          />
        </div>

        {/* API KEY DETAILS & EXPORT/IMPORT PANEL */}
        <ApiKeyInstructions
          apiKey={apiKey}
          onSaveApiKey={handleSaveApiKey}
          onClearApiKey={handleClearApiKey}
          onImportPortfolio={handleImportPortfolio}
          onExportPortfolio={handleExportPortfolio}
        />

      </div>
    </div>
  );
}
