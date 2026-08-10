import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, Volume2, VolumeX, Type, Contrast, Sparkles, Check, X, RotateCcw } from 'lucide-react';
import GlassSurface from './GlassSurface';

export interface AccessibilityState {
  highContrast: boolean;
  largeText: boolean;
  dyslexicFont: boolean;
  grayscale: boolean;
  isSpeaking: boolean;
}

export function AccessibilityWidget({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [settings, setSettings] = useState<AccessibilityState>({
    highContrast: false,
    largeText: false,
    dyslexicFont: false,
    grayscale: false,
    isSpeaking: false,
  });

  // Apply real DOM mutations when accessibility settings change
  useEffect(() => {
    const root = document.documentElement;

    // High Contrast
    if (settings.highContrast) {
      root.classList.add('accessibility-high-contrast');
    } else {
      root.classList.remove('accessibility-high-contrast');
    }

    // Large Text
    if (settings.largeText) {
      root.style.fontSize = '18px';
    } else {
      root.style.fontSize = '';
    }

    // Dyslexia-friendly Font
    if (settings.dyslexicFont) {
      root.style.fontFamily = 'Comic Sans MS, Tahoma, sans-serif';
    } else {
      root.style.fontFamily = '';
    }

    // Grayscale
    if (settings.grayscale) {
      root.style.filter = 'grayscale(100%)';
    } else {
      root.style.filter = '';
    }
  }, [settings]);

  // Speech Synthesis Handler
  const toggleSpeech = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Browser Anda tidak mendukung Web Speech Synthesis.');
      return;
    }

    if (settings.isSpeaking) {
      window.speechSynthesis.cancel();
      setSettings((prev) => ({ ...prev, isSpeaking: false }));
    } else {
      const textToRead = "Selamat datang di SensoraNote. Platform kolaborasi catatan inklusif untuk semua pelajar. Nikmati kemudahan belajar dengan bantuan AI dan aksesibilitas penuh.";
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = 'id-ID';
      utterance.rate = 0.95;

      utterance.onend = () => {
        setSettings((prev) => ({ ...prev, isSpeaking: false }));
      };
      utterance.onerror = () => {
        setSettings((prev) => ({ ...prev, isSpeaking: false }));
      };

      setSettings((prev) => ({ ...prev, isSpeaking: true }));
      window.speechSynthesis.speak(utterance);
    }
  };

  const resetSettings = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSettings({
      highContrast: false,
      largeText: false,
      dyslexicFont: false,
      grayscale: false,
      isSpeaking: false,
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.92 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 p-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200 dark:border-slate-800 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] text-slate-900 dark:text-white"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-xl">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm tracking-tight">Sienna Accessibility</h3>
              <p className="text-[11px] text-slate-400 font-medium">Panel Alat Inklusivitas Belajar</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Controls Grid */}
        <div className="space-y-3">
          {/* Text-to-Speech Control */}
          <button
            onClick={toggleSpeech}
            className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between ${
              settings.isSpeaking
                ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-400 text-blue-700 dark:text-blue-300 font-bold shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-blue-300'
            }`}
          >
            <div className="flex items-center gap-3">
              {settings.isSpeaking ? <Volume2 className="w-5 h-5 text-blue-600 animate-bounce" /> : <VolumeX className="w-5 h-5 text-slate-400" />}
              <div>
                <p className="text-xs font-bold">Pembaca Suara (Text-to-Speech)</p>
                <p className="text-[10px] text-slate-400">{settings.isSpeaking ? 'Sedang Membaca...' : 'Dengarkan isi ringkasan halaman'}</p>
              </div>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${settings.isSpeaking ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
              {settings.isSpeaking ? 'Berhenti' : 'Putar'}
            </span>
          </button>

          {/* High Contrast Toggle */}
          <button
            onClick={() => setSettings((prev) => ({ ...prev, highContrast: !prev.highContrast }))}
            className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between ${
              settings.highContrast
                ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-400 text-emerald-800 dark:text-emerald-300 font-bold'
                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <Contrast className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-semibold">Mode Kontras Tinggi</span>
            </div>
            {settings.highContrast && <Check className="w-4 h-4 text-emerald-600" />}
          </button>

          {/* Large Font Size Toggle */}
          <button
            onClick={() => setSettings((prev) => ({ ...prev, largeText: !prev.largeText }))}
            className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between ${
              settings.largeText
                ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-400 text-emerald-800 dark:text-emerald-300 font-bold'
                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <Type className="w-4 h-4 text-indigo-500" />
              <span className="text-xs font-semibold">Ukuran Teks Lebih Besar (+125%)</span>
            </div>
            {settings.largeText && <Check className="w-4 h-4 text-emerald-600" />}
          </button>

          {/* Dyslexia Friendly Font Toggle */}
          <button
            onClick={() => setSettings((prev) => ({ ...prev, dyslexicFont: !prev.dyslexicFont }))}
            className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between ${
              settings.dyslexicFont
                ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-400 text-emerald-800 dark:text-emerald-300 font-bold'
                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-semibold">Font Ramah Disleksia</span>
            </div>
            {settings.dyslexicFont && <Check className="w-4 h-4 text-emerald-600" />}
          </button>
        </div>

        {/* Footer Actions */}
        <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={resetSettings}
            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 font-semibold transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Pengaturan
          </button>
          <span className="text-[10px] text-slate-400 font-mono">Sienna v1.2 Active</span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
