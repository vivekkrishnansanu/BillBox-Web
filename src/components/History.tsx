import { useState, useMemo } from 'react';
import { Expense, Category } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { ExpenseCard } from './ExpenseCard';
import { Filter, Search, Calendar, Edit2, Trash2 } from 'lucide-react';
import { CategoryIcon } from './CategoryIcon';
import { formatDate } from '../utils/dateUtils';

interface HistoryProps {
  expenses: Expense[];
  categories: Category[];
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
  currency: string;
  darkMode?: boolean;
}

export function History({ 
  expenses, 
  categories, 
  onEditExpense, 
  onDeleteExpense,
  currency,
  darkMode = false
}: HistoryProps) {
  const { t } = useTranslation();
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredExpenses = useMemo(() => {
    let filtered = expenses;

    if (filterCategory !== 'all') {
      filtered = filtered.filter(expense => expense.category === filterCategory);
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(expense => 
        expense.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, filterCategory, searchQuery]);

  const baseClasses = darkMode 
    ? 'text-white' 
    : 'text-gray-900';

  const cardClasses = darkMode
    ? 'bg-gray-800 border-gray-700'
    : 'bg-white border-gray-200';

  const inputClasses = darkMode
    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-400'
    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500';
  if (expenses.length === 0) {
    return (
      <div className="text-center py-16">
        <div className={`rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4 ${
          darkMode ? 'bg-blue-900/30' : 'bg-blue-50'
        }`}>
          <Search size={48} className="text-blue-600" />
        </div>
        <h2 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          {t('noExpenses')}
        </h2>
        <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
          Start tracking your expenses to see them here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={20} className={`absolute left-3 top-3 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
          <input
            type="text"
            placeholder="Search expenses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${inputClasses}`}
          />
        </div>

        {/* Filter */}
        <div className="flex items-center space-x-3">
          <Filter size={20} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className={`pl-4 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${inputClasses}`}
          >
            <option value="all">{t('allCategories')}</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {t(category.id)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Summary */}
      <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
        Showing {filteredExpenses.length} of {expenses.length} transactions
      </div>

      {/* Expenses List */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          {filteredExpenses.map((expense) => {
            const category = categories.find(c => c.id === expense.category);
            if (!category) return null;

            return (
              <div key={expense.id} className={`rounded-xl border shadow-lg p-4 ${cardClasses}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <CategoryIcon icon={category.icon} color={category.color} size={20} />
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {expense.description}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {formatDate(expense.date)}
                        </span>
                        {expense.isRecurring && (
                          <div className="flex items-center space-x-1 text-xs text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded">
                            <Calendar size={12} />
                            <span>Monthly</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {currency}{expense.amount.toFixed(2)}
                    </span>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => onEditExpense(expense)}
                        className={`p-1 rounded transition-colors ${
                          darkMode ? 'text-gray-400 hover:text-blue-400 hover:bg-blue-900/20' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                        }`}
                        aria-label="Edit expense"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => onDeleteExpense(expense.id)}
                        className={`p-1 rounded transition-colors ${
                          darkMode ? 'text-gray-400 hover:text-red-400 hover:bg-red-900/20' : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                        }`}
                        aria-label="Delete expense"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}