import { useState } from 'react';
import { supabase } from './supabaseClient';
import { Mail, Lock } from 'lucide-react';
import spendwiseLogo from './assets/spendwise.png';
import ThemeToggleBtn from './components/ThemeToggleBtn';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setMessage({ text: error.message, type: 'error' });
      } else {
        setMessage({ text: 'Please check your mailbox to confirm your email address.', type: 'success' });
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        if (error.message.toLowerCase().includes('invalid login credentials') || error.status === 400) {
          setMessage({ 
            text: 'User not found. Please check your email or sign up below!', 
            type: 'error' 
          });
        } else {
          setMessage({ text: error.message, type: 'error' });
        }
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-200 px-4 relative overflow-hidden">
      
      {/* RENDER SHARED COMPONENT CLEARLY */}
      <div className="absolute top-6 right-6">
        <ThemeToggleBtn />
      </div>

      <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700/50 relative z-10 transition-colors">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 mb-3">
            <img src={spendwiseLogo} alt="SpendWise" className="w-8 h-8 object-contain" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">SpendWise</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {isSignUp ? 'Create an account to get started' : 'Sign in to monitor your cash flow'}
          </p>
        </div>

        {message.text && (
          <div className={`p-3.5 mb-6 rounded-xl text-xs font-semibold border ${
            message.type === 'error' 
              ? 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/30' 
              : 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Email Address</label>
            <div className="relative mt-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400"><Mail size={16} /></span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Secure Password</label>
            <div className="relative mt-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400"><Lock size={16} /></span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl transition text-sm shadow-sm hover:shadow active:scale-[0.99] disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center border-t border-gray-100 dark:border-gray-700/50 pt-4">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setMessage({ text: '', type: '' });
            }}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
          >
            {isSignUp ? 'Already have an account? Sign In' : "New to SpendWise? Create an account"}
          </button>
        </div>

      </div>
    </div>
  );
}
