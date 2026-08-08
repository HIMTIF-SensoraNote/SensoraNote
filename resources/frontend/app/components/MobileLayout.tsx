import { ReactNode, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BottomNav } from './BottomNav';
import { SideNav } from './SideNav';
import { TopNav } from './TopNav';
import ApplicationLogo from './ApplicationLogo';
import AvatarNotifications from './ui/avatar-notifications';
import { Edit3, Search, Menu, X } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router';
import { useAuth } from '../contexts/AuthContext';

interface MobileLayoutProps {
  children: ReactNode;
  showBottomNav?: boolean;
  hideTopNav?: boolean;
  hideMobileTopNav?: boolean;
  hideSidebar?: boolean;
}

export function MobileLayout({ children, showBottomNav = true, hideTopNav = false, hideMobileTopNav = false, hideSidebar = false }: MobileLayoutProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    const hasAnimated = sessionStorage.getItem('has_animated_session_entry');
    if (!hasAnimated) {
      setShouldAnimate(true);
      sessionStorage.setItem('has_animated_session_entry', 'true');
    }
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 1024 && window.innerWidth >= 768) {
         setIsSidebarExpanded(false);
      } else if (window.innerWidth >= 1024) {
         setIsSidebarExpanded(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isAdmin = user?.role === 'admin';

  return (
    // Base layout: Full column structure.
    <div className="h-screen w-full flex flex-col bg-white dark:bg-[#13111C] text-slate-900 dark:text-[#E8E6F0] overflow-hidden selection:bg-indigo-600/20 selection:text-indigo-600">
      
      {/* 1. DESKTOP & TABLET TOP REGION */}
      {!hideTopNav && (
        <motion.div 
          initial={shouldAnimate ? { y: -60, opacity: 0 } : false}
          animate={{ y: 0, opacity: 1 }}
          transition={shouldAnimate ? { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.05 } : { duration: 0 }}
          className="hidden md:block w-full border-b border-slate-100/60 dark:border-white/5 z-50 bg-white dark:bg-[#13111C] shrink-0 shadow-[0_2px_10px_rgb(0,0,0,0.02)] dark:shadow-none relative"
        >
           <TopNav 
             isSidebarExpanded={isSidebarExpanded} 
             toggleSidebar={() => setIsSidebarExpanded(!isSidebarExpanded)} 
           />
        </motion.div>
      )}

      {/* 2. MOBILE TOP BAR */}
      {!hideTopNav && !hideMobileTopNav && (
        <motion.div 
          initial={shouldAnimate ? { y: -60, opacity: 0 } : false}
          animate={{ y: 0, opacity: 1 }}
          transition={shouldAnimate ? { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.05 } : { duration: 0 }}
          className="md:hidden w-full bg-white/90 dark:bg-[#13111C]/90 backdrop-blur-md pt-[env(safe-area-inset-top)] border-b border-slate-100 dark:border-white/5 z-40 shadow-sm dark:shadow-none shrink-0"
        >
           <div className="flex items-center justify-between px-5 h-[60px]">
               <div className="flex items-center">
                   <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -ml-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-primary outline-none transition-colors rounded-md">
                       <Menu className="w-6 h-6" />
                   </button>
                   <Link to="/home" className="flex items-center shrink-0 group outline-none ml-2">
                      <span className="font-['Lexend_Deca'] font-extrabold text-[22px] tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-800 dark:from-[#7B7BFF] dark:to-[#A78BFA]">
                         Ba-Yu
                      </span>
                   </Link>
               </div>
               
               <div className="flex items-center gap-4">
                  <button onClick={() => navigate('/explore')} className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-primary transition-colors rounded-full hover:bg-indigo-50 dark:hover:bg-white/5 outline-none">
                    <Search className="w-[22px] h-[22px]" strokeWidth={2} />
                  </button>
                  <div className="mt-1">
                    <AvatarNotifications />
                  </div>
               </div>
           </div>
        </motion.div>
      )}

      {/* 3. MAIN BODY SPLIT */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* SIDEBAR (Only desktop/tablet) */}
        {!hideSidebar && (
          <motion.div 
            initial={false}
            animate={{ 
              width: isSidebarExpanded ? 240 : 0, 
              minWidth: isSidebarExpanded ? 240 : 0,
              opacity: isSidebarExpanded ? 1 : 0
            }}
            transition={{ type: "spring", damping: 25, stiffness: 250 }}
            className={`hidden md:flex flex-col flex-shrink-0 z-20 bg-white dark:bg-[#13111C] border-r h-full overflow-hidden ${isSidebarExpanded ? 'border-slate-100/100 dark:border-white/5' : 'border-transparent dark:border-transparent'}`}
          >
             <motion.div
               initial={shouldAnimate ? { x: -30, opacity: 0 } : false}
               animate={{ x: 0, opacity: 1 }}
               transition={shouldAnimate ? { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.12 } : { duration: 0 }}
               className="flex flex-col flex-1 h-full w-full overflow-hidden"
             >
                <SideNav 
                  isExpanded={isSidebarExpanded} 
                  toggleSidebar={() => setIsSidebarExpanded(!isSidebarExpanded)} 
                />
             </motion.div>
          </motion.div>
        )}

        {/* MAIN SCROLLABLE CONTENT */}
        <div id="main-scroll-container" className="flex-1 overflow-y-auto overflow-x-hidden w-full h-full bg-white dark:bg-[#13111C] scroll-smooth">
           <motion.div 
             initial={{ opacity: 0, y: 8 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.4, ease: "easeOut" }}
             className={`transition-all duration-300 ${isMobile && showBottomNav ? 'pb-24' : 'pb-10 pt-2'}`}
           >
              {children}
           </motion.div>
        </div>

      </div>

      {/* 4. MOBILE BOTTOM NAV */}

      {showBottomNav && (
        <motion.div 
          initial={shouldAnimate ? { y: 80, opacity: 0 } : false}
          animate={{ y: 0, opacity: 1 }}
          transition={shouldAnimate ? { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 } : { duration: 0 }}
          className="md:hidden fixed bottom-0 left-0 w-full z-40 bg-white/90 dark:bg-[#1C1A29]/95 backdrop-blur-lg border-t border-slate-100 dark:border-white/5 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.4)] pb-safe"
        >
           <BottomNav />
        </motion.div>
      )}

      {/* MOBILE SLIDE-OUT SIDEBAR */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-[100] flex">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="relative bg-white dark:bg-[#13111C] w-[260px] h-full shadow-2xl flex flex-col pt-[env(safe-area-inset-top)]"
            >
               <div className="p-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                 <div className="flex items-center gap-2">
                     <ApplicationLogo className="w-6 h-6" style={{ overflow: 'visible' }} />
                     <span className="font-['Lexend_Deca'] font-extrabold text-[18px] tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-800 dark:from-[#7B7BFF] dark:to-[#A78BFA]">Ba-Yu</span>
                 </div>
                 <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-slate-50 dark:bg-white/5 rounded-full text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
                   <X className="w-4 h-4" />
                 </button>
               </div>
               <div className="flex-1 overflow-y-auto">
                 <SideNav isExpanded={true} toggleSidebar={() => setIsMobileMenuOpen(false)} />
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}