import { useState } from "react";
import { Trash2, Edit2, Check, X, ArrowUpRight, ArrowDownRight, RefreshCw, Calendar, TrendingUp } from "lucide-react";
import { StockPosition, MarketMetrics } from "../types";

interface PortfolioTableProps {
  positions: StockPosition[];
  metrics: Record<string, MarketMetrics>;
  onRemovePosition: (id: string) => void;
  onUpdatePosition: (id: string, updatedFields: Partial<StockPosition>) => void;
  isRealtime: boolean;
  isRefreshing: boolean;
}

export default function PortfolioTable({
  positions,
  metrics,
  onRemovePosition,
  onUpdatePosition,
  isRealtime,
  isRefreshing
}: PortfolioTableProps) {
  // Inline editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQty, setEditQty] = useState("");
  const [editPricePaid, setEditPricePaid] = useState("");
  const [editDate, setEditDate] = useState("");

  const startEditing = (pos: StockPosition) => {
    setEditingId(pos.id);
    setEditQty(pos.qty.toString());
    setEditPricePaid(pos.pricePaid.toString());
    setEditDate(pos.dateAcquired);
  };

  const handleSave = (id: string) => {
    const q = parseFloat(editQty);
    const p = parseFloat(editPricePaid);

    if (isNaN(q) || q <= 0) {
      alert("La cantidad debe ser mayor a 0.");
      return;
    }
    if (isNaN(p) || p <= 0) {
      alert("El precio de compra debe ser mayor a 0.");
      return;
    }

    onUpdatePosition(id, {
      qty: q,
      pricePaid: p,
      dateAcquired: editDate
    });
    setEditingId(null);
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  const formatCurrency = (val: number | null) => {
    if (val === null || isNaN(val)) return "—";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    }).format(val);
  };

  const formatPercent = (val: number | null) => {
    if (val === null || isNaN(val)) return "—";
    return `${val >= 0 ? "+" : ""}${val.toFixed(2)}%`;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      // Return MM/DD/YYYY format matching spreadsheet
      return `${parts[1]}/${parts[2]}/${parts[0]}`;
    }
    return dateStr;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden" id="portfolio-table-card">
      <div className="px-6 py-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
        <div>
          <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            Posiciones Activas
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Gestiona tus tenencias de acciones y visualiza rendimiento diario y total.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
            isRealtime ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"
          }`}>
            <span className={`w-2 h-2 rounded-full ${isRealtime ? "bg-emerald-500 animate-pulse" : "bg-blue-400"}`} />
            {isRealtime ? "Precios Online Finnhub" : "Modo Histórico (Spreadsheet)"}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/20 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <th className="py-4 px-6">Símbolo</th>
              <th className="py-4 px-3 text-right">Cant. (Qty)</th>
              <th className="py-4 px-3 text-right">Precio Pago</th>
              <th className="py-4 px-3 text-right">Último Precio</th>
              <th className="py-4 px-3 text-right">Costo Total</th>
              <th className="py-4 px-3 text-right">Valor Actual</th>
              <th className="py-4 px-4 text-center bg-slate-50/40 font-bold text-slate-500">Ganancia Día</th>
              <th className="py-4 px-4 text-center bg-emerald-50/20 font-bold text-emerald-800">Ganancia Total</th>
              <th className="py-4 px-4 text-center">Adquirido</th>
              <th className="py-4 px-6 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {positions.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-8 text-center text-slate-400 text-sm">
                  No hay posiciones en tu portafolio. Agrega algunas acciones arriba para comenzar.
                </td>
              </tr>
            ) : (
              positions.map((pos) => {
                const metric = metrics[pos.symbol];
                const isEditing = editingId === pos.id;

                const currentPrice = metric ? metric.currentPrice : null;
                const cost = pos.qty * pos.pricePaid;
                const value = metric ? metric.value : cost;
                
                const dayGain = metric ? metric.dayGain : 0;
                const dayGainPercent = metric ? metric.dayGainPercent : 0;
                const totalGain = metric ? metric.totalGain : 0;
                const totalGainPercent = metric ? metric.totalGainPercent : 0;

                const isDayPositive = dayGain >= 0;
                const isTotalPositive = totalGain >= 0;

                return (
                  <tr key={pos.id} className="hover:bg-slate-50/40 transition-colors group">
                    {/* SYMBOL */}
                    <td className="py-4 px-6 font-mono font-bold text-slate-800 text-sm">
                      <div className="flex items-center gap-1.5">
                        <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-xs tracking-wider">
                          {pos.symbol}
                        </span>
                      </div>
                    </td>

                    {/* QUANTITY */}
                    <td className="py-4 px-3 text-right font-semibold text-slate-700 text-sm font-mono">
                      {isEditing ? (
                        <input
                          type="number"
                          step="any"
                          value={editQty}
                          onChange={(e) => setEditQty(e.target.value)}
                          className="w-20 bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-right font-mono text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      ) : (
                        pos.qty.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 4 })
                      )}
                    </td>

                    {/* PRICE PAID */}
                    <td className="py-4 px-3 text-right text-slate-600 text-sm font-mono">
                      {isEditing ? (
                        <input
                          type="number"
                          step="any"
                          value={editPricePaid}
                          onChange={(e) => setEditPricePaid(e.target.value)}
                          className="w-24 bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-right font-mono text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      ) : (
                        formatCurrency(pos.pricePaid)
                      )}
                    </td>

                    {/* LAST PRICE */}
                    <td className="py-4 px-3 text-right text-slate-800 font-bold text-sm font-mono">
                      {isRefreshing && currentPrice === null ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin inline text-slate-400" />
                      ) : (
                        formatCurrency(currentPrice)
                      )}
                    </td>

                    {/* TOTAL COST */}
                    <td className="py-4 px-3 text-right text-slate-500 text-sm font-mono">
                      {formatCurrency(cost)}
                    </td>

                    {/* CURRENT VALUE */}
                    <td className="py-4 px-3 text-right text-slate-900 font-semibold text-sm font-mono">
                      {formatCurrency(value)}
                    </td>

                    {/* DAILY GAIN */}
                    <td className={`py-4 px-4 text-center bg-slate-50/40 font-mono text-xs font-semibold ${
                      isDayPositive ? "text-emerald-600" : "text-rose-600"
                    }`}>
                      <div className="flex flex-col items-center">
                        <span className="flex items-center gap-0.5 font-bold">
                          {isDayPositive ? <ArrowUpRight className="w-3.5 h-3.5 shrink-0" /> : <ArrowDownRight className="w-3.5 h-3.5 shrink-0" />}
                          {formatCurrency(dayGain)}
                        </span>
                        <span className="text-[10px] opacity-80 mt-0.5">
                          {formatPercent(dayGainPercent)}
                        </span>
                      </div>
                    </td>

                    {/* TOTAL GAIN */}
                    <td className={`py-4 px-4 text-center bg-emerald-50/10 font-mono text-xs font-bold ${
                      isTotalPositive ? "text-emerald-600 bg-emerald-50/20" : "text-rose-600 bg-rose-50/20"
                    }`}>
                      <div className="flex flex-col items-center">
                        <span className="flex items-center gap-0.5">
                          {isTotalPositive ? "+" : ""}
                          {formatCurrency(totalGain)}
                        </span>
                        <span className="text-[10px] opacity-80 mt-0.5">
                          {formatPercent(totalGainPercent)}
                        </span>
                      </div>
                    </td>

                    {/* DATE ACQUIRED */}
                    <td className="py-4 px-4 text-center text-slate-500 text-xs font-mono">
                      {isEditing ? (
                        <input
                          type="date"
                          value={editDate}
                          onChange={(e) => setEditDate(e.target.value)}
                          className="w-28 bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      ) : (
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {formatDate(pos.dateAcquired)}
                        </span>
                      )}
                    </td>

                    {/* ACTIONS */}
                    <td className="py-4 px-6 text-right text-sm">
                      <div className="flex justify-end gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => handleSave(pos.id)}
                              className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"
                              title="Guardar"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={handleCancel}
                              className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors"
                              title="Cancelar"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEditing(pos)}
                              className="p-1.5 bg-slate-50 text-slate-600 hover:bg-slate-200 hover:text-slate-800 rounded-lg transition-colors"
                              title="Editar posición"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`¿Estás seguro de eliminar ${pos.symbol} de tu portafolio?`)) {
                                  onRemovePosition(pos.id);
                                }
                              }}
                              className="p-1.5 bg-slate-50 text-rose-500 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
