import React, { useEffect, useState } from 'react';
import { AgentProfile, AgentTarget, AgentNote } from '../types';
import {
  subscribeToAllAgents,
  subscribeToAllTargetsForYear,
  getAgentNote,
  saveAgentNote,
  formatCurrencyRM,
  formatNumber
} from '../services/firestoreService';
import {
  Users,
  ShieldCheck,
  TrendingUp,
  Award,
  DollarSign,
  FileCheck2,
  Search,
  ChevronRight,
  Lock,
  Save,
  CheckCircle2,
  CalendarCheck,
  X,
  FileText
} from 'lucide-react';

interface LeadAdminViewProps {
  selectedYear: number;
}

export const LeadAdminView: React.FC<LeadAdminViewProps> = ({ selectedYear }) => {
  const [agents, setAgents] = useState<AgentProfile[]>([]);
  const [targets, setTargets] = useState<AgentTarget[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAgentForModal, setSelectedAgentForModal] = useState<AgentProfile | null>(null);
  const [activeNoteText, setActiveNoteText] = useState<string>('');
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [noteSaveStatus, setNoteSaveStatus] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsubAgents = subscribeToAllAgents((agentList) => {
      setAgents(agentList);
    });

    const unsubTargets = subscribeToAllTargetsForYear(selectedYear, (targetList) => {
      setTargets(targetList);
      setLoading(false);
    });

    return () => {
      unsubAgents();
      unsubTargets();
    };
  }, [selectedYear]);

  // Merge agent data with target for selected year
  const agentPerformanceList = agents.map((agent) => {
    const target = targets.find((t) => t.agentId === agent.agentId);
    const breakdown = target?.monthlyBreakdown || [];
    const actualAce = breakdown.reduce((sum, m) => sum + (Number(m.actualAce) || 0), 0);
    const targetAce = Number(target?.overallTargetAce) || 0;
    const actualCases = breakdown.reduce((sum, m) => sum + (Number(m.actualCases) || 0), 0);
    const targetCases = Number(target?.overallTargetCases) || 0;
    const acs = actualCases > 0 ? Math.round(actualAce / actualCases) : 0;
    const percent = targetAce > 0 ? Math.round((actualAce / targetAce) * 100) : 0;

    return {
      agent,
      target,
      actualAce,
      targetAce,
      actualCases,
      targetCases,
      acs,
      percent,
    };
  });

  // Sort by actual ACE descending
  const sortedAgents = [...agentPerformanceList].sort((a, b) => b.actualAce - a.actualAce);

  const filteredAgents = sortedAgents.filter(
    (item) =>
      item.agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.agent.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Agency Grand Totals
  const agencyTotalActualAce = agentPerformanceList.reduce((sum, a) => sum + a.actualAce, 0);
  const agencyTotalTargetAce = agentPerformanceList.reduce((sum, a) => sum + a.targetAce, 0);
  const agencyTotalActualCases = agentPerformanceList.reduce((sum, a) => sum + a.actualCases, 0);
  const agencyPercent = agencyTotalTargetAce > 0 ? Math.round((agencyTotalActualAce / agencyTotalTargetAce) * 100) : 0;

  const handleOpenAgentModal = async (agent: AgentProfile) => {
    setSelectedAgentForModal(agent);
    setActiveNoteText('');
    setNoteSaveStatus(null);
    try {
      const noteDoc = await getAgentNote(agent.agentId);
      if (noteDoc) {
        setActiveNoteText(noteDoc.note);
      }
    } catch (err) {
      console.warn('Error fetching private coaching note:', err);
    }
  };

  const handleSaveNote = async () => {
    if (!selectedAgentForModal) return;
    setIsSavingNote(true);
    try {
      await saveAgentNote(selectedAgentForModal.agentId, activeNoteText);
      setNoteSaveStatus('Nota coaching berjaya disimpan.');
      setTimeout(() => setNoteSaveStatus(null), 3000);
    } catch (err) {
      console.error('Failed to save private note:', err);
      setNoteSaveStatus('Ralat menyimpan nota.');
    } finally {
      setIsSavingNote(false);
    }
  };

  const selectedAgentTarget = selectedAgentForModal
    ? targets.find((t) => t.agentId === selectedAgentForModal.agentId)
    : null;

  return (
    <div className="space-y-6">
      {/* Agency Lead Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-amber-800/60 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 shrink-0 shadow-lg">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-white">
                  Dashboard Pengurusan Agensi INFAQ
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-700">
                  LEAD ACCESS
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Pemantauan prestasi agregat dan bimbingan 1-on-1 bagi semua ejen berdaftar (Tahun {selectedYear}).
              </p>
            </div>
          </div>

          {/* Quick Agency Stats */}
          <div className="flex items-center gap-4 bg-slate-950/80 p-3 rounded-xl border border-amber-900/40">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">
                Jumlah ACE Agensi
              </div>
              <div className="text-lg font-extrabold text-amber-400">
                {formatCurrencyRM(agencyTotalActualAce)}
              </div>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">
                Jumlah Kes Agensi
              </div>
              <div className="text-lg font-extrabold text-white">
                {formatNumber(agencyTotalActualCases)} kes
              </div>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">
                Pencapaian
              </div>
              <div className="text-lg font-extrabold text-emerald-400">
                {agencyPercent}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard Table Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span>Kedudukan Prestasi Ejen ({filteredAgents.length} Ejen)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Klik pada nama ejen untuk semak perincian bulanan dan tulis nota bimbingan (private coaching note).
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari nama atau email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Table of Agents */}
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-800/90 text-slate-300 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-700">
              <tr>
                <th className="py-3 px-3">Kedudukan</th>
                <th className="py-3 px-3">Nama Ejen</th>
                <th className="py-3 px-3 text-right">Pencapaian ACE</th>
                <th className="py-3 px-3 text-right">Sasaran ACE</th>
                <th className="py-3 px-3 text-center">% Capai</th>
                <th className="py-3 px-3 text-center">Kes Ditutup</th>
                <th className="py-3 px-3 text-right hidden md:table-cell">ACS</th>
                <th className="py-3 px-3 text-center">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filteredAgents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    Tiada rekod ejen dijumpai untuk tahun {selectedYear}.
                  </td>
                </tr>
              ) : (
                filteredAgents.map((item, index) => {
                  return (
                    <tr
                      key={item.agent.agentId}
                      className="hover:bg-slate-800/60 transition-colors cursor-pointer"
                      onClick={() => handleOpenAgentModal(item.agent)}
                    >
                      <td className="py-3 px-3 font-bold text-slate-400">
                        {index === 0 ? (
                          <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-extrabold flex items-center justify-center text-xs">
                            1
                          </span>
                        ) : index === 1 ? (
                          <span className="w-6 h-6 rounded-full bg-slate-300 text-slate-950 font-bold flex items-center justify-center text-xs">
                            2
                          </span>
                        ) : index === 2 ? (
                          <span className="w-6 h-6 rounded-full bg-amber-700 text-white font-bold flex items-center justify-center text-xs">
                            3
                          </span>
                        ) : (
                          <span className="pl-2">{index + 1}</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-white">{item.agent.name}</div>
                        <div className="text-[11px] text-slate-400">{item.agent.email}</div>
                      </td>
                      <td className="py-3 px-3 text-right font-extrabold text-emerald-400">
                        {formatCurrencyRM(item.actualAce)}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-400">
                        {formatCurrencyRM(item.targetAce)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            item.percent >= 100
                              ? 'bg-purple-950 text-purple-300 border border-purple-800'
                              : item.percent >= 75
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {item.percent}%
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-teal-300">
                        {item.actualCases} kes
                      </td>
                      <td className="py-3 px-3 text-right hidden md:table-cell text-slate-300">
                        {item.actualCases > 0 ? formatCurrencyRM(item.acs) : '-'}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenAgentModal(item.agent);
                          }}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium inline-flex items-center gap-1 transition-colors"
                        >
                          <span>Bimbingan</span>
                          <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Agent Drilldown & Coaching Note Modal */}
      {selectedAgentForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-6 my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-400" />
                  <span>Profil & Rekod Coaching: {selectedAgentForModal.name}</span>
                </h3>
                <p className="text-xs text-slate-400">
                  {selectedAgentForModal.email} | Tahun {selectedYear}
                </p>
              </div>
              <button
                onClick={() => setSelectedAgentForModal(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Performance Summary Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Total ACE</span>
                <div className="text-base font-extrabold text-emerald-400">
                  {formatCurrencyRM(
                    selectedAgentTarget?.monthlyBreakdown?.reduce((s, m) => s + (Number(m.actualAce) || 0), 0) || 0
                  )}
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Sasaran ACE</span>
                <div className="text-base font-bold text-slate-200">
                  {formatCurrencyRM(selectedAgentTarget?.overallTargetAce || 0)}
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Jumlah Kes</span>
                <div className="text-base font-bold text-teal-300">
                  {selectedAgentTarget?.monthlyBreakdown?.reduce((s, m) => s + (Number(m.actualCases) || 0), 0) || 0} kes
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Sasaran Kes</span>
                <div className="text-base font-bold text-slate-200">
                  {selectedAgentTarget?.overallTargetCases || 0} kes
                </div>
              </div>
            </div>

            {/* Monthly mini list */}
            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Pencapaian Mengikut Bulan
              </h4>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-xs">
                {(selectedAgentTarget?.monthlyBreakdown || []).map((m) => (
                  <div key={m.month} className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-center">
                    <div className="font-bold text-slate-400">{m.monthName}</div>
                    <div className="text-emerald-400 font-semibold mt-1">
                      {m.actualAce > 0 ? formatCurrencyRM(m.actualAce) : '-'}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {m.actualCases > 0 ? `${m.actualCases} kes` : '0 kes'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Private Lead Coaching Notes (Strictly for Lead only) */}
            <div className="space-y-2 bg-amber-950/20 border border-amber-800/40 p-4 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-amber-300">
                    Nota Peribadi Coaching (Hanya Boleh Dilihat Oleh Lead)
                  </span>
                </div>
                {noteSaveStatus && (
                  <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {noteSaveStatus}
                  </span>
                )}
              </div>
              <textarea
                rows={4}
                placeholder="Catat nota kekuatan ejen, strategi bimbingan, cabaran closing, atau komitmen tindakan mingguan..."
                value={activeNoteText}
                onChange={(e) => setActiveNoteText(e.target.value)}
                className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500 leading-relaxed"
              />
              <div className="flex justify-end">
                <button
                  onClick={handleSaveNote}
                  disabled={isSavingNote}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSavingNote ? 'Menyimpan...' : 'Simpan Nota Coaching'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
