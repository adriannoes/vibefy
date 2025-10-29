import React from 'react';
import { DashboardManager } from '@/components/dashboard/DashboardManager';
import { useFeedback } from '@/hooks/useFeedback';

export const DashboardPage: React.FC = () => {
  const { data: feedback = [], isLoading } = useFeedback();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando dashboards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <DashboardManager
        feedback={feedback}
        onFeedbackChange={() => {
          // Invalidate feedback queries if needed
        }}
      />
    </div>
  );
};
