import React, { createContext, useState, useEffect, useCallback, useContext, useRef } from 'react';
import { api } from '../utils/api';
import { useAuth } from './AuthContext';
import { supabase } from '../utils/supabase';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const { token, user } = useAuth();
    const [notifications, setNotifications] = useState([
        {
            id: 'mock-1',
            type: 'APPOINTMENT_REQUEST',
            title: 'New Request Received',
            message: JSON.stringify({
                _isJSON: true,
                _title: 'Appointment Request: Leo Picard Jr.',
                _fallback: 'Leo Picard Jr. has requested a Consultation for May 20, 2026 at 10:00 AM.',
                service: 'Consultation',
                patient_name: 'Leo Picard Jr.',
                date: '2026-05-20',
                start_time: '10:00',
                end_time: '11:00'
            }),
            sent_at: new Date().toISOString(),
            is_read: false,
            is_starred: false
        },
        {
            id: 'mock-2',
            type: 'CANCELLATION',
            title: 'Appointment Cancelled',
            message: JSON.stringify({
                _isJSON: true,
                _title: 'Cancellation: Christopher Picarding',
                _fallback: 'Christopher Picarding cancelled their Tooth Extraction for tomorrow.',
                service: 'Tooth Extraction',
                patient_name: 'Christopher Picarding',
                date: '2026-05-16',
                start_time: '14:00',
                reason: 'Patient has a family emergency.'
            }),
            sent_at: new Date(Date.now() - 3600000).toISOString(),
            is_read: true,
            is_starred: true
        }
    ]);
    const [totalNotifications, setTotalNotifications] = useState(2);
    const [unreadCount, setUnreadCount] = useState(1);
    const [stats, setStats] = useState({
        starred: 1,
        unread: 1,
        general: 0,
        appointment: 1,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const statsRef = useRef(stats);
    const fetchNotificationsRef = useRef(null);
    const fetchUnreadCountRef = useRef(null);

    // Sync refs
    useEffect(() => {
        statsRef.current = stats;
    }, [stats]);

    const sortNotifications = (notifs) => {
        return [...notifs].sort((a, b) => {
            return new Date(b.sent_at) - new Date(a.sent_at);
        });
    };

    const fetchNotifications = useCallback(
        async (page = 1, limit = 10, archived = true, isBackground = false) => {
            if (!token) {
                setLoading(false);
                return;
            }

            if (!isBackground) setLoading(true);
            setError(null);

            try {
                const queryParams = new URLSearchParams({
                    archived,
                    page,
                    limit,
                    _t: Date.now(),
                });
                const data = await api.get(
                    `/notifications/my?${queryParams}`,
                    token,
                );
                    const parsed = (data.notifications || []).map((n) => {
                        if (n.message && n.message.startsWith('{')) {
                            try {
                                const meta = JSON.parse(n.message);
                                if (meta._isJSON) {
                                    return {
                                        ...n,
                                        title: meta._title || n.title,
                                        message: meta._fallback || n.message,
                                        metadata: meta,
                                    };
                                }
                            } catch (e) {
                                return n;
                            }
                        }
                        return n;
                    });

                    // Merge mock data for sample/demo purposes if no real data exists
                    const finalNotifications = parsed.length > 0 ? parsed : [
                        {
                            id: 'mock-1',
                            type: 'APPOINTMENT_REQUEST',
                            title: 'New Request Received',
                            message: JSON.stringify({
                                _isJSON: true,
                                _title: 'Appointment Request: Leo Picard Jr.',
                                _fallback: 'Leo Picard Jr. has requested a Consultation for May 20, 2026 at 10:00 AM.',
                                service: 'Consultation',
                                patient_name: 'Leo Picard Jr.',
                                date: '2026-05-20',
                                start_time: '10:00',
                                end_time: '11:00'
                            }),
                            sent_at: new Date().toISOString(),
                            is_read: false,
                            is_starred: false
                        },
                        {
                            id: 'mock-2',
                            type: 'CANCELLATION',
                            title: 'Appointment Cancelled',
                            message: JSON.stringify({
                                _isJSON: true,
                                _title: 'Cancellation: Christopher Picarding',
                                _fallback: 'Christopher Picarding cancelled their Tooth Extraction for tomorrow.',
                                service: 'Tooth Extraction',
                                patient_name: 'Christopher Picarding',
                                date: '2026-05-16',
                                start_time: '14:00',
                                reason: 'Patient has a family emergency.'
                            }),
                            sent_at: new Date(Date.now() - 3600000).toISOString(),
                            is_read: true,
                            is_starred: true
                        },
                        {
                            id: 'mock-3',
                            type: 'DELAY',
                            title: 'Schedule Delay Alert',
                            message: JSON.stringify({
                                _isJSON: true,
                                _title: 'Schedule Delay Alert',
                                _fallback: 'Your schedule is running 15 minutes late.',
                                estimated_delay_minutes: 15
                            }),
                            sent_at: new Date(Date.now() - 7200000).toISOString(),
                            is_read: false,
                            is_starred: false
                        },
                        {
                            id: 'mock-4',
                            type: 'GENERAL',
                            title: 'System Maintenance',
                            message: 'The system will undergo maintenance on Sunday at 2:00 AM. Please save all work.',
                            sent_at: new Date(Date.now() - 86400000).toISOString(),
                            is_read: true,
                            is_starred: false
                        }
                    ];

                    setNotifications(sortNotifications(finalNotifications));
                    setTotalNotifications(parsed.length || finalNotifications.length);
                    if (data.stats) {
                        setStats(data.stats);
                        setUnreadCount(data.stats.unread || 0);
                    } else if (parsed.length === 0) {
                        setStats({ starred: 1, unread: 2, general: 1, appointment: 2 });
                        setUnreadCount(2);
                    }
            } catch (err) {
                setError(err.message || 'Failed to load notifications.');
            } finally {
                setLoading(false);
            }
        },
        [token],
    );

    const fetchUnreadCount = useCallback(async (isBackground = false) => {
        if (!token) return;
        try {
            const data = await api.get(`/notifications/unread-count?_t=${Date.now()}`, token);
            setUnreadCount(data.unread_count || 0);
        } catch (err) {
            console.error('Failed to fetch unread count:', err);
        }
    }, [token]);

    useEffect(() => {
        fetchNotificationsRef.current = fetchNotifications;
        fetchUnreadCountRef.current = fetchUnreadCount;
    }, [fetchNotifications, fetchUnreadCount]);

    const markRead = async (id, isRead = true) => {
        if (!token) return;
        try {
            setNotifications((prev) => {
                const updated = prev.map((n) => (n.id === id ? { ...n, is_read: isRead } : n));
                return sortNotifications(updated);
            });

            setUnreadCount((prev) => (isRead ? Math.max(0, prev - 1) : prev + 1));
            setStats((prev) => ({
                ...prev,
                unread: isRead ? Math.max(0, prev.unread - 1) : prev.unread + 1,
            }));

            await api.patch(`/notifications/${id}/read`, { read: isRead }, token);
            return { success: true };
        } catch (err) {
            console.error('Failed to toggle read status:', err);
            fetchNotifications();
            fetchUnreadCount();
            return { success: false, error: err.message };
        }
    };

    const markAllRead = async () => {
        if (!token) return;
        try {
            await api.patch('/notifications/read-all', {}, token);
            setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
            setUnreadCount(0);
            setStats((prev) => ({ ...prev, unread: 0 }));
            return { success: true };
        } catch (err) {
            console.error('Failed to mark all as read:', err);
            return { success: false, error: err.message };
        }
    };

    const toggleStar = async (id, isStarred) => {
        if (!token) return;
        try {
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, is_starred: isStarred } : n)),
            );
            setStats((prev) => ({ ...prev, starred: prev.starred + (isStarred ? 1 : -1) }));

            await api.patch(`/notifications/${id}/star`, { starred: isStarred }, token);
            return { success: true };
        } catch (err) {
            console.error('Failed to toggle star:', err);
            fetchNotifications();
            return { success: false, error: err.message };
        }
    };

    const toggleArchive = async (id, isArchived) => {
        if (!token) return;
        try {
            setNotifications((prev) =>
                prev.map((n) =>
                    n.id === id
                        ? {
                              ...n,
                              is_archived: isArchived,
                              is_starred: isArchived ? false : n.is_starred,
                          }
                        : n,
                ),
            );

            await api.patch(`/notifications/${id}/archive`, { archived: isArchived }, token);
            fetchNotifications();
            return { success: true };
        } catch (err) {
            console.error('Failed to toggle archive:', err);
            fetchNotifications();
            return { success: false, error: err.message };
        }
    };

    useEffect(() => {
        if (token) {
            fetchNotifications(1);
            fetchUnreadCount();
        }
    }, [token, fetchNotifications, fetchUnreadCount]);

    useEffect(() => {
        if (user?.id && supabase) {
            const channel = supabase
                .channel(`notifs:${user.id}`)
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'notifications',
                        filter: `user_id=eq.${user.id}`,
                    },
                    () => {
                        fetchNotificationsRef.current(1, 10, false, true);
                        fetchUnreadCountRef.current(true);
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [user?.id]);

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                totalNotifications,
                unreadCount,
                stats,
                loading,
                error,
                fetchNotifications,
                fetchUnreadCount,
                markRead,
                markAllRead,
                toggleStar,
                toggleArchive,
                refresh: () => {
                    fetchNotifications(1, 10, true, true);
                    fetchUnreadCount(true);
                },
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotificationState = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotificationState must be used within a NotificationProvider');
    }
    return context;
};
