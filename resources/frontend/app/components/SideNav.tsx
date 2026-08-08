import { useState, useEffect } from 'react';
import { Home, Search, Bookmark, User, LayoutDashboard, ChevronLeft, Hash, Star, FileText, Settings, Plus, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { useTranslation } from '../hooks/useTranslation';

interface SideNavProps {
  isExpanded: boolean;
  toggleSidebar: () => void;
}

export function SideNav({ isExpanded, toggleSidebar }: SideNavProps) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  
  const isActive = (path: string) => location.pathname === path;

  const [pakarChoiceNotes, setPakarChoiceNotes] = useState<any[]>([]);

  useEffect(() => {
    const fetchTopNotes = async () => {
      try {
        const token = localStorage.getItem('bayu-token') || sessionStorage.getItem('bayu-token');
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        
        const res = await axios.get('/api/v1/posts/pakar-choice?limit=3', { headers });
        setPakarChoiceNotes(res.data.data || []);
      } catch (error) {
        console.error('Failed to load pakar choice notes', error);
      }
    };
    fetchTopNotes();
  }, []);

  const mainNavItems = [
    { path: '/home', icon: Home, label: t('nav.home') },
    { path: '/explore', icon: Search, label: t('nav.explore') },
    { path: '/upload', icon: Plus, label: t('nav.upload') },
    { path: '/profile?tab=bookmarks', icon: Bookmark, label: t('nav.bookmarks') },
    { path: '/profile', icon: User, label: t('nav.profile') },
  ];

  return (
    <aside className="w-60 h-full flex flex-col bg-transparent overflow-hidden whitespace-nowrap">
      
      {/* Main Links */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pt-4 pb-6 scrollbar-hide">
         
         <div className="px-3 space-y-1">
            {mainNavItems.map((item) => {
              const isProfileBase = item.path === '/profile' && location.pathname === '/profile' && !location.search;
              const isBookmarksTab = item.path === '/profile?tab=bookmarks' && location.pathname === '/profile' && location.search.includes('tab=bookmarks');
              const active = item.path === '/profile' ? isProfileBase : (item.path === '/profile?tab=bookmarks' ? isBookmarksTab : isActive(item.path));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-[7px] rounded-[8px] transition-all duration-200 w-full group ${
                    active 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-gray-200 active:bg-gray-200/60 dark:active:bg-white/10'
                  }`}
                >
                  <item.icon className={`shrink-0 transition-all duration-200 ${active ? 'w-[18px] h-[18px] text-primary scale-105' : 'w-[18px] h-[18px] text-gray-700 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200'}`} strokeWidth={active ? 2.5 : 2} />
                  <span className={`font-['Manrope'] text-[14px] truncate mt-[1px] ${active ? 'font-bold' : 'font-medium'}`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
         </div>

         {/* Stats / Dashboard Section */}
         <div className="mt-8 mb-2 px-6 text-[11px] font-['Lexend_Deca'] font-black text-gray-600 dark:text-gray-500 tracking-wider">
            {user?.role === 'admin' || user?.role === 'pakar' ? t('nav.dashboard') : t('nav.insights')}
         </div>
         <div className="px-3 space-y-1">
            {(user?.role === 'admin' || user?.role === 'pakar') && (
                <Link
                  to={user?.role === 'admin' ? '/admin' : '/pakar'}
                  className={`flex items-center gap-3 px-3 py-[7px] rounded-[8px] transition-all duration-200 w-full group ${
                    isActive(user?.role === 'admin' ? '/admin' : '/pakar') ? 'bg-primary/10 text-primary' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <LayoutDashboard className={`shrink-0 transition-all duration-200 ${isActive(user?.role === 'admin' ? '/admin' : '/pakar') ? 'w-[18px] h-[18px] text-primary scale-105' : 'w-[18px] h-[18px] text-gray-700 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200'}`} strokeWidth={isActive(user?.role === 'admin' ? '/admin' : '/pakar') ? 2.5 : 2} />
                  <span className={`font-['Manrope'] text-[14px] truncate mt-[1px] ${isActive(user?.role === 'admin' ? '/admin' : '/pakar') ? 'font-bold' : 'font-medium'}`}>
                    {t('nav.workspace')}
                  </span>
                </Link>
            )}

            <Link
              to="/stats"
              className={`flex items-center gap-3 px-3 py-[7px] rounded-[8px] transition-all duration-200 w-full group ${
                isActive('/stats') ? 'bg-primary/10 text-primary' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <Hash className={`shrink-0 transition-all duration-200 ${isActive('/stats') ? 'w-[18px] h-[18px] text-primary scale-105' : 'w-[18px] h-[18px] text-gray-700 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200'}`} strokeWidth={isActive('/stats') ? 2.5 : 2} />
              <span className={`font-['Manrope'] text-[14px] truncate mt-[1px] ${isActive('/stats') ? 'font-bold' : 'font-medium'}`}>
                {t('nav.statistics')}
              </span>
            </Link>
         </div>

         {/* Curated / Pakar Choice */}
         <div className="mt-8 mb-2 px-6 flex items-center gap-1.5 selection-none">
            <span className="text-[11px] font-['Lexend_Deca'] font-black text-gray-600 dark:text-gray-500 tracking-wider">{t('nav.pakar_choice')}</span>
            <Star className="w-[10px] h-[10px] text-amber-500 fill-amber-500 mb-[1px]" />
         </div>
          {pakarChoiceNotes.length > 0 ? (
            <div className="px-3 space-y-1">
               {pakarChoiceNotes.map((note) => (
                 <Link
                   key={note.id || note._id}
                   to={`/note/${note.id || note._id}`}
                   className="flex items-start gap-3 px-3 py-[7px] rounded-[8px] transition-all duration-200 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-gray-200 group w-full"
                 >
                   <div className="mt-[2.5px]">
                     <FileText className="w-[16px] h-[16px] text-gray-500 dark:text-gray-500 group-hover:text-amber-500 transition-colors shrink-0" strokeWidth={2.5} />
                   </div>
                   <span className="font-['Manrope'] text-[14px] font-medium truncate overflow-hidden text-ellipsis w-full leading-tight">
                     {note.title}
                   </span>
                 </Link>
               ))}
            </div>
          ) : (
            <div className="px-5 py-2 text-[12px] font-['Manrope'] text-gray-600 dark:text-gray-500 font-bold">{t('nav.no_pakar_choice')}</div>
          )}
      </div>

      {/* Bottom Actions */}
      <div className="mt-auto border-t border-slate-100 dark:border-white/5 p-3 flex flex-col gap-1">
         <Link
           to="/settings"
           className={`flex items-center gap-3 px-3 py-[9px] rounded-xl transition-all duration-200 w-full group ${
             isActive('/settings') ? 'bg-primary/10 text-primary shadow-sm shadow-primary/5' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-gray-200'
           }`}
         >
           <Settings className={`shrink-0 transition-all duration-200 ${isActive('/settings') ? 'w-[20px] h-[20px] text-primary scale-105' : 'w-[20px] h-[20px] text-gray-700 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200'}`} strokeWidth={isActive('/settings') ? 2.5 : 2} />
           <span className={`font-['Manrope'] text-[14px] truncate mt-[1px] ${isActive('/settings') ? 'font-bold' : 'font-medium'}`}>
             {t('nav.settings')}
           </span>
         </Link>

         {/* Mobile Logout Button */}
         <button
           onClick={() => { logout(); }}
           className="md:hidden flex items-center gap-3 px-3 py-[9px] rounded-xl transition-all duration-200 w-full group text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-left"
         >
           <LogOut className="w-[20px] h-[20px] shrink-0" strokeWidth={2} />
           <span className="font-['Manrope'] text-[14px] truncate mt-[1px] font-medium">
             {t('topnav.logout')}
           </span>
         </button>
      </div>

    </aside>
  );
}
