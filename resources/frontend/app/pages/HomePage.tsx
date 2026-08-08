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
} from "lucide-react";
import { NoteCardSkeleton } from "../components/ui/skeletons";
import { Skeleton } from "../components/ui/skeleton";
import { mataPelajaran } from "../data/mockData";
import { Link } from "react-router";
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
    const { user } = useAuth();
    const { isBookmarked, toggleBookmark } = useBookmarks();
    const { showToast } = useToast();

    const [notes, setNotes] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

    const handleLikePost = async (postId: string) => {
        if (!user)
            return showToast(
                t('home.login_to_like'),
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

    const fetchPosts = async (pageNum: number) => {
        try {
            const response = await axios.get(`/api/v1/posts?page=${pageNum}&limit=12`);
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

    useEffect(() => {
        fetchPosts(1);
    }, []);

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
            fetchPosts(page);
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
        description: note.description || (note.plain_content ? note.plain_content.substring(0, 150) + "..." : t('home.no_description')),
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

    if (isLoading) {
        return (
            <MobileLayout>
                <div className="w-full h-full flex justify-center pb-20 pt-6">
                    <div className="w-full max-w-[1140px] px-2 sm:px-4 md:px-6 flex flex-col lg:flex-row gap-8 lg:gap-10 xl:gap-14 animate-pulse lg:justify-center mx-auto">
                        <div className="flex-1 w-full lg:max-w-[640px] xl:max-w-[700px] min-w-0">
                            {/* CATEGORY PILLS SKELETON */}
                            <div className="flex gap-3 mb-6 overflow-hidden">
                                {[...Array(6)].map((_, i) => (
                                    <Skeleton
                                        key={i}
                                        className="h-10 w-28 rounded-full shrink-0"
                                    />
                                ))}
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
                    {/* LEFT COLUMN (MAIN DISCOVERY GRID) */}
                    <div className="flex-1 w-full lg:max-w-[640px] xl:max-w-[700px] min-w-0">
                        {/* CATEGORY PILLS */}
                        <div className="mb-6 overflow-hidden relative">
                            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-3 snap-x">
                                <button className="shrink-0 px-5 py-2.5 rounded-full bg-primary text-white text-[13px] font-['Lexend_Deca'] font-bold shadow-sm shadow-primary/30 transition-colors snap-start shrink-0">
                                    {t('home.for_you')}
                                </button>
                                {mataPelajaran.map((mapel) => (
                                    <Link
                                        key={mapel.id}
                                        to={`/explore?subject=${mapel.id}`}
                                        className="shrink-0 px-5 py-2.5 bg-white dark:bg-[#1C1A29] hover:bg-primary/5 hover:text-primary hover:border-primary/20 rounded-full text-[13px] font-['Manrope'] font-bold text-gray-600 dark:text-gray-400 transition-colors duration-300 border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none snap-start"
                                    >
                                        {t('subjects.' + mapel.id) !== 'subjects.' + mapel.id ? t('subjects.' + mapel.id) : mapel.name}
                                    </Link>
                                ))}
                            </div>
                            {/* Fade mask for absolute right pill scrolls */}
                            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white dark:from-[#13111C] to-transparent pointer-events-none z-10"></div>
                        </div>

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
                                            {t('home.main_focus')}
                                        </span>
                                        <span className="text-gray-600 dark:text-gray-400 text-[12px] font-semibold flex items-center gap-1.5">
                                            • <Clock className="w-3 h-3 text-gray-700 dark:text-gray-400" strokeWidth={2.5} /> {heroNote.read_time || 1} {t('notecard.read_time_badge') !== 'notecard.read_time_badge' ? t('notecard.read_time_badge') : 'm'}
                                        </span>

                                        {/*Badge Verifikasi*/}
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
                                            className="block w-full h-full outline-none cursor-pointer"
                                        >
                                            {heroNote.thumbnail ? (
                                                <img
                                                    src={heroNote.thumbnail}
                                                    alt={heroNote.title}
                                                    className="w-full h-full object-cover object-center transition-transform duration-700 ease-out"
                                                />
                                            ) : (
                                                <DefaultThumbnail 
                                                    className="w-full h-full" 
                                                    subject={heroNote.mataPelajaran}
                                                    title={heroNote.title}
                                                />
                                            )}
                                            {/* Floating badge */}
                                            <div className="absolute top-3 right-3 bg-white/90 dark:bg-black/50 backdrop-blur-sm text-gray-800 dark:text-gray-200 text-[11px] font-['Lexend_Deca'] font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1.5 z-20">
                                                <Clock className="w-3.5 h-3.5" /> {heroNote.read_time || 1}{t('notecard.read_time_badge') !== 'notecard.read_time_badge' ? t('notecard.read_time_badge') : 'm'}
                                            </div>
                                        </Link>
                                    </div>

                                    <div className="flex items-center justify-between mt-auto">
                                        <div className="flex items-center gap-3">
                                            {(() => {
                                                const hAuthor = heroNote.author;
                                                return (
                                                    <Link
                                                        to={`/profile/${hAuthor?.id || hAuthor?._id}`}
                                                        className="flex items-center gap-3 group/hauth outline-none cursor-pointer"
                                                    >
                                                        <AvatarImage
                                                            src={hAuthor?.avatar}
                                                            alt={hAuthor?.name}
                                                            size={40}
                                                            className="ring-2 ring-gray-50 dark:ring-white/10 group-hover/hauth:ring-primary/30 transition-all"
                                                        />
                                                        <div className="flex flex-col">
                                                            <span className="text-[14px] font-['Lexend_Deca'] font-bold text-gray-900 dark:text-gray-100 tracking-tight group-hover/hauth:underline">
                                                                {hAuthor?.name}
                                                            </span>
                                                            <span className="text-[12px] font-['Manrope'] text-gray-700 dark:text-gray-400 font-bold">
                                                                {heroNote.createdAt ? new Date(heroNote.createdAt).toLocaleDateString((language === 'ar' ? 'ar-EG' : language === 'fa' ? 'fa-IR' : language === 'id' ? 'id-ID' : language), { day: 'numeric', month: 'short', year: 'numeric' }) : t('notifications.time_just_now')}
                                                            </span>
                                                        </div>
                                                    </Link>
                                                );
                                            })()}
                                        </div>
                                        <Link
                                            to={`/note/${heroNote.id}`}
                                            className="w-10 h-10 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-primary/10 hover:text-primary transition-colors shrink-0 outline-none"
                                        >
                                            <ChevronRight
                                                className="w-5 h-5"
                                                strokeWidth={2.5}
                                            />
                                        </Link>
                                    </div>
                                </div>

                                {/* Desktop Hero Image / Placeholder */}
                                <div className="hidden md:block w-[45%] h-[320px] overflow-hidden relative shrink-0 rounded-[2rem] bg-gray-50 dark:bg-[#1C1A29] shadow-md dark:shadow-none border border-gray-100 dark:border-white/5 group-hover/title:shadow-lg transition-all duration-500">
                                    <Link
                                        to={`/note/${heroNote.id}`}
                                        className="block w-full h-full outline-none cursor-pointer"
                                    >
                                        {heroNote.thumbnail ? (
                                            <img
                                                src={heroNote.thumbnail}
                                                alt={heroNote.title}
                                                className="w-full h-full object-cover object-center transition-transform duration-700 ease-out"
                                            />
                                        ) : (
                                            <DefaultThumbnail 
                                                className="w-full h-full" 
                                                subject={heroNote.mataPelajaran}
                                                title={heroNote.title}
                                            />
                                        )}
                                        {/* Floating badge */}
                                        <div className="absolute top-3 right-3 bg-white/90 dark:bg-black/50 backdrop-blur-sm text-gray-800 dark:text-gray-200 text-[11px] font-['Lexend_Deca'] font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1.5 z-20">
                                            <Clock className="w-3.5 h-3.5" /> {heroNote.read_time || 1}m
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* Carousel Indicators */}
                        {heroNotesCount > 1 && heroNote && (
                            <div className="flex justify-center gap-2 mb-10 -mt-6 relative z-20">
                                {[...Array(heroNotesCount)].map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentHeroIndex(idx)}
                                        className={`h-2 rounded-full transition-all duration-300 ${
                                            currentHeroIndex === idx
                                                ? "w-6 bg-primary"
                                                : "w-2 bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20"
                                        }`}
                                        aria-label={`Lihat slide ${idx + 1}`}
                                    />
                                ))}
                            </div>
                        )}

                        {/* VERTICAL FEED SECTION */}
                        <div className="mb-4 flex items-center justify-between px-2">
                            <h3 className="font-['Lexend_Deca'] font-extrabold text-[18px] text-gray-900 dark:text-gray-100 tracking-tight flex items-center gap-2">
                                {t('home.notes')}{" "}
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            </h3>
                            <Link 
                                to="/explore?tab=terbaru"
                                className="text-[13px] font-['Lexend_Deca'] font-bold text-primary hover:text-indigo-800 transition-colors"
                            >
                                {t('home.view_all')}
                            </Link>
                        </div>

                        <div className="flex flex-col">
                            {feedNotes.map((note) => (
                                <NoteCard
                                    key={note.id + '_' + Math.random().toString(36).substr(2, 5)}
                                    note={note}
                                    onLike={handleLikePost}
                                />
                            ))}
                            
                            {isLoadingMore && (
                                <>
                                    {[...Array(3)].map((_, i) => (
                                        <NoteCardSkeleton key={`more-${i}`} />
                                    ))}
                                </>
                            )}
                            
                            {!hasMore && feedNotes.length > 0 && (
                                <div className="py-8 text-center">
                                    <p className="text-gray-400 dark:text-gray-500 font-['Manrope'] text-[13px] font-medium">{t('home.all_caught_up')}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN (TRENDING SIDEBAR w/ GIANT NUMBERS) */}
                    <div className="hidden lg:block w-[280px] xl:w-[320px] shrink-0 border-l border-gray-100 dark:border-white/5 pl-6 xl:pl-10">
                        <div
                            className="sticky pt-8 pb-12"
                            style={{
                                top: "min(72px, calc(100vh - 100% - 24px))",
                            }}
                        >
                            <div className="pb-8 border-b border-gray-100 dark:border-white/5">
                                <div className="flex items-center gap-2 mb-8">
                                    <span className="flex items-center justify-center w-8 h-8 rounded-[8px] bg-[#FFF2F2] text-[#FF4D4F]">
                                        <svg
                                            width="18"
                                            height="18"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M12 21.41C16.94 21.41 21 17.5 21 12.69C21 8.86 18.29 5.56 14.54 4.34C14.07 4.19 13.57 4.41 13.34 4.86C13.1 5.31 13.21 5.86 13.6 6.2C15.82 8.16 16.48 11.45 15.2 14.12C14.93 14.67 14.28 14.88 13.72 14.61C13.16 14.33 12.92 13.64 13.18 13.08C13.69 11.99 13.63 10.73 13.04 9.7C12.78 9.24 12.27 8.97 11.73 9.02C11.19 9.07 10.74 9.42 10.57 9.94C10.15 11.23 9.09 12.18 7.85 12.44C7.03 12.61 6.22 12.41 5.57 11.91C5.17 11.6 4.6 11.66 4.27 12.04C3.41 13.02 3 14.24 3 15.5C3 18.76 5.65 21.41 9 21.41H12Z"
                                                fill="currentColor"
                                            />
                                            <path
                                                d="M12 2C11.45 2 11 2.45 11 3V5C11 5.55 11.45 6 12 6C12.55 6 13 5.55 13 5V3C13 2.45 12.55 2 12 2Z"
                                                fill="currentColor"
                                            />
                                        </svg>
                                    </span>
                                    <h3 className="font-['Lexend_Deca'] font-extrabold text-[18px] text-gray-900 dark:text-gray-100 tracking-tight">
                                        {t('home.trending')}
                                    </h3>
                                </div>

                                <div className="flex flex-col gap-6">
                                    {trendingNotes.map((trend, idx) => {
                                        const tAuth = trend.author;
                                        return (
                                            <div
                                                key={trend.id}
                                                className="group relative flex gap-4 items-start"
                                            >
                                                {/* Giant Watermark Number */}
                                                <div className="w-[36px] shrink-0 mt-[-4px]">
                                                    <span className="font-['Lexend_Deca'] font-black text-[32px] text-gray-300 dark:text-gray-600 group-hover:text-primary/60 transition-colors select-none tracking-tighter">
                                                        0{idx + 1}
                                                    </span>
                                                </div>

                                                <div className="flex flex-col flex-1 min-w-0 pt-1.5">
                                                    <Link
                                                        to={`/profile/${tAuth?.id || tAuth?._id}`}
                                                        className="flex items-center gap-1.5 mb-2 hover:opacity-80 transition-opacity"
                                                    >
                                                        <AvatarImage
                                                            src={trend.author?.avatar}
                                                            alt={trend.author?.name}
                                                            size={20}
                                                            className="rounded-[6px]"
                                                        />
                                                        <span className="text-[12px] font-['Lexend_Deca'] font-bold text-gray-700 dark:text-gray-400 group-hover/tauth:underline truncate max-w-[120px]">
                                                            {trend.author?.name}
                                                        </span>
                                                        <span className="text-[12px] font-['Manrope'] text-gray-500 font-medium">
                                                            {trend.createdAt ? new Date(trend.createdAt).toLocaleDateString((language === 'ar' ? 'ar-EG' : language === 'fa' ? 'fa-IR' : language === 'id' ? 'id-ID' : language), { day: 'numeric', month: 'short' }) : t('notifications.time_just_now')}
                                                        </span>
                                                    </Link>
                                                    <Link
                                                        to={`/note/${trend.id}`}
                                                        className="block outline-none"
                                                    >
                                                        <h4 className="font-['Lexend_Deca'] font-extrabold text-[16px] text-gray-900 dark:text-gray-100 leading-[1.3] group-hover:text-primary transition-colors line-clamp-2 tracking-tight">
                                                            {trend.title}
                                                        </h4>
                                                    </Link>
                                                    <div className="font-['Manrope'] text-[12px] text-gray-600 dark:text-gray-500 mt-2 font-bold">
                                                        {new Date(
                                                            trend.createdAt,
                                                        ).toLocaleDateString(
                                                            (language === 'ar' ? 'ar-EG' : language === 'fa' ? 'fa-IR' : language === 'id' ? 'id-ID' : language),
                                                            {
                                                                month: "long",
                                                                year: "numeric",
                                                            },
                                                        )}
                                                    </div>
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

                            {/* Discover Topics Section */}
                            <div className="py-8 border-b border-gray-100 dark:border-white/5">
                                <h3 className="font-['Lexend_Deca'] font-bold text-[16px] text-gray-900 dark:text-gray-100 tracking-tight mb-4">
                                    {t('home.explore_topics') !== 'home.explore_topics' ? t('home.explore_topics') : 'Jelajahi Topik Belajar'}
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {mataPelajaran.map((tag) => (
                                        <Link
                                            key={tag.id}
                                            to={`/explore?subject=${tag.id}`}
                                            className="px-4 py-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full text-[13px] font-['Manrope'] font-medium text-gray-700 dark:text-gray-400 transition-all border border-gray-100 dark:border-white/5"
                                        >
                                            {t('subjects.' + tag.id) !== 'subjects.' + tag.id ? t('subjects.' + tag.id) : tag.name}
                                        </Link>
                                    ))}
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
