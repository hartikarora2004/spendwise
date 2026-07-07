import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import Auth from './Auth';
import Dashboard from './Dashboard';
import ThemeToggle from './ThemeToggler';
import Onboarding from './Onboarding';
import Analytics from './Analytics';
import { PiggyBank, LayoutDashboard, Calendar } from 'lucide-react';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [transactions, setTransactions] = useState([]);

  const fetchTransactions = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });

    if (!error && data) setTransactions(data);
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) fetchTransactions();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors">
        <p className="text-emerald-600 font-semibold text-lg animate-pulse">Loading secure session...</p>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  const hasName = user.user_metadata?.display_name;
  if (!hasName) {
    return (
      <div className="min-h-screen bg-transparent p-6 flex flex-col justify-between">
        <header className="max-w-4xl w-full mx-auto flex justify-end">
          <ThemeToggle />
        </header>
        <Onboarding onComplete={(updatedUser) => setUser(updatedUser)} />
        <div />
      </div>
    );
  }

  const capitalizedName = hasName.charAt(0).toUpperCase() + hasName.slice(1);

  // High-level global summaries calculated seamlessly
  const globalIncome = transactions.filter(t => t.type === 'income').reduce((a, c) => a + parseFloat(c.amount), 0);
  const globalExpense = transactions.filter(t => t.type === 'expense').reduce((a, c) => a + parseFloat(c.amount), 0);
  const globalBalance = globalIncome - globalExpense;

  return (
    <div className="min-h-screen bg-transparent text-gray-800 dark:text-gray-100 p-6 transition-colors duration-200">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* HEADER BRAND BLOCK */}
        <header className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-md">
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

        {/* METRIC SUMMARIES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <p className="text-xs font-bold text-gray-400 uppercase">Net Balance</p>
            <p className={`text-xl font-black ${globalBalance >= 0 ? 'text-gray-900 dark:text-white' : 'text-red-500'}`}>${globalBalance.toFixed(2)}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <p className="text-xs font-bold text-gray-400 uppercase text-green-600">Total Inflow</p>
            <p className="text-xl font-black text-green-600">${globalIncome.toFixed(2)}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <p className="text-xs font-bold text-gray-400 uppercase text-red-500">Total Outflow</p>
            <p className="text-xl font-black text-red-500">${globalExpense.toFixed(2)}</p>
          </div>
        </div>

        {/* TAB CONTROLS */}
        <div className="flex gap-2 bg-white/40 dark:bg-gray-800/40 p-1 rounded-xl w-fit border border-gray-200/50 dark:border-gray-700/50">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-bold rounded-lg transition cursor-pointer ${activeTab === 'dashboard' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'}`}
          >
            <LayoutDashboard size={16} /> Dashboard
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-bold rounded-lg transition cursor-pointer ${activeTab === 'analytics' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'}`}
          >
            <Calendar size={16} /> Heatmap Calendar
          </button>
        </div>

        {/* RENDER VIEWS */}
        <main>
          {activeTab === 'dashboard' ? (
            <Dashboard userId={user.id} transactions={transactions} onTransactionChange={fetchTransactions} />
          ) : (
            <Analytics transactions={transactions} />
          )}
        </main>

      </div>
    </div>
  );
}

export default App;