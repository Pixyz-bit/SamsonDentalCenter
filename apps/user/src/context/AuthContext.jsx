import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';
import SessionExpiredModal from '../components/common/SessionExpiredModal';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSessionExpired, setIsSessionExpired] = useState(false);

    // ✅ Listen for global session-expired events from api.js
    useEffect(() => {
        const handleSessionExpired = () => {
            if (token && !isSessionExpired) {
                console.warn('Session expired event received');
                setIsSessionExpired(true);
            }
        };

        window.addEventListener('session-expired', handleSessionExpired);
        return () => window.removeEventListener('session-expired', handleSessionExpired);
    }, [token, isSessionExpired]);

    // On mount: check if we have a saved token and validate it
    useEffect(() => {
        const checkAuth = async () => {
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const data = await api.get('/auth/me', token);
                setUser(data.user);
                setError(null);
            } catch (error) {
                // Token expired or invalid
                console.error('Auth check failed:', error.message);
                if (error.message.toLowerCase().includes('fetch') || error.message.toLowerCase().includes('network')) {
                    setError(error.message);
                } else {
                    localStorage.removeItem('token');
                    setToken(null);
                    setUser(null);
                }
            }
            setLoading(false);
        };
        checkAuth();
    }, [token]);

    const login = async (email, password) => {
        const data = await api.post('/auth/login', { email, password });
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
        return data;
    };

    const register = async (email, password, { first_name, last_name, middle_name, suffix, date_of_birth, sex }, phone) => {
        const data = await api.post('/auth/register', {
            email,
            password,
            first_name,
            last_name,
            middle_name,
            suffix,
            phone,
            date_of_birth,
            sex
        });

        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
        return data;
    };

    const updateProfile = async (updates) => {
        const data = await api.patch('/auth/me', updates, token);
        setUser(data.user);
        return data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    const verifyAndLinkStub = async ({ email, password, date_of_birth, phone, profile_id }) => {
        const data = await api.post('/auth/verify-and-link-stub', {
            email,
            password,
            date_of_birth,
            phone,
            profile_id
        });

        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
        return data;
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, error, login, register, logout, updateProfile, verifyAndLinkStub }}>
            {children}
            {isSessionExpired && <SessionExpiredModal onLogout={() => {
                logout();
                setIsSessionExpired(false);
                window.location.href = '/login';
            }} />}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
