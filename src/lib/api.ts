import { QuoteData, SearchResult } from "../types";

export async function fetchQuotes(symbols: string[], apiKey: string): Promise<Record<string, QuoteData>> {
  if (symbols.length === 0 || !apiKey) {
    return {};
  }
  const cleanSymbols = symbols.map(s => s.trim().toUpperCase()).filter(s => s !== "MBRFY" && s !== "CASH");
  if (cleanSymbols.length === 0) {
    return {};
  }
  
  const results: Record<string, QuoteData> = {};
  
  // Fetch each symbol directly from Finnhub client-side
  await Promise.all(
    cleanSymbols.map(async (symbol) => {
      try {
        const response = await fetch(
          `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        const data = await response.json();
        
        // Finnhub quote schema: { c: current, d: change, dp: percent, pc: prevClose }
        if (data && typeof data.c === "number" && data.c !== 0) {
          results[symbol] = {
            c: data.c,
            d: data.d || 0,
            dp: data.dp || 0,
            h: data.h || 0,
            l: data.l || 0,
            o: data.o || 0,
            pc: data.pc || 0
          };
        } else {
          results[symbol] = { c: 0, d: 0, dp: 0, h: 0, l: 0, o: 0, pc: 0, error: "No data" };
        }
      } catch (err: any) {
        console.error(`Error fetching quote for ${symbol} client-side:`, err.message);
        results[symbol] = { c: 0, d: 0, dp: 0, h: 0, l: 0, o: 0, pc: 0, error: err.message };
      }
    })
  );

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
