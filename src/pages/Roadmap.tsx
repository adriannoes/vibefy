import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRoadmap } from '@/hooks/useRoadmap';
import RoadmapTimeline from '@/components/roadmap/RoadmapTimeline';
import QuarterView from '@/components/roadmap/QuarterView';
import { RoadmapItem, RoadmapView } from '@/types/roadmap';
import { 
  Plus, 
  Calendar, 
  BarChart3, 
  Settings,
  ArrowLeft,
  Sparkles,
  User,
  LogOut
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const Roadmap: React.FC = () => {
  const { user, signOut } = useAuth();
  const productId = '1'; // Mock - will be derived from route params
  const [viewType, setViewType] = useState<RoadmapView>('timeline');
  const [editingItem, setEditingItem] = useState<RoadmapItem | undefined>();
  
  const {
    roadmaps,
    roadmapItems,
    quarters,
    loading,
    createRoadmapItem,
    updateRoadmapItem,
    deleteRoadmapItem,
    moveRoadmapItem,
    getRoadmapItemsByCategory,
  } = useRoadmap(productId);

  const handleCreateItem = async (category: 'now' | 'next' | 'later' | string) => {
    const newItem: Omit<RoadmapItem, 'id' | 'created_at' | 'updated_at'> = {
      roadmap_id: roadmaps[0]?.id || '1',
      item_type: 'feature',
      item_id: `feature-${Date.now()}`,
      title: 'New Feature',
      description: 'Feature description',
      category: category as 'now' | 'next' | 'later',
      quarter: category.includes('Q') ? category : undefined,
      dependencies: [],
      confidence: 'medium',
      business_value: 5,
      effort_estimate: 'm',
    };

    try {
      await createRoadmapItem(newItem);
    } catch (error) {
      console.error('Failed to create roadmap item:', error);
    }
  };

  const handleEditItem = (item: RoadmapItem) => {
    setEditingItem(item);
    // TODO: Open edit dialog
  };

  const handleUpdateItem = async (itemId: string, updates: Partial<RoadmapItem>) => {
    try {
      await updateRoadmapItem(itemId, updates);
      setEditingItem(undefined);
    } catch (error) {
      console.error('Failed to update roadmap item:', error);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteRoadmapItem(itemId);
      } catch (error) {
        console.error('Failed to delete roadmap item:', error);
      }
    }
  };

  const handleMoveItem = async (itemId: string, category: 'now' | 'next' | 'later') => {
    try {
      await moveRoadmapItem(itemId, category);
    } catch (error) {
      console.error('Failed to move roadmap item:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading roadmap...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/projects">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Projects
                </Button>
              </Link>
              <Link to="/" className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                  Vibefy
                </span>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              {user && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>{user.full_name || user.email}</span>
                </div>
              )}
              <Button variant="outline" onClick={signOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Product Roadmap</h1>
          <p className="text-muted-foreground">
            Plan and visualize your product features and initiatives
          </p>
        </div>

        <Tabs value={viewType} onValueChange={(value) => setViewType(value as RoadmapView)} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="timeline" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value="quarterly" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Quarterly
            </TabsTrigger>
            <TabsTrigger value="now_next_later" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Now/Next/Later
            </TabsTrigger>
          </TabsList>

          <TabsContent value="timeline" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Timeline View</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Drag and drop features across time periods
                </p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Timeline View Coming Soon</h3>
                  <p className="text-muted-foreground">
                    Interactive timeline with drag & drop will be available soon
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quarterly" className="space-y-6">
            <QuarterView
              quarters={quarters}
              items={roadmapItems}
              onEditItem={handleEditItem}
              onDeleteItem={handleDeleteItem}
              onCreateItem={handleCreateItem}
            />
          </TabsContent>

          <TabsContent value="now_next_later" className="space-y-6">
            <RoadmapTimeline
              items={roadmapItems}
              onMoveItem={handleMoveItem}
              onEditItem={handleEditItem}
              onDeleteItem={handleDeleteItem}
              onCreateItem={handleCreateItem}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Roadmap;
