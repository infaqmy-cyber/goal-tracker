import React, { useState } from 'react';
import { AgentTarget } from '../types';
import { formatCurrencyRM, formatNumber } from '../services/firestoreService';
import {
  Calculator,
  Flame,
  CheckCircle2,
  Calendar,
  PhoneCall,
  UserCheck,
  Award,
  ArrowRight,
  Sparkles,
  RotateCcw
} from 'lucide-react';

interface ActivityCalculatorProps {
  target: AgentTarget | null;
}

export const ActivityCalculator: React.FC<ActivityCalculatorProps> = ({ target }) => {
  const defaultAce = target?.overallTargetAce || 150000;
  const defaultAcs = target?.overallTargetAcs || 3000;

  const [aceGoal, setAceGoal] = useState<number>(defaultAce);
  const [caseSize, setCaseSize] = useState<number>(defaultAcs || 3000);
  const [workingWeeks, setWorkingWeeks] = useState<number>(48); // 48 active working weeks / yr
  const [workingDaysPerWeek, setWorkingDaysPerWeek] = useState<number>(5);
  
  // Conversion Funnel Ratios:
  // E.g. Standard Takaful 10:3:1 -> 10 Calls -> 3 Appointments -> 1 Closed Case
  const [callsToAppointmentRatio, setCallsToAppointmentRatio] = useState<number>(3); // 3 calls per appointment (approx 33%)
  const [presentationsToCaseRatio, setPresentationsToCaseRatio] = useState<number>(3); // 3 presentations per 1 case closed

  // Calculations
  const calculatedCasesNeeded = caseSize > 0 ? Math.ceil(aceGoal / caseSize) : 0;
  const totalPresentationsNeeded = calculatedCasesNeeded * presentationsToCaseRatio;
  const totalAppointmentsNeeded = totalPresentationsNeeded; // assuming 1 appt = 1 pres
  const totalCallsLeadsNeeded = totalAppointmentsNeeded * callsToAppointmentRatio;

  // Monthly breakdown
  const monthlyAce = Math.round(aceGoal / 12);
  const monthlyCases = (calculatedCasesNeeded / 12).toFixed(1);
  const monthlyPresentations = Math.ceil(totalPresentationsNeeded / 12);
  const monthlyCalls = Math.ceil(totalCallsLeadsNeeded / 12);

  // Weekly breakdown
  const weeklyCases = (calculatedCasesNeeded / workingWeeks).toFixed(1);
  const weeklyPresentations = Math.ceil(totalPresentationsNeeded / workingWeeks);
  const weeklyCalls = Math.ceil(totalCallsLeadsNeeded / workingWeeks);

  // Daily breakdown
  const totalWorkingDays = workingWeeks * workingDaysPerWeek;
  const dailyPresentations = (totalPresentationsNeeded / totalWorkingDays).toFixed(1);
  const dailyCalls = Math.ceil(totalCallsLeadsNeeded / totalWorkingDays);

  const setPreset = (ace: number, acs: number) => {
    setAceGoal(ace);
    setCaseSize(acs);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Calculator className="w-5 h-5 text-emerald-400" />
          <span>Kalkulator Aktiviti & Formula Tindakan Harian (10-3-1)</span>
        </h3>
        <p className="text-xs text-slate-400">
          Ketahui jumlah panggilan, temu janji, dan pembentangan (presentation) yang perlu anda lakukan setiap hari bagi mencapai sasaran ACE anda.
        </p>
      </div>

      {/* Preset Quick Selectors */}
      <div>
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
          Pilihan Pantas Sasaran:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            onClick={() => setPreset(100000, 3000)}
            className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all ${
              aceGoal === 100000
                ? 'bg-emerald-950 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500'
                : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="font-bold text-white">Silver RM100k</div>
            <div className="text-[10px] text-slate-400">ACS RM3,000 (34 kes)</div>
          </button>

          <button
            onClick={() => setPreset(150000, 3000)}
            className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all ${
              aceGoal === 150000
                ? 'bg-emerald-950 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500'
                : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="font-bold text-white">Gold RM150k</div>
            <div className="text-[10px] text-slate-400">ACS RM3,000 (50 kes)</div>
          </button>

          <button
            onClick={() => setPreset(300000, 3600)}
            className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all ${
              aceGoal === 300000
                ? 'bg-purple-950 border-purple-500 text-purple-300 ring-1 ring-purple-500'
                : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="font-bold text-white">MDRT RM300k</div>
            <div className="text-[10px] text-slate-400">ACS RM3,600 (84 kes)</div>
          </button>

          <button
            onClick={() => setPreset(900000, 5000)}
            className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all ${
              aceGoal === 900000
                ? 'bg-rose-950 border-rose-500 text-rose-300 ring-1 ring-rose-500'
                : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="font-bold text-white">COT RM900k</div>
            <div className="text-[10px] text-slate-400">ACS RM5,000 (180 kes)</div>
          </button>
        </div>
      </div>

      {/* Input Parameters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Sasaran ACE Tahunan (RM)
          </label>
          <input
            type="number"
            step="10000"
            value={aceGoal}
            onChange={(e) => setAceGoal(Number(e.target.value) || 0)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Purata Saiz Kes (ACS) (RM)
          </label>
          <input
            type="number"
            step="500"
            value={caseSize}
            onChange={(e) => setCaseSize(Number(e.target.value) || 0)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Nisbah Closing (Berapa Presentation utk 1 Kes)
          </label>
          <select
            value={presentationsToCaseRatio}
            onChange={(e) => setPresentationsToCaseRatio(Number(e.target.value))}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-semibold text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option value={2}>1 daripada 2 Presentation (50% - Master Closer)</option>
            <option value={3}>1 daripada 3 Presentation (33% - Standard Pro)</option>
            <option value={4}>1 daripada 4 Presentation (25% - Ejen Baru)</option>
            <option value={5}>1 daripada 5 Presentation (20% - Learning)</option>
          </select>
        </div>
      </div>

      {/* Funnel Results */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Daily Target */}
        <div className="bg-gradient-to-br from-emerald-950/70 to-slate-900 border border-emerald-700/60 rounded-xl p-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Tindakan Harian
            </span>
            <Calendar className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3 space-y-2">
            <div className="flex items-baseline justify-between border-b border-emerald-900/50 pb-1.5">
              <span className="text-xs text-slate-300">Panggilan / Prospek</span>
              <span className="text-xl font-extrabold text-white">{dailyCalls} orang</span>
            </div>
            <div className="flex items-baseline justify-between border-b border-emerald-900/50 pb-1.5">
              <span className="text-xs text-slate-300">Presentation Selesai</span>
              <span className="text-xl font-extrabold text-emerald-300">{dailyPresentations} sesi</span>
            </div>
            <p className="text-[11px] text-slate-400 pt-1">
              Berdasarkan {workingDaysPerWeek} hari bekerja/minggu.
            </p>
          </div>
        </div>

        {/* Weekly Target */}
        <div className="bg-gradient-to-br from-teal-950/70 to-slate-900 border border-teal-700/60 rounded-xl p-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">
              Sasaran Mingguan
            </span>
            <PhoneCall className="w-4 h-4 text-teal-400" />
          </div>
          <div className="mt-3 space-y-2">
            <div className="flex items-baseline justify-between border-b border-teal-900/50 pb-1.5">
              <span className="text-xs text-slate-300">Panggilan / Prospek</span>
              <span className="text-xl font-extrabold text-white">{weeklyCalls} orang</span>
            </div>
            <div className="flex items-baseline justify-between border-b border-teal-900/50 pb-1.5">
              <span className="text-xs text-slate-300">Presentation Selesai</span>
              <span className="text-xl font-extrabold text-teal-300">{weeklyPresentations} sesi</span>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-xs text-slate-300">Kes Ditutup</span>
              <span className="text-base font-bold text-white">{weeklyCases} kes/mggu</span>
            </div>
          </div>
        </div>

        {/* Monthly Target */}
        <div className="bg-gradient-to-br from-indigo-950/70 to-slate-900 border border-indigo-700/60 rounded-xl p-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
              Sasaran Bulanan
            </span>
            <UserCheck className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-3 space-y-2">
            <div className="flex items-baseline justify-between border-b border-indigo-900/50 pb-1.5">
              <span className="text-xs text-slate-300">ACE Bulanan</span>
              <span className="text-lg font-extrabold text-white">{formatCurrencyRM(monthlyAce)}</span>
            </div>
            <div className="flex items-baseline justify-between border-b border-indigo-900/50 pb-1.5">
              <span className="text-xs text-slate-300">Kes Bulanan</span>
              <span className="text-xl font-extrabold text-indigo-300">{monthlyCases} kes</span>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-xs text-slate-300">Presentation Bulanan</span>
              <span className="text-base font-bold text-white">{monthlyPresentations} sesi</span>
            </div>
          </div>
        </div>
      </div>

      {/* Takaful Formula Summary */}
      <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed">
          <strong className="text-white">Prinsip Ejen Berjaya INFAQ Consultancy:</strong> Aktiviti yang konsisten menghasilkan kejayaan yang boleh diramal. Untuk mencapai <strong className="text-emerald-400">{formatCurrencyRM(aceGoal)} ACE</strong>, anda hanya perlu fokus kepada aktiviti harian: berhubung dengan sekurang-kurangnya <strong className="text-amber-300">{dailyCalls} prospek baharu</strong> dan selesaikan <strong className="text-amber-300">{dailyPresentations} sesi presentation</strong> setiap hari bekerja.
        </div>
      </div>
    </div>
  );
};
