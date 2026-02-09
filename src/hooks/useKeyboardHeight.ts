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
      const currentVisualHeight = viewport.height;
      const currentLayoutHeight = window.innerHeight;

      // Heuristic: If layout height has shrunk significantly (Android behavior),
      // the browser is handling the keyboard via resize.
      // We compare against screen.availHeight (or outerHeight as fallback).
      const screenHeight = window.screen.availHeight || window.outerHeight;

      // If layout height is less than 85% of screen height, assume it's resized by keyboard
      // Note: On landscape this might be tricky, but for portrait rhymes app it's safe.
      const isLayoutResized = currentLayoutHeight < screenHeight * 0.85;

      if (isLayoutResized) {
        setKeyboardHeight(0);
        return;
      }

      const heightDiff = currentLayoutHeight - currentVisualHeight;

      // Only set keyboard height if there's a significant difference
      // We use a smaller threshold (e.g. 50px) to catch the keyboard
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
    // Also listen to window resize to catch layout viewport changes (Android)
    window.addEventListener('resize', handleResize);

    // Initial check
    handleResize();

    return () => {
      viewport.removeEventListener('resize', handleResize);
      viewport.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return keyboardHeight;
}
