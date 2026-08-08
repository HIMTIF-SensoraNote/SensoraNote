import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useState, useEffect } from "react";
import { MobileLayout } from "../components/MobileLayout";
import { ArrowLeft, UserPlus, Check, X, Loader2, Users, Clock, Shield } from "lucide-react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import { useToast } from "../contexts/ToastContext";
import { AvatarImage } from "../components/ui/DefaultImages";
import { useTranslation } from "../hooks/useTranslation";

interface FollowRequest {
    _id: string;
    id?: string;
    follower_id: string;
    following_id: string;
    status: string;
    created_at: string;
    follower_user?: {
        _id: string;
        id?: string;
        name: string;
        username: string;
        avatar: string | null;
    };
}

export default function FollowRequestsPage() {
    const { t, language } = useTranslation();
    useDocumentTitle(t('titles.follow_requests'));
    const navigate = useNavigate();
    const { user } = useAuth();
    const { showToast } = useToast();

    const [requests, setRequests] = useState<FollowRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    function timeAgo(dateStr: string): string {
        const now = new Date();
        const date = new Date(dateStr);
        const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
        if (diff < 60) return t("follow_requests.just_now") || "Baru saja";
        if (diff < 3600) return (t("follow_requests.minutes_ago") || "{{minutes}} menit lalu").replace("{{minutes}}", Math.floor(diff / 60).toString());
        if (diff < 86400) return (t("follow_requests.hours_ago") || "{{hours}} jam lalu").replace("{{hours}}", Math.floor(diff / 3600).toString());
        if (diff < 604800) return (t("follow_requests.days_ago") || "{{days}} hari lalu").replace("{{days}}", Math.floor(diff / 86400).toString());
        return date.toLocaleDateString((language === 'ar' ? 'ar-EG' : language === 'fa' ? 'fa-IR' : language === 'id' ? 'id-ID' : language), { day: "numeric", month: "short", year: "numeric" });
    }

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem("bayu-token") || sessionStorage.getItem("bayu-token");
            const res = await axios.get("/api/v1/follow-requests", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRequests(res.data);
        } catch (error) {
            console.error("Gagal mengambil permintaan pertemanan", error);
            showToast(t("follow_requests.fetch_failed") || "Gagal memuat permintaan mengikuti", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResponse = async (requestId: string, action: 'accept' | 'decline') => {
        setProcessingId(requestId);
        try {
            const token = localStorage.getItem("bayu-token") || sessionStorage.getItem("bayu-token");
            await axios.post(`/api/v1/follow-requests/${requestId}/respond`, { action }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setRequests(prev => prev.filter(r => (r.id || r._id) !== requestId));
            showToast(action === 'accept' ? (t("follow_requests.accept_success") || "Permintaan diterima") : (t("follow_requests.decline_success") || "Permintaan ditolak"), "success");
        } catch (error) {
            console.error("Gagal merespons permintaan", error);
            showToast(t("follow_requests.process_failed") || "Gagal memproses permintaan", "error");
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <MobileLayout showBottomNav={false} hideMobileTopNav={true}>
            <div className="min-h-screen pb-10 bg-slate-50/50 dark:bg-[#13111C]">
                {/* Header */}
                <div className="sticky top-0 bg-slate-50/80 dark:bg-[#13111C]/80 backdrop-blur-xl z-20 px-5 pt-10 pb-5 border-b border-slate-200/60 dark:border-white/5">
                    <div className="max-w-xl mx-auto flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="w-10 h-10 flex items-center justify-center bg-white dark:bg-white/5 border border-slate-200/80 dark:border-white/10 hover:border-primary/30 dark:hover:border-white/20 rounded-2xl transition-all shadow-sm active:scale-90"
                        >
                            <ArrowLeft className="w-5 h-5 text-slate-700 dark:text-gray-300" />
                        </button>
                        <div className="flex-1">
                            <h1 className="text-slate-900 dark:text-gray-100 font-['Lexend_Deca'] font-black text-xl tracking-tight">
                                {t("follow_requests.title") || "Permintaan Mengikuti"}
                            </h1>
                            {!isLoading && requests.length > 0 && (
                                <p className="text-slate-500 dark:text-gray-500 font-['Manrope'] text-[12px] font-bold mt-0.5">
                                    {(t("follow_requests.pending_requests") || "{{count}} permintaan menunggu").replace("{{count}}", requests.length.toString())}
                                </p>
                            )}
                        </div>
                        <div className="w-10 h-10 flex items-center justify-center bg-primary/5 dark:bg-primary/10 rounded-2xl">
                            <Shield className="w-5 h-5 text-primary" />
                        </div>
                    </div>
                </div>

                <div className="max-w-xl mx-auto px-5 mt-6">
                    {isLoading ? (
                        <div className="space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="bg-white dark:bg-[#1C1A29] rounded-[24px] p-5 border border-slate-100 dark:border-white/5 animate-pulse">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-white/10 shrink-0"></div>
                                        <div className="flex-1 space-y-2.5">
                                            <div className="h-4 bg-slate-100 dark:bg-white/10 rounded-lg w-32"></div>
                                            <div className="h-3 bg-slate-100 dark:bg-white/10 rounded-lg w-20"></div>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 mt-5">
                                        <div className="flex-1 h-11 bg-slate-100 dark:bg-white/10 rounded-2xl"></div>
                                        <div className="flex-1 h-11 bg-slate-100 dark:bg-white/10 rounded-2xl"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : requests.length > 0 ? (
                        <div className="space-y-4">
                            {requests.map((request) => {
                                const reqId = request.id || request._id;
                                const isProcessing = processingId === reqId;
                                return (
                                    <div 
                                        key={reqId}
                                        className="bg-white dark:bg-[#1C1A29] rounded-[24px] p-5 border border-slate-100 dark:border-white/5 shadow-[0_8px_30px_-10px_rgba(0,0,0,0.06)] dark:shadow-none hover:border-slate-200 dark:hover:border-white/10 transition-all duration-300 group"
                                    >
                                        {/* User Info Row */}
                                        <div className="flex items-center gap-4">
                                            <Link 
                                                to={`/profile/${request.follower_user?.username || request.follower_id}`}
                                                className="relative shrink-0"
                                            >
                                                <AvatarImage 
                                                    src={request.follower_user?.avatar} 
                                                    alt={request.follower_user?.name} 
                                                    size={56}
                                                    className="rounded-full ring-2 ring-slate-100 dark:ring-white/5 group-hover:ring-primary/20 transition-all"
                                                />
                                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-primary to-indigo-600 rounded-full border-[2.5px] border-white dark:border-[#1C1A29] flex items-center justify-center shadow-md">
                                                    <UserPlus className="w-3 h-3 text-white" strokeWidth={3} />
                                                </div>
                                            </Link>
                                            <div className="flex-1 min-w-0">
                                                <Link 
                                                    to={`/profile/${request.follower_user?.username || request.follower_id}`}
                                                    className="font-['Lexend_Deca'] font-bold text-[16px] text-slate-900 dark:text-gray-100 leading-tight hover:text-primary transition-colors block truncate"
                                                >
                                                    {request.follower_user?.name || (t("follow_requests.anonymous") || "Anonim")}
                                                </Link>
                                                <p className="font-['Manrope'] text-[13px] text-slate-400 dark:text-gray-500 font-semibold truncate">
                                                    @{request.follower_user?.username || "user"}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-slate-400 dark:text-gray-600 shrink-0">
                                                <Clock className="w-3.5 h-3.5" />
                                                <span className="text-[11px] font-['Manrope'] font-bold">
                                                    {request.created_at ? timeAgo(request.created_at) : ""}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex items-center gap-3 mt-5">
                                            <button
                                                onClick={() => handleResponse(reqId, 'decline')}
                                                disabled={isProcessing}
                                                className="flex-1 h-11 flex items-center justify-center gap-2 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-gray-400 rounded-2xl font-['Manrope'] font-bold text-[13px] border border-slate-200/60 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/15 transition-all active:scale-[0.97] disabled:opacity-40"
                                            >
                                                <X className="w-4 h-4" strokeWidth={2.5} />
                                                {t("follow_requests.decline") || "Tolak"}
                                            </button>
                                            <button
                                                onClick={() => handleResponse(reqId, 'accept')}
                                                disabled={isProcessing}
                                                className="flex-1 h-11 flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-indigo-600 text-white rounded-2xl font-['Manrope'] font-bold text-[13px] shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:from-primary/90 hover:to-indigo-600/90 transition-all active:scale-[0.97] disabled:opacity-40"
                                            >
                                                {isProcessing ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <>
                                                        <Check className="w-4 h-4" strokeWidth={3} />
                                                        {t("follow_requests.accept") || "Terima"}
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-32 text-center">
                            <div className="relative mb-8">
                                <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-50 dark:from-white/5 dark:to-white/[0.02] rounded-[2rem] flex items-center justify-center border border-slate-200/50 dark:border-white/5">
                                    <Users className="w-10 h-10 text-slate-300 dark:text-gray-600" />
                                </div>
                                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary/10 dark:bg-primary/15 rounded-2xl flex items-center justify-center border border-primary/20">
                                    <Check className="w-5 h-5 text-primary/60" />
                                </div>
                            </div>
                            <h3 className="font-['Lexend_Deca'] font-black text-slate-900 dark:text-gray-100 text-lg mb-2">
                                {t("follow_requests.all_caught_up") || "Semua Beres!"}
                            </h3>
                            <p className="text-slate-400 dark:text-gray-500 font-['Manrope'] font-semibold text-[14px] max-w-xs leading-relaxed">
                                {t("follow_requests.no_requests") || "Tidak ada permintaan mengikuti baru. Saat seseorang meminta untuk mengikutimu, kamu bisa kelola di sini."}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </MobileLayout>
    );
}
