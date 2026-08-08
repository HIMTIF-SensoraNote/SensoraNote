import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { ArrowLeft, Server, Activity, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import { MobileLayout } from '../components/MobileLayout';
import { useTranslation } from '../hooks/useTranslation';

export default function StatusPage() {
    const { t } = useTranslation();
    useDocumentTitle(t('titles.app_status'));
    const navigate = useNavigate();


    return (
        <MobileLayout showBottomNav={false} hideMobileTopNav={true}>
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
                        {t("status_page.title") || "Status Sistem"}
                    </h1>
                    <div className="w-10"></div>
                </div>

                <div className="max-w-xl mx-auto px-5">
                    {/* Hero Section */}
                    <div className="text-center mb-10 mt-6">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-500/10 mb-6 border border-emerald-100 dark:border-emerald-500/20">
                            <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <h2 className="font-['Lexend_Deca'] font-extrabold text-2xl text-gray-900 dark:text-gray-100 mb-3">
                            {t("status_page.hero_title") || "Semua Sistem Normal"}
                        </h2>
                        <p className="font-['Manrope'] text-[15px] leading-relaxed text-gray-500 dark:text-gray-400">
                            {t("status_page.hero_desc") || "Platform beroperasi dengan baik."}
                        </p>
                    </div>

                    <div className="space-y-4 mb-10">
                        {[
                            { name: "API Services", status: t("status_page.status_operational") || "Operational", icon: Activity },
                            { name: "Database", status: t("status_page.status_operational") || "Operational", icon: Server },
                            { name: "File Storage", status: t("status_page.status_operational") || "Operational", icon: Server },
                            { name: "CDN & Assets", status: t("status_page.status_operational") || "Operational", icon: Activity }
                        ].map((service, i) => (
                            <div key={i} className="flex items-center justify-between p-5 rounded-3xl bg-white dark:bg-[#1C1A29] border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-none">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center border border-slate-100 dark:border-white/10">
                                        <service.icon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                                    </div>
                                    <span className="font-['Lexend_Deca'] font-bold text-[14px] text-gray-900 dark:text-gray-100">{service.name}</span>
                                </div>
                                <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[12px] font-bold rounded-full">
                                    {service.status}
                                </span>
                            </div>
                        ))}
                    </div>
                    
                    <div className="text-center pb-8 pt-4">
                        <p className="font-['Manrope'] text-[13px] text-gray-400 dark:text-gray-500" dangerouslySetInnerHTML={{ __html: t("status_page.footer") || '&copy; 2026 Ba-Yu Platform.<br/>Semua Hak Dilindungi.' }} />
                    </div>
                </div>
            </div>
        </MobileLayout>
    );
}
