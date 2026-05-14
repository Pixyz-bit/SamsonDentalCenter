import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import PageBreadcrumb from '../../components/common/PageBreadcrumb';
import NotificationInbox from '../../components/patient/notification/NotificationInbox';
import NotificationDetailView from '../../components/patient/notification/NotificationDetailView';
import useNotifications from '../../hooks/useNotifications';
import { formatFullDateTime } from '../../hooks/useAppointments';

import { renderNotification } from '../../utils/notificationRenderer';
import NotificationSkeleton from '../../components/patient/notification/NotificationSkeleton';
import ErrorState from '../../components/common/ErrorState';

const NotificationsPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const {
        notifications,
        totalNotifications,
        loading,
        error,
        markRead,
        markAllRead,
        toggleStar,
        stats,
        fetchNotifications,
    } = useNotifications();

    const [activeFilter, setActiveFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedId, setSelectedId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    // Sync selectedId with URL 'id' param - Auto mark-as-read ONLY on initial open
    useEffect(() => {
        const id = searchParams.get('id');
        if (id) {
            setSelectedId(id);
        } else {
            setSelectedId(null);
        }
    }, [searchParams]);

    // Fetch data from backend when page or filters change
    useEffect(() => {
        // Fetch with current page and limit
        fetchNotifications(currentPage, ITEMS_PER_PAGE);
    }, [currentPage, ITEMS_PER_PAGE, fetchNotifications]);

    // Reset to page 1 when filter or search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [activeFilter, searchQuery]);

    // Separate effect for auto-mark-as-read to avoid loops
    useEffect(() => {
        if (selectedId) {
            const n = notifications.find((notif) => notif.id === selectedId);
            if (n && !n.is_read) {
                // We ONLY auto-mark as read if it hasn't been handled yet for this specific open session
                markRead(selectedId);
            }
        }
    }, [selectedId]); // ONLY depend on selectedId changing

    const handleToggleRead = async (id, isRead) => {
        await markRead(id, isRead);
    };

    const handleToggleStar = (id, isStarred) => {
        toggleStar(id, isStarred);
    };

    const handleNotificationClick = async (id) => {
        setSearchParams({ id });
    };

    // Map Backend structure to Frontend needs
    const mappedNotifications = notifications.map((n) => {
        const rendered = renderNotification(n);
        const rich = renderNotification(n, { isRich: true });
        return {
            id: n.id,
            title: rendered.title,
            message: rendered.message,
            richMessage: rich.message,
            category: n.type,
            time: n.sent_at ? formatFullDateTime(n.sent_at) : '',
            isRead: n.is_read,
            isStarred: n.is_starred,
        };
    });

    // Client-side filtering of the ALREADY fetched paged results
    const filtered = mappedNotifications.filter((n) => {
        const matchesSearch =
            n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            n.message.toLowerCase().includes(searchQuery.toLowerCase());

        if (!matchesSearch) return false;

        if (activeFilter === 'all') return true;
        if (activeFilter === 'unread') return !n.isRead;
        if (activeFilter === 'starred') return n.isStarred;

        if (activeFilter === 'appointments') {
            return [
                'GENERAL',
                'CONFIRMATION',
                'REMINDER',
                'REMINDER_48H',
                'APPROVAL',
                'DELAY',
                'FOLLOW_UP',
                'RESCHEDULE',
                'RESTRICTION',
                'CANCELLATION',
                'REJECTION',
                'NO_SHOW'
            ].includes(n.category);
        }
        return n.category.toLowerCase().includes(activeFilter.toLowerCase());
    });

    const totalPages = Math.ceil(totalNotifications / ITEMS_PER_PAGE);

    const selectedNotification = mappedNotifications.find((n) => n.id === selectedId);

    // Dynamic breadcrumbs based on selection
    const breadcrumbTitle = selectedId ? 'Notification Detail' : 'Notifications';
    const parentName = selectedId ? 'Notifications' : null;
    const parentPath = selectedId ? '/patient/notifications' : null;

    if (loading && notifications.length === 0) {
        return (
            <div className='flex flex-col h-full'>
                <PageBreadcrumb pageTitle={breadcrumbTitle} />
                
                <div className='flex flex-col grow'>
                    <div className='flex-grow flex flex-col h-full bg-white dark:bg-white/[0.03] sm:rounded-xl border-t sm:border border-gray-100 dark:border-gray-800 overflow-hidden'>
                        <div className='px-4 sm:px-6 py-5 border-b border-gray-100 dark:border-gray-800 space-y-4 animate-pulse'>
                             <div className='h-10 w-full bg-gray-50 dark:bg-gray-800/50 rounded-lg' />
                             <div className='flex gap-2 overflow-hidden pb-1'>
                                 {[1,2,3,4].map(i => (
                                     <div key={i} className='h-8 w-24 bg-gray-50 dark:bg-gray-800/30 rounded-lg shrink-0' />
                                 ))}
                             </div>
                        </div>
                        <NotificationSkeleton rows={8} />
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <>
                <PageBreadcrumb pageTitle={breadcrumbTitle} />
                <ErrorState 
                    error={error} 
                    onRetry={() => fetchNotifications(1, ITEMS_PER_PAGE)} 
                    title="Failed to load notifications"
                    parentPath="/patient"
                    parentName="Dashboard"
                />
            </>
        );
    }

    return (
        <div className='flex flex-col h-full'>
            <PageBreadcrumb
                pageTitle={breadcrumbTitle}
                parentName={parentName}
                parentPath={parentPath}
                className='mb-4'
            />

            {selectedId ? (
                <div className='grow min-h-0 relative sm:mx-0'>
                    <NotificationDetailView
                        notification={selectedNotification}
                        onBack={() => setSelectedId(null)}
                        onToggleRead={handleToggleRead}
                        onToggleStar={handleToggleStar}
                    />
                </div>
            ) : (
                <div className='flex flex-col grow'>
                    <NotificationInbox
                        notifications={filtered}
                        totalCount={totalNotifications}
                        stats={stats}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        activeFilter={activeFilter}
                        onFilterChange={setActiveFilter}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        onToggleRead={handleToggleRead}
                        onToggleStar={handleToggleStar}
                        onNotificationClick={handleNotificationClick}
                        onMarkAllRead={markAllRead}
                        loading={loading}
                    />
                </div>
            )}
        </div>
    );
};

export default NotificationsPage;
