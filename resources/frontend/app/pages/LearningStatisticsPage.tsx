import { useDocumentTitle } from '../hooks/useDocumentTitle';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BookOpen, 
  Clock, 
  TrendingUp, 
  ChevronRight, 
  Target,
  Zap,
  Activity,
  Heart,
  MessageCircle,
  Eye,
  ShieldCheck,
  ArrowUpRight,
  Inbox,
  Settings2,
  X,
  Calendar,
  Share2,
  MoreHorizontal,
  Flame,
  Award,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { Link, useNavigate } from 'react-router';
import { AvatarImage, DefaultThumbnail } from '../components/ui/DefaultImages';
import { useToast } from '../contexts/ToastContext';
import { NoteCard } from '../components/NoteCard';
import { MobileLayout } from '../components/MobileLayout';
import { Facebook, MessageCircle as MessageCircleIcon, Send, Twitter, Link2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../hooks/useTranslation';

const LearningStatisticsPage = () => {
    const { t, language } = useTranslation();
    useDocumentTitle(t('titles.learning_statistics'));
  const [notes, setNotes] = useState<any[]>([]);
  const [allNotes, setAllNotes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [chartView, setChartView] = useState<'weekly' | 'monthly'>('weekly');
  const [tempHours, setTempHours] = useState(4);
  const [tempMinutes, setTempMinutes] = useState(0);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [showFullHistory, setShowFullHistory] = useState(false);
  const [currentProgressHours, setCurrentProgressHours] = useState(2.8);
  const [monthOffset, setMonthOffset] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isMobileCalendarOpen, setIsMobileCalendarOpen] = useState(false);
  
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuth();


  const handleLikePost = async (postId: string) => {
      if (!user)
          return showToast(
              "Silakan masuk (login) terlebih dahulu untuk menyukai tulisan.",
              "warning"
          );

      const updateNotes = (prev: any[]) => prev.map((note) => {
          if ((note._id || note.id) === postId) {
              const isCurrentlyLiked = note.is_liked || false;
              return {
                  ...note,
                  likes: isCurrentlyLiked
                      ? Math.max(0, note.likes - 1)
                      : note.likes + 1,
                  likes_count: isCurrentlyLiked
                      ? Math.max(0, (note.likes_count || 0) - 1)
                      : (note.likes_count || 0) + 1,
                  is_liked: !isCurrentlyLiked,
              };
          }
          return note;
      });

      setAllNotes(updateNotes);
      setNotes(updateNotes);

      try {
          const tk = localStorage.getItem("bayu-token") || sessionStorage.getItem("bayu-token");
          await axios.post(
              `/api/v1/posts/${postId}/like`,
              {},
              { headers: { Authorization: `Bearer ${tk}` } }
          );
      } catch (e) {
          console.error(e);
      }
  };

  const [stats, setStats] = useState<any>(null);
  const [dynamicWeeklyData, setDynamicWeeklyData] = useState<any[]>([]);
  const [dynamicMonthlyData, setDynamicMonthlyData] = useState<any[]>([]);

  // CALENDAR LOGIC
  const today = new Date();
  const displayDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  const displayMonth = displayDate.getMonth();
  const displayYear = displayDate.getFullYear();
  const daysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(displayYear, displayMonth, 1).getDay();
  const paddingDays = firstDayOfMonth; // 0 for Sunday
  
  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

  const isActiveDate = (day: number) => {
    if (!stats?.active_dates) return false;
    const dateStr = `${displayYear}-${String(displayMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return stats.active_dates.includes(dateStr);
  };

  const handleShare = () => {
      setShowShareModal(true);
  };

  // 2. Kita ganti fetch-nya pake API Super lu!
  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const token = localStorage.getItem("bayu-token") || sessionStorage.getItem("bayu-token");
        
        // Panggil API yang baru lu bikin
        const response = await axios.get("/api/v1/learn/statistics", {
            headers: { Authorization: `Bearer ${token}` }
        });

        const apiData = response.data.data;
        setStats(apiData);

        // 3. Ubah format grafik dari Backend biar cocok sama Recharts Frontend
        // Backend ngirim: { Sen: 4, Sel: 0, ... }
        // Frontend butuh: [{ label: 'Sen', value: 4 }, ...]
        const formattedWeeklyChart = Object.keys(apiData.weekly_chart).map(key => ({
            originalLabel: key,
            value: apiData.weekly_chart[key] // Ini dalam menit ya!
        }));
        setDynamicWeeklyData(formattedWeeklyChart);

        if (apiData.monthly_chart) {
            const formattedMonthlyChart = Object.keys(apiData.monthly_chart).map(key => ({
                originalLabel: key,
                value: apiData.monthly_chart[key] // Durasi dalam menit per minggu
            }));
            setDynamicMonthlyData(formattedMonthlyChart);
        }

        // 4. Ekstrak data 'post' dari riwayat terakhir buat ditampilin di list bawah
        if (apiData.recent_history && apiData.recent_history.length > 0) {
            const recentPosts = apiData.recent_history.map((history: any) => history.post);
            // Hapus data yang null (jaga-jaga kalo postnya udah dihapus)
            const validPosts = recentPosts.filter((post: any) => post !== null);
            setAllNotes(validPosts);
            setNotes(validPosts.slice(0, 3));
        }

      } catch (error) {
        console.error("Error fetching statistics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  const activeLocale = language === 'ar' ? 'ar-EG' : language === 'fa' ? 'fa-IR' : language === 'id' ? 'id-ID' : language;
  
  const shortDays = React.useMemo(() => {
    return [...Array(7)].map((_, i) => new Intl.DateTimeFormat(activeLocale, { weekday: 'short' }).format(new Date(2023, 0, i + 1)));
  }, [activeLocale]);
  
  const narrowDays = React.useMemo(() => {
    return [...Array(7)].map((_, i) => new Intl.DateTimeFormat(activeLocale, { weekday: 'narrow' }).format(new Date(2023, 0, i + 1)));
  }, [activeLocale]);

  const dayMap: Record<string, number> = {
      'Min': 0, 'Sen': 1, 'Sel': 2, 'Rab': 3, 'Kam': 4, 'Jum': 5, 'Sab': 6,
      'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6
  };

  const localizedWeeklyData = dynamicWeeklyData.map(d => {
      const dIndex = dayMap[d.originalLabel];
      return {
         ...d,
         label: dIndex !== undefined ? shortDays[dIndex] : d.originalLabel
      };
  });

  const localizedMonthlyData = dynamicMonthlyData.map(d => ({
      ...d,
      label: d.originalLabel.replace(/Minggu|Week/i, t('stats.week') || 'Minggu')
  }));

  const activeChartData = chartView === 'weekly' ? localizedWeeklyData : localizedMonthlyData;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-2xl border border-slate-800 animate-in fade-in zoom-in duration-200">
          <p className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">{payload[0].payload.label}</p>
          <p className="text-sm font-black">{payload[0].value} <span className="font-medium text-xs text-slate-400 ml-1">{t('stats.minutes')}</span></p>
        </div>
      );
    }
    return null;
  };


  return (
    <MobileLayout hideMobileTopNav={true}>
      <div className="min-h-screen bg-white dark:bg-[#13111C] font-['Manrope'] pb-20">
        
        {/* HEADER (X STYLE) */}
        <div className="relative z-20 bg-white dark:bg-[#13111C] border-b border-slate-100 dark:border-white/5 px-6 py-4 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <button onClick={() => navigate(-1)} className="text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 p-1.5 rounded-full transition-colors">
                 <X size={22} />
              </button>
              <div>
                 <h1 className="text-lg font-bold tracking-tight text-slate-800 dark:text-slate-100 leading-none">{t('stats.title')}</h1>
                 <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">{new Intl.DateTimeFormat(language, { month: 'long', year: 'numeric' }).format(new Date(displayYear, displayMonth))} • {t('stats.progress')}</p>
              </div>
           </div>
           <button onClick={handleShare} className="w-10 h-10 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-primary transition-colors active:scale-95">
              <Share2 size={18} />
           </button>
        </div>

        {/* MAIN FEED LAYOUT (BA-YU NATIVE STYLE) */}
        <div className="max-w-screen-xl mx-auto flex flex-col lg:flex-row p-4 sm:p-6 lg:p-8 gap-8">
           
           {/* LEFT CONTENT */}
           <div className="flex-1 space-y-8">
              
              {/* DAILY HIGHLIGHT */}
              <section>
                 <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-['Lexend_Deca'] font-bold text-slate-800 dark:text-slate-100">{t('stats.summary_today')}</h2>
                    <button 
                      onClick={() => setIsGoalModalOpen(true)}
                      className="text-[13px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                    >
                       {t('stats.set_target')}
                    </button>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    {/* PROGRESS CARD */}
                    <div className="col-span-1 lg:col-span-1 bg-white dark:bg-[#1C1A29] rounded-[24px] p-4 sm:p-6 border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none hover:shadow-md transition-shadow group relative overflow-hidden flex flex-col justify-between">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 dark:bg-indigo-500/10 rounded-bl-full -z-10 opacity-50 group-hover:scale-110 transition-transform duration-500" />
                       <div className="flex items-center justify-between mb-6">
                          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                             <Target size={20} />
                          </div>
                          <span className="text-[12px] sm:text-[13px] font-bold text-slate-500 dark:text-slate-400 text-right">{Math.round(((stats?.summary?.today_duration || 0) / (stats?.daily_target || 1)) * 100) || 0}%</span>
                       </div>
                       
                       <div className="mb-4">
                          <span className="text-sm font-bold">{stats?.summary?.today_duration || 0}m</span> <span className="text-[11px] sm:text-sm font-medium text-slate-500">/ {Math.floor((stats?.daily_target || 0) / 60)}h {(stats?.daily_target || 0) % 60}m</span>
                          <p className="text-[11px] sm:text-[13px] font-medium text-slate-500 mt-1">{t('stats.daily_target')}</p>
                       </div>

                       <div className="w-full h-2 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden mb-2 mt-auto">
                          <div 
                            className="h-full bg-indigo-600 rounded-full transition-all duration-1000" 
                            style={{ width: `${Math.min(((stats?.summary?.today_duration || 0) / (stats?.daily_target || 1)) * 100, 100) || 0}%` }}                          
                            />
                       </div>
                    </div>

                    {/* MOBILE ONLY PENCAPAIAN */}
                    <div className="col-span-1 lg:hidden bg-white dark:bg-[#1C1A29] rounded-[24px] p-3 sm:p-4 border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none flex flex-col gap-2 justify-center">
                        <div className="flex items-center gap-2.5 bg-slate-50 dark:bg-white/5 p-2.5 rounded-2xl border border-slate-100 dark:border-white/5 flex-1">
                           <div className="w-9 h-9 bg-white dark:bg-[#252336] rounded-xl flex items-center justify-center text-amber-500 shadow-sm shrink-0">
                              <Award size={18} />
                           </div>
                           <div className="flex-1 min-w-0">
                              <h4 className="text-[14px] sm:text-[15px] font-bold text-slate-800 dark:text-slate-100 leading-none truncate">{stats?.achievements?.notes_created || 0}</h4>
                              <p className="text-[10px] font-medium text-slate-500 mt-1 truncate">{t('stats.notes')}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-2.5 bg-slate-50 dark:bg-white/5 p-2.5 rounded-2xl border border-slate-100 dark:border-white/5 flex-1">
                           <div className="w-9 h-9 bg-white dark:bg-[#252336] rounded-xl flex items-center justify-center text-emerald-500 shadow-sm shrink-0">
                              <BookOpen size={18} />
                           </div>
                           <div className="flex-1 min-w-0">
                              <h4 className="text-[14px] sm:text-[15px] font-bold text-slate-800 dark:text-slate-100 leading-none truncate">{stats?.achievements?.materials_completed || 0}</h4>
                              <p className="text-[10px] font-medium text-slate-500 mt-1 truncate">{t('stats.materials')}</p>
                           </div>
                        </div>
                    </div>

                    {/* STREAK CARD */}
                    <div className="col-span-2 sm:col-span-2 lg:col-span-1 bg-gradient-to-br from-orange-400 to-orange-500 rounded-[24px] p-6 text-white shadow-lg shadow-orange-200/50 dark:shadow-none relative overflow-hidden flex flex-col justify-between">
                       <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                       <div className="absolute bottom-4 right-4 opacity-20 transform -rotate-12">
                          <Flame size={100} />
                       </div>
                       
                       <div className="relative z-10 flex items-center justify-between mb-2">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                                 <Flame size={18} className="text-white" />
                              </div>
                              <span className="text-[13px] font-bold text-orange-50">{t('stats.current_streak')}</span>
                           </div>
                           <button onClick={() => setIsMobileCalendarOpen(!isMobileCalendarOpen)} className="lg:hidden flex items-center gap-1.5 text-[11px] font-bold bg-white/20 hover:bg-white/30 backdrop-blur-sm px-3 py-1.5 rounded-full transition-colors">
                              <Calendar size={12} />
                              {isMobileCalendarOpen ? t('stats.close') : t('stats.see_calendar')}
                           </button>
                       </div>
                       
                       <div className="relative z-10 mt-auto pt-6">
                          <h3 className="text-4xl font-['Lexend_Deca'] font-bold tracking-tight">
                             {stats?.summary?.current_streak || 0} <span className="text-lg font-medium text-orange-100">{t('stats.days')}</span>
                          </h3>
                          <p className="text-[13px] text-orange-50 font-medium mt-1">
                             {t('stats.keep_spirit')}
                          </p>
                       </div>

                       {/* MOBILE CALENDAR ACCORDION */}
                       <div className={`lg:hidden relative z-10 overflow-hidden transition-all duration-300 ease-in-out ${isMobileCalendarOpen ? 'max-h-[500px] mt-6 opacity-100' : 'max-h-0 opacity-0'}`}>
                           <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                              <div className="flex items-center justify-between mb-4">
                                 <h3 className="text-[14px] font-['Lexend_Deca'] font-bold text-white">{t('stats.calendar_title')}</h3>
                                 <div className="flex items-center gap-2">
                                    <button onClick={() => setMonthOffset(m => m - 1)} className="p-1 text-white/70 hover:text-white transition-colors rounded-full hover:bg-white/10"><ChevronRight size={14} className="rotate-180" /></button>
                                    <span className="text-[11px] font-bold text-white min-w-[70px] text-center">{new Intl.DateTimeFormat(language, { month: 'long' }).format(displayDate)}</span>
                                    <button onClick={() => setMonthOffset(m => m + 1)} className="p-1 text-white/70 hover:text-white transition-colors rounded-full hover:bg-white/10"><ChevronRight size={14} /></button>
                                 </div>
                              </div>
                              <div className="grid grid-cols-7 gap-1 text-center mb-1">
                                 {narrowDays.map((d, i) => (
                                    <span key={i} className="text-[10px] font-bold text-white/70 uppercase">{d}</span>
                                 ))}
                              </div>
                              <div className="grid grid-cols-7 gap-1">
                                 {[...Array(paddingDays)].map((_, i) => (
                                    <div key={`empty-${i}`} className="aspect-square" />
                                 ))}
                                 {[...Array(daysInMonth)].map((_, i) => {
                                    const day = i + 1;
                                    const isToday = displayMonth === today.getMonth() && displayYear === today.getFullYear() && day === today.getDate();
                                    const isStreak = isActiveDate(day);
                                    
                                    return (
                                       <div key={day} className={`aspect-square rounded-md flex items-center justify-center text-[11px] font-semibold relative
                                          ${isToday && isStreak ? 'bg-white text-orange-500 shadow-sm' : 
                                            isToday ? 'bg-white text-indigo-600 shadow-sm' : 
                                            isStreak ? 'bg-white/20 text-white' : 
                                            'bg-black/5 text-white/40'}
                                       `}>
                                          {day}
                                       </div>
                                    );
                                 })}
                              </div>
                           </div>
                       </div>
                    </div>
                 </div>
              </section>

              {/* ACTIVITY CHART SECTION */}
              <section>
                 <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-['Lexend_Deca'] font-bold text-slate-800 dark:text-slate-100">{t('stats.activity_analysis')}</h2>
                    <div className="flex bg-slate-100 dark:bg-white/5 rounded-xl p-1">
                       <button 
                         onClick={() => setChartView('weekly')}
                         className={`px-4 py-1.5 rounded-lg text-[12px] font-bold transition-all ${chartView === 'weekly' ? 'bg-white dark:bg-[#1C1A29] shadow-sm text-slate-800 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
                       >
                         {t('stats.weekly')}
                       </button>
                       <button 
                         onClick={() => setChartView('monthly')}
                         className={`px-4 py-1.5 rounded-lg text-[12px] font-bold transition-all ${chartView === 'monthly' ? 'bg-white dark:bg-[#1C1A29] shadow-sm text-slate-800 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
                       >
                         {t('stats.monthly')}
                       </button>
                    </div>
                 </div>

                 <div className="bg-white dark:bg-[#1C1A29] rounded-[24px] p-6 border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none h-[320px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={activeChartData} margin={{ top: 10, right: 0, left: -30, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis 
                            dataKey="label" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600, fontFamily: 'Manrope' }} 
                            dy={10}
                          />
                          <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600, fontFamily: 'Manrope' }} 
                          />
                          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--chart-cursor)' }} />
                          <Bar 
                            dataKey="value" 
                            fill="#4f46e5" 
                            radius={[6, 6, 0, 0]} 
                            barSize={chartView === 'weekly' ? 32 : 48}
                          >
                             {activeChartData.map((entry: any, index: number) => (
                                <Cell 
                                  key={`cell-${index}`} 
                                  fill="#5D5CE6" 
                                  className="hover:opacity-80 transition-opacity cursor-pointer"
                                />
                             ))}
                          </Bar>
                       </BarChart>
                    </ResponsiveContainer>
                 </div>
              </section>

              {/* RECENT FEED (BA-YU APP STYLE) */}
              <section>
                 <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-['Lexend_Deca'] font-bold text-slate-800 dark:text-slate-100">{t('stats.recent_history')}</h2>
                 </div>

                 <div className="grid gap-4">
                    {isLoading ? (
                       [...Array(3)].map((_, i) => (
                          <div key={i} className="bg-white dark:bg-[#1C1A29] rounded-[20px] p-4 border border-slate-200 dark:border-white/5 animate-pulse flex gap-4">
                             <div className="w-24 h-24 bg-slate-100 dark:bg-white/5 rounded-xl shrink-0" />
                             <div className="flex-1 space-y-3 py-2">
                                <div className="h-4 bg-slate-100 dark:bg-white/5 rounded-full w-3/4" />
                                <div className="h-3 bg-slate-100 dark:bg-white/5 rounded-full w-1/2" />
                             </div>
                          </div>
                       ))
                    ) : allNotes.length > 0 ? (
                       (showFullHistory ? allNotes : notes).map((note) => {
                          const mappedNote = {
                              ...note,
                              id: note.id || note._id,
                              title: note.title,
                              description: note.description || (note.plain_content ? note.plain_content.substring(0, 150) : ""),
                              thumbnail: note.thumbnail,
                              author: note.user ? {
                                ...note.user,
                                avatar: note.user?.avatar || null
                              } : { name: "Anonim", avatar: null },
                              mataPelajaran: note.mapel || note.mataPelajaran || "Umum",
                              jenjang: note.jenjang || "-",
                              kelas: note.kelas || "-",
                              createdAt: note.created_at,
                              views: note.views || 0,
                              rating: note.rating || 5,
                              likes: note.likes_count || note.likes || 0,
                              comments: note.comments_count || note.comments || 0,
                              read_time: note.read_time,
                          };
                          return <NoteCard key={mappedNote.id} note={mappedNote} onLike={handleLikePost} />;
                       })
                    ) : (
                       <div className="text-center py-10 text-slate-500 font-medium text-[14px]">{t('stats.no_history')}</div>
                    )}
                 </div>
                 
                 {allNotes.length > 3 && (
                    <button onClick={() => setShowFullHistory(!showFullHistory)} className="w-full mt-6 py-3.5 bg-white dark:bg-[#1C1A29] text-[13px] font-bold text-slate-600 dark:text-slate-400 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none">
                       {showFullHistory ? t('stats.hide_some') : t('stats.see_all')}
                    </button>
                 )}
              </section>
           </div>

           {/* RIGHT SIDEBAR (BA-YU STYLE) */}
           <div className="hidden lg:block w-[340px] shrink-0 space-y-6 sticky top-24 self-start">
              
              {/* TOP PERFORMANCE */}
              <div className="bg-white dark:bg-[#1C1A29] rounded-[24px] p-6 border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none">
                 <h3 className="text-[16px] font-['Lexend_Deca'] font-bold text-slate-800 dark:text-slate-100 mb-5">{t('stats.achievements')}</h3>
                 <div className="space-y-3">
                    <div className="flex items-center gap-4 bg-slate-50 dark:bg-white/5 p-3.5 rounded-2xl border border-slate-100 dark:border-white/5">
                       <div className="w-10 h-10 bg-white dark:bg-[#252336] rounded-xl flex items-center justify-center text-amber-500 shadow-sm dark:shadow-none">
                          <Award size={20} />
                       </div>
                       <div>
                          <p className="text-[11px] font-medium text-slate-500 mb-0.5">{t('stats.notes')}</p>
                          <h4 className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-none">{stats?.achievements?.notes_created || 0} {t('stats.notes_created')}</h4>
                       </div>
                    </div>
                    <div className="flex items-center gap-4 bg-slate-50 dark:bg-white/5 p-3.5 rounded-2xl border border-slate-100 dark:border-white/5">
                       <div className="w-10 h-10 bg-white dark:bg-[#252336] rounded-xl flex items-center justify-center text-emerald-500 shadow-sm dark:shadow-none">
                          <BookOpen size={20} />
                       </div>
                       <div>
                          <p className="text-[11px] font-medium text-slate-500 mb-0.5">{t('stats.total_materials')}</p>
                          <h4 className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-none">{stats?.achievements?.materials_completed || 0} {t('stats.completed')}</h4>
                       </div>
                    </div>
                 </div>
              </div>

              {/* CALENDAR MINI */}
              <div className="bg-white dark:bg-[#1C1A29] rounded-[24px] p-6 border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none">
                 <div className="flex items-center justify-between mb-5">
                    <h3 className="text-[16px] font-['Lexend_Deca'] font-bold text-slate-800 dark:text-slate-100">{t('stats.calendar_title')}</h3>
                    <div className="flex items-center gap-2">
                       <button onClick={() => setMonthOffset(m => m - 1)} className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-primary transition-colors rounded-full hover:bg-indigo-50 dark:hover:bg-primary/10"><ChevronRight size={16} className="rotate-180" /></button>
                       <span className="text-[12px] font-bold text-slate-500 dark:text-slate-400 min-w-[70px] text-center">{new Intl.DateTimeFormat(language, { month: 'long' }).format(displayDate)}</span>
                       <button onClick={() => setMonthOffset(m => m + 1)} className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-primary transition-colors rounded-full hover:bg-indigo-50 dark:hover:bg-primary/10"><ChevronRight size={16} /></button>
                    </div>
                 </div>
                 <div className="grid grid-cols-7 gap-1.5 text-center mb-2">
                    {narrowDays.map((d, i) => (
                       <span key={i} className="text-[11px] font-bold text-slate-400 uppercase">{d}</span>
                    ))}
                 </div>
                 <div className="grid grid-cols-7 gap-1.5">
                    {[...Array(paddingDays)].map((_, i) => (
                       <div key={`empty-${i}`} className="aspect-square" />
                    ))}
                    {[...Array(daysInMonth)].map((_, i) => {
                       const day = i + 1;
                       const isToday = displayMonth === today.getMonth() && displayYear === today.getFullYear() && day === today.getDate();
                       const isStreak = isActiveDate(day);
                       
                       return (
                          <div key={day} className={`aspect-square rounded-lg flex items-center justify-center text-[12px] font-semibold relative
                             ${isToday && isStreak ? 'bg-orange-500 text-white shadow-md' : 
                               isToday ? 'bg-indigo-600 text-white shadow-md' : 
                               isStreak ? 'bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400' : 
                               'bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer'}
                          `}>
                             {day}
                             {isStreak && !isToday && (
                                <div className="absolute -bottom-0.5 w-1 h-1 bg-orange-500 rounded-full" />
                             )}
                          </div>
                       );
                    })}
                 </div>
              </div>

              {/* FOOTER INFO */}
              <p className="text-[12px] font-medium text-slate-400 text-center px-4 leading-relaxed">
                 {t('stats.footer_info')}
              </p>
           </div>
        </div>

      </div>

      {/* MODAL SET GOAL HARIAN (CLOCK STYLE - ALREADY IMPLEMENTED) */}
      {isGoalModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            onClick={() => setIsGoalModalOpen(false)}
          />
          <div className="bg-white dark:bg-[#1C1A29] rounded-[40px] w-full max-w-md p-8 md:p-10 relative z-10 shadow-2xl border border-white dark:border-white/5 transform animate-in zoom-in slide-in-from-bottom-8 duration-500 max-h-[95vh] overflow-y-auto">
            <button 
              onClick={() => setIsGoalModalOpen(false)}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-indigo-50 rounded-[28px] flex items-center justify-center mb-6">
                <Target className="text-indigo-600 w-8 h-8" />
              </div>
              
              <h3 className="font-['Lexend_Deca'] text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2 tracking-tight">{t('stats.set_goal_title')}</h3>
              <p className="text-slate-500 text-sm font-medium mb-10 max-w-[280px]">
                {t('stats.set_goal_desc')}
              </p>
              
              <div className="w-full">
                {/* DIGITAL CLOCK INPUT */}
                <div className="flex items-center justify-center gap-4 sm:gap-6 mb-12" dir="ltr">
                  {/* HOURS COLUMN */}
                  <div className="flex flex-col items-center gap-3">
                    <button 
                      onClick={() => setTempHours((prev: number) => (prev + 1) % 24)}
                      className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-primary transition-all"
                    >
                      <ChevronUp size={20} />
                    </button>
                    <div className="w-20 h-24 sm:w-24 sm:h-28 bg-indigo-50/50 dark:bg-indigo-500/5 rounded-[28px] border-2 border-indigo-100/50 dark:border-indigo-500/20 relative overflow-hidden group focus-within:border-indigo-400 transition-colors flex flex-col items-center justify-center">
                       <input 
                         type="text"
                         value={tempHours.toString().padStart(2, '0')}
                         onChange={(e) => {
                           const val = parseInt(e.target.value.replace(/\D/g, '')) || 0;
                           setTempHours(Math.min(val, 23));
                         }}
                         style={{ textAlign: 'center' }}
                         className="w-full bg-transparent text-4xl sm:text-5xl font-['Lexend_Deca'] font-bold text-indigo-600 tabular-nums focus:outline-none leading-none mt-1 px-0 tracking-normal"
                       />
                       <div className="text-[9px] font-bold text-indigo-300 uppercase tracking-[0.2em] pointer-events-none mt-1">{t('stats.hours')}</div>
                    </div>
                    <button 
                      onClick={() => setTempHours((prev: number) => (prev - 1 + 24) % 24)}
                      className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-primary transition-all"
                    >
                      <ChevronDown size={20} />
                    </button>
                  </div>

                  {/* SEPARATOR */}
                  <div className="flex flex-col gap-2 relative z-10">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                  </div>

                  {/* MINUTES COLUMN */}
                  <div className="flex flex-col items-center gap-3">
                    <button 
                      onClick={() => setTempMinutes((prev: number) => (prev + 5) % 60)}
                      className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-primary transition-all"
                    >
                      <ChevronUp size={20} />
                    </button>
                    <div className="w-20 h-24 sm:w-24 sm:h-28 bg-indigo-50/50 dark:bg-indigo-500/5 rounded-[28px] border-2 border-indigo-100/50 dark:border-indigo-500/20 relative overflow-hidden focus-within:border-indigo-400 transition-colors flex flex-col items-center justify-center">
                       <input 
                         type="text"
                         value={tempMinutes.toString().padStart(2, '0')}
                         onChange={(e) => {
                           const val = parseInt(e.target.value.replace(/\D/g, '')) || 0;
                           setTempMinutes(Math.min(val, 59));
                         }}
                         style={{ textAlign: 'center' }}
                         className="w-full bg-transparent text-4xl sm:text-5xl font-['Lexend_Deca'] font-bold text-indigo-600 tabular-nums focus:outline-none leading-none mt-1 px-0 tracking-normal"
                       />
                       <div className="text-[9px] font-bold text-indigo-300 uppercase tracking-[0.2em] pointer-events-none mt-1">{t('stats.mins')}</div>
                    </div>
                    <button 
                      onClick={() => setTempMinutes((prev: number) => (prev - 5 + 60) % 60)}
                      className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-primary transition-all"
                    >
                      <ChevronDown size={20} />
                    </button>
                  </div>
                </div>
                
                <div className="pt-2">
                   <button 
                      onClick={async () => {
    const totalMenitTarget = (tempHours * 60) + tempMinutes;

    try {
        const token = localStorage.getItem("bayu-token") || sessionStorage.getItem("bayu-token");
        
        await axios.post("/api/v1/user/target", { 
            target: totalMenitTarget 
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

       setStats((prevStats: any) => ({
            ...prevStats,
            daily_target: totalMenitTarget
        }));

        setIsGoalModalOpen(false);

    } catch (error) {
        console.error("Gagal nyimpen target:", error);
    }
}}
                      className="w-full py-5 bg-indigo-600 text-white rounded-[24px] text-[13px] font-bold uppercase tracking-widest shadow-xl shadow-indigo-100 dark:shadow-none hover:-translate-y-1 hover:bg-indigo-700 transition-all duration-300"
                   >
                      {t('stats.save_target')}
                   </button>
                   <button 
                      onClick={() => setIsGoalModalOpen(false)}
                      className="w-full mt-4 py-3 text-slate-400 text-[11px] font-bold uppercase tracking-widest hover:text-slate-600 transition-colors"
                   >
                      {t('stats.cancel')}
                   </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL SHARE */}
      {showShareModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-white dark:bg-[#1C1A29] rounded-[32px] w-full max-w-md max-h-[90vh] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.2)] dark:shadow-[0_25px_70px_-10px_rgba(0,0,0,0.6)] overflow-hidden border border-white dark:border-white/5 transform animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 flex flex-col">
                <div className="bg-indigo-50 dark:bg-indigo-500/10 p-6 pb-5 text-center border-b border-indigo-100/50 dark:border-white/5 shrink-0">
                    <div className="w-14 h-14 bg-white dark:bg-[#1C1A29] text-indigo-600 dark:text-primary rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm dark:shadow-none border border-indigo-200/30 dark:border-primary/20">
                        <Share2 className="w-7 h-7" strokeWidth={2.5} />
                    </div>
                    <h3 className="font-['Lexend_Deca'] font-extrabold text-xl text-gray-900 dark:text-gray-100 mb-1">
                        {t('stats.share_title')}
                    </h3>
                    <p className="font-['Manrope'] text-[13px] text-gray-600 dark:text-gray-400 font-bold px-6">
                        {t('stats.share_desc')}
                    </p>
                </div>

                <div className="p-6 pt-6 overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-4 gap-y-6 gap-x-3 mb-6">
                        <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Cek statistik belajarku di Ba-Yu! Streak: ${stats?.summary?.current_streak || 0} hari. ${window.location.href}`)}`, "_blank")} className="flex flex-col items-center gap-2 group">
                            <div className="w-11 h-11 bg-[#25D366] text-white rounded-[16px] flex items-center justify-center shadow-lg shadow-green-100/50 dark:shadow-green-900/20 group-hover:-translate-y-1 transition-all">
                                <MessageCircleIcon className="w-5 h-5 fill-white" />
                            </div>
                            <span className="text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">WA</span>
                        </button>
                        <button onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Gila, streak belajarku udah ${stats?.summary?.current_streak || 0} hari di Ba-Yu! 🚀`)}&url=${encodeURIComponent(window.location.href)}`, "_blank")} className="flex flex-col items-center gap-2 group">
                            <div className="w-11 h-11 bg-black text-white rounded-[16px] flex items-center justify-center shadow-lg shadow-gray-200/50 dark:shadow-black/30 group-hover:-translate-y-1 transition-all">
                                <Twitter className="w-5 h-5 fill-white" />
                            </div>
                            <span className="text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">X</span>
                        </button>
                        <button onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, "_blank")} className="flex flex-col items-center gap-2 group">
                            <div className="w-11 h-11 bg-[#1877F2] text-white rounded-[16px] flex items-center justify-center shadow-lg shadow-blue-100/50 dark:shadow-blue-900/20 group-hover:-translate-y-1 transition-all">
                                <Facebook className="w-5 h-5 fill-white" />
                            </div>
                            <span className="text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">FB</span>
                        </button>
                        <button onClick={() => window.open(`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(`Cek statistik belajarku di Ba-Yu! Streak: ${stats?.summary?.current_streak || 0} hari.`)}`, "_blank")} className="flex flex-col items-center gap-2 group">
                            <div className="w-11 h-11 bg-[#0088cc] text-white rounded-[16px] flex items-center justify-center shadow-lg shadow-sky-100/50 dark:shadow-sky-900/20 group-hover:-translate-y-1 transition-all">
                                <Send className="w-5 h-5 fill-white" />
                            </div>
                            <span className="text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tele</span>
                        </button>
                    </div>

                    <div className="relative group mb-2">
                        <label className="block text-left text-[11px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">
                            {t('stats.copy_link')}
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
                                <Link2 className="w-4 h-4" />
                            </div>
                            <input type="text" readOnly value={window.location.href} className="w-full pl-11 pr-24 py-3.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl text-[12.5px] font-bold text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-400 transition-all" />
                            <button onClick={() => { navigator.clipboard.writeText(window.location.href); showToast("Link berhasil disalin!", "success"); }} className="absolute right-2 top-2 bottom-2 px-4 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 active:scale-95">
                                {t('stats.copy')}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-5 border-t border-gray-50 dark:border-white/5 shrink-0">
                    <button onClick={() => setShowShareModal(false)} className="w-full py-3.5 rounded-2xl font-['Lexend_Deca'] font-black text-[14px] text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-all active:scale-95">
                        {t('stats.close_modal')}
                    </button>
                </div>
            </div>
        </div>
      )}
  
    </MobileLayout>
  );
}

export default LearningStatisticsPage;
