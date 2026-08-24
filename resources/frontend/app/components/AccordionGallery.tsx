import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ScanText, Ear, Eye, Code, BrainCircuit, ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import './AccordionGallery.css';

interface GalleryItem {
  image?: string;
  icon: React.ReactNode;
  label: string;
  badgeText: string;
  desc: string;
}

const DEFAULT_ITEMS: GalleryItem[] = [
  { 
    label: 'AI Vision OCR',
    badgeText: 'COMPUTER VISION',
    icon: <ScanText className="w-6 h-6 text-blue-400" />,
    image: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=2070&auto=format&fit=crop',
    desc: 'Ubah foto catatan tulisan tangan menjadi teks digital instan dengan teknologi Computer Vision.'
  },
  { 
    label: 'Sienna & Audio Podcast',
    badgeText: 'TEXT-TO-SPEECH',
    icon: <Ear className="w-6 h-6 text-indigo-400" />,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070&auto=format&fit=crop',
    desc: 'Dukungan aksesibilitas dan Text-to-Speech untuk mendengarkan materi pelajaran layaknya podcast.'
  },
  { 
    label: 'Braille Converter',
    badgeText: 'HARDWARE EXPORT',
    icon: <Eye className="w-6 h-6 text-amber-400" />,
    image: 'https://images.unsplash.com/photo-1588015386001-eb4d57c2c040?q=80&w=2070&auto=format&fit=crop',
    desc: 'Ekspor otomatis catatan Anda ke format file fisik khusus untuk dicetak menggunakan printer Braille.'
  },
  { 
    label: 'LaTeX Screen Reader',
    badgeText: 'ACCESSIBLE MATH',
    icon: <Code className="w-6 h-6 text-emerald-400" />,
    image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2070&auto=format&fit=crop',
    desc: 'Engine rendering rumus matematika yang dapat diinterpretasikan dengan tepat oleh pembaca layar.'
  },
  { 
    label: 'AI Tutor & Kuis',
    badgeText: 'INTERACTIVE QUIZ',
    icon: <BrainCircuit className="w-6 h-6 text-purple-400" />,
    image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=2070&auto=format&fit=crop',
    desc: 'Berdiskusilah langsung tentang isi materi catatan dan ukur tingkat pemahamanmu via kuis interaktif.'
  }
];

interface AccordionGalleryProps {
  badge?: string;
  title?: string;
}

const AccordionGallery: React.FC<AccordionGalleryProps> = ({ badge, title }) => {
  const [activeAbsolute, setActiveAbsolute] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isAutoScrollPaused, setIsAutoScrollPaused] = useState(false);
  const count = DEFAULT_ITEMS.length;

  const activeIndex = ((activeAbsolute % count) + count) % count;

  const handleNext = () => setActiveAbsolute((prev) => prev + 1);
  const handlePrev = () => setActiveAbsolute((prev) => prev - 1);

  // Auto scroll timer (cycles every 3.8s, pauses on hover)
  useEffect(() => {
    if (isAutoScrollPaused) return;

    const timer = setInterval(() => {
      setActiveAbsolute((prev) => prev + 1);
    }, 3800);

    return () => clearInterval(timer);
  }, [isAutoScrollPaused]);

  const displayItems = useMemo(() => {
    const items = [];
    for (let i = 0; i < count; i++) {
      const itemIndex = ((activeAbsolute + i) % count + count) % count;
      items.push({
        item: DEFAULT_ITEMS[itemIndex],
        originalIndex: itemIndex,
        visualIndex: i,
        key: activeAbsolute + i
      });
    }
    return items;
  }, [activeAbsolute, count]);

  const getFlex = (visualIndex: number, originalIndex: number) => {
    if (visualIndex === 0) {
      if (hoveredIndex !== null && hoveredIndex !== originalIndex) return 55;
      return 65;
    }
    if (hoveredIndex === originalIndex) {
      if (visualIndex === 1) return 20;
      if (visualIndex === 2) return 15;
      if (visualIndex === 3) return 10;
      if (visualIndex >= 4) return 8;
    }
    
    if (visualIndex === 1) return 15;
    if (visualIndex === 2) return 10;
    if (visualIndex === 3) return 6;
    if (visualIndex >= 4) return 4;
    return 0;
  };

  return (
    <div className="w-full">
      {/* Header with Title & Navigation Controls Inline */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 md:mb-8">
        <div className="text-left">
          {badge && (
            <div className="block mb-3">
              <span className="inline-block px-3 py-1 bg-[#FFFDF7] dark:bg-[#171424] border border-[#4A2E1B]/30 dark:border-amber-400/50 shadow-[2px_2px_0px_#4A2E1B] dark:shadow-[2px_2px_0px_#f59e0b] rounded-md -rotate-1 text-xs font-mono font-extrabold text-blue-700 dark:text-amber-400 uppercase tracking-widest">
                ✏️ {badge}
              </span>
            </div>
          )}
          {title && (
            <div className="relative inline-block">
              <h2 className="font-display font-extrabold tracking-tight text-slate-900 dark:text-white text-3xl md:text-5xl leading-tight">
                {title}
              </h2>
              {/* Hand-Drawn Scribble Underline SVG */}
              <svg className="absolute -bottom-3 left-0 w-full h-3 text-blue-500/70 dark:text-cyan-400/80 pointer-events-none" viewBox="0 0 200 12" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
                <path d="M 3 6 Q 50 1, 100 8 T 197 4" />
              </svg>
            </div>
          )}
        </div>

        {/* Inline Navigation Controls (Step Dots + Prev/Next Arrows) */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Step dots */}
          <div className="flex items-center gap-1.5 mr-1">
            {DEFAULT_ITEMS.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  const diff = (idx - activeIndex + count) % count;
                  setActiveAbsolute((prev) => prev + diff);
                }}
                className={`h-2 rounded-full transition-all duration-500 cursor-pointer ${
                  idx === activeIndex
                    ? 'w-6 bg-blue-600 dark:bg-blue-400 shadow-[0_0_10px_rgba(37,99,235,0.5)]'
                    : 'w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600'
                }`}
                title={`Buka ${item.label}`}
              />
            ))}
          </div>

          {/* Prev/Next Arrow Buttons */}
          <div className="flex items-center gap-2">
            <button 
              onClick={handlePrev}
              className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-center transition-colors border border-slate-200 dark:border-slate-700 shadow-sm cursor-pointer"
              aria-label="Previous Feature"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={handleNext}
              className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-center transition-colors border border-slate-200 dark:border-slate-700 shadow-sm cursor-pointer"
              aria-label="Next Feature"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Squeezy Carousel Container with Auto-Scroll Hover Pause */}
      <div 
        onMouseEnter={() => setIsAutoScrollPaused(true)}
        onMouseLeave={() => setIsAutoScrollPaused(false)}
        className="flex flex-row w-full h-[380px] sm:h-[460px] max-w-full overflow-hidden mt-3"
      >
        <AnimatePresence initial={false}>
          {displayItems.map(({ item, originalIndex, visualIndex, key }) => {
            const isActive = visualIndex === 0;
            const flexValue = getFlex(visualIndex, originalIndex);
            const targetMargin = visualIndex === count - 1 ? 0 : 16; // 16px gap

            return (
              <motion.div
                layout
                key={key}
                initial={{ flex: 0, opacity: 0, marginRight: 0 }}
                animate={{ flex: flexValue, opacity: 1, marginRight: targetMargin }}
                exit={{ flex: 0, opacity: 0, marginRight: 0 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 250, 
                  damping: 25, 
                  mass: 0.8 
                }}
                onClick={() => setActiveAbsolute((prev) => prev + visualIndex)}
                onMouseEnter={() => setHoveredIndex(originalIndex)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`relative h-full overflow-hidden rounded-[24px] cursor-pointer group border-2 border-slate-200 dark:border-white/10 ${isActive ? 'is-active shadow-2xl ring-2 ring-blue-500/40' : 'hover:ring-1 hover:ring-white/20 opacity-85 hover:opacity-100'}`}
              >
                {/* Decorative Washi Tape Pin at Top */}
                <div className="absolute top-2 left-6 w-10 h-3.5 bg-[#E8DCC4]/90 dark:bg-[#2D2640]/90 border-x border-[#C5B39B] dark:border-amber-400/40 rotate-[-4deg] z-30 pointer-events-none" />
                
                {/* Background Image */}
                <div className="absolute inset-0 w-full h-full">
                  <img 
                    src={item.image} 
                    alt={item.label} 
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  {/* Darkening gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                </div>

                {/* Content Overlay - NOTEBOOK SCRIBBLE STICKY CARD OVERLAY */}
                <div className="relative z-20 w-full h-full flex flex-col justify-end p-4 sm:p-5">
                  <AnimatePresence mode="wait">
                    {isActive ? (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        transition={{ duration: 0.3 }}
                        className="bg-[#FFFDF7] dark:bg-[#171424] border-2 border-[#4A2E1B]/30 dark:border-amber-400/40 shadow-[4px_4px_0px_#4A2E1B] dark:shadow-[4px_4px_0px_#f59e0b] p-4 sm:p-5 rounded-2xl text-left relative overflow-hidden"
                      >
                        {/* Washi Tape Corner Pin on Card */}
                        <div className="absolute -top-1 right-6 w-8 h-3 bg-[#E8DCC4] dark:bg-[#2D2640] border-x border-[#C5B39B] dark:border-amber-400/30 rotate-[3deg] z-10 pointer-events-none" />

                        <div className="flex items-center gap-2.5 mb-2">
                          <div className="p-2 rounded-xl bg-blue-50 dark:bg-white/10 border border-blue-200 dark:border-white/20 shrink-0">
                            {item.icon}
                          </div>
                          <div>
                            <span className="text-[9px] font-mono font-extrabold text-blue-700 dark:text-amber-400 uppercase tracking-widest block">
                              {item.badgeText}
                            </span>
                            <h3 className="font-display font-black text-slate-900 dark:text-white text-base sm:text-lg leading-tight">
                              {item.label}
                            </h3>
                          </div>
                        </div>
                        <p className="text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-medium leading-relaxed font-serif">
                          {item.desc}
                        </p>
                      </motion.div>
                    ) : (
                      <div className="flex items-center gap-2.5 bg-[#FFFDF7]/90 dark:bg-[#171424]/90 backdrop-blur-sm p-3 rounded-xl border border-[#4A2E1B]/20 dark:border-white/10 shadow-md">
                        <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-white/10 shrink-0">
                          {item.icon}
                        </div>
                        <span className="font-display font-bold text-slate-900 dark:text-white text-xs sm:text-sm truncate">
                          {item.label}
                        </span>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AccordionGallery;
