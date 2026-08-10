import { useDocumentTitle } from '../hooks/useDocumentTitle';
import React, { useState, useEffect, useRef } from 'react';
import { Link, Navigate } from 'react-router';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { Navbar } from '../components/navbar';
import { Footer } from '../components/footer';
import { AuthModal } from '../components/auth-modal';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../contexts/AuthContext';
import { 
  ArrowRight, Layers, Shield, Sparkles, Target, Users, Zap, LayoutTemplate, 
  ScanText, Ear, Bot, Eye, Code, BrainCircuit, Search, Share2, CornerDownRight, 
  Award, CheckCircle2, ChevronRight, FileText, Check, Cpu 
} from 'lucide-react';
import { BrutalistLoader } from '../components/brutalist-loader';
import katex from 'katex';
import 'katex/dist/katex.min.css';

/* ===================================================
   COMPONENT: Word-by-Word Scroll Reveal
   =================================================== */
function Word({ word, progress, range }: { word: string; progress: any; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.25, 1]);
  const color = useTransform(progress, range, ["#94a3b8", "#0f172a"]);

  return (
    <motion.span style={{ opacity, color }} className="inline-block mr-2 transition-colors">
      {word}
    </motion.span>
  );
}

function ScrollRevealPhilosophy() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.85", "end 0.35"]
  });

  const text = "Kami percaya bahwa pendidikan terbaik lahir dari kolaborasi. SensoraNote menyusun gagasan dan berbagi wawasan dalam komunitas belajar yang saling mendukung tanpa batasan.";
  const words = text.split(" ");

  return (
    <div ref={containerRef} className="py-20 bg-white relative z-20 overflow-hidden border-b border-slate-200/60">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <p className="text-xs font-extrabold text-blue-600 uppercase tracking-[0.25em] mb-6 flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" /> FILOSOFI PEMBELAJARAN
        </p>

        <h3 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.3] text-center">
          {words.map((word, i) => {
            const start = i / words.length;
            const end = (i + 1) / words.length;
            return <Word key={i} word={word} progress={scrollYProgress} range={[start, end]} />;
          })}
        </h3>
      </div>
    </div>
  );
}

/* ===================================================
   COMPONENT: Infinite Scroll Marquee Row
   =================================================== */
function MarqueeRowLight({ items, direction = 'left', speed = 35 }: { items: string[]; direction?: 'left' | 'right'; speed?: number }) {
  const duplicatedItems = [...items, ...items, ...items];
  
  return (
    <div className="flex w-full overflow-hidden py-1 relative">
      <motion.div
        className="flex gap-4 whitespace-nowrap"
        animate={{
          x: direction === 'left' ? ["0%", "-33.33%"] : ["-33.33%", "0%"]
        }}
        transition={{
          ease: "linear",
          duration: speed,
          repeat: Infinity,
        }}
      >
        {duplicatedItems.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-white border border-slate-200/80 shadow-sm backdrop-blur-md text-sm font-semibold text-slate-700 hover:border-blue-400 hover:shadow-md transition-all duration-300 select-none cursor-default"
          >
            {item}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

/* ===================================================
   COMPONENT: Count-Up Animation
   =================================================== */
function CountUp({ to, duration = 2 }: { to: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    let frameId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const easeProgress = progress * (2 - progress);
      setCount(Math.floor(easeProgress * to));

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      }
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [to, duration]);

  return <span>{count.toLocaleString()}</span>;
}

/* ===================================================
   COMPONENT: Hero Interactive Sandbox Mockup
   =================================================== */
function HeroInteractiveDemo() {
  const [activeTab, setActiveTab] = useState<'editor' | 'latex' | 'ocr' | 'quiz'>('editor');
  const [latexRendered, setLatexRendered] = useState('');
  const [quizSelected, setQuizSelected] = useState<number | null>(null);

  useEffect(() => {
    try {
      const html = katex.renderToString('\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}', {
        displayMode: true,
        throwOnError: false,
      });
      setLatexRendered(html);
    } catch {
      setLatexRendered('\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}');
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTab((prev) => {
        if (prev === 'editor') return 'latex';
        if (prev === 'latex') return 'ocr';
        if (prev === 'ocr') return 'quiz';
        return 'editor';
      });
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(15,23,42,0.12)] border border-slate-200/90 overflow-hidden backdrop-blur-xl">
      {/* Window Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/80">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-rose-400" />
          <div className="w-3 h-3 rounded-full bg-amber-400" />
          <div className="w-3 h-3 rounded-full bg-emerald-400" />
        </div>

        <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-xl text-xs font-semibold text-slate-600">
          <button
            onClick={() => setActiveTab('editor')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${activeTab === 'editor' ? 'bg-white text-blue-600 shadow-sm font-bold' : 'hover:text-slate-900'}`}
          >
            <FileText className="w-3.5 h-3.5" /> Editor
          </button>
          <button
            onClick={() => setActiveTab('latex')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${activeTab === 'latex' ? 'bg-white text-indigo-600 shadow-sm font-bold' : 'hover:text-slate-900'}`}
          >
            <Code className="w-3.5 h-3.5" /> KaTeX
          </button>
          <button
            onClick={() => setActiveTab('ocr')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${activeTab === 'ocr' ? 'bg-white text-emerald-600 shadow-sm font-bold' : 'hover:text-slate-900'}`}
          >
            <ScanText className="w-3.5 h-3.5" /> AI Scan
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${activeTab === 'quiz' ? 'bg-white text-amber-600 shadow-sm font-bold' : 'hover:text-slate-900'}`}
          >
            <BrainCircuit className="w-3.5 h-3.5" /> Quiz
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> Live Engine
        </div>
      </div>

      <div className="p-6 sm:p-8 min-h-[350px] bg-white flex flex-col justify-between relative">
        <AnimatePresence mode="wait">
          {activeTab === 'editor' && (
            <motion.div
              key="editor"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-bold">Fisika Quantum</span>
                  <span className="text-xs text-slate-400">Diperbarui 2 mnt lalu</span>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verifikasi Pakar
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900">Dualisme Gelombang Partikel & Persamaan Schrödinger</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Fungsi gelombang <code className="bg-slate-100 text-blue-600 px-1.5 py-0.5 rounded font-mono text-xs">Ψ(x,t)</code> menggambarkan keadaan kuantum dari sistem fisik yang terisolasi...
              </p>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                  <span>Progres Pembahasan</span>
                  <span className="text-blue-600 font-bold">85% Selesai</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full w-[85%]" />
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'latex' && (
            <motion.div
              key="latex"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md font-semibold">KaTeX Render Engine v0.16</span>
                <span className="text-xs text-slate-400">Rendering 60 FPS</span>
              </div>
              <div className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-xs overflow-x-auto border border-slate-800">
                <span className="text-indigo-400">{"$$\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}$$"}</span>
              </div>
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center flex flex-col items-center justify-center min-h-[110px]">
                <div dangerouslySetInnerHTML={{ __html: latexRendered }} className="text-lg text-slate-900" />
              </div>
            </motion.div>
          )}

          {activeTab === 'ocr' && (
            <motion.div
              key="ocr"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md flex items-center gap-1">
                  <ScanText className="w-3.5 h-3.5" /> OpenCV Vision Preview
                </span>
                <span className="text-xs text-slate-400">Akurasi OCR 99.4%</span>
              </div>
              <div className="relative bg-slate-100 rounded-xl p-4 border border-slate-200 overflow-hidden h-32 flex items-center justify-center">
                <motion.div
                  animate={{ y: [-50, 50, -50] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent shadow-[0_0_12px_#10b981]"
                />
                <div className="text-center">
                  <p className="font-serif italic text-slate-600 text-sm">"Catatan Tulisan Tangan Fisika Bab 4..."</p>
                  <span className="inline-block mt-2 px-3 py-1 bg-white rounded-full text-xs font-semibold text-emerald-600 border border-emerald-200 shadow-sm">
                    Memindai Kertas → Teks Digital
                  </span>
                </div>
              </div>
              <div className="bg-emerald-50/60 border border-emerald-200/80 p-3 rounded-xl text-xs text-emerald-900 flex items-center justify-between">
                <span>Hasil Ekspor: <strong>Editable Markdown + Braille File</strong></span>
                <Check className="w-4 h-4 text-emerald-600" />
              </div>
            </motion.div>
          )}

          {activeTab === 'quiz' && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md flex items-center gap-1">
                  <BrainCircuit className="w-3.5 h-3.5" /> AI Quiz Generator
                </span>
                <span className="text-xs text-slate-400">Modul 03/10</span>
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">Apa implikasi utama dari Teorema Ketidakpastian Heisenberg?</h4>
              <div className="space-y-2">
                {[
                  "Posisi & momentum partikel tidak dapat diukur tepat bersamaan.",
                  "Energi foton selalu berbanding lurus dengan massa.",
                  "Elektron bergerak dalam lintasan lingkaran yang konstan."
                ].map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => setQuizSelected(i)}
                    className={`w-full text-left p-2.5 rounded-xl text-xs font-medium border transition-all flex items-center justify-between cursor-pointer ${
                      quizSelected === i
                        ? i === 0
                          ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold'
                          : 'bg-rose-50 border-rose-400 text-rose-900'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span>{opt}</span>
                    {quizSelected === i && i === 0 && <Check className="w-4 h-4 text-emerald-600" />}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-medium">
          <span>SensoraNote Workspace v2.4</span>
          <span className="text-blue-600 font-bold flex items-center gap-1 cursor-pointer hover:underline">
            Uji Coba Sandbox <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
}

export function LandingPageLight() {
  const { t } = useTranslation();
  const { user, isLoading: isAuthLoading } = useAuth();
  useDocumentTitle(t('titles.welcome'));
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; defaultTab: 'login' | 'register' }>({
    isOpen: false,
    defaultTab: 'login',
  });

  if (isAuthLoading) {
    return <BrutalistLoader onComplete={() => {}} />;
  }

  if (user && user.email_verified_at) {
    return <Navigate to="/app/home" replace />;
  }
  if (user && !user.email_verified_at) {
    return <Navigate to="/app/verify-email" replace />;
  }

  const openAuthModal = (tab: 'login' | 'register') => {
    setAuthModal({ isOpen: true, defaultTab: tab });
  };

  const row1Items = [
    `🌍 20 Bahasa Didukung`,
    `⚡ Teks Editor Dinamis`,
    `📚 Topik Belajar yang Luas`,
    `🎓 Dari SD hingga Kuliah`,
    `🔥 Sistem Streak & Habit`,
    `🔍 Pencarian Cerdas`,
  ];

  const row2Items = [
    `➗ Tulis Rumus KaTeX`,
    `🤝 Belajar Bersama Komunitas`,
    `📁 Kumpulan Catatan Rapi`,
    `💡 Saling Berbagi Pikiran`,
    `📈 Tumbuh & Berkembang Bersama`,
    `📱 Akses Belajar Kapan Saja`,
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 selection:bg-blue-200 font-sans overflow-x-hidden relative">
      <Navbar theme="light" />

      {/* =========================================
          1. HERO SECTION
          ========================================= */}
      <section className="relative pt-32 pb-20 lg:pt-44 lg:pb-32 overflow-hidden bg-gradient-to-b from-white via-slate-50/80 to-slate-100/50 border-b border-slate-200/60">
        {/* Ambient Gradient Blobs */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
           <div className="absolute -top-[10%] -right-[5%] w-[55vw] h-[55vw] rounded-full bg-gradient-to-br from-blue-100/70 via-indigo-100/50 to-purple-100/40 blur-[100px] opacity-70 animate-pulse" style={{ animationDuration: '8s' }} />
           <div className="absolute top-[20%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-tr from-sky-100/80 via-blue-50/60 to-indigo-50/50 blur-[110px] opacity-70" />
        </div>

        <main className="relative z-10 px-6 lg:px-8 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-14">
          {/* Left Text Column */}
          <div className="flex-1 max-w-2xl text-center lg:text-left pt-2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-blue-200/90 shadow-sm backdrop-blur-md mb-6">
                <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-ping" />
                <span className="text-xs font-extrabold text-blue-700 uppercase tracking-wider flex items-center gap-1">
                  Generasi Baru Catatan Digital <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                </span>
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-[4.5rem] font-extrabold tracking-tight text-slate-900 mb-6 leading-[1.06]">
                Infrastruktur untuk <br className="hidden lg:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">ilmu pengetahuan.</span>
              </h1>

              <p className="text-base sm:text-xl text-slate-600 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                SensoraNote menyatukan kejelasan catatan akademis, kolaborasi komunitas, dan teknologi aksesibilitas inklusif dalam satu platform super cepat.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <button
                  onClick={() => openAuthModal('register')}
                  className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-full font-bold transition-all shadow-xl hover:shadow-2xl hover:shadow-blue-900/20 hover:-translate-y-0.5 flex items-center justify-center gap-2 group text-base cursor-pointer"
                >
                  Mulai Bebas Biaya
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
                </button>
                <Link
                  to="/app/katalog"
                  className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-full font-bold transition-all flex items-center justify-center gap-2 text-base hover:shadow-md hover:-translate-y-0.5"
                >
                  Jelajahi Katalog Catatan
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <span className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-emerald-500" /> Enkripsi Aman</span>
                <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-amber-500" /> Super Cepat</span>
                <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-blue-500" /> Komunitas Aktif</span>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Hero Interactive Sandbox */}
          <div className="flex-1 w-full max-w-2xl relative">
            <HeroInteractiveDemo />
          </div>
        </main>
      </section>

      {/* =========================================
          2. SCROLL REVEAL PHILOSOPHY
          ========================================= */}
      <ScrollRevealPhilosophy />

      {/* =========================================
          3. LOGO CLOUD & MARQUEE SHOWCASE
          ========================================= */}
      <section className="py-12 bg-white relative z-20 overflow-hidden border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6 text-center mb-6">
          <p className="text-xs font-extrabold text-slate-400 uppercase tracking-[0.25em]">Dipercaya oleh Pelajar, Peneliti & Pengajar</p>
        </div>

        <div className="flex flex-col gap-3 relative w-full max-w-[100vw] overflow-hidden">
          <MarqueeRowLight items={row1Items} direction="left" speed={40} />
          <MarqueeRowLight items={row2Items} direction="right" speed={45} />
        </div>
      </section>

      {/* =========================================
          4. CORE PRODUCT CAPABILITIES (Clean Grid)
          ========================================= */}
      <section className="py-24 relative bg-white z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="mb-16 text-center max-w-3xl mx-auto">
            <span className="text-xs font-extrabold text-blue-600 uppercase tracking-[0.2em] mb-3 block">KAPABILITAS UTAMA</span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Alat yang dibuat untuk <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">fokus & kecepatan.</span>
            </h2>
            <p className="text-slate-600 text-lg mt-4">
              Semua kebutuhan akademis Anda terintegrasi secara rapi dari penulisan formula KaTeX hingga kolaborasi grup.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature Card 1 */}
            <div className="bg-slate-50/70 p-8 rounded-3xl border border-slate-200/80 hover:bg-white hover:shadow-xl hover:border-blue-300 transition-all duration-300 group flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 bg-blue-100/80 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm">
                  <Code className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">LaTeX Rich Editor</h3>
                <p className="text-slate-600 leading-relaxed text-sm mb-6">
                  Tulis rumus matematika dan sains seindah jurnal akademis profesional menggunakan render engine KaTeX berkecepatan tinggi.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-200/60 flex items-center justify-between text-xs font-bold text-blue-600">
                <span>KaTeX 60 FPS Render</span>
                <CornerDownRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Feature Card 2 */}
            <div className="bg-slate-50/70 p-8 rounded-3xl border border-slate-200/80 hover:bg-white hover:shadow-xl hover:border-emerald-300 transition-all duration-300 group flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 bg-emerald-100/80 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm">
                  <Award className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">Pakar Verified</h3>
                <p className="text-slate-600 leading-relaxed text-sm mb-6">
                  Setiap catatan krusial dapat ditinjau oleh pakar bidang studi atau guru terverifikasi untuk memastikan kebenaran rumus dan konsep.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-200/60 flex items-center justify-between text-xs font-bold text-emerald-600">
                <span>Jaminan Akurasi Materi</span>
                <CornerDownRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Feature Card 3 */}
            <div className="bg-slate-50/70 p-8 rounded-3xl border border-slate-200/80 hover:bg-white hover:shadow-xl hover:border-indigo-300 transition-all duration-300 group flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 bg-indigo-100/80 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm">
                  <Search className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">Pencarian Universal</h3>
                <p className="text-slate-600 leading-relaxed text-sm mb-6">
                  Temukan frasa yang tepat, tag spesifik, atau judul bab dalam pecahan detik berkat pengindeksan teks penuh yang sangat dioptimalkan.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-200/60 flex items-center justify-between text-xs font-bold text-indigo-600">
                <span>Pencarian Instant Sub-Detik</span>
                <CornerDownRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Feature Card 4 */}
            <div className="bg-slate-50/70 p-8 rounded-3xl border border-slate-200/80 hover:bg-white hover:shadow-xl hover:border-purple-300 transition-all duration-300 group flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 bg-purple-100/80 text-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm">
                  <Users className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">Katalog & Profil Publik</h3>
                <p className="text-slate-600 leading-relaxed text-sm mb-6">
                  Bangun portofolio pembelajaran Anda. Publikasikan catatan terbaik Anda agar dapat dicari dan dimanfaatkan oleh pelajar lainnya secara global.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-200/60 flex items-center justify-between text-xs font-bold text-purple-600">
                <span>Jaringan Kolaborasi Global</span>
                <CornerDownRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Feature Card 5 - Span 2 */}
            <div className="bg-slate-50/70 p-8 rounded-3xl border border-slate-200/80 hover:bg-white hover:shadow-xl hover:border-amber-300 transition-all duration-300 group lg:col-span-2 flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 bg-amber-100/80 text-amber-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm">
                  <Layers className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">Organisasi Hierarki Cerdas</h3>
                <p className="text-slate-600 leading-relaxed text-sm mb-6 max-w-xl">
                  Kelola catatan dalam struktur folder bertingkat tanpa batas, sertakan tag khusus, serta akses statistik habit belajar Anda secara berkala.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-200/60 flex items-center justify-between text-xs font-bold text-amber-600">
                <span>Manajemen Modul Tanpa Batas</span>
                <CornerDownRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          5. UPCOMING INNOVATIVE ROADMAP (Dark Tech Section)
          ========================================= */}
      <section className="py-28 relative bg-[#090D16] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
        <div className="absolute top-1/3 right-1/4 w-[40vw] h-[40vw] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-3xl mb-16">
            <span className="text-xs font-extrabold text-blue-400 tracking-[0.25em] uppercase mb-4 block">ROADMAP MASA DEPAN</span>
            <h3 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Membangun platform pendidikan yang <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300">100% Inklusif</span>.
            </h3>
            <p className="text-slate-400 text-lg mt-6 leading-relaxed">
              Kami sedang mengembangkan teknologi AI & aksesibilitas tingkat tinggi untuk memastikan setiap pelajar dengan berbagai kebutuhan dapat mengakses pengetahuan tanpa batas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Tech Card 1 */}
            <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-3xl p-8 hover:border-blue-500/50 transition-all duration-300 group">
               <div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-blue-500/20">
                 <ScanText className="w-6 h-6" />
               </div>
               <h4 className="text-xl font-bold text-white mb-3">AI Vision OCR</h4>
               <p className="text-slate-400 text-sm leading-relaxed">Teknologi <span className="text-slate-200 font-semibold">OpenCV & Google Vision API</span>. Ubah foto catatan tulisan tangan di kertas menjadi teks digital yang dapat diedit secara instan.</p>
            </div>

            {/* Tech Card 2 */}
            <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-3xl p-8 hover:border-indigo-500/50 transition-all duration-300 group">
               <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-indigo-500/20">
                 <Ear className="w-6 h-6" />
               </div>
               <h4 className="text-xl font-bold text-white mb-3">Sienna & Text-to-Speech</h4>
               <p className="text-slate-400 text-sm leading-relaxed">Dukungan widget aksesibilitas (Sienna Community) dan integrasi Text-to-Speech agar materi dapat didengarkan layaknya podcast.</p>
            </div>

            {/* Tech Card 3 */}
            <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-3xl p-8 hover:border-amber-500/50 transition-all duration-300 group">
               <div className="w-12 h-12 bg-amber-500/10 text-amber-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-amber-500/20">
                 <Eye className="w-6 h-6" />
               </div>
               <h4 className="text-xl font-bold text-white mb-3">Braille File Converter</h4>
               <p className="text-slate-400 text-sm leading-relaxed">Ekspor catatan Anda ke dalam format file Braille khusus. Siap dicetak langsung menggunakan printer Braille fisik.</p>
            </div>

            {/* Tech Card 4 */}
            <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-3xl p-8 hover:border-emerald-500/50 transition-all duration-300 group">
               <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-emerald-500/20">
                 <Code className="w-6 h-6" />
               </div>
               <h4 className="text-xl font-bold text-white mb-3">LaTeX Screen Reader</h4>
               <p className="text-slate-400 text-sm leading-relaxed">Mesin rendering matematika yang dapat dibaca dan diinterpretasikan dengan benar oleh *screen reader* bagi tunanetra.</p>
            </div>

            {/* Tech Card 5 */}
            <div className="lg:col-span-2 bg-gradient-to-r from-blue-950/70 via-slate-900/90 to-slate-900/70 backdrop-blur-md border border-blue-500/30 rounded-3xl p-8 hover:border-blue-400/60 transition-all duration-300 group relative overflow-hidden">
               <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/10 blur-3xl rounded-full" />
               <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform relative z-10 border border-blue-400/30">
                 <BrainCircuit className="w-6 h-6" />
               </div>
               <h4 className="text-2xl font-bold text-white mb-3 relative z-10">AI Chatbot & Quiz Generator</h4>
               <p className="text-slate-300 text-base leading-relaxed relative z-10 max-w-xl">
                 Asisten AI personal yang siap diajak berdiskusi tentang isi catatan Anda, merekap materi, hingga otomatis membuatkan latihan soal & kuis interaktif.
               </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          6. FINAL CALL TO ACTION
          ========================================= */}
      <section className="py-24 relative bg-white border-t border-slate-200/60">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">
            Bergabung dengan <span className="text-blue-600"><CountUp to={15420} duration={2.5} />+</span> pengguna aktif.
          </h2>
          <p className="text-slate-600 text-base sm:text-lg mb-10 max-w-2xl mx-auto font-medium">
            Siap merasakan pengalaman baru mencatat dan berkolaborasi? Coba SensoraNote secara gratis hari ini.
          </p>
          <button
             onClick={() => openAuthModal('register')}
             className="px-10 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-full font-bold shadow-xl shadow-blue-900/10 hover:scale-105 transition-all duration-300 text-base cursor-pointer"
          >
             Mulai Buat Akun Gratis
          </button>
        </div>
      </section>

      <Footer />
      
      <AuthModal 
        isOpen={authModal.isOpen} 
        onClose={() => setAuthModal(prev => ({ ...prev, isOpen: false }))} 
        defaultTab={authModal.defaultTab} 
      />
    </div>
  );
}
