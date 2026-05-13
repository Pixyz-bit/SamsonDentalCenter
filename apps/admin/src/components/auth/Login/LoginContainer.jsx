import React from 'react';
import { useNavigate } from 'react-router-dom';
import Carousel from '../common/Carousel';
import LoginForm from './components/LoginForm';
import { X } from 'lucide-react';

const LoginContainer = ({ onSubmit, loading = false, error = null, showSignUpLink = true, showGuestLink = true }) => {
    const navigate = useNavigate();

    return (
        <div className='w-full min-h-screen md:h-screen flex flex-col md:flex-row bg-slate-50'>
            {/* Left — Carousel (60%) */}
            <Carousel className='md:w-[60%] lg:w-[60%]' />

            {/* Right — Form (40%) */}
            <div className='flex-grow md:w-[40%] lg:w-[40%] flex flex-col relative bg-white shadow-2xl z-10'>
                {/* Close Button - Floating on Parent */}
                <button
                    onClick={() => navigate('/')}
                    className='absolute top-4 right-4 md:top-6 md:right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors duration-200 z-50 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2'
                    aria-label='Close'
                >
                    <X size={24} />
                </button>

                {/* Scrollable Container - Full Width, Scrollbar on Right */}
                <div className='flex-grow overflow-y-auto w-full h-full custom-scrollbar'>
                    {/* Content Wrapper - Centered Content, Padding */}
                    <div className='min-h-full flex flex-col justify-center w-full px-6 sm:px-8 py-6 md:py-8 pb-12'>
                        <div className='w-full max-w-md mx-auto text-left'>
                            <LoginForm
                                onSubmit={onSubmit}
                                loading={loading}
                                error={error}
                                showSignUpLink={showSignUpLink}
                                showGuestLink={showGuestLink}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginContainer;




