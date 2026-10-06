import React from 'react';
import { AgentTarget, AgentProfile } from '../types';
import { formatCurrencyRM, formatNumber } from '../services/firestoreService';
import { X, Printer, Download, FileText, CheckCircle2, Shield } from 'lucide-react';

interface ExportSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  target: AgentTarget | null;
  profile: AgentProfile | null;
  selectedYear: number;
}

export const ExportSummaryModal: React.FC<ExportSummaryModalProps> = ({
  isOpen,
  onClose,
  target,
  profile,
  selectedYear
}) => {
  if (!isOpen) return null;

  const breakdown = target?.monthlyBreakdown || [];
  const totalActualAce = breakdown.reduce((sum, m) => sum + (Number(m.actualAce) || 0), 0);
  const totalTargetAce = Number(target?.overallTargetAce) || 0;
  const totalActualCases = breakdown.reduce((sum, m) => sum + (Number(m.actualCases) || 0), 0);
  const totalTargetCases = Number(target?.overallTargetCases) || 0;
  const percentAce = totalTargetAce > 0 ? Math.round((totalActualAce / totalTargetAce) * 100) : 0;
  const actualAcs = totalActualCases > 0 ? Math.round(totalActualAce / totalActualCases) : 0;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    const headers = ['Bulan', 'Sasaran ACE (RM)', 'Sebenar ACE (RM)', 'Sasaran Kes', 'Sebenar Kes', 'Leads', 'Presentations', 'Nota'];
    const rows = breakdown.map((m) => [
      m.monthName,
      m.targetAce,
      m.actualAce,
      m.targetCases,
      m.actualCases,
      m.leadsContacted || 0,
      m.presentations || 0,
      `"${(m.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [
      `"Laporan Prestasi Ejen Takaful - INFAQ Consultancy (${selectedYear})"`,
      `"Nama Ejen: ${profile?.name || target?.agentName || 'Ejen'}"`,
      `"Email: ${profile?.email || target?.agentEmail || ''}"`,
      '',
      headers.join(','),
      ...rows.map((r) => r.join(',')),
      '',
      `"JUMLAH",${totalTargetAce},${totalActualAce},${totalTargetCases},${totalActualCases}`
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `INFAQ_Goal_Tracker_${selectedYear}_${(profile?.name || 'Agent').replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 print:border-none print:shadow-none print:bg-white print:text-black print:my-0 print:p-0">
        {/* Action bar (hidden in print) */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">
              Ringkasan Prestasi & Laporan Coaching ({selectedYear})
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Eksport CSV</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Header */}
        <div className="border-b border-slate-700/60 pb-6 print:border-black">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight text-white print:text-black">
                  INFAQ CONSULTANCY
                </span>
                <span className="text-xs uppercase font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-700 print:border-black print:text-black">
                  GOAL TRACKER PRO
                </span>
              </div>
              <p className="text-xs text-slate-400 print:text-slate-600 mt-1">
                Laporan Penjejakan Sasaran Tahunan & Analisis Prestasi Takaful ({selectedYear})
              </p>
            </div>

            <div className="text-right text-xs">
              <div className="font-bold text-white print:text-black">
                {profile?.name || target?.agentName || 'Ejen INFAQ'}
              </div>
              <div className="text-slate-400 print:text-slate-600">
                {profile?.email || target?.agentEmail || ''}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                Dijana: {new Date().toLocaleDateString('ms-MY')}
              </div>
            </div>
          </div>
        </div>

        {/* Summary KPI Boxes */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 print:border-slate-300 print:bg-slate-50">
            <span className="text-[10px] uppercase font-bold text-slate-400 print:text-slate-600">
              Jumlah Pencapaian ACE
            </span>
            <div className="text-lg font-extrabold text-emerald-400 print:text-black mt-1">
              {formatCurrencyRM(totalActualAce)}
            </div>
            <div className="text-[11px] text-slate-400 print:text-slate-600">
              Sasaran: {formatCurrencyRM(totalTargetAce)} ({percentAce}%)
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 print:border-slate-300 print:bg-slate-50">
            <span className="text-[10px] uppercase font-bold text-slate-400 print:text-slate-600">
              Jumlah Kes Ditutup
            </span>
            <div className="text-lg font-extrabold text-teal-300 print:text-black mt-1">
              {totalActualCases} kes
            </div>
            <div className="text-[11px] text-slate-400 print:text-slate-600">
              Sasaran: {totalTargetCases} kes
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 print:border-slate-300 print:bg-slate-50">
            <span className="text-[10px] uppercase font-bold text-slate-400 print:text-slate-600">
              Purata Saiz Kes (ACS)
            </span>
            <div className="text-lg font-extrabold text-indigo-300 print:text-black mt-1">
              {formatCurrencyRM(actualAcs)}
            </div>
            <div className="text-[11px] text-slate-400 print:text-slate-600">
              Sasaran ACS: {formatCurrencyRM(target?.overallTargetAcs || 0)}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 print:border-slate-300 print:bg-slate-50">
            <span className="text-[10px] uppercase font-bold text-slate-400 print:text-slate-600">
              Status Sasaran
            </span>
            <div className="text-lg font-extrabold text-white print:text-black mt-1">
              {percentAce >= 100 ? 'Tercapai 🎉' : percentAce >= 75 ? 'Pecutan Elit' : 'Sedang Berjalan'}
            </div>
            <div className="text-[11px] text-slate-400 print:text-slate-600">
              Baki: {formatCurrencyRM(Math.max(0, totalTargetAce - totalActualAce))}
            </div>
          </div>
        </div>

        {/* 12-Month Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800 print:border-slate-300">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800 text-slate-300 font-semibold uppercase text-[10px] print:bg-slate-200 print:text-black">
              <tr>
                <th className="py-2.5 px-3">Bulan</th>
                <th className="py-2.5 px-3 text-right">Sasaran ACE</th>
                <th className="py-2.5 px-3 text-right">Sebenar ACE</th>
                <th className="py-2.5 px-3 text-center">Sasaran Kes</th>
                <th className="py-2.5 px-3 text-center">Sebenar Kes</th>
                <th className="py-2.5 px-3 text-right">ACS Sebenar</th>
                <th className="py-2.5 px-3">Nota & Refleksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 print:divide-slate-200 text-slate-300 print:text-black">
              {breakdown.map((m) => {
                const acsVal = m.actualCases > 0 ? Math.round(m.actualAce / m.actualCases) : 0;
                return (
                  <tr key={m.month}>
                    <td className="py-2 px-3 font-bold">{m.monthName}</td>
                    <td className="py-2 px-3 text-right">{formatCurrencyRM(m.targetAce)}</td>
                    <td className="py-2 px-3 text-right font-semibold">{formatCurrencyRM(m.actualAce)}</td>
                    <td className="py-2 px-3 text-center">{m.targetCases}</td>
                    <td className="py-2 px-3 text-center font-semibold">{m.actualCases}</td>
                    <td className="py-2 px-3 text-right">{acsVal > 0 ? formatCurrencyRM(acsVal) : '-'}</td>
                    <td className="py-2 px-3 text-slate-400 print:text-slate-700 max-w-xs truncate">
                      {m.notes || '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-900 font-bold border-t-2 border-slate-700 print:bg-slate-100 print:text-black">
              <tr>
                <td className="py-2.5 px-3">JUMLAH KESELURUHAN</td>
                <td className="py-2.5 px-3 text-right">{formatCurrencyRM(totalTargetAce)}</td>
                <td className="py-2.5 px-3 text-right text-emerald-400 print:text-black">{formatCurrencyRM(totalActualAce)}</td>
                <td className="py-2.5 px-3 text-center">{totalTargetCases}</td>
                <td className="py-2.5 px-3 text-center">{totalActualCases}</td>
                <td className="py-2.5 px-3 text-right">{actualAcs > 0 ? formatCurrencyRM(actualAcs) : '-'}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Signature & Review Block */}
        <div className="pt-6 border-t border-slate-800 print:border-black grid grid-cols-2 gap-8 text-xs text-slate-400 print:text-black">
          <div>
            <p className="font-semibold text-slate-300 print:text-black mb-12">
              Tandatangan Ejen:
            </p>
            <div className="border-t border-slate-600 print:border-black pt-1">
              <span>{profile?.name || target?.agentName || 'Nama Ejen'}</span>
            </div>
          </div>
          <div>
            <p className="font-semibold text-slate-300 print:text-black mb-12">
              Tandatangan Group / Agency Lead:
            </p>
            <div className="border-t border-slate-600 print:border-black pt-1">
              <span>Afyan Mat Rawi (INFAQ Consultancy)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
