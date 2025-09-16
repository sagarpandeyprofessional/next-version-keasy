import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function useAnalytics() {
  const location = useLocation();

  useEffect(() => {
    if (window.gtag) {
      window.gtag("config", "G-SG78SLJ5XN", {
        page_path: location.pathname,
      });
    }
  }, [location]);
}