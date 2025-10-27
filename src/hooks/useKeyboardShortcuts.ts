import { useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

interface ShortcutHandler {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  callback: () => void;
  description: string;
  category: string;
}

interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
  preventDefault?: boolean;
}

export const useKeyboardShortcuts = (
  shortcuts: ShortcutHandler[],
  options: UseKeyboardShortcutsOptions = {}
) => {
  const { enabled = true, preventDefault = true } = options;
  const navigate = useNavigate();
  const shortcutsRef = useRef(shortcuts);

  // Update shortcuts ref when shortcuts change
  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      const matchingShortcut = shortcutsRef.current.find(
        (shortcut) =>
          shortcut.key.toLowerCase() === (event.key || '').toLowerCase() &&
          !!shortcut.ctrlKey === event.ctrlKey &&
          !!shortcut.shiftKey === event.shiftKey &&
          !!shortcut.altKey === event.altKey &&
          !!shortcut.metaKey === event.metaKey
      );

      if (matchingShortcut) {
        if (preventDefault) {
          event.preventDefault();
          event.stopPropagation();
        }
        matchingShortcut.callback();
      }
    },
    [enabled, preventDefault]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    shortcuts: shortcutsRef.current,
  };
};

// Predefined shortcuts for the application
export const getGlobalShortcuts = (navigate: (path: string) => void, actions: {
  openCommandPalette?: () => void;
  createIssue?: () => void;
  showShortcuts?: () => void;
} = {}): ShortcutHandler[] => [
  // Navigation shortcuts
  {
    key: 'b',
    metaKey: true,
    callback: () => navigate('/projects'),
    description: 'Go to Projects',
    category: 'Navigation',
  },
  {
    key: 'r',
    metaKey: true,
    callback: () => navigate('/reports'),
    description: 'Go to Reports',
    category: 'Navigation',
  },
  {
    key: 's',
    metaKey: true,
    callback: () => navigate('/sprints'),
    description: 'Go to Sprints',
    category: 'Navigation',
  },
  {
    key: 'o',
    metaKey: true,
    callback: () => navigate('/roadmap'),
    description: 'Go to Roadmap',
    category: 'Navigation',
  },
  {
    key: 'p',
    metaKey: true,
    callback: () => navigate('/prioritization'),
    description: 'Go to Prioritization',
    category: 'Navigation',
  },
  {
    key: 'f',
    metaKey: true,
    callback: () => navigate('/feedback'),
    description: 'Go to Feedback',
    category: 'Navigation',
  },
  {
    key: 'h',
    metaKey: true,
    callback: () => navigate('/hypotheses'),
    description: 'Go to Hypotheses',
    category: 'Navigation',
  },
  {
    key: 'k',
    metaKey: true,
    callback: () => actions.openCommandPalette?.(),
    description: 'Open command palette',
    category: 'Actions',
  },
  {
    key: 'n',
    metaKey: true,
    callback: () => actions.createIssue?.(),
    description: 'Create new issue',
    category: 'Actions',
  },
  {
    key: '/',
    metaKey: true,
    callback: () => actions.showShortcuts?.(),
    description: 'Show keyboard shortcuts',
    category: 'Help',
  },
  {
    key: '?',
    metaKey: true,
    shiftKey: true,
    callback: () => actions.showShortcuts?.(),
    description: 'Show keyboard shortcuts',
    category: 'Help',
  },
];

export const formatShortcut = (shortcut: ShortcutHandler): string => {
  const parts: string[] = [];

  if (shortcut.metaKey) parts.push('⌘');
  if (shortcut.ctrlKey) parts.push('Ctrl');
  if (shortcut.altKey) parts.push('Alt');
  if (shortcut.shiftKey) parts.push('⇧');

  parts.push(shortcut.key.toUpperCase());

  return parts.join(' + ');
};
