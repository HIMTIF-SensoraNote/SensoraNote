"use client";

import * as React from "react";
import {
    Bell,
    Shield,
    AlertCircle,
    CheckCheck,
    Heart, 
    MessageCircle, 
    UserPlus 
} from "lucide-react";
import { Avatar, AvatarFallback } from "./avatar";
import { Button } from "./button";
import { cn } from "../../lib/utils";
import { motion, AnimatePresence } from "motion/react";
import axios from "axios";
import { useNavigate } from "react-router";
import { useAuth } from "../../contexts/AuthContext";
import { AvatarImage } from "./DefaultImages";
import { useTranslation } from "../../hooks/useTranslation";
import { useNotificationTranslator } from "../../hooks/useNotificationTranslator";

interface NotificationItem {
    id?: string;
    _id?: string;
    user_id: string;
    title: string;
    message: string;
    type: string;
    link?: string;
    is_read: boolean;
    created_at: string;
    actor?: {
        _id: string;
        name: string;
        avatar: string;
    };
}

export default function AvatarNotifications() {
    const [notifications, setNotifications] = React.useState<NotificationItem[]>([]);
    const { user } = useAuth();
    const navigate = useNavigate();
    const [open, setOpen] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const { t, language } = useTranslation();
    const { translateNotification } = useNotificationTranslator();

    const fetchNotifications = async () => {
        try {
            const token =
                localStorage.getItem("bayu-token") ||
                sessionStorage.getItem("bayu-token");
            const res = await axios.get("/api/v1/notifikasi", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setNotifications(res.data.data || []);
        } catch (err) {
            console.error("Gagal fetch notifikasi:", err);
        }
    };

    React.useEffect(() => {
        if (user && open) {
            fetchNotifications();
        } else if (user && !open && notifications.length === 0) {
            fetchNotifications();
        }
    }, [user, open]);

    React.useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const clearAll = async () => {
        try {
            const token =
                localStorage.getItem("bayu-token") ||
                sessionStorage.getItem("bayu-token");
            await axios.put(
                "/api/v1/notifikasi/read-all",
                {},
                {
                    headers: { Authorization: `Bearer ${token}` },
                },
            );
            setNotifications((prev) =>
                prev.map((n) => ({ ...n, is_read: true })),
            );
        } catch (err) {
            console.error("Failed to mark all as read", err);
        }
    };

    const handleMarkAsRead = async (
        id: string,
        is_read: boolean,
        type: string,
        link?: string,
    ) => {
        if (!is_read) {
            try {
                const token =
                    localStorage.getItem("bayu-token") ||
                    sessionStorage.getItem("bayu-token");
                await axios.put(
                    `/api/v1/notifikasi/${id}/read`,
                    {},
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    },
                );
                setNotifications((prev) =>
                    prev.map((n) =>
                        (n._id || n.id) === id ? { ...n, is_read: true } : n,
                    ),
                );
            } catch (err) {
                console.error("Failed to mark as read", err);
            }
        }
        setOpen(false);
        if (link) {
            navigate(link);
        } else if (type === "report") {
            if (user?.role === "admin") {
                navigate("/admin", { state: { tab: "laporan" } });
            } else {
                navigate(`/notifications/${id}`);
            }
        } else if (type === "sertifikasi") {
            if (user?.role === "admin") {
                navigate("/admin", { state: { tab: "sertifikasi" } });
            } else {
                navigate(`/notifications/${id}`);
            }
        } else {
            navigate(`/notifications/${id}`);
        }
    };

    const unreadCount = notifications.filter((n) => !n.is_read).length;
    const hasNotifications = unreadCount > 0;

    function timeAgo(dateStr: string) {
        const diffMin = Math.floor(
            (new Date().getTime() - new Date(dateStr).getTime()) / 60000,
        );
        if (diffMin < 1) return t('notifications.time_just_now') !== 'notifications.time_just_now' ? t('notifications.time_just_now') : "Baru saja";
        if (diffMin < 60) return `${diffMin}${t('notifications.time_short_m') !== 'notifications.time_short_m' ? t('notifications.time_short_m') : 'm'}`;
        const diffHr = Math.floor(diffMin / 60);
        if (diffHr < 24) return `${diffHr}${t('notifications.time_short_h') !== 'notifications.time_short_h' ? t('notifications.time_short_h') : 'j'}`;
        if (diffHr < 48) return t('notifications.time_yesterday') !== 'notifications.time_yesterday' ? t('notifications.time_yesterday') : "Kemarin";
        return new Date(dateStr).toLocaleDateString((language === 'ar' ? 'ar-EG' : language === 'fa' ? 'fa-IR' : language === 'id' ? 'id-ID' : language), {
            day: "numeric",
            month: "short",
        });
    }

    const getIcon = (type: string) => {
        if (type === "sertifikasi")
            return <Shield className="w-4 h-4 text-indigo-500" />;
        if (type === "report")
            return <AlertCircle className="w-4 h-4 text-rose-500" />;
        if (type === "verifikasi")
            return <CheckCheck className="w-4 h-4 text-emerald-500" />;
        if (type === "like") return <Heart className="w-4 h-4 text-pink-500" />;
        if (type === "comment")
            return <MessageCircle className="w-4 h-4 text-blue-500" />;
        if (type === "follow")
            return <UserPlus className="w-4 h-4 text-purple-500" />;
        return <Bell className="w-4 h-4 text-gray-500" />;
    };

    return (
        <div className="relative" ref={containerRef}>
            <button 
                onClick={() => setOpen(!open)}
                className="relative inline-flex items-center justify-center rounded-full p-[6px] hover:bg-gray-100 dark:hover:bg-white/5 transition-colors focus:outline-none"
            >
                <Bell className="h-[22px] w-[22px] text-gray-700 dark:text-gray-300" strokeWidth={1.5} />
                <span
                    className={cn(
                        "absolute top-1 right-1 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-[#13111C]",
                        hasNotifications ? "bg-red-500 animate-pulse" : "hidden"
                    )}
                />
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute right-0 top-[48px] w-[320px] p-0 rounded-2xl shadow-xl dark:shadow-none overflow-hidden border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1C1A29] z-50"
                    >
                <div className="max-h-[350px] overflow-y-auto scrollbar-hide bg-white dark:bg-[#1C1A29]">
                    <div className="flex justify-between items-center px-5 py-4 bg-white dark:bg-[#1C1A29] sticky top-0 z-10 border-b border-gray-200 dark:border-white/10">
                        <div className="flex items-center gap-2">
                            <h2 className="text-[15px] font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                                {t('notifications.title') !== 'notifications.title' ? t('notifications.title') : 'Notifikasi'}
                            </h2>
                            {hasNotifications && (
                                <span className="bg-indigo-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                                    {unreadCount}
                                </span>
                            )}
                        </div>
                        {hasNotifications && (
                            <button
                                onClick={clearAll}
                                className="text-[12px] font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
                            >
                                {t('notifications.mark_all_read') !== 'notifications.mark_all_read' ? t('notifications.mark_all_read') : 'Tandai dibaca'}
                            </button>
                        )}
                    </div>
                    
                    {notifications.length === 0 ? (
                        <div className="py-12 px-6 text-[13px] text-gray-400 dark:text-gray-500 text-center flex flex-col items-center gap-3">
                            <div className="w-12 h-12 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center">
                                <Bell className="w-6 h-6 text-gray-300 dark:text-gray-600" />
                            </div>
                            <p className="font-medium">{t('notifications.no_unread') !== 'notifications.no_unread' ? t('notifications.no_unread') : 'Belum ada kabar terbaru'}</p>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {notifications.slice(0, 8).map((rawItem) => {
                                const item = translateNotification(rawItem);
                                return (
                                <div
                                    key={item._id || item.id}
                                    onClick={() =>
                                        handleMarkAsRead(
                                            (item._id || item.id) as string,
                                            item.is_read,
                                            item.type,
                                            item.link,
                                        )
                                    }
                                    className={cn(
                                        "group relative flex items-start gap-3 p-4 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors border-b border-gray-100 dark:border-white/5 last:border-0",
                                        !item.is_read && "bg-indigo-50/50 dark:bg-indigo-500/10"
                                    )}
                                >
                                    
                                    <div className="relative shrink-0 mt-0.5">
                                        <div
                                            className={cn(
                                                "h-10 w-10 rounded-full flex items-center justify-center shadow-sm border border-gray-200 dark:border-white/10 overflow-hidden bg-white dark:bg-[#1C1A29]",
                                                !item.is_read && "ring-2 ring-indigo-500 ring-offset-1 dark:ring-offset-[#1C1A29]"
                                            )}
                                        >
                                            {item.actor ? (
                                                <AvatarImage 
                                                    src={item.actor.avatar} 
                                                    alt={item.actor.name}
                                                    size={40}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className={cn(
                                                    "h-full w-full flex items-center justify-center",
                                                    item.type === "sertifikasi" ? "bg-indigo-50 dark:bg-indigo-500/10" :
                                                    item.type === "report" ? "bg-rose-50 dark:bg-rose-500/10" :
                                                    item.type === "verifikasi" ? "bg-emerald-50 dark:bg-emerald-500/10" :
                                                    item.type === "like" ? "bg-pink-50 dark:bg-pink-500/10" :
                                                    item.type === "comment" ? "bg-blue-50 dark:bg-blue-500/10" :
                                                    item.type === "follow" ? "bg-purple-50 dark:bg-purple-500/10" : "bg-gray-50 dark:bg-white/5"
                                                )}>
                                                    {getIcon(item.type)}
                                                </div>
                                            )}
                                        </div>
                                        {/* Mini Type Icon Badge */}
                                        {item.actor && (
                                            <div className={cn(
                                                "absolute -right-1 -bottom-1 w-[18px] h-[18px] rounded-full flex items-center justify-center border-2 border-white dark:border-[#1C1A29] shadow-sm",
                                                item.type === "sertifikasi" ? "bg-indigo-500 text-white" :
                                                item.type === "report" ? "bg-rose-500 text-white" :
                                                item.type === "verifikasi" ? "bg-emerald-500 text-white" :
                                                item.type === "like" ? "bg-pink-500 text-white" :
                                                item.type === "comment" ? "bg-blue-500 text-white" :
                                                item.type === "follow" ? "bg-purple-500 text-white" : "bg-gray-500 text-white"
                                            )}>
                                                {React.cloneElement(getIcon(item.type) as React.ReactElement, { className: "w-2.5 h-2.5 text-white" })}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-col gap-1">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex items-start gap-2 min-w-0">
                                                {!item.is_read && (
                                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0"></div>
                                                )}
                                                <div className="flex flex-col gap-1 min-w-0">
                                                    <p className={cn(
                                                        "text-[13px] leading-relaxed line-clamp-2",
                                                        !item.is_read ? "text-gray-900 dark:text-gray-100 font-bold" : "text-gray-600 dark:text-gray-400"
                                                    )}>
                                                        {item.translatedMessage}
                                                    </p>
                                                    <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                                                        {timeAgo(item.created_at)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )})}
                        </div>
                    )}
                </div>
                <div className="p-2 border-t border-gray-200 dark:border-white/10 bg-white dark:bg-[#1C1A29]">
                    <button
                        onClick={() => {
                            setOpen(false);
                            navigate("/notifications");
                        }}
                        className="w-full py-2.5 text-[13px] font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-full transition-colors"
                    >
                        {t('notifications.view_all_notifications') !== 'notifications.view_all_notifications' ? t('notifications.view_all_notifications') : 'Lihat Semua Notifikasi'}
                    </button>
                </div>
            </motion.div>
            )}
            </AnimatePresence>
        </div>
    );
}
