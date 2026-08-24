import { Link, useNavigate } from 'react-router';
import { Menu, Search, Edit3, Bell, Settings, HelpCircle, LogOut, Camera } from 'lucide-react';
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

export function TopNav({ isSidebarExpanded, toggleSidebar }: TopNavProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  // Mengganti isOcrOpen menjadi isScannerOpen
  const [isScannerOpen, setIsScannerOpen] = useState(false); 
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="h-[60px] px-6 lg:px-8 flex items-center justify-between w-full bg-transparent">
      
      {/* LEFT SECTION */}
      <div className="flex items-center flex-1 min-w-0">
        <button 
          onClick={toggleSidebar}
          className="mr-4 text-gray-700 dark:text-gray-300 hover:text-primary transition-colors focus:outline-none p-1.5 -ml-1.5 rounded-full hover:bg-primary/5"
          aria-label="Buka Menu"
        >
          <Menu className="w-[22px] h-[22px]" strokeWidth={1.5} />
        </button>

        {/* SensoraNote Logo */}
        <Link to="/home" className="flex items-center gap-2 mr-6 shrink-0 group outline-none focus:outline-none [-webkit-tap-highlight-color:transparent]">
           <ApplicationLogo className="w-8 h-8" />
           <span className="font-['Lexend_Deca'] font-extrabold text-[22px] tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-800 dark:from-[#60a5fa] dark:to-[#93c5fd] hidden sm:block">
              SensoraNote
           </span>
        </Link>

        <form onSubmit={handleSearch} className="hidden sm:flex items-center w-full max-w-[280px]">
           <div className="relative w-full group">
             <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-primary transition-colors" strokeWidth={2} />
             <input
               type="text"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               placeholder={t('topnav.search_placeholder')}
               className="w-full h-[38px] pl-[38px] pr-4 text-[13.5px] font-['Manrope'] font-medium bg-gray-50 dark:bg-white/5 hover:bg-gray-100/80 dark:hover:bg-white/10 focus:bg-white dark:focus:bg-white/10 border border-transparent focus:border-primary/30 dark:focus:border-primary/40 focus:shadow-[0_0_0_4px_rgba(93,92,230,0.08)] rounded-[12px] transition-all outline-none text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
             />
           </div>
        </form>
      </div>

      {/* RIGHT SECTION */}
      <div className="flex items-center gap-4 sm:gap-5 shrink-0 relative">
        
        {/* === TOMBOL CAMERA SCANNER === */}
        <button 
          onClick={() => setIsScannerOpen(true)}
          className="hidden lg:flex items-center justify-center gap-2 h-[36px] px-[18px] rounded-full bg-primary text-white text-[13.5px] font-['Manrope'] font-semibold shadow-[0_4px_10px_rgb(93,92,230,0.15)] hover:bg-primary/90 hover:shadow-[0_6px_14px_rgb(93,92,230,0.25)] hover:-translate-y-0.5 transition-all"
        >
          <Camera className="w-[16px] h-[16px]" strokeWidth={2} />
          <span>Scan Dokumen</span>
        </button>
        
        <Link 
          to="/upload"
          className="hidden md:flex items-center gap-2 h-[36px] px-2 text-gray-500 dark:text-gray-400 hover:text-primary text-[14px] font-['Manrope'] transition-colors"
        >
          <Edit3 className="w-[18px] h-[18px]" strokeWidth={1.5} />
          <span>{t('topnav.write')}</span>
        </Link>

        <button className="sm:hidden text-gray-500 dark:text-gray-400 hover:text-primary transition-colors p-1.5 rounded-full hover:bg-primary/5">
          <Search className="w-5 h-5" strokeWidth={2} />
        </button>

        <div className="mr-1">
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
                alt="Profile" 
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
                     <AvatarImage src={user?.avatar} alt="Profile" size={40} className="shadow-sm group-hover:scale-105 transition-transform" />
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