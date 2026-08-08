import { useTranslation } from '../hooks/useTranslation';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useState, useEffect } from "react";
import { MobileLayout } from "../components/MobileLayout";
import { Navbar } from "../components/navbar";
import { Footer } from "../components/footer";
import {
    Search,
    Filter,
    BookOpen,
    Check,
    Eye,
    Heart,
    MessageCircle,
    Upload,
    LogIn,
    Sparkles,
    TrendingUp,
    Clock,
    Bookmark,
    X,
    Compass,
} from "lucide-react";
import { NoteCardSkeleton } from "../components/ui/skeletons";
import { mataPelajaran } from "../data/mockData";
import axios from "axios";
import { Link, useLocation } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { useBookmarks } from "../contexts/BookmarkContext";
import { AuthModal } from "../components/auth-modal";
import { TagList } from "../components/ui/TagList";
import { DefaultThumbnail, AvatarImage } from "../components/ui/DefaultImages";
import { NoteCard } from "../components/NoteCard";
export default function PublicExplorePage() {
    const { t } = useTranslation();
    useDocumentTitle(t('titles.public_explore'));
    const { isAuthenticated } = useAuth();
    const { isBookmarked, toggleBookmark } = useBookmarks();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const tabFromUrl = queryParams.get("tab") as "kategori" | "populer" | "terbaru" | null;

    const [activeSegment, setActiveSegment] = useState<
        "kategori" | "populer" | "terbaru"
    >(() => {
        if (tabFromUrl && ["kategori", "populer", "terbaru"].includes(tabFromUrl)) {
            return tabFromUrl;
        }
        return "kategori";
    });

    // Update activeSegment when tab URL param changes
    useEffect(() => {
        if (tabFromUrl && ["kategori", "populer", "terbaru"].includes(tabFromUrl)) {
            setActiveSegment(tabFromUrl);
        }
    }, [tabFromUrl]);

    const searchTermFromUrl = queryParams.get("q") || "";
    const [searchQuery, setSearchQuery] = useState(searchTermFromUrl);

    useEffect(() => {
        setSearchQuery(searchTermFromUrl);
    }, [searchTermFromUrl]);

    const [notes, setNotes] = useState<any[]>([]);
    const [isLoadingNotes, setIsLoadingNotes] = useState(true);
    const [experts, setExperts] = useState<any[]>([]);

    // Mobile drawer state
    const [isMobileExploreDrawerOpen, setIsMobileExploreDrawerOpen] = useState(false);

    // Function to render the Right Sidebar content (reused for desktop & mobile drawer)
    const renderRightColumn = () => (
        <div className="flex flex-col gap-10">
            {/* Penulis Direkomendasikan */}
            <div>
                <h3 className="font-['Lexend_Deca'] font-extrabold text-[16px] text-gray-900 dark:text-gray-100 tracking-tight mb-5 flex items-center gap-2">
                    <Sparkles
                        className="w-4 h-4 text-primary"
                        strokeWidth={2.5}
                    />{" "}
                    Pakar Edukasi
                </h3>
                <div className="flex flex-col gap-5">
                    {experts.length > 0 ? (
                        experts.map((expert: any) => (
                            <div
                                key={expert._id || expert.id}
                                className="flex items-center justify-between group"
                            >
                                <Link
                                    to={`/profile/${expert._id || expert.id}`}
                                    className="flex items-center gap-3 min-w-0 pr-4 outline-none"
                                >
                                    <AvatarImage
                                        src={expert.avatar}
                                        alt={expert.name}
                                        size={40}
                                        className="rounded-full object-cover bg-gray-100 dark:bg-white/10 ring-2 ring-transparent group-hover:ring-primary/20 transition-all"
                                    />
                                    <div className="flex flex-col min-w-0">
                                        <span className="font-['Lexend_Deca'] font-bold text-[14px] text-gray-900 dark:text-gray-100 truncate group-hover:text-primary transition-colors">
                                            {expert.name}
                                        </span>
                                        <span className="font-['Manrope'] font-medium text-[12px] text-gray-500 dark:text-gray-400 truncate">
                                            {expert.followers_count ||
                                                0}{" "}
                                            pengikut
                                        </span>
                                    </div>
                                </Link>
                                <button
                                    onClick={() => handleFollowExpert(expert._id || expert.id)}
                                    className={`px-3.5 py-1.5 rounded-[10px] border font-['Manrope'] text-[12px] font-bold transition-all focus:outline-none ${
                                        expert.is_followed_by_me
                                            ? "border-gray-300 dark:border-white/20 text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20"
                                            : "border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-primary hover:text-primary hover:bg-primary/5"
                                    }`}
                                >
                                    {expert.is_followed_by_me ? "Mengikuti" : "Ikuti"}
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-700 dark:text-gray-400 font-['Manrope'] text-sm font-bold">
                            Belum ada pakar terdaftar.
                        </p>
                    )}
                </div>
            </div>

            {/* Pencarian Populer (Trending Searches) */}
            <div>
                <h3 className="font-['Lexend_Deca'] font-extrabold text-[16px] text-gray-900 dark:text-gray-100 tracking-tight mb-4 flex items-center gap-2">
                    <TrendingUp
                        className="w-4 h-4 text-rose-500"
                        strokeWidth={2.5}
                    />{" "}
                    Sering Dicari
                </h3>
                <div className="flex flex-wrap gap-2.5">
                    {[
                        "Fisika Kuantum",
                        "Limit Trigonometri",
                        "Grammar IELTS",
                        "SBMPTN 2026",
                        "Sistem Pencernaan",
                    ].map((term) => (
                        <button
                            key={term}
                            onClick={() => setSearchQuery(term)}
                            className="px-3.5 py-2.5 bg-white dark:bg-[#1C1A29] hover:bg-primary/5 hover:text-primary hover:border-primary/20 text-gray-600 dark:text-gray-400 rounded-2xl font-['Manrope'] text-[13px] font-bold shadow-sm dark:shadow-none hover:shadow-md hover:-translate-y-0.5 border border-gray-100 dark:border-white/10 transition-all duration-300 truncate max-w-full text-left focus:outline-none"
                        >
                            <Search
                                className="w-3.5 h-3.5 inline-block mr-1.5 opacity-70"
                                strokeWidth={2.5}
                            />{" "}
                            {term}
                        </button>
                    ))}
                </div>
            </div>

            {/* Quick Links */}
            <div className="pt-2 flex flex-wrap gap-x-4 gap-y-2 text-[12px] font-['Manrope'] font-bold text-gray-700 dark:text-gray-500">
                <Link to="/settings/help" className="hover:text-gray-900 dark:hover:text-gray-300 transition-colors">Bantuan</Link>
                <Link to="/status" className="hover:text-gray-900 dark:hover:text-gray-300 transition-colors">Status</Link>
                <Link to="/about" className="hover:text-gray-900 dark:hover:text-gray-300 transition-colors">Tentang Kami</Link>
                <Link to="/careers" className="hover:text-gray-900 dark:hover:text-gray-300 transition-colors">Karir</Link>
                <Link to="/privacy" className="hover:text-gray-900 dark:hover:text-gray-300 transition-colors">Privasi</Link>
                <Link to="/terms" className="hover:text-gray-900 dark:hover:text-gray-300 transition-colors">Ketentuan</Link>
            </div>
        </div>
    );

    // Fetch experts for sidebar
    useEffect(() => {
        const fetchExperts = async () => {
            try {
                const authHeader = isAuthenticated
                    ? {
                          Authorization: `Bearer ${localStorage.getItem("bayu-token") || sessionStorage.getItem("bayu-token")}`,
                      }
                    : {};
                const res = await axios.get("/api/v1/experts", {
                    headers: authHeader,
                });
                setExperts(res.data.data || []);
            } catch (e) {
                console.error("Gagal fetch pakar:", e);
            }
        };
        fetchExperts();
    }, [isAuthenticated]);

    const handleFollowExpert = async (expertId: string) => {
        if (!isAuthenticated) return openAuthModal("login");
        try {
            const token =
                localStorage.getItem("bayu-token") ||
                sessionStorage.getItem("bayu-token");
            const response = await axios.post(
                `/api/v1/users/${expertId}/follow`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` },
                },
            );
            setExperts((prev) =>
                prev.map((ex) => {
                    if ((ex._id || ex.id) === expertId) {
                        return {
                            ...ex,
                            is_followed_by_me:
                                response.data.status === "followed",
                            followers_count:
                                response.data.status === "followed"
                                    ? (ex.followers_count || 0) + 1
                                    : Math.max(
                                          0,
                                          (ex.followers_count || 0) - 1,
                                      ),
                        };
                    }
                    return ex;
                }),
            );
        } catch (e) {
            console.error("Gagal toggle follow pakar:", e);
        }
    };

    const handleLikePost = async (postId: string) => {
        if (!isAuthenticated) return openAuthModal("login");

        setNotes((prev) =>
            prev.map((note) => {
                if ((note._id || note.id) === postId) {
                    const isCurrentlyLiked = note.is_liked || false;
                    return {
                        ...note,
                        likes: isCurrentlyLiked
                            ? Math.max(0, note.likes - 1)
                            : note.likes + 1,
                        likes_count: isCurrentlyLiked
                            ? Math.max(0, (note.likes_count || 0) - 1)
                            : (note.likes_count || 0) + 1,
                        is_liked: !isCurrentlyLiked,
                    };
                }
                return note;
            }),
        );

        try {
            const tk =
                localStorage.getItem("bayu-token") ||
                sessionStorage.getItem("bayu-token");
            await axios.post(
                `/api/v1/posts/${postId}/like`,
                {},
                {
                    headers: { Authorization: `Bearer ${tk}` },
                },
            );
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        const fetchPosts = async () => {
            setIsLoadingNotes(true);
            try {
                const keyword = searchQuery;
                const queryParamsAPI: any = { sort: activeSegment };

                if (keyword !== "") {
                    queryParamsAPI.search = keyword;
                }

                const response = await axios.get("/api/v1/posts", {
                    params: queryParamsAPI,
                });

                setNotes(response.data.data || []);
            } catch (error) {
                // Nah ini! Kalau error dia bakal teriak di sini
                console.error("Pesan Error dari Backend:", error);
            } finally {
                setIsLoadingNotes(false);
            }
        };

        fetchPosts();
    }, [searchQuery, activeSegment]);

    const formattedNotes = notes.map((note) => ({
        ...note,
        id: note._id || note.id,
        author: note.user
            ? {
                  ...note.user,
                  avatar: note.user.avatar || null,
              }
            : {
                  name: "Anonim",
                  avatar: null,
              },
        createdAt: note.created_at,
        thumbnail: note.thumbnail || null,
        views: note.views || 0,
        rating: note.rating || 5,
        description: note.description || (note.plain_content ? note.plain_content.substring(0, 150) + "..." : "Tidak ada deskripsi"),
        mataPelajaran: note.mapel || "Lainnya",
        jenjang: note.jenjang || "-",
        kelas: note.kelas || "-",
        likes: note.likes_count || 0,
        comments: note.comments_count || 0,
    }));

    // Auth modal for guest users
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authTab, setAuthTab] = useState<"login" | "register">("login");

    // Filter Modal & States
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedJenjang, setSelectedJenjang] = useState<string>("Semua");
    const [selectedTopic, setSelectedTopic] = useState<string>("Semua");

    const jenjangList = [
        "Semua",
        "SD",
        "SMP",
        "SMA",
        "Perguruan Tinggi",
        "Umum",
    ];

    const openAuthModal = (tab: "login" | "register") => {
        setAuthTab(tab);
        setShowAuthModal(true);
    };

    // Reveal animations for guest mode
    useEffect(() => {
        if (!isAuthenticated) {
            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add("revealed");
                            observer.unobserve(entry.target);
                        }
                    });
                },
                { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
            );
            document
                .querySelectorAll(".explore-reveal")
                .forEach((el) => observer.observe(el));
            return () => observer.disconnect();
        }
    }, [isAuthenticated, activeSegment]);

    const tabItems = [
        { key: "kategori" as const, label: "Untuk Anda", icon: Sparkles },
        { key: "populer" as const, label: "Terpopuler", icon: TrendingUp },
        { key: "terbaru" as const, label: "Terbaru", icon: Clock },
    ];

    // === SHARED CONTENT ===
    const exploreContent = (
        <div className={!isAuthenticated ? "bg-[#FAFAFA] dark:bg-[#13111C]" : "dark:bg-[#13111C]"}>
            {/* Hero Section — Guest Only */}
            {!isAuthenticated && (
                <div className="relative bg-white dark:bg-[#13111C] pt-28 sm:pt-32 pb-12 sm:pb-16 border-b border-gray-100 dark:border-white/5">
                    <div className="max-w-7xl mx-auto px-6 sm:px-8">
                        <div
                            className="explore-reveal opacity-0 translate-y-4"
                            style={{
                                transition:
                                    "all 0.7s cubic-bezier(0.16, 1, 0.3, 1)",
                            }}
                        >
                            <div className="inline-flex items-center gap-2 text-gray-500 text-xs font-bold tracking-widest uppercase mb-6">
                                <BookOpen className="w-4 h-4 text-gray-400" />
                                Perpustakaan Digital
                            </div>
                            <h1 className="font-['Lexend_Deca'] font-extrabold text-5xl sm:text-6xl text-gray-900 dark:text-gray-100 tracking-tight mb-6 leading-[1.05]">
                                Jelajahi Ribuan{" "}
                                <br className="hidden sm:block" />
                                Catatan Belajar.
                            </h1>
                            <p className="text-gray-700 dark:text-gray-300 font-['Manrope'] text-lg sm:text-xl max-w-2xl leading-relaxed mb-10">
                                Temukan materi terkurasi dari pelajar dan pakar
                                pendidikan <br className="hidden md:block" /> di
                                seluruh Indonesia. Gratis selamanya.
                            </p>
                        </div>

                        {/* Search Bar — Premium Minimalist (Centered Medium Style) */}
                        <div
                            className="explore-reveal opacity-0 translate-y-4 max-w-[720px] mx-auto mt-8"
                            style={{
                                transition:
                                    "all 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.1s",
                            }}
                        >
                            <div className="flex gap-3">
                                <div className="relative flex-1 group">
                                    <Search
                                        className="absolute left-5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-500 group-focus-within:text-gray-900 dark:group-focus-within:text-gray-100 transition-colors"
                                        strokeWidth={2}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Cari preferensi..."
                                        value={searchQuery}
                                        onChange={(e) =>
                                            setSearchQuery(e.target.value)
                                        }
                                        className="w-full pl-12 pr-5 py-4 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 focus:bg-white dark:focus:bg-[#1C1A29] border text-gray-950 dark:text-gray-100 border-transparent focus:border-gray-300 dark:focus:border-white/20 rounded-[14px] font-['Manrope'] text-[15px] font-medium focus:outline-none transition-all placeholder:text-gray-500 shadow-sm"
                                    />
                                </div>
                                <button
                                    onClick={() => setIsFilterOpen(true)}
                                    className="w-14 h-14 bg-gray-900 hover:bg-black text-white rounded-[14px] flex items-center justify-center transition-all shrink-0 shadow-md hover:-translate-y-0.5"
                                >
                                    <Filter
                                        className="w-[18px] h-[18px]"
                                        strokeWidth={2}
                                    />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main 2-Column Container */}
            <div className="w-full flex justify-center pb-12 sm:pb-20">
                <div className="w-full max-w-[1140px] px-0 sm:px-4 md:px-6 flex flex-col lg:flex-row gap-0 lg:gap-10 xl:gap-14 lg:justify-center mx-auto">
                    {/* LEFT COLUMN (Main Feed) */}
                    <div className="flex-1 min-w-0 w-full lg:max-w-[640px] xl:max-w-[700px] pt-10 mx-auto lg:mx-0">
                        {/* Logged-in Header (Seamless Premium Style) */}
                        {isAuthenticated && (
                            <div className="px-6 md:px-0 pb-12 mb-4 w-full">
                                <div className="relative">
                                    <h1 className="text-[36px] sm:text-[48px] font-['Lexend_Deca'] font-black text-gray-900 dark:text-gray-100 tracking-tight leading-none mb-4">
                                        Eksplorasi<span className="text-primary">.</span>
                                    </h1>
                                    <p className="text-gray-500 font-['Manrope'] text-[16px] sm:text-[18px] font-medium max-w-xl mb-8 leading-relaxed">
                                        Temukan materi, topik, dan inspirasi belajar dari seluruh penjuru negeri.
                                    </p>

                                    <div className="flex gap-4 items-center w-full max-w-[620px]">
                                        <div className="relative flex-1 group">
                                            <Search
                                                className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-all duration-300"
                                                strokeWidth={2.5}
                                            />
                                            <input
                                                type="text"
                                                placeholder="Cari materi, topik, atau penulis..."
                                                value={searchQuery}
                                                onChange={(e) =>
                                                    setSearchQuery(e.target.value)
                                                }
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter" && searchQuery.trim()) {
                                                        // Auto-fetch handles this
                                                    }
                                                }}
                                                className="w-full pl-14 pr-6 py-4 bg-white dark:bg-[#1C1A29] border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 rounded-[1.25rem] font-['Manrope'] text-[16px] font-bold text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none transition-all shadow-sm"
                                            />
                                        </div>
                                        <button
                                            onClick={() => setIsFilterOpen(true)}
                                            className="h-[60px] w-[60px] bg-white dark:bg-[#1C1A29] border border-gray-200 dark:border-white/10 hover:border-primary/40 hover:text-primary text-gray-600 dark:text-gray-400 rounded-[1.25rem] flex items-center justify-center transition-all shadow-sm hover:shadow-md active:scale-95 shrink-0"
                                        >
                                            <Filter className="w-5 h-5" strokeWidth={2.5} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Animated Feed Tab Navigation */}
                        <div
                            className={`px-6 md:px-0 w-full mb-8 ${!isAuthenticated ? "border-b border-gray-100 mt-2" : "px-2"}`}
                        >
                            <div
                                className={`${!isAuthenticated ? "explore-reveal opacity-0 translate-y-4" : ""}`}
                                style={{
                                    transition:
                                        "all 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.2s",
                                }}
                            >
                                <div
                                    className={`flex justify-between items-end ${isAuthenticated ? "border-b border-gray-100" : ""}`}
                                >
                                    <div
                                        className={`flex gap-8 overflow-x-auto no-scrollbar relative flex-1`}
                                    >
                                        {tabItems.map((tab) => (
                                            <button
                                                key={tab.key}
                                                onClick={() =>
                                                    setActiveSegment(tab.key)
                                                }
                                                className={`pb-4 relative shrink-0 font-['Lexend_Deca'] text-[15px] transition-colors focus:outline-none flex items-center gap-2 group ${
                                                    activeSegment === tab.key
                                                        ? "text-gray-900 dark:text-gray-100 font-extrabold"
                                                        : "text-gray-500 font-medium hover:text-gray-900 dark:hover:text-gray-200"
                                                }`}
                                            >
                                                <tab.icon
                                                    className={`w-[16px] h-[16px] transition-colors ${activeSegment === tab.key ? "text-gray-900 dark:text-gray-100" : "text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200"}`}
                                                    strokeWidth={
                                                        activeSegment === tab.key
                                                            ? 2.5
                                                            : 2.2
                                                    }
                                                />
                                                <span
                                                    className={`font-['Lexend_Deca'] font-semibold text-[14px] transition-colors ${activeSegment === tab.key ? "text-gray-900 dark:text-gray-100" : "text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200"}`}
                                                >
                                                    {tab.label}
                                                </span>
                                                {activeSegment === tab.key && (
                                                    <div className="absolute -bottom-[1px] left-0 w-full h-[2px] bg-gray-900 rounded-t-full shadow-[0_-1px_6px_rgba(0,0,0,0.2)]"></div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="pb-3 pl-4 flex items-center gap-2 shrink-0">
                                        <button 
                                            onClick={() => setIsMobileExploreDrawerOpen(true)}
                                            className="lg:hidden h-[36px] px-3.5 bg-gray-50/80 dark:bg-[#1C1A29] rounded-full shadow-sm text-[13px] font-['Manrope'] font-bold text-primary flex items-center gap-1.5 transition-colors hover:bg-gray-100 dark:hover:bg-white/5 border border-primary/20"
                                        >
                                            <Sparkles className="w-3.5 h-3.5" /> Tren
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Notes Vertical Feed (Medium Style) */}
                        <div
                            className={`px-6 md:px-0 w-full flex flex-col pb-16`}
                        >
                            {isLoadingNotes ? (
                                <div className="space-y-0">
                                    {[...Array(5)].map((_, i) => (
                                        <NoteCardSkeleton key={i} />
                                    ))}
                                </div>
                            ) : formattedNotes.length > 0 ? (
                                formattedNotes.map((note) => (
                                    <NoteCard
                                        key={note.id}
                                        note={note}
                                        onLike={handleLikePost}
                                    />
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                        <BookOpen className="w-8 h-8 text-gray-500" />
                                    </div>
                                    <h3 className="font-['Lexend_Deca'] font-extrabold text-gray-900 dark:text-gray-100 text-lg mb-2">
                                        Pencarian Tidak Ditemukan
                                    </h3>
                                    <p className="text-gray-600 font-['Manrope'] font-medium">
                                        Coba gunakan kata kunci atau filter
                                        lain.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN (Sidebar) */}
                    <div
                        className={`${!isAuthenticated ? "explore-reveal opacity-0 translate-y-6" : ""} hidden lg:block w-[280px] xl:w-[320px] shrink-0 border-l border-gray-100 dark:border-white/5 pl-6 xl:pl-10`}
                        style={{
                            transition:
                                "all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s",
                        }}
                    >
                        <div
                            className="sticky pt-8 pb-12"
                            style={{
                                top: "min(72px, calc(100vh - 100% - 24px))",
                            }}
                        >
                            {renderRightColumn()}
                        </div>
                    </div>
                </div>
            </div>

            {/* Guest CTA Banner */}
            {!isAuthenticated && (
                <div className="max-w-7xl mx-auto px-6 sm:px-8 mt-16 pb-16">
                    <div
                        className="explore-reveal opacity-0 translate-y-6"
                        style={{
                            transition:
                                "all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s",
                        }}
                    >
                        <div className="relative overflow-hidden bg-gradient-to-br from-primary via-indigo-600 to-purple-700 rounded-[2rem] p-8 sm:p-14 text-center shadow-2xl">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none"></div>
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-fuchsia-500/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl pointer-events-none"></div>

                            <div className="relative z-10">
                                <h3 className="font-['Lexend_Deca'] font-extrabold text-white text-2xl sm:text-3xl mb-3 tracking-tight">
                                    Punya catatan bagus?
                                </h3>
                                <p className="text-white/80 font-['Manrope'] text-sm sm:text-base mb-8 max-w-md mx-auto leading-relaxed">
                                    Bergabung dan bagikan catatan belajarmu ke
                                    ribuan pelajar di seluruh Indonesia. Gratis
                                    selamanya!
                                </p>
                                <div className="flex items-center justify-center gap-4 flex-wrap">
                                    <button
                                        onClick={() =>
                                            openAuthModal("register")
                                        }
                                        className="bg-white text-primary px-8 py-3.5 rounded-full font-bold text-sm hover:bg-gray-50 transition-all shadow-xl hover:-translate-y-0.5 flex items-center gap-2"
                                    >
                                        <Upload className="w-4 h-4" />
                                        Daftar & Upload
                                    </button>
                                    <button
                                        onClick={() => openAuthModal("login")}
                                        className="text-white border-2 border-white/30 px-8 py-3.5 rounded-full font-bold text-sm hover:bg-white/10 transition-all flex items-center gap-2"
                                    >
                                        <LogIn className="w-4 h-4" />
                                        Sudah Punya Akun
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    const filterModalUI = (
        <div
            className={`fixed inset-0 z-[100] flex items-end sm:items-center justify-center pointer-events-none transition-opacity duration-300 ${isFilterOpen ? "opacity-100" : "opacity-0"}`}
        >
            <div
                className={`absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity duration-300 ${isFilterOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
                onClick={() => setIsFilterOpen(false)}
            />
            <div
                className={`relative w-full sm:w-[500px] max-h-[85vh] sm:max-h-[600px] bg-white dark:bg-[#1C1A29] rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-transform duration-300 ${isFilterOpen ? "pointer-events-auto translate-y-0 scale-100" : "pointer-events-none translate-y-full sm:translate-y-4 sm:scale-95"}`}
            >
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/5 bg-white dark:bg-[#1C1A29] z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                            <Filter
                                className="w-[18px] h-[18px] text-primary"
                                strokeWidth={2.5}
                            />
                        </div>
                        <h3 className="font-['Lexend_Deca'] font-extrabold text-[18px] text-gray-900 dark:text-gray-100 tracking-tight">
                            Filter Referensi
                        </h3>
                    </div>
                    <button
                        onClick={() => setIsFilterOpen(false)}
                        className="p-2 -mr-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-full transition-colors focus:outline-none"
                    >
                        <X className="w-5 h-5" strokeWidth={2.5} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar bg-gray-50/50">
                    {/* Tingkat Pendidikan */}
                    <div>
                        <h4 className="font-['Lexend_Deca'] font-bold text-[15px] text-gray-900 dark:text-gray-100 mb-4 flex items-center justify-between">
                            Tingkat Pendidikan
                            {selectedJenjang !== "Semua" && (
                                <span className="text-[11px] font-['Lexend_Deca'] text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-md">
                                    1 Dipilih
                                </span>
                            )}
                        </h4>
                        <div className="flex flex-wrap gap-2.5">
                            {jenjangList.map((jenjang) => (
                                <button
                                    key={jenjang}
                                    onClick={() => setSelectedJenjang(jenjang)}
                                    className={`px-4 py-2.5 rounded-2xl font-['Manrope'] text-[13.5px] font-bold transition-all border ${
                                        selectedJenjang === jenjang
                                            ? "bg-primary text-white border-primary shadow-[0_4px_12px_rgb(93,92,230,0.3)]"
                                            : "bg-white dark:bg-[#1C1A29] text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:border-primary/40 hover:text-primary dark:hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/10 hover:shadow-sm"
                                    }`}
                                >
                                    {jenjang}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Topik Pembelajaran */}
                    <div>
                        <h4 className="font-['Lexend_Deca'] font-bold text-[15px] text-gray-900 mb-4 flex items-center justify-between">
                            Topik Belajar
                            {selectedTopic !== "Semua" && (
                                <span className="text-[11px] font-['Lexend_Deca'] text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-md">
                                    1 Dipilih
                                </span>
                            )}
                        </h4>
                        <div className="flex flex-wrap gap-2.5">
                            <button
                                onClick={() => setSelectedTopic("Semua")}
                                className={`px-4 py-2.5 rounded-2xl font-['Manrope'] text-[13.5px] font-bold transition-all border flex items-center gap-2 ${
                                    selectedTopic === "Semua"
                                        ? "bg-primary text-white border-primary shadow-[0_4px_12px_rgb(93,92,230,0.3)]"
                                        : "bg-white text-gray-600 border-gray-200 hover:border-primary/40 hover:text-primary hover:bg-primary/5 hover:shadow-sm"
                                }`}
                            >
                                ✨ Semua Topik
                            </button>
                            {mataPelajaran.map((subject) => (
                                <button
                                    key={subject.id}
                                    onClick={() => setSelectedTopic(subject.id)}
                                    className={`px-4 py-2.5 rounded-2xl font-['Manrope'] text-[13.5px] font-bold transition-all border flex items-center gap-2 ${
                                        selectedTopic === subject.id
                                            ? "bg-primary text-white border-primary shadow-[0_4px_12px_rgb(93,92,230,0.3)]"
                                            : "bg-white text-gray-600 border-gray-200 hover:border-primary/40 hover:text-primary hover:bg-primary/5 hover:shadow-sm"
                                    }`}
                                >
                                    <span>{subject.icon}</span> {subject.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-5 border-t border-gray-100 bg-white z-10">
                    <div className="flex gap-3">
                        <button
                            onClick={() => {
                                setSelectedJenjang("Semua");
                                setSelectedTopic("Semua");
                            }}
                            className="px-5 py-3.5 rounded-xl font-['Lexend_Deca'] text-[14px] font-extrabold text-gray-500 bg-gray-50 hover:bg-gray-100 hover:text-gray-900 transition-colors w-1/3 border border-gray-200"
                        >
                            Reset
                        </button>
                        <button
                            onClick={() => setIsFilterOpen(false)}
                            className="flex-1 px-5 py-3.5 rounded-xl font-['Lexend_Deca'] text-[14px] font-extrabold text-white bg-primary hover:bg-primary/90 shadow-[0_4px_10px_rgb(93,92,230,0.25)] hover:shadow-[0_8px_20px_rgb(93,92,230,0.35)] hover:-translate-y-0.5 transition-all text-center"
                        >
                            Terapkan Filter
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    // Public: landing page layout with reveal styles
    return (
        <div className="min-h-screen bg-[#FAFAFA]">
            <style>{`
        .explore-reveal.revealed {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
      `}</style>
            <Navbar variant="default" />
            {exploreContent}
            {filterModalUI}
            <Footer />
            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                defaultTab={authTab}
            />

            {/* MOBILE SLIDE-UP DRAWER (Pakar & Tren) */}
            {isMobileExploreDrawerOpen && (
                <div className="lg:hidden fixed inset-0 z-[100] flex items-end">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsMobileExploreDrawerOpen(false)}></div>
                    <div className="relative bg-white dark:bg-[#13111C] w-full h-[85vh] rounded-t-3xl shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-300 pb-safe">
                        <div className="p-5 border-b border-gray-100 dark:border-white/5 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-[#13111C]/95 backdrop-blur z-10 rounded-t-3xl">
                            <span className="font-['Lexend_Deca'] font-extrabold text-[18px] text-gray-900 dark:text-gray-100">Eksplorasi Lanjutan</span>
                            <button onClick={() => setIsMobileExploreDrawerOpen(false)} className="p-2 bg-gray-50 dark:bg-white/5 rounded-full text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors outline-none">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 scroll-smooth pb-20">
                            {renderRightColumn()}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
