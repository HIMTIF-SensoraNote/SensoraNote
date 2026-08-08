import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { ArrowLeft, Users, MessageCircle, Heart, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router';
import { MobileLayout } from '../components/MobileLayout';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../contexts/AuthContext';

export default function CommunityGuidelinesPage() {
    const { t } = useTranslation();
    useDocumentTitle(t('titles.community_guidelines'));
    const navigate = useNavigate();

    const { user } = useAuth();

    const values = [
        {
            icon: MessageCircle,
            color: 'text-indigo-500',
            title: t("community_guidelines.values.0.title") || 'Saling Menghargai',
            desc: t("community_guidelines.values.0.desc") || 'Berkomunikasi dengan sopan, baik saat memberi komentar maupun memberikan kritik membangun.'
        },
        {
            icon: Heart,
            color: 'text-pink-500',
            title: t("community_guidelines.values.1.title") || 'Edukasi & Positif',
            desc: t("community_guidelines.values.1.desc") || 'Fokus pada penyebaran ilmu pengetahuan dan dukung teman-teman pelajar lainnya.'
        }
    ];

    const rules = [
        t("community_guidelines.rules.0") || 'Mengunggah catatan hasil plagiasi.',
        t("community_guidelines.rules.1") || 'Ujaran kebencian, diskriminasi, atau SARA.',
        t("community_guidelines.rules.2") || 'Spam, promosi ilegal, atau penipuan.',
        t("community_guidelines.rules.3") || 'Membagikan informasi pribadi orang lain (doxxing).'
    ];

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
                        {t("community_guidelines.title") || "Panduan Komunitas"}
                    </h1>
                    <div className="w-10"></div>
                </div>

                <div className="max-w-xl mx-auto px-5">
                    {/* Hero Section */}
                    <div className="text-center mb-10 mt-6">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-pink-50 dark:bg-pink-500/10 mb-6 border border-pink-100 dark:border-pink-500/20">
                            <Heart className="w-10 h-10 text-pink-600 dark:text-pink-400" />
                        </div>
                        <h2 className="font-['Lexend_Deca'] font-extrabold text-2xl text-gray-900 dark:text-gray-100 mb-3">
                            {t("community_guidelines.hero_title") || "Panduan Komunitas"}
                        </h2>
                        <p className="font-['Manrope'] text-[15px] leading-relaxed text-gray-500 dark:text-gray-400">
                            {t("community_guidelines.hero_desc") || "Mari ciptakan lingkungan belajar yang aman, positif, dan saling mendukung di Ba-Yu."}
                        </p>
                    </div>

                    <div className="space-y-6 mb-10">
                        {/* Values */}
                        <div className="bg-white dark:bg-[#1C1A29] rounded-3xl p-6 border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-none">
                            <h3 className="font-['Lexend_Deca'] font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                                <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                {t("community_guidelines.values_title") || "Nilai Utama"}
                            </h3>
                            <div className="space-y-4">
                                {values.map((v, i) => (
                                    <div key={i} className="flex gap-3 items-start p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                                        <div className="w-8 h-8 rounded-full bg-white dark:bg-[#1C1A29] flex items-center justify-center shrink-0 border border-slate-100 dark:border-white/10">
                                            <v.icon className={`w-4 h-4 ${v.color}`} />
                                        </div>
                                        <div>
                                            <h4 className="font-['Manrope'] font-bold text-[14px] text-gray-900 dark:text-gray-100">{v.title}</h4>
                                            <p className="font-['Manrope'] text-[13px] text-gray-500 dark:text-gray-400 mt-1">{v.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Rules */}
                        <div className="bg-white dark:bg-[#1C1A29] rounded-3xl p-6 border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-none">
                            <h3 className="font-['Lexend_Deca'] font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                                <ShieldAlert className="w-5 h-5 text-red-500" />
                                {t("community_guidelines.rules_title") || "Pelanggaran Berat"}
                            </h3>
                            <p className="font-['Manrope'] text-[14px] text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                                {t("community_guidelines.rules_desc") || "Tindakan berikut dapat mengakibatkan penghapusan akun atau penurunan pangkat:"}
                            </p>
                            <ul className="space-y-3">
                                {rules.map((rule, idx) => (
                                    <li key={idx} className="flex gap-3 items-center text-['Manrope'] text-[13px] text-gray-600 dark:text-gray-300">
                                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
                                        {rule}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    
                    <div className="text-center pb-8 pt-4">
                        <p className="font-['Manrope'] text-[13px] text-gray-400 dark:text-gray-500" dangerouslySetInnerHTML={{ __html: t("community_guidelines.footer") || '&copy; 2026 Ba-Yu Platform.<br/>Semua Hak Dilindungi.' }} />
                    </div>
                </div>
            </div>
        </MobileLayout>
    );
}
