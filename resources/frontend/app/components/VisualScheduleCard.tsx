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
import { useTranslation } from '../hooks/useTranslation';
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

interface ThemeStyles {
  id: PosterTheme;
  isLight: boolean;
  bgHex: string;
  containerClass: string;
  glowTop?: string;
  glowBottom?: string;
  headerLogoBg: string;
  studyPlanBadge: string;
  profileChipClass: string;
  profileTextClass: string;
  dateNumberBoxClass: string;
  dateNumberTextClass: string;
  dateMonthTextClass: string;
  dayTitleClass: string;
  dateSubtitleClass: string;
  targetBadgeClass: string;
  targetBadgeLabelClass: string;
  targetBadgeCountClass: string;
  quoteBoxClass: string;
  quoteIconBg: string;
  quoteIconColor: string;
  quoteTitleClass: string;
  quoteTextClass: string;
  sectionHeaderClass: string;
  sectionCountClass: string;
  cardBaseClass: string;
  cardCompletedClass: string;
  timeSlotClass: string;
  timeStartClass: string;
  timeEndClass: string;
  itemTitleClass: string;
  itemTitleCompletedClass: string;
  categoryBadgeClass: string;
  checkboxBorderClass: string;
  footerClass: string;
}

const THEME_DEFINITIONS: Record<PosterTheme, ThemeStyles> = {
  'pastel-studygram': {
    id: 'pastel-studygram',
    isLight: true,
    bgHex: '#FAF7F2',
    containerClass: 'bg-[#FAF7F2] text-[#2D2A26] border-2 border-[#E3D9CC]',
    headerLogoBg: 'bg-[#3D342A] text-white',
    studyPlanBadge: 'bg-[#EADECE] text-[#3D342A]',
    profileChipClass: 'bg-[#F4ECE1] border border-[#E3D9CC] shadow-xs',
    profileTextClass: 'text-[#3D342A]',
    dateNumberBoxClass: 'bg-[#F0E6D8] border border-[#DFCFC0]',
    dateNumberTextClass: 'text-[#3D342A]',
    dateMonthTextClass: 'text-[#6A5D50]',
    dayTitleClass: 'text-[#2C251E]',
    dateSubtitleClass: 'text-[#6A5D50]',
    targetBadgeClass: 'bg-[#E8F3EB] border border-[#C6E2CD]',
    targetBadgeLabelClass: 'text-[#245E35]',
    targetBadgeCountClass: 'text-[#1D4F2C]',
    quoteBoxClass: 'bg-[#F4ECE1] border border-[#E3D9CC] shadow-xs',
    quoteIconBg: 'bg-[#EADECE]',
    quoteIconColor: 'text-[#8A5A2B]',
    quoteTitleClass: 'text-[#8A5A2B]',
    quoteTextClass: 'text-[#3D342A]',
    sectionHeaderClass: 'text-[#6A5D50]',
    sectionCountClass: 'text-[#6A5D50]',
    cardBaseClass: 'bg-[#FFFFFF] border border-[#E3D9CC] shadow-xs',
    cardCompletedClass: 'bg-[#EFE9DF] border border-[#DDD3C4] opacity-75',
    timeSlotClass: 'bg-[#3D342A] text-white border border-[#3D342A]',
    timeStartClass: 'text-white',
    timeEndClass: 'text-[#EADECE]',
    itemTitleClass: 'text-[#2C251E]',
    itemTitleCompletedClass: 'text-[#8A8177] line-through',
    categoryBadgeClass: 'bg-[#F0E6D8] text-[#524436] border border-[#DFCFC0]',
    checkboxBorderClass: 'border-[#B8A896]',
    footerClass: 'border-[#E3D9CC] text-[#7A6C5D]',
  },
  'sakura-blossom': {
    id: 'sakura-blossom',
    isLight: true,
    bgHex: '#FFF5F8',
    containerClass: 'bg-gradient-to-b from-[#FFF5F8] via-[#FDF0F4] to-[#FCE8F0] text-[#4A1527] border-2 border-[#F8CCD8]',
    headerLogoBg: 'bg-[#D9386E] text-white',
    studyPlanBadge: 'bg-[#FCD8E3] text-[#8C143F]',
    profileChipClass: 'bg-[#FFF0F5] border border-[#F8CCD8] shadow-xs',
    profileTextClass: 'text-[#59142E]',
    dateNumberBoxClass: 'bg-[#FCE8F0] border border-[#F8CCD8]',
    dateNumberTextClass: 'text-[#8C143F]',
    dateMonthTextClass: 'text-[#8C143F]',
    dayTitleClass: 'text-[#59142E]',
    dateSubtitleClass: 'text-[#8C405B]',
    targetBadgeClass: 'bg-[#FDE8EF] border border-[#F8CCD8]',
    targetBadgeLabelClass: 'text-[#8C143F]',
    targetBadgeCountClass: 'text-[#6E0C30]',
    quoteBoxClass: 'bg-[#FFF0F5] border border-[#F8CCD8] shadow-xs',
    quoteIconBg: 'bg-[#FCD8E3]',
    quoteIconColor: 'text-[#D9386E]',
    quoteTitleClass: 'text-[#D9386E]',
    quoteTextClass: 'text-[#4A1527]',
    sectionHeaderClass: 'text-[#8C405B]',
    sectionCountClass: 'text-[#8C405B]',
    cardBaseClass: 'bg-[#FFFFFF] border border-[#F8CCD8] shadow-xs',
    cardCompletedClass: 'bg-[#FDE8EF]/80 border border-[#F8CCD8] opacity-75',
    timeSlotClass: 'bg-[#8C143F] text-white border border-[#8C143F]',
    timeStartClass: 'text-white',
    timeEndClass: 'text-[#FFD4E2]',
    itemTitleClass: 'text-[#4A1527]',
    itemTitleCompletedClass: 'text-[#A87B8A] line-through',
    categoryBadgeClass: 'bg-[#FCD8E3] text-[#8C143F] border border-[#F8CCD8]',
    checkboxBorderClass: 'border-[#F8CCD8]',
    footerClass: 'border-[#F8CCD8] text-[#A05D75]',
  },
  'neon-midnight': {
    id: 'neon-midnight',
    isLight: false,
    bgHex: '#0B0914',
    containerClass: 'bg-gradient-to-b from-[#110E24] via-[#0D0A1C] to-[#070510] text-white border border-purple-500/30',
    glowTop: 'bg-purple-600/35',
    glowBottom: 'bg-blue-600/30',
    headerLogoBg: 'bg-gradient-to-tr from-primary to-purple-600 text-white',
    studyPlanBadge: 'bg-primary/30 text-blue-300 border border-primary/40',
    profileChipClass: 'bg-white/5 border border-white/10 backdrop-blur-md',
    profileTextClass: 'text-white',
    dateNumberBoxClass: 'bg-white/10 border border-white/15 backdrop-blur-md',
    dateNumberTextClass: 'text-white',
    dateMonthTextClass: 'text-gray-300',
    dayTitleClass: 'text-white',
    dateSubtitleClass: 'text-gray-300',
    targetBadgeClass: 'bg-emerald-500/15 border border-emerald-500/30 backdrop-blur-md',
    targetBadgeLabelClass: 'text-emerald-300',
    targetBadgeCountClass: 'text-emerald-200',
    quoteBoxClass: 'bg-gradient-to-r from-white/[0.07] to-white/[0.02] border border-white/10 backdrop-blur-md',
    quoteIconBg: 'bg-primary/20',
    quoteIconColor: 'text-blue-300',
    quoteTitleClass: 'text-blue-400',
    quoteTextClass: 'text-gray-200',
    sectionHeaderClass: 'text-gray-300',
    sectionCountClass: 'text-gray-300',
    cardBaseClass: 'bg-white/[0.06] border border-white/12 backdrop-blur-md hover:bg-white/[0.09]',
    cardCompletedClass: 'bg-white/[0.02] border border-white/5 opacity-50',
    timeSlotClass: 'bg-black/60 text-white border border-white/15',
    timeStartClass: 'text-white',
    timeEndClass: 'text-gray-300',
    itemTitleClass: 'text-white drop-shadow-xs',
    itemTitleCompletedClass: 'text-gray-400 line-through',
    categoryBadgeClass: 'bg-primary/25 text-blue-200 border border-primary/30',
    checkboxBorderClass: 'border-white/40',
    footerClass: 'border-white/10 text-gray-400',
  },
  'aurora-glass': {
    id: 'aurora-glass',
    isLight: false,
    bgHex: '#030B12',
    containerClass: 'bg-gradient-to-b from-[#071924] via-[#06151E] to-[#030B12] text-white border border-cyan-500/30',
    glowTop: 'bg-cyan-500/35',
    glowBottom: 'bg-emerald-500/30',
    headerLogoBg: 'bg-gradient-to-tr from-cyan-600 to-emerald-600 text-white',
    studyPlanBadge: 'bg-cyan-500/30 text-cyan-200 border border-cyan-500/40',
    profileChipClass: 'bg-white/5 border border-white/10 backdrop-blur-md',
    profileTextClass: 'text-white',
    dateNumberBoxClass: 'bg-cyan-950/70 border border-cyan-500/30 backdrop-blur-md',
    dateNumberTextClass: 'text-cyan-200',
    dateMonthTextClass: 'text-cyan-300',
    dayTitleClass: 'text-white',
    dateSubtitleClass: 'text-cyan-100/80',
    targetBadgeClass: 'bg-cyan-500/20 border border-cyan-500/35 backdrop-blur-md',
    targetBadgeLabelClass: 'text-cyan-300',
    targetBadgeCountClass: 'text-cyan-100',
    quoteBoxClass: 'bg-cyan-950/30 border border-cyan-500/20 backdrop-blur-md',
    quoteIconBg: 'bg-cyan-500/20',
    quoteIconColor: 'text-cyan-300',
    quoteTitleClass: 'text-cyan-300',
    quoteTextClass: 'text-cyan-50',
    sectionHeaderClass: 'text-cyan-200',
    sectionCountClass: 'text-cyan-200',
    cardBaseClass: 'bg-cyan-950/40 border border-cyan-500/20 backdrop-blur-md hover:bg-cyan-950/60',
    cardCompletedClass: 'bg-cyan-950/20 border border-cyan-500/10 opacity-50',
    timeSlotClass: 'bg-cyan-950/90 text-cyan-200 border border-cyan-500/30',
    timeStartClass: 'text-cyan-100',
    timeEndClass: 'text-cyan-300',
    itemTitleClass: 'text-white drop-shadow-xs',
    itemTitleCompletedClass: 'text-gray-400 line-through',
    categoryBadgeClass: 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/30',
    checkboxBorderClass: 'border-cyan-400/40',
    footerClass: 'border-cyan-500/20 text-cyan-200/60',
  },
  'sunset-glow': {
    id: 'sunset-glow',
    isLight: false,
    bgHex: '#100517',
    containerClass: 'bg-gradient-to-b from-[#1C0D26] via-[#1A0B1E] to-[#100517] text-white border border-amber-500/30',
    glowTop: 'bg-amber-500/35',
    glowBottom: 'bg-rose-500/30',
    headerLogoBg: 'bg-gradient-to-tr from-amber-500 to-rose-600 text-white',
    studyPlanBadge: 'bg-amber-500/30 text-amber-200 border border-amber-500/40',
    profileChipClass: 'bg-white/5 border border-white/10 backdrop-blur-md',
    profileTextClass: 'text-white',
    dateNumberBoxClass: 'bg-amber-950/70 border border-amber-500/30 backdrop-blur-md',
    dateNumberTextClass: 'text-amber-200',
    dateMonthTextClass: 'text-amber-300',
    dayTitleClass: 'text-white',
    dateSubtitleClass: 'text-amber-100/80',
    targetBadgeClass: 'bg-amber-500/20 border border-amber-500/35 backdrop-blur-md',
    targetBadgeLabelClass: 'text-amber-300',
    targetBadgeCountClass: 'text-amber-100',
    quoteBoxClass: 'bg-amber-950/30 border border-amber-500/20 backdrop-blur-md',
    quoteIconBg: 'bg-amber-500/20',
    quoteIconColor: 'text-amber-300',
    quoteTitleClass: 'text-amber-300',
    quoteTextClass: 'text-amber-50',
    sectionHeaderClass: 'text-amber-200',
    sectionCountClass: 'text-amber-200',
    cardBaseClass: 'bg-amber-950/40 border border-amber-500/20 backdrop-blur-md hover:bg-amber-950/60',
    cardCompletedClass: 'bg-amber-950/20 border border-amber-500/10 opacity-50',
    timeSlotClass: 'bg-amber-950/90 text-amber-200 border border-amber-500/30',
    timeStartClass: 'text-amber-100',
    timeEndClass: 'text-amber-300',
    itemTitleClass: 'text-white drop-shadow-xs',
    itemTitleCompletedClass: 'text-gray-400 line-through',
    categoryBadgeClass: 'bg-amber-500/20 text-amber-200 border border-amber-500/30',
    checkboxBorderClass: 'border-amber-400/40',
    footerClass: 'border-amber-500/20 text-amber-200/60',
  },
  'obsidian-minimal': {
    id: 'obsidian-minimal',
    isLight: false,
    bgHex: '#0B0B0E',
    containerClass: 'bg-[#0B0B0E] text-white border border-white/20',
    headerLogoBg: 'bg-white text-black',
    studyPlanBadge: 'bg-white/20 text-white border border-white/30',
    profileChipClass: 'bg-white/5 border border-white/10',
    profileTextClass: 'text-white',
    dateNumberBoxClass: 'bg-white/10 border border-white/20',
    dateNumberTextClass: 'text-white',
    dateMonthTextClass: 'text-gray-300',
    dayTitleClass: 'text-white',
    dateSubtitleClass: 'text-gray-300',
    targetBadgeClass: 'bg-white/10 border border-white/20',
    targetBadgeLabelClass: 'text-gray-300',
    targetBadgeCountClass: 'text-white',
    quoteBoxClass: 'bg-white/[0.04] border border-white/15',
    quoteIconBg: 'bg-white/15',
    quoteIconColor: 'text-white',
    quoteTitleClass: 'text-gray-300',
    quoteTextClass: 'text-gray-200',
    sectionHeaderClass: 'text-gray-400',
    sectionCountClass: 'text-gray-400',
    cardBaseClass: 'bg-white/[0.05] border border-white/15 hover:bg-white/[0.08]',
    cardCompletedClass: 'bg-white/[0.02] border border-white/10 opacity-50',
    timeSlotClass: 'bg-white/10 text-white border border-white/20',
    timeStartClass: 'text-white',
    timeEndClass: 'text-gray-300',
    itemTitleClass: 'text-white',
    itemTitleCompletedClass: 'text-gray-500 line-through',
    categoryBadgeClass: 'bg-white/15 text-white border border-white/20',
    checkboxBorderClass: 'border-white/40',
    footerClass: 'border-white/15 text-gray-400',
  },
};

export function VisualScheduleCard({
  date,
  items,
  summary,
}: VisualScheduleCardProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { t, language } = useTranslation();
  
  // Interactive on-screen card ref & Hidden fixed desktop export ref
  const interactiveCardRef = useRef<HTMLDivElement>(null);
  const exportTargetRef = useRef<HTMLDivElement>(null);

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
  const dateLocale = language === 'id' ? 'id-ID' : language;
  const dayNumber = dateObj.getDate();
  const dayName = dateObj.toLocaleDateString(dateLocale, { weekday: 'long' }).toUpperCase();
  const monthYear = dateObj.toLocaleDateString(dateLocale, { month: 'long', year: 'numeric' });

  const completedCount = items.filter((i) => i.is_completed).length;
  const progressPercent = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  const currentThemeConfig = THEME_DEFINITIONS[theme];

  const handleDownloadImage = async () => {
    // Target the fixed 800px desktop-proportioned node for universal crisp export
    const targetEl = exportTargetRef.current || interactiveCardRef.current;
    if (!targetEl) return;
    setIsDownloading(true);

    try {
      const dataUrl = await toPng(targetEl, {
        quality: 1.0,
        pixelRatio: 2, // 2x ultra HD (1600px width output)
        backgroundColor: currentThemeConfig.bgHex,
        cacheBust: true,
      });

      const link = document.createElement('a');
      link.download = `SensoraNote-Jadwal-${date}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast(t('schedule.poster_download_success'), 'success');
    } catch (error: any) {
      console.error('html-to-image export failed, using blob fallback:', error);
      try {
        const blob = await toBlob(targetEl, {
          pixelRatio: 1.5,
          backgroundColor: currentThemeConfig.bgHex,
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
          showToast(t('schedule.poster_download_success'), 'success');
        } else {
          throw new Error('Blob generation empty');
        }
      } catch (err2: any) {
        console.error('All download attempts failed:', err2);
        showToast(t('schedule.poster_download_error') + (err2?.message || ''), 'error');
      }
    } finally {
      setIsDownloading(false);
    }
  };

  /**
   * Shared Poster Visual Layout Generator
   * Rendered in both the interactive responsive card and the fixed-width desktop export container
   */
  const renderPosterInner = (isExport: boolean) => {
    const cfg = currentThemeConfig;

    return (
      <div
        className={`poster-standalone rounded-[32px] sm:rounded-[36px] shadow-2xl relative overflow-hidden font-sans ${cfg.containerClass} ${
          isExport ? 'p-10 w-[800px]' : 'p-5 sm:p-8 md:p-10 w-full max-w-4xl'
        }`}
      >
        {/* Ambient Glows for Dark Themes */}
        {cfg.glowTop && (
          <div className={`absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-40 ${cfg.glowTop}`} />
        )}
        {cfg.glowBottom && (
          <div className={`absolute -bottom-24 -left-24 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-30 ${cfg.glowBottom}`} />
        )}

        {/* 1. Header: Branding & User Profile */}
        <div className="flex items-center justify-between border-b pb-4 sm:pb-5 relative z-10 gap-2 sm:gap-3 border-current/10">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            <div className={`flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-2xl shadow-md shrink-0 ${cfg.headerLogoBg}`}>
              <ApplicationLogo size={24} className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
            </div>
            <div className="min-w-0">
              <h3 className="font-['Lexend_Deca'] font-black text-[15px] sm:text-[20px] tracking-tight flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <span>SensoraNote</span>
                <span className={`text-[9px] sm:text-[10.5px] px-2 sm:px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${cfg.studyPlanBadge}`}>
                  Schedule Plan
                </span>
              </h3>
              <p className={`text-[11px] sm:text-[12px] font-['Manrope'] font-medium flex items-center gap-1 mt-0.5 ${cfg.dateSubtitleClass}`}>
                <Calendar className="w-3.5 h-3.5 text-primary shrink-0" /> {dateObj.toLocaleDateString(dateLocale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* User Profile Chip - Full Name Without Truncation */}
          <div className={`flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full shrink-0 shadow-xs ${cfg.profileChipClass}`}>
            <AvatarImage src={user?.avatar} alt={user?.name} name={user?.name} size={24} className="rounded-full shrink-0" />
            <span className={`text-[11.5px] sm:text-[12.5px] font-['Manrope'] font-bold whitespace-nowrap ${cfg.profileTextClass}`}>
              {user?.name || t('schedule.poster_user_fallback')}
            </span>
          </div>
        </div>

        {/* 2. Hero Date & Target Banner */}
        <div className="mt-5 sm:mt-6 relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 sm:gap-4">
          <div className="flex items-center gap-3.5 sm:gap-4">
            <div className={`w-15 h-15 sm:w-18 sm:h-18 rounded-2xl flex flex-col items-center justify-center font-['Lexend_Deca'] shadow-sm shrink-0 ${cfg.dateNumberBoxClass}`}>
              <span className={`text-[22px] sm:text-[28px] font-black leading-none ${cfg.dateNumberTextClass}`}>
                {dayNumber}
              </span>
              <span className={`text-[10px] sm:text-[10.5px] uppercase font-bold tracking-wider mt-0.5 ${cfg.dateMonthTextClass}`}>
                {dayName.slice(0, 3)}
              </span>
            </div>
            <div>
              <h4 className={`font-['Lexend_Deca'] font-extrabold text-[18px] sm:text-[22px] leading-tight ${cfg.dayTitleClass}`}>
                {dayName}
              </h4>
              <p className={`text-[12.5px] sm:text-[14px] font-['Manrope'] font-semibold ${cfg.dateSubtitleClass}`}>
                {monthYear}
              </p>
            </div>
          </div>

          {/* Target Belajar Pill */}
          <div className={`flex items-center gap-2.5 sm:gap-3 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl shrink-0 ${cfg.targetBadgeClass}`}>
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 text-emerald-500" />
            <div className="text-left sm:text-right">
              <p className={`text-[9.5px] sm:text-[10px] uppercase font-['Manrope'] font-bold tracking-wider ${cfg.targetBadgeLabelClass}`}>
                {t('schedule.poster_target_study')}
              </p>
              <p className={`text-[12.5px] sm:text-[13.5px] font-['Lexend_Deca'] font-black ${cfg.targetBadgeCountClass}`}>
                {t('schedule.poster_completed', { count: completedCount, total: items.length, percent: progressPercent })}
              </p>
            </div>
          </div>
        </div>

        {/* 3. AI Quote / Motivation Box */}
        {summary && (
          <div className={`mt-5 sm:mt-6 p-4 sm:p-5 rounded-2xl relative z-10 ${cfg.quoteBoxClass}`}>
            <div className="flex items-start gap-3 sm:gap-3.5">
              <div className={`p-2 sm:p-2.5 rounded-xl shrink-0 ${cfg.quoteIconBg} ${cfg.quoteIconColor}`}>
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="space-y-1 min-w-0">
                <p className={`text-[11px] sm:text-[11.5px] font-['Lexend_Deca'] font-extrabold uppercase tracking-wider ${cfg.quoteTitleClass}`}>
                  {t('schedule.poster_focus_quote')}
                </p>
                <p className={`text-[12.5px] sm:text-[13.5px] font-['Manrope'] font-medium leading-relaxed italic ${cfg.quoteTextClass}`}>
                  "{summary}"
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 4. Susunan Jadwal Harian */}
        <div className="mt-6 sm:mt-7 space-y-3 relative z-10">
          <div className="flex items-center justify-between px-1">
            <span className={`text-[11.5px] sm:text-[12.5px] font-['Lexend_Deca'] font-bold uppercase tracking-wider flex items-center gap-1.5 sm:gap-2 ${cfg.sectionHeaderClass}`}>
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" /> {t('schedule.poster_daily_schedule')}
            </span>
            <span className={`text-[11.5px] sm:text-[12px] font-['Manrope'] font-bold ${cfg.sectionCountClass}`}>
              {t('schedule.poster_completed', { count: completedCount, total: items.length, percent: progressPercent })}
            </span>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-10 opacity-60 text-[13.5px] font-['Manrope']">
              {t('schedule.poster_no_schedule')}
            </div>
          ) : (
            <div className="space-y-2.5 sm:space-y-3">
              {items.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className={`flex items-center justify-between p-3.5 sm:p-4.5 rounded-2xl transition-all relative overflow-hidden ${
                    item.is_completed ? cfg.cardCompletedClass : cfg.cardBaseClass
                  }`}
                >
                  {/* Left: Time & Information */}
                  <div className="flex items-center gap-3 sm:gap-5 min-w-0 flex-1">
                    
                    {/* Time Slot Pill */}
                    <div className={`flex flex-col items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl shrink-0 min-w-[75px] sm:min-w-[90px] shadow-xs ${cfg.timeSlotClass}`}>
                      <span className={`text-[13px] sm:text-[15px] font-['Lexend_Deca'] font-black tracking-tight leading-none ${cfg.timeStartClass}`}>
                        {item.time_start}
                      </span>
                      <span className={`text-[9.5px] sm:text-[10px] font-['Manrope'] font-bold mt-1 leading-none ${cfg.timeEndClass}`}>
                        {t('schedule.poster_until')} {item.time_end}
                      </span>
                    </div>

                    {/* Title & Category */}
                    <div className="min-w-0 flex-1 space-y-1">
                      <h4 className={`font-['Lexend_Deca'] font-extrabold text-[13.5px] sm:text-[16px] leading-snug break-words ${
                        item.is_completed ? cfg.itemTitleCompletedClass : cfg.itemTitleClass
                      }`}>
                        {item.title}
                      </h4>

                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                        <span className={`px-2 sm:px-2.5 py-0.5 rounded-md text-[10.5px] sm:text-[11px] font-['Manrope'] font-extrabold ${cfg.categoryBadgeClass}`}>
                          {item.category}
                        </span>

                        {item.priority === 'tinggi' && (
                          <span className="text-[10px] sm:text-[10.5px] font-bold font-['Manrope'] text-rose-600 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded">
                            {t('schedule.poster_high_priority')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Check Status */}
                  <div className="shrink-0 pl-3 sm:pl-4">
                    {item.is_completed ? (
                      <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500" />
                    ) : (
                      <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 ${cfg.checkboxBorderClass}`} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 5. Footer Watermark */}
        <div className={`mt-6 sm:mt-8 pt-4 border-t relative z-10 flex flex-col sm:flex-row items-center justify-between gap-1.5 sm:gap-2 text-[11px] sm:text-[11.5px] font-['Manrope'] ${cfg.footerClass}`}>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="font-bold">SensoraNote Smart Schedule Engine</span>
          </div>
          <span className="font-extrabold tracking-wide">#BelajarLebihInklusif • sensoranote.site</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-5 w-full">
      {/* Top Action & Theme Picker Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 sm:p-4 bg-white dark:bg-[#1C1A29] rounded-2xl border border-gray-100 dark:border-white/5 shadow-xs">
        
        {/* Theme Picker Dropdown */}
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-[12.5px] sm:text-[13px] font-['Manrope'] font-bold text-gray-700 dark:text-gray-300 shrink-0">
            <Palette className="w-4 h-4 text-primary" />
            <span className="hidden sm:inline">{t('schedule.poster_theme_label')}</span>
          </div>

          <div className="relative flex-1 min-w-0">
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as PosterTheme)}
              className="w-full appearance-none bg-gray-50 dark:bg-[#13111C] border border-gray-200 dark:border-white/10 pl-3.5 pr-8 py-2 rounded-xl text-[12px] sm:text-[13px] font-['Manrope'] font-bold text-gray-900 dark:text-gray-100 focus:outline-none focus:border-primary cursor-pointer transition-colors shadow-xs truncate"
            >
              <option value="neon-midnight">✨ Cyber Midnight (Ungu Neon)</option>
              <option value="aurora-glass">🌌 Aurora Glass (Cyan Kosmik)</option>
              <option value="sunset-glow">🌅 Sunset Glow (Amber & Violet)</option>
              <option value="pastel-studygram">🍵 Pastel Studygram (Hangat Minimalis)</option>
              <option value="sakura-blossom">🌸 Sakura Blossom (Pink Lembut)</option>
              <option value="obsidian-minimal">🌑 Obsidian Minimal (Monokrom Gelap)</option>
            </select>
            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Download Button */}
        <button
          type="button"
          onClick={handleDownloadImage}
          disabled={isDownloading || items.length === 0}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-['Manrope'] font-bold text-[12.5px] sm:text-[13px] shadow-md shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50 cursor-pointer shrink-0"
        >
          {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4 shrink-0" />}
          <span>{isDownloading ? t('schedule.poster_downloading') : t('schedule.poster_download')}</span>
        </button>
      </div>

      {/* 1. Interactive Responsive Preview Canvas */}
      <div className="flex justify-center w-full" ref={interactiveCardRef}>
        {renderPosterInner(false)}
      </div>

      {/* 2. Hidden Fixed-Width (800px) Universal Desktop-Quality Export Target */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          left: '-9999px',
          top: 0,
          width: '800px',
          pointerEvents: 'none',
          zIndex: -9999,
          opacity: 0,
        }}
      >
        <div ref={exportTargetRef} style={{ width: '800px', minWidth: '800px', maxWidth: '800px' }}>
          {renderPosterInner(true)}
        </div>
      </div>
    </div>
  );
}
