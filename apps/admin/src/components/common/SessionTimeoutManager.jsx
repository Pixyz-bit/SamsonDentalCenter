import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import SessionTimeoutWarning from './SessionTimeoutWarning';

const IDLE_TIMEOUT = 25 * 60 * 1000; // 25 minutes of idle before warning
const WARNING_DURATION = 5 * 60; // 5 minutes warning countdown (total 30 mins)

const SessionTimeoutManager = ({ children }) => {
    const { user, logout } = useAuth();
    const [isWarning, setIsWarning] = useState(false);
    const [secondsRemaining, setSecondsRemaining] = useState(WARNING_DURATION);
    
    const idleTimerRef = useRef(null);
    const warningTimerRef = useRef(null);

    const resetIdleTimer = useCallback(() => {
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        if (warningTimerRef.current) clearInterval(warningTimerRef.current);
        
        setIsWarning(false);
        setSecondsRemaining(WARNING_DURATION);

        // Only start timers if user is logged in
        if (user) {
            idleTimerRef.current = setTimeout(() => {
                setIsWarning(true);
            }, IDLE_TIMEOUT);
        }
    }, [user]);

    // Handle User Activity
    useEffect(() => {
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
        
        const handleActivity = () => {
            if (!isWarning) {
                resetIdleTimer();
            }
        };

        if (user) {
            events.forEach(event => window.addEventListener(event, handleActivity));
            resetIdleTimer();
        }

        return () => {
            events.forEach(event => window.removeEventListener(event, handleActivity));
            if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
            if (warningTimerRef.current) clearInterval(warningTimerRef.current);
        };
    }, [user, isWarning, resetIdleTimer]);

    // Warning Countdown Logic
    useEffect(() => {
        if (isWarning && secondsRemaining > 0) {
            warningTimerRef.current = setInterval(() => {
                setSecondsRemaining(prev => {
                    if (prev <= 1) {
                        clearInterval(warningTimerRef.current);
                        sessionStorage.setItem('session_timeout', 'true');
                        logout();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (warningTimerRef.current) clearInterval(warningTimerRef.current);
        };
    }, [isWarning, secondsRemaining, logout]);

    const handleExtend = () => {
        resetIdleTimer();
    };

    const handleLogout = () => {
        logout();
    };

    return (
        <>
            {children}
            {isWarning && (
                <SessionTimeoutWarning 
                    secondsRemaining={secondsRemaining}
                    onExtend={handleExtend}
                    onLogout={handleLogout}
                />
            )}
        </>
    );
};

export default SessionTimeoutManager;
