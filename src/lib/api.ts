import { QuoteData, SearchResult } from "../types";

export async function fetchQuotes(
  symbols: string[], 
  apiKey: string, 
  force: boolean = false
): Promise<Record<string, QuoteData>> {
  if (symbols.length === 0 || !apiKey) {
    return {};
  }
  const cleanSymbols = symbols.map(s => s.trim().toUpperCase()).filter(s => s !== "MBRFY" && s !== "CASH");
  if (cleanSymbols.length === 0) {
    return {};
  }
  
  // Load cache from localStorage
  let cache: Record<string, { quote: QuoteData; timestamp: number }> = {};
  try {
    const cachedStr = localStorage.getItem("finnhub_quotes_cache");
    if (cachedStr) {
      cache = JSON.parse(cachedStr);
    }
  } catch (e) {
    console.error("Error reading quotes cache:", e);
  }

  const results: Record<string, QuoteData> = {};
  const now = Date.now();
  const CACHE_DURATION = 60000; // 1 minute cache
  const MIN_FORCE_INTERVAL = 10000; // Force-refresh minimum interval of 10 seconds per symbol to protect API key

  const symbolsToFetch: string[] = [];

  for (const symbol of cleanSymbols) {
    const cachedEntry = cache[symbol];
    const isFresh = cachedEntry && (now - cachedEntry.timestamp < CACHE_DURATION);
    const isTooFrequent = cachedEntry && (now - cachedEntry.timestamp < MIN_FORCE_INTERVAL);

    // If we have a fresh quote, or if we recently fetched it (within 10s) even if forcing
    if (cachedEntry && (isFresh || (force && isTooFrequent)) && !cachedEntry.quote.error) {
      results[symbol] = cachedEntry.quote;
    } else {
      symbolsToFetch.push(symbol);
    }
  }

  if (symbolsToFetch.length > 0) {
    // Fetch remaining symbols
    await Promise.all(
      symbolsToFetch.map(async (symbol) => {
        try {
          const response = await fetch(
            `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`
          );
          
          if (response.status === 429) {
            throw new Error("RATE_LIMIT");
          }
          
          if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
          }
          
          const data = await response.json();
          
          // Finnhub quote schema: { c: current, d: change, dp: percent, pc: prevClose }
          if (data && typeof data.c === "number" && data.c !== 0) {
            const quote: QuoteData = {
              c: data.c,
              d: data.d || 0,
              dp: data.dp || 0,
              h: data.h || 0,
              l: data.l || 0,
              o: data.o || 0,
              pc: data.pc || 0
            };
            results[symbol] = quote;
            cache[symbol] = { quote, timestamp: Date.now() };
          } else {
            throw new Error("No data or invalid symbol");
          }
        } catch (err: any) {
          console.error(`Error fetching quote for ${symbol} client-side:`, err.message);
          
          // Fallback to cache if available, even if expired
          const expiredCache = cache[symbol];
          if (expiredCache && !expiredCache.quote.error) {
            results[symbol] = expiredCache.quote;
            console.log(`Using expired cache fallback for ${symbol} due to: ${err.message}`);
          } else {
            results[symbol] = { 
              c: 0, 
              d: 0, 
              dp: 0, 
              h: 0, 
              l: 0, 
              o: 0, 
              pc: 0, 
              error: err.message === "RATE_LIMIT" ? "Límite excedido" : err.message 
            };
          }
        }
      })
    );

    // Save updated cache back to localStorage
    try {
      localStorage.setItem("finnhub_quotes_cache", JSON.stringify(cache));
    } catch (e) {
      console.error("Error saving quotes cache:", e);
    }
  }

  return results;
}

export async function searchSymbols(query: string, apiKey: string): Promise<SearchResult[]> {
  if (!query || query.trim().length < 2 || !apiKey) {
    return [];
  }
  const response = await fetch(
    `https://finnhub.io/api/v1/search?q=${encodeURIComponent(query)}&token=${apiKey}`
  );
  if (!response.ok) {
    throw new Error(`HTTP error ${response.status}`);
  }
  const data = await response.json();
  return data.result || [];
}
