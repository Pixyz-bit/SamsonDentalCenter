import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();
    const isDarkMode = theme === 'dark';

    return (
        <button
            onClick={toggleTheme}
            className='relative flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full hover:text-gray-700 h-10 w-10 hover:bg-gray-100 lg:h-11 lg:w-11 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 shadow-sm'
            aria-label='Toggle Theme'
        >
            {isDarkMode ? (
                <Sun size={20} className="animate-[spin_10s_linear_infinite]" />
            ) : (
                <Moon size={20} />
            )}
        </button>
    );
};

export default ThemeToggle;
