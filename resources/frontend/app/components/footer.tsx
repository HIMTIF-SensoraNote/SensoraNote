import { Link } from 'react-router';
import { Github, Twitter, Instagram } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { useState } from 'react';
import { AuthModal } from './auth-modal';
import ApplicationLogo from './ApplicationLogo';

export function Footer() {
  const { t } = useTranslation();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');

  const handleAuthClick = (e: React.MouseEvent, tab: 'login' | 'register') => {
    e.preventDefault();
    setAuthTab(tab);
    setShowAuthModal(true);
  };

  return (
    <footer className="bg-[#06050e] border-t border-white/5 mt-32 relative overflow-hidden">
      {/* Premium dark mode glow accents - unconditionally visible */}
      <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-[#1d4ed8]/10 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute -top-24 -left-24 w-80 h-80 bg-[#2563eb]/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-4 group">
              <ApplicationLogo size={40} className="group-hover:scale-105" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent transition-all duration-300">
                SensoraNote
              </span>
            </Link>
            <p className="text-gray-400 mb-6">
              {t("footer.desc") || "Platform catatan belajar terstruktur untuk pelajar Indonesia"}
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#1d4ed8] hover:border-[#1d4ed8] transition-all duration-300 hover:scale-110"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#1d4ed8] hover:border-[#1d4ed8] transition-all duration-300 hover:scale-110"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#1d4ed8] hover:border-[#1d4ed8] transition-all duration-300 hover:scale-110"
              >
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold mb-4 text-white tracking-wide">{t("footer.product") || "Produk"}</h4>
            <ul className="space-y-3">
              <li>
                <button onClick={(e) => handleAuthClick(e, 'login')} className="text-gray-400 hover:text-[#2563eb] transition-all duration-200 hover:pl-1 flex items-center bg-transparent border-none p-0 cursor-pointer text-left">
                  {t("footer.explore_notes") || "Jelajahi Catatan"}
                </button>
              </li>
              <li>
                <button onClick={(e) => handleAuthClick(e, 'register')} className="text-gray-400 hover:text-[#2563eb] transition-all duration-200 hover:pl-1 flex items-center bg-transparent border-none p-0 cursor-pointer text-left">
                  {t("footer.dashboard") || "Dashboard"}
                </button>
              </li>
              <li>
                <button onClick={(e) => handleAuthClick(e, 'login')} className="text-gray-400 hover:text-[#2563eb] transition-all duration-200 hover:pl-1 flex items-center bg-transparent border-none p-0 cursor-pointer text-left">
                  {t("footer.features") || "Fitur"}
                </button>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-4 text-white tracking-wide">{t("footer.resources") || "Sumber Daya"}</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/guidelines" className="text-gray-400 hover:text-[#2563eb] transition-all duration-200 hover:pl-1 flex items-center">
                  {t("footer.guide") || "Panduan"}
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-400 hover:text-[#2563eb] transition-all duration-200 hover:pl-1 flex items-center">
                  {t("footer.blog") || "Blog"}
                </Link>
              </li>
              <li>
                <Link to="/settings/help" className="text-gray-400 hover:text-[#2563eb] transition-all duration-200 hover:pl-1 flex items-center">
                  {t("footer.help") || "Bantuan"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4 text-white tracking-wide">{t("footer.company") || "Perusahaan"}</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="text-gray-400 hover:text-[#2563eb] transition-all duration-200 hover:pl-1 flex items-center">
                  {t("footer.about_us") || "Tentang Kami"}
                </Link>
              </li>
              <li>
                <Link to="/careers" className="text-gray-400 hover:text-[#2563eb] transition-all duration-200 hover:pl-1 flex items-center">
                  {t("footer.careers") || "Karir"}
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-[#2563eb] transition-all duration-200 hover:pl-1 flex items-center">
                  {t("footer.contact") || "Kontak"}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            © 2026 SensoraNote (SensoraNote). All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <Link to="/privacy" className="text-gray-400 hover:text-[#2563eb] transition-colors duration-200">
              {t("footer.privacy") || "Kebijakan Privasi"}
            </Link>
            <Link to="/terms" className="text-gray-400 hover:text-[#2563eb] transition-colors duration-200">
              {t("footer.terms") || "Syarat & Ketentuan"}
            </Link>
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultTab={authTab}
      />
    </footer>
  );
}
