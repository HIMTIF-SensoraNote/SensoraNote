import { useTranslation } from '../hooks/useTranslation';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { Settings, ChevronLeft, Apple, PlaySquare } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import ApplicationLogo from '../components/ApplicationLogo';

export default function DownloadAppPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    useDocumentTitle(t('download_app.title'));

    return (
        <div className="min-h-screen bg-white dark:bg-[#13111C] flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-primary/5 blur-[100px]" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-indigo-500/5 blur-[100px]" />
            </div>

            <button 
                onClick={() => navigate(-1)}
                className="absolute top-8 left-8 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-gray-500 dark:text-gray-400 z-20"
                title="Kembali"
            >
                <ChevronLeft className="w-6 h-6" />
            </button>

            <div className="relative z-10 flex flex-col items-center max-w-lg mx-auto text-center animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 mb-8 bg-white dark:bg-[#1C1A29] rounded-[32px] shadow-2xl shadow-indigo-500/10 border border-gray-100 dark:border-white/10 flex items-center justify-center relative">
                    <ApplicationLogo className="w-14 h-14" />
                    <div className="absolute -bottom-2 -right-2 bg-amber-500 text-white text-[11px] font-black tracking-wider px-2.5 py-0.5 rounded-full border-2 border-white dark:border-[#1C1A29] shadow-sm">
                        DEV
                    </div>
                </div>

                <h1 className="text-3xl md:text-4xl font-['Lexend_Deca'] font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
                    {t('download_app.title')}
                </h1>
                
                <p className="text-gray-600 dark:text-gray-400 font-['Manrope'] mb-10 text-[15px] md:text-base leading-relaxed max-w-md">
                    {t('download_app.subtitle')}
                </p>

                <div className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-3xl p-8 mb-10 flex flex-col items-center shadow-inner">
                    <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mb-5 relative">
                        <Settings className="w-7 h-7 animate-spin" style={{ animationDuration: '3s' }} />
                        <div className="absolute top-0 right-0 w-3 h-3 bg-indigo-400 rounded-full animate-ping" />
                    </div>
                    <h3 className="font-['Lexend_Deca'] font-bold text-gray-900 dark:text-white text-lg mb-6">
                        {t('download_app.status')}
                    </h3>
                    
                    <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                        {/* Mock App Store Button */}
                        <div className="h-12 px-5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl flex items-center justify-center gap-2.5 opacity-60 cursor-not-allowed">
                            <Apple className="w-5 h-5 text-gray-800 dark:text-white" fill="currentColor" />
                            <div className="flex flex-col items-start text-gray-800 dark:text-white">
                                <span className="text-[9px] font-['Manrope'] font-medium leading-none mb-0.5 uppercase tracking-wider">Tersedia segera</span>
                                <span className="text-[14px] font-['Lexend_Deca'] font-bold leading-none">App Store</span>
                            </div>
                        </div>
                        
                        {/* Mock Google Play Button */}
                        <div className="h-12 px-5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl flex items-center justify-center gap-2.5 opacity-60 cursor-not-allowed">
                            <PlaySquare className="w-5 h-5 text-gray-800 dark:text-white" fill="currentColor" />
                            <div className="flex flex-col items-start text-gray-800 dark:text-white">
                                <span className="text-[9px] font-['Manrope'] font-medium leading-none mb-0.5 uppercase tracking-wider">Tersedia segera</span>
                                <span className="text-[14px] font-['Lexend_Deca'] font-bold leading-none">Google Play</span>
                            </div>
                        </div>
                    </div>
                </div>

                <Link 
                    to="/home"
                    className="h-[52px] px-8 bg-primary hover:bg-indigo-700 text-white rounded-full flex items-center justify-center font-['Lexend_Deca'] font-bold transition-all shadow-[0_4px_16px_rgba(93,92,230,0.3)] hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(93,92,230,0.4)]"
                >
                    {t('download_app.back_to_home')}
                </Link>
            </div>
        </div>
    );
}
