import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Filter, Search } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useIssues } from "@/hooks/useIssues";
import { useBoardFilters } from "@/hooks/useBoardFilters";
import { useRealtimeIssues } from "@/hooks/useRealtimeIssues";
import KanbanBoard from "@/components/board/KanbanBoard";
import FilterBar from "@/components/board/FilterBar";
import SearchBar from "@/components/board/SearchBar";
import TaskDialog from "@/components/TaskDialog";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { PresenceAvatars } from "@/components/shared/PresenceAvatars";
import { CommandPalette } from "@/components/shared/CommandPalette";
import { AppHeader } from "@/components/shared/AppHeader";
import { EmptyBoard } from "@/components/shared/EmptyState";
import { Issue } from "@/types/issue";

const Board = () => {
  const { user, signOut } = useAuth();
  const { filters } = useBoardFilters();
  const { issues, loading, createIssue, updateIssue, deleteIssue, refetchIssues } = useIssues('1', filters);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIssue, setEditingIssue] = useState<Issue | undefined>();

  // Real-time issue handlers
  const handleIssueUpdate = useCallback((updatedIssue: Issue) => {
    // The useIssues hook will handle the update automatically
    console.log('Issue updated in real-time:', updatedIssue);
  }, []);

  const handleIssueCreate = useCallback((newIssue: Issue) => {
    // The useIssues hook will handle the creation automatically
    console.log('Issue created in real-time:', newIssue);
  }, []);

  const handleIssueDelete = useCallback((issueId: string) => {
    // The useIssues hook will handle the deletion automatically
    console.log('Issue deleted in real-time:', issueId);
  }, []);

  // Set up real-time subscriptions
  useRealtimeIssues({
    projectId: '1',
    onIssueUpdate: handleIssueUpdate,
    onIssueCreate: handleIssueCreate,
    onIssueDelete: handleIssueDelete
  });

  const handleCreateIssue = async (issueData: Omit<Issue, "id" | "issue_number" | "created_at" | "updated_at">) => {
    try {
      await createIssue(issueData);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Failed to create issue:', error);
    }
  };

  const handleUpdateIssue = async (issueId: string, updates: Partial<Issue>) => {
    try {
      await updateIssue(issueId, updates);
      setEditingIssue(undefined);
    } catch (error) {
      console.error('Failed to update issue:', error);
    }
  };

  const handleDeleteIssue = async (issueId: string) => {
    try {
      await deleteIssue(issueId);
      setEditingIssue(undefined);
    } catch (error) {
      console.error('Failed to delete issue:', error);
    }
  };

  const handleEditIssue = (issue: Issue) => {
    setEditingIssue(issue);
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      {/* Presence indicators and quick actions */}
      <div className="border-b bg-card/30" data-onboarding="quick-actions">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <PresenceAvatars projectId="1" />
              <NotificationBell />
            </div>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Issue
            </Button>
          </div>
        </div>
      </div>

      {/* Board */}
      <main className="container mx-auto px-4 py-8" data-onboarding="board">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Project Board</h1>
          <p className="text-muted-foreground">
            Manage your issues and track progress
          </p>
        </div>

        {/* Filters and Search */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <SearchBar className="w-full" />
            </div>
            <FilterBar />
          </div>
        </div>

        {/* Kanban Board */}
        {issues.length === 0 && !loading ? (
          <EmptyBoard onCreateIssue={() => setIsDialogOpen(true)} />
        ) : (
          <KanbanBoard
            issues={issues}
            onUpdateIssue={handleUpdateIssue}
            onIssueClick={handleEditIssue}
            loading={loading}
          />
        )}
      </main>

      <TaskDialog
        open={isDialogOpen || !!editingIssue}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingIssue(undefined);
        }}
        onSubmit={editingIssue ? 
          (issue) => handleUpdateIssue(editingIssue.id, issue) : 
          handleCreateIssue
        }
        onDelete={editingIssue ? () => handleDeleteIssue(editingIssue.id) : undefined}
        initialData={editingIssue}
      />

      {/* Command Palette */}
      <CommandPalette />
    </div>
  );
};

export default Board;
