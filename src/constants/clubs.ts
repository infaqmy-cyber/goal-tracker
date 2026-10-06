import { TakafulClub } from '../types';

export const TAKAFUL_CLUBS: TakafulClub[] = [
  {
    id: 'bronze',
    name: 'Bronze Producer Club',
    tierName: 'Bronze',
    minAce: 50000,
    minCases: 12,
    badgeColor: 'from-amber-700 to-amber-900 border-amber-600',
    textColor: 'text-amber-300',
    icon: 'Award',
    description: 'Pencapaian asas konsisten RM50k ACE & minimum 12 kes.'
  },
  {
    id: 'silver',
    name: 'Silver Producer Club',
    tierName: 'Silver',
    minAce: 100000,
    minCases: 24,
    badgeColor: 'from-slate-400 to-slate-600 border-slate-300',
    textColor: 'text-slate-200',
    icon: 'Shield',
    description: 'Pencapaian Mantap RM100k ACE (purata RM8.3k/bulan).'
  },
  {
    id: 'gold',
    name: 'Gold Star Club',
    tierName: 'Gold',
    minAce: 150000,
    minCases: 36,
    badgeColor: 'from-yellow-500 to-amber-600 border-yellow-300',
    textColor: 'text-yellow-200',
    icon: 'Crown',
    description: 'Pencapaian Elit RM150k ACE & 36 kes (3 kes/bulan).'
  },
  {
    id: 'platinum',
    name: 'Platinum 200k Club',
    tierName: 'Platinum',
    minAce: 200000,
    minCases: 40,
    badgeColor: 'from-emerald-600 to-teal-800 border-emerald-400',
    textColor: 'text-emerald-200',
    icon: 'Sparkles',
    description: 'Pencapaian Luar Biasa RM200k ACE ke arah MDRT.'
  },
  {
    id: 'mdrt',
    name: 'Million Dollar Round Table (MDRT)',
    tierName: 'MDRT Qualifier',
    minAce: 300000,
    minCases: 30,
    badgeColor: 'from-purple-600 to-indigo-900 border-purple-400',
    textColor: 'text-purple-200',
    icon: 'Trophy',
    description: 'Standard Antarabangsa Premier Takaful Financial Advisor.'
  },
  {
    id: 'cot',
    name: 'Court of the Table (COT)',
    tierName: 'COT (3x MDRT)',
    minAce: 900000,
    minCases: 50,
    badgeColor: 'from-rose-600 to-red-900 border-rose-400',
    textColor: 'text-rose-200',
    icon: 'Flame',
    description: 'Tahap 3x ganda MDRT - Kelompok 1% penasihat terulung.'
  },
  {
    id: 'tot',
    name: 'Top of the Table (TOT)',
    tierName: 'TOT (6x MDRT)',
    minAce: 1800000,
    minCases: 60,
    badgeColor: 'from-amber-400 via-yellow-200 to-amber-600 border-yellow-200',
    textColor: 'text-amber-950 font-bold',
    icon: 'Zap',
    description: 'Puncak kejayaan 6x MDRT - Legenda industri Takaful.'
  },
  {
    id: 'centurion',
    name: 'Centurion 100 Cases Club',
    tierName: '100 Cases Master',
    minAce: 100000,
    minCases: 100,
    badgeColor: 'from-blue-600 to-cyan-800 border-cyan-400',
    textColor: 'text-cyan-200',
    icon: 'CheckCircle2',
    description: 'Kejuaraan volum 100 nyawa dilindungi dalam setahun.'
  }
];
