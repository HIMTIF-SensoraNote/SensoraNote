import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Globe, Terminal } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

interface BrutalistLoaderProps {
  onComplete: () => void;
}

export function BrutalistLoader({ onComplete }: BrutalistLoaderProps) {
  const { t } = useTranslation();
  
  // System log status updates to show elegant bootup process
  const SYSTEM_LOGS = [
    t('loader.log_1') || 'ALIGNING EDUCATION PROTOCOLS...',
    t('loader.log_2') || 'ACTIVATING MULTILINGUAL DECK (40+ LANGUAGES)...',
    t('loader.log_3') || 'COMPILING LATEX FORMULA ENGINE...',
    t('loader.log_4') || 'SYNCHRONIZING PORTAL DYNAMICS...',
    t('loader.log_5') || 'ESTABLISHING COHESIVE SYSTEM BRIGHTNESS...',
    t('loader.log_6') || 'PRE-RENDERING VISUAL SPARKLES...',
    t('loader.log_7') || 'COMPLETING HANDSHAKE PROTOCOLS...',
    t('loader.log_8') || 'PORTAL HORIZON ENGAGED...'
  ];
  const [counter, setCounter] = useState(0);
  const [logIndex, setLogIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  // Smooth loading progress over exactly 5 seconds
  useEffect(() => {
    if (isExiting) return;

    const totalDuration = 4500; // 4.5 seconds for progress, 0.5s buffer
    const intervalTime = 30;
    const steps = totalDuration / intervalTime;
    const increment = 100 / steps;

    const timer = setInterval(() => {
      setCounter((prev) => {
        const next = prev + increment + Math.random() * 0.4;
        if (next >= 100) {
          clearInterval(timer);
          // Wait briefly, then trigger shutter split-exit animation
          setTimeout(() => {
            setIsExiting(true);
          }, 200);
          return 100;
        }
        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isExiting]);

  // Sync tech logs based on loading percentage
  useEffect(() => {
    const totalLogs = SYSTEM_LOGS.length;
    const logInterval = Math.floor(100 / totalLogs);
    const currentLogIdx = Math.min(Math.floor(counter / logInterval), totalLogs - 1);
    setLogIndex(currentLogIdx);
  }, [counter]);

  // Generate 35 beautiful floating particle dots (portal sparkles) emerging from the bottom boundary
  const portalSparkles = useMemo(() => {
    const GOLDEN_RATIO = 0.618033988749895;
    return [...Array(35)].map((_, idx) => {
      // Golden ratio spacing for beautifully-distributed horizontal placement
      const hash1 = ((idx * GOLDEN_RATIO) % 1);
      const left = `${(hash1 * 92) + 4}%`;
      
      // Pseudo-random speeds (2.5s to 5.5s)
      const hash2 = ((idx * 0.382) % 1);
      const speed = 2.5 + hash2 * 3.0;
      
      // Staggered delays
      const hash3 = ((idx * 0.912) % 1);
      const delay = hash3 * 4.5;
      
      // Size: 2px to 4.5px
      const size = 1.8 + ((idx % 3) * 1.2);
      
      // Staggered colors matching landing page branding
      const colors = ["#ffffff", "#5D5CE6", "#8B5CF6", "#c084fc", "#ffffff"];
      const color = colors[idx % colors.length];
      
      // Sway movement offsets
      const sway = Math.sin(idx * 4.3) * (8 + (idx % 3) * 6);
      
      // Sparkles rise vertically. 25% go all the way up to center, 75% fade in bottom 1/3 section
      const isHigh = idx % 4 === 0;
      const targetY = isHigh ? "-52vh" : "-35vh";
      
      return {
        left,
        speed: isHigh ? speed * 1.25 : speed,
        delay,
        size,
        color,
        sway,
        targetY
      };
    });
  }, []);

  // Called when split shutter exit animation completes
  const handleAnimationComplete = () => {
    if (isExiting) {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden flex flex-col pointer-events-auto select-none font-sans bg-[#06050e]">
      
      {/* 1. UPPER SHUTTER PANEL (slides UP on exit) */}
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: isExiting ? '-100%' : '0%' }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        onAnimationComplete={handleAnimationComplete}
        className="h-1/2 w-full bg-[#06050e] flex flex-col justify-end items-center relative overflow-hidden pb-6 px-6"
      >
        {/* Cohesive Brand Grid Background */}
        <div
          className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(#5D5CE6 1px, transparent 1px), linear-gradient(90deg, #5D5CE6 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />

        {/* Ambient Indigo/Violet Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vw] rounded-full blur-[130px] bg-[#5D5CE6]/[0.08] pointer-events-none animate-pulse-slow" />

        {/* Center Content: Title "BelajarYuk" */}
        <div className="relative z-10 flex flex-col items-center max-w-2xl w-full text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full border border-white/5 bg-white/[0.02] backdrop-blur-md shadow-lg"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#8B5CF6] animate-pulse" />
            <span className="text-[10px] tracking-[0.2em] font-mono text-white/60 font-semibold uppercase">{t('loader.sys_load') || 'SYSTEM LOAD IN PROGRESS'}</span>
          </motion.div>

          <motion.h1
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.0, ease: "easeOut", delay: 0.2 }}
            className="text-5xl md:text-6xl font-extrabold tracking-tight text-white select-none leading-none mb-2"
            style={{
              textShadow: '0 0 30px rgba(93,92,230,0.25)',
            }}
          >
            Belajar<span className="text-[#5D5CE6]">Yuk</span>
          </motion.h1>
        </div>

        {/* Horizontal Splitting Line Glow */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#5D5CE6]/40 to-transparent pointer-events-none" />
      </motion.div>

      {/* 2. LOWER SHUTTER PANEL (slides DOWN on exit) */}
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: isExiting ? '100%' : '0%' }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        className="h-1/2 w-full bg-[#06050e] flex flex-col justify-start items-center relative overflow-hidden pt-6 px-6"
      >
        {/* Cohesive Brand Grid Background */}
        <div
          className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(#5D5CE6 1px, transparent 1px), linear-gradient(90deg, #5D5CE6 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />

        {/* Ambient Violet Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[70vw] h-[70vw] rounded-full blur-[130px] bg-[#8B5CF6]/[0.08] pointer-events-none animate-pulse-slow" style={{ animationDelay: '1.5s' }} />

        {/* Center Content: Subtitle "Ba-Yu" & Sleek Progress Line */}
        <div className="relative z-10 flex flex-col items-center max-w-2xl w-full text-center">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-xl font-serif italic text-white tracking-[0.4em] uppercase select-none leading-none mb-8"
            style={{
              textShadow: '0 0 20px rgba(255,255,255,0.15)',
            }}
          >
            Ba-Yu
          </motion.h2>

          {/* Minimalist Progress Line */}
          <div className="w-48 h-[2px] bg-white/10 rounded-full overflow-hidden relative shadow-[0_0_4px_rgba(255,255,255,0.1)] mb-4">
            <motion.div
              className="h-full bg-gradient-to-r from-[#5D5CE6] to-[#8B5CF6] shadow-[0_0_8px_#5D5CE6]"
              style={{ width: `${counter}%` }}
              transition={{ ease: 'easeOut' }}
            />
          </div>

          {/* Sleek Minimalist Counter & Status Ticker */}
          <div className="flex flex-col items-center gap-1">
            <span className="font-mono text-xs tracking-[0.25em] text-white/50 uppercase tabular-nums">
              {t('loader.loading') || 'LOADING'} {Math.min(Math.floor(counter), 100)}%
            </span>
            <span className="font-mono text-[9px] tracking-[0.18em] text-[#8B5CF6]/80 uppercase h-4 transition-all duration-300">
              {SYSTEM_LOGS[logIndex]}
            </span>
          </div>
        </div>

        {/* Horizontal Splitting Line Glow */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#8B5CF6]/40 to-transparent pointer-events-none" />

        {/* ==========================================================
            PORTAL EFFECTS AND RISING GLOWING DOT PARTICLES (AT THE BOTTOM)
            ========================================================== */}
        
        {/* Volumetric Dual-Layer Portal Glow at the bottom boundary */}
        {/* Layer 1: Wide, ambient violet glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[90vw] h-16 bg-gradient-to-t from-white/[0.08] via-[#5D5CE6]/[0.03] to-transparent blur-2xl pointer-events-none rounded-[100%] z-5" />
        {/* Layer 2: Center, intense white core glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[55vw] h-8 bg-gradient-to-t from-white/[0.22] via-[#8B5CF6]/[0.08] to-transparent blur-xl pointer-events-none rounded-[100%] z-5" />
        {/* Glowing horizontal portal boundary beam line */}
        <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/30 via-[#8B5CF6]/35 to-transparent pointer-events-none z-10 filter drop-shadow(0 0 5px rgba(255,255,255,0.45))" />

        {/* Portal Sparkles - tiny glowing dots emerging from bottom and floating upwards */}
        {portalSparkles.map((sparkle, idx) => (
          <motion.div
            key={`loader-sparkle-${idx}`}
            initial={{ y: "0vh", x: 0, opacity: 0 }}
            animate={{
              y: ["0vh", sparkle.targetY],
              x: [0, sparkle.sway, -sparkle.sway / 2, 0],
              opacity: [0, 0.95, 0.4, 0]
            }}
            transition={{
              y: { duration: sparkle.speed, repeat: Infinity, ease: "easeOut", delay: sparkle.delay },
              x: { duration: sparkle.speed * 0.9, repeat: Infinity, ease: "easeInOut", delay: sparkle.delay },
              opacity: { duration: sparkle.speed, repeat: Infinity, ease: "linear", delay: sparkle.delay, times: [0, 0.15, 0.5, 1] }
            }}
            style={{
              left: sparkle.left,
              bottom: '-4%',
              width: `${sparkle.size}px`,
              height: `${sparkle.size}px`,
              backgroundColor: sparkle.color,
              borderRadius: '50%',
              // Highly intense glowing drop shadows matching high-tech look
              filter: `blur(0.2px) drop-shadow(0 0 4px ${sparkle.color}) drop-shadow(0 0 8px ${sparkle.color})`,
              zIndex: 8,
            }}
            className="absolute pointer-events-none"
          />
        ))}
      </motion.div>
    </div>
  );
}
