import { Home, Search, BarChart2, User, LayoutGrid, Edit3, Camera, Grid } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import CameraScanner from './CameraScanner'; // Mengganti VisionOcr menjadi CameraScanner

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false); // Mengubah state menjadi isScannerOpen
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsActionMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive = (path: string) => {
    if (path === '/home' && (location.pathname === '/' || location.pathname === '/home')) return true;
    return location.pathname.startsWith(path);
  };

  const renderNavItems = () => {
    const isPakar = user?.role === 'pakar';
    const isAdmin = user?.role === 'admin';

    const items = [
      { path: '/home', icon: Home, label: t('nav.home') },
      { path: '/explore', icon: Search, label: t('nav.explore_short') },
      { path: '/upload', icon: Grid, label: '', isSpecial: true },
      isAdmin 
          ? { path: '/admin', icon: LayoutGrid, label: t('nav.workspace') }
          : isPakar
            ? { path: '/pakar', icon: LayoutGrid, label: t('nav.workspace') }
            : { path: '/stats', icon: BarChart2, label: 'Statistik' },
      { path: '/profile', icon: User, label: t('nav.profile_short') },
    ].filter(Boolean) as any[];

    return items.map((item, idx) => {
      const active = isActive(item.path);

      if (item.isSpecial) {
        return (
          <div key={item.path} ref={menuRef} className="relative flex flex-col items-center flex-1 outline-none px-0.5 justify-center">
             <AnimatePresence>
               {isActionMenuOpen && (
                 <motion.div
                   initial={{ opacity: 0, y: 15, scale: 0.9 }}
                   animate={{ opacity: 1, y: 0, scale: 1 }}
                   exit={{ opacity: 0, y: 15, scale: 0.9 }}
                   className="absolute bottom-[70px] left-1/2 transform -translate-x-1/2 flex flex-col gap-2 p-2 bg-white dark:bg-[#1C1A29] rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.3)] border border-gray-100 dark:border-white/10 w-[170px] z-50 origin-bottom"
                 >
                   <button onClick={() => { setIsActionMenuOpen(false); navigate('/upload'); }} className="flex items-center gap-3 p-3 w-full text-gray-700 transition-colors rounded-xl dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5">
                     <div className="flex items-center justify-center w-8 h-8 text-blue-600 bg-blue-100 rounded-full dark:bg-blue-500/20 dark:text-blue-400 shrink-0"><Edit3 className="w-[18px] h-[18px]" /></div>
                     <span className="text-[13px] font-semibold font-['Manrope'] whitespace-nowrap">Tulis Catatan</span>
                   </button>
                   <button onClick={() => { setIsActionMenuOpen(false); setIsScannerOpen(true); }} className="flex items-center gap-3 p-3 w-full text-gray-700 transition-colors rounded-xl dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5">
                     <div className="flex items-center justify-center w-8 h-8 text-emerald-600 bg-emerald-100 rounded-full dark:bg-emerald-500/20 dark:text-emerald-400 shrink-0"><Camera className="w-[18px] h-[18px]" /></div>
                     <span className="text-[13px] font-semibold font-['Manrope'] whitespace-nowrap">Scan Dokumen</span>
                   </button>
                 </motion.div>
               )}
             </AnimatePresence>
             <button onClick={() => setIsActionMenuOpen(!isActionMenuOpen)} className="flex items-center justify-center relative group outline-none -mt-4 z-10" aria-label="Menu Aksi">
               <div className={`flex items-center justify-center w-[48px] h-[48px] rounded-2xl shadow-lg transition-all duration-300 ring-[4px] ring-white dark:ring-[#1C1A29] ${isActionMenuOpen ? 'bg-gray-600 dark:bg-gray-700 text-white scale-95 shadow-none' : 'bg-blue-600 dark:bg-primary text-white hover:scale-105 active:scale-95 shadow-[0_4px_14px_rgba(79,70,229,0.35)] dark:shadow-[0_4px_14px_rgba(123,123,255,0.25)]'}`}>
                  <item.icon className={`w-6 h-6 transition-transform duration-300 ${isActionMenuOpen ? 'rotate-45' : 'rotate-0'}`} strokeWidth={2.5} />
               </div>
             </button>
          </div>
        );
      }

      return (
        <Link key={item.path} to={item.path} className={`flex flex-col items-center justify-center flex-1 transition-all duration-300 outline-none px-0.5 ${active ? 'text-blue-600 dark:text-primary' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}>
          <div className={`relative flex items-center justify-center w-12 h-8 rounded-xl transition-all duration-300 ${active ? 'bg-blue-50/80 dark:bg-primary/10 animate-in fade-in zoom-in-95 duration-200' : 'bg-transparent'}`}>
             <item.icon className={`w-5 h-5 transition-all duration-300 ${active ? 'scale-110' : 'scale-100'}`} strokeWidth={active ? 2.5 : 2} />
          </div>
          <span className={`text-[10px] mt-1 font-['Manrope'] font-bold tracking-wide text-center w-full block truncate px-1 transition-all duration-300 ${active ? 'opacity-100 scale-100' : 'opacity-70 scale-95'}`}>{item.label}</span>
        </Link>
      );
    });
  };

  return (
    <>
      <div className="w-full bg-transparent">
        <div className="max-w-[430px] mx-auto">
          <div className="flex items-center justify-around h-[64px] px-2 relative">
            {renderNavItems()}
          </div>
        </div>
      </div>
      <AnimatePresence>
        {isScannerOpen && <CameraScanner onClose={() => setIsScannerOpen(false)} />}
      </AnimatePresence>
    </>
  );
}