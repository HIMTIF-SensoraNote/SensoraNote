import React, { useRef, useEffect, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScanText, Ear, Eye, Code, BrainCircuit } from 'lucide-react';

import './AccordionGallery.css';

interface GalleryItem {
  image?: string;
  content?: React.ReactNode;
  label?: string;
  link?: string;
  alt?: string;
}

const DEFAULT_ITEMS: GalleryItem[] = [
  { 
    label: 'AI Vision OCR',
    image: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=2070&auto=format&fit=crop',
    content: (
      <div className="flex flex-col items-center justify-center w-full h-full p-8 text-center bg-slate-950/50">
        <ScanText className="w-12 h-12 sm:w-16 sm:h-16 text-blue-400 drop-shadow-lg" />
        <div className="ag-content-text mt-4 sm:mt-6">
          <p className="text-xs sm:text-sm text-slate-200 max-w-xs drop-shadow-md font-medium leading-relaxed">Ubah foto catatan tulisan tangan menjadi teks digital instan dengan Computer Vision.</p>
        </div>
      </div>
    )
  },
  { 
    label: 'Sienna & Audio',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070&auto=format&fit=crop',
    content: (
      <div className="flex flex-col items-center justify-center w-full h-full p-8 text-center bg-slate-950/50">
        <Ear className="w-12 h-12 sm:w-16 sm:h-16 text-indigo-400 drop-shadow-lg" />
        <div className="ag-content-text mt-4 sm:mt-6">
          <p className="text-xs sm:text-sm text-slate-200 max-w-xs drop-shadow-md font-medium leading-relaxed">Dukungan aksesibilitas dan Text-to-Speech untuk materi yang didengarkan layaknya podcast.</p>
        </div>
      </div>
    )
  },
  { 
    label: 'Braille Converter',
    image: 'https://images.unsplash.com/photo-1588015386001-eb4d57c2c040?q=80&w=2070&auto=format&fit=crop',
    content: (
      <div className="flex flex-col items-center justify-center w-full h-full p-8 text-center bg-slate-950/50">
        <Eye className="w-12 h-12 sm:w-16 sm:h-16 text-amber-400 drop-shadow-lg" />
        <div className="ag-content-text mt-4 sm:mt-6">
          <p className="text-xs sm:text-sm text-slate-200 max-w-xs drop-shadow-md font-medium leading-relaxed">Ekspor otomatis catatan Anda ke format file fisik untuk dicetak menggunakan printer Braille.</p>
        </div>
      </div>
    )
  },
  { 
    label: 'LaTeX Screen Reader',
    image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2070&auto=format&fit=crop',
    content: (
      <div className="flex flex-col items-center justify-center w-full h-full p-8 text-center bg-slate-950/50">
        <Code className="w-12 h-12 sm:w-16 sm:h-16 text-emerald-400 drop-shadow-lg" />
        <div className="ag-content-text mt-4 sm:mt-6">
          <p className="text-xs sm:text-sm text-slate-200 max-w-xs drop-shadow-md font-medium leading-relaxed">Mesin rendering matematika yang dapat diinterpretasikan dengan tepat oleh Screen Reader.</p>
        </div>
      </div>
    )
  },
  { 
    label: 'AI Chatbot & Quiz',
    image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=2070&auto=format&fit=crop',
    content: (
      <div className="flex flex-col items-center justify-center w-full h-full p-8 text-center bg-slate-950/50">
        <BrainCircuit className="w-12 h-12 sm:w-16 sm:h-16 text-purple-400 drop-shadow-lg" />
        <div className="ag-content-text mt-4 sm:mt-6">
          <p className="text-xs sm:text-sm text-slate-200 max-w-xs drop-shadow-md font-medium leading-relaxed">Berdiskusi langsung tentang isi catatan dan mengukur pemahaman melalui kuis interaktif.</p>
        </div>
      </div>
    )
  }
];

interface AccordionGalleryProps {
  items?: GalleryItem[];
  defaultIndex?: number;
  accentColor?: string;
  overlayColor?: string;
  textColor?: string;
  height?: number;
  gap?: number;
  radius?: number;
  expandRatio?: number;
  orientation?: 'horizontal' | 'vertical';
  duration?: number;
  ease?: string;
  parallax?: number;
  tilt?: number;
  stagger?: number;
  trigger?: 'hover' | 'click';
  showLabels?: boolean;
  grayscale?: boolean;
  className?: string;
}

const AccordionGallery: React.FC<AccordionGalleryProps> = ({
  items = DEFAULT_ITEMS,
  defaultIndex = 2,
  accentColor = '#2563eb', // SensoraNote blue
  overlayColor = '#06050e', // SensoraNote dark background
  textColor = '#ffffff',
  height = 460,
  gap = 10,
  radius = 24, // Matches SensoraNote rounded-3xl slightly
  expandRatio = 0.52,
  orientation = 'horizontal',
  duration = 0.6,
  ease = 'power3.out',
  parallax = 0.5,
  tilt = 8,
  stagger = 0.06,
  trigger = 'hover',
  showLabels = true,
  grayscale = true,
  className = ''
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLElement | null)[]>([]);
  const mediaRefs = useRef<(HTMLElement | null)[]>([]);
  const barRefs = useRef<(HTMLElement | null)[]>([]);
  const textRefs = useRef<(HTMLElement | null)[]>([]);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const firstRunRef = useRef(true);
  const mediaSizeRef = useRef(320);

  const vertical = orientation === 'vertical';
  const count = items.length;
  const [active, setActive] = useState(Math.min(Math.max(defaultIndex, 0), count - 1));

  const prefersReduced =
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  const applyLayout = useCallback(
    (animate: boolean) => {
      const panels = panelRefs.current;
      if (!panels.length) return;

      const r = Math.min(Math.max(expandRatio, 0.2), 0.9);
      const grow = count > 1 ? (r * (count - 1)) / (1 - r) : 1;
      const mediaSize = mediaSizeRef.current;

      tlRef.current?.kill();
      const dur = animate && !prefersReduced ? duration : 0;
      const tl = gsap.timeline();

      panels.forEach((panel, i) => {
        if (!panel) return;
        const isActive = i === active;
        const media = mediaRefs.current[i];
        const bar = barRefs.current[i];
        const text = textRefs.current[i];

        const rot = isActive ? 0 : i < active ? tilt : -tilt;
        const rotProp = vertical ? { rotateX: -rot } : { rotateY: rot };

        tl.to(panel, { flexGrow: isActive ? grow : 1, ...rotProp, duration: dur, ease }, 0);

        if (media) {
          const drift = Math.max(-1.5, Math.min(1.5, active - i));
          const shift = drift * parallax * mediaSize * 0.06;
          const gray = grayscale ? (isActive ? 0 : 1) : 0;
          tl.to(
            media,
            {
              xPercent: -50,
              yPercent: -50,
              x: vertical ? 0 : isActive ? 0 : shift,
              y: vertical ? (isActive ? 0 : shift) : 0,
              '--ag-gray': gray,
              '--ag-dim': isActive ? 0 : 0.45,
              duration: dur,
              ease
            },
            0
          );
        }

        if (showLabels && bar && text) {
          if (isActive) {
            tl.to([bar, text], { opacity: 1, x: 0, duration: dur, ease, stagger: prefersReduced ? 0 : stagger }, 0);
          } else {
            tl.to([bar, text], { opacity: 0, x: -14, duration: dur * 0.6, ease }, 0);
          }
        }
      });

      tlRef.current = tl;
    },
    [
      active,
      count,
      expandRatio,
      duration,
      ease,
      vertical,
      tilt,
      parallax,
      grayscale,
      showLabels,
      stagger,
      prefersReduced
    ]
  );

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      const total = vertical ? rect.height : rect.width;
      const usable = Math.max(total - gap * (count - 1), 120);
      const size = Math.max(140, usable * Math.min(Math.max(expandRatio, 0.2), 0.9) * 1.22);
      mediaSizeRef.current = size;
      el.style.setProperty('--ag-media-size', `${size}px`);
      applyLayout(!firstRunRef.current);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [applyLayout, gap, count, expandRatio, vertical]);

  useEffect(() => {
    applyLayout(!firstRunRef.current);
    firstRunRef.current = false;
  }, [applyLayout]);

  useEffect(
    () => () => {
      tlRef.current?.kill();
    },
    []
  );

  const handleEnter = (i: number) => {
    if (trigger === 'hover') setActive(i);
  };

  const handleClick = (i: number, e: React.MouseEvent) => {
    if (i !== active) {
      e.preventDefault();
      setActive(i);
    }
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i + 1) % count);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i - 1 + count) % count);
    }
  };

  return (
    <div
      ref={rootRef}
      className={`accordion-gallery${vertical ? ' accordion-gallery--vertical' : ''}${className ? ` ${className}` : ''}`}
      style={{
        '--ag-accent': accentColor,
        '--ag-overlay': overlayColor,
        '--ag-text': textColor,
        '--ag-gap': `${gap}px`,
        '--ag-radius': `${radius}px`,
        height: vertical ? `${Math.round(height * 1.6)}px` : `${height}px`
      } as React.CSSProperties}
      role="list"
      aria-label="Image accordion gallery"
    >
      {items.map((item, i) => {
        const isActive = i === active;
        const Tag = item.link ? 'a' : 'div';
        return (
          <Tag
            key={i}
            ref={(el: any) => (panelRefs.current[i] = el)}
            className={`ag-panel${isActive ? ' ag-panel--active' : ''}`}
            style={{ borderRadius: `${radius}px` }}
            href={item.link || undefined}
            onClick={(e: any) => handleClick(i, e)}
            onMouseEnter={() => handleEnter(i)}
            onFocus={() => setActive(i)}
            onKeyDown={(e: any) => handleKeyDown(i, e)}
            role="listitem"
            tabIndex={0}
            aria-current={isActive ? 'true' : undefined}
            aria-label={item.label}
          >
            <span className="ag-panel__frame">
              <span className="ag-panel__media" ref={(el) => (mediaRefs.current[i] = el)}>
                {item.image && (
                  <img src={item.image} alt={item.alt || item.label || ''} draggable="false" />
                )}
                {item.content && (
                  <div className="absolute inset-0 z-10 pointer-events-none w-full h-full flex items-center justify-center">
                    {item.content}
                  </div>
                )}
              </span>
              <span className="ag-panel__overlay" aria-hidden="true" />
            </span>
            {showLabels && (
              <span className="ag-panel__label" aria-hidden="true">
                <span className="ag-panel__bar" ref={(el) => (barRefs.current[i] = el)} />
                <span className="ag-panel__text" ref={(el) => (textRefs.current[i] = el)}>
                  {item.label}
                </span>
              </span>
            )}
          </Tag>
        );
      })}
    </div>
  );
};

export default AccordionGallery;
