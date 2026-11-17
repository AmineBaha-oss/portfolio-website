"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { LanguageProvider } from "@/lib/i18n/context";

const PortfolioVisitContext = createContext({ hasVisitedHome: false, markHomeVisited: () => {} });

export function usePortfolioVisit() {
  return useContext(PortfolioVisitContext);
}

function SmoothScrollManager() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/") return;

    let cancelled = false;
    let scrollInstance: { destroy: () => void } | null = null;

    void (async () => {
      const LocomotiveScroll = (await import("locomotive-scroll")).default;
      if (cancelled) return;

      scrollInstance = new LocomotiveScroll({
        lenisOptions: {
          wrapper: window,
          content: document.documentElement,
          lerp: 0.1,
          duration: 1.2,
          orientation: "vertical",
          gestureOrientation: "vertical",
          smoothWheel: true,
          wheelMultiplier: 1,
          touchMultiplier: 2,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        },
      });
    })();

    return () => {
      cancelled = true;
      scrollInstance?.destroy();
    };
  }, [pathname]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [hasVisitedHome, setHasVisitedHome] = useState(false);
  const markHomeVisited = useCallback(() => setHasVisitedHome(true), []);
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <PortfolioVisitContext.Provider value={{ hasVisitedHome, markHomeVisited }}>
          <SmoothScrollManager />
          {children}
        </PortfolioVisitContext.Provider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}
