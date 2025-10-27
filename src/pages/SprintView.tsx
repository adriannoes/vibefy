import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus, Sparkles, LogOut, User, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSprints } from '@/hooks/useSprints';
import { useIssues } from '@/hooks/useIssues';
import SprintList from '@/components/sprints/SprintList';
import CreateSprintDialog from '@/components/sprints/CreateSprintDialog';
import BurndownChart from '@/components/sprints/BurndownChart';
import VelocityChart from '@/components/sprints/VelocityChart';
import SprintMetrics from '@/components/sprints/SprintMetrics';
import { Sprint } from '@/types/sprint';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const SprintView: React.FC = () => {
  const { user, signOut } = useAuth();
  const { projectKey } = useParams<{ projectKey: string }>();
  const projectId = '1'; // Mock - will be derived from projectKey
  
  const { 
    sprints, 
    loading, 
    createSprint, 
    updateSprint, 
    deleteSprint,
    startSprint,
    completeSprint,
    getActiveSprint,
  } = useSprints(projectId);
  
  const { issues } = useIssues(projectId);
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingSprint, setEditingSprint] = useState<Sprint | undefined>();
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null);

  const activeSprint = getActiveSprint();

  const handleCreateSprint = async (sprintData: Omit<Sprint, 'id' | 'created_at'>) => {
    try {
      await createSprint(sprintData);
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Failed to create sprint:', error);
    }
  };

  const handleUpdateSprint = async (sprintData: Omit<Sprint, 'id' | 'created_at'>) => {
    if (!editingSprint) return;
    try {
      await updateSprint(editingSprint.id, sprintData);
      setEditingSprint(undefined);
    } catch (error) {
      console.error('Failed to update sprint:', error);
    }
  };

  const handleDeleteSprint = async (sprintId: string) => {
    if (confirm('Are you sure you want to delete this sprint?')) {
      try {
        await deleteSprint(sprintId);
      } catch (error) {
        console.error('Failed to delete sprint:', error);
      }
    }
  };

  const handleStartSprint = async (sprintId: string) => {
    try {
      await startSprint(sprintId);
    } catch (error) {
      console.error('Failed to start sprint:', error);
    }
  };

  const handleCompleteSprint = async (sprintId: string) => {
    if (confirm('Complete this sprint? Incomplete issues can be moved to the next sprint.')) {
      try {
        await completeSprint(sprintId);
      } catch (error) {
        console.error('Failed to complete sprint:', error);
      }
    }
  };

  const handleViewSprint = (sprint: Sprint) => {
    setSelectedSprint(sprint);
  };

  // Calculate metrics for active sprint
  const totalPoints = activeSprint ? 55 : 0; // Mock data
  const completedPoints = activeSprint ? 35 : 0;
  const inProgressPoints = activeSprint ? 12 : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to={`/project/${projectKey}/board`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Board
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
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New Sprint
              </Button>
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
          <h1 className="text-3xl font-bold mb-2">Sprint Management</h1>
          <p className="text-muted-foreground">
            Plan and track your sprints
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sprints">All Sprints</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {activeSprint ? (
              <>
                <div>
                  <h2 className="text-2xl font-bold mb-4">Active Sprint: {activeSprint.name}</h2>
                  {activeSprint.goal && (
                    <p className="text-muted-foreground mb-6">{activeSprint.goal}</p>
                  )}
                </div>

                <SprintMetrics
                  sprint={activeSprint}
                  totalPoints={totalPoints}
                  completedPoints={completedPoints}
                  inProgressPoints={inProgressPoints}
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <BurndownChart sprintId={activeSprint.id} />
                  <VelocityChart projectId={projectId} />
                </div>
              </>
            ) : (
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <h3 className="text-lg font-semibold mb-2">No Active Sprint</h3>
                <p className="text-muted-foreground mb-4">
                  Start a sprint to begin tracking progress
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Sprint
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="sprints">
            <SprintList
              sprints={sprints}
              onStartSprint={handleStartSprint}
              onCompleteSprint={handleCompleteSprint}
              onEditSprint={setEditingSprint}
              onDeleteSprint={handleDeleteSprint}
              onViewSprint={handleViewSprint}
            />
          </TabsContent>

          <TabsContent value="metrics" className="space-y-6">
            <VelocityChart projectId={projectId} />
            {activeSprint && <BurndownChart sprintId={activeSprint.id} />}
          </TabsContent>
        </Tabs>
      </main>

      <CreateSprintDialog
        open={isCreateDialogOpen || !!editingSprint}
        onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) setEditingSprint(undefined);
        }}
        onSubmit={editingSprint ? handleUpdateSprint : handleCreateSprint}
        initialData={editingSprint}
        projectId={projectId}
      />
    </div>
  );
};

export default SprintView;
