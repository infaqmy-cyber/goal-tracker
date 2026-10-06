import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { DashboardOverview } from './components/DashboardOverview';
import { MonthlyTrackerTable } from './components/MonthlyTrackerTable';
import { PerformanceCharts } from './components/PerformanceCharts';
import { ActivityCalculator } from './components/ActivityCalculator';
import { MilestoneCard } from './components/MilestoneCard';
import { LeadAdminView } from './components/LeadAdminView';
import { TargetSetupModal } from './components/TargetSetupModal';
import { ExportSummaryModal } from './components/ExportSummaryModal';
import { AgentTarget, MonthlyBreakdownItem } from './types';
import {
  subscribeToAgentTarget,
  saveAgentTarget,
  generateDefaultMonthlyBreakdown,
  buildTargetId,
} from './services/firestoreService';
import {
  LogIn,
  Target,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  TrendingUp,
  Award,
  ChevronRight
} from 'lucide-react';

export function App() {
  const { user, agentProfile, loading: authLoading, isLead, signInWithGoogle, authError, clearAuthError } = useAuth();
  
  // Current active year
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear() || 2026);
  const [activeTab, setActiveTab] = useState<'tracker' | 'charts' | 'calculator' | 'milestones' | 'agency'>('tracker');
  
  // Target data from Firestore
  const [target, setTarget] = useState<AgentTarget | null>(null);
  const [loadingTarget, setLoadingTarget] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Modals
  const [isTargetModalOpen, setIsTargetModalOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);

  // Subscribe to agent target in real-time
  useEffect(() => {
    if (!user) {
      // Demo / fallback state for preview before signing in
      const defaultBreakdown = generateDefaultMonthlyBreakdown(150000, 36);
      setTarget({
        targetId: `demo_${selectedYear}`,
        agentId: 'demo_user',
        agentName: 'Ejen Contoh INFAQ',
        agentEmail: 'demo@infaq.my',
        year: selectedYear,
        overallTargetAce: 150000,
        overallTargetCases: 36,
        overallTargetAcs: 4166,
        monthlyBreakdown: defaultBreakdown,
        closingRatio: 25,
        updatedAt: new Date().toISOString()
      });
      setLoadingTarget(false);
      return;
    }

    setLoadingTarget(true);
    const unsubscribe = subscribeToAgentTarget(
      user.uid,
      selectedYear,
      (liveTarget) => {
        if (liveTarget) {
          setTarget(liveTarget);
        } else {
          // Initialize default target data if not yet created for this year
          const newBreakdown = generateDefaultMonthlyBreakdown(150000, 36);
          const initialTarget: AgentTarget = {
            targetId: buildTargetId(user.uid, selectedYear),
            agentId: user.uid,
            agentName: user.displayName || agentProfile?.name || user.email?.split('@')[0] || 'Ejen INFAQ',
            agentEmail: user.email || '',
            year: selectedYear,
            overallTargetAce: 150000,
            overallTargetCases: 36,
            overallTargetAcs: 4166,
            monthlyBreakdown: newBreakdown,
            closingRatio: 25,
            updatedAt: new Date().toISOString()
          };
          setTarget(initialTarget);
        }
        setLoadingTarget(false);
      },
      (error) => {
        console.error('Target sync error:', error);
        setLoadingTarget(false);
      }
    );

    return () => unsubscribe();
  }, [user, selectedYear, agentProfile]);

  const showFeedback = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const handleSaveMonthlyBreakdown = async (newBreakdown: MonthlyBreakdownItem[]) => {
    if (!target) return;
    setIsSaving(true);
    try {
      const updatedTarget: AgentTarget = {
        ...target,
        monthlyBreakdown: newBreakdown,
        updatedAt: new Date().toISOString()
      };

      if (user) {
        await saveAgentTarget(updatedTarget);
      } else {
        // In local demo mode
        setTarget(updatedTarget);
      }
      showFeedback('Pencapaian bulanan berjaya dikemaskini.');
    } catch (err) {
      console.error('Failed to save monthly breakdown:', err);
      showFeedback('Ralat semasa menyimpan data ke pangkalan data.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveTargetConfig = async (targetData: Partial<AgentTarget>) => {
    if (!target) return;
    setIsSaving(true);
    try {
      const updatedTarget: AgentTarget = {
        ...target,
        ...targetData,
        agentName: user?.displayName || agentProfile?.name || target.agentName,
        agentEmail: user?.email || target.agentEmail,
        updatedAt: new Date().toISOString()
      };

      if (user) {
        await saveAgentTarget(updatedTarget);
      } else {
        setTarget(updatedTarget);
      }
      showFeedback('Sasaran tahunan berjaya ditetapkan!');
    } catch (err) {
      console.error('Failed to save target config:', err);
      showFeedback('Ralat menyimpan sasaran tahunan.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-200">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center animate-pulse text-emerald-400 mb-4">
          <Target className="w-7 h-7" />
        </div>
        <p className="text-sm font-semibold text-slate-400">Memuatkan Goal Tracker Pro...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Toast Notification */}
      {feedbackMsg && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-bold border transition-all animate-bounce ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-900/90 text-emerald-100 border-emerald-600'
              : 'bg-rose-900/90 text-rose-100 border-rose-600'
          }`}
        >
          <Sparkles className="w-4 h-4 text-emerald-300" />
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenTargetModal={() => setIsTargetModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
      />

      {/* Guest Banner if not signed in */}
      {!user && (
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border-b border-emerald-800/40 py-3 px-4">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-slate-300">
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 text-[10px]">
                MOD PREVIEW
              </span>
              <span>
                Anda sedang melihat mod contoh. Sila log masuk dengan akaun Google anda untuk menyimpan sasaran dan rekod sebenar secara kekal.
              </span>
            </div>
            <button
              onClick={signInWithGoogle}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Log Masuk Ejen</span>
            </button>
          </div>
        </div>
      )}

      {/* Auth Error Banner if sign-in failed */}
      {authError && (
        <div className="bg-rose-950/80 border-b border-rose-800/80 py-2.5 px-4 text-xs text-rose-200">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{authError}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={signInWithGoogle}
                className="px-2.5 py-1 bg-rose-800 hover:bg-rose-700 text-white font-semibold rounded text-[11px] cursor-pointer"
              >
                Cuba Lagi
              </button>
              <button
                onClick={clearAuthError}
                className="px-2 py-1 text-rose-300 hover:text-white text-[11px] cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {activeTab === 'tracker' && (
          <>
            <DashboardOverview target={target} selectedYear={selectedYear} />
            <MonthlyTrackerTable
              target={target}
              onSaveMonthlyBreakdown={handleSaveMonthlyBreakdown}
              isSaving={isSaving}
            />
          </>
        )}

        {activeTab === 'charts' && (
          <>
            <PerformanceCharts target={target} />
            <DashboardOverview target={target} selectedYear={selectedYear} />
          </>
        )}

        {activeTab === 'calculator' && (
          <ActivityCalculator target={target} />
        )}

        {activeTab === 'milestones' && (
          <MilestoneCard target={target} />
        )}

        {activeTab === 'agency' && isLead && (
          <LeadAdminView selectedYear={selectedYear} />
        )}
      </main>

      {/* Target Setup Modal */}
      <TargetSetupModal
        isOpen={isTargetModalOpen}
        onClose={() => setIsTargetModalOpen(false)}
        target={target}
        selectedYear={selectedYear}
        onSaveTarget={handleSaveTargetConfig}
      />

      {/* Export Summary Modal */}
      <ExportSummaryModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        target={target}
        profile={agentProfile}
        selectedYear={selectedYear}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {selectedYear} INFAQ Consultancy • Goal Tracker Pro (Takaful Business Management)</p>
          <p className="text-[11px] text-slate-600">
            Direka khas untuk Ejen & Penasihat Kewangan Takaful INFAQ
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
