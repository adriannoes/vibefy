import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import ProjectCard from '@/components/projects/ProjectCard';
import CreateProjectDialog from '@/components/projects/CreateProjectDialog';
import { AppHeader } from '@/components/shared/AppHeader';
import { OnboardingSuggestions } from '@/components/shared/OnboardingSuggestions';
import { EmptyProjects } from '@/components/shared/EmptyState';

// Mock data - will be replaced with real data from Supabase
const mockProjects = [
  {
    id: '1',
    name: 'Vibefy Platform',
    key: 'VBF',
    description: 'Main platform development',
    status: 'active' as const,
    created_at: new Date().toISOString(),
    organization_id: '1',
  },
  {
    id: '2',
    name: 'Mobile App',
    key: 'MOB',
    description: 'Mobile application for iOS and Android',
    status: 'active' as const,
    created_at: new Date().toISOString(),
    organization_id: '1',
  },
];

const ProjectList: React.FC = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <OnboardingSuggestions />
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Projects</h1>
          <p className="text-muted-foreground">
            Manage your projects and track progress
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>

        {mockProjects.length === 0 && (
          <EmptyProjects onCreateProject={() => setIsCreateDialogOpen(true)} />
        )}
      </main>

      <CreateProjectDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={(project) => {
          console.log('Creating project:', project);
          setIsCreateDialogOpen(false);
        }}
      />
    </div>
  );
};

export default ProjectList;
