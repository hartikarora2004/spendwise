import { useState } from 'react';
import { supabase } from './supabaseClient';
import { PlusCircle, Trash2 } from 'lucide-react';

export default function Dashboard({ userId, transactions, onTransactionChange }) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('Food');
  const [loading, setLoading] = useState(false);

  const categories = ['Food', 'Utilities', 'Entertainment', 'Salary', 'Freelance', 'Shopping', 'Other'];

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!title || !amount) return;

    setLoading(true);
    // Automatically sets date to today's local YYYY-MM-DD string
    const todayStr = new Date().toISOString().split('T')[0];

    const { error } = await supabase.from('transactions').insert([
      {
        user_id: userId,
        title,
        amount: parseFloat(amount),
        type,
        category,
        date: todayStr,
      },
    ]);

    setLoading(false);
    if (error) {
      alert(`Error: ${error.message}`);
    } else {
      setTitle('');
      setAmount('');
      if (onTransactionChange) onTransactionChange();
    }
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) alert(`Error: ${error.message}`);
    else if (onTransactionChange) onTransactionChange();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* TRANSACTION FORM */}
      <div className="md:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 h-fit transition-colors">
        <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Add New Transaction</h2>
        <form onSubmit={handleAddTransaction} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Rent, Groceries, Salary..."
              className="mt-1 block w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Amount ($)</label>
            <input
              type="number"
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="mt-1 block w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="expense">Expense 🔴</option>
              <option value="income">Income 🟢</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 rounded-lg transition disabled:opacity-50 text-sm cursor-pointer"
          >
            <PlusCircle size={18} />
            {loading ? 'Adding...' : 'Add Transaction'}
          </button>
        </form>
      </div>

      {/* TRANSACTION HISTORY LIST */}
      <div className="md:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
        <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Transaction History</h2>
        {transactions.length === 0 ? (
          <p className="text-gray-400 dark:text-gray-500 text-sm text-center py-8">No records found yet.</p>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-[380px] overflow-y-auto pr-2">
            {transactions.map((t) => (
              <div key={t.id} className="flex items-center justify-between py-3">
                <div>
                  <h4 className="font-semibold text-sm text-gray-800 dark:text-gray-200">{t.title}</h4>
                  <div className="flex gap-2 items-center mt-0.5">
                    <span className="text-[11px] bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full font-medium">
                      {t.category}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">{t.date}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`font-bold text-sm ${t.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {t.type === 'income' ? '+' : '-'}${parseFloat(t.amount).toFixed(2)}
                  </span>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 p-1 rounded-md transition cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}