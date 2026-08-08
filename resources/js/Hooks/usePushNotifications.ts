import { useEffect } from 'react';

export function usePushNotifications() {
    useEffect(() => {
        const initPushNotifications = async () => {
            try {
                const { Capacitor } = await import('@capacitor/core');
                if (!Capacitor.isNativePlatform()) return;

                const { PushNotifications } = await import('@capacitor/push-notifications');

                let permStatus = await PushNotifications.checkPermissions();

                if (permStatus.receive === 'prompt') {
                    permStatus = await PushNotifications.requestPermissions();
                }

                if (permStatus.receive !== 'granted') {
                    console.log('User denied push notification permission');
                    return;
                }

                await PushNotifications.register();

                PushNotifications.addListener('registration', async (token) => {
                    console.log('Push registration success, token: ' + token.value);
                    try {
                        // Send the token to the server
                        await window.axios.put('/api/v1/users/fcm-token', {
                            fcm_token: token.value
                        });
                    } catch (err) {
                        console.error('Failed to send FCM token to server:', err);
                    }
                });

                PushNotifications.addListener('registrationError', (error: any) => {
                    console.error('Error on registration: ' + JSON.stringify(error));
                });

                PushNotifications.addListener(
                    'pushNotificationReceived',
                    (notification) => {
                        console.log('Push received: ' + JSON.stringify(notification));
                        // In a real app, you might want to show a toast or update state here
                    },
                );

                PushNotifications.addListener(
                    'pushNotificationActionPerformed',
                    (notification) => {
                        console.log('Push action performed: ' + JSON.stringify(notification));
                        // Handle notification tap
                    },
                );
            } catch (error) {
                console.error('Failed to initialize push notifications', error);
            }
        };

        initPushNotifications();
        
        return () => {
            // Cleanup listeners
            const cleanup = async () => {
                const { Capacitor } = await import('@capacitor/core');
                if (Capacitor.isNativePlatform()) {
                    const { PushNotifications } = await import('@capacitor/push-notifications');
                    PushNotifications.removeAllListeners();
                }
            };
            cleanup();
        }
    }, []);
}
