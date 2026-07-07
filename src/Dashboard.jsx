import { useState } from 'react';
import { supabase } from './supabaseClient';
import { PlusCircle, Trash2, Edit2, Check, X, Download } from 'lucide-react';

export default function Dashboard({ userId, transactions, onTransactionChange }) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('Food');
  const [loading, setLoading] = useState(false);

  // --- Inline Edit States ---
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editCategory, setEditCategory] = useState('');

  const categories = ['Food', 'Utilities', 'Entertainment', 'Salary', 'Freelance', 'Shopping', 'Other'];

  // --- CSV Export Engine ---
  const exportToCSV = () => {
    if (transactions.length === 0) return;

    // Define Excel friendly headers
    const headers = ['Date', 'Title', 'Amount (INR)', 'Type', 'Category', 'Is Edited\n'];
    
    // Map data rows securely, filtering comma break points out of text titles
    const rows = transactions.map(t => {
      const sanitizedTitle = t.title.replace(/,/g, ' '); // Prevents titles with commas breaking csv columns
      return `${t.date},${sanitizedTitle},${t.amount},${t.type},${t.category},${t.is_edited ? 'Yes' : 'No'}`;
    });

    const csvContent = headers.join(',') + rows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    
    // Virtual anchor click downloader triggering browser file saves natively
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `SpendWise_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!title || !amount) return;

    setLoading(true);
    const todayStr = new Date().toISOString().split('T')[0];

    const { error } = await supabase.from('transactions').insert([
      {
        user_id: userId,
        title,
        amount: parseFloat(amount),
        type,
        category,
        date: todayStr,
        is_edited: false
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

  const startEditing = (t) => {
    setEditingId(t.id);
    setEditTitle(t.title);
    setEditAmount(t.amount);
    setEditCategory(t.category);
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  const handleUpdate = async (id) => {
    if (!editTitle || !editAmount) return;

    const { error } = await supabase
      .from('transactions')
      .update({
        title: editTitle,
        amount: parseFloat(editAmount),
        category: editCategory,
        is_edited: true
      })
      .eq('id', id);

    if (error) {
      alert(`Error updating: ${error.message}`);
    } else {
      setEditingId(null);
      if (onTransactionChange) onTransactionChange();
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* TRANSACTION INPUT FORM */}
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
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Amount (₹)</label>
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
        
        {/* HEADER BAR WITH INTEGRATED EXPORT TRIGGER */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">Transaction History</h2>
          {transactions.length > 0 && (
            <button
              onClick={exportToCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/50 rounded-lg transition border border-emerald-200/50 dark:border-emerald-800/30 cursor-pointer"
              title="Export ledger entries to spreadsheet format"
            >
              <Download size={14} />
              Export CSV
            </button>
          )}
        </div>

        {transactions.length === 0 ? (
          <p className="text-gray-400 dark:text-gray-500 text-sm text-center py-8">No records found yet.</p>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-[420px] overflow-y-auto pr-2">
            {transactions.map((t) => {
              const isEditing = editingId === t.id;

              return (
                <div key={t.id} className="flex items-center justify-between py-3">
                  {isEditing ? (
                    <div className="flex flex-wrap items-center gap-2 flex-1 mr-4">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="px-2 py-1 text-sm border dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white flex-1 min-w-[120px]"
                      />
                      <input
                        type="number"
                        step="0.01"
                        value={editAmount}
                        onChange={(e) => setEditAmount(e.target.value)}
                        className="px-2 py-1 text-sm border dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white w-24"
                      />
                      <select
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                        className="px-2 py-1 text-sm border dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white w-28"
                      >
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm text-gray-800 dark:text-gray-200 flex items-center gap-1.5 flex-wrap">
                        {t.title}
                        {t.is_edited && (
                          <span className="text-[11px] font-normal text-gray-400 dark:text-gray-500 italic">
                            (edited)
                          </span>
                        )}
                      </h4>
                      <div className="flex gap-2 items-center mt-0.5">
                        <span className="text-[11px] bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full font-medium">
                          {t.category}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">{t.date}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => handleUpdate(t.id)}
                          className="text-emerald-600 hover:text-emerald-500 p-1 rounded transition cursor-pointer"
                          title="Save"
                        >
                          <Check size={18} />
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded transition cursor-pointer"
                          title="Cancel"
                        >
                          <X size={18} />
                        </button>
                      </>
                    ) : (
                      <>
                        <span className={`font-bold text-sm ${t.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {t.type === 'income' ? '+' : '-'}₹{parseFloat(t.amount).toFixed(2)}
                        </span>
                        <button
                          onClick={() => startEditing(t)}
                          className="text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 p-1 rounded transition cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 p-1 rounded transition cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}