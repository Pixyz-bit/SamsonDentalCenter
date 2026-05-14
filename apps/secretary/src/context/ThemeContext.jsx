import React, { createContext, useContext, useState, useLayoutEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // Intent (Saved preference)
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('theme');
            if (saved) return saved;
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return 'light';
    });

    // Guard (Is the current area allowed to be dark?)
    const [isDarkModeAllowed, setIsDarkModeAllowed] = useState(false);

    // Atomic DOM update
    useLayoutEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark' && isDarkModeAllowed) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme, isDarkModeAllowed]);

    const toggleTheme = () => {
        const root = window.document.documentElement;
        root.classList.add('theme-toggling');
        
        setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
        
        // Remove the guard after the next paint
        setTimeout(() => {
            root.classList.remove('theme-toggling');
        }, 50);
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setIsDarkModeAllowed }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
