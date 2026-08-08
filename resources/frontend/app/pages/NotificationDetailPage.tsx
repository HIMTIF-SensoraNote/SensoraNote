import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import axios from "axios";
import { 
    ArrowLeft, 
    ShieldAlert, 
    ShieldCheck, 
    Info, 
    AlertTriangle,
    Clock,
    User,
    CheckCircle2,
    XCircle,
    Trash2
} from "lucide-react";
import { MobileLayout } from "../components/MobileLayout";
import { useTranslation } from "../hooks/useTranslation";
import { useNotificationTranslator } from "../hooks/useNotificationTranslator";

interface NotificationDetail {
    _id: string;
    title: string;
    message: string;
    type: string;
    created_at: string;
    actor?: {
        name: string;
        avatar: string;
    };
}

export default function NotificationDetailPage() {
    const { t, language } = useTranslation();
    useDocumentTitle(t('titles.notification_detail'));
    const { id } = useParams();
    const navigate = useNavigate();
    const [notif, setNotif] = useState<NotificationDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { translateNotification } = useNotificationTranslator();

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const token = localStorage.getItem("bayu-token") || sessionStorage.getItem("bayu-token");
                const res = await axios.get(`/api/v1/notifikasi/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                // Mark as read just in case, but don't fail the whole page if it fails
                try {
                    await axios.put(`/api/v1/notifikasi/${id}/read`, {}, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                } catch (putErr) {
                    console.warn("Gagal mark as read:", putErr);
                }

                setNotif(translateNotification(res.data.data));
            } catch (err: any) {
                console.error("Gagal mengambil detail notifikasi:", err);
                setError(err.response?.data?.message || err.message || "Unknown error");
            } finally {
                setIsLoading(false);
            }
        };

        fetchDetail();
    }, [id]);

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString((language === 'ar' ? 'ar-EG' : language === 'fa' ? 'fa-IR' : language === 'id' ? 'id-ID' : language), {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getIcon = (type: string, title: string) => {
        const t = title.toLowerCase();
        if (t.includes('ditolak') || t.includes('banned') || t.includes('dihapus') || t.includes('takedown')) {
            return <XCircle className="w-6 h-6 text-rose-500" />;
        }
        if (t.includes('diterima') || t.includes('disetujui') || t.includes('verifikasi')) {
            return <CheckCircle2 className="w-6 h-6 text-emerald-500" />;
        }
        if (t.includes('peringatan') || type === 'report') {
            return <AlertTriangle className="w-6 h-6 text-amber-500" />;
        }
        return <Info className="w-6 h-6 text-blue-500" />;
    };

    if (isLoading) {
        return (
            <MobileLayout hideMobileTopNav={true}>
                <div className="min-h-screen bg-slate-50 dark:bg-[#13111C] flex flex-col animate-pulse">
                    {/* Header Navbar Skeleton */}
                    <div className="bg-white/80 dark:bg-[#1C1A29]/80 border-b border-gray-200 dark:border-white/5 sticky top-0 z-30">
                        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-white/10"></div>
                            <div className="w-32 h-6 bg-slate-200 dark:bg-white/10 rounded-full"></div>
                        </div>
                    </div>

                    {/* Email Content Skeleton */}
                    <div className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6">
                        <div className="bg-white dark:bg-[#1C1A29] rounded-[24px] shadow-sm border border-slate-100 dark:border-white/5 overflow-hidden">
                            {/* Email Header Skeleton */}
                            <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-white/5">
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="w-12 h-12 shrink-0 bg-slate-200 dark:bg-white/10 rounded-full"></div>
                                    <div className="flex-1">
                                        <div className="w-3/4 h-7 bg-slate-200 dark:bg-white/10 rounded-full mb-3"></div>
                                        <div className="w-1/4 h-4 bg-slate-200 dark:bg-white/10 rounded-full"></div>
                                    </div>
                                </div>
                                {/* Sender Info Skeleton */}
                                <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-white/10 shrink-0"></div>
                                    <div className="flex-1 flex flex-col gap-2">
                                        <div className="w-32 h-4 bg-slate-200 dark:bg-white/10 rounded-full"></div>
                                        <div className="w-24 h-3 bg-slate-200 dark:bg-white/10 rounded-full"></div>
                                    </div>
                                </div>
                            </div>
                            {/* Email Body Skeleton */}
                            <div className="p-6 sm:p-8 flex flex-col gap-3">
                                <div className="w-full h-4 bg-slate-200 dark:bg-white/10 rounded-full"></div>
                                <div className="w-full h-4 bg-slate-200 dark:bg-white/10 rounded-full"></div>
                                <div className="w-5/6 h-4 bg-slate-200 dark:bg-white/10 rounded-full"></div>
                                <div className="w-4/6 h-4 bg-slate-200 dark:bg-white/10 rounded-full"></div>
                                
                                <div className="mt-12 pt-6 border-t border-slate-100 dark:border-white/5 flex flex-col gap-2">
                                    <div className="w-16 h-3 bg-slate-200 dark:bg-white/10 rounded-full"></div>
                                    <div className="w-40 h-4 bg-slate-200 dark:bg-white/10 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </MobileLayout>
        );
    }

    if (!notif) {
        return (
            <MobileLayout>
                <div className="min-h-screen bg-slate-50 dark:bg-[#13111C] flex flex-col items-center justify-center p-6 text-center">
                    <Trash2 className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" strokeWidth={1.5} />
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 font-['Lexend_Deca'] mb-2">{t("notif_detail.not_found_title")}</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-['Manrope'] mb-6">
                        {t("notif_detail.not_found_desc")}<br/>
                        {error && <span className="text-red-500 text-sm mt-2 block">Error: {error}</span>}
                    </p>
                    <button 
                        onClick={() => navigate(-1)}
                        className="px-6 py-2.5 bg-indigo-600 text-white rounded-full font-bold text-sm hover:bg-indigo-700 transition-colors"
                    >
                        {t("notif_detail.back")}
                    </button>
                </div>
            </MobileLayout>
        );
    }

    return (
        <MobileLayout>
            <div className="min-h-screen bg-slate-50 dark:bg-[#13111C] flex flex-col">
                {/* Header Navbar */}
                <div className="bg-white/80 dark:bg-[#1C1A29]/80 backdrop-blur-xl border-b border-gray-200 dark:border-white/5 sticky top-0 z-30">
                    <div className="max-w-3xl mx-auto px-4 h-16 flex items-center gap-4">
                        <button 
                            onClick={() => navigate(-1)}
                            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                        </button>
                        <h1 className="font-['Lexend_Deca'] font-bold text-lg text-slate-900 dark:text-white truncate">
                            {t("notif_detail.title")}
                        </h1>
                    </div>
                </div>

                {/* Email Content Container */}
                <div className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6">
                    <div className="bg-white dark:bg-[#1C1A29] rounded-[24px] shadow-sm border border-slate-100 dark:border-white/5 overflow-hidden">
                        
                        {/* Email Header */}
                        <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-white/5">
                            <div className="flex items-start gap-4 mb-6">
                                <div className="mt-1 shrink-0 p-3 bg-slate-50 dark:bg-white/5 rounded-full border border-slate-100 dark:border-white/10">
                                    {getIcon(notif.type, notif.title)}
                                </div>
                                <div>
                                    <h2 className="font-['Lexend_Deca'] text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-tight mb-2">
                                        {(notif as any).translatedTitle || notif.title}
                                    </h2>
                                    <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                                        <Clock className="w-4 h-4" />
                                        <span>{formatDate(notif.created_at)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Sender Info */}
                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center shrink-0 border border-indigo-200 dark:border-indigo-500/30 overflow-hidden">
                                        {notif.actor?.avatar ? (
                                            <img src={notif.actor.avatar} alt={notif.actor.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-slate-900 dark:text-white">
                                            {notif.actor?.name || t("notif_detail.system")}
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            noreply@bayu.edu
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Email Body */}
                        <div className="p-6 sm:p-8">
                            <div className="prose prose-slate dark:prose-invert max-w-none">
                                <div className="font-['Manrope'] text-[15px] leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                                    {(notif as any).translatedMessage || notif.message}
                                </div>
                            </div>
                            
                            {/* Signature */}
                            <div className="mt-12 pt-6 border-t border-slate-100 dark:border-white/5 font-['Manrope']">
                                <p className="text-[14px] text-slate-500 dark:text-slate-400">
                                    {t("notif_detail.regards")}<br />
                                    <strong className="text-slate-700 dark:text-slate-300">{t("notif_detail.team")}</strong>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MobileLayout>
    );
}
