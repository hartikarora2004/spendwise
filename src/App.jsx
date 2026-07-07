import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import Auth from './Auth';
import Dashboard from './Dashboard';
import ThemeToggle from './ThemeToggler';
import Onboarding from './Onboarding'; // 1. Import Onboarding screen
import { PiggyBank } from 'lucide-react';

function App() {
  const [user, setUser] = useState(null); // Track user profile directly instead of whole session
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check initial user status
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors">
        <p className="text-emerald-600 font-semibold text-lg animate-pulse">Loading secure session...</p>
      </div>
    );
  }

  // Guard Clause: If not logged in, show Auth component
  if (!user) {
    return <Auth />;
  }

  // 2. FIRST-TIME INTERCEPTOR: If display_name metadata is missing, force name creation screen
  const hasName = user.user_metadata?.display_name;
  if (!hasName) {
    return (
      <div className="min-h-screen bg-transparent p-6 flex flex-col justify-between">
        <header className="max-w-4xl w-full mx-auto flex justify-end">
          <ThemeToggle />
        </header>
        {/* On boarding completes and updates the state profile */}
        <Onboarding onComplete={(updatedUser) => setUser(updatedUser)} />
        <div />
      </div>
    );
  }

  // Capitalize name for greeting display
  const capitalizedName = hasName.charAt(0).toUpperCase() + hasName.slice(1);

  return (
    <div className="min-h-screen bg-transparent text-gray-800 dark:text-gray-100 p-6 transition-colors duration-200">
      <div className="max-w-4xl mx-auto">
        
        {/* HEADER */}
        <header className="flex justify-between items-center mb-8 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-md shadow-emerald-600/20">
              <PiggyBank size={24} />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center gap-1.5">
                SpendWise <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">v1.0</span>
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Welcome back, <span className="font-semibold text-emerald-600 dark:text-emerald-400">{capitalizedName}</span>!
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <ThemeToggle /> 
            <button
              onClick={() => supabase.auth.signOut()}
              className="px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50 rounded-lg transition cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <Dashboard userId={user.id} />
      </div>
    </div>
  );
}

export default App;