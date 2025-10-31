import { useState, useEffect, useCallback } from 'react';

interface AnimationState {
  isAnimating: boolean;
  animationType: 'fadeIn' | 'slideIn' | 'bounce' | 'pulse' | 'none';
  duration: number;
}

interface UseWidgetAnimationProps {
  trigger?: any; // Any value that when changes triggers animation
  animationType?: AnimationState['animationType'];
  duration?: number;
  delay?: number;
}

export const useWidgetAnimation = ({
  trigger,
  animationType = 'fadeIn',
  duration = 300,
  delay = 0,
}: UseWidgetAnimationProps = {}) => {
  const [animationState, setAnimationState] = useState<AnimationState>({
    isAnimating: false,
    animationType,
    duration,
  });

  const triggerAnimation = useCallback(() => {
    setAnimationState(prev => ({ ...prev, isAnimating: true }));

    const timer = setTimeout(() => {
      setAnimationState(prev => ({ ...prev, isAnimating: false }));
    }, duration + delay);

    return () => clearTimeout(timer);
  }, [duration, delay]);

  // Trigger animation when the trigger prop changes
  useEffect(() => {
    if (trigger !== undefined) {
      triggerAnimation();
    }
  }, [trigger, triggerAnimation]);

  // Manual trigger function
  const animate = useCallback(() => {
    triggerAnimation();
  }, [triggerAnimation]);

  const getAnimationClasses = () => {
    if (!animationState.isAnimating) return '';

    const baseClasses = 'transition-all ease-out';
    const durationClass = `duration-${animationState.duration}`;

    switch (animationState.animationType) {
      case 'fadeIn':
        return `${baseClasses} ${durationClass} opacity-0 animate-in fade-in`;
      case 'slideIn':
        return `${baseClasses} ${durationClass} opacity-0 animate-in slide-in-from-bottom-2`;
      case 'bounce':
        return `${baseClasses} ${durationClass} animate-bounce`;
      case 'pulse':
        return `${baseClasses} ${durationClass} animate-pulse`;
      default:
        return '';
    }
  };

  const getContainerClasses = () => {
    if (!animationState.isAnimating) return '';

    return getAnimationClasses();
  };

  return {
    animationState,
    animate,
    getAnimationClasses,
    getContainerClasses,
    isAnimating: animationState.isAnimating,
  };
};

// Hook for staggered animations (useful for multiple widgets)
export const useStaggeredAnimation = (
  items: any[],
  options: {
    animationType?: AnimationState['animationType'];
    duration?: number;
    staggerDelay?: number;
  } = {}
) => {
  const [animatingItems, setAnimatingItems] = useState<Set<number>>(new Set());

  const animateAll = useCallback(() => {
    const { staggerDelay = 100 } = options;

    items.forEach((_, index) => {
      setTimeout(() => {
        setAnimatingItems(prev => new Set([...prev, index]));
      }, index * staggerDelay);
    });

    // Clear after animation
    const totalDuration = items.length * staggerDelay + (options.duration || 300);
    setTimeout(() => {
      setAnimatingItems(new Set());
    }, totalDuration);
  }, [items, options]);

  const getItemAnimation = (index: number) => {
    return {
      isAnimating: animatingItems.has(index),
      animationType: options.animationType || 'fadeIn',
      duration: options.duration || 300,
    };
  };

  return {
    animateAll,
    getItemAnimation,
    isAnyAnimating: animatingItems.size > 0,
  };
};

// Hook for data change detection and animation trigger
export const useDataChangeAnimation = (data: any, options: UseWidgetAnimationProps = {}) => {
  const [previousData, setPreviousData] = useState(data);
  const [hasChanged, setHasChanged] = useState(false);

  const animation = useWidgetAnimation({
    ...options,
    trigger: hasChanged,
  });

  useEffect(() => {
    // Deep comparison for data changes
    const dataChanged = JSON.stringify(data) !== JSON.stringify(previousData);

    if (dataChanged) {
      setHasChanged(true);
      setPreviousData(data);

      // Reset the change flag after animation
      const timer = setTimeout(() => {
        setHasChanged(false);
      }, options.duration || 300);

      return () => clearTimeout(timer);
    }
  }, [data, previousData, options.duration]);

  return {
    ...animation,
    hasChanged,
  };
};
