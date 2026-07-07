import { useState, useEffect } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'system';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    // Target the body element directly
    const body = window.document.body;
    
    const applyTheme = () => {
      // Remove classes from both root and body
      root.classList.remove('light', 'dark');
      body.classList.remove('bg-gray-50', 'dark:bg-gray-900', 'bg-gray-900', 'text-gray-800', 'dark:text-gray-100');

      // Add smooth transition classes to the body
      body.classList.add('transition-colors', 'duration-200');

      let currentActiveTheme = theme;
      if (theme === 'system') {
        currentActiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }

      if (currentActiveTheme === 'dark') {
        root.classList.add('dark');
        body.style.backgroundColor = '#111827'; // Dark gray-900 background
        body.style.color = '#f9fafb';           // Bright text
      } else {
        root.classList.add('light');
        body.style.backgroundColor = '#f9fafb'; // Light gray-50 background
        body.style.color = '#1f2937';           // Dark text
      }
    };

    applyTheme();
    localStorage.setItem('theme', theme);

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme();
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  return (
    <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg border border-gray-200 dark:border-gray-600">
      <button
        onClick={() => setTheme('light')}
        className={`p-1.5 rounded-md transition cursor-pointer ${theme === 'light' ? 'bg-white dark:bg-gray-600 text-amber-500 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
        title="Light Mode"
      >
        <Sun size={16} />
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`p-1.5 rounded-md transition cursor-pointer ${theme === 'dark' ? 'bg-white dark:bg-gray-500 text-indigo-500 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
        title="Dark Mode"
      >
        <Moon size={16} />
      </button>
      <button
        onClick={() => setTheme('system')}
        className={`p-1.5 rounded-md transition cursor-pointer ${theme === 'system' ? 'bg-white dark:bg-gray-600 text-emerald-600 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
        title="System Preference"
      >
        <Monitor size={16} />
      </button>
    </div>
  );
}