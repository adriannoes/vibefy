import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Keyboard, Command, Zap, Navigation } from 'lucide-react';
import { formatShortcut, type ShortcutHandler } from '@/hooks/useKeyboardShortcuts';

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  shortcuts: ShortcutHandler[];
}

const categoryIcons = {
  Navigation: <Navigation className="h-4 w-4" />,
  Actions: <Zap className="h-4 w-4" />,
  Help: <Keyboard className="h-4 w-4" />,
};

const categoryColors = {
  Navigation: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  Actions: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  Help: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
};

export const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({
  isOpen,
  onOpenChange,
  shortcuts,
}) => {
  // Group shortcuts by category
  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, ShortcutHandler[]>);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Command className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Boost your productivity with keyboard shortcuts. Press{' '}
            <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">
              ⌘ /
            </kbd>{' '}
            or{' '}
            <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">
              ⌘ ⇧ ?
            </kbd>{' '}
            anytime to show this dialog.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
            <div key={category}>
              <div className="flex items-center gap-2 mb-3">
                {categoryIcons[category as keyof typeof categoryIcons]}
                <h3 className="text-lg font-semibold">{category}</h3>
                <Badge variant="secondary" className={categoryColors[category as keyof typeof categoryColors]}>
                  {categoryShortcuts.length} shortcuts
                </Badge>
              </div>

              <div className="grid gap-2">
                {categoryShortcuts.map((shortcut, index) => (
                  <div
                    key={`${shortcut.key}-${shortcut.metaKey}-${shortcut.shiftKey}`}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{shortcut.description}</p>
                    </div>
                    <kbd className="px-2 py-1 text-sm font-mono bg-muted rounded border">
                      {formatShortcut(shortcut)}
                    </kbd>
                  </div>
                ))}
              </div>

              {Object.keys(groupedShortcuts).length > 1 && (
                <Separator className="mt-4" />
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Keyboard className="h-4 w-4" />
            Tips
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Use <kbd className="px-1 py-0.5 bg-background rounded text-xs">⌘ K</kbd> to quickly search and navigate</li>
            <li>• Press <kbd className="px-1 py-0.5 bg-background rounded text-xs">Esc</kbd> to close dialogs and menus</li>
            <li>• Shortcuts work on Mac (⌘) and Windows/Linux (Ctrl)</li>
            <li>• Focus must be on the page (not in input fields) for shortcuts to work</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
};
