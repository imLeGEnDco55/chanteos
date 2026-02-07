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
    
    // Store initial height to compare against
    const initialHeight = window.innerHeight;

    const handleResize = () => {
      // Calculate the difference between window height and viewport height
      // This difference is approximately the keyboard height
      const currentHeight = viewport.height;
      const heightDiff = initialHeight - currentHeight;
      
      // Only set keyboard height if there's a significant difference (> 100px)
      // This helps avoid false positives from browser UI changes
      if (heightDiff > 100) {
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
