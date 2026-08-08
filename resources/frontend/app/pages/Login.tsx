import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router";
import { Mail, Lock, User, GraduationCap, Eye, EyeOff, Sparkles, CheckCircle, X, ArrowLeft, ChevronDown } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import axios from "axios";
import { CustomSelect } from "../components/ui/CustomSelect";
import { useTranslation } from "../hooks/useTranslation";
import { motion, AnimatePresence } from "motion/react";
import ApplicationLogo from "../components/ApplicationLogo";

export default function Login() {
    const { t, language } = useTranslation();
    useDocumentTitle(t('titles.login'));
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "pelajar",
        jenjang: "SMA",
        profesi: "Pelajar",
    });
    const [rememberMe, setRememberMe] = useState(false);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { login, register, socialLogin, exchangeAndLogin } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { showToast } = useToast();


    // Forgot Password States
    const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
    const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
    const [isForgotLoading, setIsForgotLoading] = useState(false);

    // Handle OAuth callback token/code from URL
    useEffect(() => {
        const handleOAuth = async () => {
            const code = searchParams.get('code');
            const token = searchParams.get('token'); // backward compat
            const error = searchParams.get('error');
            const isNew = searchParams.get('new');

            if (error) {
                const msg = error === 'banned'
                    ? 'Akun Anda telah diblokir oleh Admin.'
                    : 'Login dengan sosial media gagal. Silakan coba lagi.';
                showToast(msg, 'error');
                navigate('/login', { replace: true });
                return;
            }

            if (code) {
                setIsSubmitting(true);
                const err = await exchangeAndLogin(code);
                if (err) {
                    showToast(err, 'error');
                    navigate('/login', { replace: true });
                    return;
                }
                navigate(isNew === 'true' ? '/complete-profile' : '/home', { replace: true });
                return;
            }

            if (token) {
                setIsSubmitting(true);
                await socialLogin(token);
                if (isNew === 'true') {
                    navigate('/complete-profile', { replace: true });
                } else {
                    navigate('/home', { replace: true });
                }
            }
        };
        handleOAuth();
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (isLogin) {
                const errorMessage = await login(
                    formData.email,
                    formData.password,
                    rememberMe
                );

                if (errorMessage) {
                    showToast(errorMessage, "error");
                    return;
                }

                // Redirect based on role/email
                const email = formData.email.toLowerCase();
                if (email === "admin@gmail.com") {
                    navigate("/admin");
                } else if (email === "pakar@gmail.com") {
                    navigate("/pakar");
                } else {
                    navigate("/home");
                }
            } else {
                // Generate a temporary unique username based on the name
                const tempUsername = formData.name.toLowerCase().replace(/[^a-z0-9]/g, '') + Math.floor(Math.random() * 10000);
                
                const errorMessage = await register(
                    formData.name,
                    tempUsername,
                    formData.email,
                    formData.password,
                    formData.jenjang,
                    formData.profesi
                );

                if (errorMessage) {
                    showToast(errorMessage, "error");
                    return;
                }

                navigate("/home");
            }
        } catch (err) {
            showToast("Terjadi kesalahan koneksi. Silakan coba lagi.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!forgotPasswordEmail) return;

        setIsForgotLoading(true);
        try {
            await axios.post("/api/forgot-password", {
                email: forgotPasswordEmail,
                lang: language || 'id',
            });

            showToast(t('forgot_password.success_toast') || 'Link reset password telah dikirim ke email Anda!', 'success');
            setIsForgotPasswordOpen(false);
            setForgotPasswordEmail("");
        } catch (error: any) {
            const errorMsg = error.response?.data?.message;
            showToast(errorMsg ? t(errorMsg) : 'Terjadi kesalahan. Pastikan email terdaftar.', 'error');
        } finally {
            setIsForgotLoading(false);
        }
    };

    if (searchParams.get('token') || searchParams.get('code')) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-[#13111C]">
                <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                <p className="text-slate-500 dark:text-slate-400 font-medium font-['Manrope'] animate-pulse">
                    {t('auth.processing_auth') === 'auth.processing_auth' ? "Memproses otentikasi..." : t('auth.processing_auth')}
                </p>
            </div>
        );
    }

    const renderVisual = () => (
        <>
            <div className="absolute inset-0 bg-gradient-to-br from-[#4338CA] via-[#5D5CE6] to-[#8B5CF6] opacity-90"></div>
            <div className="absolute -top-1/4 -right-1/4 w-[500px] h-[500px] bg-[#FFD166]/20 rounded-full blur-[100px] mix-blend-screen pointer-events-none"></div>
            <div className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] bg-[#FF6B6B]/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none"></div>
            <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-white/10 rounded-full blur-[80px] mix-blend-overlay pointer-events-none"></div>

            <div className="relative z-10 px-12 lg:px-16 xl:px-20 max-w-[600px] text-left">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={isLogin ? 'login-text' : 'register-text'}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4 }}
                    >
                        <div className="mb-8">
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl shadow-black/10">
                                <ApplicationLogo className="w-9 h-9 drop-shadow-sm" />
                            </div>
                        </div>
                        <h2 className="text-[36px] xl:text-[44px] font-extrabold text-white mb-6 font-['Lexend_Deca'] leading-[1.1] drop-shadow-md">
                            {isLogin 
                                ? (t('auth.panel_title_login') === 'auth.panel_title_login' ? "Senang Melihatmu Kembali." : t('auth.panel_title_login')) 
                                : (t('auth.panel_title_register') === 'auth.panel_title_register' ? "Mulai Perjalanan Barumu." : t('auth.panel_title_register'))}
                        </h2>
                        <p className="text-[17px] xl:text-[19px] text-white/80 font-['Manrope'] font-medium drop-shadow-sm leading-relaxed max-w-md">
                            {isLogin
                                ? (t('auth.panel_desc_login') === 'auth.panel_desc_login' ? "Masuk untuk melanjutkan petualangan belajarmu bersama Ba-Yu dan bagikan wawasanmu." : t('auth.panel_desc_login'))
                                : (t('auth.panel_desc_register') === 'auth.panel_desc_register' ? "Bergabunglah dengan ribuan pelajar dan pakar untuk berbagi, belajar, dan tumbuh bersama." : t('auth.panel_desc_register'))}
                        </p>
                    </motion.div>
                </AnimatePresence>
            </div>
        </>
    );

    const renderForm = () => (
        <div className="w-full max-w-md mx-auto py-8">
            {/* Title */}
            <div className="text-center mb-10">
                <h1 className="font-['Lexend_Deca'] text-[28px] sm:text-3xl font-extrabold text-gray-900 dark:text-gray-100 mb-2 leading-tight tracking-tight">
                    {isLogin ? (t('auth.welcome') === 'auth.welcome' ? "Selamat Datang" : t('auth.welcome')) : (t('auth.start_journey') === 'auth.start_journey' ? "Mulai Perjalananmu" : t('auth.start_journey'))}
                </h1>
                <p className="font-['Manrope'] text-[15px] text-gray-500 font-medium">
                    {isLogin 
                        ? (t('auth.welcome_desc') === 'auth.welcome_desc' ? "Masuk untuk melanjutkan ke Ba-Yu." : t('auth.welcome_desc')) 
                        : (t('auth.start_journey_desc') === 'auth.start_journey_desc' ? "Daftar dan bagikan catatan pertamamu." : t('auth.start_journey_desc'))}
                </p>
            </div>

            {/* Tab Switcher */}
            <div className="flex bg-gray-50/80 dark:bg-[#1C1A29]/80 p-1.5 mb-8 rounded-2xl border border-gray-100/50 dark:border-white/5 backdrop-blur-sm relative z-20">
                <button
                    onClick={() => setIsLogin(true)}
                    type="button"
                    className={`flex-1 py-2.5 rounded-xl font-['Lexend_Deca'] text-[14px] font-bold transition-all duration-300 outline-none ${
                        isLogin
                            ? "bg-white dark:bg-[#252336] text-gray-900 dark:text-gray-100 shadow-sm border border-gray-200/50 dark:border-white/10"
                            : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                    {t('auth.login_tab') === 'auth.login_tab' ? "Masuk" : t('auth.login_tab')}
                </button>
                <button
                    onClick={() => setIsLogin(false)}
                    type="button"
                    className={`flex-1 py-2.5 rounded-xl font-['Lexend_Deca'] text-[14px] font-bold transition-all duration-300 outline-none ${
                        !isLogin
                            ? "bg-white dark:bg-[#252336] text-gray-900 dark:text-gray-100 shadow-sm border border-gray-200/50 dark:border-white/10"
                            : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                    {t('auth.register_tab') === 'auth.register_tab' ? "Daftar Baru" : t('auth.register_tab')}
                </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 w-full max-w-md mx-auto relative z-20">
                <AnimatePresence mode="wait">
                    <motion.div 
                        key={isLogin ? 'login-form' : 'register-form'}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4"
                    >
                        {!isLogin && (
                            <div className="space-y-1.5">
                                <label className="block text-[13px] font-['Lexend_Deca'] font-bold text-slate-700 dark:text-slate-300 pl-1">{t('auth.full_name') === 'auth.full_name' ? "Nama Lengkap" : t('auth.full_name')}</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-500 dark:text-slate-400 group-focus-within:text-gray-900 dark:group-focus-within:text-gray-100 transition-colors" strokeWidth={2.5} />
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full pl-11 pr-4 py-3.5 bg-input-background dark:bg-input-background border border-border rounded-2xl font-['Manrope'] text-[15px] text-foreground transition-all placeholder:text-muted-foreground"
                                        placeholder={t('auth.placeholder_name') === 'auth.placeholder_name' ? "John Doe" : t('auth.placeholder_name')}
                                        required={!isLogin}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="block text-[13px] font-['Lexend_Deca'] font-bold text-slate-700 dark:text-slate-300 pl-1">{t('auth.email_label') === 'auth.email_label' ? "Email" : t('auth.email_label')}</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-500 dark:text-slate-400 group-focus-within:text-gray-900 dark:group-focus-within:text-gray-100 transition-colors" strokeWidth={2.5} />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-[#1C1A29] border border-gray-200 dark:border-white/10 rounded-2xl font-['Manrope'] text-[15px] text-gray-900 dark:text-gray-100 transition-all focus:bg-white dark:focus:bg-[#252336] focus:outline-none focus:ring-4 focus:ring-gray-100 dark:focus:ring-white/10 focus:border-gray-900 dark:focus:border-white/20 placeholder:text-gray-400"
                                    placeholder={t('auth.placeholder_email') === 'auth.placeholder_email' ? "nama@email.com" : t('auth.placeholder_email')}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-[13px] font-['Lexend_Deca'] font-bold text-slate-700 dark:text-slate-300 pl-1">{t('auth.password_label') === 'auth.password_label' ? "Password" : t('auth.password_label')}</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-500 dark:text-slate-400 group-focus-within:text-gray-900 dark:group-focus-within:text-gray-100 transition-colors" strokeWidth={2.5} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full pl-11 pr-12 py-3.5 bg-gray-50 dark:bg-[#1C1A29] border border-gray-200 dark:border-white/10 rounded-2xl font-['Manrope'] text-[15px] text-gray-900 dark:text-gray-100 transition-all focus:bg-white dark:focus:bg-[#252336] focus:outline-none focus:ring-4 focus:ring-gray-100 dark:focus:ring-white/10 focus:border-gray-900 dark:focus:border-white/20 placeholder:text-gray-400"
                                    placeholder={t('auth.placeholder_password') === 'auth.placeholder_password' ? "••••••••" : t('auth.placeholder_password')}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none p-1 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-[18px] h-[18px]" strokeWidth={2.5} /> : <Eye className="w-[18px] h-[18px]" strokeWidth={2.5} />}
                                </button>
                            </div>
                        </div>

                        {!isLogin && (
                            <>
                                <div className="space-y-1.5 relative z-30">
                                    <label className="block text-[13px] font-['Lexend_Deca'] font-bold text-slate-700 dark:text-slate-300 pl-1">{t('auth.profession') === 'auth.profession' ? "Profesi / Peran" : t('auth.profession')}</label>
                                    <CustomSelect
                                        value={formData.profesi}
                                        onChange={(val) => setFormData({ ...formData, profesi: val as string })}
                                        icon={<User className="w-[18px] h-[18px]" strokeWidth={2.5} />}
                                        buttonClassName="bg-gray-50 dark:bg-[#1C1A29] py-3.5 pl-11 pr-4 rounded-2xl w-full text-[14px]"
                                        options={[
                                            { value: "Pelajar", label: t('auth.prof_student') === 'auth.prof_student' ? "Pelajar" : t('auth.prof_student') },
                                            { value: "Mahasiswa", label: t('auth.prof_college_student') === 'auth.prof_college_student' ? "Mahasiswa" : t('auth.prof_college_student') },
                                            { value: "Pengajar", label: t('auth.prof_teacher') === 'auth.prof_teacher' ? "Pengajar (Guru/Dosen)" : t('auth.prof_teacher') },
                                            { value: "Umum", label: t('auth.prof_general') === 'auth.prof_general' ? "Umum / Profesional" : t('auth.prof_general') },
                                        ]}
                                    />
                                </div>
                                <div className="space-y-1.5 relative z-20">
                                    <label className="block text-[13px] font-['Lexend_Deca'] font-bold text-slate-700 dark:text-slate-300 pl-1">{t('auth.education_level') === 'auth.education_level' ? "Jenjang Pendidikan" : t('auth.education_level')}</label>
                                    <CustomSelect
                                        value={formData.jenjang}
                                        onChange={(val) => setFormData({ ...formData, jenjang: val as string })}
                                        icon={<GraduationCap className="w-[18px] h-[18px]" strokeWidth={2.5} />}
                                        buttonClassName="bg-gray-50 dark:bg-[#1C1A29] py-3.5 pl-11 pr-4 rounded-2xl w-full text-[14px]"
                                        options={[
                                            { value: "SD", label: t('auth.edu_sd') === 'auth.edu_sd' ? "Sekolah Dasar (SD)" : t('auth.edu_sd') },
                                            { value: "SMP", label: t('auth.edu_smp') === 'auth.edu_smp' ? "Menengah Pertama (SMP)" : t('auth.edu_smp') },
                                            { value: "SMA", label: t('auth.edu_sma') === 'auth.edu_sma' ? "Menengah Atas (SMA/SMK)" : t('auth.edu_sma') },
                                            { value: "Kuliah", label: t('auth.edu_college') === 'auth.edu_college' ? "Perguruan Tinggi (Kuliah)" : t('auth.edu_college') },
                                        ]}
                                    />
                                </div>
                            </>
                        )}
                    </motion.div>
                </AnimatePresence>

                {isLogin && (
                    <div className="flex items-center justify-between mt-5 mb-6">
                        <label className="flex items-center cursor-pointer group">
                            <div className="relative flex items-center justify-center">
                                <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="peer sr-only" />
                                <div className="w-5 h-5 border-2 border-muted-foreground/40 dark:border-white/20 rounded-md peer-checked:bg-primary peer-checked:border-primary transition-colors flex items-center justify-center">
                                    <CheckCircle className={`w-3 h-3 text-white transition-transform duration-200 ${rememberMe ? 'scale-100' : 'scale-0'}`} strokeWidth={4} />
                                </div>
                            </div>
                            <span className="ml-2.5 text-[14px] text-gray-600 dark:text-gray-400 font-['Manrope'] font-medium group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors">
                                {t('auth.remember_me') === 'auth.remember_me' ? "Ingat saya" : t('auth.remember_me')}
                            </span>
                        </label>

                        <button
                            type="button"
                            onClick={() => {
                                setForgotPasswordEmail(formData.email);
                                setIsForgotPasswordOpen(true);
                            }}
                            className="text-[13px] text-primary font-['Lexend_Deca'] font-bold hover:underline underline-offset-4"
                        >
                            {t('forgot_password.modal_title') === 'forgot_password.modal_title' ? "Lupa Password?" : t('forgot_password.modal_title')}
                        </button>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full bg-primary hover:bg-primary/90 active:bg-primary/80 text-primary-foreground py-4 rounded-full font-['Lexend_Deca'] font-bold text-[15px] shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all active:scale-[0.98] mt-8 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                    {isSubmitting ? (
                        <div className="flex items-center justify-center gap-2">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>{t('auth.processing') === 'auth.processing' ? "Memproses..." : t('auth.processing')}</span>
                        </div>
                    ) : (
                        isLogin ? (t('auth.login_btn') === 'auth.login_btn' ? "Masuk ke Akun" : t('auth.login_btn')) : (t('auth.register_btn') === 'auth.register_btn' ? "Daftar Sekarang" : t('auth.register_btn'))
                    )}
                </button>

                {/* Social Login Separator */}
                <div className="relative mt-8 mb-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-200 dark:border-white/5"></div>
                    </div>
                    <div className="relative flex justify-center text-[13px]">
                        <span className="px-4 bg-white dark:bg-[#13111C] text-slate-500 dark:text-slate-400 font-['Lexend_Deca'] font-semibold">
                            {t('auth.or_continue') === 'auth.or_continue' ? "atau lanjutkan dengan" : t('auth.or_continue')}
                        </span>
                    </div>
                </div>

                {/* Social Buttons */}
                <div className="grid grid-cols-1 gap-3.5">
                    <button
                        type="button"
                        onClick={() => { window.location.href = '/api/auth/google/redirect'; }}
                        className="flex items-center justify-center gap-2.5 py-3.5 bg-white dark:bg-[#1C1A29] border border-gray-200 dark:border-white/10 rounded-2xl font-['Lexend_Deca'] font-bold text-[14px] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 hover:border-gray-300 dark:hover:border-white/20 transition-all active:scale-95 w-full"
                    >
                        <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                        {t('auth.continue_with_google') === 'auth.continue_with_google' ? "Lanjutkan dengan Google" : t('auth.continue_with_google')}
                    </button>
                </div>
            </form>
        </div>
    );

    return (
        <div className="min-h-screen h-screen w-full bg-white dark:bg-[#13111C] relative overflow-hidden flex">
            {/* Close / Back Button */}
            <Link to="/" className="absolute top-6 left-6 p-2.5 rounded-full bg-slate-100/80 dark:bg-white/5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-all hover:bg-slate-200 dark:hover:bg-white/10 z-50 shadow-sm">
                <ArrowLeft className="w-5 h-5" />
            </Link>

            {/* Desktop View (Sliding Panels) */}
            <div className="hidden lg:block w-full flex-1 relative z-10">
                <motion.div
                    initial={false}
                    animate={{ x: isLogin ? "0%" : "100%" }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="absolute inset-y-0 left-0 w-1/2 flex flex-col px-12 xl:px-24 bg-white dark:bg-[#13111C] z-20 overflow-y-auto scrollbar-hide"
                >
                    <div className="m-auto w-full py-12">
                        {renderForm()}
                    </div>
                </motion.div>

                <motion.div
                    initial={false}
                    animate={{ x: isLogin ? "0%" : "-100%" }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="absolute top-0 right-0 w-1/2 h-full bg-[#1C1A29] flex items-center justify-center overflow-hidden border-l border-white/5 z-10"
                >
                    {renderVisual()}
                </motion.div>
            </div>

            {/* Mobile View (Stacked) */}
            <div className="flex lg:hidden w-full flex-col justify-center px-6 sm:px-12 py-12 relative z-10 overflow-y-auto scrollbar-hide">
                {/* Background Decorations for mobile */}
                <div className="absolute top-[-10%] right-[-10%] w-72 h-72 bg-indigo-50 dark:bg-indigo-500/10 rounded-full blur-3xl -z-10 opacity-70"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-purple-50 dark:bg-fuchsia-500/10 rounded-full blur-3xl -z-10 opacity-70"></div>
                
                {renderForm()}
            </div>

            {/* Forgot Password Modal */}
            {isForgotPasswordOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-[#1C1A29] rounded-2xl w-full max-w-sm p-6 shadow-xl border border-gray-100 dark:border-white/5 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold font-['Lexend_Deca'] text-gray-900 dark:text-white">{t('forgot_password.modal_title')}</h3>
                            <button 
                                onClick={() => setIsForgotPasswordOpen(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 bg-gray-50 hover:bg-gray-100 dark:bg-white/5 dark:hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-['Manrope'] mb-6">
                            {t('forgot_password.modal_description')}
                        </p>
                        <form onSubmit={handleForgotPasswordSubmit}>
                            <div className="space-y-1.5 mb-6">
                                <label className="block text-[13px] font-['Lexend_Deca'] font-bold text-slate-700 dark:text-slate-300 pl-1">
                                    {t('forgot_password.email_label')}
                                </label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-500 dark:text-slate-400 group-focus-within:text-gray-900 dark:group-focus-within:text-gray-100 transition-colors" strokeWidth={2.5} />
                                    <input
                                        type="email"
                                        value={forgotPasswordEmail}
                                        onChange={(e) => setForgotPasswordEmail(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-[#13111C] border border-gray-200 dark:border-white/10 rounded-xl font-['Manrope'] text-[14px] text-gray-900 dark:text-gray-100 transition-all focus:bg-white dark:focus:bg-[#252336] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
                                        placeholder={t('forgot_password.email_placeholder')}
                                        required
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={isForgotLoading}
                                className={`w-full bg-primary hover:bg-indigo-700 text-white py-3 rounded-xl font-['Lexend_Deca'] font-bold text-[14px] shadow-lg shadow-indigo-600/20 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 ${isForgotLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {isForgotLoading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>{t('forgot_password.submit_loading')}</span>
                                    </>
                                ) : (
                                    <span>{t('forgot_password.submit_button')}</span>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}