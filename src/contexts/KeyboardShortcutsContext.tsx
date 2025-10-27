import React, { createContext, useContext, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useKeyboardShortcuts, getGlobalShortcuts, type ShortcutHandler } from '@/hooks/useKeyboardShortcuts';
import { KeyboardShortcutsHelp } from '@/components/shared/KeyboardShortcutsHelp';

interface KeyboardShortcutsContextType {
  showShortcutsHelp: boolean;
  setShowShortcutsHelp: (show: boolean) => void;
  openCommandPalette: () => void;
  createNewIssue: () => void;
}

const KeyboardShortcutsContext = createContext<KeyboardShortcutsContextType | null>(null);

export const useKeyboardShortcutsContext = () => {
  const context = useContext(KeyboardShortcutsContext);
  if (!context) {
    throw new Error('useKeyboardShortcutsContext must be used within a KeyboardShortcutsProvider');
  }
  return context;
};

interface KeyboardShortcutsProviderProps {
  children: React.ReactNode;
}

export const KeyboardShortcutsProvider: React.FC<KeyboardShortcutsProviderProps> = ({
  children
}) => {
  const navigate = useNavigate();
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);

  const openCommandPalette = useCallback(() => {
    // TODO: Implement command palette opening
    console.log('Open command palette');
  }, []);

  const createNewIssue = useCallback(() => {
    // TODO: Implement create new issue
    console.log('Create new issue');
  }, []);

  const shortcuts: ShortcutHandler[] = getGlobalShortcuts(navigate, {
    openCommandPalette,
    createIssue: createNewIssue,
    showShortcuts: () => setShowShortcutsHelp(true),
  });

  useKeyboardShortcuts(shortcuts);

  const value: KeyboardShortcutsContextType = {
    showShortcutsHelp,
    setShowShortcutsHelp,
    openCommandPalette,
    createNewIssue,
  };

  return (
    <KeyboardShortcutsContext.Provider value={value}>
      {children}
      <KeyboardShortcutsHelp
        isOpen={showShortcutsHelp}
        onOpenChange={setShowShortcutsHelp}
        shortcuts={shortcuts}
      />
    </KeyboardShortcutsContext.Provider>
  );
};
