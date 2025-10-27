import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Home,
  BarChart3,
  Calendar,
  Target,
  GitBranch,
  Zap,
  MessageSquare,
  Lightbulb,
  HelpCircle,
  User,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProject } from '@/contexts/ProjectContext';
import { useKeyboardShortcutsContext } from '@/contexts/KeyboardShortcutsContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface AppHeaderProps {
  children?: React.ReactNode;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { currentProject } = useProject();
  const { setShowShortcutsHelp } = useKeyboardShortcutsContext();

  const navigationItems = [
    { path: '/projects', label: 'Projects', icon: Home, shortcut: '⌘ B', requiresProject: false },
    { path: `/reports/${currentProject?.id || ''}`, label: 'Reports', icon: BarChart3, shortcut: '⌘ R', requiresProject: true },
    { path: `/sprints/${currentProject?.id || ''}`, label: 'Sprints', icon: Calendar, shortcut: '⌘ S', requiresProject: true },
    { path: `/roadmap/${currentProject?.id || ''}`, label: 'Roadmap', icon: Target, shortcut: '⌘ O', requiresProject: true },
    { path: `/prioritization/${currentProject?.id || ''}`, label: 'Prioritize', icon: Zap, shortcut: '⌘ P', requiresProject: true },
    { path: `/feedback/${currentProject?.id || ''}`, label: 'Feedback', icon: MessageSquare, shortcut: '⌘ F', requiresProject: true },
    { path: `/hypotheses/${currentProject?.id || ''}`, label: 'Hypotheses', icon: Lightbulb, shortcut: '⌘ H', requiresProject: true },
    { path: `/okrs/${currentProject?.id || ''}`, label: 'OKRs', icon: GitBranch, shortcut: '⌘ K', requiresProject: true },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getInitials = (email: string) => {
    return email.split('@')[0].substring(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        {/* Logo/Brand */}
        <div className="mr-4 flex">
          <Button
            variant="ghost"
            className="mr-6 px-0 font-bold text-xl"
            onClick={() => navigate('/projects')}
          >
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Vibefy
            </span>
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex items-center space-x-1 text-sm font-medium" data-onboarding="navigation">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.path ||
                           (item.path === '/projects' && location.pathname.startsWith('/project/'));
            const isDisabled = item.requiresProject && !currentProject;
            
            return (
              <Button
                key={item.path}
                variant={isActive ? "secondary" : "ghost"}
                size="sm"
                onClick={() => !isDisabled && navigate(item.path)}
                disabled={isDisabled}
                className="flex items-center gap-2"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
                <Badge variant="outline" className="text-xs px-1 py-0 h-4">
                  {item.shortcut}
                </Badge>
              </Button>
            );
          })}
        </nav>

        {/* Right side actions */}
        <div className="ml-auto flex items-center space-x-2">
          {/* Help Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowShortcutsHelp(true)}
            className="flex items-center gap-2"
            data-onboarding="help-button"
          >
            <HelpCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Help</span>
            <Badge variant="outline" className="text-xs px-1 py-0 h-4">
              ⌘ /
            </Badge>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full" data-onboarding="user-menu">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.email} />
                  <AvatarFallback>{user?.email ? getInitials(user.email) : 'U'}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  {user?.email && (
                    <p className="font-medium">{user.email}</p>
                  )}
                  {user?.user_metadata?.full_name && (
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {user.user_metadata.full_name}
                    </p>
                  )}
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowShortcutsHelp(true)}>
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>Keyboard shortcuts</span>
                <Badge variant="outline" className="ml-auto text-xs">
                  ⌘ /
                </Badge>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Custom children content */}
        {children}
      </div>
    </header>
  );
};
