import React, { useState } from 'react';
import { AgentTarget } from '../types';
import { formatCurrencyRM } from '../services/firestoreService';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts';
import { BarChart3, TrendingUp, Target, Activity } from 'lucide-react';

interface PerformanceChartsProps {
  target: AgentTarget | null;
}

export const PerformanceCharts: React.FC<PerformanceChartsProps> = ({ target }) => {
  const [chartMode, setChartMode] = useState<'monthly' | 'cumulative' | 'cases' | 'activity'>('monthly');
  const breakdown = target?.monthlyBreakdown || [];

  // Prepare monthly data
  let cumTargetAce = 0;
  let cumActualAce = 0;

  const chartData = breakdown.map((item) => {
    cumTargetAce += Number(item.targetAce) || 0;
    cumActualAce += Number(item.actualAce) || 0;

    return {
      name: item.monthName,
      month: item.month,
      targetAce: Number(item.targetAce) || 0,
      actualAce: Number(item.actualAce) || 0,
      cumTargetAce,
      cumActualAce,
      targetCases: Number(item.targetCases) || 0,
      actualCases: Number(item.actualCases) || 0,
      leads: Number(item.leadsContacted) || 0,
      presentations: Number(item.presentations) || 0,
      acs: item.actualCases > 0 ? Math.round(item.actualAce / item.actualCases) : 0,
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-xl text-xs space-y-1">
          <p className="font-bold text-slate-200 border-b border-slate-800 pb-1">{label}</p>
          {payload.map((entry: any, index: number) => {
            const isCurrency = entry.name.toLowerCase().includes('ace') || entry.name.toLowerCase().includes('acs');
            return (
              <p key={`item-${index}`} className="flex items-center justify-between gap-4" style={{ color: entry.color }}>
                <span>{entry.name}:</span>
                <span className="font-bold">
                  {isCurrency ? formatCurrencyRM(entry.value) : `${entry.value} ${entry.name.includes('Cases') || entry.name.includes('Kes') ? 'kes' : ''}`}
                </span>
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-6">
      {/* Header & Chart Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            <span>Analisis Prestasi & Visualisasi Sasaran</span>
          </h3>
          <p className="text-xs text-slate-400">
            Pantau trend bulanan, trajektori kumulatif tahunan, dan produktiviti kes secara visual.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 overflow-x-auto">
          <button
            onClick={() => setChartMode('monthly')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              chartMode === 'monthly'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ACE Bulanan
          </button>
          <button
            onClick={() => setChartMode('cumulative')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              chartMode === 'cumulative'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Trajektori Kumulatif
          </button>
          <button
            onClick={() => setChartMode('cases')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              chartMode === 'cases'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Bilangan Kes
          </button>
          <button
            onClick={() => setChartMode('activity')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              chartMode === 'activity'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Corong Aktiviti
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-80 sm:h-96 w-full">
        {chartMode === 'monthly' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickFormatter={(val) => `RM${val >= 1000 ? `${Math.round(val / 1000)}k` : val}`}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="targetAce" name="Sasaran ACE" fill="#475569" radius={[4, 4, 0, 0]} />
              <Bar dataKey="actualAce" name="Sebenar ACE" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}

        {chartMode === 'cumulative' && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 20, right: 20, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickFormatter={(val) => `RM${val >= 1000 ? `${Math.round(val / 1000)}k` : val}`}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Area
                type="monotone"
                dataKey="cumTargetAce"
                name="Sasaran Kumulatif"
                stroke="#6366f1"
                strokeWidth={2}
                strokeDasharray="4 4"
                fillOpacity={1}
                fill="url(#colorTarget)"
              />
              <Area
                type="monotone"
                dataKey="cumActualAce"
                name="Pencapaian Kumulatif"
                stroke="#10b981"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorActual)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {chartMode === 'cases' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="targetCases" name="Sasaran Kes" fill="#475569" radius={[4, 4, 0, 0]} />
              <Bar dataKey="actualCases" name="Sebenar Kes" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}

        {chartMode === 'activity' && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Line type="monotone" dataKey="leads" name="Leads Dihubungi" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="presentations" name="Presentasi Selesai" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="actualCases" name="Kes Ditutup" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
