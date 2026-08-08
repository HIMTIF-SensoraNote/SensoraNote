import React, { useEffect, useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useLocation, useNavigate } from 'react-router';
import { CheckCircle2, XCircle, Smartphone, LogIn } from 'lucide-react';
import ApplicationLogo from '../../components/ApplicationLogo';

const VerifyResultPage: React.FC = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const [isMobile, setIsMobile] = useState(false);

    // Determine if it's success or failure based on the path
    const isSuccess = location.pathname.includes('verify-success');
    
    // Set up deep link URL
    const appUrl = `bayumobile://${isSuccess ? 'verify-success' : 'verify-failed'}`;

    useEffect(() => {
        // Detect mobile device
        const mobileCheck = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        setIsMobile(mobileCheck);

        if (mobileCheck) {
            // Attempt auto redirect to mobile app
            window.location.href = appUrl;
        }
    }, [appUrl]);

    return (
        <div className="min-h-screen flex flex-col justify-center px-6 py-12 bg-white dark:bg-[#13111C] relative overflow-hidden">
            {/* Background Glows */}
            <div className={`absolute top-1/4 -left-32 h-96 w-96 rounded-full ${isSuccess ? 'bg-green-500/10' : 'bg-red-500/10'} blur-[100px] pointer-events-none`} />
            <div className={`absolute bottom-1/4 -right-32 h-96 w-96 rounded-full ${isSuccess ? 'bg-emerald-500/10' : 'bg-rose-500/10'} blur-[100px] pointer-events-none`} />

            <div className="w-full max-w-md mx-auto relative z-10">
                <div className="text-center mb-10">
                    <div className="flex justify-center mb-6">
                        <ApplicationLogo className="w-16 h-16 drop-shadow-md" />
                    </div>

                    <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 animate-in zoom-in ${isSuccess ? 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400' : 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400'}`}>
                        {isSuccess ? (
                            <CheckCircle2 className="w-10 h-10" />
                        ) : (
                            <XCircle className="w-10 h-10" />
                        )}
                    </div>

                    <h1 className="font-['Lexend_Deca'] text-[28px] sm:text-3xl font-extrabold text-gray-900 dark:text-gray-100 mb-4 leading-tight tracking-tight">
                        {isSuccess 
                            ? (t('verify_email_result.success_title') || 'Verifikasi Berhasil!') 
                            : (t('verify_email_result.failed_title') || 'Verifikasi Gagal')}
                    </h1>
                    
                    <p className="text-[15px] text-gray-500 dark:text-gray-400 font-['Manrope'] leading-relaxed max-w-sm mx-auto mb-8">
                        {isSuccess 
                            ? (t('verify_email_result.success_desc') || 'Email Anda telah berhasil diverifikasi. Anda sekarang dapat menikmati semua fitur aplikasi.')
                            : (t('verify_email_result.failed_desc') || 'Tautan verifikasi tidak valid atau telah kedaluwarsa. Silakan minta tautan baru.')}
                    </p>

                    <div className="space-y-4">
                        {isMobile && (
                            <a
                                href={appUrl}
                                className={`w-full py-4 rounded-xl font-['Lexend_Deca'] font-bold text-[15px] flex items-center justify-center gap-2 transition-all ${
                                    isSuccess 
                                        ? 'bg-green-100 hover:bg-green-200 text-green-700 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50' 
                                        : 'bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50'
                                }`}
                            >
                                <Smartphone className="w-5 h-5" />
                                <span>{t('verify_email_result.open_app') || 'Buka Aplikasi Ba-Yu Mobile'}</span>
                            </a>
                        )}

                        <button
                            onClick={() => navigate('/login')}
                            className="w-full bg-primary hover:bg-indigo-700 text-white py-4 rounded-xl font-['Lexend_Deca'] font-bold text-[15px] shadow-lg shadow-indigo-600/20 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                        >
                            <LogIn className="w-5 h-5" />
                            <span>{t('verify_email_result.go_to_login') || 'Ke Halaman Login'}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyResultPage;
