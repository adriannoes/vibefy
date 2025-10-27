export interface OnboardingStep {
  id: string;
  title: string;
  content: string;
  target: string; // CSS selector
  placement: 'top' | 'bottom' | 'left' | 'right' | 'center';
  disableInteraction?: boolean;
  spotlightClicks?: boolean;
  hideCloseButton?: boolean;
  hideFooter?: boolean;
}

export interface OnboardingTour {
  id: string;
  name: string;
  description: string;
  steps: OnboardingStep[];
  requiredRole?: string;
  completedBy?: string[];
  version: number;
}

export interface OnboardingState {
  currentTour: OnboardingTour | null;
  currentStepIndex: number;
  isActive: boolean;
  completedTours: string[];
  skippedTours: string[];
}

export const ONBOARDING_TOURS: Record<string, OnboardingTour> = {
  welcome: {
    id: 'welcome',
    name: 'Welcome to Vibefy',
    description: 'Get started with your product management journey',
    version: 1,
    steps: [
      {
        id: 'welcome-1',
        title: 'Welcome to Vibefy! 🎉',
        content: 'You\'re about to discover a powerful platform for managing projects and products. Let\'s take a quick tour to get you started.',
        target: 'body',
        placement: 'center',
        disableInteraction: true,
        hideCloseButton: true,
        hideFooter: true,
      },
      {
        id: 'welcome-2',
        title: 'Navigation',
        content: 'Use the header navigation to quickly access Projects, Reports, Sprints, Roadmap, Prioritization, and OKRs. Each section has keyboard shortcuts for power users.',
        target: '[data-onboarding="navigation"]',
        placement: 'bottom',
        spotlightClicks: false,
      },
      {
        id: 'welcome-3',
        title: 'Keyboard Shortcuts',
        content: 'Press ⌘/ or click the Help button to see all available keyboard shortcuts. These will help you work faster and more efficiently.',
        target: '[data-onboarding="help-button"]',
        placement: 'bottom',
      },
      {
        id: 'welcome-4',
        title: 'Quick Actions',
        content: 'Create new issues, view notifications, and see who\'s online in your project. Real-time collaboration makes teamwork seamless.',
        target: '[data-onboarding="quick-actions"]',
        placement: 'bottom',
      },
      {
        id: 'welcome-5',
        title: 'Project Board',
        content: 'This is your Kanban board. Drag and drop issues between columns, filter by assignee or priority, and get real-time updates.',
        target: '[data-onboarding="board"]',
        placement: 'top',
      },
      {
        id: 'welcome-6',
        title: 'Getting Help',
        content: 'Need assistance? Use ⌘K to open the command palette, or click Help in the header. You can also access all features from the navigation.',
        target: '[data-onboarding="user-menu"]',
        placement: 'bottom',
      },
    ],
  },

  roadmap: {
    id: 'roadmap',
    name: 'Product Roadmap',
    description: 'Learn how to plan and visualize your product strategy',
    version: 1,
    steps: [
      {
        id: 'roadmap-1',
        title: 'Strategic Planning',
        content: 'The roadmap helps you visualize your product strategy across quarters. Drag items between quarters to adjust your timeline.',
        target: '[data-onboarding="roadmap-timeline"]',
        placement: 'top',
      },
      {
        id: 'roadmap-2',
        title: 'Roadmap Items',
        content: 'Each card represents a feature, initiative, or milestone. Click to edit details, dependencies, and progress.',
        target: '[data-onboarding="roadmap-item"]',
        placement: 'right',
      },
      {
        id: 'roadmap-3',
        title: 'Timeline View',
        content: 'Switch between quarter and timeline views to see your roadmap from different perspectives.',
        target: '[data-onboarding="view-toggle"]',
        placement: 'bottom',
      },
    ],
  },

  prioritization: {
    id: 'prioritization',
    name: 'Prioritization Framework',
    description: 'Master RICE scoring and value vs effort analysis',
    version: 1,
    steps: [
      {
        id: 'prioritization-1',
        title: 'RICE Scoring',
        content: 'RICE (Reach, Impact, Confidence, Effort) helps you score and prioritize features objectively.',
        target: '[data-onboarding="rice-calculator"]',
        placement: 'bottom',
      },
      {
        id: 'prioritization-2',
        title: 'Value vs Effort Matrix',
        content: 'Visualize your initiatives on a matrix to identify quick wins and major projects.',
        target: '[data-onboarding="value-effort-matrix"]',
        placement: 'top',
      },
      {
        id: 'prioritization-3',
        title: 'Data-Driven Decisions',
        content: 'Use these frameworks to make objective decisions about what to build next.',
        target: '[data-onboarding="prioritization-results"]',
        placement: 'left',
      },
    ],
  },
};
