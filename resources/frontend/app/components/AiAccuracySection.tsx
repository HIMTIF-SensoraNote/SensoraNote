import React from 'react';
import { motion } from 'motion/react';
import {
  ScanText,
  FileText,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

interface AiAccuracySectionProps {
  theme: 'light' | 'dark';
}

export function AiAccuracySection({ theme }: AiAccuracySectionProps) {
  const { t } = useTranslation();
  const isLight = theme === 'light';

  const models = [
    {
      id: 'cropper',
      title: 'YOLOv8-seg Smart Cropper',
      icon: <ScanText className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500" />,
      highlightScore: '81.6%',
      highlightLabel: 'Validation Precision (IoU 0.5)',
      progressValue: 82,
      accentColor: 'from-emerald-500 to-teal-600',
      scoreColor: isLight ? 'text-emerald-700' : 'text-emerald-400',
      metrics: [
        { label: 'Peak Precision (Max Epoch)', value: '97.4%' },
        { label: 'End-to-End Pipeline Accuracy', value: '> 95%' },
        { label: 'Validation Bounding Box Loss (val/box_loss)', value: '0.163' },
      ],
    },
    {
      id: 'ocr',
      title: 'EasyOCR + Gemini AI Polish',
      icon: <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />,
      highlightScore: '> 95%',
      highlightLabel: 'Post-OCR Semantic Accuracy',
      progressValue: 95,
      accentColor: 'from-blue-500 to-indigo-600',
      scoreColor: isLight ? 'text-blue-700' : 'text-blue-400',
      metrics: [
        { label: 'Character Recognition Rate (CRR)', value: '88% – 94%' },
        { label: 'Mathematical Formula Recognition (MFR)', value: '> 95%' },
        { label: 'Post-OCR Error Correction (POEC)', value: 'Automated (> 95%)' },
      ],
    },
  ];

  return (
    <section
      id="akurasi-ai"
      className={`relative py-12 sm:py-16 md:py-24 overflow-hidden transition-colors duration-300 ${
        isLight
          ? 'bg-[#FAF6EE] border-t-2 border-dashed border-[#D4C3AC]'
          : 'bg-[#181424] border-t-2 border-dashed border-white/10'
      }`}
    >
      {/* Background Ambience & Dot Grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage: isLight
            ? 'radial-gradient(#C5B39B 1.5px, transparent 1.5px)'
            : 'radial-gradient(#64748B 1.5px, transparent 1.5px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85vw] md:w-[60vw] h-[30vw] blur-3xl pointer-events-none ${
          isLight
            ? 'bg-gradient-to-r from-emerald-300/15 via-blue-300/15 to-indigo-300/15'
            : 'bg-gradient-to-r from-emerald-600/15 via-blue-600/15 to-indigo-600/15'
        }`}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center max-w-2xl mx-auto mb-10 sm:mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2
            className={`font-display font-extrabold tracking-tight text-2xl sm:text-3xl md:text-4xl leading-tight relative inline-block ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}
          >
            Tingkat Akurasi Model AI
            {/* Hand-Drawn Scribble Underline */}
            <svg
              className={`absolute -bottom-2.5 left-0 w-full h-3 pointer-events-none ${
                isLight ? 'text-emerald-600/80' : 'text-cyan-400/80'
              }`}
              viewBox="0 0 200 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <path d="M 3 6 Q 50 1, 100 8 T 197 4" />
            </svg>
          </h2>
        </motion.div>

        {/* 2 Accuracy Cards Grid (Responsive 1-col on mobile, 2-col on tablet/desktop) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 w-full items-stretch">
          {models.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className={`relative flex flex-col justify-between p-5 sm:p-7 md:p-8 rounded-2xl transition-all duration-300 hover:-translate-y-1 ${
                isLight
                  ? 'bg-[#FFFDF7] border-2 border-[#4A2E1B]/30 shadow-[5px_5px_0px_#4A2E1B] hover:shadow-[7px_7px_0px_#4A2E1B]'
                  : 'bg-[#221c35]/85 backdrop-blur-xl border border-white/10 shadow-[0_15px_30px_-10px_rgba(0,0,0,0.5)] hover:border-cyan-500/40 hover:shadow-[0_20px_40px_-10px_rgba(37,99,235,0.25)]'
              }`}
            >
              <div>
                {/* Header: Icon + Title */}
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className={`p-2.5 sm:p-3 rounded-xl shrink-0 ${
                      isLight ? 'bg-[#FAF6EE] border border-[#4A2E1B]/20' : 'bg-white/5 border border-white/10'
                    }`}
                  >
                    {item.icon}
                  </div>
                  <h3 className={`font-display font-black text-lg sm:text-xl md:text-2xl ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {item.title}
                  </h3>
                </div>

                {/* Big Metric Box */}
                <div
                  className={`p-4 sm:p-5 rounded-xl mb-5 ${
                    isLight ? 'bg-[#FAF6EE] border border-[#4A2E1B]/15' : 'bg-black/30 border border-white/5'
                  }`}
                >
                  <div className="flex items-baseline gap-2 mb-1">
                    <span
                      className={`font-mono font-black text-4xl sm:text-5xl md:text-6xl tracking-tight ${item.scoreColor}`}
                    >
                      {item.highlightScore}
                    </span>
                  </div>
                  <p className={`text-xs sm:text-sm font-mono font-bold ${isLight ? 'text-slate-800' : 'text-gray-200'}`}>
                    {item.highlightLabel}
                  </p>

                  {/* Progress Bar Visualizer */}
                  <div className="mt-4">
                    <div
                      className={`w-full h-2.5 rounded-full overflow-hidden ${
                        isLight ? 'bg-[#EADBC8]' : 'bg-slate-800'
                      }`}
                    >
                      <motion.div
                        className={`h-full rounded-full bg-gradient-to-r ${item.accentColor}`}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${item.progressValue}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                      />
                    </div>
                  </div>
                </div>

                {/* Machine Learning Metrics List */}
                <div className="space-y-2.5">
                  {item.metrics.map((metric, mIdx) => (
                    <div
                      key={mIdx}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-3 text-xs sm:text-sm py-2 px-3 sm:px-3.5 rounded-lg font-mono ${
                        isLight
                          ? 'bg-[#FAF6EE]/70 border border-[#4A2E1B]/10 text-slate-700'
                          : 'bg-white/[0.03] border border-white/5 text-gray-300'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{metric.label}</span>
                      </span>
                      <strong className={`font-bold shrink-0 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        {metric.value}
                      </strong>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
