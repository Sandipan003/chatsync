'use client';

import { useEffect } from 'react';

export const DisableDevTools = () => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent F12 key
      if (e.keyCode === 123) {
        e.preventDefault();
        return false;
      }
      
      // Prevent Ctrl+Shift+I (Chrome, Firefox, Safari)
      if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
        e.preventDefault();
        return false;
      }

      // Prevent Ctrl+Shift+J (Chrome)
      if (e.ctrlKey && e.shiftKey && e.keyCode === 74) {
        e.preventDefault();
        return false;
      }

      // Prevent Ctrl+U (View source)
      if (e.ctrlKey && e.keyCode === 85) {
        e.preventDefault();
        return false;
      }
    };

    const disableRightClick = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    const preventDevToolsOpen = () => {
      // Detect if DevTools is open
      const widthThreshold = window.outerWidth - window.innerWidth > 160;
      const heightThreshold = window.outerHeight - window.innerHeight > 160;
      
      if (widthThreshold || heightThreshold) {
        // Optional: Redirect or show warning
        // window.location.href = '/';
        console.log('Developer tools detected!');
      }
    };

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', disableRightClick);
    window.addEventListener('resize', preventDevToolsOpen);

    // Set interval to continuously check
    const intervalId = setInterval(preventDevToolsOpen, 1000);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', disableRightClick);
      window.removeEventListener('resize', preventDevToolsOpen);
      clearInterval(intervalId);
    };
  }, []);

  return null;
}; 