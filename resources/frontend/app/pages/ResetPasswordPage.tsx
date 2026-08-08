import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../contexts/ToastContext';
import { useNavigate } from 'react-router';
import ApplicationLogo from '../components/ApplicationLogo';
import { Lock, ArrowRight, CheckCircle2, X, Smartphone } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

export default function ResetPasswordPage() {
    const { t } = useTranslation();
    useDocumentTitle(t('titles.reset_password'));
    const pathname = window.location.pathname;
    const token = pathname.substring(pathname.lastIndexOf('/') + 1); 

    const searchParams = new URLSearchParams(window.location.search);
    const email = searchParams.get('email'); 

    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const { showToast } = useToast();
    const navigate = useNavigate();

    // Deep link URL
    const appUrl = `bayumobile://reset-password/${token}/${email}`;

    useEffect(() => {
        // Simple mobile detection
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        
        if (isMobile) {
            // Attempt to redirect to the app automatically
            window.location.href = appUrl;
        }
    }, [appUrl]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post('/api/reset-password', {
                token: token,
                email: email,
                password: password,
                password_confirmation: passwordConfirmation
            });

            setIsSuccess(true);
            setTimeout(() => {
                navigate('/login', { replace: true });
            }, 2000);
            
        } catch (error: any) {
            const errData = error.response?.data;
            const errorMsg = errData?.message || "";
            let translatedError = errorMsg;
            
            // Extract Laravel validation errors if present
            if (errData && typeof errData === "object" && !errData.message && errData[Object.keys(errData)[0]]) {
                const firstErrorKey = Object.keys(errData)[0];
                translatedError = t(errData[firstErrorKey][0]);
            } else if (errData?.errors && typeof errData.errors === "object") {
                const firstErrorKey = Object.keys(errData.errors)[0];
                translatedError = t(errData.errors[firstErrorKey][0]);
            } else if (errorMsg === "passwords.token" || errorMsg.includes("invalid") || errorMsg.includes("expired")) {
                translatedError = t("reset_password.error_token") || "Link reset tidak valid atau sudah kadaluarsa.";
            } else if (errorMsg === "passwords.user" || errorMsg.includes("not found")) {
                translatedError = t("reset_password.error_user") || "Pengguna dengan email ini tidak ditemukan.";
            } else if (!translatedError) {
                translatedError = t("reset_password.error_generic") || "Terjadi kesalahan saat mengatur ulang kata sandi.";
            }
            
            // If the key is not found in translation, t() returns the key itself, so we check and try to translate it directly if it's the raw message
            showToast(t(translatedError) !== translatedError ? t(translatedError) : translatedError, 'error');
        } finally {
            setLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-[#13111C]">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-4 animate-in zoom-in">
                    <CheckCircle2 className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold font-['Lexend_Deca'] text-gray-900 dark:text-white mb-2">{t('reset_password.success_title')}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-['Manrope']">{t('reset_password.success_message')}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col justify-center px-6 py-12 bg-white dark:bg-[#13111C] relative overflow-hidden">
                <button
                    onClick={() => navigate('/login')}
                    className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-full transition-all z-50"
                    aria-label="Tutup"
                >
                    <X className="w-5 h-5" />
                </button>
                <div className="w-full max-w-md mx-auto">
                    <div className="text-center mb-10">
                        <div className="flex justify-center mb-6">
                            <ApplicationLogo className="w-16 h-16 drop-shadow-md" />
                        </div>
                        <h1 className="font-['Lexend_Deca'] text-[28px] sm:text-3xl font-extrabold text-gray-900 dark:text-gray-100 mb-2 leading-tight tracking-tight">
                            {t('reset_password.title')}
                        </h1>
                        <p className="text-[15px] text-gray-500 dark:text-gray-400 font-['Manrope'] leading-relaxed max-w-sm mx-auto">
                            {t('reset_password.description_start')} <span className="font-semibold text-gray-800 dark:text-gray-200">{email}</span>.
                        </p>
                    </div>
                    
                    <a
                        href={appUrl}
                        className="md:hidden mb-6 w-full bg-indigo-100 hover:bg-indigo-200 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50 py-3 rounded-xl font-['Lexend_Deca'] font-bold text-[14px] flex items-center justify-center gap-2 transition-all"
                    >
                        <Smartphone className="w-5 h-5" />
                        <span>{t('reset_password.open_in_app') !== 'reset_password.open_in_app' ? t('reset_password.open_in_app') : 'Buka di Aplikasi Ba-Yu Mobile'}</span>
                    </a>

                    <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                        <div className="space-y-1.5">
                            <label className="block text-[13px] font-['Lexend_Deca'] font-bold text-slate-700 dark:text-slate-300 pl-1">
                                {t('reset_password.new_password_label')}
                            </label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-500 dark:text-slate-400 group-focus-within:text-gray-900 dark:group-focus-within:text-gray-100 transition-colors" strokeWidth={2.5} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-[#1C1A29] border border-gray-200 dark:border-white/10 rounded-2xl font-['Manrope'] text-[15px] text-gray-900 dark:text-gray-100 transition-all focus:bg-white dark:focus:bg-[#252336] focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-500/10 focus:border-indigo-500 placeholder:text-slate-500 dark:placeholder:text-slate-400"
                                    placeholder={t('reset_password.new_password_placeholder')}
                                    required
                                    minLength={8}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-[13px] font-['Lexend_Deca'] font-bold text-slate-700 dark:text-slate-300 pl-1">
                                {t('reset_password.confirm_password_label')}
                            </label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-500 dark:text-slate-400 group-focus-within:text-gray-900 dark:group-focus-within:text-gray-100 transition-colors" strokeWidth={2.5} />
                                <input
                                    type="password"
                                    value={passwordConfirmation}
                                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-[#1C1A29] border border-gray-200 dark:border-white/10 rounded-2xl font-['Manrope'] text-[15px] text-gray-900 dark:text-gray-100 transition-all focus:bg-white dark:focus:bg-[#252336] focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-500/10 focus:border-indigo-500 placeholder:text-slate-500 dark:placeholder:text-slate-400"
                                    placeholder={t('reset_password.confirm_password_placeholder')}
                                    required
                                    minLength={8}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full bg-primary hover:bg-indigo-700 text-white py-4 rounded-full font-['Lexend_Deca'] font-bold text-[15px] shadow-lg shadow-indigo-600/20 hover:shadow-xl hover:-translate-y-0.5 transition-all mt-8 flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>{t('reset_password.submit_loading')}</span>
                                </>
                            ) : (
                                <>
                                    <span>{t('reset_password.submit_button')}</span>
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>
            </div>
        </div>
    );
}