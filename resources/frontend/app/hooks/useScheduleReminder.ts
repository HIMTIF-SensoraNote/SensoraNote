import { useEffect, useState, useRef } from 'react';
import { useToast } from '../contexts/ToastContext';

interface ScheduleItem {
  id: string;
  time_start: string;
  time_end: string;
  title: string;
  category: string;
  priority: string;
  color: string;
  is_completed?: boolean;
}

// Clean Web Audio chime generator (No external MP3 needed!)
export const playNotificationChime = (type: 'start' | 'end' = 'start') => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'start') {
      // Upbeat start chime (E5 -> G5)
      osc.frequency.setValueAtTime(659.25, now);
      osc.frequency.setValueAtTime(783.99, now + 0.12);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
    } else {
      // Completion chime (C5 -> E5 -> G5 -> C6)
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(659.25, now + 0.1);
      osc.frequency.setValueAtTime(783.99, now + 0.2);
      osc.frequency.setValueAtTime(1046.5, now + 0.3);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc.start(now);
      osc.stop(now + 0.6);
    }
  } catch (e) {
    console.debug('Audio chime not permitted or muted', e);
  }
};

export function useScheduleReminder(items: ScheduleItem[], dateStr: string) {
  const { showToast } = useToast();
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );

  // Toggle state: true (enabled) / false (disabled)
  const [isReminderEnabled, setIsReminderEnabled] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('sensoranote_schedule_reminder_enabled');
      return stored !== null ? stored === 'true' : true;
    } catch {
      return true;
    }
  });

  const notifiedSetRef = useRef<Set<string>>(new Set());

  // Request browser notification permission
  const requestPermission = async (): Promise<NotificationPermission> => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const res = await Notification.requestPermission();
        setNotificationPermission(res);
        return res;
      } catch (err) {
        console.error('Failed to request notification permission:', err);
        return 'denied';
      }
    }
    return 'denied';
  };

  // Toggle Reminder ON / OFF
  const toggleReminder = async () => {
    if (isReminderEnabled) {
      // Turn OFF
      setIsReminderEnabled(false);
      try {
        localStorage.setItem('sensoranote_schedule_reminder_enabled', 'false');
      } catch {}
      showToast('🔕 Pengingat jadwal dinonaktifkan.', 'info');
    } else {
      // Turn ON
      let perm = notificationPermission;
      if (perm !== 'granted') {
        perm = await requestPermission();
      }

      setIsReminderEnabled(true);
      try {
        localStorage.setItem('sensoranote_schedule_reminder_enabled', 'true');
      } catch {}

      if (perm === 'granted') {
        showToast('🔔 Pengingat jadwal berhasil diaktifkan!', 'success');
        playNotificationChime('start');
      } else {
        showToast('Pengingat jadwal diaktifkan di dalam aplikasi (Izin browser belum diberikan).', 'info');
      }
    }
  };

  // Heartbeat check every 20 seconds
  useEffect(() => {
    if (!items || items.length === 0 || !isReminderEnabled) return;

    const checkReminders = () => {
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];

      // Only check reminders for TODAY's schedule
      if (dateStr !== todayStr) return;

      const currentHours = now.getHours().toString().padStart(2, '0');
      const currentMinutes = now.getMinutes().toString().padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;

      items.forEach((item) => {
        if (item.is_completed) return;

        const startKey = `notified_start_${item.id}_${dateStr}_${item.time_start}`;
        const endKey = `notified_end_${item.id}_${dateStr}_${item.time_end}`;

        // 1. Check START TIME Reminder
        if (item.time_start === currentTimeStr && !notifiedSetRef.current.has(startKey)) {
          notifiedSetRef.current.add(startKey);

          // Native OS Notification
          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            try {
              new Notification(`🔔 Waktunya Belajar: ${item.title}`, {
                body: `Sesi ${item.category} dimulai sekarang (${item.time_start} - ${item.time_end}). Semangat belajar!`,
                icon: '/logo.png',
                tag: startKey,
              });
            } catch (e) {
              console.error('Native notification error:', e);
            }
          }

          // In-App Toast & Audio Chime
          playNotificationChime('start');
          showToast(`🔔 Waktunya Belajar: "${item.title}" (${item.time_start} - ${item.time_end})`, 'info');
        }

        // 2. Check END TIME Reminder
        if (item.time_end === currentTimeStr && !notifiedSetRef.current.has(endKey)) {
          notifiedSetRef.current.add(endKey);

          // Native OS Notification
          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            try {
              new Notification(`⏰ Sesi Selesai: ${item.title}`, {
                body: `Waktu belajar untuk "${item.title}" telah selesai. Anda sekarang dapat mencentang kegiatan ini!`,
                icon: '/logo.png',
                tag: endKey,
              });
            } catch (e) {
              console.error('Native notification error:', e);
            }
          }

          // In-App Toast & Audio Chime
          playNotificationChime('end');
          showToast(`⏰ Sesi Selesai: "${item.title}". Anda sekarang dapat mencentang kegiatan ini!`, 'success');
        }
      });
    };

    // Run initial check
    checkReminders();

    // Interval check every 20 seconds
    const interval = setInterval(checkReminders, 20000);

    return () => clearInterval(interval);
  }, [items, dateStr, showToast, isReminderEnabled]);

  return {
    notificationPermission,
    requestPermission,
    isReminderEnabled,
    toggleReminder,
  };
}
