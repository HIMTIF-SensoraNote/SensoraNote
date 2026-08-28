import { Link, useLocation } from 'react-router';
import { Button } from './ui/button';
import ApplicationLogo from './ApplicationLogo'; // Logo
import { useState, useEffect } from 'react';
import { AuthModal } from './auth-modal';
import { useAuth } from '../contexts/AuthContext';
import { AvatarImage } from './ui/DefaultImages';
import { useTranslation } from '../hooks/useTranslation';
import { motion } from 'motion/react';

interface NavbarProps {
  variant?: 'default' | 'dashboard';
  theme?: 'light' | 'dark';
  isLoading?: boolean;
}

export function Navbar({ variant = 'default', theme = 'light', isLoading = false }: NavbarProps) {
  const { isAuthenticated, user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [isScrolled, setIsScrolled] = useState(false);
  const { t } = useTranslation();
  const location = useLocation();

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    if (location.pathname === '/') {
      e.preventDefault();
      const element = document.getElementById(targetId);
      if (element) {
        if ((window as any).lenis) {
          (window as any).lenis.scrollTo(element, { offset: -40, duration: 1.2 });
        } else {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        window.history.pushState(null, '', `#${targetId}`);
      }
    }
  };

  const handleHomeClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (location.pathname === '/') {
      e.preventDefault();
      if ((window as any).lenis) {
        (window as any).lenis.scrollTo(0, { duration: 1.2 });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      window.history.pushState(null, '', '/');
    }
  };

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled((window.scrollY || document.documentElement?.scrollTop || 0) > 20);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (variant === 'dashboard') {
    return null; // Dashboard has its own top bar
  }

  const openAuthModal = (tab: 'login' | 'register') => {
    setAuthTab(tab);
    setShowAuthModal(true);
  };

  const getNavContainerClass = () => {
    if (isScrolled) {
      if (theme === 'dark') {
        return 'max-w-5xl bg-[#171424]/90 backdrop-blur-xl border-2 border-white/10 shadow-[4px_4px_0px_rgba(0,0,0,0.6)] rounded-2xl h-[56px] md:h-[64px] px-4 sm:px-8';
      }
      return 'max-w-5xl bg-[#FFFDF7]/95 backdrop-blur-xl border-2 border-[#4A2E1B]/30 shadow-[4px_4px_0px_#4A2E1B] rounded-2xl h-[56px] md:h-[64px] px-4 sm:px-8';
    }
    return 'max-w-7xl bg-transparent border-transparent h-16 md:h-24 px-4 sm:px-10';
  };

  const getLinkClass = () => {
    if (theme === 'dark') {
      return 'text-gray-300 hover:text-amber-400 transition-colors font-mono font-bold text-xs uppercase tracking-wider hover:-translate-y-0.5 transform duration-200';
    }
    return 'text-[#593118] hover:text-blue-600 transition-colors font-mono font-bold text-xs uppercase tracking-wider hover:-translate-y-0.5 transform duration-200';
  };

  return (
    <>
      {/* Floating Navbar Wrapper */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={!isLoading ? { y: 0, opacity: 1 } : { y: -80, opacity: 0 }}
        transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        style={{ transition: 'top 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), padding 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
        className={`fixed left-0 right-0 z-50 flex justify-center transition-all duration-300 ${isScrolled ? 'top-3 px-3 sm:top-4 sm:px-5 lg:px-8' : 'top-0 px-0'
          }`}
      >
        {/* Dynamic Inner Container */}
        <div
          style={{ transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
          className={`w-full flex items-center justify-between relative overflow-hidden ${getNavContainerClass()}`}
        >
          {/* Top Washi Tape Accent when scrolled */}
          {isScrolled && (
            <div className="absolute -top-1.5 left-12 w-12 h-3.5 bg-[#E8DCC4] dark:bg-[#2D2640] border-x border-[#C5B39B] dark:border-amber-400/30 rotate-[-2deg] pointer-events-none z-20" />
          )}

          {/* Brand Logo */}
          <Link to="/" onClick={handleHomeClick} className="flex items-center gap-3 group outline-none focus:outline-none [-webkit-tap-highlight-color:transparent]">
            <ApplicationLogo
              style={{ transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
              className={`group-hover:scale-105 transition-transform drop-shadow-xs ${isScrolled ? 'w-7 h-7' : 'w-8 h-8 md:w-9 md:h-9'}`}
            />
            <span 
              style={{ transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)' }} 
              className={`font-display font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-[#3D2314]'} ${isScrolled ? 'text-base sm:text-lg' : 'text-xl md:text-2xl'}`}
            >
              SensoraNote
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8 lg:gap-10">
            <Link to="/" onClick={handleHomeClick} className={getLinkClass()}>
              {t("navbar.home") || "Beranda"}
            </Link>
            <a 
              href="/#visi-misi" 
              onClick={(e) => handleNavClick(e, 'visi-misi')} 
              className={getLinkClass()}
            >
              {t("navbar.about") || "Tentang"}
            </a>
            <a 
              href="/#eksplorasi-topik" 
              onClick={(e) => handleNavClick(e, 'eksplorasi-topik')} 
              className={getLinkClass()}
            >
              {t("navbar.explore") || "Jelajahi"}
            </a>
          </div>

          {/* Auth Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isAuthenticated && user ? (
              <Link to="/profile" className="group rounded-full p-1 border border-transparent hover:border-gray-200 transition-colors">
                <AvatarImage
                  src={user.avatar}
                  alt={user.name}
                  size={isScrolled ? 32 : 40}
                  className={`shadow-xs group-hover:ring-2 group-hover:ring-blue-600/20 transition-all`}
                />
              </Link>
            ) : (
              <>
                <button
                  className={`hidden md:block font-mono font-extrabold text-xs uppercase px-4 py-2 rounded-xl transition-all ${
                    theme === 'dark'
                      ? 'text-gray-300 hover:text-white hover:bg-white/10'
                      : 'text-[#593118] hover:text-blue-600 hover:bg-[#FAF6EE] border border-transparent hover:border-[#4A2E1B]/20'
                  }`}
                  onClick={() => openAuthModal('login')}
                >
                  {t("navbar.login") || "Masuk"}
                </button>
                <button
                  className={`cursor-pointer font-mono font-extrabold text-xs uppercase rounded-xl transition-all flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white border-2 border-blue-400/40 shadow-[3px_3px_0px_#1e3a8a] active:translate-y-0.5 ${
                    isScrolled 
                      ? 'px-4 py-1.5' 
                      : 'px-5 py-2.5'
                  }`}
                  onClick={() => openAuthModal('register')}
                >
                  {t("navbar.register_free") || "Daftar Gratis"}
                </button>
              </>
            )}
          </div>
        </div>
      </motion.nav>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultTab={authTab}
      />
    </>
  );
}