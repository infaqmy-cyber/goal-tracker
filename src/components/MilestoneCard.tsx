import React from 'react';
import { TAKAFUL_CLUBS } from '../constants/clubs';
import { AgentTarget } from '../types';
import { formatCurrencyRM } from '../services/firestoreService';
import {
  Award,
  Shield,
  Crown,
  Sparkles,
  Trophy,
  Flame,
  Zap,
  CheckCircle2,
  Lock,
  CheckCircle
} from 'lucide-react';

interface MilestoneCardProps {
  target: AgentTarget | null;
}

export const MilestoneCard: React.FC<MilestoneCardProps> = ({ target }) => {
  const monthlyList = target?.monthlyBreakdown || [];
  const currentAce = monthlyList.reduce((acc, m) => acc + (Number(m.actualAce) || 0), 0);
  const currentCases = monthlyList.reduce((acc, m) => acc + (Number(m.actualCases) || 0), 0);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Award': return Award;
      case 'Shield': return Shield;
      case 'Crown': return Crown;
      case 'Sparkles': return Sparkles;
      case 'Trophy': return Trophy;
      case 'Flame': return Flame;
      case 'Zap': return Zap;
      case 'CheckCircle2': return CheckCircle2;
      default: return Award;
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          <span>Pengiktirafan Kelab & Kelayakan MDRT</span>
        </h3>
        <p className="text-xs text-slate-400">
          Pencapaian semasa: <strong className="text-emerald-400">{formatCurrencyRM(currentAce)} ACE</strong> ({currentCases} kes). Buka lencana kelab apabila melepasi penanda aras industri.
        </p>
      </div>

      {/* Grid of Clubs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {TAKAFUL_CLUBS.map((club) => {
          const IconComponent = getIcon(club.icon);
          const isAceMet = currentAce >= club.minAce;
          const isCasesMet = club.minCases ? currentCases >= club.minCases : true;
          const isUnlocked = isAceMet && isCasesMet;

          const progressAcePercent = Math.min(100, Math.round((currentAce / club.minAce) * 100));

          return (
            <div
              key={club.id}
              className={`rounded-2xl p-4 border transition-all relative overflow-hidden flex flex-col justify-between ${
                isUnlocked
                  ? `bg-gradient-to-br ${club.badgeColor} shadow-lg ring-1 ring-white/20`
                  : 'bg-slate-950/70 border-slate-800 opacity-75 hover:opacity-100'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-inner ${
                      isUnlocked
                        ? 'bg-black/30 text-white border-white/30'
                        : 'bg-slate-800 text-slate-500 border-slate-700'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                  </div>

                  {isUnlocked ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-black/40 text-emerald-300 border border-emerald-500/40">
                      <CheckCircle className="w-3 h-3" />
                      Layak
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-900 text-slate-500 border border-slate-800">
                      <Lock className="w-3 h-3" />
                      {progressAcePercent}%
                    </span>
                  )}
                </div>

                <div className="mt-3">
                  <h4 className="font-bold text-sm text-white">
                    {club.name}
                  </h4>
                  <div className={`text-xs font-semibold ${isUnlocked ? club.textColor : 'text-slate-400'}`}>
                    {club.tierName}
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                    {club.description}
                  </p>
                </div>
              </div>

              {/* Requirements & Progress */}
              <div className="mt-4 pt-3 border-t border-white/10 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span>Sasaran ACE:</span>
                  <span className="font-bold text-white">{formatCurrencyRM(club.minAce)}</span>
                </div>
                {club.minCases && (
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Min Kes:</span>
                    <span className="font-bold text-white">{club.minCases} kes</span>
                  </div>
                )}

                {/* Progress bar */}
                <div className="w-full bg-black/40 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      isUnlocked ? 'bg-white' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${progressAcePercent}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
