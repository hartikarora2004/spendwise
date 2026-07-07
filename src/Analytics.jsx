import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Analytics({ transactions }) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Generate a dynamic list of years for our dropdown selection (e.g., last 5 years to 2 years ahead)
  const currentYearNum = new Date().getFullYear();
  const years = Array.from({ length: 8 }, (_, i) => currentYearNum - 5 + i);

  // --- Calculate Previous Month Context Details ---
  const prevMonthIndex = selectedMonth === 0 ? 11 : selectedMonth - 1;
  const prevMonthYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear;

  // --- Helper to Compute Calendar Arrays & Metrics for a given Month/Year ---
  const generateMonthData = (targetMonth, targetYear) => {
    const monthlyTransactions = transactions.filter((t) => {
      const tDate = new Date(t.date);
      return tDate.getMonth() === targetMonth && tDate.getFullYear() === targetYear;
    });

    const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
    const firstDayIndex = new Date(targetYear, targetMonth, 1).getDay();
    const calendarCells = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const blankCells = Array.from({ length: firstDayIndex }, (_, i) => i);

    return { calendarCells, blankCells, monthlyTransactions };
  };

  const currentMonthData = generateMonthData(selectedMonth, selectedYear);
  const prevMonthData = generateMonthData(prevMonthIndex, prevMonthYear);

  // --- Calculate Color Metric Class Names based on Daily Balances ---
  const getDayMetrics = (day, monthlyTransactions, targetYear, targetMonth) => {
    const dayStr = `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayTransactions = monthlyTransactions.filter((t) => t.date === dayStr);

    if (dayTransactions.length === 0) {
      return { textClass: 'text-gray-300 dark:text-gray-600', amountText: '--' };
    }

    const dayIncome = dayTransactions.filter(t => t.type === 'income').reduce((a, c) => a + parseFloat(c.amount), 0);
    const dayExpense = dayTransactions.filter(t => t.type === 'expense').reduce((a, c) => a + parseFloat(c.amount), 0);
    const net = dayIncome - dayExpense;

    if (net > 0) return { textClass: 'text-green-600 dark:text-green-400 font-medium', amountText: `${Math.round(net)}` };
    if (net === 0) return { textClass: 'text-gray-400 dark:text-gray-500', amountText: '0' };
    if (net < 0 && net >= -50) return { textClass: 'text-yellow-600 dark:text-yellow-400', amountText: `${Math.abs(Math.round(net))}` };
    if (net < -50 && net >= -150) return { textClass: 'text-orange-500 dark:text-orange-400', amountText: `${Math.abs(Math.round(net))}` };
    return { textClass: 'text-red-600 dark:text-red-400 font-bold', amountText: `${Math.abs(Math.round(net))}` };
  };

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(prev => prev - 1);
    } else {
      setSelectedMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(prev => prev + 1);
    } else {
      setSelectedMonth(prev => prev + 1);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
      
      {/* DUAL COLUMN RESPONSIVE GRID */}
      <div className="flex flex-col md:flex-row gap-8 justify-between">
        
        {/* LEFT COLUMN: PREVIOUS MONTH WITH EMBEDDED DROPDOWN DISPLAY */}
        <div className="flex-1 min-w-[300px]">
          <div className="flex items-center justify-between mb-6 px-1">
            <button onClick={handlePrevMonth} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer text-gray-500">
              <ChevronLeft size={20} />
            </button>
            
            {/* Displaying Previous Month and Year clearly but matching structural flow */}
            <h3 className="font-bold text-gray-700 dark:text-gray-300 text-base">
              {months[prevMonthIndex]} {prevMonthYear}
            </h3>
            
            <div className="w-8" /> 
          </div>
          
          <div className="grid grid-cols-7 text-center text-xs font-bold text-gray-400 uppercase mb-3">
            <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
          </div>
          <div className="grid grid-cols-7 gap-y-4 gap-x-1 text-center">
            {prevMonthData.blankCells.map((val) => (
              <div key={`blank-prev-${val}`} className="min-h-[44px]" />
            ))}
            {prevMonthData.calendarCells.map((day) => {
              const metrics = getDayMetrics(day, prevMonthData.monthlyTransactions, prevMonthYear, prevMonthIndex);
              return (
                <div key={`day-prev-${day}`} className="flex flex-col items-center justify-center min-h-[44px]">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{day}</span>
                  <span className={`text-[10px] mt-0.5 font-medium tracking-tight ${metrics.textClass}`}>
                    {metrics.amountText}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Vertical Divider for desktop screens */}
        <div className="hidden md:block w-px bg-gray-100 dark:bg-gray-700" />

        {/* RIGHT COLUMN: TARGET SELECTED MONTH WITH ACTIVE CONTROLLERS */}
        <div className="flex-1 min-w-[300px]">
          <div className="flex items-center justify-between mb-6 px-1">
            <div className="w-8" />
            
            {/* ACTIVE SELECT DROPDOWNS INTEGRATED DIRECTLY IN THE HEADER */}
            <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-700/50 px-2 py-1 rounded-lg border border-gray-100 dark:border-gray-600">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="bg-transparent font-bold text-gray-800 dark:text-white text-sm focus:outline-none cursor-pointer"
              >
                {months.map((m, idx) => (
                  <option key={m} value={idx} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">{m}</option>
                ))}
              </select>
              
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="bg-transparent font-bold text-gray-800 dark:text-white text-sm focus:outline-none cursor-pointer"
              >
                {years.map((y) => (
                  <option key={y} value={y} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">{y}</option>
                ))}
              </select>
            </div>

            <button onClick={handleNextMonth} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer text-gray-500">
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="grid grid-cols-7 text-center text-xs font-bold text-gray-400 uppercase mb-3">
            <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
          </div>
          <div className="grid grid-cols-7 gap-y-4 gap-x-1 text-center">
            {currentMonthData.blankCells.map((val) => (
              <div key={`blank-curr-${val}`} className="min-h-[44px]" />
            ))}
            {currentMonthData.calendarCells.map((day) => {
              const metrics = getDayMetrics(day, currentMonthData.monthlyTransactions, selectedYear, selectedMonth);
              return (
                <div key={`day-curr-${day}`} className="flex flex-col items-center justify-center min-h-[44px]">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{day}</span>
                  <span className={`text-[10px] mt-0.5 font-medium tracking-tight ${metrics.textClass}`}>
                    {metrics.amountText}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}