import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Pencil } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import ApplicationLogo from './ApplicationLogo';

interface BrutalistLoaderProps {
  onComplete: () => void;
  theme?: 'light' | 'dark';
}

export function BrutalistLoader({ onComplete, theme = 'light' }: BrutalistLoaderProps) {
  const { t } = useTranslation();
  
  const isDark = theme === 'dark';

  const SYSTEM_LOGS = [
    t('loader.log_1') || 'MENYUSUN LEMBARAN CATATAN...',
    t('loader.log_2') || 'MENGAKTIFKAN MODUL 45+ BAHASA...',
    t('loader.log_3') || 'MEMPROSES FORMULA AI LATEX...',
    t('loader.log_4') || 'SINKRONISASI MINDMAP VISUAL...',
    t('loader.log_5') || 'MENGATUR TEMA NOTEBOOK HARMONIS...',
    t('loader.log_6') || 'MENIKMATI SKETSA & SCRIBBLE...',
    t('loader.log_7') || 'PENSIATAN SELESAI, BERSIAP...'
  ];
  const [counter, setCounter] = useState(0);
  const [logIndex, setLogIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  // Time-based progress tracking: completely immune to Safari timer throttling or dropped ticks
  useEffect(() => {
    if (isExiting) return;

    const totalDuration = 2800; // Snappy 2.8s duration
    const startTime = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    let animFrameId: number | null = null;
    let fallbackInterval: any = null;
    let completed = false;

    const tick = () => {
      if (completed) return;
      const now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
      const elapsed = Math.max(0, now - startTime);
      const progress = Math.min(100, (elapsed / totalDuration) * 100);

      setCounter(progress);

      if (progress >= 100) {
        completed = true;
        if (animFrameId) cancelAnimationFrame(animFrameId);
        if (fallbackInterval) clearInterval(fallbackInterval);
        setTimeout(() => {
          setIsExiting(true);
        }, 150);
        return;
      }

      animFrameId = requestAnimationFrame(tick);
    };

    // Primary driver: requestAnimationFrame (native display refresh, silky-smooth on iOS Safari & macOS)
    animFrameId = requestAnimationFrame(tick);

    // Secondary driver: backup setInterval in case Safari pauses rAF in background tab or low-power mode
    fallbackInterval = setInterval(() => {
      if (!completed) {
        const now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
        const elapsed = Math.max(0, now - startTime);
        const progress = Math.min(100, (elapsed / totalDuration) * 100);
        setCounter(progress);
        if (progress >= 100) {
          completed = true;
          if (animFrameId) cancelAnimationFrame(animFrameId);
          clearInterval(fallbackInterval);
          setTimeout(() => {
            setIsExiting(true);
          }, 150);
        }
      }
    }, 50);

    return () => {
      completed = true;
      if (animFrameId) cancelAnimationFrame(animFrameId);
      if (fallbackInterval) clearInterval(fallbackInterval);
    };
  }, [isExiting]);

  // Master fail-safe: Force dismiss after 3.5 seconds under ANY circumstance (never permanently block user)
  useEffect(() => {
    const masterTimeout = setTimeout(() => {
      setCounter(100);
      setIsExiting(true);
      const exitTimeout = setTimeout(() => {
        onComplete();
      }, 500);
      return () => clearTimeout(exitTimeout);
    }, 3500);

    return () => clearTimeout(masterTimeout);
  }, [onComplete]);

  // Exit fallback: Ensure onComplete triggers even if Framer Motion skips onAnimationComplete (e.g. prefers-reduced-motion)
  useEffect(() => {
    if (isExiting) {
      const exitTimer = setTimeout(() => {
        onComplete();
      }, 1000);
      return () => clearTimeout(exitTimer);
    }
  }, [isExiting, onComplete]);

  useEffect(() => {
    const totalLogs = SYSTEM_LOGS.length;
    const logInterval = Math.floor(100 / totalLogs);
    const currentLogIdx = Math.min(Math.floor(counter / logInterval), totalLogs - 1);
    setLogIndex(currentLogIdx);
  }, [counter, SYSTEM_LOGS.length]);

  const handleAnimationComplete = () => {
    if (isExiting) {
      onComplete();
    }
  };

  // Color classes according to theme
  const bgMain = isDark ? "bg-[#181424]" : "bg-[#FAF6EE]";
  const borderDashed = isDark ? "border-dashed border-white/10" : "border-dashed border-[#4A2E1B]/30";
  const dotGridColor = isDark ? '#64748B' : '#C5B39B';
  const doodleColor = isDark ? "text-gray-500/20" : "text-[#4A2E1B]/20";
  const washiBg = isDark ? "bg-[#2D2640] border-x border-blue-400/40" : "bg-[#E8DCC4] border-x border-[#C5B39B]";
  const badgeBg = isDark ? "bg-[#171424] border border-blue-500/50 shadow-[2px_2px_0px_#2563eb]" : "bg-[#FFFDF7] border border-[#4A2E1B]/30 shadow-[2px_2px_0px_#4A2E1B]";
  const badgeText = isDark ? "text-blue-400" : "text-[#3D2314]";
  const titleText = isDark ? "text-white" : "text-[#3D2314]";
  const progressBox = isDark ? "bg-[#100D1A] border-2 border-white/10 shadow-[3px_3px_0px_#2563eb]" : "bg-[#FFFDF7] border-2 border-[#4A2E1B]/30 shadow-[3px_3px_0px_#4A2E1B]";
  const subtitleText = isDark ? "text-gray-400" : "text-[#8C7355]";

  return (
    <div 
      onClick={() => {
        setCounter(100);
        setIsExiting(true);
        setTimeout(onComplete, 300);
      }}
      className={`fixed inset-0 z-[9999] overflow-hidden flex flex-col pointer-events-auto select-none font-sans cursor-pointer ${bgMain}`}
      title="Klik untuk membuka langsung"
    >
      
      {/* UPPER PAPER SHUTTER */}
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: isExiting ? '-100%' : '0%' }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        onAnimationComplete={handleAnimationComplete}
        style={{ willChange: 'transform', WebkitBackfaceVisibility: 'hidden', backfaceVisibility: 'hidden' }}
        className={`h-1/2 min-h-[50dvh] w-full ${bgMain} flex flex-col justify-end items-center relative overflow-hidden pb-8 px-6 border-b-2 ${borderDashed}`}
      >
        {/* Dot Grid Paper Background */}
        <div 
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(${dotGridColor} 1.5px, transparent 1.5px)`,
            backgroundSize: '24px 24px'
          }}
        />

        {/* Floating Scrapbook Doodles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
          <motion.div 
            animate={{ rotate: [0, 5, -5, 0], y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            className={`absolute top-12 left-12 font-mono text-xs font-bold ${doodleColor}`}
          >
            ∫ f(x)dx = F(b) - F(a)
          </motion.div>
          <motion.div 
            animate={{ rotate: [0, -6, 6, 0], y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 1 }}
            className={`absolute top-16 right-16 font-mono text-xs font-bold ${doodleColor}`}
          >
            E = m · c²
          </motion.div>
        </div>

        {/* Center Content Card */}
        <div className="relative z-10 flex flex-col items-center max-w-sm w-full text-center">
          {/* Top Washi Tape Pin Accent */}
          <div className={`w-28 h-5 ${washiBg} rotate-[-2deg] mb-6 shadow-xs`} />

          {/* Badge */}
          <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md mb-6 ${badgeBg}`}>
            <Sparkles className="w-3.5 h-3.5 text-blue-500 animate-spin-slow" />
            <span className={`text-xs font-mono font-extrabold uppercase tracking-wider ${badgeText}`}>{t('loader.sys_load') || 'MEMBUKA NOTEBOOK...'}</span>
          </div>

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center gap-3"
          >
            <ApplicationLogo size={72} />
            <h1 className={`text-4xl md:text-5xl font-display font-black tracking-tight ${titleText}`}>
              Sensora<span className="text-blue-500">Note</span>
            </h1>
          </motion.div>
        </div>
      </motion.div>

      {/* LOWER PAPER SHUTTER */}
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: isExiting ? '100%' : '0%' }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        style={{ willChange: 'transform', WebkitBackfaceVisibility: 'hidden', backfaceVisibility: 'hidden' }}
        className={`h-1/2 min-h-[50dvh] w-full ${bgMain} flex flex-col justify-start items-center relative overflow-hidden pt-8 px-6 border-t-2 ${borderDashed}`}
      >
        {/* Dot Grid Paper Background */}
        <div 
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(${dotGridColor} 1.5px, transparent 1.5px)`,
            backgroundSize: '24px 24px'
          }}
        />

        <div className="relative z-10 flex flex-col items-center max-w-sm w-full text-center">
          {/* Subtitle */}
          <h2 className={`text-xs font-mono font-extrabold tracking-[0.3em] uppercase mb-6 ${subtitleText}`}>
            Smart Educational Ecosystem
          </h2>

          {/* Notebook Paper Progress Bar */}
          <div className={`w-full max-w-xs h-6 rounded-xl p-1 relative mb-4 ${progressBox}`}>
            <motion.div
              className="h-full bg-blue-600 rounded-lg relative overflow-hidden"
              style={{ width: `${counter}%` }}
              transition={{ ease: 'easeOut' }}
            >
              {/* Hand-drawn stroke lines inside progress bar */}
              <div 
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.4) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0.4) 75%, transparent 75%, transparent)',
                  backgroundSize: '12px 12px'
                }}
              />
            </motion.div>

            {/* Pencil Icon moving along progress */}
            <motion.div 
              className="absolute -top-3.5 text-blue-500 pointer-events-none"
              style={{ left: `calc(${counter}% - 10px)` }}
            >
              <Pencil className="w-5 h-5 -rotate-45 drop-shadow-xs" />
            </motion.div>
          </div>

          {/* Status Counter & Ticker */}
          <div className="flex flex-col items-center gap-1.5 mt-2">
            <span className={`font-mono text-xs font-extrabold uppercase tracking-wider ${titleText}`}>
              {Math.min(Math.floor(counter), 100)}%
            </span>
            <span className={`font-mono text-[11px] font-bold uppercase tracking-wide h-4 ${subtitleText}`}>
              {SYSTEM_LOGS[logIndex]}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
