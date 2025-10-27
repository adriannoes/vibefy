import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  FileText,
  Users,
  BarChart3,
  Calendar,
  Target,
  Lightbulb,
  CheckSquare,
  Zap,
  Plus,
  Search,
  Filter,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
    icon?: React.ComponentType<{ className?: string }>;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
    icon?: React.ComponentType<{ className?: string }>;
  };
  illustration?: 'board' | 'projects' | 'reports' | 'sprints' | 'roadmap' | 'prioritization' | 'okrs' | 'feedback' | 'search' | 'filter';
  className?: string;
  compact?: boolean;
}

// SVG Illustrations for different empty states
const BoardIllustration = () => (
  <svg
    className="w-32 h-32 mx-auto text-muted-foreground/30"
    viewBox="0 0 128 128"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="20" y="30" width="88" height="68" rx="4" stroke="currentColor" strokeWidth="2" fill="none"/>
    <rect x="30" y="45" width="25" height="8" rx="2" fill="currentColor" opacity="0.3"/>
    <rect x="30" y="60" width="20" height="8" rx="2" fill="currentColor" opacity="0.3"/>
    <rect x="30" y="75" width="15" height="8" rx="2" fill="currentColor" opacity="0.3"/>
    <rect x="73" y="45" width="25" height="8" rx="2" fill="currentColor" opacity="0.3"/>
    <rect x="73" y="60" width="20" height="8" rx="2" fill="currentColor" opacity="0.3"/>
    <rect x="73" y="75" width="15" height="8" rx="2" fill="currentColor" opacity="0.3"/>
    <circle cx="45" cy="70" r="2" fill="currentColor" opacity="0.5"/>
    <circle cx="89" cy="70" r="2" fill="currentColor" opacity="0.5"/>
  </svg>
);

const ProjectsIllustration = () => (
  <svg
    className="w-32 h-32 mx-auto text-muted-foreground/30"
    viewBox="0 0 128 128"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="25" y="35" width="78" height="58" rx="4" stroke="currentColor" strokeWidth="2" fill="none"/>
    <rect x="35" y="50" width="58" height="6" rx="1" fill="currentColor" opacity="0.3"/>
    <rect x="35" y="65" width="40" height="6" rx="1" fill="currentColor" opacity="0.3"/>
    <rect x="35" y="75" width="30" height="6" rx="1" fill="currentColor" opacity="0.3"/>
    <circle cx="75" cy="70" r="8" stroke="currentColor" strokeWidth="2" fill="none"/>
    <path d="M70 70 L73 73 L80 66" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ReportsIllustration = () => (
  <svg
    className="w-32 h-32 mx-auto text-muted-foreground/30"
    viewBox="0 0 128 128"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="20" y="30" width="88" height="68" rx="4" stroke="currentColor" strokeWidth="2" fill="none"/>
    <rect x="30" y="45" width="68" height="4" fill="currentColor" opacity="0.3"/>
    <rect x="30" y="55" width="50" height="4" fill="currentColor" opacity="0.3"/>
    <rect x="30" y="65" width="60" height="4" fill="currentColor" opacity="0.3"/>
    <rect x="30" y="75" width="40" height="4" fill="currentColor" opacity="0.3"/>
    <rect x="30" y="85" width="55" height="4" fill="currentColor" opacity="0.3"/>
    {/* Chart bars */}
    <rect x="45" y="50" width="6" height="25" fill="currentColor" opacity="0.4"/>
    <rect x="55" y="45" width="6" height="30" fill="currentColor" opacity="0.4"/>
    <rect x="65" y="55" width="6" height="20" fill="currentColor" opacity="0.4"/>
    <rect x="75" y="50" width="6" height="25" fill="currentColor" opacity="0.4"/>
  </svg>
);

const SearchIllustration = () => (
  <svg
    className="w-32 h-32 mx-auto text-muted-foreground/30"
    viewBox="0 0 128 128"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="55" cy="55" r="25" stroke="currentColor" strokeWidth="2" fill="none"/>
    <path d="M70 70 L85 85" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="55" cy="55" r="8" fill="currentColor" opacity="0.1"/>
    <text x="55" y="60" textAnchor="middle" fontSize="12" fill="currentColor" opacity="0.5">?</text>
  </svg>
);

const getIllustration = (type?: string) => {
  switch (type) {
    case 'board':
      return <BoardIllustration />;
    case 'projects':
      return <ProjectsIllustration />;
    case 'reports':
      return <ReportsIllustration />;
    case 'search':
      return <SearchIllustration />;
    default:
      return null;
  }
};

const getDefaultIcon = (illustration?: string) => {
  switch (illustration) {
    case 'board':
      return FileText;
    case 'projects':
      return Settings;
    case 'reports':
      return BarChart3;
    case 'sprints':
      return Calendar;
    case 'roadmap':
      return Target;
    case 'prioritization':
      return Zap;
    case 'okrs':
      return CheckSquare;
    case 'feedback':
      return Users;
    case 'search':
      return Search;
    case 'filter':
      return Filter;
    default:
      return FileText;
  }
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  illustration,
  className,
  compact = false,
}) => {
  const DefaultIcon = getDefaultIcon(illustration);
  const illustrationComponent = getIllustration(illustration);

  return (
    <Card className={cn("border-dashed", className)}>
      <CardContent className={cn(
        "flex flex-col items-center justify-center text-center p-8",
        compact && "p-6"
      )}>
        {/* Illustration */}
        {illustrationComponent || (
          <div className="rounded-full bg-muted p-4 mb-4">
            {Icon ? <Icon className="h-8 w-8 text-muted-foreground" /> : <DefaultIcon className="h-8 w-8 text-muted-foreground" />}
          </div>
        )}

        {/* Content */}
        <div className={cn("space-y-2", compact && "space-y-1")}>
          <h3 className={cn("font-semibold", compact ? "text-lg" : "text-xl")}>
            {title}
          </h3>
          <p className={cn("text-muted-foreground max-w-md", compact && "text-sm")}>
            {description}
          </p>
        </div>

        {/* Actions */}
        {(action || secondaryAction) && (
          <div className={cn("flex gap-2 mt-6", compact && "mt-4")}>
            {action && (
              <Button
                onClick={action.onClick}
                variant={action.variant || 'default'}
                className="flex items-center gap-2"
              >
                {action.icon && <action.icon className="h-4 w-4" />}
                {action.label}
              </Button>
            )}
            {secondaryAction && (
              <Button
                onClick={secondaryAction.onClick}
                variant={secondaryAction.variant || 'outline'}
                className="flex items-center gap-2"
              >
                {secondaryAction.icon && <secondaryAction.icon className="h-4 w-4" />}
                {secondaryAction.label}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Specialized empty state components for common use cases
export const EmptyBoard: React.FC<{ onCreateIssue?: () => void; className?: string }> = ({
  onCreateIssue,
  className
}) => (
  <EmptyState
    title="No issues yet"
    description="Get started by creating your first issue. You can also drag and drop issues between columns to track progress."
    illustration="board"
    action={onCreateIssue ? {
      label: "Create Issue",
      onClick: onCreateIssue,
      icon: Plus
    } : undefined}
    className={className}
  />
);

export const EmptyProjects: React.FC<{ onCreateProject?: () => void; className?: string }> = ({
  onCreateProject,
  className
}) => (
  <EmptyState
    title="No projects yet"
    description="Create your first project to start organizing your work and collaborating with your team."
    illustration="projects"
    action={onCreateProject ? {
      label: "Create Project",
      onClick: onCreateProject,
      icon: Plus
    } : undefined}
    className={className}
  />
);

export const EmptyReports: React.FC<{ className?: string }> = ({ className }) => (
  <EmptyState
    title="No data to display"
    description="Reports will appear here once you have issues and activity in your projects."
    illustration="reports"
    className={className}
  />
);

export const EmptySearch: React.FC<{ onClearFilters?: () => void; className?: string }> = ({
  onClearFilters,
  className
}) => (
  <EmptyState
    title="No results found"
    description="Try adjusting your search terms or filters to find what you're looking for."
    illustration="search"
    secondaryAction={onClearFilters ? {
      label: "Clear Filters",
      onClick: onClearFilters,
      variant: "outline" as const,
      icon: Filter
    } : undefined}
    className={className}
  />
);

export const EmptyFeedback: React.FC<{ onCreateFeedback?: () => void; className?: string }> = ({
  onCreateFeedback,
  className
}) => (
  <EmptyState
    title="No feedback yet"
    description="Start collecting customer feedback to understand their needs and improve your product."
    action={onCreateFeedback ? {
      label: "Add First Feedback",
      onClick: onCreateFeedback,
      icon: Plus
    } : undefined}
    className={className}
  />
);

export const EmptyHypothesis: React.FC<{ onCreateHypothesis?: () => void; className?: string }> = ({
  onCreateHypothesis,
  className
}) => (
  <EmptyState
    title="No hypotheses yet"
    description="Start your scientific journey by creating your first hypothesis to test with experiments."
    illustration="search"
    action={onCreateHypothesis ? {
      label: "Create First Hypothesis",
      onClick: onCreateHypothesis,
      icon: Plus
    } : undefined}
    className={className}
  />
);
