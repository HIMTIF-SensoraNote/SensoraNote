import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useState, useEffect, useRef, useMemo } from "react";
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
    Star,
    X,
    ShieldCheck,
    Shield,
    Compass,
    Users,
    Lock as LockIcon,
    ArrowRight,
} from "lucide-react";
import { mataPelajaran } from "../data/mockData";
import axios from "axios";
import { Link, useLocation } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { CustomSelect } from "../components/ui/CustomSelect";
import { formatClassOption } from '../utils/formatEducationLevel';
import { useBookmarks } from "../contexts/BookmarkContext";
import { AuthModal } from "../components/auth-modal";
import { NoteCardSkeleton } from "../components/ui/skeletons";
import { TagList } from "../components/ui/TagList";
import { DefaultThumbnail, AvatarImage } from "../components/ui/DefaultImages";
import { NoteCard } from "../components/NoteCard";
import { useToast } from "../contexts/ToastContext";
import { useTranslation } from "../hooks/useTranslation";

export default function ExplorePage() {
    const { t, language } = useTranslation();
    useDocumentTitle(t('titles.explore'));
    const { isAuthenticated } = useAuth();
    const { isBookmarked, toggleBookmark } = useBookmarks();
    const { showToast } = useToast();

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const tabFromUrl = queryParams.get("tab") as "kategori" | "populer" | "terbaru" | "pengguna" | null;

    const [activeSegment, setActiveSegment] = useState<
        "kategori" | "populer" | "terbaru" | "pengguna"
    >(() => {
        if (tabFromUrl && ["kategori", "populer", "terbaru", "pengguna"].includes(tabFromUrl)) {
            return tabFromUrl;
        }
        return (
            (sessionStorage.getItem("exploreTab") as
                | "kategori"
                | "populer"
                | "terbaru"
                | "pengguna") || "kategori"
        );
    });

    // Sort untuk popular dan terbaru
    const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

    useEffect(() => {
        sessionStorage.setItem("exploreTab", activeSegment);
    }, [activeSegment]);
    const searchTermFromUrl = queryParams.get("q") || "";
    const [searchQuery, setSearchQuery] = useState(searchTermFromUrl);
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchTermFromUrl);

    useEffect(() => {
        setSearchQuery(searchTermFromUrl);
        setDebouncedSearchQuery(searchTermFromUrl);
    }, [searchTermFromUrl]);

    // Update activeSegment when tab URL param changes
    useEffect(() => {
        if (tabFromUrl && ["kategori", "populer", "terbaru", "pengguna"].includes(tabFromUrl)) {
            setActiveSegment(tabFromUrl);
        }
    }, [tabFromUrl]);

    // --- STATE UNTUK AUTOCOMPLETE SEARCH ---
    const searchInputRef = useRef<HTMLDivElement>(null);
    const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [notes, setNotes] = useState<any[]>([]);
    const [isLoadingNotes, setIsLoadingNotes] = useState(true);
    const [experts, setExperts] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    // User search state
    const [searchedUsers, setSearchedUsers] = useState<any[]>([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const [usersPage, setUsersPage] = useState(1);
    const [hasMoreUsers, setHasMoreUsers] = useState(true);

    // Mobile drawer state
    const [isMobileExploreDrawerOpen, setIsMobileExploreDrawerOpen] = useState(false);

    // Content type filter (client-side only)
    const [contentTypeFilter, setContentTypeFilter] = useState<'semua' | 'catatan_terverifikasi' | 'orang_terverifikasi'>('semua');

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
                    {t('explore.expert_education')}
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
                                            {t('explore.followers')}
                                        </span>
                                    </div>
                                </Link>
                                <button
                                    onClick={() =>
                                        handleFollowExpert(
                                            expert._id ||
                                            expert.id,
                                        )
                                    }
                                    className={`px-3.5 py-1.5 rounded-[10px] border font-['Manrope'] text-[12px] font-bold transition-all focus:outline-none ${expert.is_followed_by_me
                                            ? "border-gray-300 dark:border-white/10 text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10"
                                            : expert.is_follow_pending
                                                ? "border-gray-200 dark:border-white/10 text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-white/5 cursor-default"
                                                : "border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-primary hover:text-primary hover:bg-primary/5"
                                        }`}
                                >
                                    {expert.is_followed_by_me
                                        ? t('explore.following')
                                        : expert.is_follow_pending
                                            ? t('explore.requested')
                                            : t('explore.follow')}
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-700 dark:text-gray-400 font-['Manrope'] text-sm font-bold">
                            {t('explore.no_experts')}
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
                    {t('explore.trending_searches')}
                </h3>
                <div className="flex flex-wrap gap-2.5">
                    {[
                        { key: "Fisika Kuantum", translateKey: "explore.trending_tag_1" },
                        { key: "Limit Trigonometri", translateKey: "explore.trending_tag_2" },
                        { key: "Grammar IELTS", translateKey: "explore.trending_tag_3" },
                        { key: "SBMPTN 2026", translateKey: "explore.trending_tag_4" },
                        { key: "Sistem Pencernaan", translateKey: "explore.trending_tag_5" },
                    ].map((term) => (
                        <button
                            key={term.key}
                            onClick={() => setSearchQuery(term.key)}
                            className="px-3.5 py-2.5 bg-white dark:bg-[#1C1A29] hover:bg-primary/5 hover:text-primary hover:border-primary/20 text-gray-600 dark:text-gray-400 rounded-2xl font-['Manrope'] text-[13px] font-bold shadow-sm dark:shadow-none hover:shadow-md hover:-translate-y-0.5 border border-gray-100 dark:border-white/10 transition-all duration-300 truncate max-w-full text-left focus:outline-none"
                        >
                            <Search
                                className="w-3.5 h-3.5 inline-block mr-1.5 opacity-70"
                                strokeWidth={2.5}
                            />{" "}
                            {t(term.translateKey) !== term.translateKey ? t(term.translateKey) : term.key}
                        </button>
                    ))}
                </div>
            </div>

            {/* Quick Links */}
            <div className="pt-2 flex flex-wrap gap-x-4 gap-y-2 text-[12px] font-['Manrope'] font-bold text-gray-700 dark:text-gray-500">
                <Link to="/settings/help" className="hover:text-gray-900 dark:hover:text-gray-300 transition-colors">{t('footer.help') !== 'footer.help' ? t('footer.help') : 'Bantuan'}</Link>
                <Link to="/status" className="hover:text-gray-900 dark:hover:text-gray-300 transition-colors">{t('footer.status') !== 'footer.status' ? t('footer.status') : 'Status'}</Link>
                <Link to="/about" className="hover:text-gray-900 dark:hover:text-gray-300 transition-colors">{t('footer.about_us') !== 'footer.about_us' ? t('footer.about_us') : 'Tentang Kami'}</Link>
                <Link to="/careers" className="hover:text-gray-900 dark:hover:text-gray-300 transition-colors">{t('footer.careers') !== 'footer.careers' ? t('footer.careers') : 'Karir'}</Link>
                <Link to="/privacy" className="hover:text-gray-900 dark:hover:text-gray-300 transition-colors">{t('footer.privacy') !== 'footer.privacy' ? t('footer.privacy') : 'Privasi'}</Link>
                <Link to="/terms" className="hover:text-gray-900 dark:hover:text-gray-300 transition-colors">{t('footer.terms') !== 'footer.terms' ? t('footer.terms') : 'Ketentuan'}</Link>
            </div>
        </div>
    );
    const [isLoadingMoreUsers, setIsLoadingMoreUsers] = useState(false);

// 1. Tutup dropdown saat klik di luar kotak pencarian
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
                setIsSuggestionOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // 2. Filter Prediksi dengan AMAN dan EFISIEN (Optimasi useMemo)
    const searchData = useMemo(() => {
        const safeNotes = Array.isArray(notes) ? notes : [];
        const availableSubjects = safeNotes.map((note: any) => note?.mataPelajaran).filter(Boolean);
        const availableTitles = safeNotes.map((note: any) => note?.title).filter(Boolean); 
        
        return {
            uniqueKeywords: Array.from(new Set([...availableSubjects, ...availableTitles])),
            topRealSearches: Array.from(new Set(availableSubjects)).slice(0, 5)
        };
    }, [notes]);

    useEffect(() => {
        if (searchQuery.trim().length > 0) {
            const filtered = searchData.uniqueKeywords.filter(item => 
                String(item).toLowerCase().includes(searchQuery.toLowerCase())
            );
            setSuggestions(filtered.slice(0, 5));
        } else {
            setSuggestions(searchData.topRealSearches as string[]); 
        }
    }, [searchQuery, searchData]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);


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

        const previousExperts = [...experts];
        const previousSearchedUsers = [...searchedUsers];

        try {
            const token =
                localStorage.getItem("bayu-token") ||
                sessionStorage.getItem("bayu-token");
            const res = await axios.post(
                `/api/v1/users/${expertId}/follow`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` },
                },
            );

            const status = res.data.status;
            
            const updateList = (list: any[]) => list.map(u => {
                if ((u._id || u.id) === expertId) {
                    if (status === 'unfollowed') {
                        return { 
                            ...u, 
                            is_followed_by_me: false, 
                            is_follow_pending: false,
                            followers_count: Math.max(0, (u.followers_count || 0) - 1)
                        };
                    } else if (status === 'pending') {
                        return { ...u, is_followed_by_me: false, is_follow_pending: true };
                    } else {
                        return { 
                            ...u, 
                            is_followed_by_me: true, 
                            is_follow_pending: false,
                            followers_count: (u.followers_count || 0) + 1
                        };
                    }
                }
                return u;
            });

            setExperts(prev => updateList(prev));
            setSearchedUsers(prev => updateList(prev));

            if (status === 'unfollowed') showToast("Berhenti mengikuti", "info");
            else if (status === 'pending') showToast("Permintaan mengikuti dikirim", "success");
            else showToast("Berhasil mengikuti", "success");

        } catch (e) {
            console.error("Gagal toggle follow:", e);
            setExperts(previousExperts);
            setSearchedUsers(previousSearchedUsers);
            showToast("Gagal memproses permintaan", "error");
        }
    };

    const handleLikePost = async (postId: string) => {
        if (!isAuthenticated) return openAuthModal("login");

        const previousNotes = [...notes]; // Simpan state awal untuk rollback

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
            setNotes(previousNotes); // Rollback jika error
        }
    };

    // Filter Modal & States
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedJenjang, setSelectedJenjang] = useState<string>("Semua");
    const [selectedKelas, setSelectedKelas] = useState<string>("Semua");
    
    // Tag Filter States
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState("");
    const [isTagSuggestionsOpen, setIsTagSuggestionsOpen] = useState(false);
    const filterTagInputRef = useRef<HTMLDivElement>(null);

    // Dynamic Kelas List based on Jenjang
    const getKelasList = (jenjang: string) => {
        switch (jenjang) {
            case "SD": return ["1", "2", "3", "4", "5", "6"];
            case "SMP": return ["7", "8", "9"];
            case "SMA": return ["10", "11", "12"];
            case "Perguruan Tinggi": return ["D3", "D4", "S1", "S2", "S3"];
            default: return [];
        }
    };

    useEffect(() => {
        setSelectedKelas("Semua");
    }, [selectedJenjang]);

    const filterTagSuggestions = useMemo(() => {
        if (!tagInput.trim()) return [];
        return searchData.uniqueKeywords
            .filter(tag => String(tag).toLowerCase().includes(tagInput.toLowerCase()) && !selectedTags.includes(String(tag)))
            .slice(0, 5);
    }, [tagInput, searchData.uniqueKeywords, selectedTags]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (filterTagInputRef.current && !filterTagInputRef.current.contains(event.target as Node)) {
                setIsTagSuggestionsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchPosts = async (pageNum: number, isReset: boolean = false) => {
        if (isReset) {
            setIsLoadingNotes(true);
        } else {
            setIsLoadingMore(true);
        }
        
        try {
            const keyword = debouncedSearchQuery;

            const queryParamsAPI: any = {
                sort: activeSegment,
                order: sortOrder,
                page: pageNum,
                limit: 12
            };

            if (keyword !== "") {
                queryParamsAPI.search = keyword;
            }

            if (selectedJenjang !== "Semua") {
                queryParamsAPI.jenjang = selectedJenjang;
            }

            if (selectedKelas !== "Semua") {
                queryParamsAPI.kelas = selectedKelas;
            }

            if (selectedTags.length > 0) {
                queryParamsAPI.tags = selectedTags.join(',');
            }

            if (contentTypeFilter === 'catatan_terverifikasi') {
                queryParamsAPI.is_verified = true;
            }

            const response = await axios.get("/api/v1/posts", {
                params: queryParamsAPI,
            });

            const newData = response.data.data || [];
            
            if (isReset || pageNum === 1) {
                setNotes(newData);
            } else {
                setNotes((prev) => [...prev, ...newData]);
            }

            if (response.data.meta) {
                setHasMore(response.data.meta.has_more);
            } else {
                setHasMore(newData.length === 12);
            }
        } catch (error) {
            console.error("Pesan Error dari Backend:", error);
        } finally {
            setIsLoadingNotes(false);
            setIsLoadingMore(false);
        }
    };

    useEffect(() => {
        setPage(1);
        fetchPosts(1, true);
    }, [debouncedSearchQuery, activeSegment, sortOrder, selectedJenjang, selectedKelas, selectedTags, contentTypeFilter]);

    // Fetch users when Pengguna tab is active and search query changes
    const fetchUsers = async (pageNum: number, isReset: boolean = false) => {
        if (isReset) setIsLoadingUsers(true);
        else setIsLoadingMoreUsers(true);

        try {
            const authHeader = isAuthenticated
                ? { Authorization: `Bearer ${localStorage.getItem("bayu-token") || sessionStorage.getItem("bayu-token")}` }
                : {};
            const queryParamsAPI: any = {
                page: pageNum,
                limit: 12
            };

            if (debouncedSearchQuery !== "") {
                queryParamsAPI.q = debouncedSearchQuery;
            }

            if (contentTypeFilter === 'orang_terverifikasi') {
                queryParamsAPI.role = 'admin,pakar';
            }

            const res = await axios.get("/api/v1/users/search", {
                headers: authHeader,
                params: queryParamsAPI,
            });
            
            const newData = res.data.data || [];
            
            if (isReset || pageNum === 1) {
                setSearchedUsers(newData);
            } else {
                setSearchedUsers(prev => [...prev, ...newData]);
            }

            if (res.data.meta) {
                setHasMoreUsers(res.data.meta.has_more);
            } else {
                setHasMoreUsers(newData.length === 12);
            }
        } catch (e) {
            console.error("Gagal search user:", e);
            if (isReset) setSearchedUsers([]);
        } finally {
            setIsLoadingUsers(false);
            setIsLoadingMoreUsers(false);
        }
    };

    useEffect(() => {
        if (activeSegment === 'pengguna') {
            setUsersPage(1);
            fetchUsers(1, true);
        }
    }, [debouncedSearchQuery, activeSegment, contentTypeFilter, isAuthenticated]);

    useEffect(() => {
        if (page > 1 && activeSegment !== 'pengguna') {
            fetchPosts(page, false);
        }
    }, [page]);

    useEffect(() => {
        if (usersPage > 1 && activeSegment === 'pengguna') {
            fetchUsers(usersPage, false);
        }
    }, [usersPage]);

    useEffect(() => {
        const handleScroll = (e: Event) => {
            const target = e.target as HTMLElement | Document;
            let isBottom = false;

            if (target === document) {
                isBottom = window.innerHeight + document.documentElement.scrollTop + 300 >= document.documentElement.offsetHeight;
            } else {
                const el = target as HTMLElement;
                isBottom = el.scrollHeight - el.scrollTop - el.clientHeight <= 300;
            }

            if (isBottom) {
                if (activeSegment === 'pengguna') {
                    if (!isLoadingMoreUsers && hasMoreUsers && !isLoadingUsers) {
                        setUsersPage((prev) => prev + 1);
                    }
                } else {
                    if (!isLoadingMore && hasMore && !isLoadingNotes) {
                        setPage((prev) => prev + 1);
                    }
                }
            }
        };

        const scrollContainer = document.getElementById("main-scroll-container");
        const elementToObserve = scrollContainer || window;

        elementToObserve.addEventListener("scroll", handleScroll);
        return () => scrollContainer?.removeEventListener("scroll", handleScroll as EventListener);
    }, [isLoadingMore, hasMore, isLoadingNotes, isLoadingMoreUsers, hasMoreUsers, isLoadingUsers, activeSegment]);

    const formattedNotes = useMemo(() => {
        let result = notes.map((note) => ({
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
            description: note.description || (note.plain_content ? note.plain_content.substring(0, 150) + "..." : t('home.no_description')),
            mataPelajaran: note.mapel || "Lainnya",
            jenjang: note.jenjang || "-",
            kelas: note.kelas || "-",
            likes: note.likes_count || 0,
            comments: note.comments_count || 0,
        }));

        // Client-Side Local Filtering for strict matching
        if (selectedJenjang !== "Semua") {
            result = result.filter(note => note.jenjang === selectedJenjang);
        }

        if (selectedKelas !== "Semua") {
            result = result.filter(note => String(note.kelas) === String(selectedKelas));
        }

        if (selectedTags.length > 0) {
            result = result.filter(note => {
                const mapelMatches = selectedTags.some(tag => tag.toLowerCase() === (note.mataPelajaran || "").toLowerCase());
                const tagsMatches = (note.tags || []).some((tag: string) => selectedTags.some(t => t.toLowerCase() === tag.toLowerCase()));
                return mapelMatches || tagsMatches;
            });
        }

        return result;
    }, [notes, selectedJenjang, selectedKelas, selectedTags]);

    // Auth modal for guest users
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authTab, setAuthTab] = useState<"login" | "register">("login");



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
        { key: "kategori" as const, label: t('explore.for_you'), icon: Sparkles },
        { key: "populer" as const, label: t('explore.popular'), icon: TrendingUp },
        { key: "terbaru" as const, label: t('explore.newest'), icon: Clock },
        { key: "pengguna" as const, label: t('explore.users'), icon: Users },
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
                            <div className="inline-flex items-center gap-2 text-gray-700 text-xs font-bold tracking-widest uppercase mb-6">
                                <BookOpen className="w-4 h-4 text-gray-600" />
                                {t('explore.digital_library')}
                            </div>
                            <h1 className="font-['Lexend_Deca'] font-extrabold text-5xl sm:text-6xl text-gray-900 dark:text-gray-100 tracking-tight mb-6 leading-[1.05]">
                                {t('explore.hero_title')}
                            </h1>
                            <p className="text-gray-700 font-['Manrope'] text-lg sm:text-xl max-w-2xl leading-relaxed mb-10">
                                {t('explore.hero_subtitle')}
                            </p>
                        </div>

                        {/* Search Bar — Premium Minimalist (Centered Medium Style) dengan Autocomplete */}
                        <div
                            className="explore-reveal opacity-0 translate-y-4 max-w-[720px] mx-auto mt-8"
                            style={{ transition: "all 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.1s" }}
                        >
                            <div className="flex gap-3">
                                {/* Wrapper Input & Dropdown (Pakai ref di sini agar klik di luar menutup dropdown) */}
                                <div className="relative flex-1 group" ref={searchInputRef}>

                                    {/* Icon Search */}
                                    <Search
                                        className={`absolute left-5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] transition-colors duration-300 ${isSuggestionOpen ? 'text-primary' : 'text-gray-500 group-focus-within:text-primary'}`}
                                        strokeWidth={2}
                                    />

                                    {/* Input Field */}
                                    <input
                                        type="text"
                                        placeholder={t('explore.search_placeholder')}
                                        value={searchQuery}
                                        onChange={(e) => {setSearchQuery(e.target.value); setIsSuggestionOpen(true);}}
                                        onFocus={() => setIsSuggestionOpen(true)}
                                        onClick={() => setIsSuggestionOpen(true)}
                                        className="w-full pl-12 pr-12 py-4 bg-white dark:bg-[#1C1A29] hover:bg-gray-50 dark:hover:bg-white/5 focus:bg-white dark:focus:bg-[#1C1A29] border text-gray-950 dark:text-gray-100 border-gray-200 dark:border-white/10 focus:border-primary/30 rounded-[14px] font-['Manrope'] text-[15px] font-medium focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all duration-300 shadow-sm placeholder:text-gray-500"
                                    />

                                    {/* Tombol Clear (X) - Muncul saat ada teks */}
                                    {searchQuery && (
                                        <button
                                            onClick={() => setSearchQuery("")}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-800 transition-colors"
                                        >
                                            <X className="w-[18px] h-[18px]" strokeWidth={2} />
                                        </button>
                                    )}

                                    {/* --- DROPDOWN SUGGESTIONS --- */}
                                    {isSuggestionOpen && suggestions.length > 0 && (
                                        <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white dark:bg-[#1C1A29] border border-gray-100 dark:border-white/5 rounded-[14px] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                            {/* Header */}
                                            <div className="px-5 py-3 text-[11px] font-bold text-gray-600 uppercase tracking-wider bg-gray-50/80 border-b border-gray-100 flex items-center gap-1.5">
                                                {searchQuery.trim() === "" ? (
                                                    <><TrendingUp className="w-3.5 h-3.5 text-primary" /> {t('explore.trending_searches')}</>
                                                ) : (
                                                    <><Search className="w-3.5 h-3.5" /> {t('explore.search_prediction')}</>
                                                )}
                                            </div>

                                            {/* List */}
                                            <ul className="max-h-64 overflow-y-auto no-scrollbar py-1.5">
                                                {suggestions.map((suggestion, index) => (
                                                    <li key={index}>
                                                        <button
                                                            onClick={() => {
                                                                setSearchQuery(suggestion);
                                                                setIsSuggestionOpen(false); // Tutup saat dipilih
                                                            }}
                                                            className="w-full text-left px-5 py-3 text-[14px] font-['Manrope'] font-medium text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors flex items-center gap-3"
                                                        >
                                                            <Search className="w-[15px] h-[15px] text-gray-600" strokeWidth={2} />
                                                            {suggestion}
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {/* ---------------------------- */}
                                </div>

                                {/* Tombol Filter (Bawaan Kode Kakak) */}
                                <button
                                    onClick={() => setIsFilterOpen(true)}
                                    className="w-[58px] h-[58px] bg-gray-900 hover:bg-black text-white rounded-[14px] flex items-center justify-center transition-all shrink-0 shadow-md hover:-translate-y-0.5"
                                >
                                    <Filter className="w-[18px] h-[18px]" strokeWidth={2} />
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
                                        {t('explore.title')}<span className="text-primary">.</span>
                                    </h1>
                                    <p className="text-gray-500 dark:text-gray-400 font-['Manrope'] text-[16px] sm:text-[18px] font-medium max-w-xl mb-8 leading-relaxed">
                                        {t('explore.subtitle')}
                                    </p>

                                    <div className="flex gap-4 items-center w-full max-w-[620px]">
                                        <div className="relative flex-1 group">
                                            <Search
                                                className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-primary transition-all duration-300"
                                                strokeWidth={2.5}
                                            />
                                            <input
                                                type="text"
                                                placeholder={t('explore.search_placeholder')}
                                                value={searchQuery}
                                                onChange={(e) => {
                                                    setSearchQuery(e.target.value);
                                                    setIsSuggestionOpen(true);
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter" && searchQuery.trim()) {
                                                        setIsSuggestionOpen(false);
                                                    }
                                                }}
                                                onFocus={() => setIsSuggestionOpen(true)}
                                                onClick={() => setIsSuggestionOpen(true)}
                                                className="w-full pl-14 pr-6 py-4 bg-white dark:bg-[#1C1A29] border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 rounded-[1.25rem] font-['Manrope'] text-[16px] font-bold text-gray-900 dark:text-gray-100 placeholder:text-gray-450 dark:placeholder:text-gray-500 focus:outline-none transition-all shadow-sm dark:shadow-none"
                                            />
                                        </div>
                                        <button
                                            onClick={() => setIsFilterOpen(true)}
                                            className="h-[60px] w-[60px] bg-white dark:bg-[#1C1A29] border border-gray-200 dark:border-white/10 hover:border-primary/40 hover:text-primary text-gray-600 dark:text-gray-400 rounded-[1.25rem] flex items-center justify-center transition-all shadow-sm dark:shadow-none hover:shadow-md active:scale-95 shrink-0"
                                        >
                                            <Filter className="w-5 h-5" strokeWidth={2.5} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Animated Feed Tab Navigation */}
                        <div className={`px-6 md:px-0 w-full mb-8 ${!isAuthenticated ? "border-b border-gray-100 dark:border-white/5 mt-2" : "px-2"}`}>
                            <div className={`${!isAuthenticated ? "explore-reveal opacity-0 translate-y-4" : ""}`} style={{ transition: "all 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.2s" }}>

                                <div className={`flex justify-between items-end ${isAuthenticated ? "border-b border-gray-100 dark:border-white/5" : ""}`}>

                                    {/* Bagian Kiri: Tab Navigasi (Untuk Anda, Terpopuler, dsb) */}
                                    <div className={`flex gap-8 overflow-x-auto no-scrollbar relative flex-1`}>
                                        {tabItems.map((tab) => (
                                            <button
                                                key={tab.key}
                                                onClick={() => setActiveSegment(tab.key)}
                                                className={`pb-4 relative shrink-0 font-['Lexend_Deca'] text-[15px] transition-colors focus:outline-none flex items-center gap-2 group ${activeSegment === tab.key ? "text-gray-900 dark:text-gray-100 font-extrabold" : "text-gray-500 dark:text-gray-400 font-medium hover:text-gray-900 dark:hover:text-gray-200"
                                                    }`}
                                            >
                                                <tab.icon className={`w-[16px] h-[16px] transition-colors ${activeSegment === tab.key ? "text-gray-900 dark:text-gray-100" : "text-gray-500 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-300"}`} strokeWidth={activeSegment === tab.key ? 2.5 : 2.2} />
                                                {tab.label}
                                                {activeSegment === tab.key && (
                                                    <div className="absolute -bottom-[1px] left-0 w-full h-[2px] bg-gray-900 dark:bg-primary rounded-t-full shadow-[0_-1px_6px_rgba(0,0,0,0.2)]"></div>
                                                )}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Bagian Kanan: Dropdown Filter Order */}
                                    <div className="pb-3 pl-4 flex items-center gap-2 shrink-0 relative z-20">
                                        <div className="hidden sm:block w-[140px]">
                                        <CustomSelect
                                            value={sortOrder}
                                            onChange={(val: any) => setSortOrder(val as "desc" | "asc")}
                                            options={[
                                                { value: "desc", label: t('explore.newest') },
                                                { value: "asc", label: t('explore.oldest') },
                                            ]}
                                            className="bg-gray-50/80 dark:bg-[#1C1A29] !border-none !rounded-full shadow-sm text-sm font-['Manrope'] font-bold text-gray-700 dark:text-gray-300"
                                        />
                                    </div>

                                </div>

                            </div>
                        </div>
                        </div>

                        {/* Notes Vertical Feed OR User Cards */}
                        <div
                            className={`px-6 md:px-0 w-full flex flex-col pb-16`}
                        >
                            {activeSegment === 'pengguna' ? (
                                /* === USER SEARCH RESULTS === */
                                isLoadingUsers ? (
                                    <div className="space-y-4 pt-4">
                                        {[...Array(5)].map((_, i) => (
                                            <div key={`users-skeleton-${i}`} className="flex items-center gap-4 p-5 rounded-3xl bg-white dark:bg-[#1C1A29] border border-gray-100 dark:border-white/5 animate-pulse shadow-sm">
                                                <div className="w-[60px] h-[60px] rounded-full bg-gray-200 dark:bg-white/10 shrink-0"></div>
                                                <div className="flex-1 space-y-2.5">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-5 bg-gray-200 dark:bg-white/10 rounded-lg w-32"></div>
                                                        <div className="h-5 bg-gray-200 dark:bg-white/10 rounded-lg w-16"></div>
                                                    </div>
                                                    <div className="h-3 bg-gray-100 dark:bg-white/5 rounded-lg w-24"></div>
                                                    <div className="h-3 bg-gray-100 dark:bg-white/5 rounded-lg w-40"></div>
                                                </div>
                                                <div className="w-24 h-10 bg-gray-200 dark:bg-white/10 rounded-xl"></div>
                                            </div>
                                        ))}
                                    </div>
                                ) : searchedUsers.length > 0 ? (
                                    <div className="space-y-3 pt-4">
                                        {searchedUsers.map((u: any) => {
                                            const userId = u._id || u.id;
                                            return (
                                                <div
                                                    key={userId + '_' + Math.random().toString(36).substr(2, 5)}
                                                    className="flex items-center gap-4 p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#1C1A29] border border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-[#221f30] transition-colors duration-200 group"
                                                >
                                                    {/* Avatar Column */}
                                                    <Link to={`/profile/${userId}`} className="shrink-0 relative">
                                                        <AvatarImage
                                                            src={u.avatar}
                                                            alt={u.name}
                                                            size={56}
                                                            className="rounded-full object-cover bg-gray-100 dark:bg-white/10"
                                                        />
                                                    </Link>

                                                    {/* Content Column */}
                                                    <div className="flex-1 min-w-0 flex flex-col justify-center py-1">
                                                        <Link to={`/profile/${userId}`} className="block">
                                                            <div className="flex items-center gap-1.5 mb-0.5">
                                                                <h4 className="font-['Lexend_Deca'] font-extrabold text-[16px] text-gray-900 dark:text-gray-100 truncate group-hover:underline">
                                                                    {u.name || u.username || "Anonim"}
                                                                </h4>
                                                                {u.is_private && (
                                                                    <LockIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                                                )}
                                                                {u.role === 'admin' && (
                                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold text-[12px] border border-purple-100 dark:border-purple-500/20" title="Admin">
                                                                        <Shield className="w-3.5 h-3.5" /> {t('profile.admin_badge') || 'Admin'}
                                                                    </span>
                                                                )}
                                                                {u.role === 'pakar' && (
                                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[12px] border border-emerald-100 dark:border-emerald-500/20" title="Pakar Terverifikasi">
                                                                        <ShieldCheck className="w-3.5 h-3.5" /> {t('profile.expert_badge') || 'Pakar'}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="font-['Manrope'] text-[14px] text-gray-500 dark:text-gray-400 font-medium truncate mb-1">
                                                                @{u.username || '—'}
                                                            </p>
                                                        
                                                            {u.bio && (
                                                                <p className="font-['Manrope'] text-[14px] text-gray-800 dark:text-gray-200 leading-snug break-words mb-2 line-clamp-2">
                                                                    {u.bio}
                                                                </p>
                                                            )}
                                                            <div className="flex items-center gap-4 font-['Manrope'] text-[13px] text-gray-500 dark:text-gray-400 font-medium">
                                                                <div className="flex items-center gap-1.5 hover:underline">
                                                                    <span><strong className="font-bold text-gray-900 dark:text-gray-100">{u.followers_count || 0}</strong> {t('explore.followers_count')}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1.5 hover:underline">
                                                                    <span><strong className="font-bold text-gray-900 dark:text-gray-100">{u.posts_count || 0}</strong> {t('explore.posts_count')}</span>
                                                                </div>
                                                            </div>
                                                        </Link>
                                                    </div>

                                                    {/* Follow Button Column */}
                                                    <div className="shrink-0 ml-2">
                                                        <button
                                                            onClick={() => handleFollowExpert(userId)}
                                                            className={`px-4 sm:px-5 py-1.5 rounded-full font-['Manrope'] text-[14px] font-bold transition-all focus:outline-none shrink-0 border ${
                                                                u.is_followed_by_me
                                                                    ? "border-gray-200 dark:border-white/20 text-gray-900 dark:text-gray-100 bg-transparent hover:border-red-200 hover:text-red-500 hover:bg-red-50 dark:hover:border-red-500/30 dark:hover:text-red-400 dark:hover:bg-red-500/10 group/btn"
                                                                    : u.is_follow_pending
                                                                        ? "border-gray-200 dark:border-white/10 text-gray-400 dark:text-gray-500 bg-transparent cursor-default"
                                                                        : "border-transparent text-white bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-black dark:hover:bg-gray-200 shadow-sm"
                                                            }`}
                                                        >
                                                            {u.is_followed_by_me ? (
                                                                <span className="group-hover/btn:hidden">{t('explore.following')}</span>
                                                            ) : u.is_follow_pending ? (
                                                                <span>{t('explore.requested')}</span>
                                                            ) : (
                                                                <span>{t('explore.follow')}</span>
                                                            )}
                                                            {u.is_followed_by_me && (
                                                                <span className="hidden group-hover/btn:inline">{t('explore.unfollow')}</span>
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {isLoadingMoreUsers && (
                                            <div className="space-y-4 pt-2">
                                                {[...Array(3)].map((_, i) => (
                                                    <div key={`more-users-${i}`} className="flex items-center gap-4 p-5 rounded-3xl bg-white dark:bg-[#1C1A29] border border-gray-100 dark:border-white/5 animate-pulse shadow-sm">
                                                        <div className="w-[64px] h-[64px] rounded-full bg-gray-200 dark:bg-white/10 shrink-0"></div>
                                                        <div className="flex-1 space-y-2.5">
                                                            <div className="flex items-center gap-2">
                                                                <div className="h-5 bg-gray-200 dark:bg-white/10 rounded-lg w-32"></div>
                                                                <div className="h-5 bg-gray-200 dark:bg-white/10 rounded-lg w-16"></div>
                                                            </div>
                                                            <div className="h-3 bg-gray-100 dark:bg-white/5 rounded-lg w-24"></div>
                                                            <div className="h-3 bg-gray-100 dark:bg-white/5 rounded-lg w-40"></div>
                                                        </div>
                                                        <div className="w-24 h-10 bg-gray-200 dark:bg-white/10 rounded-xl"></div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-20 text-center">
                                        <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                                            <Users className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                                        </div>
                                        <h3 className="font-['Lexend_Deca'] font-bold text-gray-900 dark:text-gray-100 text-lg mb-2">
                                            {debouncedSearchQuery ? t('explore.user_not_found') : t('explore.search_user')}
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400 font-['Manrope']">
                                            {debouncedSearchQuery
                                                ? t('explore.try_other_user_keywords')
                                                : t('explore.type_username')}
                                        </p>
                                    </div>
                                )
                            ) : (isLoadingNotes ? (
                                <div className="space-y-0">
                                    {[...Array(5)].map((_, i) => (
                                        <NoteCardSkeleton key={i} />
                                    ))}
                                </div>
                            ) : formattedNotes.length > 0 ? (
                                <>
                                    {formattedNotes.map((note, i) => (
                                        <NoteCard
                                            key={note.id + '_' + Math.random().toString(36).substr(2, 5)}
                                            note={note}
                                            onLike={handleLikePost}
                                            className={!isAuthenticated ? "explore-reveal opacity-0 translate-y-4" : ""}
                                        />
                                    ))}
                                    
                                    {isLoadingMore && (
                                        <>
                                            {[...Array(3)].map((_, i) => (
                                                <NoteCardSkeleton key={`more-${i}`} />
                                            ))}
                                        </>
                                    )}
                                    
                                    {!hasMore && formattedNotes.length > 0 && (
                                        <div className="py-8 text-center">
                                            <p className="text-gray-600 dark:text-gray-500 font-['Manrope'] text-[13px] font-medium">{t('explore.seen_all_notes')}</p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                                        <BookOpen className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                                    </div>
                                    <h3 className="font-['Lexend_Deca'] font-bold text-gray-900 dark:text-gray-100 text-lg mb-2">
                                        {t('explore.search_not_found')}
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400 font-['Manrope']">
                                        {t('explore.try_other_keywords')}
                                    </p>
                                </div>
                            ))}
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
                                    {t('explore.got_good_notes')}
                                </h3>
                                <p className="text-white/80 font-['Manrope'] text-sm sm:text-base mb-8 max-w-md mx-auto leading-relaxed">
                                    {t('explore.join_and_share')}
                                </p>
                                <div className="flex items-center justify-center gap-4 flex-wrap">
                                    <button
                                        onClick={() =>
                                            openAuthModal("register")
                                        }
                                        className="bg-white text-primary px-8 py-3.5 rounded-full font-bold text-sm hover:bg-gray-50 transition-all shadow-xl hover:-translate-y-0.5 flex items-center gap-2"
                                    >
                                        <Upload className="w-4 h-4" />
                                        {t('explore.register_upload')}
                                    </button>
                                    <button
                                        onClick={() => openAuthModal("login")}
                                        className="text-white border-2 border-white/30 px-8 py-3.5 rounded-full font-bold text-sm hover:bg-white/10 transition-all flex items-center gap-2"
                                    >
                                        <LogIn className="w-4 h-4" />
                                        {t('explore.already_have_account')}
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
                            {t('explore.filter_ref')}
                        </h3>
                    </div>
                    <button
                        onClick={() => setIsFilterOpen(false)}
                        className="p-2 -mr-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-full transition-colors focus:outline-none"
                    >
                        <X className="w-5 h-5" strokeWidth={2.5} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar bg-gray-50/50 dark:bg-[#13111C]/50">
                    {/* Tipe Konten */}
                    <div>
                        <h4 className="font-['Lexend_Deca'] font-bold text-[15px] text-gray-900 dark:text-gray-100 mb-4 flex items-center justify-between">
                            {t('explore.search_type')}
                            {contentTypeFilter !== 'semua' && (
                                <span className="text-[11px] font-['Lexend_Deca'] text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-md">
                                    1 {t('explore.selected')}
                                </span>
                            )}
                        </h4>
                        <div className="flex flex-wrap gap-2.5">
                            {[
                                { key: 'semua' as const, label: t('explore.all'), icon: Compass },
                                { key: 'catatan_terverifikasi' as const, label: t('explore.verified_notes'), icon: BookOpen },
                                { key: 'orang_terverifikasi' as const, label: t('explore.verified_people'), icon: ShieldCheck },
                            ].map((item) => (
                                <button
                                    key={item.key}
                                    onClick={() => setContentTypeFilter(item.key)}
                                    className={`px-4 py-2.5 rounded-2xl font-['Manrope'] text-[13.5px] font-bold transition-all border flex items-center gap-2 ${contentTypeFilter === item.key
                                        ? 'bg-primary text-white border-primary shadow-[0_4px_12px_rgb(93,92,230,0.3)]'
                                        : 'bg-white dark:bg-[#252336] text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:border-primary/40 hover:text-primary hover:bg-primary/5 hover:shadow-sm'
                                    }`}
                                >
                                    <item.icon className="w-4 h-4" strokeWidth={2.2} />
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tingkat Pendidikan */}
                    <div>
                        <h4 className="font-['Lexend_Deca'] font-bold text-[15px] text-gray-900 dark:text-gray-100 mb-4 flex items-center justify-between">
                            {t('explore.edu_level')}
                            {selectedJenjang !== "Semua" && (
                                <span className="text-[11px] font-['Lexend_Deca'] text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-md">
                                    1 {t('explore.selected')}
                                </span>
                            )}
                        </h4>
                        <div className="flex flex-wrap gap-2.5">
                            {jenjangList.map((jenjang) => (
                                <button
                                    key={jenjang}
                                    onClick={() => setSelectedJenjang(jenjang)}
                                    className={`px-4 py-2.5 rounded-2xl font-['Manrope'] text-[13.5px] font-bold transition-all border ${selectedJenjang === jenjang
                                            ? "bg-primary text-white border-primary shadow-[0_4px_12px_rgb(93,92,230,0.3)]"
                                            : "bg-white dark:bg-[#252336] text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:border-primary/40 hover:text-primary hover:bg-primary/5 hover:shadow-sm"
                                        }`}
                                >
                                    {jenjang === 'Semua' ? t('explore.all') : t('explore.level_' + jenjang.toLowerCase().replace(/ /g, '_')) !== 'explore.level_' + jenjang.toLowerCase().replace(/ /g, '_') ? t('explore.level_' + jenjang.toLowerCase().replace(/ /g, '_')) : jenjang}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tingkatan Kelas (Hanya Muncul Jika Jenjang Dipilih) */}
                    {getKelasList(selectedJenjang).length > 0 && (
                        <div>
                            <h4 className="font-['Lexend_Deca'] font-bold text-[15px] text-gray-900 dark:text-gray-100 mb-4 flex items-center justify-between">
                                {t('explore.grade_level')}
                                {selectedKelas !== "Semua" && (
                                    <span className="text-[11px] font-['Lexend_Deca'] text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-md">
                                        1 {t('explore.selected')}
                                    </span>
                                )}
                            </h4>
                            <div className="flex flex-wrap gap-2.5">
                                <button
                                    onClick={() => setSelectedKelas("Semua")}
                                    className={`px-4 py-2.5 rounded-2xl font-['Manrope'] text-[13.5px] font-bold transition-all border ${selectedKelas === "Semua"
                                            ? "bg-primary text-white border-primary shadow-[0_4px_12px_rgb(93,92,230,0.3)]"
                                            : "bg-white dark:bg-[#252336] text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:border-primary/40 hover:text-primary hover:bg-primary/5 hover:shadow-sm"
                                        }`}
                                >
                                    {t('explore.all_grades')}
                                </button>
                                {getKelasList(selectedJenjang).map((kelas) => (
                                    <button
                                        key={kelas}
                                        onClick={() => setSelectedKelas(kelas)}
                                        className={`px-4 py-2.5 rounded-2xl font-['Manrope'] text-[13.5px] font-bold transition-all border ${selectedKelas === kelas
                                                ? "bg-primary text-white border-primary shadow-[0_4px_12px_rgb(93,92,230,0.3)]"
                                                : "bg-white dark:bg-[#252336] text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:border-primary/40 hover:text-primary hover:bg-primary/5 hover:shadow-sm"
                                            }`}
                                    >
                                        {formatClassOption(selectedJenjang === "Perguruan Tinggi" ? "Kuliah" : selectedJenjang, kelas, language, t)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Topik Pembelajaran / Tags */}
                    <div>
                        <h4 className="font-['Lexend_Deca'] font-bold text-[15px] text-gray-900 dark:text-gray-100 mb-4 flex items-center justify-between">
                            {t('explore.learning_topic')}
                            {selectedTags.length > 0 && (
                                <span className="text-[11px] font-['Lexend_Deca'] text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-md">
                                    {selectedTags.length} {t('explore.selected')}
                                </span>
                            )}
                        </h4>
                        
                        {/* Selected Tags Pills */}
                        {selectedTags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                                {selectedTags.map(tag => (
                                    <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 text-primary text-[13px] font-bold font-['Manrope'] border border-primary/20">
                                        {tag}
                                        <button 
                                            onClick={() => setSelectedTags(prev => prev.filter(t => t !== tag))}
                                            className="hover:bg-primary/20 p-0.5 rounded-full transition-colors focus:outline-none"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Tag Input Autocomplete */}
                        <div className="relative group" ref={filterTagInputRef}>
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-primary transition-colors">
                                <Search className="w-5 h-5" strokeWidth={2.5} />
                            </div>
                            <input
                                type="text"
                                placeholder={t('explore.search_topic_placeholder')}
                                value={tagInput}
                                onChange={(e) => {
                                    setTagInput(e.target.value);
                                    setIsTagSuggestionsOpen(true);
                                }}
                                onFocus={() => setIsTagSuggestionsOpen(true)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && tagInput.trim()) {
                                        e.preventDefault();
                                        if (!selectedTags.includes(tagInput.trim())) {
                                            setSelectedTags(prev => [...prev, tagInput.trim()]);
                                        }
                                        setTagInput("");
                                        setIsTagSuggestionsOpen(false);
                                    }
                                }}
                                className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-[#252336] border border-gray-200 dark:border-white/10 rounded-[14px] font-['Manrope'] text-[14px] focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all text-gray-900 dark:text-gray-100 placeholder:text-gray-500"
                            />
                            
                            {/* Suggestions Dropdown */}
                            {isTagSuggestionsOpen && filterTagSuggestions.length > 0 && (
                                <div className="absolute w-full mt-2 bg-white dark:bg-[#1C1A29] rounded-[14px] border border-gray-100 dark:border-white/5 shadow-xl overflow-hidden z-[110]">
                                    <div className="px-3 py-2 text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider bg-gray-100/50 dark:bg-white/5">
                                        {t('explore.topic_suggestion')}
                                    </div>
                                    <ul className="max-h-48 overflow-y-auto no-scrollbar py-1">
                                        {filterTagSuggestions.map(tag => (
                                            <li key={String(tag)}>
                                                <button
                                                    onClick={() => {
                                                        if (!selectedTags.includes(String(tag))) {
                                                            setSelectedTags(prev => [...prev, String(tag)]);
                                                        }
                                                        setTagInput("");
                                                        setIsTagSuggestionsOpen(false);
                                                    }}
                                                    className="w-full text-left px-4 py-2.5 text-[13.5px] font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-primary transition-colors flex items-center gap-2"
                                                >
                                                    <div className="w-6 h-6 rounded-md bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-400 shrink-0">
                                                        <Search className="w-3.5 h-3.5" />
                                                    </div>
                                                    <span className="truncate">{String(tag)}</span>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-gray-700 dark:text-gray-400 mt-2 font-['Manrope'] font-bold">{t('explore.press_enter_custom_topic')}</p>
                    </div>
                </div>

                <div className="p-5 border-t border-gray-100 dark:border-white/5 bg-white dark:bg-[#1C1A29] z-10">
                    <div className="flex gap-3">
                        <button
                            onClick={() => {
                                setSelectedJenjang("Semua");
                                setSelectedKelas("Semua");
                                setSelectedTags([]);
                                setTagInput("");
                                setContentTypeFilter('semua');
                            }}
                            className="px-5 py-3.5 rounded-xl font-['Lexend_Deca'] text-[14px] font-extrabold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-gray-200 transition-colors w-1/3 border border-gray-200 dark:border-white/10"
                        >
                            {t('explore.reset')}
                        </button>
                        <button
                            onClick={() => setIsFilterOpen(false)}
                            className="flex-1 px-5 py-3.5 rounded-xl font-['Lexend_Deca'] text-[14px] font-extrabold text-white bg-primary hover:bg-primary/90 shadow-[0_4px_10px_rgb(93,92,230,0.25)] hover:shadow-[0_8px_20px_rgb(93,92,230,0.35)] hover:-translate-y-0.5 transition-all text-center"
                        >
                            {t('explore.apply_filter')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    // Logged-in: dashboard layout
    if (isAuthenticated) {
        return (
            <MobileLayout>
                {exploreContent}
                {filterModalUI}
            </MobileLayout>
        );
    }

    // Guest: landing page layout with reveal styles
    return (
        <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#13111C]">
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
        </div>
    );
}
