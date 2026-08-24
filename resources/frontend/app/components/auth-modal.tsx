import { useState, useEffect, useRef } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff, ArrowRight, GraduationCap, Loader2, Sparkles, CheckCircle, ChevronRight, ChevronDown, Check } from 'lucide-react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useTranslation } from '../hooks/useTranslation';
import ApplicationLogo from './ApplicationLogo';
import axios from 'axios';
import { motion, AnimatePresence } from 'motion/react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'register';
}

interface AuthModalSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  icon: React.ReactNode;
  inputClass: string;
}

function AuthModalSelect({ value, onChange, options, icon, inputClass }: AuthModalSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className={`relative ${isOpen ? 'z-50' : 'z-10'}`} ref={ref}>
      <div className="relative group">
        {icon}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`${inputClass} !pl-10 !text-[13px] font-bold text-left flex items-center justify-between cursor-pointer ${isOpen ? 'ring-4 ring-blue-500/20 dark:ring-[#1d4ed8]/20 border-blue-500/40 dark:border-[#1d4ed8]/40 bg-slate-50 dark:bg-[#0c0a1a]' : ''}`}
        >
          <span className="truncate">{selectedOption?.label || (t("auth_modal.select_placeholder") !== "auth_modal.select_placeholder" ? t("auth_modal.select_placeholder") : "Pilih...")}</span>
          <ChevronDown className="w-4 h-4 text-slate-400 transition-transform duration-300" />
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute z-50 w-full mt-2 bg-[#FFFDF7] dark:bg-[#171424] border-2 border-[#4A2E1B]/30 dark:border-white/20 shadow-[4px_4px_0px_#4A2E1B] dark:shadow-[4px_4px_0px_#2563eb] rounded-2xl overflow-hidden"
          >
            <div className="max-h-52 overflow-y-auto p-1.5 no-scrollbar space-y-0.5">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl font-mono text-xs font-bold transition-colors flex items-center justify-between ${
                    value === option.value 
                      ? 'bg-blue-50 dark:bg-blue-600/30 text-blue-700 dark:text-blue-300' 
                      : 'text-[#3D2314] dark:text-gray-100 hover:bg-[#FAF6EE] dark:hover:bg-[#100D1A]'
                  }`}
                >
                  {option.label}
                  {value === option.value && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


export function AuthModal({ isOpen, onClose, defaultTab = 'login' }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot'>(defaultTab);
  const [showPassword, setShowPassword] = useState(false);
  const { showToast } = useToast();
  const { t, language } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    jenjang: 'SMA',
    profesi: 'Pelajar',
  });
  
  const navigate = useNavigate();
  const { login, register } = useAuth();

  // Sync defaultTab 
  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('auth-modal-open');
    } else {
      document.body.classList.remove('auth-modal-open');
    }
    return () => document.body.classList.remove('auth-modal-open');
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'forgot') return; 

    setIsSubmitting(true);
    
    if (activeTab === 'login') {
      const error = await login(formData.email, formData.password, rememberMe);
      if (error) {
         showToast(error, "error");
         setIsSubmitting(false);
      } else {
         const email = formData.email.toLowerCase();
         if (email === "admin@gmail.com") {
             navigate("/admin");
         } else if (email === "pakar@gmail.com") {
             navigate("/pakar");
         } else {
             navigate("/home");
         }
         onClose();
      }
    } else if (activeTab === 'register') {
      const error = await register(formData.name, formData.username, formData.email, formData.password, formData.jenjang, formData.profesi);
      if (error) {
         showToast(error, "error");
         setIsSubmitting(false);
      } else {
         navigate("/home");
         onClose();
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleJenjangChange = (val: string) => {
    let newProfesi = formData.profesi;
    if (['SD', 'SMP', 'SMA'].includes(val)) newProfesi = 'Pelajar';
    else if (val === 'Kuliah') newProfesi = 'Mahasiswa';
    else if (val === 'Umum') newProfesi = 'Umum';
    
    setFormData(prev => ({ ...prev, jenjang: val, profesi: newProfesi }));
  };

  if (!isOpen) return null;

  // NOTEBOOK SCRIBBLE INPUT STYLING
  const inputClass = "w-full pl-12 pr-4 py-3.5 bg-[#FAF6EE] dark:bg-[#100D1A] border-2 border-[#4A2E1B]/20 dark:border-white/20 rounded-2xl font-mono text-sm text-[#3D2314] dark:text-white transition-all focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 focus:shadow-[3px_3px_0px_#2563eb] dark:focus:shadow-[3px_3px_0px_#2563eb] placeholder:text-[#8C7355] dark:placeholder:text-gray-400 font-medium";
  const labelClass = "block text-xs font-mono font-extrabold text-[#593118] dark:text-gray-100 pl-1 mb-1.5 uppercase tracking-wider";
  const iconClass = "absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#8C7355] dark:text-gray-300 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors duration-300";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop (Darker blur for focus) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#3D2314]/40 dark:bg-black/80 backdrop-blur-md z-50"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 sm:p-6" onClick={onClose}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#FFFDF7] dark:bg-[#171424] border-2 border-[#4A2E1B]/30 dark:border-white/15 rounded-3xl shadow-[8px_8px_0px_#4A2E1B] dark:shadow-[6px_6px_24px_rgba(37,99,235,0.25),6px_6px_0px_rgba(37,99,235,0.35)] w-full max-w-[480px] max-h-[90vh] flex flex-col relative overflow-hidden"
            >
              {/* Top Washi Tape Pin Accent */}
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-28 h-5 bg-[#E8DCC4] dark:bg-[#2D2640] border-x border-[#C5B39B] dark:border-blue-500/40 rotate-[-1deg] z-50 pointer-events-none" />

              {/* Corner Grid Paper Background */}
              <div 
                className="absolute inset-0 opacity-15 pointer-events-none"
                style={{
                  backgroundImage: 'radial-gradient(#C5B39B 1.5px, transparent 1.5px)',
                  backgroundSize: '18px 18px'
                }}
              />

              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-6 right-6 w-9 h-9 rounded-xl bg-[#FAF6EE] dark:bg-white/5 hover:bg-red-100 dark:hover:bg-red-500/20 flex items-center justify-center transition-all z-50 group border-2 border-[#4A2E1B]/20 dark:border-white/10 hover:border-red-300 shadow-[2px_2px_0px_#4A2E1B] dark:shadow-[2px_2px_0px_rgba(255,255,255,0.08)]"
              >
                <X className="w-4 h-4 text-[#593118] dark:text-gray-300 group-hover:rotate-90 group-hover:text-red-600 transition-all duration-300" strokeWidth={2.5} />
              </button>

              {/* Content Scrollable Area */}
              <div className="flex-1 overflow-y-auto no-scrollbar py-10 px-8 sm:px-12 relative z-10">
                <AnimatePresence mode="wait">
                  {activeTab !== 'forgot' ? (
                    <motion.div
                      key="login-register"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Logo & Header */}
                      <div className="mb-8">
                        <div className="inline-flex mb-4">
                          <ApplicationLogo className="w-10 h-10" />
                        </div>
                        <h2 className="font-display font-black text-2xl sm:text-3xl text-[#3D2314] dark:text-white mb-2 tracking-tight">
                          {activeTab === 'login' ? (t("auth_modal.welcome") !== "auth_modal.welcome" ? t("auth_modal.welcome") : 'Selamat Datang') : (t("auth_modal.create_account") !== "auth_modal.create_account" ? t("auth_modal.create_account") : 'Mulai Perjalananmu')}
                        </h2>
                        <p className="font-serif text-sm text-[#594429] dark:text-gray-300 leading-relaxed">
                          {activeTab === 'login' 
                            ? (t("auth_modal.login_desc") !== "auth_modal.login_desc" ? t("auth_modal.login_desc") : "Masuk untuk mengakses semua fitur cerdas SensoraNote.") 
                            : (t("auth_modal.register_desc") !== "auth_modal.register_desc" ? t("auth_modal.register_desc") : "Daftar sekarang dan nikmati ekosistem catatan modern.")}
                        </p>
                      </div>

                      {/* Notebook Tab Switcher */}
                      <div className="flex bg-[#FAF6EE] dark:bg-[#100D1A] p-1.5 rounded-2xl border-2 border-[#4A2E1B]/20 dark:border-white/10 mb-8 relative">
                        <button
                          onClick={() => setActiveTab('login')}
                          className={`flex-1 py-2.5 rounded-xl font-mono text-xs font-bold uppercase transition-colors z-10 ${
                            activeTab === 'login' ? "text-[#3D2314] dark:text-white" : "text-[#8C7355] dark:text-gray-400 hover:text-[#3D2314]"
                          }`}
                        >
                          {t("auth_modal.login") !== "auth_modal.login" ? t("auth_modal.login") : "Masuk"}
                        </button>
                        <button
                          onClick={() => setActiveTab('register')}
                          className={`flex-1 py-2.5 rounded-xl font-mono text-xs font-bold uppercase transition-colors z-10 ${
                            activeTab === 'register' ? "text-[#3D2314] dark:text-white" : "text-[#8C7355] dark:text-gray-400 hover:text-[#3D2314]"
                          }`}
                        >
                          {t("auth_modal.register") !== "auth_modal.register" ? t("auth_modal.register") : "Daftar Baru"}
                        </button>
                        {/* Tab Active Background indicator */}
                        <div 
                            className={`absolute top-1.5 bottom-1.5 w-[calc(50%-0.375rem)] bg-[#FFFDF7] dark:bg-[#171424] rounded-xl border-2 border-[#4A2E1B]/30 dark:border-white/20 shadow-[2px_2px_0px_#4A2E1B] dark:shadow-[2px_2px_0px_rgba(37,99,235,0.4)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${activeTab === 'login' ? 'left-1.5' : 'left-[calc(50%+0.375rem)]'}`}
                        />
                      </div>

                      <form onSubmit={handleSubmit} className="space-y-5">
                        {/* REGISTER FIELDS */}
                        <AnimatePresence>
                          {activeTab === 'register' && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0, overflow: 'hidden' }} 
                              animate={{ opacity: 1, height: 'auto', transitionEnd: { overflow: 'visible' } }} 
                              exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                              className="space-y-5 relative z-20"
                            >
                              <div className="space-y-1.5">
                                <label className={labelClass}>{t("auth_modal.fullname") !== "auth_modal.fullname" ? t("auth_modal.fullname") : "Nama Lengkap (Display Name)"}</label>
                                <div className="relative group">
                                  <User className={iconClass} strokeWidth={2.5} />
                                  <input
                                    type="text" name="name" value={formData.name} onChange={handleChange}
                                    placeholder={t("auth_modal.placeholder_name") !== "auth_modal.placeholder_name" ? t("auth_modal.placeholder_name") : "John Doe"} className={inputClass} required
                                  />
                                </div>
                              </div>
                              <div className="space-y-1.5">
                                <label className={labelClass}>{t("auth_modal.username") !== "auth_modal.username" ? t("auth_modal.username") : "Username"}</label>
                                <div className="relative group">
                                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 group-focus-within:text-[#2563eb] transition-colors">@</span>
                                  <input
                                    type="text" name="username" value={formData.username}
                                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') }))}
                                    placeholder={t("auth_modal.placeholder_username") !== "auth_modal.placeholder_username" ? t("auth_modal.placeholder_username") : "johndoe123"} className={inputClass} required
                                  />
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                  <label className={labelClass}>{t("auth_modal.role") !== "auth_modal.role" ? t("auth_modal.role") : "Profesi"}</label>
                                  <AuthModalSelect
                                    value={formData.profesi}
                                    onChange={(val) => setFormData(prev => ({ ...prev, profesi: val }))}
                                    icon={<User className={`${iconClass} !w-4 !h-4 z-10 pointer-events-none`} strokeWidth={2.5} />}
                                    inputClass={inputClass}
                                    options={[
                                      { value: "Pelajar", label: t("auth_modal.role_pelajar") !== "auth_modal.role_pelajar" ? t("auth_modal.role_pelajar") : "Pelajar" },
                                      { value: "Mahasiswa", label: t("auth_modal.role_mahasiswa") !== "auth_modal.role_mahasiswa" ? t("auth_modal.role_mahasiswa") : "Mahasiswa" },
                                      { value: "Pengajar", label: t("auth_modal.role_pengajar") !== "auth_modal.role_pengajar" ? t("auth_modal.role_pengajar") : "Pengajar" },
                                      { value: "Umum", label: t("auth_modal.role_umum") !== "auth_modal.role_umum" ? t("auth_modal.role_umum") : "Umum" }
                                    ]}
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <label className={labelClass}>{t("auth_modal.level") !== "auth_modal.level" ? t("auth_modal.level") : "Jenjang"}</label>
                                  <AuthModalSelect
                                    value={formData.jenjang}
                                    onChange={handleJenjangChange}
                                    icon={<GraduationCap className={`${iconClass} !w-4 !h-4 z-10 pointer-events-none`} strokeWidth={2.5} />}
                                    inputClass={inputClass}
                                    options={[
                                      { value: "SD", label: t('edu_levels.SD') !== 'edu_levels.SD' ? t('edu_levels.SD') : "SD" },
                                      { value: "SMP", label: t('edu_levels.SMP') !== 'edu_levels.SMP' ? t('edu_levels.SMP') : "SMP" },
                                      { value: "SMA", label: t('edu_levels.SMA') !== 'edu_levels.SMA' ? t('edu_levels.SMA') : "SMA/SMK" },
                                      { value: "Kuliah", label: t('edu_levels.Kuliah') !== 'edu_levels.Kuliah' ? t('edu_levels.Kuliah') : "Kuliah" },
                                      { value: "Umum", label: t('edu_levels.Umum') !== 'edu_levels.Umum' ? t('edu_levels.Umum') : "Umum" }
                                    ]}
                                  />
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* EMAIL & PASSWORD (ALWAYS PRESENT) */}
                        <div className="space-y-1.5">
                          <label className={labelClass}>{activeTab === 'login' ? (t("auth_modal.email_or_username") !== "auth_modal.email_or_username" ? t("auth_modal.email_or_username") : 'Email atau Username') : (t("auth_modal.email") !== "auth_modal.email" ? t("auth_modal.email") : 'Alamat Email')}</label>
                          <div className="relative group">
                            <Mail className={iconClass} strokeWidth={2.5} />
                            <input
                              type={activeTab === 'login' ? 'text' : 'email'}
                              name="email" value={formData.email} onChange={handleChange}
                              placeholder={activeTab === 'login' ? (t("auth_modal.placeholder_email_username") !== "auth_modal.placeholder_email_username" ? t("auth_modal.placeholder_email_username") : 'nama@email.com / username_anda') : (t("auth_modal.placeholder_email") !== "auth_modal.placeholder_email" ? t("auth_modal.placeholder_email") : 'nama@email.com')}
                              className={inputClass} required
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className={labelClass}>{t("auth_modal.password") !== "auth_modal.password" ? t("auth_modal.password") : "Password"}</label>
                          <div className="relative group">
                            <Lock className={iconClass} strokeWidth={2.5} />
                            <input
                              type={showPassword ? 'text' : 'password'}
                              name="password" value={formData.password} onChange={handleChange}
                              placeholder={t("auth_modal.placeholder_password") !== "auth_modal.placeholder_password" ? t("auth_modal.placeholder_password") : "••••••••"} className={`${inputClass} !pr-12`} required
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#2563eb] transition-colors focus:outline-none"
                            >
                              {showPassword ? <EyeOff className="w-[18px] h-[18px]" strokeWidth={2.5} /> : <Eye className="w-[18px] h-[18px]" strokeWidth={2.5} />}
                            </button>
                          </div>
                        </div>

                        {/* Login Extras (Remember Me & Forgot Pass) */}
                        {activeTab === 'login' && (
                          <div className="flex items-center justify-between pt-1">
                            <label className="flex items-center cursor-pointer group">
                              <div className="relative flex items-center justify-center">
                                <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="peer sr-only" />
                                <div className="w-5 h-5 border-2 border-white/10 rounded-md peer-checked:bg-gradient-to-tr peer-checked:from-[#1d4ed8] peer-checked:to-[#2563eb] peer-checked:border-transparent transition-colors flex items-center justify-center">
                                  <CheckCircle className={`w-3.5 h-3.5 text-white transition-transform duration-200 peer-checked:scale-100 ${rememberMe ? 'scale-100' : 'scale-0'}`} strokeWidth={3} />
                                </div>
                              </div>
                              <span className="ml-3 text-[14px] text-slate-500 dark:text-gray-400 font-medium group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                                {t("auth_modal.remember_me") !== "auth_modal.remember_me" ? t("auth_modal.remember_me") : "Ingat saya"}
                              </span>
                            </label>
                            <button 
                              type="button" onClick={() => setActiveTab('forgot')} 
                              className="text-[13px] text-[#2563eb] hover:text-[#5D5CF6] font-bold transition-colors"
                            >
                              {t("auth_modal.forgot_password") !== "auth_modal.forgot_password" ? t("auth_modal.forgot_password") : "Lupa Password?"}
                            </button>
                          </div>
                        )}

                        {/* Submit CTA */}
                        <div className="pt-4">
                          <button
                            type="submit" disabled={isSubmitting}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-2xl font-mono font-extrabold text-sm uppercase tracking-wider border-2 border-blue-400/40 shadow-[4px_4px_0px_#1e3a8a] active:translate-y-0.5 active:shadow-[2px_2px_0px_#1e3a8a] transition-all flex items-center justify-center gap-2 cursor-pointer"
                          >
                            {isSubmitting ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <>
                                {activeTab === 'login' ? (t("auth_modal.login_btn") !== "auth_modal.login_btn" ? t("auth_modal.login_btn") : 'Masuk') : (t("auth_modal.register_btn") !== "auth_modal.register_btn" ? t("auth_modal.register_btn") : 'Daftar')}
                                <ArrowRight className="w-4 h-4" />
                              </>
                            )}
                          </button>

                          {/* Social Login Separator */}
                          <div className="relative my-7">
                            <div className="absolute inset-0 flex items-center">
                              <div className="w-full border-t-2 border-dashed border-[#4A2E1B]/20 dark:border-white/15"></div>
                            </div>
                            <div className="relative flex justify-center text-xs font-mono">
                              <span className="px-3 bg-[#FFFDF7] dark:bg-[#171424] text-[#8C7355] dark:text-gray-200 font-extrabold uppercase tracking-wider">
                                {t("auth_modal.or_continue_with") !== "auth_modal.or_continue_with" ? t("auth_modal.or_continue_with") : "atau dengan"}
                              </span>
                            </div>
                          </div>

                          {/* Modern Notebook Social Buttons */}
                          <div className="grid grid-cols-1 gap-4">
                            <button
                              type="button" onClick={() => { window.location.href = '/api/auth/google/redirect'; }}
                              className="flex items-center justify-center gap-3 py-3.5 bg-[#FAF6EE] dark:bg-[#100D1A] border-2 border-[#4A2E1B]/20 dark:border-white/15 shadow-[3px_3px_0px_#4A2E1B] dark:shadow-[3px_3px_0px_rgba(37,99,235,0.4)] rounded-2xl hover:bg-white dark:hover:bg-[#181424] transition-all active:translate-y-0.5 group w-full cursor-pointer"
                            >
                              <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                              <span className="font-mono font-extrabold text-xs uppercase tracking-wider text-[#3D2314] dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {t("auth_modal.continue_with_google") !== "auth_modal.continue_with_google" ? t("auth_modal.continue_with_google") : "Lanjutkan dengan Google"}
                              </span>
                            </button>
                          </div>
                          
                          <div className="text-center text-xs text-[#8C7355] dark:text-gray-200 mt-6 leading-relaxed font-serif font-medium">
                            {t("auth_modal.terms_prefix") !== "auth_modal.terms_prefix" ? t("auth_modal.terms_prefix") : "Dengan melanjutkan, Anda menyetujui"}{' '}
                            <Link to="/terms" onClick={onClose} className="font-extrabold text-blue-600 dark:text-blue-400 hover:underline transition-colors font-mono">
                              {t("auth_modal.terms") !== "auth_modal.terms" ? t("auth_modal.terms") : "Syarat & Ketentuan"}
                            </Link>
                            {' '}{t("auth_modal.terms_and") !== "auth_modal.terms_and" ? t("auth_modal.terms_and") : "serta"}{' '}
                            <Link to="/privacy" onClick={onClose} className="font-extrabold text-blue-600 dark:text-blue-400 hover:underline transition-colors font-mono">
                              {t("auth_modal.privacy") !== "auth_modal.privacy" ? t("auth_modal.privacy") : "Kebijakan Privasi"}
                            </Link>
                          </div>
                        </div>
                      </form>
                    </motion.div>
                  ) : (
                    /* FORGOT PASSWORD VIEW */
                    <motion.div
                      key="forgot"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="py-4"
                    >
                      <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-50 dark:bg-[#0c0a1a] rounded-full mb-6 border border-slate-200 dark:border-white/5">
                          <Sparkles className="w-8 h-8 text-[#2563eb]" />
                        </div>
                        <h3 className="font-['Lexend_Deca'] text-3xl font-extrabold text-slate-900 dark:text-white mb-3">{t("auth_modal.forgot_password") !== "auth_modal.forgot_password" ? t("auth_modal.forgot_password") : "Lupa Password?"}</h3>
                        <p className="font-['Manrope'] text-[15px] text-slate-500 dark:text-gray-400 font-medium leading-relaxed max-w-sm mx-auto">
                          {t("auth_modal.forgot_desc") !== "auth_modal.forgot_desc" ? t("auth_modal.forgot_desc") : "Jangan khawatir. Masukkan email terdaftar Anda untuk menerima tautan reset."}
                        </p>
                      </div>
                      
                      <div className="space-y-6">
                        <div className="space-y-1.5">
                          <label className={labelClass}>{t("auth_modal.email") !== "auth_modal.email" ? t("auth_modal.email") : "Alamat Email"}</label>
                          <div className="relative">
                            <Mail className={iconClass} strokeWidth={2.5} />
                            <input
                              type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              className={inputClass} placeholder="nama@email.com" required
                            />
                          </div>
                        </div>

                        <button
                          type="button" disabled={isSubmitting}
                          onClick={async () => {
                            if (!formData.email) { showToast(t("auth_modal.email_required") !== "auth_modal.email_required" ? t("auth_modal.email_required") : "Isi email terlebih dahulu!", "error"); return; }
                            setIsSubmitting(true);
                            try {
                              const response = await axios.post('/api/forgot-password', { email: formData.email, lang: language || 'id' });
                              if (response.status === 200) {
                                showToast(t("forgot_password.reset_sent") !== "forgot_password.reset_sent" ? t("forgot_password.reset_sent") : "Link reset password telah dikirim ke email Anda.", "success");
                                setActiveTab('login');
                              }
                            } catch (error: any) {
                              const errorMsg = error.response?.data?.message;
                              showToast(errorMsg ? t(errorMsg) : "Koneksi gagal", "error");
                            } finally {
                              setIsSubmitting(false);
                            }
                          }}
                          className="w-full bg-gradient-to-r from-[#1d4ed8] to-[#2563eb] text-white hover:opacity-90 py-4 rounded-2xl font-['Lexend_Deca'] font-extrabold text-[15px] shadow-[0_4px_20px_-2px_rgba(93,92,230,0.3)] hover:shadow-2xl transition-all active:scale-[0.98]"
                        >
                          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (t("auth_modal.send_reset_link") !== "auth_modal.send_reset_link" ? t("auth_modal.send_reset_link") : "Kirim Tautan Reset")}
                        </button>

                        <div className="text-center pt-2">
                          <button
                            type="button" onClick={() => setActiveTab('login')}
                            className="text-[14px] font-bold text-gray-400 hover:text-[#2563eb] transition-colors font-['Lexend_Deca']"
                          >
                            {t("auth_modal.back_to_login") !== "auth_modal.back_to_login" ? t("auth_modal.back_to_login") : "Kembali ke Login"}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}