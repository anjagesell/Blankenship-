import { useEffect, useRef } from 'react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

/**
 * Hook to track page visits for analytics
 * @param {string} pageName - Name of the page being visited (e.g., "index", "synopsis", "11/2013")
 * @param {boolean} accessGranted - Whether user has been granted access (default: true for internal pages)
 */
export const usePageTracker = (pageName, accessGranted = true) => {
  const hasLogged = useRef(false);

  useEffect(() => {
    // Only log once per page load
    if (hasLogged.current) return;
    hasLogged.current = true;

    const logPageVisit = async () => {
      try {
        await fetch(`${BACKEND_URL}/api/visitor/log`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            page_accessed: pageName,
            access_granted: accessGranted
          })
        });
      } catch (error) {
        console.error('Failed to log page visit:', error);
      }
    };

    logPageVisit();
  }, [pageName, accessGranted]);
};

export default usePageTracker;
