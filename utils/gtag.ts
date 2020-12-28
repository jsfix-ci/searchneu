import { useRouter } from "next/router";
import { useEffect } from "react";
import Macros from "../components/macros";

export const GA_TRACKING_ID = "<INSERT_TAG_ID>";

type GTagEvent = {
  action: string;
  category: string;
  label: string;
  value: number;
};

// https://developers.google.com/analytics/devguides/collection/gtagjs/events
export const event = ({ action, category, label, value }: GTagEvent): void => {
  window.gtag("event", action, {
    event_category: category,
    event_label: label,
    value,
  });
};

/**
 * Send page views to google analytics. Track when router changes and log.
 */
export function useGoogleAnalyticsOnPageChange() {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = (url: URL) => {
      if (Macros.PROD) {
        window.gtag("config", GA_TRACKING_ID, {
          page_path: url,
        });
      }
    };
    router.events.on("routeChangeComplete", handleRouteChange);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]);
}
