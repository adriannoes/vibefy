import { useState, useEffect } from 'react';
import { RICEScore, PrioritizationScore, PrioritizationSession, ValueEffortMatrix } from '@/types/prioritization';
import { Issue } from '@/types/issue';
import { Feature } from '@/types/product';

// Mock data - will be replaced with Supabase queries
const mockPrioritizationScores: PrioritizationScore[] = [
  {
    id: '1',
    item_id: 'issue-1',
    item_type: 'issue',
    method: 'rice',
    rice_score: {
      reach: 8,
      impact: 3,
      confidence: 80,
      effort: 5,
      score: 38.4, // (8 × 3 × 80) ÷ 5
    },
    rank: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    scorer_id: 'user1',
  },
  {
    id: '2',
    item_id: 'issue-2',
    item_type: 'issue',
    method: 'rice',
    rice_score: {
      reach: 6,
      impact: 2,
      confidence: 90,
      effort: 3,
      score: 36, // (6 × 2 × 90) ÷ 3
    },
    rank: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    scorer_id: 'user1',
  },
];

const mockSessions: PrioritizationSession[] = [
  {
    id: '1',
    product_id: '1',
    name: 'Q1 2024 Feature Prioritization',
    description: 'Prioritizing features for Q1 2024 roadmap',
    method: 'rice',
    participants: ['user1', 'user2', 'user3'],
    items: ['issue-1', 'issue-2', 'issue-3'],
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    owner_id: 'user1',
  },
];

export const usePrioritization = (productId: string) => {
  const [scores, setScores] = useState<PrioritizationScore[]>([]);
  const [sessions, setSessions] = useState<PrioritizationSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      setScores(mockPrioritizationScores);
      setSessions(mockSessions);
      setLoading(false);
    };

    loadData();
  }, [productId]);

  const calculateRICEScore = (reach: number, impact: number, confidence: number, effort: number): RICEScore => {
    const score = (reach * impact * confidence) / effort;
    return {
      reach,
      impact,
      confidence,
      effort,
      score: Math.round(score * 100) / 100,
    };
  };

  const calculateValueEffortMatrix = (value: number, effort: number): ValueEffortMatrix => {
    const valueLevel: 'low' | 'medium' | 'high' | 'critical' = 
      value >= 8 ? 'critical' : value >= 6 ? 'high' : value >= 4 ? 'medium' : 'low';
    
    const effortLevel: 'xs' | 's' | 'm' | 'l' | 'xl' = 
      effort <= 2 ? 'xs' : effort <= 4 ? 's' : effort <= 6 ? 'm' : effort <= 8 ? 'l' : 'xl';

    let quadrant: 'quick_wins' | 'major_projects' | 'fill_ins' | 'questionable';
    if (valueLevel === 'high' || valueLevel === 'critical') {
      quadrant = effortLevel === 'xs' || effortLevel === 's' ? 'quick_wins' : 'major_projects';
    } else {
      quadrant = effortLevel === 'xs' || effortLevel === 's' ? 'fill_ins' : 'questionable';
    }

    return {
      value: valueLevel,
      effort: effortLevel,
      quadrant,
    };
  };

  const scoreItem = async (
    itemId: string,
    itemType: 'feature' | 'issue' | 'initiative',
    method: 'rice' | 'value_effort' | 'custom',
    data: RICEScore | ValueEffortMatrix | number
  ) => {
    const newScore: PrioritizationScore = {
      id: Date.now().toString(),
      item_id: itemId,
      item_type: itemType,
      method,
      rice_score: method === 'rice' ? data as RICEScore : undefined,
      value_effort: method === 'value_effort' ? data as ValueEffortMatrix : undefined,
      custom_score: method === 'custom' ? data as number : undefined,
      rank: 0, // Will be calculated
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      scorer_id: 'user1', // Mock - will be from auth context
    };

    setScores(prev => [...prev, newScore]);
    await recalculateRanks();
    return newScore;
  };

  const recalculateRanks = async () => {
    setScores(prev => {
      const sortedScores = [...prev].sort((a, b) => {
        const scoreA = a.rice_score?.score || a.custom_score || 0;
        const scoreB = b.rice_score?.score || b.custom_score || 0;
        return scoreB - scoreA;
      });

      return sortedScores.map((score, index) => ({
        ...score,
        rank: index + 1,
      }));
    });
  };

  const createSession = async (sessionData: Omit<PrioritizationSession, 'id' | 'created_at' | 'updated_at'>) => {
    const newSession: PrioritizationSession = {
      ...sessionData,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setSessions(prev => [...prev, newSession]);
    return newSession;
  };

  const updateSession = async (sessionId: string, updates: Partial<PrioritizationSession>) => {
    setSessions(prev => 
      prev.map(session => 
        session.id === sessionId 
          ? { ...session, ...updates, updated_at: new Date().toISOString() }
          : session
      )
    );
  };

  const deleteSession = async (sessionId: string) => {
    setSessions(prev => prev.filter(session => session.id !== sessionId));
  };

  const getScoresByMethod = (method: 'rice' | 'value_effort' | 'custom') => {
    return scores.filter(score => score.method === method);
  };

  const getTopItems = (limit: number = 10) => {
    return scores
      .sort((a, b) => a.rank - b.rank)
      .slice(0, limit);
  };

  const getItemsByQuadrant = (quadrant: 'quick_wins' | 'major_projects' | 'fill_ins' | 'questionable') => {
    return scores.filter(score => 
      score.value_effort?.quadrant === quadrant
    );
  };

  return {
    scores,
    sessions,
    loading,
    calculateRICEScore,
    calculateValueEffortMatrix,
    scoreItem,
    recalculateRanks,
    createSession,
    updateSession,
    deleteSession,
    getScoresByMethod,
    getTopItems,
    getItemsByQuadrant,
  };
};
