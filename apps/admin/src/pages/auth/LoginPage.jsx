import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from '../../layouts/AuthLayout';
import LoginContainer from '../../components/auth/Login/LoginContainer';

const LoginPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (sessionStorage.getItem('session_timeout') === 'true') {
            setError('Your session has expired due to inactivity. Please log in again.');
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
        </AuthLayout>
    );
};

export default LoginPage;




