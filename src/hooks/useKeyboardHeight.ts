import { useState, useEffect } from 'react';

/**
 * Hook to detect mobile keyboard height using Visual Viewport API
 * Returns the keyboard height so fixed elements can adjust their position
 */
export function useKeyboardHeight() {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    // Check if Visual Viewport API is available
    if (!window.visualViewport) {
      return;
    }

    const viewport = window.visualViewport;

    const handleResize = () => {
      // Calculate the difference between layout height and viewport height
      // On Android, innerHeight shrinks so diff is 0 (handled by layout)
      // On iOS, innerHeight stays constant so diff is keyboard height
      const currentVisualHeight = viewport.height;
      const currentLayoutHeight = window.innerHeight;

      const heightDiff = currentLayoutHeight - currentVisualHeight;

      // Only set keyboard height if there's a significant difference
      // We use a smaller threshold (e.g. 10px) to catch the keyboard
      if (heightDiff > 50) {
        setKeyboardHeight(heightDiff);
      } else {
        setKeyboardHeight(0);
      }
    };

    // Also handle scroll events which can indicate viewport changes
    const handleScroll = () => {
      // On iOS, offsetTop changes when keyboard appears
      const offsetTop = viewport.offsetTop;
      if (offsetTop > 0) {
        // Keyboard is pushing viewport down
        handleResize();
      }
    };

    viewport.addEventListener('resize', handleResize);
    viewport.addEventListener('scroll', handleScroll);

    // Initial check
    handleResize();

    return () => {
      viewport.removeEventListener('resize', handleResize);
      viewport.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return keyboardHeight;
}
