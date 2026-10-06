import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Target,
  BarChart3,
  Calculator,
  Award,
  Users,
  Printer,
  Settings,
  LogIn,
  LogOut,
  ShieldCheck,
  Calendar,
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  activeTab: 'tracker' | 'charts' | 'calculator' | 'milestones' | 'agency';
  setActiveTab: (tab: 'tracker' | 'charts' | 'calculator' | 'milestones' | 'agency') => void;
  onOpenTargetModal: () => void;
  onOpenExportModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  selectedYear,
  setSelectedYear,
  activeTab,
  setActiveTab,
  onOpenTargetModal,
  onOpenExportModal,
}) => {
  const { user, agentProfile, isLead, signInWithGoogle, logout } = useAuth();
  const availableYears = [2024, 2025, 2026, 2027];

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 shadow-xl backdrop-blur-md bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 flex items-center justify-center shadow-lg shadow-emerald-900/30 border border-emerald-400/30">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-emerald-400 bg-clip-text text-transparent">
                  Goal Tracker Pro
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-700/50">
                  INFAQ
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium hidden sm:block">
                Dashboard Sasaran ACE & Kes Ejen Takaful
              </p>
            </div>
          </div>

          {/* Year Selector & Quick Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center bg-slate-800/90 rounded-lg p-1 border border-slate-700">
              <Calendar className="w-4 h-4 text-emerald-400 ml-2 mr-1 hidden sm:inline" />
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="bg-transparent text-sm font-semibold text-slate-200 focus:outline-none cursor-pointer py-1 px-2"
              >
                {availableYears.map((yr) => (
                  <option key={yr} value={yr} className="bg-slate-800 text-slate-100">
                    Tahun {yr}
                  </option>
                ))}
              </select>
            </div>

            {user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenTargetModal}
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/60 border border-emerald-700/60 rounded-lg hover:bg-emerald-900/80 transition-all shadow-sm"
                  title="Tetapkan Sasaran Tahunan"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Set Sasaran</span>
                </button>

                <button
                  onClick={onOpenExportModal}
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-all shadow-sm"
                  title="Cetak & Ringkasan Coaching"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Laporan</span>
                </button>

                {/* User Status / Avatar */}
                <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'Ejen'}
                      className="w-8 h-8 rounded-full border border-emerald-500/50 object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
                      {user.displayName?.charAt(0) || user.email?.charAt(0) || 'E'}
                    </div>
                  )}
                  <div className="hidden lg:block text-left">
                    <div className="text-xs font-bold text-slate-200 flex items-center gap-1 truncate max-w-[120px]">
                      {user.displayName || agentProfile?.name || 'Ejen INFAQ'}
                      {isLead && <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" title="Lead Admin" />}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[120px]">
                      {user.email}
                    </div>
                  </div>

                  <button
                    onClick={logout}
                    className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                    title="Log Keluar"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-lg shadow-md shadow-emerald-950 transition-all cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Log Masuk Google</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-2.5 scrollbar-none border-t border-slate-800/80">
          <button
            onClick={() => setActiveTab('tracker')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === 'tracker'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-900'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>Tracker Bulanan</span>
          </button>

          <button
            onClick={() => setActiveTab('charts')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === 'charts'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-900'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Graf & Analitik</span>
          </button>

          <button
            onClick={() => setActiveTab('calculator')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === 'calculator'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-900'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Kalkulator Aktiviti (10-3-1)</span>
          </button>

          <button
            onClick={() => setActiveTab('milestones')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === 'milestones'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-900'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Kelab & MDRT</span>
          </button>

          {isLead && (
            <button
              onClick={() => setActiveTab('agency')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all border ${
                activeTab === 'agency'
                  ? 'bg-amber-600 text-white border-amber-500 shadow-sm shadow-amber-950'
                  : 'text-amber-400 border-amber-800/60 bg-amber-950/30 hover:bg-amber-900/40'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Agency Lead View</span>
              <Sparkles className="w-3 h-3 text-amber-300" />
            </button>
          )}

          {/* Mobile action shortcuts */}
          <div className="flex md:hidden items-center gap-1 ml-auto">
            <button
              onClick={onOpenTargetModal}
              className="p-1.5 text-emerald-400 bg-emerald-950/70 border border-emerald-800/60 rounded-lg text-xs font-semibold"
              title="Set Sasaran"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onOpenExportModal}
              className="p-1.5 text-slate-300 bg-slate-800 border border-slate-700 rounded-lg text-xs font-semibold"
              title="Cetak Laporan"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
};
