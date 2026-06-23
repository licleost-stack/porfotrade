import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { StockPosition, MarketMetrics } from "../types";

interface PortfolioChartsProps {
  positions: StockPosition[];
  metrics: Record<string, MarketMetrics>;
  cash: number;
}

const COLORS = [
  "#2563eb", "#3b82f6", "#60a5fa", "#93c5fd",
  "#059669", "#10b981", "#34d399", "#6ee7b7",
  "#d97706", "#f59e0b", "#fbbf24", "#fef08a",
  "#dc2626", "#ef4444", "#f87171", "#fca5a5",
  "#7c3aed", "#8b5cf6", "#a78bfa", "#c4b5fd",
  "#0891b2", "#06b6d4", "#22d3ee", "#67e8f9"
];

export default function PortfolioCharts({ positions, metrics, cash }: PortfolioChartsProps) {
  // 1. Prepare Pie Chart Data (Asset Allocation)
  const allocationData = positions.map((pos) => {
    const symbolMetrics = metrics[pos.symbol];
    const value = symbolMetrics ? symbolMetrics.value : pos.qty * pos.pricePaid;
    return {
      name: pos.symbol,
      value: Math.max(0, value),
    };
  });

  if (cash > 0) {
    allocationData.push({
      name: "EFECTIVO (CASH)",
      value: cash,
    });
  }

  // Filter out tiny values to keep pie clean
  const cleanAllocationData = allocationData.filter(d => d.value > 0);

  // Sort by value descending
  cleanAllocationData.sort((a, b) => b.value - a.value);

  // 2. Prepare Bar Chart Data (Cost vs Value)
  const barChartData = positions.map((pos) => {
    const symbolMetrics = metrics[pos.symbol];
    const cost = pos.qty * pos.pricePaid;
    const value = symbolMetrics ? symbolMetrics.value : cost;
    return {
      symbol: pos.symbol,
      Costo: parseFloat(cost.toFixed(2)),
      Valor: parseFloat(value.toFixed(2)),
    };
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(val);
  };

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const total = cleanAllocationData.reduce((sum, d) => sum + d.value, 0);
      const percent = total > 0 ? (data.value / total) * 100 : 0;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-lg border border-slate-800 shadow-xl text-xs font-mono">
          <p className="font-sans font-bold text-sm mb-1">{data.name}</p>
          <p>Valor: {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(data.value)}</p>
          <p>Distribución: {percent.toFixed(2)}%</p>
        </div>
      );
    }
    return null;
  };

  const CustomBarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const profit = data.Valor - data.Costo;
      const profitPercent = data.Costo > 0 ? (profit / data.Costo) * 100 : 0;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-lg border border-slate-800 shadow-xl text-xs font-mono">
          <p className="font-sans font-bold text-sm mb-1">{data.symbol}</p>
          <p className="text-blue-300">Costo: {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(data.Costo)}</p>
          <p className="text-emerald-300">Valor: {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(data.Valor)}</p>
          <p className={profit >= 0 ? "text-emerald-400" : "text-rose-400"}>
            Ganancia: {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(profit)} ({profitPercent.toFixed(2)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8" id="portfolio-charts-container">
      {/* Chart 1: Allocation */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h4 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
          Distribución de Activos (%)
        </h4>
        <div className="h-80 flex items-center justify-center">
          {cleanAllocationData.length === 0 ? (
            <div className="text-slate-400 text-sm font-sans">No hay activos para graficar</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={cleanAllocationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {cleanAllocationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
                <Legend 
                  layout="horizontal" 
                  verticalAlign="bottom" 
                  align="center"
                  wrapperStyle={{ fontSize: "11px", paddingTop: "15px", maxHeight: "80px", overflowY: "auto" }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Chart 2: Cost vs Value */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h4 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
          Costo vs Valor Actual ($)
        </h4>
        <div className="h-80 flex items-center justify-center">
          {barChartData.length === 0 ? (
            <div className="text-slate-400 text-sm font-sans">No hay activos para graficar</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barChartData}
                margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="symbol" 
                  tickLine={false}
                  axisLine={false}
                  style={{ fontSize: "11px", fontWeight: "600", fill: "#64748b" }}
                />
                <YAxis 
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatCurrency}
                  style={{ fontSize: "10px", fill: "#64748b" }}
                />
                <Tooltip content={<CustomBarTooltip />} cursor={{ fill: "#f8fafc" }} />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                <Bar dataKey="Costo" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Costo Total" />
                <Bar dataKey="Valor" fill="#10b981" radius={[4, 4, 0, 0]} name="Valor Actual" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
