import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useState, useEffect } from "react";
import axios from "axios";
import { MobileLayout } from "../components/MobileLayout";
import {
    Bookmark,
    Star,
    LayoutGrid,
    Clock,
    ChevronRight,
    Eye,
    Heart,
    MessageCircle,
    ShieldCheck,
    BookOpen,
    Compass,
    Sparkles,
    RotateCcw,
    X,
    Users,
    TrendingUp
} from "lucide-react";
import { NoteCardSkeleton } from "../components/ui/skeletons";
import { Skeleton } from "../components/ui/skeleton";
import { mataPelajaran } from "../data/mockData";
import { Link, useSearchParams } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { useBookmarks } from "../contexts/BookmarkContext";
import { useToast } from "../contexts/ToastContext";
import { TagList } from "../components/ui/TagList";
import { DefaultThumbnail, AvatarImage } from "../components/ui/DefaultImages";
import { NoteCard } from "../components/NoteCard";
import { useTranslation } from "../hooks/useTranslation";

export default function HomePage() {
    const { t, language } = useTranslation();
    useDocumentTitle(t('titles.home'));
    const { user, isAuthenticated } = useAuth();
    const { isBookmarked, toggleBookmark } = useBookmarks();
    const { showToast } = useToast();
    const [searchParams, setSearchParams] = useSearchParams();

    // Feed tab: 'for_you' (Untuk Anda) or 'following' (Mengikuti)
    const initialFeed = searchParams.get('feed') === 'following' ? 'following' : 'for_you';
    const [feedTab, setFeedTab] = useState<'for_you' | 'following'>(initialFeed);

    const initialSubject = searchParams.get('subject') || searchParams.get('mapel') || null;
    const [selectedSubject, setSelectedSubject] = useState<string | null>(initialSubject);

    const [notes, setNotes] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

    // Sync state with URL search params
    useEffect(() => {
        const paramSubject = searchParams.get('subject') || searchParams.get('mapel') || null;
        if (paramSubject !== selectedSubject) {
            setSelectedSubject(paramSubject);
        }
        const paramFeed = searchParams.get('feed') === 'following' ? 'following' : 'for_you';
        if (paramFeed !== feedTab) {
            setFeedTab(paramFeed);
        }
    }, [searchParams]);

    const handleLikePost = async (postId: string) => {
        if (!user)
            return showToast(
                t('home.login_to_like') !== 'home.login_to_like' ? t('home.login_to_like') : 'Silakan login untuk menyukai catatan ini.',
                "warning",
            );

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

    const fetchPosts = async (
        pageNum: number, 
        currentFeedTab: 'for_you' | 'following' = feedTab,
        subjectFilter: string | null = selectedSubject
    ) => {
        try {
            const token = localStorage.getItem("bayu-token") || sessionStorage.getItem("bayu-token");
            const headers: Record<string, string> = {};
            if (token) headers["Authorization"] = `Bearer ${token}`;

            let url = `/api/v1/posts?page=${pageNum}&limit=12`;
            
            if (currentFeedTab === 'following') {
                url += `&feed=following`;
            } else if (subjectFilter) {
                // Find subject name from mockData if ID was passed
                const matchSubject = mataPelajaran.find(
                    (m) => m.id.toLowerCase() === subjectFilter.toLowerCase() || m.name.toLowerCase() === subjectFilter.toLowerCase()
                );
                const queryVal = matchSubject ? matchSubject.name : subjectFilter;
                url += `&mapel=${encodeURIComponent(queryVal)}`;
            }

            const response = await axios.get(url, { headers });
            const newData = response.data.data || [];
            
            if (pageNum === 1) {
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
            console.error("Error fetching posts:", error);
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    };

    // Tab change handler ("Untuk Anda" vs "Mengikuti")
    const handleSelectFeedTab = (tab: 'for_you' | 'following') => {
        setIsLoading(true);
        setFeedTab(tab);
        setSelectedSubject(null);
        setPage(1);
        setCurrentHeroIndex(0);

        if (tab === 'following') {
            setSearchParams({ feed: 'following' });
        } else {
            setSearchParams({});
        }

        fetchPosts(1, tab, null);
    };

    // Filter selection handler from sidebar
    const handleSelectSubject = (subjectId: string | null) => {
        setIsLoading(true);
        setFeedTab('for_you');
        setSelectedSubject(subjectId);
        setPage(1);
        setCurrentHeroIndex(0);

        if (subjectId) {
            setSearchParams({ subject: subjectId });
        } else {
            setSearchParams({});
        }

        fetchPosts(1, 'for_you', subjectId);
    };

    useEffect(() => {
        setIsLoading(true);
        setPage(1);
        setCurrentHeroIndex(0);
        fetchPosts(1, feedTab, selectedSubject);
    }, [feedTab, selectedSubject]);

    useEffect(() => {
        const heroNotesCount = Math.min(notes.length, 3);
        if (heroNotesCount <= 1) return;

        const interval = setInterval(() => {
            setCurrentHeroIndex((prev) => (prev + 1) % heroNotesCount);
        }, 5000); // 5 seconds autoplay

        return () => clearInterval(interval);
    }, [notes.length]);

    useEffect(() => {
        if (page > 1) {
            setIsLoadingMore(true);
            fetchPosts(page, feedTab, selectedSubject);
        }
    }, [page]);

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
                if (!isLoadingMore && hasMore && !isLoading) {
                    setPage((prev) => prev + 1);
                }
            }
        };

        const scrollContainer = document.getElementById("main-scroll-container");
        const elementToObserve = scrollContainer || window;

        elementToObserve.addEventListener("scroll", handleScroll);
        return () => elementToObserve.removeEventListener("scroll", handleScroll as EventListener);
    }, [isLoadingMore, hasMore, isLoading]);

    // Format array fallback if API fields are missing or empty
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
        description: note.description || (note.plain_content ? note.plain_content.substring(0, 150) + "..." : (t('home.no_description') !== 'home.no_description' ? t('home.no_description') : 'Tidak ada deskripsi.')),
        mataPelajaran: note.mapel || "Lainnya",
        jenjang: note.jenjang || "-",
        kelas: note.kelas || "-",
        likes: note.likes_count || 0,
        comments: note.comments_count || 0,
    }));

    // Destructure content
    const heroNotesCount = Math.min(formattedNotes.length, 3);
    const heroNote = formattedNotes[currentHeroIndex] || formattedNotes[0];
    const feedNotes = formattedNotes.slice(heroNotesCount);
    const trendingNotes = [...formattedNotes]
        .sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0))
        .slice(0, 5);

    // Active subject display label
    const activeSubjectObj = selectedSubject
        ? mataPelajaran.find((m) => m.id.toLowerCase() === selectedSubject.toLowerCase() || m.name.toLowerCase() === selectedSubject.toLowerCase())
        : null;
    const activeSubjectLabel = activeSubjectObj
        ? (t('subjects.' + activeSubjectObj.id) !== 'subjects.' + activeSubjectObj.id ? t('subjects.' + activeSubjectObj.id) : activeSubjectObj.name)
        : selectedSubject;

    if (isLoading) {
        return (
            <MobileLayout>
                <div className="w-full h-full flex justify-center pb-20 pt-6">
                    <div className="w-full max-w-[1140px] px-2 sm:px-4 md:px-6 flex flex-col lg:flex-row gap-8 lg:gap-10 xl:gap-14 animate-pulse lg:justify-center mx-auto">
                        <div className="flex-1 w-full lg:max-w-[640px] xl:max-w-[700px] min-w-0">
                            {/* FEED TABS SKELETON */}
                            <div className="w-full grid grid-cols-2 gap-2 p-1.5 bg-gray-100/50 dark:bg-white/5 rounded-2xl mb-6 border border-gray-200/40 dark:border-white/5">
                                <Skeleton className="h-11 w-full rounded-xl" />
                                <Skeleton className="h-11 w-full rounded-xl" />
                            </div>

                            {/* HERO NOTE SKELETON */}
                            <Skeleton className="w-full h-[350px] sm:h-[450px] rounded-[2rem] mb-12" />

                            {/* FEED SKELETON */}
                            <div className="flex flex-col gap-0">
                                {[...Array(4)].map((_, i) => (
                                    <NoteCardSkeleton key={i} />
                                ))}
                            </div>
                        </div>

                        {/* RIGHT COLUMN SKELETON */}
                        <div className="hidden lg:block w-[280px] xl:w-[320px] shrink-0 border-l border-gray-100 dark:border-white/5 pl-6 xl:pl-10 pt-4">
                            <div className="h-6 w-32 bg-gray-100 dark:bg-white/5 rounded-md mb-8"></div>
                            <div className="space-y-6">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="flex gap-4">
                                        <Skeleton className="w-[84px] h-[64px] rounded-xl shrink-0" />
                                        <div className="space-y-2 flex-1">
                                            <Skeleton className="h-4 w-full rounded-md" />
                                            <Skeleton className="h-3 w-1/2 rounded-md" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </MobileLayout>
        );
    }

    return (
        <MobileLayout>
            <div className="w-full h-full flex justify-center pb-20 pt-6">
                <div className="w-full max-w-[1140px] px-2 sm:px-4 md:px-6 flex flex-col lg:flex-row gap-8 lg:gap-10 xl:gap-14 lg:justify-center mx-auto">
                    {/* LEFT COLUMN (MAIN FEED GRID) */}
                    <div className="flex-1 w-full lg:max-w-[640px] xl:max-w-[700px] min-w-0">
                        
                        {/* MAIN FEED TABS: "Untuk Anda" & "Mengikuti" (Full Width & Responsive) */}
                        <div className="mb-6 w-full p-1 sm:p-1.5 bg-gray-100/80 dark:bg-white/5 rounded-2xl grid grid-cols-2 gap-1.5 sm:gap-2 border border-gray-200/60 dark:border-white/10 shadow-xs">
                            <button 
                                onClick={() => handleSelectFeedTab('for_you')}
                                className={`w-full py-2.5 sm:py-3 px-4 rounded-xl text-[13px] sm:text-[14px] font-['Lexend_Deca'] font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                                    feedTab === 'for_you'
                                        ? 'bg-primary text-white shadow-md shadow-primary/25 scale-[1.005]'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-white/60 dark:hover:bg-white/5'
                                }`}
                            >
                                <Compass className={`w-4 h-4 shrink-0 ${feedTab === 'for_you' ? 'text-white' : 'text-gray-400'}`} />
                                <span>
                                    {t('home.for_you') && t('home.for_you') !== 'home.for_you'
                                        ? t('home.for_you').replace(/^✨\s*/, '')
                                        : 'Untuk Anda'}
                                </span>
                            </button>

                            <button 
                                onClick={() => handleSelectFeedTab('following')}
                                className={`w-full py-2.5 sm:py-3 px-4 rounded-xl text-[13px] sm:text-[14px] font-['Lexend_Deca'] font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                                    feedTab === 'following'
                                        ? 'bg-primary text-white shadow-md shadow-primary/25 scale-[1.005]'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-white/60 dark:hover:bg-white/5'
                                }`}
                            >
                                <Users className={`w-4 h-4 shrink-0 ${feedTab === 'following' ? 'text-white' : 'text-gray-400'}`} />
                                <span>
                                    {t('home.following') && t('home.following') !== 'home.following'
                                        ? t('home.following').replace(/^✨\s*/, '')
                                        : 'Mengikuti'}
                                </span>
                            </button>
                        </div>

                        {/* Active Subject Banner */}
                        {selectedSubject && feedTab === 'for_you' && (
                            <div className="mb-6 px-4 py-3 rounded-2xl bg-blue-50/80 dark:bg-blue-500/10 border border-blue-200/80 dark:border-blue-500/20 flex items-center justify-between gap-3 text-xs">
                                <div className="flex items-center gap-2 text-primary font-bold min-w-0">
                                    <Sparkles className="w-4 h-4 shrink-0" />
                                    <span className="truncate">Menampilkan catatan topik: <strong>{activeSubjectLabel}</strong></span>
                                </div>
                                <button
                                    onClick={() => handleSelectSubject(null)}
                                    className="px-2.5 py-1 rounded-xl bg-white dark:bg-white/10 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/20 text-gray-600 dark:text-gray-300 font-bold transition-all flex items-center gap-1 shrink-0 cursor-pointer shadow-xs"
                                >
                                    <X className="w-3.5 h-3.5" />
                                    <span>Hapus Filter</span>
                                </button>
                            </div>
                        )}

                        {/* THE HERO ARTICLE (MAGAZINE STYLE) */}
                        {heroNote && (
                            <div className="mb-12 pb-12 border-b border-gray-100 dark:border-white/5 relative group transition-all duration-500 ease-out flex flex-col md:flex-row gap-8">
                                
                                {/* Carousel Navigation Arrows */}
                                {heroNotesCount > 1 && (
                                    <>
                                        <button 
                                            onClick={() => setCurrentHeroIndex((prev) => (prev - 1 + heroNotesCount) % heroNotesCount)}
                                            className="absolute left-[-16px] lg:left-[-24px] top-[40%] md:top-[45%] -translate-y-1/2 w-10 h-10 bg-white/90 dark:bg-[#1C1A29]/90 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary hover:bg-white dark:hover:bg-[#13111C] shadow-sm hover:shadow-md transition-all z-30 opacity-0 group-hover:opacity-100 focus:opacity-100 hidden md:flex"
                                            aria-label="Previous slide"
                                        >
                                            <ChevronRight className="w-6 h-6 rotate-180" strokeWidth={2} />
                                        </button>
                                        <button 
                                            onClick={() => setCurrentHeroIndex((prev) => (prev + 1) % heroNotesCount)}
                                            className="absolute right-[-16px] lg:right-[-24px] top-[40%] md:top-[45%] -translate-y-1/2 w-10 h-10 bg-white/90 dark:bg-[#1C1A29]/90 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary hover:bg-white dark:hover:bg-[#13111C] shadow-sm hover:shadow-md transition-all z-30 opacity-0 group-hover:opacity-100 focus:opacity-100 hidden md:flex"
                                            aria-label="Next slide"
                                        >
                                            <ChevronRight className="w-6 h-6" strokeWidth={2} />
                                        </button>
                                    </>
                                )}

                                {/* Hero Text Content */}
                                <div className="flex-1 flex flex-col justify-center z-10 w-full md:w-1/2">
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="bg-primary/10 text-primary text-[11px] font-['Lexend_Deca'] font-bold px-2 py-1 rounded-[6px] uppercase tracking-wider">
                                            {t('home.main_focus') !== 'home.main_focus' ? t('home.main_focus') : 'Fokus Utama'}
                                        </span>
                                        <span className="text-gray-600 dark:text-gray-400 text-[12px] font-semibold flex items-center gap-1.5">
                                            • <Clock className="w-3 h-3 text-gray-700 dark:text-gray-400" strokeWidth={2.5} /> {heroNote.read_time || 1} {t('notecard.read_time_badge') !== 'notecard.read_time_badge' ? t('notecard.read_time_badge') : 'm'}
                                        </span>

                                        {/* Badge Verifikasi */}
                                        {heroNote.is_verified && (
                                            <span className="flex items-center gap-1 text-[12px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 px-2 py-0.5 rounded-md ml-1">
                                                <ShieldCheck className="w-3.5 h-3.5" />
                                            </span>
                                        )}
                                    </div>

                                    <Link
                                        to={`/note/${heroNote.id}`}
                                        className="block group/title outline-none"
                                    >
                                        <h2 className="text-[28px] md:text-[36px] font-['Lexend_Deca'] font-extrabold text-gray-900 dark:text-gray-100 leading-[1.1] mb-4 tracking-tight group-hover/title:text-primary transition-colors line-clamp-3">
                                            {heroNote.title}
                                        </h2>
                                    </Link>

                                    <p className="text-[16px] font-['Manrope'] text-gray-700 dark:text-gray-400 leading-relaxed mb-6 line-clamp-3 md:line-clamp-2">
                                        {heroNote.description}
                                    </p>

                                    {/* Mobile Thumbnail (Between text and profile) */}
                                    <div className="md:hidden w-full h-[240px] overflow-hidden relative shrink-0 rounded-[2rem] bg-gray-50 dark:bg-[#1C1A29] shadow-md dark:shadow-none border border-gray-100 dark:border-white/5 mb-6 group-hover/title:shadow-lg transition-all duration-500">
                                        <Link
                                            to={`/note/${heroNote.id}`}
                                            className="w-full h-full block"
                                        >
                                            {heroNote.thumbnail ? (
                                                <img
                                                    src={heroNote.thumbnail}
                                                    alt={heroNote.title}
                                                    className="w-full h-full object-cover group-hover/title:scale-105 transition-transform duration-700 ease-out"
                                                />
                                            ) : (
                                                <DefaultThumbnail
                                                    subject={heroNote.mataPelajaran}
                                                    title={heroNote.title}
                                                    className="w-full h-full group-hover/title:scale-105 transition-transform duration-700 ease-out"
                                                />
                                            )}
                                        </Link>
                                    </div>

                                    {/* Author Profile Footer */}
                                    <div className="flex items-center gap-3">
                                        <Link
                                            to={`/profile/${heroNote.author?.id || heroNote.author?._id}`}
                                            className="hover:opacity-80 transition-opacity"
                                        >
                                            <AvatarImage
                                                src={heroNote.author?.avatar}
                                                alt={heroNote.author?.name}
                                                size={32}
                                                className="rounded-full ring-2 ring-primary/20"
                                            />
                                        </Link>
                                        <div className="flex flex-col">
                                            <Link
                                                to={`/profile/${heroNote.author?.id || heroNote.author?._id}`}
                                                className="font-['Lexend_Deca'] font-bold text-[14px] text-gray-900 dark:text-gray-100 hover:text-primary transition-colors flex items-center gap-1.5"
                                            >
                                                {heroNote.author?.name}
                                                {heroNote.author?.role ===
                                                    "pakar" && (
                                                    <span className="flex items-center gap-1 bg-amber-500/10 text-amber-500 text-[10px] font-extrabold px-1.5 py-0.5 rounded-[4px] border border-amber-500/20">
                                                        <Star
                                                            className="w-2.5 h-2.5 fill-amber-500 text-amber-500"
                                                            strokeWidth={3}
                                                        />
                                                        PAKAR
                                                    </span>
                                                )}
                                            </Link>
                                            <span className="text-[12px] font-['Manrope'] text-gray-600 dark:text-gray-400 font-medium">
                                                {heroNote.createdAt ? new Date(
                                                    heroNote.createdAt,
                                                ).toLocaleDateString((language === 'ar' ? 'ar-EG' : language === 'fa' ? 'fa-IR' : language === 'id' ? 'id-ID' : language), {
                                                    day: "numeric",
                                                    month: "long",
                                                    year: "numeric",
                                                }) : t('notifications.time_just_now')}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Desktop Right Thumbnail */}
                                <div className="hidden md:block w-full md:w-1/2 h-[350px] lg:h-[400px] overflow-hidden relative shrink-0 rounded-[2rem] bg-gray-50 dark:bg-[#1C1A29] shadow-md dark:shadow-none border border-gray-100 dark:border-white/5 group-hover/title:shadow-lg transition-all duration-500">
                                    <Link
                                        to={`/note/${heroNote.id}`}
                                        className="w-full h-full block"
                                    >
                                        {heroNote.thumbnail ? (
                                            <img
                                                src={heroNote.thumbnail}
                                                alt={heroNote.title}
                                                className="w-full h-full object-cover group-hover/title:scale-105 transition-transform duration-700 ease-out"
                                            />
                                        ) : (
                                            <DefaultThumbnail
                                                subject={heroNote.mataPelajaran}
                                                title={heroNote.title}
                                                className="w-full h-full group-hover/title:scale-105 transition-transform duration-700 ease-out"
                                            />
                                        )}
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* EMPTY STATE FOR FOLLOWING FEED */}
                        {formattedNotes.length === 0 && feedTab === 'following' && (
                            <div className="py-16 text-center bg-gray-50/50 dark:bg-[#161424]/50 rounded-3xl border border-gray-100 dark:border-white/5 p-6 my-4">
                                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                                    <Users className="w-7 h-7" />
                                </div>
                                <h3 className="font-['Lexend_Deca'] font-bold text-lg text-gray-900 dark:text-gray-100 mb-1">
                                    {!user
                                        ? (t('home.login_to_view_following') !== 'home.login_to_view_following' ? t('home.login_to_view_following') : 'Masuk untuk melihat catatan dari pengguna yang Anda ikuti.')
                                        : (t('home.no_following_notes') !== 'home.no_following_notes' ? t('home.no_following_notes') : 'Belum ada catatan dari orang yang Anda ikuti')}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto font-['Manrope']">
                                    {t('home.no_following_desc') !== 'home.no_following_desc' ? t('home.no_following_desc') : 'Ikuti kreator atau teman belajar untuk melihat catatan terbaru mereka di sini.'}
                                </p>
                                {!user ? (
                                    <Link
                                        to="/login"
                                        className="px-5 py-2.5 rounded-full bg-primary text-white font-['Lexend_Deca'] font-bold text-xs shadow-md shadow-primary/20 hover:scale-105 transition-all cursor-pointer inline-flex items-center gap-2"
                                    >
                                        <span>{t('home.login_btn') !== 'home.login_btn' ? t('home.login_btn') : 'Masuk Sekarang'}</span>
                                    </Link>
                                ) : (
                                    <Link
                                        to="/explore?tab=pengguna"
                                        className="px-5 py-2.5 rounded-full bg-primary text-white font-['Lexend_Deca'] font-bold text-xs shadow-md shadow-primary/20 hover:scale-105 transition-all cursor-pointer inline-flex items-center gap-2"
                                    >
                                        <Users className="w-3.5 h-3.5" />
                                        <span>{t('home.explore_btn') !== 'home.explore_btn' ? t('home.explore_btn') : 'Jelajahi Pengguna'}</span>
                                    </Link>
                                )}
                            </div>
                        )}

                        {/* EMPTY STATE FOR SUBJECT FILTER / GENERAL */}
                        {formattedNotes.length === 0 && feedTab === 'for_you' && (
                            <div className="py-16 text-center bg-gray-50/50 dark:bg-white/5 rounded-3xl border border-gray-100 dark:border-white/5 p-6 my-4">
                                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                                    <BookOpen className="w-7 h-7" />
                                </div>
                                <h3 className="font-['Lexend_Deca'] font-bold text-lg text-gray-900 dark:text-gray-100 mb-1">
                                    {selectedSubject
                                        ? `Belum ada catatan untuk topik "${activeSubjectLabel}"`
                                        : 'Belum ada catatan tersedia'}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto font-['Manrope']">
                                    Jadilah yang pertama membagikan catatan belajar tentang topik ini!
                                </p>
                                {selectedSubject && (
                                    <button
                                        onClick={() => handleSelectSubject(null)}
                                        className="px-5 py-2.5 rounded-full bg-primary text-white font-['Lexend_Deca'] font-bold text-xs shadow-md shadow-primary/20 hover:scale-105 transition-all cursor-pointer inline-flex items-center gap-2"
                                    >
                                        <RotateCcw className="w-3.5 h-3.5" />
                                        <span>Tampilkan Semua Catatan</span>
                                    </button>
                                )}
                            </div>
                        )}

                        {/* THE STANDARD VERTICAL STREAM LIST (MEDIUMLIKE FEED) */}
                        <div className="flex flex-col divide-y divide-gray-100 dark:divide-white/5">
                            {feedNotes.map((note) => (
                                <NoteCard
                                    key={note.id}
                                    note={note}
                                    onLike={handleLikePost}
                                />
                            ))}
                        </div>

                        {/* Infinite scroll loader */}
                        {isLoadingMore && (
                            <div className="py-8 flex justify-center">
                                <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                            </div>
                        )}

                        {!hasMore && formattedNotes.length > 0 && (
                            <div className="py-12 text-center text-[13px] font-['Manrope'] font-medium text-gray-600 dark:text-gray-400">
                                {t('home.all_caught_up') !== 'home.all_caught_up' ? t('home.all_caught_up') : 'Anda sudah melihat semua catatan terbaru.'}
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN (TRENDING / DISCOVERY & TOPICS SIDEBAR) */}
                    <div className="hidden lg:block w-[280px] xl:w-[320px] shrink-0 border-l border-gray-100 dark:border-white/5 pl-6 xl:pl-10 pt-2">
                        <div className="sticky top-20 flex flex-col gap-0">
                            
                            {/* Trending Section */}
                            <div className="pb-8 border-b border-gray-100 dark:border-white/5">
                                <h3 className="font-['Lexend_Deca'] font-extrabold text-[15px] text-gray-900 dark:text-gray-100 tracking-tight mb-5 flex items-center gap-2.5">
                                    <span className="relative flex h-2.5 w-2.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                                    </span>
                                    <span>{t('home.trending_this_week') !== 'home.trending_this_week' ? t('home.trending_this_week') : 'Trending Minggu Ini'}</span>
                                </h3>

                                <div className="flex flex-col gap-5">
                                    {trendingNotes.map((trend, idx) => {
                                        const tAuth = trend.author;
                                        return (
                                            <div
                                                key={trend.id}
                                                className="group relative flex gap-3.5 items-start"
                                            >
                                                {/* Giant Watermark Number */}
                                                <div className="w-[32px] shrink-0">
                                                    <span className="font-['Lexend_Deca'] font-black text-[28px] leading-none text-gray-300 dark:text-gray-600 group-hover:text-primary/70 transition-colors select-none tracking-tighter block pt-0.5">
                                                        0{idx + 1}
                                                    </span>
                                                </div>

                                                <div className="flex flex-col flex-1 min-w-0">
                                                    {/* Author & Date */}
                                                    <Link
                                                        to={`/profile/${tAuth?.id || tAuth?._id}`}
                                                        className="flex items-center gap-1.5 mb-1.5 hover:opacity-80 transition-opacity"
                                                    >
                                                        <AvatarImage
                                                            src={trend.author?.avatar}
                                                            alt={trend.author?.name}
                                                            size={18}
                                                            className="rounded-full shrink-0"
                                                        />
                                                        <span className="text-[12px] font-['Lexend_Deca'] font-bold text-gray-700 dark:text-gray-300 group-hover/tauth:underline truncate max-w-[120px]">
                                                            {trend.author?.name}
                                                        </span>
                                                        <span className="text-[11px] font-['Manrope'] text-gray-400 dark:text-gray-500 font-medium">
                                                            • {trend.createdAt ? new Date(trend.createdAt).toLocaleDateString((language === 'ar' ? 'ar-EG' : language === 'fa' ? 'fa-IR' : language === 'id' ? 'id-ID' : language), { day: 'numeric', month: 'short' }) : 'Baru'}
                                                        </span>
                                                    </Link>

                                                    {/* Note Title */}
                                                    <Link
                                                        to={`/note/${trend.id}`}
                                                        className="block outline-none"
                                                    >
                                                        <h4 className="font-['Lexend_Deca'] font-bold text-[14px] text-gray-900 dark:text-gray-100 leading-[1.35] group-hover:text-primary transition-colors line-clamp-2 tracking-tight">
                                                            {trend.title}
                                                        </h4>
                                                    </Link>

                                                    {/* Subject / Mapel Badge */}
                                                    {trend.mataPelajaran && trend.mataPelajaran !== 'Lainnya' && (
                                                        <div className="font-['Manrope'] text-[11px] text-gray-500 dark:text-gray-400 mt-1 font-semibold flex items-center gap-1">
                                                            <span className="text-primary">•</span>
                                                            <span>{trend.mataPelajaran}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <Link 
                                    to="/explore?tab=populer"
                                    className="block w-full mt-6 bg-gray-50 dark:bg-white/5 hover:bg-primary/10 text-gray-600 dark:text-gray-400 hover:text-primary rounded-2xl py-3 text-[14px] font-['Lexend_Deca'] font-bold transition-colors text-center"
                                >
                                    {t('home.view_all') !== 'home.view_all' ? t('home.view_all') : 'Lihat Semua'}
                                </Link>
                            </div>

                            {/* Discover Topics Section (Jelajahi Topik Belajar) */}
                            <div className="py-8 border-b border-gray-100 dark:border-white/5">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-['Lexend_Deca'] font-bold text-[16px] text-gray-900 dark:text-gray-100 tracking-tight">
                                        {t('home.explore_topics') !== 'home.explore_topics' ? t('home.explore_topics') : 'Jelajahi Topik Belajar'}
                                    </h3>
                                    {selectedSubject && (
                                        <button
                                            onClick={() => handleSelectSubject(null)}
                                            className="text-[11.5px] font-bold text-rose-500 hover:underline flex items-center gap-1 cursor-pointer"
                                            title="Reset filter topik"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                            <span>Reset</span>
                                        </button>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {mataPelajaran.map((tag) => {
                                        const isSelected = selectedSubject && (
                                            selectedSubject.toLowerCase() === tag.id.toLowerCase() ||
                                            selectedSubject.toLowerCase() === tag.name.toLowerCase()
                                        );
                                        return (
                                            <button
                                                key={tag.id}
                                                onClick={() => handleSelectSubject(isSelected ? null : tag.id)}
                                                className={`px-4 py-2 rounded-full text-[13px] font-['Manrope'] transition-all border cursor-pointer ${
                                                    isSelected
                                                        ? 'bg-primary text-white border-primary shadow-sm shadow-primary/30 font-bold scale-[1.03]'
                                                        : 'bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-gray-400 border-gray-100 dark:border-white/5 font-medium'
                                                }`}
                                            >
                                                {t('subjects.' + tag.id) !== 'subjects.' + tag.id ? t('subjects.' + tag.id) : tag.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Quick Links */}
                            <div className="mt-8 flex flex-wrap gap-x-4 gap-y-3 text-[13px] font-['Manrope'] font-medium text-gray-500 dark:text-gray-600">
                                <Link
                                    to="/settings/help"
                                    className="hover:text-gray-900 dark:hover:text-gray-300 transition-colors"
                                >
                                    {t('footer.help') !== 'footer.help' ? t('footer.help') : 'Bantuan'}
                                </Link>
                                <Link
                                    to="/status"
                                    className="hover:text-gray-900 dark:hover:text-gray-300 transition-colors"
                                >
                                    {t('footer.status') !== 'footer.status' ? t('footer.status') : 'Status'}
                                </Link>
                                <Link
                                    to="/about"
                                    className="hover:text-gray-900 dark:hover:text-gray-300 transition-colors"
                                >
                                    {t('footer.about_us') !== 'footer.about_us' ? t('footer.about_us') : 'Tentang Kami'}
                                </Link>
                                <Link
                                    to="/careers"
                                    className="hover:text-gray-900 dark:hover:text-gray-300 transition-colors"
                                >
                                    {t('footer.careers') !== 'footer.careers' ? t('footer.careers') : 'Karir'}
                                </Link>
                                <Link
                                    to="/terms"
                                    className="hover:text-gray-900 dark:hover:text-gray-300 transition-colors"
                                >
                                    {t('footer.terms') !== 'footer.terms' ? t('footer.terms') : 'Ketentuan'}
                                </Link>
                                <Link
                                    to="/privacy"
                                    className="hover:text-gray-900 dark:hover:text-gray-300 transition-colors"
                                >
                                    {t('footer.privacy') !== 'footer.privacy' ? t('footer.privacy') : 'Privasi'}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MobileLayout>
    );
}
