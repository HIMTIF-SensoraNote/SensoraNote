import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useState, useEffect } from "react";
import { MobileLayout } from "../components/MobileLayout";
import { useAuth } from "../contexts/AuthContext";
import {
    CheckCircle,
    XCircle,
    Eye,
    Clock,
    Search,
    Filter,
    ShieldCheck,
    Map,
    BookOpen,
    ChevronRight,
    TrendingUp,
    Zap,
    Activity,
    ArrowUpRight,
    LayoutGrid,
    ListFilter,
    Sparkles,
    FileText,
    Star,
    MessageSquare,
    Send,
    X
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  ResponsiveContainer 
} from 'recharts';
import { mataPelajaran } from "../data/mockData";
import { Link } from "react-router";
import { useToast } from "../contexts/ToastContext";
import axios from "axios";
import { AvatarImage } from "../components/ui/DefaultImages";
import { NoteCard } from "../components/NoteCard";
import { NoteCardSkeleton } from "../components/ui/skeletons";
import { useTranslation } from "../hooks/useTranslation";

type VerificationStatus = "pending" | "approved" | "rejected" | "all";

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (rating: number, reason: string) => void;
    type: "approve" | "reject" | "cancel";
    noteTitle: string;
}

const FeedbackModal = ({ isOpen, onClose, onSubmit, type, noteTitle }: FeedbackModalProps) => {
    const { t } = useTranslation();
    const [rating, setRating] = useState(5);
    const [reason, setReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleFormSubmit = async () => {
        setIsSubmitting(true);
        await onSubmit(rating, reason);
        setIsSubmitting(false);
        setReason("");
        setRating(5);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-[#1C1A29] w-full max-w-lg rounded-[24px] shadow-xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100 dark:border-white/5">
                {/* Modal Header */}
                <div className={`p-6 md:p-8 pb-4 flex justify-between items-start ${type === 'approve' ? 'bg-indigo-50/50 dark:bg-indigo-500/10' : type === 'cancel' ? 'bg-rose-50/50 dark:bg-rose-500/10' : 'bg-rose-50/50 dark:bg-rose-500/10'}`}>
                    <div className="flex gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${type === 'approve' ? 'bg-indigo-600 text-white' : 'bg-rose-600 text-white'}`}>
                            {type === 'approve' ? <CheckCircle size={24} /> : <XCircle size={24} />}
                        </div>
                        <div>
                            <h3 className="font-['Lexend_Deca'] text-xl font-bold text-slate-800 dark:text-slate-100">
                                {type === 'approve' ? t('pakar_dashboard.validate') : type === 'cancel' ? t('pakar_dashboard.cancel_verification') : t('pakar_dashboard.reject_material')}
                            </h3>
                            <p className="text-slate-500 text-sm font-medium line-clamp-1 mt-0.5">{noteTitle}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white dark:hover:bg-white/10 rounded-full transition-colors">
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>

                <div className="p-6 md:p-8 space-y-8">
                    {/* Rating Section */}
                    {type === 'approve' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-end">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <Sparkles size={14} className="text-amber-500" /> {t('pakar_dashboard.quality')}
                                </label>
                                <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-md ${
                                    rating <= 2 ? 'bg-orange-50 text-orange-600' : 
                                    rating <= 3 ? 'bg-indigo-50 text-indigo-600' : 
                                    'bg-emerald-50 text-emerald-600'
                                }`}>
                                    {rating === 1 && t('pakar_dashboard.needs_improvement')}
                                    {rating === 2 && t('pakar_dashboard.fair')}
                                    {rating === 3 && t('pakar_dashboard.good')}
                                    {rating === 4 && t('pakar_dashboard.recommended')}
                                    {rating === 5 && t('pakar_dashboard.excellent')}
                                </span>
                            </div>

                            <div className="relative bg-slate-50/50 dark:bg-white/5 p-6 md:p-8 rounded-[20px] border border-slate-100 dark:border-white/5 flex flex-col items-center group/stars">
                                <div className="absolute inset-0 bg-gradient-to-r from-amber-200/5 via-amber-300/10 to-amber-200/5 opacity-0 group-hover/stars:opacity-100 transition-opacity duration-1000 blur-2xl pointer-events-none" />
                                <div className="flex gap-4 relative z-10">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => setRating(s)}
                                            className={`group/star transition-all duration-500 transform hover:scale-110 active:scale-95 ${rating >= s ? 'scale-105' : 'scale-100 grayscale opacity-30 hover:grayscale-0 hover:opacity-100'}`}
                                        >
                                            <div className="relative">
                                                <Star
                                                    size={40}
                                                    fill={rating >= s ? "#f59e0b" : "transparent"}
                                                    className={`${rating >= s ? "text-amber-500 drop-shadow-md" : "text-slate-300"} transition-all duration-300`}
                                                    strokeWidth={rating >= s ? 1.5 : 2}
                                                />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                                <div className="mt-6 w-full h-1.5 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden relative">
                                    <div 
                                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-700 ease-out rounded-full shadow-[0_0_10px_rgba(245,158,11,0.3)]"
                                        style={{ width: `${(rating / 5) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Feedback Textarea */}
                    <div className="space-y-3">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <MessageSquare size={14} className="text-indigo-500" /> 
                            {type === 'approve' ? t('pakar_dashboard.feedback_author') : type === 'cancel' ? t('pakar_dashboard.reason_cancel') : t('pakar_dashboard.reason_reject')}
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder={type === 'approve' ? t('pakar_dashboard.placeholder_approve') : type === 'cancel' ? t('pakar_dashboard.placeholder_cancel') : t('pakar_dashboard.placeholder_reject')}
                            className="w-full h-28 p-4 bg-white dark:bg-[#13111C] border border-slate-200 dark:border-white/10 rounded-xl text-[14px] font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all resize-none shadow-sm dark:shadow-none"
                        />
                    </div>

                    <div className="flex gap-3">
                        <button onClick={onClose} className="flex-1 py-3.5 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 text-slate-600 dark:text-slate-300 rounded-xl font-['Lexend_Deca'] font-bold text-[12px] uppercase tracking-wider hover:bg-slate-100 dark:hover:bg-white/10 transition-all shadow-sm dark:shadow-none">{t('pakar_dashboard.cancel_btn')}</button>
                        <button onClick={handleFormSubmit} disabled={isSubmitting || (type !== 'approve' && !reason.trim())} className={`flex-[2] py-3.5 rounded-xl font-['Lexend_Deca'] font-bold text-[12px] uppercase tracking-wider text-white shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${type === 'approve' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-rose-600 hover:bg-rose-700'}`}>
                            {isSubmitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Send size={14} />{type === 'approve' ? t('pakar_dashboard.confirm_validate') : type === 'cancel' ? t('pakar_dashboard.confirm_cancel') : t('pakar_dashboard.confirm_reject')}</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function PakarDashboard() {
    const { t } = useTranslation();
    useDocumentTitle(t('titles.expert_dashboard'));
    const { user } = useAuth();

    const [filter, setFilter] = useState<VerificationStatus>("pending");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<"terbaru" | "terlama">("terbaru");
    const [visibleItemsCount, setVisibleItemsCount] = useState(15);
    const { showToast } = useToast();
    const [notes, setNotes] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    const [selectedNoteForFeedback, setSelectedNoteForFeedback] = useState<any>(null);
    const [feedbackType, setFeedbackType] = useState<"approve" | "reject" | "cancel">("approve");

    const sparkData = [{ v: 40 }, { v: 60 }, { v: 45 }, { v: 70 }, { v: 55 }, { v: 85 }, { v: 75 }];

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchPosts(searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => { fetchPosts(); }, []);

    const fetchPosts = async (search = "") => {
        setIsLoading(true);
        try {
            const url = search 
                ? `/api/v1/posts?sort=terbaru&submitted_for_review=true&limit=100&search=${encodeURIComponent(search)}`
                : `/api/v1/posts?sort=terbaru&submitted_for_review=true&limit=100`;
            const response = await axios.get(url);
            const formattedNotes = (response.data.data || []).map((note: any) => ({
                ...note,
                id: note._id || note.id,
                author: note.user ? { ...note.user, avatar: note.user.avatar || null } : { name: "Anonim", avatar: null },
                createdAt: note.created_at || note.createdAt,
                description: note.description || (note.plain_content ? note.plain_content.substring(0, 150) + "..." : "Tidak ada deskripsi"),
                mataPelajaran: note.mapel || "Lainnya",
                kelas: note.kelas || "-",
                isValidated: note.is_verified || false,
                isRejected: note.is_rejected || false,
            }));
            setNotes(formattedNotes);
        } catch (error) {
            console.error("Error fetching posts:", error);
            showToast("Gagal memuat data antrean", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleActionClick = (note: any, type: "approve" | "reject" | "cancel") => {
        setSelectedNoteForFeedback(note);
        setFeedbackType(type);
        setIsFeedbackModalOpen(true);
    };

    const handleVerifySubmit = async (rating: number, reason: string) => {
        if (!selectedNoteForFeedback) return;
        try {
            const tk = localStorage.getItem("bayu-token") || sessionStorage.getItem("bayu-token");
            const config = { headers: { Authorization: `Bearer ${tk}` } };
            const noteId = selectedNoteForFeedback.id;
            if (feedbackType === "approve") {
                await axios.put(`/api/v1/posts/${noteId}/verify`, { rating, reason }, config);
                showToast(t('pakar_dashboard.toast_validated'), "success");
                setNotes(prev => prev.map(n => n.id === noteId ? { ...n, isValidated: true, isRejected: false } : n));
            } else if (feedbackType === "cancel") {
                await axios.put(`/api/v1/posts/${noteId}/unverify`, { reason }, config);
                showToast(t('pakar_dashboard.toast_unverified'), "info");
                setNotes(prev => prev.map(n => n.id === noteId ? { ...n, isValidated: false } : n));
            } else {
                await axios.put(`/api/v1/posts/${noteId}/reject`, { reason }, config);
                showToast(t('pakar_dashboard.toast_rejected'), "success");
                setNotes(prev => prev.map(n => n.id === noteId ? { ...n, isRejected: true, isValidated: false } : n));
            }
            setIsFeedbackModalOpen(false);
        } catch (error) {
            showToast(t('pakar_dashboard.toast_fail'), "error");
        }
    };

    const pendingNotes = notes.filter((n) => !n.isValidated && !n.isRejected);
    const verifiedNotes = notes.filter((n) => n.isValidated);
    const rejectedNotes = notes.filter((n) => n.isRejected);

    const stats = [
        { label: t('pakar_dashboard.waiting_validation'), value: pendingNotes.length, color: "text-amber-600", icon: Clock, sparkColor: "#f59e0b" },
        { label: t('pakar_dashboard.approved'), value: verifiedNotes.length, color: "text-indigo-600", icon: CheckCircle, sparkColor: "#6366f1" },
        { label: t('pakar_dashboard.rejected_stats'), value: rejectedNotes.length, color: "text-rose-600", icon: XCircle, sparkColor: "#e11d48" },
        { label: t('pakar_dashboard.total_control'), value: notes.length, color: "text-slate-600", icon: Activity, sparkColor: "#64748b" },
    ];

    const filteredNotes = (filter === "all" ? notes : filter === "pending" ? pendingNotes : filter === "rejected" ? rejectedNotes : verifiedNotes)
        .filter(n => {
            const q = searchQuery.toLowerCase();
            return n.title?.toLowerCase().includes(q) || n.mataPelajaran?.toLowerCase().includes(q) || n.author?.name?.toLowerCase().includes(q);
        })
        .sort((a, b) => {
            const dateA = new Date(a.created_at || a.createdAt || 0).getTime();
            const dateB = new Date(b.created_at || b.createdAt || 0).getTime();
            return sortBy === "terbaru" ? dateB - dateA : dateA - dateB;
        });

    const handleLoadMore = () => {
        setVisibleItemsCount((prev) => prev + 15);
    };

    return (
        <MobileLayout>
            <div className="w-full h-full flex justify-center pb-20 bg-slate-50/50 dark:bg-[#13111C] min-h-screen font-['Manrope']">
                <FeedbackModal isOpen={isFeedbackModalOpen} onClose={() => setIsFeedbackModalOpen(false)} onSubmit={handleVerifySubmit} type={feedbackType} noteTitle={selectedNoteForFeedback?.title || ""} />

                <div className="w-full max-w-[1140px] px-4 sm:px-6 md:px-8 flex flex-col lg:flex-row gap-8 lg:gap-10 xl:gap-14 lg:justify-center mx-auto mt-8">
                    {/* LEFT COLUMN (MAIN CONTENT) */}
                    <div className="flex-1 w-full lg:max-w-[640px] xl:max-w-[700px] min-w-0">
                        
                        {/* Minimalist Pakar Header */}
                        <div className="flex flex-row items-center justify-between gap-6 mb-8 pb-6 border-b border-gray-200 dark:border-white/10">
                            <div className="flex items-center gap-4">
                                <div className="relative shrink-0">
                                    <AvatarImage src={user?.avatar} alt={user?.name} size={64} className="rounded-full border border-gray-200 dark:border-white/10" />
                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center border-2 border-slate-50 dark:border-[#13111C]">
                                        <ShieldCheck className="w-3.5 h-3.5 text-white" />
                                    </div>
                                </div>
                                <div>
                                    <h2 className="text-gray-900 dark:text-gray-100 font-bold text-xl tracking-tight leading-none mb-1.5 flex items-center gap-2">
                                        {user?.name || t('pakar_dashboard.title')}
                                    </h2>
                                    <p className="text-[14px] text-gray-500 dark:text-gray-400">{t('pakar_dashboard.subtitle')}</p>
                                </div>
                            </div>
                            <Link to="/explore" className="hidden sm:flex px-4 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 rounded-full font-bold text-[13px] hover:bg-gray-50 dark:hover:bg-white/10 transition-colors items-center gap-2 shrink-0">
                                <BookOpen size={16} />
                                {t('pakar_dashboard.explore')}
                            </Link>
                        </div>

                        <div className="space-y-6">

                            {/* Mobile Stats (Visible only on mobile) */}
                            <div className="lg:hidden pb-2">
                                <h3 className="font-['Lexend_Deca'] font-extrabold text-[14px] text-gray-900 dark:text-gray-100 tracking-tight mb-4">
                                    {t('pakar_dashboard.stats_title')}
                                </h3>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                                    {stats.map((stat, index) => {
                                        const Icon = stat.icon;
                                        return (
                                            <div key={index} className="bg-white dark:bg-[#1C1A29] rounded-xl p-4 border border-gray-200 dark:border-white/10 flex items-center justify-between shadow-sm">
                                                <div>
                                                    <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium mb-1">
                                                        {stat.label}
                                                    </p>
                                                    <p className="text-xl font-bold text-gray-900 dark:text-gray-100 leading-none">
                                                        {stat.value}
                                                    </p>
                                                </div>
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-gray-50 dark:bg-white/5`}>
                                                    <Icon size={16} className={stat.color} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <Link to="/explore" className="sm:hidden w-full px-4 py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 rounded-2xl font-bold text-[13px] hover:bg-gray-50 dark:hover:bg-white/10 transition-colors flex items-center justify-center gap-2 shadow-sm">
                                    <BookOpen size={16} />
                                    {t('pakar_dashboard.explore')}
                                </Link>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
                                <div className="relative w-full sm:max-w-xs group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className="h-4 w-4 text-gray-400" /></div>
                                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t('pakar_dashboard.search_placeholder')} className="w-full pl-9 pr-4 py-2 bg-gray-100/50 dark:bg-white/5 border-none rounded-full text-[14px] text-gray-900 dark:text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all" />
                                </div>
                                <div className="flex w-full sm:w-auto border-b border-gray-200 dark:border-white/10">
                                    {[
                                        { id: "pending", label: t('pakar_dashboard.tab_queue') },
                                        { id: "approved", label: t('pakar_dashboard.tab_verified') },
                                        { id: "rejected", label: t('pakar_dashboard.rejected_stats') },
                                        { id: "all", label: t('pakar_dashboard.tab_all') },
                                    ].map((tab) => {
                                        const active = filter === tab.id;
                                        return (
                                            <button key={tab.id} onClick={() => setFilter(tab.id as any)} className={`relative flex-1 sm:flex-none px-4 py-3 text-[14px] font-bold transition-colors ${active ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5"}`}>
                                                {tab.label}
                                                {tab.id === 'pending' && pendingNotes.length > 0 && <span className="ml-1.5 text-indigo-500">({pendingNotes.length})</span>}
                                                {active && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500 rounded-t-full" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {isLoading ? (
                                    <div className="flex flex-col gap-6">
                                        {[...Array(3)].map((_, i) => (
                                            <NoteCardSkeleton key={i} />
                                        ))}
                                    </div>
                                ) : filteredNotes.length === 0 ? (
                                    <div className="bg-white dark:bg-[#1C1A29] rounded-[24px] py-20 border border-slate-200 dark:border-white/10 border-dashed text-center flex flex-col items-center shadow-sm dark:shadow-none">
                                        <div className="w-20 h-20 bg-slate-50 dark:bg-white/5 rounded-[20px] flex items-center justify-center mb-5"><CheckCircle className="w-10 h-10 text-slate-300 dark:text-white/20" /></div>
                                        <h3 className="font-['Lexend_Deca'] text-xl font-bold text-slate-800 dark:text-slate-100 mb-1.5">{t('pakar_dashboard.empty_queue_title')}</h3>
                                        <p className="text-slate-500 dark:text-slate-400 font-medium text-[14px]">{t('pakar_dashboard.empty_queue_desc')}</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex flex-col">
                                            {filteredNotes.slice(0, visibleItemsCount).map((note) => (
                                                <NoteCard
                                                    key={note.id}
                                                    note={note}
                                                    renderActions={(n) => (
                                                        <>
                                                            {n.isValidated ? (
                                                                <>
                                                                    <div className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full px-3 py-1.5 border border-emerald-100 dark:border-emerald-500/20 font-['Lexend_Deca'] font-bold text-[10px] flex items-center gap-1.5 uppercase tracking-widest"><ShieldCheck size={14} /> {t('pakar_dashboard.verified')}</div>
                                                                    <button onClick={() => handleActionClick(n, "cancel")} className="px-3 py-1.5 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-full font-['Lexend_Deca'] font-bold text-[10px] flex items-center gap-1.5 uppercase tracking-widest hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-all border border-transparent hover:border-rose-200 dark:hover:border-rose-500/30">{t('pakar_dashboard.cancel_verification')}</button>
                                                                </>
                                                            ) : n.isRejected ? (
                                                                <div className="bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-full px-3 py-1.5 border border-rose-100 dark:border-rose-500/20 font-['Lexend_Deca'] font-bold text-[10px] flex items-center gap-1.5 uppercase tracking-widest">
                                                                    <XCircle size={14} /> {t('pakar_dashboard.rejected_stats')}
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <button onClick={() => handleActionClick(n, "approve")} className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full font-['Lexend_Deca'] font-bold text-[10px] hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-all flex items-center gap-1.5 uppercase tracking-widest border border-indigo-100 dark:border-indigo-500/20"><CheckCircle size={14} /> {t('pakar_dashboard.approve')}</button>
                                                                    <button onClick={() => handleActionClick(n, "reject")} className="px-3 py-1.5 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-full font-['Lexend_Deca'] font-bold text-[10px] hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-all flex items-center gap-1.5 uppercase tracking-widest border border-rose-100 dark:border-rose-500/20"><XCircle size={14} /> {t('pakar_dashboard.reject')}</button>
                                                                </>
                                                            )}
                                                        </>
                                                    )}
                                                />
                                            ))}
                                        </div>
                                        {filteredNotes.length > visibleItemsCount && (
                                            <div className="mt-8 flex justify-center">
                                                <button onClick={handleLoadMore} className="px-6 py-3 bg-white dark:bg-[#1C1A29] border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl font-['Lexend_Deca'] font-bold text-slate-700 dark:text-slate-300 text-[13px] shadow-sm transition-all">
                                                    {t('pakar_dashboard.load_more')}
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN (SIDEBAR) */}
                    <div className="hidden lg:block w-[280px] xl:w-[320px] shrink-0 border-l border-gray-100 dark:border-white/5 pl-6 xl:pl-10">
                        <div className="sticky pt-2 pb-12" style={{ top: "min(72px, calc(100vh - 100% - 24px))" }}>
                            
                            <div className="pb-8 border-b border-gray-100 dark:border-white/5 mb-8">
                                <h3 className="font-['Lexend_Deca'] font-extrabold text-[16px] text-gray-900 dark:text-gray-100 tracking-tight mb-6">
                                    {t('pakar_dashboard.curation_stats')}
                                </h3>
                                <div className="grid grid-cols-1 gap-4">
                                    {stats.map((stat, index) => {
                                        return (
                                            <div key={index} className="bg-white dark:bg-[#1C1A29] rounded-xl p-4 border border-gray-200 dark:border-white/10 flex items-center justify-between">
                                                <div>
                                                    <p className="text-[13px] text-gray-500 dark:text-gray-400 font-medium mb-1">
                                                        {stat.label}
                                                    </p>
                                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 leading-none">
                                                        {stat.value}
                                                    </p>
                                                </div>
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-gray-50 dark:bg-white/5`}>
                                                    <stat.icon size={20} className={stat.color} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="bg-white dark:bg-[#1C1A29] rounded-xl p-5 border border-gray-200 dark:border-white/10 mb-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <BookOpen className="w-4 h-4 text-gray-500" />
                                    <h3 className="font-bold text-gray-900 dark:text-gray-100 text-[14px]">{t('pakar_dashboard.curation_guidelines')}</h3>
                                </div>
                                <div className="space-y-4">
                                    {[
                                        { title: t('pakar_dashboard.guide_1_title'), desc: t('pakar_dashboard.guide_1_desc') },
                                        { title: t('pakar_dashboard.guide_2_title'), desc: t('pakar_dashboard.guide_2_desc') },
                                        { title: t('pakar_dashboard.guide_3_title'), desc: t('pakar_dashboard.guide_3_desc') },
                                    ].map((rule, idx) => (
                                        <div key={idx} className="flex gap-3">
                                            <div className="text-gray-400 font-bold text-[12px] pt-0.5">{idx + 1}.</div>
                                            <div>
                                                <h4 className="text-[13px] font-bold text-gray-900 dark:text-gray-100">{rule.title}</h4>
                                                <p className="text-[13px] text-gray-500 leading-snug mt-0.5">{rule.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-5 border border-gray-200 dark:border-white/10">
                                <div className="flex items-center gap-2 mb-2">
                                    <ShieldCheck className="w-4 h-4 text-indigo-500" />
                                    <h4 className="font-bold text-gray-900 dark:text-gray-100 text-[14px]">{t('pakar_dashboard.quality_priority')}</h4>
                                </div>
                                <p className="text-gray-500 dark:text-gray-400 text-[13px] leading-relaxed">{t('pakar_dashboard.quality_desc')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MobileLayout>
    );
}
