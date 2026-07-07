import { useState } from 'react';
import { supabase } from './supabaseClient';
import { UserCheck } from 'lucide-react';

export default function Onboarding({ onComplete }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSaveName = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      // Updates the user's metadata profile directly in Supabase Auth
      const { data, error } = await supabase.auth.updateUser({
        data: { display_name: name.trim() }
      });

      if (error) throw error;
      
      // Tell App.jsx onboarding is finished and pass the updated user data
      onComplete(data.user);
    } catch (error) {
      alert(`Error updating profile: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 text-center space-y-6 transition-colors">
        <div className="mx-auto w-16 h-16 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center shadow-inner">
          <UserCheck size={32} />
        </div>
        
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Let's personalize your tracker</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            It looks like your first time here! What should we call you?
          </p>
        </div>

        <form onSubmit={handleSaveName} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Your Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex, Sam, Taylor"
              className="mt-1 block w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition duration-150 shadow-lg shadow-emerald-600/20 disabled:opacity-50 cursor-pointer text-sm"
          >
            {loading ? 'Saving profile...' : 'Get Started'}
          </button>
        </form>
      </div>
    </div>
  );
}