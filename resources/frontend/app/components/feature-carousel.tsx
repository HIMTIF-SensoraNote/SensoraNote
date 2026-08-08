import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen,
  CheckCircle2,
  Share2,
  Filter,
  TrendingUp,
  Flame,
  Trophy,
  Users,
  Shield,
  Star,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const features = [
  {
    icon: BookOpen,
    title: 'Catatan Terstruktur',
    description: 'Organisir catatan berdasarkan mata pelajaran, kelas, dan semester dengan mudah. Sistem kategorisasi otomatis membuat semua materimu tersusun rapi.',
    color: 'from-blue-500 to-blue-600',
    bgGradient: 'from-blue-50 to-indigo-50',
    stats: 'Auto-Organize',
    highlight: 'Mudah Dicari',
  },
  {
    icon: CheckCircle2,
    title: 'Validasi Pakar',
    description: 'Catatan divalidasi oleh pakar terverifikasi untuk memastikan akurasi dan kualitas materi. Belajar dengan materi yang sudah terjamin kebenarannya.',
    color: 'from-green-500 to-green-600',
    bgGradient: 'from-green-50 to-emerald-50',
    stats: 'Verified Quality',
    highlight: 'Terpercaya',
  },
  {
    icon: Share2,
    title: 'Berbagi & Diskusi',
    description: 'Bagikan catatan dengan teman dan diskusikan materi bersama komunitas. Kolaborasi membuat belajar jadi lebih efektif dan menyenangkan.',
    color: 'from-purple-500 to-purple-600',
    bgGradient: 'from-purple-50 to-pink-50',
    stats: 'Real-time Collab',
    highlight: 'Kolaboratif',
  },
  {
    icon: Flame,
    title: 'Streak Harian',
    description: 'Jaga konsistensi belajar dengan streak tracking. Sistem gamifikasi membuat kamu termotivasi untuk terus belajar setiap hari.',
    color: 'from-orange-500 to-red-500',
    bgGradient: 'from-orange-50 to-red-50',
    stats: 'Daily Tracking',
    highlight: 'Konsisten',
  },
  {
    icon: Trophy,
    title: 'Leaderboard',
    description: 'Lihat ranking pelajar dan pakar paling aktif. Kompetisi sehat membuatmu lebih semangat untuk terus berkontribusi di komunitas.',
    color: 'from-yellow-500 to-amber-500',
    bgGradient: 'from-yellow-50 to-amber-50',
    stats: 'Ranking System',
    highlight: 'Kompetitif',
  },
  {
    icon: Users,
    title: 'Komunitas Aktif',
    description: 'Bergabung dengan ribuan pelajar dari seluruh Indonesia. Saling berbagi catatan, diskusi materi, dan tumbuh bersama dalam komunitas yang supportif.',
    color: 'from-indigo-500 to-blue-600',
    bgGradient: 'from-indigo-50 to-blue-50',
    stats: 'Community Driven',
    highlight: 'Supportif',
  },
];

export function FeatureCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  const handleNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % features.length);
  }, []);

  const handlePrev = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + features.length) % features.length);
  }, []);

  const handleDotClick = useCallback((index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
    setIsAutoPlay(false); // Stop auto-play when manually clicking
  }, [currentIndex]);

  // Auto-play
  useEffect(() => {
    if (!isAutoPlay) return;
    
    const interval = setInterval(() => {
      handleNext();
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlay, handleNext]);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8,
    }),
  };

  const currentFeature = features[currentIndex];

  return (
    <div className="relative">
      {/* Main Carousel */}
      <div 
        className="relative overflow-hidden rounded-3xl"
        onMouseEnter={() => setIsAutoPlay(false)}
        onMouseLeave={() => setIsAutoPlay(true)}
      >
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.3 },
              scale: { duration: 0.3 },
            }}
            className={`bg-gradient-to-br ${currentFeature.bgGradient} dark:from-[#1C1A29] dark:to-[#1C1A29] rounded-3xl p-12 md:p-16 border-2 border-slate-200 dark:border-white/10 relative overflow-hidden shadow-sm`}
          >
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/30 dark:bg-white/5 rounded-full -translate-y-32 translate-x-32 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/20 dark:bg-white/5 rounded-full translate-y-32 -translate-x-32 blur-3xl" />

            <div className="relative z-10 max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                {/* Left: Content */}
                <div>
                  {/* Icon */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                    className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${currentFeature.color} flex items-center justify-center mb-6 shadow-2xl`}
                  >
                    <currentFeature.icon className="w-10 h-10 text-white" />
                  </motion.div>

                  {/* Title */}
                  <motion.h3
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4"
                  >
                    {currentFeature.title}
                  </motion.h3>

                  {/* Description */}
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-6 font-medium"
                  >
                    {currentFeature.description}
                  </motion.p>

                  {/* Stats & Highlight */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex flex-wrap gap-3"
                  >
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-white/10 backdrop-blur-sm rounded-xl border border-white/40 dark:border-white/10 shadow-sm">
                      <currentFeature.icon className="w-5 h-5 text-slate-800 dark:text-slate-200" />
                      <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
                        {currentFeature.stats}
                      </span>
                    </div>
                    <div className="px-4 py-2 bg-white/60 dark:bg-white/10 backdrop-blur-sm rounded-xl border border-white/40 dark:border-white/10 shadow-sm">
                      <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
                        ✨ {currentFeature.highlight}
                      </span>
                    </div>
                  </motion.div>
                </div>

                {/* Right: Visual */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ delay: 0.3, type: 'spring' }}
                  className="relative"
                >
                  {/* Large Icon Showcase */}
                  <div className={`w-full aspect-square rounded-3xl bg-gradient-to-br ${currentFeature.color} flex items-center justify-center shadow-2xl border-8 border-white/50 dark:border-white/10 relative overflow-hidden`}>
                    <motion.div
                      animate={{ 
                        rotate: [0, 5, -5, 0],
                        scale: [1, 1.05, 1],
                      }}
                      transition={{ 
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <currentFeature.icon className="w-48 h-48 text-white/90" strokeWidth={1.5} />
                    </motion.div>

                    {/* Floating particles */}
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-3 h-3 bg-white/30 rounded-full"
                        animate={{
                          y: [0, -30, 0],
                          x: [0, (i % 2 === 0 ? 20 : -20), 0],
                          opacity: [0.3, 0.8, 0.3],
                        }}
                        transition={{
                          duration: 3 + i * 0.5,
                          repeat: Infinity,
                          delay: i * 0.3,
                        }}
                        style={{
                          left: `${20 + i * 15}%`,
                          top: `${30 + (i % 3) * 20}%`,
                        }}
                      />
                    ))}
                  </div>

                  {/* Badge */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.6, type: 'spring' }}
                    className="absolute -bottom-4 -right-4 bg-white dark:bg-[#1C1A29] rounded-2xl shadow-2xl px-6 py-3 border-2 border-slate-200 dark:border-white/10"
                  >
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-primary dark:text-indigo-400" />
                      <span className="font-bold text-slate-900 dark:text-slate-100">Fitur Unggulan</span>
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <button
          onClick={handlePrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 dark:bg-[#1C1A29]/90 backdrop-blur-md hover:bg-white dark:hover:bg-[#1C1A29] rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-110 z-10 group border border-transparent dark:border-white/5"
        >
          <ChevronLeft className="w-6 h-6 text-slate-800 dark:text-slate-200 group-hover:-translate-x-0.5 transition-transform" />
        </button>

        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 dark:bg-[#1C1A29]/90 backdrop-blur-md hover:bg-white dark:hover:bg-[#1C1A29] rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-110 z-10 group border border-transparent dark:border-white/5"
        >
          <ChevronRight className="w-6 h-6 text-slate-800 dark:text-slate-200 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Dots Indicator */}
      <div className="flex justify-center items-center gap-2 mt-8">
        {features.map((_, index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            className="group relative"
          >
            <motion.div
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'w-12 bg-primary'
                  : 'w-2 bg-gray-300 dark:bg-white/10 group-hover:bg-gray-400 dark:group-hover:bg-white/30'
              }`}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            />
          </button>
        ))}
      </div>

      {/* Thumbnail Preview */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {features.map((feature, index) => (
          <motion.button
            key={index}
            onClick={() => handleDotClick(index)}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            className={`p-4 rounded-xl border-2 transition-all ${
              index === currentIndex
                ? 'border-primary bg-primary/5 dark:bg-indigo-500/10 shadow-lg'
                : 'border-slate-100 dark:border-white/5 bg-white dark:bg-[#1C1A29] hover:border-primary/50 hover:shadow-md'
            }`}
          >
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-2 mx-auto`}>
              <feature.icon className="w-5 h-5 text-white" />
            </div>
            <p className={`text-xs font-semibold text-center ${
              index === currentIndex ? 'text-primary' : 'text-gray-600'
            }`}>
              {feature.title}
            </p>
          </motion.button>
        ))}
      </div>

      {/* Auto-play Indicator */}
      {isAutoPlay && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-4 right-4 px-3 py-1.5 bg-white/90 dark:bg-[#1C1A29]/90 backdrop-blur-md rounded-full shadow-lg flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 border border-transparent dark:border-white/10"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="w-2 h-2 bg-green-500 rounded-full"
          />
          Auto-play
        </motion.div>
      )}
    </div>
  );
}