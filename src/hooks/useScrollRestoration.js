
import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

// Saves scroll position in sessionStorage per path to restore on back/forward navigation
export function useScrollRestoration() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const scrollPositions = useRef({});

  // Save scroll position before leaving
  useEffect(() => {
    const handleScroll = () => {
      scrollPositions.current[location.pathname] = window.scrollY;
      sessionStorage.setItem(`scroll_pos_${location.pathname}`, window.scrollY.toString());
    };

    // Debounce scroll event slightly to performance
    let timeoutId;
    const onScroll = () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(handleScroll, 100);
    };

    window.addEventListener('scroll', onScroll);
    return () => {
        window.removeEventListener('scroll', onScroll);
        clearTimeout(timeoutId);
    };
  }, [location.pathname]);

  // Restore scroll position on navigation
  useEffect(() => {
    const savedPosition = sessionStorage.getItem(`scroll_pos_${location.pathname}`);
    
    if (savedPosition && navigationType === 'POP') {
      // If navigating back (POP), restore position
      window.scrollTo(0, parseInt(savedPosition, 10));
    } else {
      // If pushing new history (PUSH/REPLACE), scroll to top
      window.scrollTo(0, 0);
    }
  }, [location.pathname, navigationType]);
}
