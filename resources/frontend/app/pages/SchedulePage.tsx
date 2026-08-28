import React, { useState, useEffect } from 'react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { MobileLayout } from '../components/MobileLayout';
import { VoiceScheduleModal } from '../components/VoiceScheduleModal';
import { VisualScheduleCard } from '../components/VisualScheduleCard';
import { useScheduleReminder } from '../hooks/useScheduleReminder';
import {
  Calendar as CalendarIcon,
  Mic,
  CheckCircle2,
  Circle,
  Trash2,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ListTodo,
  ImageIcon,
  Loader2,
  TrendingUp,
  Award,
  CalendarCheck,
  Flame,
  Lock,
  Bell,
  BellOff,
} from 'lucide-react';
import axios from 'axios';
import { useToast } from '../contexts/ToastContext';

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

// Helper for local timezone / WIB YYYY-MM-DD
const formatLocalDate = (d: Date = new Date()): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Safe local date parser
const parseLocalDate = (dateStr: string): Date => {
  if (!dateStr) return new Date();
  const parts = dateStr.split('-').map(Number);
  if (parts.length === 3) {
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }
  return new Date(dateStr);
};

export default function SchedulePage() {
  useDocumentTitle('Asisten Perencana Jadwal | SensoraNote');
  const { showToast } = useToast();

  const [selectedDate, setSelectedDate] = useState<string>(() => formatLocalDate(new Date()));
  const [scheduleData, setScheduleData] = useState<any>(null);
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Tab View: 'timeline' | 'visual'
  const [activeView, setActiveView] = useState<'timeline' | 'visual'>('timeline');

  // Voice AI Modal
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

  // Integrated Notification & Audio Reminder Hook
  const { notificationPermission, isReminderEnabled, toggleReminder } = useScheduleReminder(items, selectedDate);

  // Auto set current date when page is mounted / accessed
  useEffect(() => {
    const today = formatLocalDate(new Date());
    setSelectedDate(today);
  }, []);

  const fetchSchedule = async (dateStr: string) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('bayu-token') || sessionStorage.getItem('bayu-token');
      const res = await axios.get(`/api/v1/schedules?date=${dateStr}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data?.data) {
        setScheduleData(res.data.data);
        setItems(res.data.data.items || []);
      } else {
        setScheduleData(null);
        setItems([]);
      }
    } catch (error) {
      console.error('Failed to fetch schedule:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule(selectedDate);
  }, [selectedDate]);

  // Date changers (Scroll forward/back without timezone drift)
  const handleDateChange = (daysDelta: number) => {
    const current = parseLocalDate(selectedDate);
    current.setDate(current.getDate() + daysDelta);
    setSelectedDate(formatLocalDate(current));
  };

  const handleSetToday = () => {
    setSelectedDate(formatLocalDate(new Date()));
  };

  const todayStr = formatLocalDate(new Date());
  const isToday = selectedDate === todayStr;

  const dateObj = parseLocalDate(selectedDate);
  const formattedDateTitle = dateObj.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const formattedDateTitleShort = dateObj.toLocaleDateString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  // Helper to determine if an activity is checkable based on time_end
  const isActivityCheckable = (item: ScheduleItem): boolean => {
    const now = new Date();
    const today = formatLocalDate(now);

    // Past dates: always checkable
    if (selectedDate < today) return true;
    // Future dates: not checkable yet
    if (selectedDate > today) return false;

    // Today (WIB): Compare current time with time_end
    try {
      const [endH, endM] = (item.time_end || '23:59').split(':').map(Number);
      const currentH = now.getHours();
      const currentM = now.getMinutes();

      const currentMinutes = currentH * 60 + currentM;
      const endMinutes = endH * 60 + endM;

      return currentMinutes >= endMinutes;
    } catch {
      return true;
    }
  };

  // Helper to get activity real-time status
  const getActivityStatus = (item: ScheduleItem) => {
    if (item.is_completed) {
      return { label: 'Selesai', color: 'text-emerald-500 bg-emerald-500/10' };
    }

    const now = new Date();
    const today = formatLocalDate(now);

    if (selectedDate < today) {
      return { label: 'Bisa Dicentang', color: 'text-emerald-500 bg-emerald-500/10' };
    }
    if (selectedDate > today) {
      return { label: `Mulai ${item.time_start}`, color: 'text-gray-500 bg-gray-500/10' };
    }

    try {
      const [startH, startM] = (item.time_start || '00:00').split(':').map(Number);
      const [endH, endM] = (item.time_end || '23:59').split(':').map(Number);
      const currentH = now.getHours();
      const currentM = now.getMinutes();

      const currentMinutes = currentH * 60 + currentM;
      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;

      if (currentMinutes < startMinutes) {
        return { label: `Belum Mulai (${item.time_start})`, color: 'text-gray-500 bg-gray-100 dark:bg-white/5' };
      } else if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
        return { label: `Sedang Berjalan (s/d ${item.time_end})`, color: 'text-blue-500 bg-blue-50 dark:bg-blue-500/10 font-bold' };
      } else {
        return { label: 'Waktu Selesai (Bisa Dicentang)', color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 font-bold' };
      }
    } catch {
      return { label: 'Tersedia', color: 'text-gray-500' };
    }
  };

  // Toggle item completed with lock validation
  const handleToggleItemWithLock = async (item: ScheduleItem) => {
    const checkable = isActivityCheckable(item);

    // If locked and not completed, block action and notify user
    if (!checkable && !item.is_completed) {
      showToast(
        `Kegiatan "${item.title}" baru dapat dicentang setelah melewati jam selesai (${item.time_end}) ⏰`,
        'warning'
      );
      return;
    }

    if (!scheduleData?._id && !scheduleData?.id) return;
    const scheduleId = scheduleData._id || scheduleData.id;

    // Optimistic UI update
    setItems((prev) =>
      prev.map((it) => (it.id === item.id ? { ...it, is_completed: !it.is_completed } : it))
    );

    try {
      const token = localStorage.getItem('bayu-token') || sessionStorage.getItem('bayu-token');
      await axios.put(
        `/api/v1/schedules/${scheduleId}/items/${item.id}/toggle`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (error) {
      console.error('Failed to toggle item:', error);
      showToast('Gagal mengubah status kegiatan.', 'error');
      fetchSchedule(selectedDate);
    }
  };

  // Delete item
  const handleDeleteItem = async (itemId: string) => {
    if (!scheduleData?._id && !scheduleData?.id) return;
    const scheduleId = scheduleData._id || scheduleData.id;

    // Optimistic UI update
    setItems((prev) => prev.filter((it) => it.id !== itemId));

    try {
      const token = localStorage.getItem('bayu-token') || sessionStorage.getItem('bayu-token');
      await axios.delete(`/api/v1/schedules/${scheduleId}/items/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast('Kegiatan berhasil dihapus.', 'info');
    } catch (error) {
      console.error('Failed to delete item:', error);
      showToast('Gagal menghapus kegiatan.', 'error');
      fetchSchedule(selectedDate);
    }
  };

  const completedCount = items.filter((i) => i.is_completed).length;
  const progressPercent = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  return (
    <MobileLayout>
      <div className="w-full max-w-5xl mx-auto px-3.5 sm:px-6 md:px-8 pt-3 sm:pt-6 pb-32 sm:pb-16 space-y-5 sm:space-y-6">
        
        {/* Top Header Card */}
        <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-[24px] sm:rounded-[30px] p-5 sm:p-7 md:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/15 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11.5px] sm:text-[12px] font-bold font-['Manrope'] tracking-wide">
                <Sparkles className="w-3.5 h-3.5" /> Sensora AI Schedule Planner
              </div>
              <h1 className="font-['Lexend_Deca'] font-extrabold text-xl sm:text-2xl md:text-3xl leading-tight">
                Asisten Perencana Jadwal
              </h1>
              <p className="font-['Manrope'] text-[13px] sm:text-[14px] text-blue-100/90 max-w-xl font-medium leading-relaxed">
                Buat rencana jadwal harian otomatis cukup dengan suara Anda. Dapatkan poster visual estetik beresolusi tinggi dan unduh instan!
              </p>
            </div>

            {/* Main Action Button */}
            <div className="flex items-center shrink-0">
              <button
                type="button"
                onClick={() => setIsVoiceModalOpen(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-white text-primary font-['Manrope'] font-extrabold text-[14px] shadow-xl shadow-black/15 hover:bg-blue-50 active:scale-95 transition-all cursor-pointer"
              >
                <Mic className="w-4 h-4 text-primary shrink-0" />
                <span>Rencanakan Sekarang!</span>
              </button>
            </div>
          </div>
        </div>

        {/* Date Selector & View Switcher Bar */}
        <div className="bg-white dark:bg-[#1C1A29] p-3 sm:p-4 rounded-2xl border border-gray-100 dark:border-white/5 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4">
          
          {/* Date Navigator Controls */}
          <div className="flex items-center justify-between gap-2 w-full md:w-auto">
            <button
              type="button"
              onClick={() => handleDateChange(-1)}
              className="p-2 sm:p-2.5 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 transition-colors shrink-0 cursor-pointer"
              title="Hari Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Styled Custom Date Picker */}
            <div className="relative flex items-center justify-center flex-1 sm:flex-initial max-w-[260px]">
              <label className="w-full flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200/80 dark:border-white/10 text-[12.5px] sm:text-[13.5px] font-['Lexend_Deca'] font-bold text-gray-800 dark:text-gray-200 hover:border-primary/50 transition-all cursor-pointer select-none">
                <CalendarIcon className="w-4 h-4 text-primary shrink-0" />
                <span className="truncate">{formattedDateTitleShort}</span>
                {isToday && (
                  <span className="px-1.5 py-0.5 rounded-md bg-blue-100/70 dark:bg-blue-500/20 text-primary text-[10px] font-extrabold uppercase shrink-0">
                    Hari Ini
                  </span>
                )}
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    if (e.target.value) {
                      setSelectedDate(e.target.value);
                    }
                  }}
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                />
              </label>
            </div>

            <button
              type="button"
              onClick={() => handleDateChange(1)}
              className="p-2 sm:p-2.5 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 transition-colors shrink-0 cursor-pointer"
              title="Hari Berikutnya"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {!isToday && (
              <button
                type="button"
                onClick={handleSetToday}
                className="hidden sm:inline-flex px-2.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-primary text-[11.5px] font-['Manrope'] font-bold hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors shrink-0 cursor-pointer"
                title="Kembali ke Hari Ini"
              >
                Hari Ini
              </button>
            )}
          </div>

          {/* View Mode Tabs & Notification Permission Toggle */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-between md:justify-end pt-2 md:pt-0 border-t md:border-t-0 border-gray-100 dark:border-white/5">
            
            {/* Notification Reminder Toggle (ON/OFF) */}
            <button
              type="button"
              onClick={toggleReminder}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-['Manrope'] font-bold transition-all cursor-pointer ${
                isReminderEnabled && notificationPermission === 'granted'
                  ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-100/80 dark:hover:bg-emerald-500/20'
                  : isReminderEnabled
                  ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-100/80'
                  : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-white/10 hover:bg-gray-200/70 dark:hover:bg-white/10'
              }`}
              title={
                isReminderEnabled
                  ? 'Pengingat aktif. Klik untuk menonaktifkan.'
                  : 'Pengingat nonaktif. Klik untuk mengaktifkan.'
              }
            >
              {isReminderEnabled && notificationPermission === 'granted' ? (
                <>
                  <Bell className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Pengingat Aktif</span>
                </>
              ) : isReminderEnabled ? (
                <>
                  <Bell className="w-3.5 h-3.5 text-amber-500 shrink-0 animate-pulse" />
                  <span>Pengingat Aktif</span>
                </>
              ) : (
                <>
                  <BellOff className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span>Pengingat Mati</span>
                </>
              )}
            </button>

            {/* View Mode Tabs */}
            <div className="flex items-center bg-gray-100 dark:bg-white/5 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveView('timeline')}
                className={`flex items-center justify-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-lg text-[12px] sm:text-[12.5px] font-['Manrope'] font-bold transition-all cursor-pointer ${
                  activeView === 'timeline'
                    ? 'bg-white dark:bg-[#1C1A29] text-primary shadow-xs'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <ListTodo className="w-3.5 h-3.5 shrink-0" />
                <span>Checklist</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveView('visual')}
                className={`flex items-center justify-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-lg text-[12px] sm:text-[12.5px] font-['Manrope'] font-bold transition-all cursor-pointer ${
                  activeView === 'visual'
                    ? 'bg-white dark:bg-[#1C1A29] text-primary shadow-xs'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5 shrink-0" />
                <span>Poster</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Views */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-3 bg-white dark:bg-[#1C1A29] rounded-3xl border border-gray-100 dark:border-white/5 shadow-xs">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="font-['Manrope'] text-[14px] text-gray-500">Memuat jadwal belajar...</p>
          </div>
        ) : activeView === 'visual' ? (
          /* TAB 2: VISUAL POSTER CARD */
          <VisualScheduleCard
            date={selectedDate}
            items={items}
            summary={scheduleData?.summary}
          />
        ) : (
          /* TAB 1: INTERACTIVE TIMELINE & CHECKLIST */
          <div className="space-y-5 sm:space-y-6">
            
            {/* Progress & Focus Summary Cards */}
            {items.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Progress Bar Card */}
                <div className="bg-white dark:bg-[#1C1A29] p-4 sm:p-5 rounded-3xl border border-gray-100 dark:border-white/5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between text-[13px] font-['Manrope'] font-bold text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-emerald-500" /> Progres Target
                    </span>
                    <span className="text-primary font-extrabold">{progressPercent}%</span>
                  </div>

                  <div className="w-full h-3 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  <p className="text-[12px] font-['Manrope'] text-gray-500 dark:text-gray-400 font-medium">
                    {completedCount} dari {items.length} aktivitas terselesaikan
                  </p>
                </div>

                {/* AI Summary Card */}
                <div className="md:col-span-2 bg-gradient-to-r from-blue-50/70 to-indigo-50/50 dark:from-white/5 dark:to-transparent p-4 sm:p-5 rounded-3xl border border-blue-100/70 dark:border-white/5 flex items-start gap-3.5">
                  <div className="p-2.5 rounded-2xl bg-primary/10 text-primary shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-[13.5px] font-['Lexend_Deca'] font-bold text-gray-900 dark:text-gray-100">
                      Fokus: {formattedDateTitle}
                    </h4>
                    <p className="text-[12.5px] sm:text-[13px] font-['Manrope'] text-gray-600 dark:text-gray-300 leading-relaxed font-normal">
                      {scheduleData?.summary || 'Selesaikan setiap slot waktu secara konsisten untuk hasil belajar maksimal.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Task Items List */}
            <div className="bg-white dark:bg-[#1C1A29] rounded-3xl p-4 sm:p-6 border border-gray-100 dark:border-white/5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-4">
                <h3 className="font-['Lexend_Deca'] font-bold text-[15px] sm:text-[16px] text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" /> Rincian Kegiatan ({items.length})
                </h3>

                <button
                  type="button"
                  onClick={() => setIsVoiceModalOpen(true)}
                  className="text-[12.5px] sm:text-[13px] font-['Manrope'] font-bold text-primary hover:underline flex items-center gap-1.5 cursor-pointer px-2.5 py-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>Ubah Jadwalmu?</span>
                </button>
              </div>

              {items.length === 0 ? (
                <div className="py-12 sm:py-14 flex flex-col items-center justify-center text-center space-y-3 px-4">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-blue-50 dark:bg-blue-500/10 text-primary flex items-center justify-center shadow-xs">
                    <CalendarCheck className="w-7 h-7 sm:w-8 sm:h-8" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-['Lexend_Deca'] font-bold text-[15px] sm:text-[16px] text-gray-800 dark:text-gray-200">
                      Belum Ada Jadwal untuk {formattedDateTitle}
                    </h4>
                    <p className="font-['Manrope'] text-[12.5px] sm:text-[13px] text-gray-500 dark:text-gray-400 max-w-sm">
                      Gunakan tombol "Rencanakan Sekarang!" di bagian atas untuk menyusun rencana aktivitas belajar Anda.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item) => {
                    const checkable = isActivityCheckable(item);
                    const statusInfo = getActivityStatus(item);

                    return (
                      <div
                        key={item.id}
                        className={`flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border transition-all ${
                          item.is_completed
                            ? 'bg-gray-50/70 dark:bg-white/[0.02] border-gray-100 dark:border-white/5 opacity-70'
                            : checkable
                            ? 'bg-white dark:bg-[#161424] border-emerald-500/25 hover:border-emerald-500/40 shadow-xs'
                            : 'bg-white dark:bg-[#161424] border-gray-100 dark:border-white/10 opacity-90'
                        }`}
                      >
                        {/* Checkbox and Info */}
                        <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
                          <button
                            type="button"
                            onClick={() => handleToggleItemWithLock(item)}
                            className={`shrink-0 transition-colors p-1 -m-1 ${
                              checkable || item.is_completed
                                ? 'text-gray-400 hover:text-primary cursor-pointer'
                                : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                            }`}
                            title={
                              item.is_completed
                                ? 'Tandai belum selesai'
                                : checkable
                                ? 'Tandai selesai'
                                : `Baru dapat dicentang setelah pukul ${item.time_end}`
                            }
                          >
                            {item.is_completed ? (
                              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                            ) : checkable ? (
                              <Circle className="w-6 h-6 hover:text-primary" />
                            ) : (
                              <div className="relative flex items-center justify-center">
                                <Circle className="w-6 h-6 text-gray-300 dark:text-gray-600" />
                                <Lock className="w-3 h-3 text-gray-400 dark:text-gray-500 absolute" />
                              </div>
                            )}
                          </button>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                              <span className="px-2 sm:px-2.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-500/10 text-primary font-['Lexend_Deca'] font-extrabold text-[11px] sm:text-[12px] shrink-0">
                                {item.time_start} - {item.time_end}
                              </span>
                              <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400 font-['Manrope'] font-bold text-[10.5px] sm:text-[11px]">
                                {item.category}
                              </span>
                              {item.priority === 'tinggi' && (
                                <span className="text-[10px] sm:text-[10.5px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-500/10 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                  <Flame className="w-3 h-3" /> Tinggi
                                </span>
                              )}

                              {/* Real-time Status Badge */}
                              <span className={`text-[10px] font-['Manrope'] font-bold px-2 py-0.5 rounded-full ${statusInfo.color}`}>
                                {statusInfo.label}
                              </span>
                            </div>

                            <h4
                              className={`font-['Lexend_Deca'] font-bold text-[13.5px] sm:text-[14.5px] mt-1 leading-snug break-words ${
                                item.is_completed ? 'line-through text-gray-400' : 'text-gray-900 dark:text-gray-100'
                              }`}
                            >
                              {item.title}
                            </h4>
                          </div>
                        </div>

                        {/* Delete item button */}
                        <button
                          type="button"
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors shrink-0 ml-2 cursor-pointer"
                          title="Hapus Kegiatan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Voice Schedule Modal (With 2-step confirmation) */}
      <VoiceScheduleModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onSuccess={(newSchedule) => {
          setScheduleData(newSchedule);
          setItems(newSchedule.items || []);
        }}
        initialDate={selectedDate}
      />
    </MobileLayout>
  );
}
