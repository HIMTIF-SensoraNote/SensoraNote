import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useState, useEffect } from "react";
import { MobileLayout } from "../components/MobileLayout";
import { NoteCard } from "../components/NoteCard";
import { NoteCardSkeleton } from "../components/ui/skeletons";
import { DefaultThumbnail, AvatarImage } from "../components/ui/DefaultImages";
import { ProfilePictureViewer } from "../components/ProfilePictureViewer";
import {
    Settings,
    FileText,
    Bookmark,
    Heart,
    MessageCircle,
    Users,
    Shield,
    Clock,
    ChevronRight,
    Sparkles,
    MapPin,
    ShieldCheck,
    MoreHorizontal,
    Trash2,
    Pencil,
    X,
    Calendar,
    Loader2,
    HelpCircle,
} from "lucide-react";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { Link, useSearchParams, useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { useBookmarks } from "../contexts/BookmarkContext";
import { formatEducationLevel } from "../utils/formatEducationLevel";
import { formatProfileRole } from "../utils/formatProfileRole";
import { ApplyPakarModal } from "../components/ApplyPakarModal";
import axios from "axios";
import { useToast } from "../contexts/ToastContext";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { useTranslation } from "../hooks/useTranslation";

export default function ProfilePage() {
    const { t, language } = useTranslation();
    useDocumentTitle(t('titles.profile'));
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const tabParam = searchParams.get("tab") as
        | "catatan"
        | "bookmarks"
        | "aktivitas"
        | "draf";

    const [activeTab, setActiveTab] = useState<
        "catatan" | "bookmarks" | "aktivitas" | "draf"
    >(tabParam || "catatan");
    const [applyModalOpen, setApplyModalOpen] = useState(false);
    const [showUnfollowDialog, setShowUnfollowDialog] = useState(false);
    const [unfollowTarget, setUnfollowTarget] = useState<{id: string, name: string, is_private: boolean} | null>(null);
    const [isTogglingFollow, setIsTogglingFollow] = useState(false);
    
    // State untuk Modal Followers & Following
    const [showFollowers, setShowFollowers] = useState(false);
    const [showFollowing, setShowFollowing] = useState(false);

    const [followersList, setFollowersList] = useState<any[]>([]);
    const [followingList, setFollowingList] = useState<any[]>([]);
    const [pendingRequests, setPendingRequests] = useState<any[]>([]);
    const [isLoadingFollows, setIsLoadingFollows] = useState(false);

    const { user } = useAuth();

    const fetchFollowsData = async () => {
        if (!user?._id && !user?.id) return;
        const userId = user._id || user.id;
        setIsLoadingFollows(true);
        try {
            const tk = localStorage.getItem("bayu-token") || sessionStorage.getItem("bayu-token");
            const headers = { Authorization: `Bearer ${tk}` };
            
            const [followersRes, followingRes, pendingRes] = await Promise.all([
                axios.get(`/api/v1/users/${userId}/followers`),
                axios.get(`/api/v1/users/${userId}/following`),
                axios.get(`/api/v1/follow-requests`, { headers })
            ]);
            setFollowersList(followersRes.data);
            setFollowingList(followingRes.data);
            setPendingRequests(pendingRes.data);
        } catch (error) {
            console.error("Gagal mengambil data followers/following", error);
        } finally {
            setIsLoadingFollows(false);
        }
    };

    useEffect(() => {
        if (showFollowers || showFollowing) {
            fetchFollowsData();
        }
    }, [showFollowers, showFollowing]);
    const { bookmarkedIds, isBookmarked, toggleBookmark } = useBookmarks();
    const { showToast } = useToast();


    // Sync state if URL changes
    useEffect(() => {
        if (
            tabParam &&
            ["catatan", "bookmarks", "aktivitas", "draf"].includes(tabParam)
        ) {
            setActiveTab(tabParam);
            setTimeout(() => {
                const tabsEl = document.getElementById("profil-tabs");
                if (tabsEl) {
                    tabsEl.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                    });
                }
            }, 300);
        }
    }, [tabParam]);

    const handleTabChange = (tab: "catatan" | "bookmarks" | "aktivitas" | "draf") => {
        setActiveTab(tab);
        setSearchParams({ tab });
    };

    const handleFollowToggle = async (targetUserId: string, targetName?: string, isTargetPrivate?: boolean) => {
        if (!user) return;

        if (!showUnfollowDialog) {
            setUnfollowTarget({
                id: targetUserId,
                name: targetName || "Pengguna",
                is_private: isTargetPrivate ?? false
            });
            setShowUnfollowDialog(true);
            return;
        }

        setIsTogglingFollow(true);
        try {
            const tk = localStorage.getItem("bayu-token") || sessionStorage.getItem("bayu-token");
            const res = await axios.post(`/api/v1/users/${targetUserId}/follow`, {}, {
                headers: { Authorization: `Bearer ${tk}` },
            });
            
            const status = res.data.status;
            
            const updateList = (list: any[]) => list.map(u => {
                if ((u._id || u.id) === targetUserId) {
                    if (status === 'unfollowed') {
                        return { ...u, is_followed_by_me: false, is_follow_pending: false };
                    } else if (status === 'pending') {
                        return { ...u, is_followed_by_me: false, is_follow_pending: true };
                    } else {
                        return { ...u, is_followed_by_me: true, is_follow_pending: false };
                    }
                }
                return u;
            });

            setFollowersList(prev => updateList(prev));
            setFollowingList(prev => updateList(prev));
            
            if (status === 'unfollowed') showToast("Berhenti mengikuti", "info");
            else if (status === 'pending') showToast("Permintaan mengikuti dikirim", "success");
            else showToast("Berhasil mengikuti", "success");

            setShowUnfollowDialog(false);
            setUnfollowTarget(null);
        } catch (error) {
            console.error(error);
            showToast("Gagal memproses permintaan", "error");
        } finally {
            setIsTogglingFollow(false);
        }
    };

    const handleFollowAction = async (targetUserId: string) => {
        setIsTogglingFollow(true);
        try {
            const tk = localStorage.getItem("bayu-token") || sessionStorage.getItem("bayu-token");
            const res = await axios.post(`/api/v1/users/${targetUserId}/follow`, {}, {
                headers: { Authorization: `Bearer ${tk}` },
            });
            
            const status = res.data.status;
            const updateList = (list: any[]) => list.map(u => {
                if ((u._id || u.id) === targetUserId) {
                    if (status === 'pending') return { ...u, is_followed_by_me: false, is_follow_pending: true };
                    return { ...u, is_followed_by_me: true, is_follow_pending: false };
                }
                return u;
            });

            setFollowersList(prev => updateList(prev));
            setFollowingList(prev => updateList(prev));
            showToast(status === 'pending' ? "Permintaan dikirim" : "Berhasil mengikuti", "success");
        } catch (error) {
            showToast("Gagal mengikuti", "error");
        } finally {
            setIsTogglingFollow(false);
        }
    };

    const [activities, setActivities] = useState<any[]>([]);
    const [isLoadingActivities, setIsLoadingActivities] = useState(false);

    const fetchActivities = async () => {
        setIsLoadingActivities(true);
        try {
            const token =
                localStorage.getItem("bayu-token") ||
                sessionStorage.getItem("bayu-token");
            const res = await axios.get("/api/profile/activities", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setActivities(res.data.data);
        } catch (error) {
            console.error("Gagal ngambil aktivitas", error);
        } finally {
            setIsLoadingActivities(false);
        }
    };

    useEffect(() => {
        fetchActivities();
        fetchDrafts();
    }, []);

    const [drafts, setDrafts] = useState<any[]>([]);
    const [isLoadingDrafts, setIsLoadingDrafts] = useState(false);

    const fetchDrafts = async () => {
        setIsLoadingDrafts(true);
        try {
            const token =
                localStorage.getItem("bayu-token") ||
                sessionStorage.getItem("bayu-token");
            const res = await axios.get("/api/v1/drafts", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setDrafts(res.data.data);
        } catch (error) {
            console.error("Gagal ngambil draf", error);
        } finally {
            setIsLoadingDrafts(false);
        }
    };

    const [notes, setNotes] = useState<any[]>([]);
    const [isLoadingNotes, setIsLoadingNotes] = useState(true);

    const handleLikePost = async (postId: string) => {
        if (!user)
            return showToast(
                "Silakan login terlebih dahulu untuk menyukai catatan.",
                "warning",
            );

        setNotes((prev) =>
            prev.map((note) => {
                if ((note._id || note.id) === postId) {
                    const isCurrentlyLiked = note.is_liked || false;
                    return {
                        ...note,
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

    const currentUser = {
        id: user?.id || user?._id || "",
        name: user?.name || "Pengguna",
        avatar: user?.avatar || null,
        role: user?.role || "siswa",
        jenjang: user?.jenjang_pendidikan || "",
        profesi: user?.profesi || "Pelajar",
        school: user?.school || "",
        followers: user?.followers_count || 0,
        following: user?.following_count || 0,
        created_at: user?.created_at || null,
        bio: user?.bio || "",
        username: user?.username || "",
    };

    const [fetchedNotes, setFetchedNotes] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [isProfileViewerOpen, setIsProfileViewerOpen] = useState(false);
    const [totalNotesCount, setTotalNotesCount] = useState(0);

    const fetchApiNotes = async (pageNum: number) => {
        if (pageNum === 1) setIsLoadingNotes(true);
        else setIsLoadingMore(true);

        try {
            const response = await axios.get(`/api/v1/posts?user_id=${currentUser.id}&sort=terbaru&page=${pageNum}&limit=12`);
            const newData = response.data.data || response.data || [];
            
            if (pageNum === 1) {
                setFetchedNotes(newData);
            } else {
                setFetchedNotes((prev) => [...prev, ...newData]);
            }

            if (response.data.meta) {
                setHasMore(response.data.meta.has_more);
                setTotalNotesCount(response.data.meta.total || newData.length);
            } else {
                setHasMore(newData.length === 12);
                setTotalNotesCount(newData.length);
            }
        } catch (error) {
            console.error("Gagal nyedot data:", error);
        } finally {
            setIsLoadingNotes(false);
            setIsLoadingMore(false);
        }
    };

    useEffect(() => {
        if (currentUser?.id) {
            setPage(1);
            fetchApiNotes(1);
        }
    }, [currentUser?.id]);

    useEffect(() => {
        if (page > 1 && currentUser?.id) {
            fetchApiNotes(page);
        }
    }, [page, currentUser?.id]);

    useEffect(() => {
        const handleScroll = (e: Event) => {
            if (activeTab !== "catatan") return;

            const target = e.target as HTMLElement | Document;
            let isBottom = false;

            if (target === document) {
                isBottom = window.innerHeight + document.documentElement.scrollTop + 300 >= document.documentElement.offsetHeight;
            } else {
                const el = target as HTMLElement;
                isBottom = el.scrollHeight - el.scrollTop - el.clientHeight <= 300;
            }

            if (isBottom) {
                if (!isLoadingMore && hasMore && !isLoadingNotes) {
                    setPage((prev) => prev + 1);
                }
            }
        };

        const scrollContainer = document.getElementById("main-scroll-container");
        const elementToObserve = scrollContainer || window;

        elementToObserve.addEventListener("scroll", handleScroll);
        return () => elementToObserve.removeEventListener("scroll", handleScroll as EventListener);
    }, [isLoadingMore, hasMore, isLoadingNotes, activeTab]);

    const userNotes = fetchedNotes.map((note) => ({
        ...note,
        id: note._id || note.id,
        title: note.title,
        description: note.description || (note.plain_content ? note.plain_content.substring(0, 150) + "..." : ""),
        createdAt: note.created_at || "",
        thumbnail: note.thumbnail || null,
        mataPelajaran: note.mapel || note.mataPelajaran || note.mata_pelajaran || "Umum",
        jenjang: note.jenjang || "-",
        kelas: note.kelas || "-",
        semester: note.semester || "-",
        tags: note.tags || [],
        read_time: note.read_time || 1,
        isValidated: note.is_verified,
        likes: note.likes_count || 0,
        is_liked: note.is_liked || false,
        comments: note.comments_count || 0,
        views: note.views || 0,
        author: note.user
            ? {
                  ...note.user,
                  avatar: note.user.avatar || null,
              }
            : {
                  name: "Anonim",
                  avatar: null,
              },
    }));

    const [bookmarkedNotes, setBookmarkedNotes] = useState<any[]>([]);
    const [isLoadingBookmarks, setIsLoadingBookmarks] = useState(false);

    useEffect(() => {
        const fetchBookmarkedPosts = async () => {
            if (bookmarkedIds.size === 0) {
                setBookmarkedNotes([]);
                return;
            }
            setIsLoadingBookmarks(true);
            try {
                const idsParam = Array.from(bookmarkedIds).join(',');
                const response = await axios.get(`/api/v1/posts?ids=${idsParam}&sort=terbaru&limit=100`);
                const allPosts = response.data.data || [];
                setBookmarkedNotes(
                    allPosts.map((n: any) => ({
                        ...n,
                        id: n._id || n.id,
                        title: n.title,
                        description: n.description || (n.plain_content ? n.plain_content.substring(0, 150) + "..." : ""),
                        createdAt: n.created_at || "",
                        thumbnail: n.thumbnail || null,
                        mataPelajaran: n.mapel || n.mataPelajaran || n.mata_pelajaran || "Umum",
                        jenjang: n.jenjang || "-",
                        kelas: n.kelas || "-",
                        semester: n.semester || "-",
                        tags: n.tags || [],
                        read_time: n.read_time || 1,
                        isValidated: n.is_verified,
                        likes: n.likes_count || 0,
                        is_liked: n.is_liked || false,
                        comments: n.comments_count || 0,
                        views: n.views || 0,
                        author: n.user
                            ? {
                                  ...n.user,
                                  avatar: n.user.avatar || null,
                              }
                            : {
                                  name: "Anonim",
                                  avatar: null,
                              },
                    })),
                );
            } catch (err) {
                console.error("Error fetching bookmarked posts:", err);
            } finally {
                setIsLoadingBookmarks(false);
            }
        };
        fetchBookmarkedPosts();
    }, [bookmarkedIds]);

    return (
        <MobileLayout>
            {currentUser && (
                <ProfilePictureViewer
                    isOpen={isProfileViewerOpen}
                    imageUrl={currentUser.avatar || ''}
                    altText={currentUser.name}
                    onClose={() => setIsProfileViewerOpen(false)}
                />
            )}
            <div className="pb-16 bg-white dark:bg-[#13111C] min-h-screen">
                {/* 1. Cover Banner (Twitter Aspect Ratio) */}
                <div className="w-full h-32 sm:h-48 bg-gradient-to-r from-[#E0E7FF] to-[#DBEAFE] dark:from-[#1C1A29] dark:to-[#222033] relative overflow-hidden block border-b border-white/5">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.04] dark:opacity-[0.02]"></div>
                </div>

                {/* 2. Main Profile Content Container */}
                <div className="max-w-4xl mx-auto px-4 sm:px-6 relative mb-6">
                    {/* Avatar & Top Actions (Twitter Layout) */}
                    <div className="flex justify-between items-start mb-3">
                        <div className="relative -mt-12 sm:-mt-16">
                            <div 
                                className="cursor-pointer group"
                                onClick={() => setIsProfileViewerOpen(true)}
                            >
                                <AvatarImage
                                    src={currentUser.avatar}
                                    alt={currentUser.name}
                                    size={128}
                                    className="relative border-4 border-white dark:border-[#13111C] bg-white dark:bg-[#1C1A29] w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-full shadow-sm group-hover:opacity-90 transition-opacity"
                                />
                                <div className="absolute inset-0 bg-black/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"></div>
                            </div>
                        </div>

                        <div className="pt-3 flex items-center gap-2">
                            <Link
                                to="/settings/help"
                                className="p-1.5 sm:p-2 rounded-full border border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                                title="Bantuan"
                            >
                                <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                            </Link>
                            <Link
                                to="/settings"
                                className="p-1.5 sm:p-2 rounded-full border border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                                title="Pengaturan Akun"
                            >
                                <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                            </Link>
                            <Link
                                to="/edit-profile"
                                className="px-4 py-1.5 sm:px-5 sm:py-2 rounded-full border border-gray-300 dark:border-white/10 text-gray-900 dark:text-gray-100 font-bold text-[13px] sm:text-[14px] hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                            >
                                {t('profile.edit_profile')}
                            </Link>
                        </div>
                    </div>

                    {/* Profile Info - Twitter Layout (Left Aligned, Clean) */}
                    <div className="mb-5">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-[22px] sm:text-[24px] font-extrabold font-['Lexend_Deca'] text-gray-900 dark:text-gray-100 leading-tight">
                                    {currentUser.name || currentUser.username}
                                </h1>
                                {currentUser.role === "pakar" && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[12px] border border-emerald-100 dark:border-emerald-500/20">
                                        <ShieldCheck className="w-3.5 h-3.5" /> {t('profile.expert_badge')}
                                    </span>
                                )}
                                {currentUser.role === "admin" && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold text-[12px] border border-purple-100 dark:border-purple-500/20">
                                        <Shield className="w-3.5 h-3.5" /> {t('profile.admin_badge') || 'Admin'}
                                    </span>
                                )}
                            </div>
                            {currentUser.username && (
                                <p className="text-[14px] text-gray-500 dark:text-gray-400 font-medium font-['Manrope']">
                                    @{currentUser.username}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-row flex-wrap items-center gap-3 sm:gap-4 mt-3 font-['Manrope'] text-[14px] text-gray-500 dark:text-gray-400">
                                <span className="flex items-center gap-1.5">
                                    <MapPin className="w-4 h-4" /> 
                                {(() => {
                                    const p = currentUser.profesi;
                                    const j = currentUser.jenjang;
                                    const s = currentUser.school;
                                    const profesiLabel = p === "Pelajar" ? (t('edit_profile.profesi_pelajar') || p)
                                        : p === "Mahasiswa" ? (t('edit_profile.profesi_mahasiswa') || p)
                                        : p === "Pengajar" ? (t('edit_profile.profesi_pengajar') || p)
                                        : p === "Umum" ? (t('edit_profile.profesi_umum') || p)
                                        : p;
                                    const jenjangLabel = j ? (t(`edu_levels.${j}`) || j) : j;
                                    
                                    return formatProfileRole(
                                        p, j, s, 
                                        profesiLabel, 
                                        jenjangLabel, 
                                        t('edit_profile.profesi_pelajar') || "Pelajar", 
                                        t('edit_profile.profesi_umum') || "Umum", 
                                        language
                                    );
                                })()}
                                </span>
                            
                            <span className="flex items-center gap-1.5 mt-0.5">
                                <Calendar className="w-4 h-4" /> {t('profile.joined')} {currentUser.created_at ? new Date(currentUser.created_at).toLocaleDateString((language === 'ar' ? 'ar-EG' : language === 'fa' ? 'fa-IR' : language === 'id' ? 'id-ID' : language), { month: "long", year: "numeric" }) : t('profile.recently')}
                            </span>
                        </div>

                        {currentUser.bio && (
                            <p className="mt-3.5 text-[14px] text-gray-700 dark:text-gray-300 font-['Manrope'] leading-relaxed max-w-xl">
                                {currentUser.bio}
                            </p>
                        )}

                        {/* Stats - Horizontal Twitter Style */}
                        <div className="flex items-center gap-5 mt-4 text-[14px] font-['Manrope']">
                            <button 
                                onClick={() => setShowFollowing(true)}
                                className="hover:underline outline-none text-gray-500 dark:text-gray-400 transition-colors"
                            >
                                <strong className="text-gray-900 dark:text-gray-100 font-bold">{currentUser.following}</strong> {t('profile.following_count')}
                            </button>
                            
                            <button 
                                onClick={() => setShowFollowers(true)}
                                className="hover:underline outline-none text-gray-500 dark:text-gray-400 transition-colors"
                            >
                                <strong className="text-gray-900 dark:text-gray-100 font-bold">{currentUser.followers}</strong> {t('profile.followers_count')}
                            </button>
                        </div>
                    </div>

                        {currentUser.role !== "pakar" && currentUser.role !== "admin" && (
                            <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-none">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl flex items-center justify-center">
                                        <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="font-['Lexend_Deca'] font-bold text-gray-900 dark:text-gray-100 text-[14px]">
                                            {t('profile.register_expert')}
                                        </h3>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium font-['Manrope']">{t('profile.register_expert_sub')}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setApplyModalOpen(true)}
                                    className="w-full sm:w-auto bg-slate-900 dark:bg-indigo-600 hover:bg-black dark:hover:bg-indigo-700 text-white font-bold text-[13px] px-6 py-2 rounded-full transition-all shadow-sm dark:shadow-none"
                                >
                                    {t('profile.register')}
                                </button>
                            </div>
                        )}
                </div>

                {/* 3. Sticky Tab Navigation - Ba-Yu Signature Style */}
                <div
                    id="profil-tabs"
                    className="sticky top-0 bg-white dark:bg-[#13111C] z-40 border-b border-gray-100 dark:border-white/10 mb-4 pt-2"
                >
                    <div className="max-w-4xl mx-auto px-4 sm:px-6">
                        <div className="flex gap-8 overflow-x-auto scrollbar-hide px-1">
                            {[
                                { id: "catatan", label: t('profile.tab_notes'), count: totalNotesCount },
                                { id: "draf", label: t('profile.tab_drafts'), count: drafts.length },
                                { id: "bookmarks", label: t('profile.tab_saved'), count: bookmarkedIds.size },
                                { id: "aktivitas", label: t('profile.tab_activity'), count: activities.length },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => handleTabChange(tab.id as any)}
                                    className={`relative cursor-pointer pb-4 font-['Lexend_Deca'] font-bold text-[15px] whitespace-nowrap transition-colors flex items-center gap-2 ${
                                        activeTab === tab.id
                                            ? "text-gray-950 dark:text-gray-100"
                                            : "text-gray-500 dark:text-gray-400 hover:text-gray-950 dark:hover:text-gray-200"
                                    }`}
                                >
                                    {tab.label}
                                    <span
                                        className={`px-2 py-0.5 rounded-full text-[11px] font-bold transition-colors ${
                                            activeTab === tab.id 
                                            ? "bg-primary/10 text-primary" 
                                            : "bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400"
                                        }`}
                                    >
                                        {tab.count}
                                    </span>
                                    {activeTab === tab.id && (
                                        <div className="absolute bottom-0 left-0 w-full h-[3px] bg-primary rounded-t-full transition-all duration-300"></div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 4. Tab Panels - Ba-Yu Classic Card Styles */}
                <div className="max-w-4xl mx-auto px-4 sm:px-6 min-h-[400px]">
                    {activeTab === "catatan" && (
                        <div className="flex flex-col animate-in fade-in duration-500 w-full">
                            {isLoadingNotes ? (
                                <div className="space-y-6 pt-4">
                                    {[...Array(3)].map((_, i) => (
                                        <NoteCardSkeleton key={i} />
                                    ))}
                                </div>
                            ) : userNotes.length > 0 ? (
                                <>
                                    {userNotes.map((note) => (
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
                                    
                                    {!hasMore && userNotes.length > 0 && (
                                        <div className="py-8 text-center">
                                            <p className="text-gray-400 dark:text-gray-500 font-['Manrope'] text-[13px] font-medium">{t('profile.all_notes_loaded')}</p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="py-20 text-center flex flex-col items-center justify-center">
                                    <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                                        <FileText className="w-8 h-8 text-gray-400 dark:text-gray-600" />
                                    </div>
                                    <h3 className="font-['Lexend_Deca'] font-bold text-gray-900 dark:text-gray-100 text-[18px] mb-2">
                                        {t('profile.no_releases')}
                                    </h3>
                                    <p className="font-['Manrope'] text-[14px] text-gray-500 mb-6 max-w-sm mx-auto">
                                        {t('profile.no_releases_sub')}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "bookmarks" && (
                        <div className="flex flex-col animate-in fade-in duration-500 w-full">
                            {isLoadingBookmarks ? (
                                <div className="space-y-6 pt-4">
                                    {[...Array(3)].map((_, i) => (
                                        <NoteCardSkeleton key={i} />
                                    ))}
                                </div>
                            ) : bookmarkedNotes.length > 0 ? (
                                bookmarkedNotes.map((note) => (
                                    <NoteCard
                                        key={note.id}
                                        note={note}
                                        onLike={handleLikePost}
                                    />
                                ))
                            ) : (
                                <div className="py-20 text-center flex flex-col items-center justify-center">
                                    <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                                        <Bookmark className="w-8 h-8 text-gray-400 dark:text-gray-600" />
                                    </div>
                                    <h3 className="font-['Lexend_Deca'] font-bold text-gray-900 dark:text-gray-100 text-[18px] mb-2">{t('profile.empty_saved')}</h3>
                                    <p className="font-['Manrope'] text-[14px] text-gray-500 mb-6">{t('profile.empty_saved_sub')}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "draf" && (
                        <div className="flex flex-col animate-in fade-in duration-500 w-full">
                            {isLoadingDrafts ? (
                                <div className="space-y-6 pt-4">
                                    {[...Array(2)].map((_, i) => (
                                        <NoteCardSkeleton key={i} />
                                    ))}
                                </div>
                            ) : drafts.length > 0 ? (
                                drafts.map((draft: any) => {
                                    const draftData = {
                                        id: draft._id || draft.id,
                                        title: draft.title || "",
                                        description: draft.plain_content || draft.description || "",
                                        thumbnail: draft.thumbnail || null,
                                        author: {
                                            id: user?.id || user?._id || "",
                                            name: user?.name || "",
                                            avatar: user?.avatar || null
                                        },
                                        mataPelajaran: draft.mapel || "Umum",
                                        jenjang: draft.jenjang,
                                        kelas: draft.kelas,
                                        semester: draft.semester,
                                        createdAt: draft.created_at || draft.createdAt,
                                        updatedAt: draft.updated_at || draft.created_at,
                                        tags: draft.tags || []
                                    };
                                    return (
                                        <NoteCard
                                            key={draftData.id}
                                            note={draftData as any}
                                            isDraft={true}
                                        />
                                    );
                                })
                            ) : (
                                <div className="py-20 text-center flex flex-col items-center justify-center">
                                    <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                                        <FileText className="w-8 h-8 text-gray-400 dark:text-gray-600" />
                                    </div>
                                    <h3 className="font-['Lexend_Deca'] font-bold text-gray-900 dark:text-gray-100 text-[18px] mb-2">{t('profile.no_drafts')}</h3>
                                    <p className="font-['Manrope'] text-[14px] text-gray-500 mb-6">{t('profile.no_drafts_sub')}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "aktivitas" && (
                        <div className="w-full animate-in fade-in duration-500">
                            {isLoadingActivities ? (
                                <div className="flex flex-col gap-4 pt-4">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="p-5 border border-gray-100 dark:border-white/5 rounded-3xl bg-white dark:bg-[#1C1A29] animate-pulse flex flex-col gap-4">
                                            <div className="flex gap-3">
                                                <div className="w-16 h-5 bg-gray-100 dark:bg-white/10 rounded-full"></div>
                                                <div className="w-32 h-5 bg-gray-100 dark:bg-white/10 rounded-full"></div>
                                            </div>
                                            <div className="flex gap-4">
                                                <div className="w-10 h-10 bg-gray-100 dark:bg-white/10 rounded-full shrink-0"></div>
                                                <div className="flex-1 space-y-2">
                                                    <div className="h-4 bg-gray-100 dark:bg-white/10 rounded w-full"></div>
                                                    <div className="h-4 bg-gray-100 dark:bg-white/10 rounded w-4/5"></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : activities.length > 0 ? (
                                <div className="flex flex-col gap-6 animate-in fade-in duration-500 w-full">
                                    {activities.map((activity: any) => (
                                        <article
                                            key={activity.id}
                                            onClick={() => navigate(`/note/${activity.post_id}#comment-${activity.id}`)}
                                            className="group relative flex flex-col sm:flex-row items-start gap-5 p-5 bg-white dark:bg-[#1C1A29] rounded-[24px] border border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10 shadow-[0_8px_30px_-10px_rgba(0,0,0,0.06)] dark:shadow-none hover:shadow-[0_12px_40px_-10px_rgba(0,0,0,0.1)] transition-all duration-300 cursor-pointer overflow-hidden"
                                        >
                                            <div className="w-full sm:w-[140px] h-[160px] sm:h-[120px] shrink-0 rounded-[20px] overflow-hidden bg-gray-50 dark:bg-white/5 relative border border-gray-100/50 dark:border-white/5 shadow-sm">
                                                {activity.post?.thumbnail ? (
                                                    <img src={activity.post.thumbnail} alt={activity.post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                                                ) : (
                                                    <DefaultThumbnail 
                                                        className="w-full h-full group-hover:scale-105 transition-transform duration-700 ease-out" 
                                                        subject={activity.post?.mapel}
                                                        title={activity.post?.title}
                                                    />
                                                )}
                                                <div className="absolute top-2 left-2 bg-white/90 dark:bg-[#13111C]/90 backdrop-blur-md text-gray-800 dark:text-gray-200 text-[10px] font-['Lexend_Deca'] font-bold px-2.5 py-1 rounded-lg shadow-sm flex items-center gap-1.5 border border-white/20">
                                                    <MessageCircle className="w-3 h-3 text-indigo-500" /> {t('profile.discussion_label')}
                                                </div>
                                            </div>

                                            <div className="flex-1 min-w-0 flex flex-col h-full text-left py-1 w-full">
                                                <div className="flex items-center gap-1.5 mb-2.5 text-[12.5px] font-['Manrope'] text-slate-500 dark:text-slate-400 font-medium line-clamp-1">
                                                    <span>{activity.parent_comment_id ? t('profile.activity_reply') : t('profile.activity_discuss')}</span>
                                                    <span className="font-['Lexend_Deca'] font-bold text-slate-900 dark:text-gray-100">{activity.post?.title || t('profile.activity_note')}</span>
                                                </div>

                                                <div className="mb-4 bg-slate-50/80 dark:bg-white/5 rounded-2xl p-4 border border-slate-100 dark:border-white/5 relative">
                                                    <div className="absolute -left-[5px] top-4 w-3 h-3 bg-slate-50/80 dark:bg-[#1E1C2E] border-t border-l border-slate-100 dark:border-white/5 rotate-[-45deg] z-0 hidden sm:block"></div>
                                                    <h2 className="relative z-10 text-[14.5px] font-medium text-slate-700 dark:text-gray-300 leading-relaxed font-['Manrope'] line-clamp-3 italic">
                                                        "{activity.content}"
                                                    </h2>
                                                </div>

                                                <div className="flex items-center justify-between mt-auto">
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex items-center gap-1.5 text-gray-500">
                                                            <Clock className="w-3.5 h-3.5" />
                                                            <span className="text-[12px] font-['Manrope'] font-bold">
                                                                {activity.created_at ? new Date(activity.created_at).toLocaleDateString((language === 'ar' ? 'ar-EG' : language === 'fa' ? 'fa-IR' : language === 'id' ? 'id-ID' : language), { month: "short", day: "numeric", year: "numeric" }) : t('profile.recently')}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-gray-500 group-hover:text-pink-500 transition-colors">
                                                            <Heart className="w-3.5 h-3.5" />
                                                            <span className="text-[12px] font-bold">{activity.likes_count || 0}</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                                <button className="p-1.5 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200/50 dark:border-white/5 transition-colors">
                                                                    <MoreHorizontal className="w-5 h-5" />
                                                                </button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-40 font-['Manrope'] rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-gray-100 dark:border-white/10 p-2">
                                                                <DropdownMenuItem 
                                                                    className="cursor-pointer text-slate-700 dark:text-slate-300 font-semibold focus:bg-indigo-50 focus:text-indigo-600 dark:focus:bg-indigo-500/10 dark:focus:text-indigo-400 rounded-xl py-2.5"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        navigate(`/note/${activity.post_id}?edit_comment=${activity.id}#comment-${activity.id}`);
                                                                    }}
                                                                >
                                                                    <Pencil className="w-4 h-4 mr-2.5" /> {t('profile.edit')}
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem 
                                                                    className="cursor-pointer text-red-600 dark:text-red-400 font-semibold focus:bg-red-50 focus:text-red-700 dark:focus:bg-red-500/10 dark:focus:text-red-300 rounded-xl py-2.5"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        showToast(t('profile.delete_comment_soon'), "info");
                                                                    }}
                                                                >
                                                                    <Trash2 className="w-4 h-4 mr-2.5" /> {t('profile.delete')}
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </div>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-20 text-center flex flex-col items-center justify-center">
                                    <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                                        <MessageCircle className="w-8 h-8 text-gray-400 dark:text-gray-600" />
                                    </div>
                                    <h3 className="font-['Lexend_Deca'] font-bold text-gray-900 dark:text-gray-100 text-[18px] mb-2">{t('profile.no_history')}</h3>
                                    <p className="font-['Manrope'] text-[14px] text-gray-500 max-w-sm mx-auto">{t('profile.no_history_sub')}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Followers Clean */}
            {showFollowers && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/20 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowFollowers(false)}>
                    <div className="bg-white dark:bg-[#1C1A29] w-full max-w-sm rounded-2xl shadow-xl dark:shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/5">
                            <h3 className="font-['Lexend_Deca'] font-bold text-gray-900 dark:text-gray-100 text-[16px]">{t('profile.followers_modal')}</h3>
                            <button onClick={() => setShowFollowers(false)} className="text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-4 max-h-[60vh] overflow-y-auto">
                            {isLoadingFollows ? (
                                <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-gray-400"/></div>
                            ) : followersList.length > 0 ? (
                                <div className="flex flex-col">
                                    {pendingRequests.length > 0 && (
                                        <div 
                                            onClick={() => { setShowFollowers(false); navigate("/settings/follow-requests"); }}
                                            className="flex items-center justify-between p-3 mb-4 bg-primary/[0.03] dark:bg-primary/[0.08] hover:bg-primary/[0.06] dark:hover:bg-primary/[0.12] rounded-2xl cursor-pointer transition-all border border-primary/10 dark:border-primary/20 group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="flex -space-x-3">
                                                    {pendingRequests.slice(0, 3).map((req, idx) => (
                                                        <div key={idx} className="relative ring-2 ring-white dark:ring-[#1C1A29] rounded-full overflow-hidden w-8 h-8">
                                                            <AvatarImage 
                                                                src={req.follower_user?.avatar} 
                                                                alt={req.follower_user?.name} 
                                                                size={32}
                                                            />
                                                        </div>
                                                    ))}
                                                    {pendingRequests.length > 3 && (
                                                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center text-[10px] font-bold text-gray-600 dark:text-gray-400 ring-2 ring-white dark:ring-[#1C1A29]">
                                                            +{pendingRequests.length - 3}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[14px] font-bold text-gray-900 dark:text-gray-100 leading-tight">
                                                        {t('profile.follow_requests')}
                                                    </span>
                                                    <span className="text-[12px] text-primary font-semibold">
                                                        {pendingRequests.length} {t('profile.people_waiting')}
                                                    </span>
                                                </div>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    )}
                                    {followersList.map((f, i) => (
                                        <div 
                                            key={i} 
                                            className={`flex items-center gap-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors px-2 ${i !== followersList.length - 1 ? 'border-b border-gray-100 dark:border-white/5' : ''}`} 
                                        >
                                            <div className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer" onClick={() => { setShowFollowers(false); navigate(`/profile/${f._id || f.id}`); }}>
                                                <AvatarImage src={f.avatar} alt={f.name} size={46} className="rounded-full ring-2 ring-slate-100 dark:ring-white/5" />
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-['Lexend_Deca'] font-bold text-[15px] text-gray-900 dark:text-gray-100 leading-tight truncate">{f.name}</h4>
                                                    <p className="font-['Manrope'] text-[13px] text-gray-500 capitalize mt-0.5 truncate">{f.role}</p>
                                                </div>
                                            </div>
                                            {f._id !== user?.id && f.id !== user?.id && (
                                                <button 
                                                    className={`px-4 py-1.5 rounded-full text-[12px] font-bold font-['Manrope'] transition-all ${
                                                        f.is_followed_by_me 
                                                            ? 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/15' 
                                                            : f.is_follow_pending
                                                                ? 'bg-gray-50 dark:bg-white/5 text-gray-400 dark:text-gray-500 cursor-default'
                                                                : 'bg-primary text-white hover:bg-primary/90 shadow-sm'
                                                    }`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (f.is_followed_by_me) {
                                                            handleFollowToggle(f._id || f.id, f.name, f.is_private);
                                                        } else if (!f.is_follow_pending) {
                                                            handleFollowAction(f._id || f.id);
                                                        }
                                                    }}
                                                >
                                                    {f.is_followed_by_me ? t('profile.following') : f.is_follow_pending ? t('profile.requested') : t('profile.follow')}
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <Users className="w-10 h-10 text-gray-200 mb-3" />
                                    <h4 className="font-['Lexend_Deca'] font-semibold text-gray-900 dark:text-gray-100 text-[15px] mb-1">{t('profile.no_followers')}</h4>
                                    <p className="font-['Manrope'] text-[14px] text-gray-500">{t('profile.no_followers_sub')}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Following Clean */}
            {showFollowing && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/20 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowFollowing(false)}>
                    <div className="bg-white dark:bg-[#1C1A29] w-full max-w-sm rounded-2xl shadow-xl dark:shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/5">
                            <h3 className="font-['Lexend_Deca'] font-bold text-gray-900 dark:text-gray-100 text-[16px]">{t('profile.following_modal')}</h3>
                            <button onClick={() => setShowFollowing(false)} className="text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-4 max-h-[60vh] overflow-y-auto">
                            {isLoadingFollows ? (
                                <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-gray-400"/></div>
                            ) : followingList.length > 0 ? (
                                <div className="flex flex-col">
                                    {followingList.map((f, i) => (
                                        <div 
                                            key={i} 
                                            className={`flex items-center gap-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors px-2 ${i !== followingList.length - 1 ? 'border-b border-gray-100 dark:border-white/5' : ''}`} 
                                        >
                                            <div className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer" onClick={() => { setShowFollowing(false); navigate(`/profile/${f._id || f.id}`); }}>
                                                <AvatarImage src={f.avatar} alt={f.name} size={46} className="rounded-full ring-2 ring-slate-50 dark:ring-white/5" />
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-['Lexend_Deca'] font-bold text-[15px] text-gray-900 dark:text-gray-100 leading-tight truncate">{f.name}</h4>
                                                    <p className="font-['Manrope'] text-[13px] text-gray-500 capitalize mt-0.5 truncate">{f.role}</p>
                                                </div>
                                            </div>
                                            {f._id !== user?.id && f.id !== user?.id && (
                                                <button 
                                                    className={`px-4 py-1.5 rounded-full text-[12px] font-bold font-['Manrope'] transition-all ${
                                                        f.is_followed_by_me 
                                                            ? 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/15' 
                                                            : f.is_follow_pending
                                                                ? 'bg-gray-50 dark:bg-white/5 text-gray-400 dark:text-gray-500 cursor-default'
                                                                : 'bg-primary text-white hover:bg-primary/90 shadow-sm'
                                                    }`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (f.is_followed_by_me) {
                                                            handleFollowToggle(f._id || f.id, f.name, f.is_private);
                                                        } else if (!f.is_follow_pending) {
                                                            handleFollowAction(f._id || f.id);
                                                        }
                                                    }}
                                                >
                                                    {f.is_followed_by_me ? t('profile.following') : f.is_follow_pending ? t('profile.requested') : t('profile.follow')}
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <Users className="w-10 h-10 text-gray-200 mb-3" />
                                    <h4 className="font-['Lexend_Deca'] font-semibold text-gray-900 dark:text-gray-100 text-[15px] mb-1">{t('profile.empty_following')}</h4>
                                    <p className="font-['Manrope'] text-[14px] text-gray-500 mb-5">{t('profile.empty_following_sub')}</p>
                                    <button onClick={() => {setShowFollowing(false); navigate("/explore")}} className="px-5 py-2 bg-gray-900 text-white rounded-full font-medium text-[13px] hover:bg-black transition-colors">
                                        {t('profile.find_creator')}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <ConfirmDialog
                isOpen={showUnfollowDialog}
                onOpenChange={(open) => {
                    setShowUnfollowDialog(open);
                    if (!open) setUnfollowTarget(null);
                }}
                onConfirm={() => handleFollowToggle(unfollowTarget?.id!)}
                title={`${t('profile.unfollow_title')} ${unfollowTarget?.name}?`}
                description={unfollowTarget?.is_private 
                    ? t('profile.unfollow_private_desc')
                    : `${t('profile.unfollow_public_desc')} ${unfollowTarget?.name} ${t('profile.unfollow_public_desc_end')}`}
                confirmText={isTogglingFollow ? t('profile.processing') : t('profile.confirm_unfollow')}
                cancelText={t('profile.cancel')}
                variant="danger"
            />

            <ApplyPakarModal
                isOpen={applyModalOpen}
                onClose={() => setApplyModalOpen(false)}
            />
        </MobileLayout>
    );
}