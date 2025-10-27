import { useState, useEffect } from 'react';
import { Objective, KeyResult, OKRUpdate, OKRCheckIn, OKRHealth } from '@/types/okr';
import { useAuth } from './useAuth';

// Mock data - will be replaced with Supabase queries
const mockObjectives: Objective[] = [
  {
    id: '1',
    organization_id: 'org1',
    level: 'company',
    title: 'Increase user engagement',
    description: 'Drive deeper user engagement across all products',
    status: 'active',
    quarter: 'Q1 2024',
    year: 2024,
    confidence: 85,
    progress: 65,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    owner_id: 'user1',
  },
  {
    id: '2',
    product_id: '1',
    level: 'team',
    title: 'Improve product performance',
    description: 'Enhance product speed and reliability',
    status: 'active',
    quarter: 'Q1 2024',
    year: 2024,
    confidence: 90,
    progress: 45,
    parent_objective_id: '1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    owner_id: 'user2',
  },
  {
    id: '3',
    user_id: 'user3',
    level: 'individual',
    title: 'Complete product certification',
    description: 'Get certified in product management methodologies',
    status: 'active',
    quarter: 'Q1 2024',
    year: 2024,
    confidence: 95,
    progress: 80,
    parent_objective_id: '2',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    owner_id: 'user3',
  },
];

const mockKeyResults: KeyResult[] = [
  {
    id: '1',
    objective_id: '1',
    title: 'Increase daily active users by 25%',
    description: 'Grow DAU from 10K to 12.5K',
    type: 'percentage',
    target_value: 25,
    current_value: 18,
    unit: '%',
    status: 'active',
    confidence: 85,
    progress: 72,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    owner_id: 'user1',
  },
  {
    id: '2',
    objective_id: '1',
    title: 'Achieve 4.5+ app store rating',
    description: 'Improve user satisfaction scores',
    type: 'number',
    target_value: 4.5,
    current_value: 4.2,
    unit: 'stars',
    status: 'active',
    confidence: 80,
    progress: 93,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    owner_id: 'user1',
  },
  {
    id: '3',
    objective_id: '2',
    title: 'Reduce page load time by 50%',
    description: 'Optimize performance metrics',
    type: 'percentage',
    target_value: 50,
    current_value: 30,
    unit: '%',
    status: 'active',
    confidence: 90,
    progress: 60,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    owner_id: 'user2',
  },
];

const mockUpdates: OKRUpdate[] = [
  {
    id: '1',
    objective_id: '1',
    content: 'Great progress on user engagement initiatives. Mobile app updates showing positive results.',
    confidence: 85,
    progress: 65,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    author_id: 'user1',
  },
];

const mockCheckIns: OKRCheckIn[] = [
  {
    id: '1',
    objective_id: '1',
    content: 'Weekly check-in: On track to meet Q1 goals. Key initiatives launched successfully.',
    confidence: 85,
    progress: 65,
    blockers: 'None',
    next_actions: 'Continue user acquisition campaigns',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    author_id: 'user1',
  },
];

export const useOKRs = (organizationId?: string, productId?: string, userId?: string) => {
  const { user } = useAuth();
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [keyResults, setKeyResults] = useState<KeyResult[]>([]);
  const [updates, setUpdates] = useState<OKRUpdate[]>([]);
  const [checkIns, setCheckIns] = useState<OKRCheckIn[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Filter objectives based on context
      let filteredObjectives = mockObjectives;
      if (organizationId) {
        filteredObjectives = mockObjectives.filter(obj => obj.organization_id === organizationId);
      } else if (productId) {
        filteredObjectives = mockObjectives.filter(obj => obj.product_id === productId);
      } else if (userId) {
        filteredObjectives = mockObjectives.filter(obj => obj.user_id === userId);
      }
      
      setObjectives(filteredObjectives);
      setKeyResults(mockKeyResults);
      setUpdates(mockUpdates);
      setCheckIns(mockCheckIns);
      setLoading(false);
    };

    loadData();
  }, [organizationId, productId, userId]);

  const createObjective = async (objectiveData: Omit<Objective, 'id' | 'created_at' | 'updated_at'>) => {
    const newObjective: Objective = {
      ...objectiveData,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setObjectives(prev => [...prev, newObjective]);
    return newObjective;
  };

  const updateObjective = async (objectiveId: string, updates: Partial<Objective>) => {
    setObjectives(prev => 
      prev.map(obj => 
        obj.id === objectiveId 
          ? { ...obj, ...updates, updated_at: new Date().toISOString() }
          : obj
      )
    );
  };

  const deleteObjective = async (objectiveId: string) => {
    setObjectives(prev => prev.filter(obj => obj.id !== objectiveId));
    setKeyResults(prev => prev.filter(kr => kr.objective_id !== objectiveId));
  };

  const createKeyResult = async (keyResultData: Omit<KeyResult, 'id' | 'created_at' | 'updated_at'>) => {
    const newKeyResult: KeyResult = {
      ...keyResultData,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setKeyResults(prev => [...prev, newKeyResult]);
    return newKeyResult;
  };

  const updateKeyResult = async (keyResultId: string, updates: Partial<KeyResult>) => {
    setKeyResults(prev => 
      prev.map(kr => 
        kr.id === keyResultId 
          ? { ...kr, ...updates, updated_at: new Date().toISOString() }
          : kr
      )
    );
  };

  const deleteKeyResult = async (keyResultId: string) => {
    setKeyResults(prev => prev.filter(kr => kr.id !== keyResultId));
  };

  const addUpdate = async (updateData: Omit<OKRUpdate, 'id' | 'created_at' | 'updated_at'>) => {
    const newUpdate: OKRUpdate = {
      ...updateData,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setUpdates(prev => [...prev, newUpdate]);
    return newUpdate;
  };

  const addCheckIn = async (checkInData: Omit<OKRCheckIn, 'id' | 'created_at'>) => {
    const newCheckIn: OKRCheckIn = {
      ...checkInData,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
    };
    setCheckIns(prev => [...prev, newCheckIn]);
    return newCheckIn;
  };

  const getObjectivesByLevel = (level: 'company' | 'team' | 'individual') => {
    return objectives.filter(obj => obj.level === level);
  };

  const getKeyResultsByObjective = (objectiveId: string) => {
    return keyResults.filter(kr => kr.objective_id === objectiveId);
  };

  const getUpdatesByObjective = (objectiveId: string) => {
    return updates.filter(update => update.objective_id === objectiveId);
  };

  const getCheckInsByObjective = (objectiveId: string) => {
    return checkIns.filter(checkIn => checkIn.objective_id === objectiveId);
  };

  const calculateObjectiveProgress = (objectiveId: string) => {
    const objectiveKeyResults = getKeyResultsByObjective(objectiveId);
    if (objectiveKeyResults.length === 0) return 0;
    
    const totalProgress = objectiveKeyResults.reduce((sum, kr) => sum + kr.progress, 0);
    return Math.round(totalProgress / objectiveKeyResults.length);
  };

  const getOKRHealth = (objectiveId: string): OKRHealth => {
    const objective = objectives.find(obj => obj.id === objectiveId);
    if (!objective) {
      return {
        objective_id: objectiveId,
        status: 'off_track',
        last_updated: new Date().toISOString(),
        confidence_trend: 'decreasing',
        progress_trend: 'behind',
      };
    }

    const progress = calculateObjectiveProgress(objectiveId);
    const confidence = objective.confidence;

    let status: 'on_track' | 'at_risk' | 'off_track';
    if (progress >= 80 && confidence >= 80) {
      status = 'on_track';
    } else if (progress >= 50 && confidence >= 60) {
      status = 'at_risk';
    } else {
      status = 'off_track';
    }

    return {
      objective_id: objectiveId,
      status,
      last_updated: objective.updated_at,
      confidence_trend: confidence >= 80 ? 'increasing' : confidence >= 60 ? 'stable' : 'decreasing',
      progress_trend: progress >= 80 ? 'ahead' : progress >= 50 ? 'on_track' : 'behind',
    };
  };

  return {
    objectives,
    keyResults,
    updates,
    checkIns,
    loading,
    createObjective,
    updateObjective,
    deleteObjective,
    createKeyResult,
    updateKeyResult,
    deleteKeyResult,
    addUpdate,
    addCheckIn,
    getObjectivesByLevel,
    getKeyResultsByObjective,
    getUpdatesByObjective,
    getCheckInsByObjective,
    calculateObjectiveProgress,
    getOKRHealth,
  };
};
