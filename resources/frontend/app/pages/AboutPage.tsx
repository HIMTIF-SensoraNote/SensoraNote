import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { ArrowLeft, Users, Target } from 'lucide-react';
import { useNavigate } from 'react-router';
import { MobileLayout } from '../components/MobileLayout';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../contexts/AuthContext';

export default function AboutPage() {
    const { t } = useTranslation();
    useDocumentTitle(t('titles.about_us'));
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
                        {t("about_page.title") || "Tentang Kami"}
                    </h1>
                    <div className="w-10"></div>
                </div>

                <div className="max-w-xl mx-auto px-5">
                    {/* Hero Section */}
                    <div className="text-center mb-10 mt-6">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-indigo-50 dark:bg-indigo-500/10 mb-6 border border-indigo-100 dark:border-indigo-500/20">
                            <Users className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h2 className="font-['Lexend_Deca'] font-extrabold text-2xl text-gray-900 dark:text-gray-100 mb-3">
                            {t("about_page.hero_title") || "Mengenal Ba-Yu"}
                        </h2>
                        <p className="font-['Manrope'] text-[15px] leading-relaxed text-gray-500 dark:text-gray-400">
                            {t("about_page.hero_desc") || "Mengenal lebih dekat perjalanan, misi, dan tim di balik Ba-Yu Platform."}
                        </p>
                    </div>

                    <div className="space-y-6 mb-10">
                        {/* Visi & Misi */}
                        <div className="bg-white dark:bg-[#1C1A29] rounded-3xl p-6 border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-none">
                            <h3 className="font-['Lexend_Deca'] font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                                <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                {t("about_page.vision_title") || "Visi & Misi"}
                            </h3>
                            <p className="font-['Manrope'] text-[14px] text-gray-600 dark:text-gray-400 leading-relaxed">
                                {t("about_page.vision_desc") || "Kami percaya bahwa setiap pelajar berhak mendapatkan akses yang sama terhadap materi berkualitas. Ba-Yu dibangun untuk memfasilitasi pertukaran catatan secara adil, aman, dan mudah diakses oleh pelajar di seluruh Indonesia."}
                            </p>
                        </div>

                        {/* Komunitas */}
                        <div className="bg-white dark:bg-[#1C1A29] rounded-3xl p-6 border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-none">
                            <h3 className="font-['Lexend_Deca'] font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                                <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                {t("about_page.community_title") || "Komunitas Kami"}
                            </h3>
                            <p className="font-['Manrope'] text-[14px] text-gray-600 dark:text-gray-400 leading-relaxed">
                                {t("about_page.community_desc") || "Ribuan pelajar dan pakar dari berbagai institusi pendidikan telah bergabung. Dengan sistem verifikasi dan pelaporan yang ketat, kami menjaga ekosistem ini agar tetap positif dan membangun."}
                            </p>
                        </div>
                    </div>
                    
                    <div className="text-center pb-8 pt-4">
                        <p className="font-['Manrope'] text-[13px] text-gray-400 dark:text-gray-500" dangerouslySetInnerHTML={{ __html: t("about_page.footer") || '&copy; 2026 Ba-Yu Platform.<br/>Semua Hak Dilindungi.' }} />
                    </div>
                </div>
            </div>
        </MobileLayout>
    );
}
