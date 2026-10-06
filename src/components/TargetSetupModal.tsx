import React, { useState, useEffect } from 'react';
import { AgentTarget, MonthlyBreakdownItem } from '../types';
import { MONTH_NAMES, formatCurrencyRM } from '../services/firestoreService';
import {
  Settings,
  X,
  Target,
  Sparkles,
  TrendingUp,
  Award,
  Layers
} from 'lucide-react';

interface TargetSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  target: AgentTarget | null;
  selectedYear: number;
  onSaveTarget: (targetData: Partial<AgentTarget>) => Promise<void>;
}

export const TargetSetupModal: React.FC<TargetSetupModalProps> = ({
  isOpen,
  onClose,
  target,
  selectedYear,
  onSaveTarget
}) => {
  const [ace, setAce] = useState<number>(target?.overallTargetAce || 150000);
  const [cases, setCases] = useState<number>(target?.overallTargetCases || 36);
  const [acs, setAcs] = useState<number>(target?.overallTargetAcs || 4166);
  const [closingRatio, setClosingRatio] = useState<number>(target?.closingRatio || 25);
  const [distMode, setDistMode] = useState<'even' | 'weighted'>('even');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (target) {
      setAce(target.overallTargetAce || 150000);
      setCases(target.overallTargetCases || 36);
      setAcs(target.overallTargetAcs || (target.overallTargetCases ? Math.round(target.overallTargetAce / target.overallTargetCases) : 4000));
      setClosingRatio(target.closingRatio || 25);
    }
  }, [target]);

  // Recalculate ACS automatically when ACE or Cases change
  const handleAceChange = (val: number) => {
    setAce(val);
    if (cases > 0) {
      setAcs(Math.round(val / cases));
    }
  };

  const handleCasesChange = (val: number) => {
    setCases(val);
    if (val > 0) {
      setAcs(Math.round(ace / val));
    }
  };

  if (!isOpen) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      // Build new monthly breakdown while retaining existing actual data
      const existingBreakdown = target?.monthlyBreakdown || [];

      // Weight multiplier for quarterly sprint if selected
      const quarterlyWeights = [
        0.06, 0.07, 0.07, // Q1 (20%)
        0.08, 0.08, 0.09, // Q2 (25%)
        0.08, 0.08, 0.09, // Q3 (25%)
        0.10, 0.10, 0.10  // Q4 (30%)
      ];

      const newBreakdown: MonthlyBreakdownItem[] = MONTH_NAMES.map((name, index) => {
        const existing = existingBreakdown.find((m) => m.month === index + 1);
        let monthTargetAce = Math.round(ace / 12);
        let monthTargetCases = Math.max(1, Math.round(cases / 12));

        if (distMode === 'weighted') {
          monthTargetAce = Math.round(ace * quarterlyWeights[index]);
          monthTargetCases = Math.max(1, Math.round(cases * quarterlyWeights[index]));
        }

        return {
          month: index + 1,
          monthName: name,
          targetAce: monthTargetAce,
          actualAce: existing?.actualAce || 0,
          targetCases: monthTargetCases,
          actualCases: existing?.actualCases || 0,
          leadsContacted: existing?.leadsContacted || 0,
          presentations: existing?.presentations || 0,
          closingRatio: existing?.closingRatio || closingRatio,
          notes: existing?.notes || ''
        };
      });

      await onSaveTarget({
        year: selectedYear,
        overallTargetAce: ace,
        overallTargetCases: cases,
        overallTargetAcs: acs,
        closingRatio: closingRatio,
        monthlyBreakdown: newBreakdown
      });

      onClose();
    } catch (err) {
      console.error('Failed to save targets:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-950 text-emerald-400 flex items-center justify-center border border-emerald-800/60">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Tetapkan Sasaran Perniagaan {selectedYear}
              </h3>
              <p className="text-xs text-slate-400">
                Konfigurasi matlamat tahunan ACE, bilangan kes, dan agihan bulanan.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Inputs */}
        <div className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Sasaran Tahunan ACE (RM) *
            </label>
            <input
              type="number"
              step="5000"
              value={ace}
              onChange={(e) => handleAceChange(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-extrabold text-base focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => handleAceChange(100000)}
                className="px-2 py-1 text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
              >
                RM100k (Silver)
              </button>
              <button
                type="button"
                onClick={() => handleAceChange(150000)}
                className="px-2 py-1 text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
              >
                RM150k (Gold)
              </button>
              <button
                type="button"
                onClick={() => handleAceChange(300000)}
                className="px-2 py-1 text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-purple-300 rounded-lg"
              >
                RM300k (MDRT)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Sasaran Bilangan Kes *
              </label>
              <input
                type="number"
                min="1"
                value={cases}
                onChange={(e) => handleCasesChange(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Purata Saiz Kes (ACS)
              </label>
              <input
                type="number"
                value={acs}
                onChange={(e) => setAcs(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Corak Agihan Sasaran Bulanan
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDistMode('even')}
                className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                  distMode === 'even'
                    ? 'bg-emerald-950 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <div className="font-bold text-white">Sama Rata (Purata)</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {formatCurrencyRM(Math.round(ace / 12))} / bulan
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDistMode('weighted')}
                className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                  distMode === 'weighted'
                    ? 'bg-emerald-950 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <div className="font-bold text-white">Pecutan Akhir Tahun (Q4)</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Q1 20% → Q2/Q3 25% → Q4 30%
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={saving || ace <= 0}
            className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded-xl transition-all shadow-md shadow-emerald-950"
          >
            {saving ? 'Menyimpan...' : 'Simpan & Kemaskini Sasaran'}
          </button>
        </div>
      </div>
    </div>
  );
};
