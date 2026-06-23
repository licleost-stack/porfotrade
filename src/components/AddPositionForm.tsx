import React, { useState, useEffect, useRef } from "react";
import { Plus, Search, Calendar, DollarSign, Calculator, HelpCircle } from "lucide-react";
import { searchSymbols } from "../lib/api";
import { SearchResult } from "../types";

interface AddPositionFormProps {
  onAddPosition: (position: {
    symbol: string;
    qty: number;
    pricePaid: number;
    dateAcquired: string;
  }) => void;
  apiKey: string;
}

export default function AddPositionForm({ onAddPosition, apiKey }: AddPositionFormProps) {
  const [symbol, setSymbol] = useState("");
  const [qty, setQty] = useState("");
  const [pricePaid, setPricePaid] = useState("");
  const [dateAcquired, setDateAcquired] = useState(new Date().toISOString().split("T")[0]);
  
  // Search dropdown states
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Symbol search with debounce
  useEffect(() => {
    if (!apiKey || symbol.trim().length < 1) {
      setSearchResults([]);
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await searchSymbols(symbol, apiKey);
        // Exclude problematic MBRFY and non-stock instruments if possible, keeping it clean
        const filteredResults = results
          .filter(r => r.symbol !== "MBRFY" && !r.symbol.includes("."))
          .slice(0, 5);
        setSearchResults(filteredResults);
        setShowDropdown(filteredResults.length > 0);
      } catch (err) {
        console.error("Failed to search symbols:", err);
      } finally {
        setIsSearching(false);
      }
    }, 400); // 400ms debounce

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [symbol, apiKey]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSymbol = symbol.trim().toUpperCase();
    const parsedQty = parseFloat(qty);
    const parsedPrice = parseFloat(pricePaid);

    if (!cleanSymbol || cleanSymbol === "MBRFY") {
      alert("Símbolo inválido o problemático.");
      return;
    }
    if (isNaN(parsedQty) || parsedQty <= 0) {
      alert("Por favor, ingresa una cantidad válida mayor a 0.");
      return;
    }
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      alert("Por favor, ingresa un precio de compra válido mayor a 0.");
      return;
    }
    if (!dateAcquired) {
      alert("Por favor, selecciona la fecha de adquisición.");
      return;
    }

    onAddPosition({
      symbol: cleanSymbol,
      qty: parsedQty,
      pricePaid: parsedPrice,
      dateAcquired,
    });

    // Reset form
    setSymbol("");
    setQty("");
    setPricePaid("");
    setDateAcquired(new Date().toISOString().split("T")[0]);
    setShowDropdown(false);
  };

  const selectSearchResult = (item: SearchResult) => {
    setSymbol(item.symbol);
    setShowDropdown(false);
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm mb-8" id="add-position-card">
      <h4 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
        <Plus className="w-5 h-5 text-blue-500" />
        Agregar Nueva Posición
      </h4>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        {/* SYMBOL / TICKER */}
        <div className="relative" ref={dropdownRef}>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Símbolo / Ticker
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder="Ej. AAPL, MSFT, SPY"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all uppercase"
              required
            />
          </div>

          {/* Autocomplete dropdown */}
          {showDropdown && (
            <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-100 rounded-xl shadow-lg z-20 max-h-60 overflow-y-auto">
              {searchResults.map((item) => (
                <button
                  key={item.symbol}
                  type="button"
                  onClick={() => selectSearchResult(item)}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-50 transition-colors flex justify-between items-center border-b border-slate-50 last:border-0"
                >
                  <div>
                    <span className="font-mono font-bold text-slate-800 text-xs bg-slate-100 px-1.5 py-0.5 rounded mr-2">
                      {item.symbol}
                    </span>
                    <span className="text-xs text-slate-500 truncate inline-block max-w-[150px]">
                      {item.description}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium font-sans px-1.5 py-0.5 bg-slate-50 rounded">
                    {item.type}
                  </span>
                </button>
              ))}
            </div>
          )}
          {isSearching && (
            <div className="absolute right-3 top-8 text-xs text-slate-400">
              Buscando...
            </div>
          )}
        </div>

        {/* QUANTITY */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Cantidad
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-slate-400">
              <Calculator className="w-4 h-4" />
            </span>
            <input
              type="number"
              step="any"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              placeholder="Ej. 10.0"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              required
            />
          </div>
        </div>

        {/* PRICE PAID */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Precio de Compra
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-slate-400">
              <DollarSign className="w-4 h-4" />
            </span>
            <input
              type="number"
              step="any"
              value={pricePaid}
              onChange={(e) => setPricePaid(e.target.value)}
              placeholder="Ej. 150.25"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              required
            />
          </div>
        </div>

        {/* DATE ACQUIRED */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Fecha de Adquisición
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-slate-400">
              <Calendar className="w-4 h-4" />
            </span>
            <input
              type="date"
              value={dateAcquired}
              onChange={(e) => setDateAcquired(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              required
            />
          </div>
        </div>

        {/* BUTTON */}
        <div className="md:col-span-4 mt-2 flex justify-end">
          <button
            type="submit"
            className="w-full md:w-auto px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl text-sm shadow-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Agregar a Portafolio
          </button>
        </div>
      </form>
    </div>
  );
}
