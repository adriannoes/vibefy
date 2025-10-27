import { useState, useEffect, useCallback } from 'react';
import { OnboardingTour, OnboardingState, ONBOARDING_TOURS } from '@/types/onboarding';

const ONBOARDING_STORAGE_KEY = 'vibefy_onboarding_state';

export const useOnboarding = () => {
  const [state, setState] = useState<OnboardingState>({
    currentTour: null,
    currentStepIndex: 0,
    isActive: false,
    completedTours: [],
    skippedTours: [],
  });

  // Load onboarding state from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(ONBOARDING_STORAGE_KEY);
      if (saved) {
        const parsedState = JSON.parse(saved);
        setState(prev => ({ ...prev, ...parsedState }));
      }
    } catch (error) {
      console.warn('Failed to load onboarding state:', error);
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn('Failed to save onboarding state:', error);
    }
  }, [state]);

  const completeTour = useCallback(() => {
    if (!state.currentTour) return;

    setState(prev => ({
      ...prev,
      currentTour: null,
      currentStepIndex: 0,
      isActive: false,
      completedTours: [...prev.completedTours, prev.currentTour!.id],
    }));
  }, [state.currentTour]);

  const startTour = useCallback((tourId: string) => {
    const tour = ONBOARDING_TOURS[tourId];
    if (!tour) {
      console.warn(`Tour ${tourId} not found`);
      return;
    }

    if (state.completedTours.includes(tourId)) {
      console.log(`Tour ${tourId} already completed`);
      return;
    }

    setState(prev => ({
      ...prev,
      currentTour: tour,
      currentStepIndex: 0,
      isActive: true,
    }));
  }, [state.completedTours]);

  const nextStep = useCallback(() => {
    if (!state.currentTour) return;

    const nextIndex = state.currentStepIndex + 1;
    if (nextIndex >= state.currentTour.steps.length) {
      completeTour();
    } else {
      setState(prev => ({
        ...prev,
        currentStepIndex: nextIndex,
      }));
    }
  }, [state.currentTour, state.currentStepIndex, completeTour]);

  const prevStep = useCallback(() => {
    if (state.currentStepIndex > 0) {
      setState(prev => ({
        ...prev,
        currentStepIndex: prev.currentStepIndex - 1,
      }));
    }
  }, [state.currentStepIndex]);

  const skipTour = useCallback(() => {
    if (!state.currentTour) return;

    setState(prev => ({
      ...prev,
      currentTour: null,
      currentStepIndex: 0,
      isActive: false,
      skippedTours: [...prev.skippedTours, prev.currentTour!.id],
    }));
  }, [state.currentTour]);

  const stopTour = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentTour: null,
      currentStepIndex: 0,
      isActive: false,
    }));
  }, []);

  const restartTour = useCallback((tourId: string) => {
    setState(prev => ({
      ...prev,
      completedTours: prev.completedTours.filter(id => id !== tourId),
      skippedTours: prev.skippedTours.filter(id => id !== tourId),
    }));
    startTour(tourId);
  }, [startTour]);

  const getCurrentStep = useCallback(() => {
    if (!state.currentTour || !state.isActive) return null;
    return state.currentTour.steps[state.currentStepIndex] || null;
  }, [state.currentTour, state.currentStepIndex, state.isActive]);

  const shouldShowTour = useCallback((tourId: string) => {
    return !state.completedTours.includes(tourId) && !state.skippedTours.includes(tourId);
  }, [state.completedTours, state.skippedTours]);

  const getAvailableTours = useCallback(() => {
    return Object.values(ONBOARDING_TOURS).filter(tour => shouldShowTour(tour.id));
  }, [shouldShowTour]);

  return {
    // State
    state,

    // Current tour info
    currentTour: state.currentTour,
    currentStep: getCurrentStep(),
    currentStepIndex: state.currentStepIndex,
    isActive: state.isActive,
    totalSteps: state.currentTour?.steps.length || 0,

    // Actions
    startTour,
    nextStep,
    prevStep,
    completeTour,
    skipTour,
    stopTour,
    restartTour,

    // Queries
    shouldShowTour,
    getAvailableTours,
    isCompleted: (tourId: string) => state.completedTours.includes(tourId),
    isSkipped: (tourId: string) => state.skippedTours.includes(tourId),

    // Utilities
    tours: ONBOARDING_TOURS,
  };
};
