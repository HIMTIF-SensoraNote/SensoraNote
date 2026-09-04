import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    undefined,
  );

  React.useEffect(() => {
    let mql: MediaQueryList | null = null;
    try {
      if (typeof window !== 'undefined' && window.matchMedia) {
        mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
      }
    } catch (e) {
      mql = null;
    }

    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    if (mql) {
      if (typeof mql.addEventListener === "function") {
        mql.addEventListener("change", onChange);
      } else if (typeof (mql as any).addListener === "function") {
        (mql as any).addListener(onChange);
      }
    }

    setIsMobile(typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false);

    return () => {
      if (mql) {
        if (typeof mql.removeEventListener === "function") {
          mql.removeEventListener("change", onChange);
        } else if (typeof (mql as any).removeListener === "function") {
          (mql as any).removeListener(onChange);
        }
      }
    };
  }, []);

  return !!isMobile;
}
