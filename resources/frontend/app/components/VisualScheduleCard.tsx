import React, { useRef, useState } from 'react';
import {
  Download,
  Sparkles,
  CheckCircle2,
  Clock,
  Calendar,
  Loader2,
  Palette,
  ChevronDown,
} from 'lucide-react';
import { toPng, toBlob } from 'html-to-image';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { AvatarImage } from './ui/DefaultImages';
import ApplicationLogo from './ApplicationLogo';

interface ScheduleItem {
  id: string;
  time_start: string;
  time_end: string;
  title: string;
  category: string;
  priority: string;
  color: string;
  is_completed?: boolean;
}

interface VisualScheduleCardProps {
  scheduleId?: string;
  date: string;
  items: ScheduleItem[];
  summary?: string;
}

type PosterTheme =
  | 'neon-midnight'
  | 'aurora-glass'
  | 'sunset-glow'
  | 'pastel-studygram'
  | 'sakura-blossom'
  | 'obsidian-minimal';

export function VisualScheduleCard({
  date,
  items,
  summary,
}: VisualScheduleCardProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const cardRef = useRef<HTMLDivElement>(null);

  const [theme, setTheme] = useState<PosterTheme>('neon-midnight');
  const [isDownloading, setIsDownloading] = useState(false);

  const parseLocalDate = (dateStr: string): Date => {
    if (!dateStr) return new Date();
    const parts = dateStr.split('-').map(Number);
    if (parts.length === 3) {
      return new Date(parts[0], parts[1] - 1, parts[2]);
    }
    return new Date(dateStr);
  };

  const dateObj = parseLocalDate(date);
  const dayNumber = dateObj.getDate();
  const dayName = dateObj.toLocaleDateString('id-ID', { weekday: 'long' }).toUpperCase();
  const monthYear = dateObj.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  const completedCount = items.filter((i) => i.is_completed).length;
  const progressPercent = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  const getThemeBgColor = (th: PosterTheme) => {
    switch (th) {
      case 'neon-midnight':
        return '#0B0914';
      case 'aurora-glass':
        return '#030B12';
      case 'sunset-glow':
        return '#100517';
      case 'pastel-studygram':
        return '#FAF8F5';
      case 'sakura-blossom':
        return '#FFF5F8';
      case 'obsidian-minimal':
        return '#0B0B0E';
      default:
        return '#0B0914';
    }
  };

  const handleDownloadImage = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);

    try {
      const dataUrl = await toPng(cardRef.current, {
        quality: 1.0,
        pixelRatio: 2, // High resolution HD
        backgroundColor: getThemeBgColor(theme),
        cacheBust: true,
      });

      const link = document.createElement('a');
      link.download = `SensoraNote-Jadwal-${date}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast('Poster visual jadwal berhasil di-download! 🎨📸', 'success');
    } catch (error: any) {
      console.error('html-to-image download failed, attempting blob fallback:', error);
      try {
        const blob = await toBlob(cardRef.current, {
          pixelRatio: 1.5,
          backgroundColor: getThemeBgColor(theme),
        });
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.download = `SensoraNote-Jadwal-${date}.png`;
          link.href = url;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setTimeout(() => URL.revokeObjectURL(url), 2000);
          showToast('Poster visual jadwal berhasil di-download! 🎨📸', 'success');
        } else {
          throw new Error('Blob generation empty');
        }
      } catch (err2: any) {
        console.error('All download attempts failed:', err2);
        showToast('Gagal mengunduh poster: ' + (err2?.message || 'Terjadi kesalahan peramban'), 'error');
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const isLightTheme = theme === 'pastel-studygram' || theme === 'sakura-blossom';

  return (
    <div className="space-y-5 w-full">
      {/* Top Action & Theme Picker Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3.5 p-3.5 sm:p-4 bg-white dark:bg-[#1C1A29] rounded-2xl border border-gray-100 dark:border-white/5 shadow-xs">
        
        {/* Theme Picker Dropdown */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-[13px] font-['Manrope'] font-bold text-gray-700 dark:text-gray-300 shrink-0">
            <Palette className="w-4 h-4 text-primary" />
            <span>Pilih Tema:</span>
          </div>

          <div className="relative flex-1 sm:flex-initial min-w-[220px]">
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as PosterTheme)}
              className="w-full appearance-none bg-gray-50 dark:bg-[#13111C] border border-gray-200 dark:border-white/10 pl-3.5 pr-9 py-2 rounded-xl text-[13px] font-['Manrope'] font-bold text-gray-900 dark:text-gray-100 focus:outline-none focus:border-primary cursor-pointer transition-colors shadow-xs"
            >
              <option value="neon-midnight">✨ Cyber Midnight (Ungu Neon)</option>
              <option value="aurora-glass">🌌 Aurora Glass (Cyan Kosmik)</option>
              <option value="sunset-glow">🌅 Sunset Glow (Amber & Violet)</option>
              <option value="pastel-studygram">🍵 Pastel Studygram (Hangat Minimalis)</option>
              <option value="sakura-blossom">🌸 Sakura Blossom (Pink Lembut)</option>
              <option value="obsidian-minimal">🌑 Obsidian Minimal (Monokrom Gelap)</option>
            </select>
            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Download Button */}
        <button
          type="button"
          onClick={handleDownloadImage}
          disabled={isDownloading || items.length === 0}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-['Manrope'] font-bold text-[13px] shadow-md shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4 shrink-0" />}
          <span>Download Poster (PNG)</span>
        </button>
      </div>

      {/* Visual Canvas Target (Rendered to PNG via html-to-image) */}
      <div className="flex justify-center w-full">
        <div
          ref={cardRef}
          className={`w-full max-w-4xl rounded-[32px] sm:rounded-[36px] p-6 sm:p-8 md:p-10 shadow-2xl relative overflow-hidden transition-all duration-300 font-sans ${
            theme === 'pastel-studygram'
              ? 'bg-[#FAF8F5] text-[#2D2A26] border-2 border-[#E8E2D9]'
              : theme === 'sakura-blossom'
              ? 'bg-gradient-to-b from-[#FFF5F8] via-[#FDF0F4] to-[#FCE8F0] text-[#4A1D2F] border-2 border-rose-200'
              : theme === 'aurora-glass'
              ? 'bg-gradient-to-b from-[#071924] via-[#06151E] to-[#030B12] text-white border border-cyan-500/30'
              : theme === 'sunset-glow'
              ? 'bg-gradient-to-b from-[#1C0D26] via-[#1A0B1E] to-[#100517] text-white border border-amber-500/30'
              : theme === 'obsidian-minimal'
              ? 'bg-[#0B0B0E] text-white border border-white/20'
              : 'bg-gradient-to-b from-[#110E24] via-[#0D0A1C] to-[#070510] text-white border border-purple-500/20'
          }`}
        >
          {/* Subtle Ambient Glows for Dark Gradients */}
          {theme === 'neon-midnight' && (
            <>
              <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-40 bg-purple-600/35" />
              <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-30 bg-blue-600/30" />
            </>
          )}

          {theme === 'aurora-glass' && (
            <>
              <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-40 bg-cyan-500/35" />
              <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-30 bg-emerald-500/30" />
            </>
          )}

          {theme === 'sunset-glow' && (
            <>
              <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-40 bg-amber-500/35" />
              <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-30 bg-rose-500/30" />
            </>
          )}

          {/* 1. Header: Branding & User Profile */}
          <div className="flex items-center justify-between border-b pb-5 relative z-10 gap-4 border-current/10">
            <div className="flex items-center gap-3.5">
              <div className={`flex items-center justify-center w-11 h-11 rounded-2xl shadow-md ${
                theme === 'pastel-studygram'
                  ? 'bg-[#2D2A26] text-white'
                  : theme === 'sakura-blossom'
                  ? 'bg-rose-500 text-white'
                  : theme === 'aurora-glass'
                  ? 'bg-gradient-to-tr from-cyan-600 to-emerald-600 text-white'
                  : theme === 'sunset-glow'
                  ? 'bg-gradient-to-tr from-amber-500 to-rose-600 text-white'
                  : theme === 'obsidian-minimal'
                  ? 'bg-white text-black'
                  : 'bg-gradient-to-tr from-primary to-purple-600 text-white'
              }`}>
                <ApplicationLogo className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-['Lexend_Deca'] font-black text-[18px] sm:text-[20px] tracking-tight flex items-center gap-2.5">
                  <span>SensoraNote</span>
                  <span className={`text-[10.5px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    theme === 'pastel-studygram'
                      ? 'bg-[#E8E2D9] text-[#2D2A26]'
                      : theme === 'sakura-blossom'
                      ? 'bg-rose-200 text-rose-900'
                      : theme === 'aurora-glass'
                      ? 'bg-cyan-500/30 text-cyan-200'
                      : theme === 'sunset-glow'
                      ? 'bg-amber-500/30 text-amber-200'
                      : theme === 'obsidian-minimal'
                      ? 'bg-white/20 text-white'
                      : 'bg-primary/30 text-blue-300'
                  }`}>
                    Study Plan
                  </span>
                </h3>
                <p className={`text-[12px] font-['Manrope'] font-medium flex items-center gap-1 mt-0.5 ${
                  isLightTheme ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  <Calendar className="w-3.5 h-3.5 text-primary" /> {dateObj.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>

            {/* User Profile Chip */}
            <div className={`flex items-center gap-2.5 px-3.5 py-2 rounded-full border ${
              theme === 'pastel-studygram'
                ? 'bg-white border-[#E8E2D9] shadow-xs'
                : theme === 'sakura-blossom'
                ? 'bg-white/80 border-rose-200 shadow-xs'
                : 'bg-white/5 border-white/10 backdrop-blur-md'
            }`}>
              <AvatarImage src={user?.avatar} alt={user?.name} name={user?.name} size={28} className="rounded-full" />
              <span className={`text-[12.5px] font-['Manrope'] font-bold max-w-[100px] sm:max-w-[150px] truncate ${
                isLightTheme ? 'text-current' : 'text-white'
              }`}>
                {user?.name || 'Pelajar'}
              </span>
            </div>
          </div>

          {/* 2. Hero Date & Target Banner */}
          <div className="mt-6 relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 sm:w-18 sm:h-18 rounded-2xl flex flex-col items-center justify-center font-['Lexend_Deca'] shadow-sm shrink-0 ${
                theme === 'pastel-studygram'
                  ? 'bg-amber-100/70 border border-amber-200 text-amber-900'
                  : theme === 'sakura-blossom'
                  ? 'bg-rose-100/80 border border-rose-300 text-rose-900'
                  : theme === 'aurora-glass'
                  ? 'bg-cyan-950/70 border border-cyan-500/30 text-cyan-200 backdrop-blur-md'
                  : theme === 'sunset-glow'
                  ? 'bg-amber-950/70 border border-amber-500/30 text-amber-200 backdrop-blur-md'
                  : theme === 'obsidian-minimal'
                  ? 'bg-white/10 border border-white/20 text-white'
                  : 'bg-white/10 border border-white/15 text-white backdrop-blur-md'
              }`}>
                <span className="text-[24px] sm:text-[28px] font-black leading-none text-white">{dayNumber}</span>
                <span className="text-[10.5px] uppercase font-bold tracking-wider opacity-80 mt-1">{dayName.slice(0, 3)}</span>
              </div>
              <div>
                <h4 className="font-['Lexend_Deca'] font-extrabold text-[19px] sm:text-[22px] leading-tight">
                  {dayName}
                </h4>
                <p className={`text-[13px] sm:text-[14px] font-['Manrope'] font-medium ${
                  isLightTheme ? 'text-gray-600' : 'text-gray-300'
                }`}>
                  {monthYear}
                </p>
              </div>
            </div>

            {/* Target Belajar Pill */}
            <div className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl border shrink-0 ${
              theme === 'pastel-studygram'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800 shadow-xs'
                : theme === 'sakura-blossom'
                ? 'bg-rose-100 border-rose-200 text-rose-800 shadow-xs'
                : theme === 'aurora-glass'
                ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300 backdrop-blur-md'
                : theme === 'sunset-glow'
                ? 'bg-amber-500/15 border-amber-500/30 text-amber-300 backdrop-blur-md'
                : theme === 'obsidian-minimal'
                ? 'bg-white/10 border-white/20 text-white'
                : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300 backdrop-blur-md'
            }`}>
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <div className="text-right">
                <p className="text-[10px] uppercase font-['Manrope'] font-bold tracking-wider opacity-75">Target Belajar</p>
                <p className="text-[13.5px] font-['Lexend_Deca'] font-black text-white">{completedCount}/{items.length} Selesai ({progressPercent}%)</p>
              </div>
            </div>
          </div>

          {/* 3. AI Quote / Motivation Box */}
          {summary && (
            <div className={`mt-6 p-4 sm:p-5 rounded-2xl border relative z-10 ${
              theme === 'pastel-studygram'
                ? 'bg-white border-[#E8E2D9] shadow-xs'
                : theme === 'sakura-blossom'
                ? 'bg-white/80 border-rose-200 shadow-xs'
                : theme === 'aurora-glass'
                ? 'bg-cyan-950/30 border-cyan-500/20 backdrop-blur-md'
                : theme === 'sunset-glow'
                ? 'bg-amber-950/30 border-amber-500/20 backdrop-blur-md'
                : theme === 'obsidian-minimal'
                ? 'bg-white/[0.04] border-white/15'
                : 'bg-gradient-to-r from-white/[0.07] to-white/[0.02] border-white/10 backdrop-blur-md'
            }`}>
              <div className="flex items-start gap-3.5">
                <div className={`p-2.5 rounded-xl shrink-0 ${
                  theme === 'pastel-studygram'
                    ? 'bg-amber-100 text-amber-800'
                    : theme === 'sakura-blossom'
                    ? 'bg-rose-100 text-rose-700'
                    : theme === 'aurora-glass'
                    ? 'bg-cyan-500/20 text-cyan-300'
                    : theme === 'sunset-glow'
                    ? 'bg-amber-500/20 text-amber-300'
                    : theme === 'obsidian-minimal'
                    ? 'bg-white/15 text-white'
                    : 'bg-primary/20 text-blue-300'
                }`}>
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="space-y-1 min-w-0">
                  <p className="text-[11.5px] font-['Lexend_Deca'] font-extrabold uppercase tracking-wider text-primary dark:text-blue-400">
                    Fokus & Motivasi Belajar
                  </p>
                  <p className={`text-[13px] sm:text-[13.5px] font-['Manrope'] leading-relaxed italic ${
                    isLightTheme ? 'text-[#3E3A35]' : 'text-gray-200'
                  }`}>
                    "{summary}"
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 4. Susunan Jadwal Harian */}
          <div className="mt-7 space-y-3.5 relative z-10">
            <div className="flex items-center justify-between px-1">
              <span className={`text-[12.5px] font-['Lexend_Deca'] font-bold uppercase tracking-wider flex items-center gap-2 ${
                isLightTheme ? 'text-gray-500' : 'text-gray-400'
              }`}>
                <Clock className="w-4 h-4 text-primary" /> Susunan Jadwal Harian:
              </span>
              <span className={`text-[12px] font-['Manrope'] font-bold ${
                isLightTheme ? 'text-gray-500' : 'text-gray-400'
              }`}>
                {completedCount}/{items.length} Selesai ({progressPercent}%)
              </span>
            </div>

            {items.length === 0 ? (
              <div className="text-center py-12 opacity-60 text-[14px] font-['Manrope']">
                Belum ada jadwal untuk tanggal ini.
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className={`group flex items-center justify-between p-4 sm:p-4.5 rounded-2xl border transition-all relative overflow-hidden ${
                      theme === 'pastel-studygram'
                        ? item.is_completed
                          ? 'bg-gray-100/80 border-gray-200 opacity-60'
                          : 'bg-white border-[#E8E2D9] shadow-xs hover:shadow-md'
                        : theme === 'sakura-blossom'
                        ? item.is_completed
                          ? 'bg-rose-50/60 border-rose-200 opacity-60'
                          : 'bg-white/90 border-rose-200 shadow-xs hover:shadow-md'
                        : theme === 'aurora-glass'
                        ? item.is_completed
                          ? 'bg-cyan-950/20 border-cyan-500/10 opacity-50'
                          : 'bg-cyan-950/40 border-cyan-500/20 backdrop-blur-md hover:bg-cyan-950/60'
                        : theme === 'sunset-glow'
                        ? item.is_completed
                          ? 'bg-amber-950/20 border-amber-500/10 opacity-50'
                          : 'bg-amber-950/40 border-amber-500/20 backdrop-blur-md hover:bg-amber-950/60'
                        : theme === 'obsidian-minimal'
                        ? item.is_completed
                          ? 'bg-white/[0.02] border-white/10 opacity-50'
                          : 'bg-white/[0.05] border-white/15 hover:bg-white/[0.08]'
                        : item.is_completed
                        ? 'bg-white/[0.02] border-white/5 opacity-50'
                        : 'bg-white/[0.06] border-white/12 backdrop-blur-md hover:bg-white/[0.09] hover:border-white/20'
                    }`}
                  >
                    {/* Left: Time & Information */}
                    <div className="flex items-center gap-3.5 sm:gap-5 min-w-0 flex-1">
                      
                      {/* Time Slot Pill */}
                      <div className={`flex flex-col items-center justify-center px-3.5 sm:px-4 py-2 rounded-xl shrink-0 min-w-[80px] sm:min-w-[90px] shadow-xs border ${
                        theme === 'pastel-studygram'
                          ? 'bg-[#2D2A26] text-white border-[#2D2A26]'
                          : theme === 'sakura-blossom'
                          ? 'bg-rose-900 text-white border-rose-900'
                          : theme === 'aurora-glass'
                          ? 'bg-cyan-950/90 text-cyan-200 border-cyan-500/30'
                          : theme === 'sunset-glow'
                          ? 'bg-amber-950/90 text-amber-200 border-amber-500/30'
                          : theme === 'obsidian-minimal'
                          ? 'bg-white/10 text-white border-white/20'
                          : 'bg-black/50 text-white border-white/15'
                      }`}>
                        <span className="text-[14px] sm:text-[15px] font-['Lexend_Deca'] font-black tracking-tight leading-none text-white">
                          {item.time_start}
                        </span>
                        <span className="text-[10px] font-['Manrope'] font-bold mt-1 leading-none text-white/80">
                          s/d {item.time_end}
                        </span>
                      </div>

                      {/* Title & Category */}
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <h4 className={`font-['Lexend_Deca'] font-extrabold text-[14.5px] sm:text-[16px] leading-snug break-words ${
                          isLightTheme
                            ? item.is_completed ? 'line-through text-gray-400' : 'text-[#1F1D1A]'
                            : item.is_completed ? 'line-through text-gray-400' : 'text-white drop-shadow-xs'
                        }`}>
                          {item.title}
                        </h4>

                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-['Manrope'] font-extrabold ${
                            theme === 'pastel-studygram'
                              ? 'bg-amber-100 text-amber-900'
                              : theme === 'sakura-blossom'
                              ? 'bg-rose-100 text-rose-800'
                              : theme === 'aurora-glass'
                              ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/30'
                              : theme === 'sunset-glow'
                              ? 'bg-amber-500/20 text-amber-200 border border-amber-500/30'
                              : theme === 'obsidian-minimal'
                              ? 'bg-white/15 text-white border border-white/20'
                              : 'bg-primary/25 text-blue-200 border border-primary/30'
                          }`}>
                            {item.category}
                          </span>

                          {item.priority === 'tinggi' && (
                            <span className="text-[10.5px] font-bold font-['Manrope'] text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded">
                              🔥 Prioritas Tinggi
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Check Status */}
                    <div className="shrink-0 pl-4">
                      {item.is_completed ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                      ) : (
                        <div className={`w-5 h-5 rounded-full border-2 ${
                          isLightTheme ? 'border-gray-300' : 'border-white/40'
                        }`} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 5. Footer Watermark */}
          <div className={`mt-8 pt-4 border-t relative z-10 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11.5px] font-['Manrope'] ${
            isLightTheme ? 'border-current/10 text-gray-500' : 'border-white/10 text-gray-400'
          }`}>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="font-bold">SensoraNote Smart Schedule Engine</span>
            </div>
            <span className="font-extrabold tracking-wide">#BelajarLebihInklusif • sensoranote.site</span>
          </div>
        </div>
      </div>
    </div>
  );
}
