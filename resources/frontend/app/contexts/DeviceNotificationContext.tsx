import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router';
import { useAuth } from './AuthContext';

interface DeviceNotificationContextType {
    permission: NotificationPermission;
    requestDevicePermission: () => Promise<NotificationPermission>;
    isSupported: boolean;
}

const DeviceNotificationContext = createContext<DeviceNotificationContextType>({
    permission: 'default',
    requestDevicePermission: async () => 'default',
    isSupported: false,
});

export const useDeviceNotification = () => useContext(DeviceNotificationContext);

export function DeviceNotificationProvider({ children }: { children: ReactNode }) {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [permission, setPermission] = useState<NotificationPermission>(() => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            return Notification.permission;
        }
        return 'denied';
    });

    const [isSupported, setIsSupported] = useState<boolean>(false);
    const notifiedIdsRef = useRef<Set<string>>(new Set());
    const notifiedScheduleRef = useRef<Set<string>>(new Set());

    // Check notification support
    useEffect(() => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            setIsSupported(true);
            setPermission(Notification.permission);
        }
    }, []);

    // Load already notified IDs from sessionStorage to prevent spamming on page reload
    useEffect(() => {
        try {
            const stored = sessionStorage.getItem('sensoranote_seen_notif_ids');
            if (stored) {
                const arr = JSON.parse(stored);
                notifiedIdsRef.current = new Set(arr);
            }
        } catch (e) {
            console.warn('Failed to parse seen notification ids', e);
        }
    }, []);

    const saveNotifiedIds = () => {
        try {
            const arr = Array.from(notifiedIdsRef.current).slice(-200); // keep last 200
            sessionStorage.setItem('sensoranote_seen_notif_ids', JSON.stringify(arr));
        } catch (e) {}
    };

    // Request native permission
    const requestDevicePermission = async (): Promise<NotificationPermission> => {
        if (!isSupported) return 'denied';
        try {
            const result = await Notification.requestPermission();
            setPermission(result);

            // Also initialize Capacitor native push if on mobile app
            try {
                const { Capacitor } = await import('@capacitor/core');
                if (Capacitor.isNativePlatform()) {
                    const { PushNotifications } = await import('@capacitor/push-notifications');
                    let permStatus = await PushNotifications.checkPermissions();
                    if (permStatus.receive === 'prompt') {
                        permStatus = await PushNotifications.requestPermissions();
                    }
                    if (permStatus.receive === 'granted') {
                        await PushNotifications.register();
                    }
                }
            } catch (err) {
                console.warn('Capacitor push init skipped on web', err);
            }

            return result;
        } catch (error) {
            console.error('Error requesting notification permission', error);
            return 'denied';
        }
    };

    // Auto-prompt permission when user logs in if not yet asked
    useEffect(() => {
        if (isAuthenticated && isSupported && Notification.permission === 'default') {
            // Small delay so user isn't immediately bombarded on first load
            const timer = setTimeout(() => {
                requestDevicePermission();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isAuthenticated, isSupported]);

    // Dispatch Native Device Notification helper
    const dispatchDeviceNotification = (
        title: string,
        options: {
            body: string;
            icon?: string;
            badge?: string;
            tag?: string;
            link?: string;
            data?: any;
        }
    ) => {
        if (!isSupported || Notification.permission !== 'granted') return;

        try {
            const iconUrl = options.icon || '/logo.png';
            const notif = new Notification(title, {
                body: options.body,
                icon: iconUrl,
                badge: iconUrl,
                tag: options.tag || String(Date.now()),
                data: { link: options.link || '/notifications', ...options.data },
            });

            notif.onclick = (event) => {
                event.preventDefault();
                window.focus();
                notif.close();
                if (options.link) {
                    navigate(options.link);
                }
            };
        } catch (err) {
            console.error('Error creating Notification instance:', err);
        }
    };

    // 1. Poll Unread Notifications from Backend (Follow, Request, Like, Comment, Schedule)
    useEffect(() => {
        if (!isAuthenticated) return;

        const checkBackendNotifications = async () => {
            if (Notification.permission !== 'granted') return;

            try {
                const token = localStorage.getItem('bayu-token') || sessionStorage.getItem('bayu-token');
                if (!token) return;

                const res = await axios.get('/api/v1/notifikasi', {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const notifList: any[] = res.data.data || [];
                
                // If it's the very first fetch on login, seed the ref with existing IDs so we don't spam old notifications
                if (notifiedIdsRef.current.size === 0 && notifList.length > 0) {
                    notifList.forEach((n) => {
                        const nid = String(n._id || n.id);
                        notifiedIdsRef.current.add(nid);
                    });
                    saveNotifiedIds();
                    return;
                }

                // Check for new unread notifications that haven't been shown
                for (const item of notifList) {
                    const nid = String(item._id || item.id);
                    if (!item.is_read && !notifiedIdsRef.current.has(nid)) {
                        notifiedIdsRef.current.add(nid);
                        saveNotifiedIds();

                        // Determine destination link
                        let destLink = item.link || '/notifications';
                        if (item.type === 'follow' && !item.link) {
                            destLink = item.actor?._id ? `/profile/${item.actor._id}` : '/settings/follow-requests';
                        }

                        dispatchDeviceNotification(item.title || 'SensoraNote', {
                            body: item.message || 'Anda memiliki notifikasi baru.',
                            tag: nid,
                            link: destLink,
                        });
                    }
                }
            } catch (err) {
                // Silently ignore polling errors
            }
        };

        // Run immediately then every 15 seconds
        checkBackendNotifications();
        const interval = setInterval(checkBackendNotifications, 15000);

        return () => clearInterval(interval);
    }, [isAuthenticated, permission]);

    // 2. Real-time Schedule Tracker (Smart Schedule Planner In-App Alert)
    useEffect(() => {
        if (!isAuthenticated) return;

        const checkTodaySchedule = async () => {
            if (Notification.permission !== 'granted') return;

            // Check user toggle preference
            const isReminderEnabled = localStorage.getItem('sensoranote_schedule_reminder_enabled') !== 'false';
            if (!isReminderEnabled) return;

            try {
                const token = localStorage.getItem('bayu-token') || sessionStorage.getItem('bayu-token');
                if (!token) return;

                const todayStr = new Date().toISOString().split('T')[0];
                const res = await axios.get(`/api/v1/schedule?date=${todayStr}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const scheduleData = res.data.data;
                if (!scheduleData || !Array.isArray(scheduleData.items)) return;

                const now = new Date();
                const currentHours = String(now.getHours()).padStart(2, '0');
                const currentMinutes = String(now.getMinutes()).padStart(2, '0');
                const currentTimeStr = `${currentHours}:${currentMinutes}`;
                const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();

                for (const item of scheduleData.items) {
                    if (item.is_completed) continue;

                    const timeStart = item.time_start; // e.g. "08:00"
                    if (!timeStart) continue;

                    const [sH, sM] = timeStart.split(':').map(Number);
                    if (isNaN(sH) || isNaN(sM)) continue;
                    const itemTotalMinutes = sH * 60 + sM;

                    // Trigger if item starts within 0 to 10 minutes from now, or started in the last 2 minutes
                    const diff = itemTotalMinutes - currentTotalMinutes;
                    const scheduleKey = `${todayStr}_${item.id || item.title}_${timeStart}`;

                    if (diff >= -2 && diff <= 10 && !notifiedScheduleRef.current.has(scheduleKey)) {
                        notifiedScheduleRef.current.add(scheduleKey);

                        const timeRange = `${item.time_start} - ${item.time_end || ''}`;
                        dispatchDeviceNotification(`⏰ Pengingat Jadwal: ${item.title}`, {
                            body: `Waktunya belajar ${item.title} (${timeRange}). Mari mulai belajar sekarang!`,
                            tag: `schedule_${scheduleKey}`,
                            link: '/schedule',
                        });
                    }
                }
            } catch (err) {
                // Silently ignore schedule check error
            }
        };

        checkTodaySchedule();
        const schedInterval = setInterval(checkTodaySchedule, 30000); // check every 30 seconds

        return () => clearInterval(schedInterval);
    }, [isAuthenticated, permission]);

    return (
        <DeviceNotificationContext.Provider
            value={{
                permission,
                requestDevicePermission,
                isSupported,
            }}
        >
            {children}
        </DeviceNotificationContext.Provider>
    );
}

