import React from 'react';
import { AgentTarget } from '../types';
import { formatCurrencyRM, formatNumber } from '../services/firestoreService';
import {
  TrendingUp,
  FileCheck2,
  DollarSign,
  Gauge,
  AlertCircle,
  CheckCircle,
  ArrowUpRight,
  Flame,
  Award
} from 'lucide-react';

interface DashboardOverviewProps {
  target: AgentTarget | null;
  selectedYear: number;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ target, selectedYear }) => {
  // Aggregate actuals from monthly breakdown
  const monthlyList = target?.monthlyBreakdown || [];
  const totalActualAce = monthlyList.reduce((acc, m) => acc + (Number(m.actualAce) || 0), 0);
  const totalTargetAce = Number(target?.overallTargetAce) || 0;

  const totalActualCases = monthlyList.reduce((acc, m) => acc + (Number(m.actualCases) || 0), 0);
  const totalTargetCases = Number(target?.overallTargetCases) || 0;

  const totalLeads = monthlyList.reduce((acc, m) => acc + (Number(m.leadsContacted) || 0), 0);
  const totalPresentations = monthlyList.reduce((acc, m) => acc + (Number(m.presentations) || 0), 0);

  const percentAce = totalTargetAce > 0 ? Math.round((totalActualAce / totalTargetAce) * 100) : 0;
  const percentCases = totalTargetCases > 0 ? Math.round((totalActualCases / totalTargetCases) * 100) : 0;

  const actualAcs = totalActualCases > 0 ? Math.round(totalActualAce / totalActualCases) : 0;
  const targetAcs = Number(target?.overallTargetAcs) || (totalTargetCases > 0 ? Math.round(totalTargetAce / totalTargetCases) : 0);

  // Current month calculation for Pace (1-12)
  const currentMonthIdx = new Date().getFullYear() === selectedYear ? new Date().getMonth() + 1 : 12;
  const expectedPaceAce = (totalTargetAce / 12) * currentMonthIdx;
  const paceVariance = totalActualAce - expectedPaceAce;
  const remainingMonths = Math.max(1, 12 - currentMonthIdx + 1);
  const remainingAceNeeded = Math.max(0, totalTargetAce - totalActualAce);
  const requiredRunRatePerMonth = Math.round(remainingAceNeeded / remainingMonths);

  let paceStatus = {
    label: 'Di Landasan Tepat (On Track)',
    color: 'text-emerald-400',
    bg: 'bg-emerald-950/60 border-emerald-800',
    icon: CheckCircle
  };

  if (percentAce >= 100) {
    paceStatus = {
      label: 'Sasaran Tercapai! (Goal Achieved)',
      color: 'text-purple-400',
      bg: 'bg-purple-950/60 border-purple-800',
      icon: Award
    };
  } else if (paceVariance >= 5000) {
    paceStatus = {
      label: 'Mendahului Sasaran (Ahead of Pace)',
      color: 'text-teal-400',
      bg: 'bg-teal-950/60 border-teal-800',
      icon: TrendingUp
    };
  } else if (paceVariance < -15000) {
    paceStatus = {
      label: 'Perlu Pecutan Pantas (Needs Sprint)',
      color: 'text-rose-400',
      bg: 'bg-rose-950/60 border-rose-800',
      icon: AlertCircle
    };
  } else if (paceVariance < 0) {
    paceStatus = {
      label: 'Sedikit Ketinggalan (Slightly Behind)',
      color: 'text-amber-400',
      bg: 'bg-amber-950/60 border-amber-800',
      icon: Gauge
    };
  }

  return (
    <div className="space-y-4">
      {/* Pace Banner */}
      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md ${paceStatus.bg}`}>
        <div className="flex items-center gap-3">
          <paceStatus.icon className={`w-6 h-6 ${paceStatus.color} shrink-0`} />
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-sm sm:text-base font-bold ${paceStatus.color}`}>
                {paceStatus.label}
              </span>
              <span className="text-xs text-slate-400">
                (Bulan {currentMonthIdx}/12)
              </span>
            </div>
            <p className="text-xs text-slate-300">
              {paceVariance >= 0
                ? `Lebihan ${formatCurrencyRM(paceVariance)} berbanding unjuran semasa YTD.`
                : `Kurang ${formatCurrencyRM(Math.abs(paceVariance))} daripada unjuran YTD (${formatCurrencyRM(expectedPaceAce)}).`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-2 rounded-lg border border-slate-700/60 self-start sm:self-auto">
          <Flame className="w-4 h-4 text-amber-400" />
          <div className="text-right sm:text-left">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
              Pecutan Bulanan Diperlukan
            </div>
            <div className="text-sm font-bold text-amber-300">
              {remainingAceNeeded === 0 ? 'RM 0 (Capai!)' : `${formatCurrencyRM(requiredRunRatePerMonth)} / bln`}
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Key Performance Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: ACE Production */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 shadow-lg backdrop-blur-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Jumlah Pencapaian ACE
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-950 text-emerald-400 flex items-center justify-center border border-emerald-800/60">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-extrabold text-white tracking-tight">
              {formatCurrencyRM(totalActualAce)}
            </div>
            <div className="text-xs text-slate-400 mt-0.5 flex items-center justify-between">
              <span>Sasaran: {formatCurrencyRM(totalTargetAce)}</span>
              <span className="font-bold text-emerald-400">{percentAce}%</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-700/70 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                percentAce >= 100
                  ? 'bg-gradient-to-r from-purple-500 to-emerald-400'
                  : percentAce >= 75
                  ? 'bg-emerald-500'
                  : percentAce >= 50
                  ? 'bg-teal-500'
                  : 'bg-amber-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, percentAce))}%` }}
            />
          </div>
        </div>

        {/* KPI 2: Total Cases Closed */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 shadow-lg backdrop-blur-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Jumlah Kes Ditutup
            </span>
            <div className="w-8 h-8 rounded-lg bg-teal-950 text-teal-400 flex items-center justify-center border border-teal-800/60">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-extrabold text-white tracking-tight">
              {formatNumber(totalActualCases)}{' '}
              <span className="text-sm font-normal text-slate-400">kes</span>
            </div>
            <div className="text-xs text-slate-400 mt-0.5 flex items-center justify-between">
              <span>Sasaran: {totalTargetCases} kes</span>
              <span className="font-bold text-teal-400">{percentCases}%</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-700/70 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-teal-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, percentCases))}%` }}
            />
          </div>
        </div>

        {/* KPI 3: Average Case Size (ACS) */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 shadow-lg backdrop-blur-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Purata Saiz Kes (ACS)
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-950 text-indigo-400 flex items-center justify-center border border-indigo-800/60">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-extrabold text-white tracking-tight">
              {formatCurrencyRM(actualAcs)}
            </div>
            <div className="text-xs text-slate-400 mt-0.5 flex items-center justify-between">
              <span>Sasaran ACS: {formatCurrencyRM(targetAcs)}</span>
              <span className={`font-semibold ${actualAcs >= targetAcs ? 'text-indigo-400' : 'text-slate-400'}`}>
                {totalActualCases > 0 ? (actualAcs >= targetAcs ? 'Di atas sasaran' : 'Bawah sasaran') : '0 kes'}
              </span>
            </div>
          </div>

          <div className="mt-3 text-[11px] text-slate-400 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5 text-indigo-400" />
            <span>Formula: Jumlah ACE ÷ Bilangan Kes</span>
          </div>
        </div>

        {/* KPI 4: Leads & Presentation Activity */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 shadow-lg backdrop-blur-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Aktiviti Prospek (YTD)
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-950 text-amber-400 flex items-center justify-center border border-amber-800/60">
              <Gauge className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-white">
                {formatNumber(totalPresentations)}
              </span>
              <span className="text-xs text-slate-400">Presentation</span>
            </div>
            <div className="text-xs text-slate-400 mt-0.5 flex items-center justify-between">
              <span>{formatNumber(totalLeads)} Kontak Dihubungi</span>
              <span className="text-amber-400 font-semibold">
                {totalPresentations > 0 && totalActualCases > 0
                  ? `${Math.round((totalActualCases / totalPresentations) * 100)}% Close`
                  : '0%'}
              </span>
            </div>
          </div>

          <div className="mt-3 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Closing Ratio: {target?.closingRatio || 25}%</span>
            <span className="text-emerald-400 font-medium">10-3-1 Benchmark</span>
          </div>
        </div>
      </div>
    </div>
  );
};
