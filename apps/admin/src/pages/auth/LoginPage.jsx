import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from '../../layouts/AuthLayout';
import LoginContainer from '../../components/auth/Login/LoginContainer';
import SessionExpiredModal from '../../components/common/SessionExpiredModal';

const LoginPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isExpiredModalOpen, setIsExpiredModalOpen] = useState(false);

    useEffect(() => {
        if (sessionStorage.getItem('session_timeout') === 'true') {
            setIsExpiredModalOpen(true);
            sessionStorage.removeItem('session_timeout');
        }
    }, []);

    const handleLogin = async (email, password) => {
        setError(null);
        setLoading(true);
        try {
            const { user: loggedInUser } = await login(email, password);
            
            // Immediate role check for Admin portal
            if (loggedInUser.role !== 'admin') {
                setError('Unauthorised: This portal requires an Administrator account.');
                setLoading(false);
                return;
            }

            const from = location.state?.from || '/';
            navigate(from);
        } catch (err) {
            setError(err.message || 'Login failed');
        }
        setLoading(false);
    };

    return (
        <AuthLayout>
            <LoginContainer
                onSubmit={handleLogin}
                loading={loading}
                error={error}
                showSignUpLink={false}
                showGuestLink={false}
            />

            <SessionExpiredModal 
                isOpen={isExpiredModalOpen}
                onClose={() => setIsExpiredModalOpen(false)}
            />
        </AuthLayout>
    );
};

export default LoginPage;




