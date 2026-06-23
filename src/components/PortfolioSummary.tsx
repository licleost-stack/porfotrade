import { useState } from "react";
import { DollarSign, TrendingUp, TrendingDown, Wallet, Edit2, Check, X, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface PortfolioSummaryProps {
  netAccountValue: number;
  totalCost: number;
  totalGain: number;
  totalGainPercent: number;
  dayGain: number;
  dayGainPercent: number;
  cash: number;
  onUpdateCash: (newCash: number) => void;
  isRealtime: boolean;
  onRefresh: () => void;
  isRefreshing: boolean;
  hasApiKey: boolean;
}

export default function PortfolioSummary({
  netAccountValue,
  totalCost,
  totalGain,
  totalGainPercent,
  dayGain,
  dayGainPercent,
  cash,
  onUpdateCash,
  isRealtime,
  onRefresh,
  isRefreshing,
  hasApiKey
}: PortfolioSummaryProps) {
  const [isEditingCash, setIsEditingCash] = useState(false);
  const [cashInput, setCashInput] = useState(cash.toString());

  const handleSaveCash = () => {
    const val = parseFloat(cashInput);
    if (!isNaN(val) && val >= 0) {
      onUpdateCash(val);
      setIsEditingCash(false);
    }
  };

  const handleCancelCash = () => {
    setCashInput(cash.toString());
    setIsEditingCash(false);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val);
  };

  const formatPercent = (val: number) => {
    return `${val >= 0 ? "+" : ""}${val.toFixed(2)}%`;
  };

  const isDayGainPositive = dayGain >= 0;
  const isTotalGainPositive = totalGain >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" id="portfolio-summary-cards">
      {/* CARD 1: Net Account Value */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm relative overflow-hidden transition-all duration-200 hover:shadow-md">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-slate-500">Valor Neto de Cuenta</p>
            <h3 className="text-3xl font-bold text-slate-900 tracking-tight mt-1 font-sans">
              {formatCurrency(netAccountValue)}
            </h3>
            <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
              Costo Total: {formatCurrency(totalCost)}
            </p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-500" />
      </div>

      {/* CARD 2: Day's Gain */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm relative overflow-hidden transition-all duration-200 hover:shadow-md">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-slate-500">Ganancia del Día</p>
            <h3 className={`text-3xl font-bold tracking-tight mt-1 font-sans flex items-baseline gap-1 ${
              isDayGainPositive ? "text-emerald-600" : "text-rose-600"
            }`}>
              {formatCurrency(dayGain)}
            </h3>
            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full mt-2 ${
              isDayGainPositive 
                ? "bg-emerald-50 text-emerald-700" 
                : "bg-rose-50 text-rose-700"
            }`}>
              {isDayGainPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              {formatPercent(dayGainPercent)}
            </span>
          </div>
          <div className={`p-3 rounded-xl ${
            isDayGainPositive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
          }`}>
            {isDayGainPositive ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
          </div>
        </div>
        <div className={`absolute bottom-0 left-0 w-full h-1 ${
          isDayGainPositive ? "bg-emerald-500" : "bg-rose-500"
        }`} />
      </div>

      {/* CARD 3: Total Gain */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm relative overflow-hidden transition-all duration-200 hover:shadow-md">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-slate-500">Ganancia Total</p>
            <h3 className={`text-3xl font-bold tracking-tight mt-1 font-sans flex items-baseline gap-1 ${
              isTotalGainPositive ? "text-emerald-600" : "text-rose-600"
            }`}>
              {formatCurrency(totalGain)}
            </h3>
            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full mt-2 ${
              isTotalGainPositive 
                ? "bg-emerald-50 text-emerald-700" 
                : "bg-rose-50 text-rose-700"
            }`}>
              {isTotalGainPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              {formatPercent(totalGainPercent)}
            </span>
          </div>
          <div className={`p-3 rounded-xl ${
            isTotalGainPositive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
          }`}>
            {isTotalGainPositive ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
          </div>
        </div>
        <div className={`absolute bottom-0 left-0 w-full h-1 ${
          isTotalGainPositive ? "bg-emerald-500" : "bg-rose-500"
        }`} />
      </div>

      {/* CARD 4: Cash & Purchasing Power */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm relative overflow-hidden transition-all duration-200 hover:shadow-md">
        <div className="flex justify-between items-start">
          <div className="w-full mr-2">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-slate-500">Efectivo Disponible</p>
              {!isEditingCash && (
                <button 
                  onClick={() => setIsEditingCash(true)} 
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                  title="Editar efectivo"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            
            {isEditingCash ? (
              <div className="flex items-center gap-2 mt-2 w-full">
                <span className="text-slate-500 text-lg font-bold">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={cashInput}
                  onChange={(e) => setCashInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <button 
                  onClick={handleSaveCash}
                  className="p-1 bg-emerald-50 text-emerald-600 rounded-md hover:bg-emerald-100 transition-colors"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button 
                  onClick={handleCancelCash}
                  className="p-1 bg-rose-50 text-rose-600 rounded-md hover:bg-rose-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-3xl font-bold text-slate-900 tracking-tight mt-1 font-sans">
                  {formatCurrency(cash)}
                </h3>
                <p className="text-xs text-slate-400 mt-2">
                  Poder de Compra: {formatCurrency(cash)}
                </p>
              </>
            )}
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl shrink-0">
            <Wallet className="w-6 h-6" />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-amber-500" />
      </div>
    </div>
  );
}
