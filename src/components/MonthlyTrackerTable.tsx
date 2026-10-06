import React, { useState } from 'react';
import { MonthlyBreakdownItem, AgentTarget } from '../types';
import { formatCurrencyRM, formatNumber } from '../services/firestoreService';
import {
  Save,
  Plus,
  Edit2,
  Check,
  X,
  Sparkles,
  MessageSquare,
  TrendingUp,
  ArrowDownRight,
  ArrowUpRight,
  CalendarCheck
} from 'lucide-react';

interface MonthlyTrackerTableProps {
  target: AgentTarget | null;
  onSaveMonthlyBreakdown: (newBreakdown: MonthlyBreakdownItem[]) => Promise<void>;
  isSaving: boolean;
}

export const MonthlyTrackerTable: React.FC<MonthlyTrackerTableProps> = ({
  target,
  onSaveMonthlyBreakdown,
  isSaving
}) => {
  const breakdown = target?.monthlyBreakdown || [];
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [tempRow, setTempRow] = useState<MonthlyBreakdownItem | null>(null);
  const [quickAddModalMonth, setQuickAddModalMonth] = useState<number | null>(null);
  const [quickAce, setQuickAce] = useState<string>('');
  const [quickCases, setQuickCases] = useState<number>(1);
  const [quickNotes, setQuickNotes] = useState<string>('');

  const handleStartEdit = (index: number) => {
    setEditingIndex(index);
    setTempRow({ ...breakdown[index] });
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setTempRow(null);
  };

  const handleSaveRow = async () => {
    if (editingIndex === null || !tempRow) return;
    const updated = [...breakdown];
    updated[editingIndex] = {
      ...tempRow,
      targetAce: Number(tempRow.targetAce) || 0,
      actualAce: Number(tempRow.actualAce) || 0,
      targetCases: Number(tempRow.targetCases) || 0,
      actualCases: Number(tempRow.actualCases) || 0,
      leadsContacted: Number(tempRow.leadsContacted) || 0,
      presentations: Number(tempRow.presentations) || 0,
      notes: tempRow.notes || ''
    };
    await onSaveMonthlyBreakdown(updated);
    setEditingIndex(null);
    setTempRow(null);
  };

  const handleQuickAdd = async (monthIndex: number) => {
    const aceAmount = Number(quickAce) || 0;
    const updated = [...breakdown];
    const currentRow = updated[monthIndex];
    
    updated[monthIndex] = {
      ...currentRow,
      actualAce: (Number(currentRow.actualAce) || 0) + aceAmount,
      actualCases: (Number(currentRow.actualCases) || 0) + (quickCases || 0),
      notes: quickNotes
        ? currentRow.notes
          ? `${currentRow.notes} | ${quickNotes}`
          : quickNotes
        : currentRow.notes || ''
    };

    await onSaveMonthlyBreakdown(updated);
    setQuickAddModalMonth(null);
    setQuickAce('');
    setQuickCases(1);
    setQuickNotes('');
  };

  // Grand totals
  const totalTargetAce = breakdown.reduce((sum, m) => sum + (Number(m.targetAce) || 0), 0);
  const totalActualAce = breakdown.reduce((sum, m) => sum + (Number(m.actualAce) || 0), 0);
  const totalTargetCases = breakdown.reduce((sum, m) => sum + (Number(m.targetCases) || 0), 0);
  const totalActualCases = breakdown.reduce((sum, m) => sum + (Number(m.actualCases) || 0), 0);
  const totalLeads = breakdown.reduce((sum, m) => sum + (Number(m.leadsContacted) || 0), 0);
  const totalPresentations = breakdown.reduce((sum, m) => sum + (Number(m.presentations) || 0), 0);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
      {/* Header with Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-emerald-400" />
            <span>Jadual Penjejakan Bulanan (12 Bulan)</span>
          </h3>
          <p className="text-xs text-slate-400">
            Kemaskini pencapaian sebenar ACE, bilangan kes, serta aktiviti prospek setiap bulan.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {isSaving && (
            <span className="text-xs text-emerald-400 flex items-center gap-1 animate-pulse">
              <Sparkles className="w-3.5 h-3.5" />
              Menyimpan data...
            </span>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-slate-800/90 text-slate-300 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-700">
            <tr>
              <th className="py-3 px-3">Bulan</th>
              <th className="py-3 px-3 text-right">Sasaran ACE</th>
              <th className="py-3 px-3 text-right">Sebenar ACE</th>
              <th className="py-3 px-3 text-right">Varians ACE</th>
              <th className="py-3 px-3 text-center">Sasaran Kes</th>
              <th className="py-3 px-3 text-center">Sebenar Kes</th>
              <th className="py-3 px-3 text-right hidden md:table-cell">ACS Sebenar</th>
              <th className="py-3 px-3 text-center hidden lg:table-cell">Leads</th>
              <th className="py-3 px-3 text-center hidden lg:table-cell">Pres.</th>
              <th className="py-3 px-3 text-center hidden xl:table-cell">Nota / Refleksi</th>
              <th className="py-3 px-3 text-center">Tindakan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-300">
            {breakdown.map((row, index) => {
              const isEditing = editingIndex === index;
              const targetAce = Number(row.targetAce) || 0;
              const actualAce = Number(row.actualAce) || 0;
              const targetCases = Number(row.targetCases) || 0;
              const actualCases = Number(row.actualCases) || 0;
              const aceDiff = actualAce - targetAce;
              const monthlyAcs = actualCases > 0 ? Math.round(actualAce / actualCases) : 0;
              const isCurrentMonth = new Date().getMonth() + 1 === row.month;

              if (isEditing && tempRow) {
                return (
                  <tr key={row.month} className="bg-slate-800/95 ring-2 ring-emerald-500/50">
                    <td className="py-2.5 px-3 font-bold text-emerald-400">
                      {row.monthName} ({row.month})
                    </td>
                    <td className="py-2 px-2 text-right">
                      <input
                        type="number"
                        value={tempRow.targetAce}
                        onChange={(e) => setTempRow({ ...tempRow, targetAce: Number(e.target.value) })}
                        className="w-24 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-right text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      />
                    </td>
                    <td className="py-2 px-2 text-right">
                      <input
                        type="number"
                        value={tempRow.actualAce}
                        onChange={(e) => setTempRow({ ...tempRow, actualAce: Number(e.target.value) })}
                        className="w-24 px-2 py-1 bg-slate-900 border border-emerald-600 rounded text-right text-xs text-emerald-300 font-bold focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      />
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-500">-</td>
                    <td className="py-2 px-2 text-center">
                      <input
                        type="number"
                        value={tempRow.targetCases}
                        onChange={(e) => setTempRow({ ...tempRow, targetCases: Number(e.target.value) })}
                        className="w-16 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-center text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      />
                    </td>
                    <td className="py-2 px-2 text-center">
                      <input
                        type="number"
                        value={tempRow.actualCases}
                        onChange={(e) => setTempRow({ ...tempRow, actualCases: Number(e.target.value) })}
                        className="w-16 px-2 py-1 bg-slate-900 border border-teal-600 rounded text-center text-xs text-teal-300 font-bold focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      />
                    </td>
                    <td className="py-2.5 px-3 text-right hidden md:table-cell text-slate-400">
                      Auto
                    </td>
                    <td className="py-2 px-2 text-center hidden lg:table-cell">
                      <input
                        type="number"
                        value={tempRow.leadsContacted || 0}
                        onChange={(e) => setTempRow({ ...tempRow, leadsContacted: Number(e.target.value) })}
                        className="w-14 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-center text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      />
                    </td>
                    <td className="py-2 px-2 text-center hidden lg:table-cell">
                      <input
                        type="number"
                        value={tempRow.presentations || 0}
                        onChange={(e) => setTempRow({ ...tempRow, presentations: Number(e.target.value) })}
                        className="w-14 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-center text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      />
                    </td>
                    <td className="py-2 px-2 text-center hidden xl:table-cell">
                      <input
                        type="text"
                        placeholder="Nota kes / kempen..."
                        value={tempRow.notes || ''}
                        onChange={(e) => setTempRow({ ...tempRow, notes: e.target.value })}
                        className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      />
                    </td>
                    <td className="py-2 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={handleSaveRow}
                          className="p-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded shadow"
                          title="Simpan Baris"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="p-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded"
                          title="Batal"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }

              return (
                <tr
                  key={row.month}
                  className={`hover:bg-slate-800/50 transition-colors ${
                    isCurrentMonth ? 'bg-emerald-950/20 border-l-2 border-emerald-400' : ''
                  }`}
                >
                  <td className="py-3 px-3 font-semibold text-slate-200 flex items-center gap-2">
                    <span>{row.monthName}</span>
                    {isCurrentMonth && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-900/80 text-emerald-300 font-bold border border-emerald-700/50">
                        KINI
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right font-medium text-slate-400">
                    {formatCurrencyRM(targetAce)}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-white">
                    {actualAce > 0 ? (
                      <span className="text-emerald-400">{formatCurrencyRM(actualAce)}</span>
                    ) : (
                      <span className="text-slate-600">RM 0</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right font-semibold">
                    {actualAce === 0 ? (
                      <span className="text-slate-600">-</span>
                    ) : aceDiff >= 0 ? (
                      <span className="text-emerald-400 inline-flex items-center gap-0.5">
                        <ArrowUpRight className="w-3 h-3" />
                        +{formatCurrencyRM(aceDiff)}
                      </span>
                    ) : (
                      <span className="text-rose-400 inline-flex items-center gap-0.5">
                        <ArrowDownRight className="w-3 h-3" />
                        {formatCurrencyRM(aceDiff)}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-center text-slate-400">
                    {targetCases}
                  </td>
                  <td className="py-3 px-3 text-center font-bold">
                    {actualCases > 0 ? (
                      <span className="px-2 py-0.5 rounded-full bg-teal-950/80 text-teal-300 border border-teal-800">
                        {actualCases} kes
                      </span>
                    ) : (
                      <span className="text-slate-600">0</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right hidden md:table-cell text-slate-300 font-medium">
                    {actualCases > 0 ? formatCurrencyRM(monthlyAcs) : '-'}
                  </td>
                  <td className="py-3 px-3 text-center hidden lg:table-cell text-slate-400">
                    {row.leadsContacted || 0}
                  </td>
                  <td className="py-3 px-3 text-center hidden lg:table-cell text-slate-400">
                    {row.presentations || 0}
                  </td>
                  <td className="py-3 px-3 text-left hidden xl:table-cell max-w-xs truncate text-slate-400 text-xs">
                    {row.notes ? (
                      <span className="flex items-center gap-1" title={row.notes}>
                        <MessageSquare className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span className="truncate">{row.notes}</span>
                      </span>
                    ) : (
                      <span className="text-slate-600">-</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => {
                          setQuickAddModalMonth(index);
                          setQuickAce('');
                          setQuickCases(1);
                          setQuickNotes('');
                        }}
                        className="px-2 py-1 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 rounded text-xs font-semibold flex items-center gap-1 transition-colors"
                        title="Rekod Kes Pantas"
                      >
                        <Plus className="w-3 h-3" />
                        <span className="hidden sm:inline">Log</span>
                      </button>
                      <button
                        onClick={() => handleStartEdit(index)}
                        className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
                        title="Edit Baris Penuh"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          {/* Total Footer Row */}
          <tfoot className="bg-slate-900 text-slate-200 font-bold border-t-2 border-slate-700">
            <tr>
              <td className="py-3 px-3 uppercase tracking-wider text-emerald-400">
                JUMLAH YTD
              </td>
              <td className="py-3 px-3 text-right">
                {formatCurrencyRM(totalTargetAce)}
              </td>
              <td className="py-3 px-3 text-right text-emerald-400 text-base">
                {formatCurrencyRM(totalActualAce)}
              </td>
              <td className="py-3 px-3 text-right">
                {totalActualAce - totalTargetAce >= 0 ? (
                  <span className="text-emerald-400">
                    +{formatCurrencyRM(totalActualAce - totalTargetAce)}
                  </span>
                ) : (
                  <span className="text-rose-400">
                    {formatCurrencyRM(totalActualAce - totalTargetAce)}
                  </span>
                )}
              </td>
              <td className="py-3 px-3 text-center text-slate-300">
                {totalTargetCases}
              </td>
              <td className="py-3 px-3 text-center text-teal-300 text-base">
                {totalActualCases} kes
              </td>
              <td className="py-3 px-3 text-right hidden md:table-cell text-indigo-300">
                {totalActualCases > 0 ? formatCurrencyRM(Math.round(totalActualAce / totalActualCases)) : 'RM 0'}
              </td>
              <td className="py-3 px-3 text-center hidden lg:table-cell">
                {formatNumber(totalLeads)}
              </td>
              <td className="py-3 px-3 text-center hidden lg:table-cell">
                {formatNumber(totalPresentations)}
              </td>
              <td className="hidden xl:table-cell"></td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Quick Add Modal */}
      {quickAddModalMonth !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-emerald-400" />
                  <span>Tambah Rekod Kes: {breakdown[quickAddModalMonth]?.monthName}</span>
                </h4>
                <p className="text-xs text-slate-400">
                  Nilai ini akan ditambah ke dalam jumlah sedia ada bulan ini.
                </p>
              </div>
              <button
                onClick={() => setQuickAddModalMonth(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Jumlah ACE Kes Baharu (RM) *
                </label>
                <input
                  type="number"
                  placeholder="Contoh: 3600"
                  value={quickAce}
                  onChange={(e) => setQuickAce(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Bilangan Kes Baharu
                </label>
                <input
                  type="number"
                  min="1"
                  value={quickCases}
                  onChange={(e) => setQuickCases(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Catatan Kes (Pilihan)
                </label>
                <input
                  type="text"
                  placeholder="Nama klien / pelan / kempen..."
                  value={quickNotes}
                  onChange={(e) => setQuickNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setQuickAddModalMonth(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all"
              >
                Batal
              </button>
              <button
                onClick={() => handleQuickAdd(quickAddModalMonth)}
                disabled={!quickAce || Number(quickAce) <= 0}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-md shadow-emerald-950"
              >
                Simpan & Tambah
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
