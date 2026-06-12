import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Resets scroll to the top on route (pathname) change so each page opens at the
 * top. Hash-only changes (e.g. #request) are ignored, so in-page anchor links
 * still scroll to their target.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
