import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { ArrowLeft, Briefcase, Mail } from 'lucide-react';
import { useNavigate } from 'react-router';
import { MobileLayout } from '../components/MobileLayout';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../contexts/AuthContext';

export default function CareersPage() {
    const { t } = useTranslation();
    useDocumentTitle(t('titles.careers'));
    const navigate = useNavigate();

    const { user } = useAuth();

    return (
        <MobileLayout showBottomNav={false} hideMobileTopNav={true} hideTopNav={!user} hideSidebar={!user}>
            <div className="min-h-screen pb-10 bg-[#FAFAFA] dark:bg-[#13111C]">
                {/* Header */}
                <div className="sticky top-0 bg-[#FAFAFA]/95 dark:bg-[#13111C]/95 backdrop-blur-md z-20 px-5 pt-8 pb-4 flex items-center justify-between border-b border-gray-100 dark:border-white/5 mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 flex items-center justify-center bg-white dark:bg-[#1C1A29] border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 rounded-full transition-colors shadow-sm dark:shadow-none"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    </button>
                    <h1 className="text-gray-900 dark:text-gray-100 font-['Lexend_Deca'] font-bold text-lg">
                        {t("careers_page.title") || "Karir"}
                    </h1>
                    <div className="w-10"></div>
                </div>

                <div className="max-w-xl mx-auto px-5">
                    {/* Hero Section */}
                    <div className="text-center mb-10 mt-6">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-50 dark:bg-amber-500/10 mb-6 border border-amber-100 dark:border-amber-500/20">
                            <Briefcase className="w-10 h-10 text-amber-600 dark:text-amber-400" />
                        </div>
                        <h2 className="font-['Lexend_Deca'] font-extrabold text-2xl text-gray-900 dark:text-gray-100 mb-3">
                            {t("careers_page.hero_title") || "Berkarir di Ba-Yu"}
                        </h2>
                        <p className="font-['Manrope'] text-[15px] leading-relaxed text-gray-500 dark:text-gray-400">
                            {t("careers_page.hero_desc") || "Bergabung bersama kami membangun ekosistem edukasi masa depan."}
                        </p>
                    </div>

                    <div className="space-y-6 mb-10">
                        {/* No Vacancies */}
                        <div className="bg-white dark:bg-[#1C1A29] rounded-3xl p-8 border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-none text-center">
                            <h3 className="font-['Lexend_Deca'] font-bold text-gray-900 dark:text-gray-100 mb-3">
                                {t("careers_page.no_vacancies_title") || "Belum Ada Lowongan"}
                            </h3>
                            <p className="font-['Manrope'] text-[14px] text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                                {t("careers_page.no_vacancies_desc") || "Saat ini kami belum membuka posisi baru, namun kami selalu tertarik dengan talenta berbakat."}
                            </p>
                            <a href="mailto:careers@ba-yu.id" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-full transition-colors shadow-sm text-[14px]">
                                <Mail className="w-4 h-4" /> {t("careers_page.contact_btn") || "Hubungi Kami"}
                            </a>
                        </div>
                    </div>
                    
                    <div className="text-center pb-8 pt-4">
                        <p className="font-['Manrope'] text-[13px] text-gray-400 dark:text-gray-500" dangerouslySetInnerHTML={{ __html: t("careers_page.footer") || '&copy; 2026 Ba-Yu Platform.<br/>Semua Hak Dilindungi.' }} />
                    </div>
                </div>
            </div>
        </MobileLayout>
    );
}
