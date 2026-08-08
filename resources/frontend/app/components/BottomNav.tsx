import { Home, Search, Plus, BarChart2, User, LayoutGrid } from 'lucide-react';
import { Link, useLocation } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../hooks/useTranslation';

export function BottomNav() {
  const location = useLocation();
  const { user } = useAuth();
  const { t } = useTranslation();
  
  const isActive = (path: string) => {
    if (path === '/home' && (location.pathname === '/' || location.pathname === '/home')) return true;
    return location.pathname.startsWith(path);
  };

  const renderNavItems = () => {
    const isPakar = user?.role === 'pakar';
    const isAdmin = user?.role === 'admin';

    // Role-based navigation config
    const items = [
      { path: '/home', icon: Home, label: t('nav.home') },
      { path: '/explore', icon: Search, label: t('nav.explore_short') },
      { path: '/upload', icon: Plus, label: t('nav.upload_short'), isSpecial: true },
      isAdmin 
          ? { path: '/admin', icon: LayoutGrid, label: t('nav.workspace') }
          : isPakar
            ? { path: '/pakar', icon: LayoutGrid, label: t('nav.workspace') }
            : { path: '/stats', icon: BarChart2, label: t('nav.statistics') },
      { path: '/profile', icon: User, label: t('nav.profile_short') },
    ].filter(Boolean) as any[];

    return items.map((item, idx) => {
      const active = isActive(item.path);

      if (item.isSpecial) {
        return (
          <Link
            key={item.path}
            to={item.path}
            className="flex flex-col items-center justify-center flex-1 transition-all duration-300 outline-none -mt-5 relative group px-0.5"
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-[16px] bg-indigo-600 dark:bg-primary text-white shadow-[0_4px_14px_rgba(79,70,229,0.35)] dark:shadow-[0_4px_14px_rgba(123,123,255,0.25)] transform group-hover:scale-110 active:scale-95 transition-all duration-300 ring-[5px] ring-white dark:ring-[#1C1A29]">
               <item.icon className="w-5.5 h-5.5 transition-transform duration-500 ease-out group-hover:rotate-90" strokeWidth={2.5} />
            </div>
            <span className="text-[10px] mt-1.5 font-['Manrope'] font-bold tracking-wide text-indigo-600 dark:text-primary opacity-100 text-center w-full block transition-all duration-300 group-hover:-translate-y-0.5">
              {item.label}
            </span>
          </Link>
        );
      }

      // Standard Nav Item
      return (
        <Link
          key={item.path}
          to={item.path}
          className={`flex flex-col items-center justify-center flex-1 transition-all duration-300 outline-none px-0.5 ${
            active ? 'text-indigo-600 dark:text-primary' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <div className={`relative flex items-center justify-center w-12 h-8 rounded-xl transition-all duration-300 ${active ? 'bg-indigo-50/80 dark:bg-primary/10 animate-in fade-in zoom-in-95 duration-200' : 'bg-transparent'}`}>
             <item.icon className={`w-[22px] h-[22px] transition-all duration-300 ${active ? 'scale-110' : 'scale-100'}`} strokeWidth={active ? 2.5 : 2} />
          </div>
          <span className={`text-[10px] mt-1 font-['Manrope'] font-bold tracking-wide text-center w-full block truncate px-1 transition-all duration-300 ${active ? 'opacity-100 scale-100' : 'opacity-70 scale-95'}`}>
            {item.label}
          </span>
        </Link>
      );
    });
  };

  return (
    <div className="w-full h-full bg-transparent">
      <div className="max-w-[430px] mx-auto">
        <div className="flex items-center justify-around h-[70px] px-2 relative pt-1">
          {renderNavItems()}
        </div>
      </div>
    </div>
  );
}