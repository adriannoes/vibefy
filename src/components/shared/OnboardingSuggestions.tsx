import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Map, Target, Zap, BookOpen } from 'lucide-react';
import { useOnboarding } from '@/hooks/useOnboarding';

const tourIcons = {
  welcome: BookOpen,
  roadmap: Map,
  prioritization: Target,
};

const tourColors = {
  welcome: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  roadmap: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  prioritization: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
};

export const OnboardingSuggestions: React.FC = () => {
  const { getAvailableTours, startTour } = useOnboarding();
  const availableTours = getAvailableTours();

  if (availableTours.length === 0) {
    return null;
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Get Started with Vibefy
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Take a guided tour to learn about our features and get the most out of the platform.
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {availableTours.map((tour) => {
            const Icon = tourIcons[tour.id as keyof typeof tourIcons] || BookOpen;
            const colorClass = tourColors[tour.id as keyof typeof tourColors] || 'bg-gray-100 text-gray-800';

            return (
              <Card key={tour.id} className="relative overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-primary" />
                      <Badge variant="secondary" className={colorClass}>
                        {tour.name}
                      </Badge>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {tour.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {tour.steps.length} steps
                    </span>
                    <Button
                      size="sm"
                      onClick={() => startTour(tour.id)}
                      className="flex items-center gap-1"
                    >
                      <Play className="h-3 w-3" />
                      Start Tour
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {availableTours.length > 0 && (
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="h-4 w-4" />
              <span>
                <strong>Pro tip:</strong> You can also access tours anytime from the Help menu or by pressing ⌘/
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
