import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  Unsubscribe
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { AgentProfile, AgentTarget, AgentNote, MonthlyBreakdownItem } from '../types';

export const MONTH_NAMES = [
  'Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun',
  'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'
];

export function generateDefaultMonthlyBreakdown(targetAce: number = 120000, targetCases: number = 36): MonthlyBreakdownItem[] {
  const monthlyAce = Math.round(targetAce / 12);
  const monthlyCases = Math.max(1, Math.round(targetCases / 12));
  
  return MONTH_NAMES.map((name, index) => ({
    month: index + 1,
    monthName: name,
    targetAce: monthlyAce,
    actualAce: 0,
    targetCases: monthlyCases,
    actualCases: 0,
    leadsContacted: 0,
    presentations: 0,
    closingRatio: 25,
    notes: ''
  }));
}

export function sanitizeDocId(id: string): string {
  return id.replace(/[^a-zA-Z0-9_-]/g, '_');
}

export function formatCurrencyRM(amount: number): string {
  return new Intl.NumberFormat('ms-MY', {
    style: 'currency',
    currency: 'MYR',
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('ms-MY').format(num || 0);
}

// -------------------------------------------------------------
// Agent Profile Services
// -------------------------------------------------------------
export async function getOrCreateAgentProfile(
  userId: string,
  email: string,
  displayName: string | null
): Promise<AgentProfile> {
  const cleanId = sanitizeDocId(userId);
  const path = `agents/${cleanId}`;
  
  try {
    const docRef = doc(db, 'agents', cleanId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as AgentProfile;
    }

    const newProfile: AgentProfile = {
      agentId: userId,
      name: displayName || email.split('@')[0],
      email: email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(docRef, newProfile);
    return newProfile;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

export async function updateAgentProfile(profile: Partial<AgentProfile> & { agentId: string }): Promise<void> {
  const cleanId = sanitizeDocId(profile.agentId);
  const path = `agents/${cleanId}`;
  
  try {
    const docRef = doc(db, 'agents', cleanId);
    const updateData = {
      ...profile,
      updatedAt: new Date().toISOString(),
    };
    await updateDoc(docRef, updateData);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    throw error;
  }
}

export function subscribeToAllAgents(
  onData: (agents: AgentProfile[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const path = 'agents';
  try {
    const colRef = collection(db, path);
    return onSnapshot(
      colRef,
      (snapshot) => {
        const agents = snapshot.docs.map((d) => d.data() as AgentProfile);
        onData(agents);
      },
      (err) => {
        if (onError) onError(err);
        handleFirestoreError(err, OperationType.LIST, path);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    throw error;
  }
}

// -------------------------------------------------------------
// Agent Target Services
// -------------------------------------------------------------
export function buildTargetId(agentId: string, year: number): string {
  return sanitizeDocId(`target_${agentId}_${year}`);
}

export async function getAgentTarget(agentId: string, year: number): Promise<AgentTarget | null> {
  const targetId = buildTargetId(agentId, year);
  const path = `agent_targets/${targetId}`;
  
  try {
    const docRef = doc(db, 'agent_targets', targetId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as AgentTarget;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

export function subscribeToAgentTarget(
  agentId: string,
  year: number,
  onData: (target: AgentTarget | null) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const targetId = buildTargetId(agentId, year);
  const path = `agent_targets/${targetId}`;
  
  try {
    const docRef = doc(db, 'agent_targets', targetId);
    return onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          onData(snapshot.data() as AgentTarget);
        } else {
          onData(null);
        }
      },
      (err) => {
        if (onError) onError(err);
        handleFirestoreError(err, OperationType.GET, path);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    throw error;
  }
}

export async function saveAgentTarget(target: AgentTarget): Promise<void> {
  const targetId = target.targetId || buildTargetId(target.agentId, target.year);
  const path = `agent_targets/${targetId}`;
  
  const payload: AgentTarget = {
    ...target,
    targetId,
    overallTargetAce: Number(target.overallTargetAce) || 0,
    overallTargetCases: Number(target.overallTargetCases) || 0,
    overallTargetAcs: Number(target.overallTargetAcs) || 0,
    closingRatio: Number(target.closingRatio) || 25,
    updatedAt: new Date().toISOString()
  };

  try {
    const docRef = doc(db, 'agent_targets', targetId);
    await setDoc(docRef, payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

export function subscribeToAllTargetsForYear(
  year: number,
  onData: (targets: AgentTarget[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const path = 'agent_targets';
  try {
    const colRef = collection(db, path);
    const q = query(colRef, where('year', '==', year));
    return onSnapshot(
      q,
      (snapshot) => {
        const targets = snapshot.docs.map((d) => d.data() as AgentTarget);
        onData(targets);
      },
      (err) => {
        if (onError) onError(err);
        handleFirestoreError(err, OperationType.LIST, path);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    throw error;
  }
}

// -------------------------------------------------------------
// Lead Private Note Services (Lead only)
// -------------------------------------------------------------
export async function getAgentNote(agentId: string): Promise<AgentNote | null> {
  const cleanId = sanitizeDocId(agentId);
  const path = `agent_notes/${cleanId}`;
  try {
    const docRef = doc(db, 'agent_notes', cleanId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as AgentNote;
    }
    return null;
  } catch (error) {
    console.warn('Note fetch bypassed or not permitted:', error);
    return null;
  }
}

export async function saveAgentNote(agentId: string, note: string): Promise<void> {
  const cleanId = sanitizeDocId(agentId);
  const path = `agent_notes/${cleanId}`;
  const payload: AgentNote = {
    agentId,
    note,
    updatedAt: new Date().toISOString()
  };
  try {
    const docRef = doc(db, 'agent_notes', cleanId);
    await setDoc(docRef, payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}
