import React, { useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { LandingPageLight } from './landing-page-light';
import { LandingPageDark } from './landing-page-dark';
import { motion, AnimatePresence } from 'motion/react';
import { Moon, Sun, PersonStanding } from 'lucide-react';
import GlassSurface from '../components/ui/GlassSurface';
import Lenis from '../utils/lenis';

export function LandingPage() {
  const { resolvedTheme, toggleTheme } = useTheme();

  // Initialize Lenis Smooth Scrolling on Landing Page
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
      infinite: false,
    });

    // Expose lenis globally so other components/navbars can trigger scrollTo if needed
    (window as any).lenis = lenis;

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      delete (window as any).lenis;
    };
  }, []);

  return (
    <div className="relative min-h-screen">
      <AnimatePresence mode="wait">
        {resolvedTheme === 'dark' ? (
          <motion.div
            key="dark"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <LandingPageDark />
          </motion.div>
        ) : (
          <motion.div
            key="light"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <LandingPageLight />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Controls Bar on Bottom-Left with GlassSurface */}
      <div className="fixed bottom-6 left-6 z-50 flex items-center gap-3 transition-opacity duration-300 opacity-100 [.auth-modal-open_&]:opacity-0 [.auth-modal-open_&]:pointer-events-none">
        {/* Sienna Accessibility Widget Button wrapped in GlassSurface */}
        <GlassSurface
          width={54}
          height={54}
          borderRadius={27}
          className={`shadow-2xl cursor-pointer hover:scale-110 transition-transform ${resolvedTheme === 'light' ? 'glass-surface--clear' : 'border border-white/60'}`}
        >
          <button
            onClick={() => {
              const btn = document.querySelector('.asw-menu-btn') as HTMLElement;
              if (btn) {
                btn.click();
              } else {
                alert('Widget Sienna sedang dimuat...');
              }
            }}
            className="w-full h-full flex items-center justify-center text-slate-800 dark:text-white"
            title="Buka Widget Aksesibilitas Sienna"
          >
            <PersonStanding className="w-6 h-6 font-bold text-emerald-500" />
          </button>
        </GlassSurface>

        {/* Theme Toggle Button wrapped in GlassSurface */}
        <GlassSurface
          width={54}
          height={54}
          borderRadius={27}
          className={`shadow-2xl cursor-pointer hover:scale-110 transition-transform ${resolvedTheme === 'light' ? 'glass-surface--clear' : 'border border-white/60'}`}
        >
          <button
            onClick={toggleTheme}
            className="w-full h-full flex items-center justify-center"
            title="Ubah Tema Landing Page"
          >
            <AnimatePresence mode="wait">
              {resolvedTheme === 'dark' ? (
                <motion.div
                  key="moon"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Sun className="w-6 h-6 text-amber-400" />
                </motion.div>
              ) : (
                <motion.div
                  key="sun"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Moon className="w-6 h-6 text-blue-600" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </GlassSurface>
      </div>
    </div>
  );
}
