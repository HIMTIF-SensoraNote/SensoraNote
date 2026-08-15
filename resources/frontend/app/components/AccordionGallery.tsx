import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ScanText, Ear, Eye, Code, BrainCircuit, ChevronLeft, ChevronRight } from 'lucide-react';
import './AccordionGallery.css';

interface GalleryItem {
  image?: string;
  content?: React.ReactNode;
  label?: string;
}

const DEFAULT_ITEMS: GalleryItem[] = [
  { 
    label: 'AI Vision OCR',
    image: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=2070&auto=format&fit=crop',
    content: (
      <div className="flex flex-col items-center justify-center w-full h-full p-8 text-center bg-slate-950/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-500">
        <ScanText className="w-12 h-12 sm:w-16 sm:h-16 text-blue-400 drop-shadow-lg scale-90 group-hover:scale-100 transition-transform duration-500" />
        <div className="mt-4 sm:mt-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-700 delay-100">
          <p className="text-xs sm:text-sm text-slate-200 max-w-xs drop-shadow-md font-medium leading-relaxed">Ubah foto catatan tulisan tangan menjadi teks digital instan dengan Computer Vision.</p>
        </div>
      </div>
    )
  },
  { 
    label: 'Sienna & Audio',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070&auto=format&fit=crop',
    content: (
      <div className="flex flex-col items-center justify-center w-full h-full p-8 text-center bg-slate-950/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-500">
        <Ear className="w-12 h-12 sm:w-16 sm:h-16 text-indigo-400 drop-shadow-lg scale-90 group-hover:scale-100 transition-transform duration-500" />
        <div className="mt-4 sm:mt-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-700 delay-100">
          <p className="text-xs sm:text-sm text-slate-200 max-w-xs drop-shadow-md font-medium leading-relaxed">Dukungan aksesibilitas dan Text-to-Speech untuk materi yang didengarkan layaknya podcast.</p>
        </div>
      </div>
    )
  },
  { 
    label: 'Braille Converter',
    image: 'https://images.unsplash.com/photo-1588015386001-eb4d57c2c040?q=80&w=2070&auto=format&fit=crop',
    content: (
      <div className="flex flex-col items-center justify-center w-full h-full p-8 text-center bg-slate-950/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-500">
        <Eye className="w-12 h-12 sm:w-16 sm:h-16 text-amber-400 drop-shadow-lg scale-90 group-hover:scale-100 transition-transform duration-500" />
        <div className="mt-4 sm:mt-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-700 delay-100">
          <p className="text-xs sm:text-sm text-slate-200 max-w-xs drop-shadow-md font-medium leading-relaxed">Ekspor otomatis catatan Anda ke format file fisik untuk dicetak menggunakan printer Braille.</p>
        </div>
      </div>
    )
  },
  { 
    label: 'LaTeX Screen Reader',
    image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2070&auto=format&fit=crop',
    content: (
      <div className="flex flex-col items-center justify-center w-full h-full p-8 text-center bg-slate-950/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-500">
        <Code className="w-12 h-12 sm:w-16 sm:h-16 text-emerald-400 drop-shadow-lg scale-90 group-hover:scale-100 transition-transform duration-500" />
        <div className="mt-4 sm:mt-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-700 delay-100">
          <p className="text-xs sm:text-sm text-slate-200 max-w-xs drop-shadow-md font-medium leading-relaxed">Mesin rendering matematika yang dapat diinterpretasikan dengan tepat oleh Screen Reader.</p>
        </div>
      </div>
    )
  },
  { 
    label: 'AI Chatbot & Quiz',
    image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=2070&auto=format&fit=crop',
    content: (
      <div className="flex flex-col items-center justify-center w-full h-full p-8 text-center bg-slate-950/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-500">
        <BrainCircuit className="w-12 h-12 sm:w-16 sm:h-16 text-purple-400 drop-shadow-lg scale-90 group-hover:scale-100 transition-transform duration-500" />
        <div className="mt-4 sm:mt-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-700 delay-100">
          <p className="text-xs sm:text-sm text-slate-200 max-w-xs drop-shadow-md font-medium leading-relaxed">Berdiskusi langsung tentang isi catatan dan mengukur pemahaman melalui kuis interaktif.</p>
        </div>
      </div>
    )
  }
];

const AccordionGallery: React.FC = () => {
  const [activeAbsolute, setActiveAbsolute] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const count = DEFAULT_ITEMS.length;

  const handleNext = () => setActiveAbsolute((prev) => prev + 1);
  const handlePrev = () => setActiveAbsolute((prev) => prev - 1);

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
      {/* Header with Navigation Controls */}
      <div className="flex justify-end gap-3 mb-6">
        <button 
          onClick={handlePrev}
          className="w-10 h-10 rounded-full bg-blue-100 dark:bg-[#1d4ed8]/20 text-blue-600 dark:text-[#38bdf8] hover:bg-blue-200 dark:hover:bg-[#1d4ed8]/40 flex items-center justify-center transition-colors border border-blue-200/50 dark:border-white/10"
          aria-label="Previous Feature"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button 
          onClick={handleNext}
          className="w-10 h-10 rounded-full bg-blue-100 dark:bg-[#1d4ed8]/20 text-blue-600 dark:text-[#38bdf8] hover:bg-blue-200 dark:hover:bg-[#1d4ed8]/40 flex items-center justify-center transition-colors border border-blue-200/50 dark:border-white/10"
          aria-label="Next Feature"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Squeezy Carousel Container */}
      <div className="flex flex-row w-full h-[380px] sm:h-[460px] max-w-full overflow-hidden">
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
                className={`relative h-full overflow-hidden rounded-[24px] cursor-pointer group ${isActive ? 'is-active shadow-2xl ring-2 ring-white/10' : 'hover:ring-1 hover:ring-white/20 opacity-80 hover:opacity-100'}`}
              >
                {/* Background Image */}
                <div className="absolute inset-0 w-full h-full">
                  <img 
                    src={item.image} 
                    alt={item.label} 
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  {/* Overlay Dimmer yang sangat tipis agar gambar utamanya cerah */}
                  <div className={`absolute inset-0 transition-colors duration-500 ${isActive ? 'bg-transparent' : 'bg-black/10'}`} />
                </div>

                {/* Content Overlay */}
                <div className="relative z-10 w-full h-full flex flex-col justify-end">
                  <div className="absolute inset-0 z-0">
                    {item.content}
                  </div>
                  
                  {/* Label Bar */}
                  <div className="absolute bottom-5 left-5 right-5 z-20 flex items-center gap-3">
                    <div className="w-1 h-6 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                    <span className="font-display font-bold text-white text-lg drop-shadow-md truncate">
                      {item.label}
                    </span>
                  </div>
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
