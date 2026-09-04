import { Link, useNavigate } from 'react-router';
import { Menu, Search, Edit3, Bell, Settings, HelpCircle, LogOut, Camera, Filter, Check, RotateCcw, FileText, AlignLeft, BookOpen, Tag, User as UserIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import AvatarNotifications from './ui/avatar-notifications';
import ApplicationLogo from './ApplicationLogo';
import { AvatarImage } from './ui/DefaultImages';
import { useTranslation } from '../hooks/useTranslation';
import CameraScanner from './CameraScanner';

interface TopNavProps {
  isSidebarExpanded: boolean;
  toggleSidebar: () => void;
}

const SEARCH_CATEGORIES = [
  { id: 'title', labelKey: 'topnav.target_title', defaultLabel: 'Judul Catatan', descKey: 'topnav.target_title_desc', defaultDesc: 'Mencocokkan judul catatan', icon: FileText },
  { id: 'content', labelKey: 'topnav.target_content', defaultLabel: 'Deskripsi & Isi', descKey: 'topnav.target_content_desc', defaultDesc: 'Mencocokkan ringkasan materi', icon: AlignLeft },
  { id: 'subject', labelKey: 'topnav.target_subject', defaultLabel: 'Mata Pelajaran', descKey: 'topnav.target_subject_desc', defaultDesc: 'Topik atau mapel spesifik', icon: BookOpen },
  { id: 'tags', labelKey: 'topnav.target_tags', defaultLabel: 'Tag Catatan', descKey: 'topnav.target_tags_desc', defaultDesc: 'Label topik (#rumus, #ujian)', icon: Tag },
  { id: 'author', labelKey: 'topnav.target_author', defaultLabel: 'Pembuat / Kreator', descKey: 'topnav.target_author_desc', defaultDesc: 'Nama atau username pembuat', icon: UserIcon },
];
const ALL_CATEGORY_IDS = SEARCH_CATEGORIES.map(c => c.id);

export function TopNav({ isSidebarExpanded, toggleSidebar }: TopNavProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const [selectedTargets, setSelectedTargets] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sensora_search_targets');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return ALL_CATEGORY_IDS;
  });

  const handleToggleTarget = (id: string) => {
    setSelectedTargets(prev => {
      const updated = prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id];
      try {
        localStorage.setItem('sensora_search_targets', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const handleSelectAllTargets = () => {
    setSelectedTargets(ALL_CATEGORY_IDS);
    try {
      localStorage.setItem('sensora_search_targets', JSON.stringify(ALL_CATEGORY_IDS));
    } catch (e) {}
  };

  const handleResetTargets = () => {
    setSelectedTargets([]);
    try {
      localStorage.setItem('sensora_search_targets', JSON.stringify([]));
    } catch (e) {}
  };
  
  // Mengganti isOcrOpen menjadi isScannerOpen
  const [isScannerOpen, setIsScannerOpen] = useState(false); 
  const profileRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const targetsParam = selectedTargets.length === ALL_CATEGORY_IDS.length ? '' : `&targets=${selectedTargets.join(',')}`;
      navigate(`/explore?q=${encodeURIComponent(searchQuery.trim())}${targetsParam}`);
    }
  };

  return (
    <header className="h-[60px] px-4 sm:px-6 lg:px-8 flex items-center justify-between w-full bg-transparent">
      
      {/* LEFT SECTION */}
      <div className="flex items-center flex-1 min-w-0 mr-3">
        <button 
          onClick={toggleSidebar}
          className="mr-3 sm:mr-4 text-gray-700 dark:text-gray-300 hover:text-primary transition-colors focus:outline-none p-1.5 -ml-1.5 rounded-full hover:bg-primary/5 shrink-0"
          aria-label="Buka Menu"
        >
          <Menu className="w-[22px] h-[22px]" strokeWidth={1.5} />
        </button>

        {/* SensoraNote Logo */}
        <Link to="/home" className="flex items-center gap-2 mr-3 sm:mr-6 shrink-0 group outline-none focus:outline-none [-webkit-tap-highlight-color:transparent]">
           <ApplicationLogo className="w-8 h-8" />
           <span className="font-['Lexend_Deca'] font-extrabold text-[20px] lg:text-[22px] tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-800 dark:from-[#60a5fa] dark:to-[#93c5fd] hidden sm:block">
              SensoraNote
           </span>
        </Link>

        {/* SEARCH FORM & FILTER BUTTON */}
        <div className="hidden md:flex items-center gap-1.5 lg:gap-2">
          <form onSubmit={handleSearch} className="flex items-center w-full max-w-[170px] lg:max-w-[260px]">
             <div className="relative w-full group">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-primary transition-colors" strokeWidth={2} />
               <input
                 type="text"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 placeholder={t('topnav.search_placeholder') !== 'topnav.search_placeholder' ? t('topnav.search_placeholder') : 'Cari catatan, topik, atau kreator...'}
                 className="w-full h-[36px] pl-[34px] pr-3 text-[13px] font-['Manrope'] font-medium bg-gray-50 dark:bg-white/5 hover:bg-gray-100/80 dark:hover:bg-white/10 focus:bg-white dark:focus:bg-white/10 border border-transparent focus:border-primary/30 dark:focus:border-primary/40 focus:shadow-[0_0_0_3px_rgba(93,92,230,0.08)] rounded-[12px] transition-all outline-none text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
               />
             </div>
          </form>

          {/* TOMBOL FILTER DI SAMPING KANAN PENCARIAN */}
          <div className="relative" ref={filterRef}>
             <button
               type="button"
               onClick={() => setIsFilterOpen(!isFilterOpen)}
               className={`h-[36px] px-2.5 rounded-[12px] flex items-center gap-1.5 text-[12px] font-['Manrope'] font-bold border transition-all cursor-pointer select-none ${
                  isFilterOpen || (selectedTargets.length > 0 && selectedTargets.length < ALL_CATEGORY_IDS.length)
                    ? 'bg-primary/10 border-primary/30 text-primary dark:bg-primary/20 dark:border-primary/40 shadow-xs'
                    : 'bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 border-transparent hover:border-gray-200 dark:hover:border-white/10 text-gray-600 dark:text-gray-300'
               }`}
               title="Filter Kategori Pencarian"
               aria-label="Filter Kategori Pencarian"
             >
               <Filter className="w-[15px] h-[15px]" strokeWidth={2.2} />
               <span className="hidden xl:inline text-[12px]">Filter</span>
               {selectedTargets.length < ALL_CATEGORY_IDS.length && (
                  <span className="w-4 h-4 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-bold">
                    {selectedTargets.length}
                  </span>
               )}
             </button>

             {/* POPOVER MENU FILTER */}
             <AnimatePresence>
                {isFilterOpen && (
                   <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.96 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="absolute left-0 top-[44px] w-[290px] bg-white dark:bg-[#1C1A29] rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.45)] border border-gray-100 dark:border-white/10 p-3.5 z-50 animate-in"
                   >
                      {/* Header Popover */}
                      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-gray-100 dark:border-white/5">
                         <div>
                            <h4 className="font-['Lexend_Deca'] font-bold text-[13px] text-gray-900 dark:text-gray-100">
                               {t('topnav.search_filter') !== 'topnav.search_filter' ? t('topnav.search_filter') : 'Filter Pencarian'}
                            </h4>
                            <p className="font-['Manrope'] text-[11px] text-gray-500 dark:text-gray-400">
                               {selectedTargets.length === ALL_CATEGORY_IDS.length 
                                  ? 'Semua kategori aktif' 
                                  : selectedTargets.length === 0
                                     ? 'Tidak difilter (semua)'
                                     : `${selectedTargets.length} dari ${ALL_CATEGORY_IDS.length} aktif`}
                            </p>
                         </div>
                         <div className="flex items-center gap-1.5">
                            <button
                               type="button"
                               onClick={handleSelectAllTargets}
                               className="text-[11px] font-['Manrope'] font-bold text-primary hover:underline px-1 py-0.5 rounded cursor-pointer"
                            >
                               {t('topnav.filter_all') !== 'topnav.filter_all' ? t('topnav.filter_all') : 'Pilih Semua'}
                            </button>
                            <span className="text-gray-300 dark:text-gray-600 text-[10px]">•</span>
                            <button
                               type="button"
                               onClick={handleResetTargets}
                               className="text-[11px] font-['Manrope'] font-bold text-rose-500 hover:underline px-1 py-0.5 rounded cursor-pointer flex items-center gap-0.5"
                            >
                               <RotateCcw className="w-2.5 h-2.5" />
                               <span>{t('topnav.filter_reset') !== 'topnav.filter_reset' ? t('topnav.filter_reset') : 'Reset'}</span>
                            </button>
                         </div>
                      </div>

                      {/* List 5 Kategori */}
                      <div className="space-y-1">
                         {SEARCH_CATEGORIES.map((cat) => {
                            const isChecked = selectedTargets.includes(cat.id);
                            const Icon = cat.icon;
                            return (
                               <div
                                  key={cat.id}
                                  onClick={() => handleToggleTarget(cat.id)}
                                  className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all ${
                                     isChecked
                                        ? 'bg-primary/5 dark:bg-primary/10 hover:bg-primary/10'
                                        : 'hover:bg-gray-50 dark:hover:bg-white/5 opacity-70 hover:opacity-100'
                                  }`}
                               >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                     <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                                        isChecked
                                           ? 'bg-primary text-white shadow-xs'
                                           : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400'
                                     }`}>
                                        <Icon className="w-3.5 h-3.5" strokeWidth={2} />
                                     </div>
                                     <div className="flex flex-col min-w-0">
                                        <span className={`text-[12.5px] font-['Lexend_Deca'] font-bold truncate ${
                                           isChecked
                                              ? 'text-gray-900 dark:text-gray-100'
                                              : 'text-gray-600 dark:text-gray-400'
                                        }`}>
                                           {t(cat.labelKey) !== cat.labelKey ? t(cat.labelKey) : cat.defaultLabel}
                                        </span>
                                        <span className="text-[10.5px] font-['Manrope'] text-gray-500 dark:text-gray-400 font-medium truncate">
                                           {t(cat.descKey) !== cat.descKey ? t(cat.descKey) : cat.defaultDesc}
                                        </span>
                                     </div>
                                  </div>

                                  <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ml-2 transition-all ${
                                     isChecked
                                        ? 'bg-primary border-primary text-white'
                                        : 'border-gray-300 dark:border-white/20 bg-white dark:bg-white/5'
                                  }`}>
                                     {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                                  </div>
                               </div>
                            );
                         })}
                      </div>

                      {/* Action Button */}
                      <div className="pt-2.5 mt-2 border-t border-gray-100 dark:border-white/5">
                         <button
                            type="button"
                            onClick={() => {
                               setIsFilterOpen(false);
                               if (searchQuery.trim()) {
                                  const targetsParam = selectedTargets.length === ALL_CATEGORY_IDS.length ? '' : `&targets=${selectedTargets.join(',')}`;
                                  navigate(`/explore?q=${encodeURIComponent(searchQuery.trim())}${targetsParam}`);
                               }
                            }}
                            className="w-full py-2 px-3 rounded-xl bg-primary text-white text-[12px] font-['Lexend_Deca'] font-bold hover:bg-primary/90 shadow-sm shadow-primary/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                         >
                            <span>{t('topnav.filter_apply') !== 'topnav.filter_apply' ? t('topnav.filter_apply') : 'Terapkan Filter'}</span>
                         </button>
                      </div>
                   </motion.div>
                )}
             </AnimatePresence>
          </div>
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 shrink-0 relative">
        
        {/* === TOMBOL CAMERA SCANNER (TABLET & DESKTOP) === */}
        <button 
          onClick={() => setIsScannerOpen(true)}
          className="hidden md:flex items-center justify-center gap-1.5 sm:gap-2 h-[36px] px-3 sm:px-4 rounded-full bg-primary text-white text-[13px] sm:text-[13.5px] font-['Manrope'] font-semibold shadow-[0_4px_10px_rgb(93,92,230,0.15)] hover:bg-primary/90 hover:shadow-[0_6px_14px_rgb(93,92,230,0.25)] hover:-translate-y-0.5 transition-all cursor-pointer shrink-0"
          title={t('topnav.scan_image') !== 'topnav.scan_image' ? t('topnav.scan_image') : 'Scan Gambar'}
        >
          <Camera className="w-[16px] h-[16px]" strokeWidth={2} />
          <span>{t('topnav.scan_image') !== 'topnav.scan_image' ? t('topnav.scan_image') : 'Scan Gambar'}</span>
        </button>
        
        {/* === TOMBOL TULIS CATATAN (TABLET & DESKTOP) === */}
        <Link 
          to="/upload"
          className="hidden md:flex items-center gap-1.5 sm:gap-2 h-[36px] px-3 sm:px-3.5 rounded-full border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:text-primary hover:border-primary/40 dark:hover:border-primary/40 text-[13px] sm:text-[13.5px] font-['Manrope'] font-semibold transition-all hover:-translate-y-0.5 shrink-0"
          title="Tulis Catatan"
        >
          <Edit3 className="w-[16px] h-[16px]" strokeWidth={2} />
          <span>{t('topnav.write')}</span>
        </Link>

        <button className="sm:hidden text-gray-500 dark:text-gray-400 hover:text-primary transition-colors p-1.5 rounded-full hover:bg-primary/5">
          <Search className="w-5 h-5" strokeWidth={2} />
        </button>

        <div className="mr-0.5 sm:mr-1">
          <AvatarNotifications />
        </div>

        {/* Profile Avatar & Dropdown */}
        <div className="relative" ref={profileRef}>
           <button 
             onClick={() => setIsProfileOpen(!isProfileOpen)}
             className="focus:outline-none hover:opacity-80 transition-opacity ml-1 ring-2 ring-transparent active:ring-primary/20 rounded-full p-0.5"
           >
              <AvatarImage 
                src={user?.avatar} 
                alt={user?.name || "Profile"} 
                name={user?.name}
                size={34}
                className="bg-gray-50 dark:bg-white/10 border border-gray-100 dark:border-white/10"
              />
           </button>

           <AnimatePresence>
             {isProfileOpen && (
               <motion.div 
                 initial={{ opacity: 0, y: 10, scale: 0.95 }}
                 animate={{ opacity: 1, y: 0, scale: 1 }}
                 exit={{ opacity: 0, y: 10, scale: 0.95 }}
                 transition={{ duration: 0.2, ease: "easeOut" }}
                 className="absolute right-0 top-[48px] w-[260px] bg-white dark:bg-[#1C1A29] rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.4)] border border-gray-100 dark:border-white/5 py-3 z-50"
               >
                  <Link to="/profile" className="flex items-center gap-3 px-5 py-2 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors mb-2 group">
                     <AvatarImage src={user?.avatar} alt={user?.name || "Profile"} name={user?.name} size={40} className="shadow-sm group-hover:scale-105 transition-transform" />
                     <div className="flex flex-col overflow-hidden">
                        <span className="font-['Lexend_Deca'] font-bold text-gray-900 dark:text-gray-100 text-[15px] truncate">{user?.name}</span>
                        <span className="text-[13px] font-['Manrope'] text-gray-500 dark:text-gray-400 group-hover:text-primary transition-colors">{t('topnav.view_profile')}</span>
                     </div>
                  </Link>
                  <div className="h-px bg-gray-100 dark:bg-white/5 my-2 mx-4"></div>
                  
                  {/* Main Action Links */}
                  <div className="flex flex-col py-1">
                      <Link to="/settings" className="flex items-center gap-3 px-3 py-2.5 mx-2 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 group transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-white/5 group-hover:bg-white dark:group-hover:bg-white/10 border border-transparent group-hover:border-gray-200 dark:group-hover:border-white/10 flex items-center justify-center transition-all">
                          <Settings className="w-[18px] h-[18px] text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors" strokeWidth={1.5} />
                        </div>
                        <span className="font-['Manrope'] text-[14px] font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">{t('topnav.settings')}</span>
                      </Link>
                     <Link to="/settings/help" className="flex items-center gap-3 px-3 py-2.5 mx-2 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 group transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-white/5 group-hover:bg-white dark:group-hover:bg-white/10 border border-transparent group-hover:border-gray-200 dark:group-hover:border-white/10 flex items-center justify-center transition-all">
                          <HelpCircle className="w-[18px] h-[18px] text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors" strokeWidth={1.5} />
                        </div>
                        <span className="font-['Manrope'] text-[14px] font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">{t('topnav.help_center')}</span>
                     </Link>
                  </div>
                  
                  <div className="flex flex-col py-1 border-t border-gray-100 dark:border-white/5">
                     <button onClick={() => { logout(); navigate('/'); }} className="w-full flex items-center justify-between px-4 py-3 bg-red-50/50 dark:bg-red-500/5 hover:bg-red-50 dark:hover:bg-red-500/10 group transition-colors text-left rounded-b-2xl">
                       <div>
                         <span className="block text-[13px] font-bold text-rose-600 dark:text-rose-400 font-['Lexend_Deca']">{t('topnav.logout')}</span>
                         <span className="text-[11px] font-['Manrope'] text-gray-500 dark:text-gray-400 group-hover:text-rose-400 transition-colors truncate max-w-[190px]">{user?.email || 'user@example.com'}</span>
                       </div>
                       <LogOut className="w-[18px] h-[18px] text-gray-500 dark:text-gray-400 group-hover:text-rose-500 dark:group-hover:text-rose-400 transition-colors" strokeWidth={1.5} />
                    </button>
                  </div>
                  
                  {/* Footer Links (Mini) */}
                  <div className="px-5 pt-3 mt-1 pb-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-['Manrope'] text-gray-500 dark:text-gray-500">
                      <Link to="/about" className="hover:text-gray-900 dark:hover:text-gray-300 transition-colors">{t('topnav.about')}</Link>
                      <Link to="/blog" className="hover:text-gray-900 dark:hover:text-gray-300 transition-colors">{t('topnav.blog')}</Link>
                      <Link to="/terms" className="hover:text-gray-900 dark:hover:text-gray-300 transition-colors">{t('topnav.terms')}</Link>
                      <Link to="/privacy" className="hover:text-gray-900 dark:hover:text-gray-300 transition-colors">{t('topnav.privacy')}</Link>
                  </div>
               </motion.div>
             )}
           </AnimatePresence>
        </div>
      </div>

      {/* Modal Overlay Kamera Scanner */}
      <AnimatePresence>
        {isScannerOpen && <CameraScanner onClose={() => setIsScannerOpen(false)} />}
      </AnimatePresence>
    </header>
  );
}