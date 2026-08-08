import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { ArrowLeft, ShieldCheck, UserCheck, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router';
import { MobileLayout } from '../components/MobileLayout';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../contexts/AuthContext';

export default function TermsPage() {
    const { t } = useTranslation();
    useDocumentTitle(t('titles.terms_of_service'));
    const navigate = useNavigate();

    const { user } = useAuth();

    const section2Items = [
        t("terms_page.section2_items.0") || 'Menjaga kerahasiaan kata sandi akun Anda.',
        t("terms_page.section2_items.1") || 'Segala aktivitas yang terjadi di bawah akun Anda.',
        t("terms_page.section2_items.2") || 'Memberikan informasi yang benar dan akurat.'
    ];

    const allowedItems = [
        t("terms_page.allowed_items.0") || 'Berbagi materi pelajaran asli.',
        t("terms_page.allowed_items.1") || 'Memberikan komentar positif.',
        t("terms_page.allowed_items.2") || 'Mengunduh untuk referensi pribadi.'
    ];

    const prohibitedItems = [
        t("terms_page.prohibited_items.0") || 'Mengunggah konten plagiat.',
        t("terms_page.prohibited_items.1") || 'Menyebarkan ujaran kebencian.',
        t("terms_page.prohibited_items.2") || 'Merusak sistem platform.'
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
                        {t("terms_page.title") || "Syarat & Ketentuan"}
                    </h1>
                    <div className="w-10"></div>
                </div>

                <div className="max-w-xl mx-auto px-5">
                    {/* Hero Section */}
                    <div className="text-center mb-10 mt-6">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-indigo-50 dark:bg-indigo-500/10 mb-6 border border-indigo-100 dark:border-indigo-500/20">
                            <ShieldCheck className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h2 className="font-['Lexend_Deca'] font-extrabold text-2xl text-gray-900 dark:text-gray-100 mb-3">
                            {t("terms_page.hero_title") || "Syarat & Ketentuan"}
                        </h2>
                        <p className="font-['Manrope'] text-[15px] leading-relaxed text-gray-500 dark:text-gray-400">
                            {t("terms_page.hero_desc") || "Terakhir diperbarui: 7 Mei 2026. Aturan main untuk kenyamanan ekosistem belajar Ba-Yu."}
                        </p>
                    </div>

                    <div className="space-y-6 mb-10">
                        {/* 1. Penerimaan */}
                        <div className="bg-white dark:bg-[#1C1A29] rounded-3xl p-6 border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-none">
                            <h3 className="font-['Lexend_Deca'] font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                {t("terms_page.section1_title") || "1. Penerimaan Ketentuan"}
                            </h3>
                            <p className="font-['Manrope'] text-[14px] text-gray-600 dark:text-gray-400 leading-relaxed">
                                {t("terms_page.section1_desc") || "Dengan mengakses dan menggunakan platform Ba-Yu, Anda dianggap telah membaca, memahami, dan menyetujui untuk terikat oleh Syarat dan Ketentuan ini. Jika Anda tidak setuju, mohon untuk tidak melanjutkan penggunaan layanan kami demi keamanan bersama."}
                            </p>
                        </div>

                        {/* 2. Akun */}
                        <div className="bg-white dark:bg-[#1C1A29] rounded-3xl p-6 border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-none">
                            <h3 className="font-['Lexend_Deca'] font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                                <UserCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                {t("terms_page.section2_title") || "2. Pendaftaran Akun"}
                            </h3>
                            <p className="font-['Manrope'] text-[14px] text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                                {t("terms_page.section2_desc") || "Untuk menggunakan fitur berbagi catatan, Anda diwajibkan mendaftar dengan informasi yang akurat. Anda bertanggung jawab penuh atas:"}
                            </p>
                            <div className="space-y-3">
                                {section2Items.map((item, i) => (
                                    <div key={i} className="flex gap-3 items-start p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                                        <div className="w-5 h-5 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-[10px] font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-white/10 shrink-0">
                                            {i + 1}
                                        </div>
                                        <p className="font-['Manrope'] text-[13px] text-gray-600 dark:text-gray-400 mt-0.5">{item}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 3. HKI */}
                        <div className="bg-white dark:bg-[#1C1A29] rounded-3xl p-6 border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-none">
                            <h3 className="font-['Lexend_Deca'] font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                {t("terms_page.section3_title") || "3. Hak Kekayaan Intelektual"}
                            </h3>
                            <div className="p-4 bg-indigo-50/50 dark:bg-indigo-500/10 rounded-2xl border border-indigo-100 dark:border-white/5">
                                <p className="font-['Manrope'] text-[14px] text-gray-700 dark:text-gray-300 leading-relaxed italic">
                                    {t("terms_page.section3_quote") || '"Setiap catatan yang Anda unggah ke Ba-Yu tetap menjadi milik Anda. Namun, dengan mengunggahnya, Anda memberikan lisensi kepada Ba-Yu untuk menampilkan, mendistribusikan, dan mempromosikan konten tersebut di dalam ekosistem platform kami untuk tujuan pendidikan."'}
                                </p>
                            </div>
                        </div>

                        {/* 4. Aturan Penggunaan */}
                        <div className="bg-white dark:bg-[#1C1A29] rounded-3xl p-6 border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-none">
                            <h3 className="font-['Lexend_Deca'] font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
                                {t("terms_page.section4_title") || "4. Aturan Penggunaan"}
                            </h3>
                            <div className="grid gap-4">
                                <div className="p-5 bg-emerald-50/50 dark:bg-emerald-500/10 rounded-2xl border border-emerald-100 dark:border-emerald-500/20">
                                    <h4 className="font-['Lexend_Deca'] font-bold text-emerald-900 dark:text-emerald-400 text-[14px] mb-3">{t("terms_page.allowed_title") || "Hal yang Diperbolehkan"}</h4>
                                    <ul className="space-y-2">
                                        {allowedItems.map((item, i) => (
                                            <li key={i} className="flex gap-2 items-center"><span className="text-emerald-500 font-bold">✓</span> <span className="font-['Manrope'] text-[13px] text-gray-600 dark:text-gray-300">{item}</span></li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="p-5 bg-red-50/50 dark:bg-red-500/10 rounded-2xl border border-red-100 dark:border-red-500/20">
                                    <h4 className="font-['Lexend_Deca'] font-bold text-red-900 dark:text-red-400 text-[14px] mb-3">{t("terms_page.prohibited_title") || "Hal yang Dilarang"}</h4>
                                    <ul className="space-y-2">
                                        {prohibitedItems.map((item, i) => (
                                            <li key={i} className="flex gap-2 items-center"><span className="text-red-500 font-bold">✕</span> <span className="font-['Manrope'] text-[13px] text-gray-600 dark:text-gray-300">{item}</span></li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="text-center pb-8 pt-4">
                        <p className="font-['Manrope'] text-[13px] text-gray-400 dark:text-gray-500 mb-2" dangerouslySetInnerHTML={{ __html: t("terms_page.contact") || 'Ada pertanyaan? Hubungi <a href="mailto:support@ba-yu.id" className="text-indigo-600 dark:text-indigo-400 font-bold">support@ba-yu.id</a>' }} />
                        <p className="font-['Manrope'] text-[13px] text-gray-400 dark:text-gray-500 mt-6" dangerouslySetInnerHTML={{ __html: t("terms_page.footer") || '&copy; 2026 Ba-Yu Platform.<br/>Semua Hak Dilindungi.' }} />
                    </div>
                </div>
            </div>
        </MobileLayout>
    );
}
