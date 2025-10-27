import { useState, useEffect } from 'react';
import { Roadmap, RoadmapItem, RoadmapQuarter, RoadmapDependency } from '@/types/roadmap';
import { Feature } from '@/types/product';
import { useAuth } from './useAuth';

// Mock data - will be replaced with Supabase queries
const mockRoadmaps: Roadmap[] = [
  {
    id: '1',
    product_id: '1',
    name: 'Q1 2024 Product Roadmap',
    description: 'Key features and initiatives for Q1 2024',
    view_type: 'timeline',
    is_public: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    owner_id: 'user1',
  },
];

const mockRoadmapItems: RoadmapItem[] = [
  {
    id: '1',
    roadmap_id: '1',
    item_type: 'feature',
    item_id: 'feature-1',
    title: 'User Authentication',
    description: 'Complete authentication system with SSO',
    start_date: '2024-01-01',
    end_date: '2024-01-15',
    quarter: 'Q1 2024',
    category: 'now',
    dependencies: [],
    confidence: 'high',
    business_value: 9,
    effort_estimate: 'm',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    roadmap_id: '1',
    item_type: 'feature',
    item_id: 'feature-2',
    title: 'Real-time Collaboration',
    description: 'Live updates and presence indicators',
    start_date: '2024-01-16',
    end_date: '2024-02-15',
    quarter: 'Q1 2024',
    category: 'now',
    dependencies: ['1'],
    confidence: 'medium',
    business_value: 8,
    effort_estimate: 'l',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    roadmap_id: '1',
    item_type: 'feature',
    item_id: 'feature-3',
    title: 'Advanced Analytics',
    description: 'Comprehensive reporting and insights',
    start_date: '2024-02-16',
    end_date: '2024-03-31',
    quarter: 'Q1 2024',
    category: 'next',
    dependencies: ['2'],
    confidence: 'high',
    business_value: 7,
    effort_estimate: 'xl',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const mockQuarters: RoadmapQuarter[] = [
  {
    id: '1',
    roadmap_id: '1',
    quarter: 'Q1 2024',
    year: 2024,
    start_date: '2024-01-01',
    end_date: '2024-03-31',
    goals: ['Launch core features', 'Establish user base', 'Gather feedback'],
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    roadmap_id: '1',
    quarter: 'Q2 2024',
    year: 2024,
    start_date: '2024-04-01',
    end_date: '2024-06-30',
    goals: ['Scale platform', 'Add integrations', 'Mobile app'],
    created_at: new Date().toISOString(),
  },
];

export const useRoadmap = (productId: string) => {
  const { user } = useAuth();
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [roadmapItems, setRoadmapItems] = useState<RoadmapItem[]>([]);
  const [quarters, setQuarters] = useState<RoadmapQuarter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const loadData = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      setRoadmaps(mockRoadmaps);
      setRoadmapItems(mockRoadmapItems);
      setQuarters(mockQuarters);
      setLoading(false);
    };

    loadData();
  }, [productId]);

  const createRoadmap = async (roadmapData: Omit<Roadmap, 'id' | 'created_at' | 'updated_at'>) => {
    const newRoadmap: Roadmap = {
      ...roadmapData,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setRoadmaps(prev => [...prev, newRoadmap]);
    return newRoadmap;
  };

  const updateRoadmap = async (roadmapId: string, updates: Partial<Roadmap>) => {
    setRoadmaps(prev => 
      prev.map(roadmap => 
        roadmap.id === roadmapId 
          ? { ...roadmap, ...updates, updated_at: new Date().toISOString() }
          : roadmap
      )
    );
  };

  const deleteRoadmap = async (roadmapId: string) => {
    setRoadmaps(prev => prev.filter(roadmap => roadmap.id !== roadmapId));
    setRoadmapItems(prev => prev.filter(item => item.roadmap_id !== roadmapId));
  };

  const createRoadmapItem = async (itemData: Omit<RoadmapItem, 'id' | 'created_at' | 'updated_at'>) => {
    const newItem: RoadmapItem = {
      ...itemData,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setRoadmapItems(prev => [...prev, newItem]);
    return newItem;
  };

  const updateRoadmapItem = async (itemId: string, updates: Partial<RoadmapItem>) => {
    setRoadmapItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, ...updates, updated_at: new Date().toISOString() }
          : item
      )
    );
  };

  const deleteRoadmapItem = async (itemId: string) => {
    setRoadmapItems(prev => prev.filter(item => item.id !== itemId));
  };

  const moveRoadmapItem = async (itemId: string, newCategory: 'now' | 'next' | 'later', newQuarter?: string) => {
    await updateRoadmapItem(itemId, { 
      category: newCategory,
      quarter: newQuarter 
    });
  };

  const getRoadmapItemsByCategory = (category: 'now' | 'next' | 'later') => {
    return roadmapItems.filter(item => item.category === category);
  };

  const getRoadmapItemsByQuarter = (quarter: string) => {
    return roadmapItems.filter(item => item.quarter === quarter);
  };

  return {
    roadmaps,
    roadmapItems,
    quarters,
    loading,
    createRoadmap,
    updateRoadmap,
    deleteRoadmap,
    createRoadmapItem,
    updateRoadmapItem,
    deleteRoadmapItem,
    moveRoadmapItem,
    getRoadmapItemsByCategory,
    getRoadmapItemsByQuarter,
  };
};
