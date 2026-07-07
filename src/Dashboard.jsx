import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { PlusCircle, Trash2, ArrowUpRight, ArrowDownLeft, Wallet } from 'lucide-react';

export default function Dashboard({ userId }) {
  const [transactions, setTransactions] = useState([]);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('Food');
  const [loading, setLoading] = useState(false);

  const categories = ['Food', 'Utilities', 'Entertainment', 'Salary', 'Freelance', 'Shopping', 'Other'];

  const fetchTransactions = async () => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });

    if (error) console.error('Error fetching transactions:', error.message);
    else setTransactions(data || []);
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!title || !amount) return;

    setLoading(true);
    const { error } = await supabase.from('transactions').insert([
      {
        user_id: userId,
        title,
        amount: parseFloat(amount),
        type,
        category,
      },
    ]);

    setLoading(false);
    if (error) {
      alert(`Error: ${error.message}`);
    } else {
      setTitle('');
      setAmount('');
      fetchTransactions();
    }
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) alert(`Error: ${error.message}`);
    else fetchTransactions();
  };

  const income = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, curr) => acc + parseFloat(curr.amount), 0);

  const expenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, curr) => acc + parseFloat(curr.amount), 0);

  const balance = income - expenses;

  return (
    <div className="space-y-6">
      {/* 1. SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between transition-colors">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Balance</p>
            <h3 className={`text-2xl font-bold ${balance >= 0 ? 'text-gray-900 dark:text-white' : 'text-red-600 dark:text-red-400'}`}>
              ${balance.toFixed(2)}
            </h3>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg text-emerald-600 dark:text-emerald-400">
            <Wallet size={24} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between transition-colors">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Income</p>
            <h3 className="text-2xl font-bold text-green-600 dark:text-green-400">${income.toFixed(2)}</h3>
          </div>
          <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg text-green-600 dark:text-green-400">
            <ArrowUpRight size={24} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between transition-colors">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Expenses</p>
            <h3 className="text-2xl font-bold text-red-600 dark:text-red-400">${expenses.toFixed(2)}</h3>
          </div>
          <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-lg text-red-600 dark:text-red-400">
            <ArrowDownLeft size={24} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 2. TRANSACTION FORM */}
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
                className="mt-1 block w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                className="mt-1 block w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="expense" className="dark:bg-gray-800">Expense 🔴</option>
                <option value="income" className="dark:bg-gray-800">Income 🟢</option>
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
                  <option key={cat} value={cat} className="dark:bg-gray-800">{cat}</option>
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

        {/* 3. TRANSACTION HISTORY */}
        <div className="md:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Transaction History</h2>
          {transactions.length === 0 ? (
            <p className="text-gray-400 dark:text-gray-500 text-sm text-center py-8">No transactions found. Start adding some!</p>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-[400px] overflow-y-auto pr-2">
              {transactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between py-3 group">
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
                      className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 p-1 rounded-md transition duration-150 cursor-pointer"
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
    </div>
  );
}