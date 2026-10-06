export interface AgentProfile {
  agentId: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  agency?: string;
  phone?: string;
}

export interface MonthlyBreakdownItem {
  month: number; // 1 - 12
  monthName: string; // Jan, Feb, Mar, etc.
  targetAce: number;
  actualAce: number;
  targetCases: number;
  actualCases: number;
  leadsContacted?: number;
  presentations?: number;
  closingRatio?: number;
  notes?: string;
}

export interface AgentTarget {
  targetId: string; // Format: `${agentId}_${year}` or string ID
  agentId: string;
  agentName: string;
  agentEmail: string;
  year: number;
  overallTargetAce: number;
  overallTargetCases: number;
  overallTargetAcs: number;
  monthlyBreakdown: MonthlyBreakdownItem[];
  closingRatio?: number;
  closingRatioPresentation?: number;
  updatedAt: string;
}

export interface AgentNote {
  agentId: string;
  note: string;
  updatedAt: string;
}

export interface TakafulClub {
  id: string;
  name: string;
  tierName: string;
  minAce: number;
  minCases?: number;
  badgeColor: string;
  textColor: string;
  icon: string;
  description: string;
}

export interface ActivitySimulatorParams {
  annualAceTarget: number;
  averageCaseSize: number;
  closingRatioLeadToCase: number; // percentage, e.g. 20
  closingRatioPresentationToCase: number; // percentage, e.g. 50
  workingWeeksPerYear: number;
  workingDaysPerWeek: number;
}
