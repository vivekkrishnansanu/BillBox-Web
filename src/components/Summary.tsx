import { useMemo } from 'react';
import { Expense, Category } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { generateWhatsAppMessage, shareViaWhatsApp } from '../utils/shareUtils';
import { getMonthStart, getMonthEnd } from '../utils/dateUtils';
import { CategoryIcon } from './CategoryIcon';
import { Share2, TrendingUp, PieChart } from 'lucide-react';

interface SummaryProps {
  expenses: Expense[];
  categories: Category[];
  currency: string;
}

export function Summary({ expenses, categories, currency }: SummaryProps) {
  const { t } = useTranslation();
  
  const monthlyStats = useMemo(() => {
    const now = new Date();
    const monthStart = getMonthStart(now);
    const monthEnd = getMonthEnd(now);
    
    const monthExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= monthStart && expenseDate <= monthEnd;
    });
    
    const totalSpent = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    const expensesByCategory = monthExpenses.reduce((acc, expense) => {
      const category = categories.find(c => c.id === expense.category);
      const categoryName = category ? t(category.id) : expense.category;
      acc[categoryName] = (acc[categoryName] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);
    
    const billsDue = monthExpenses.filter(expense => expense.isRecurring).length;
    
    return {
      totalSpent,
      totalIncome: 0, // TODO: Add income tracking
      expensesByCategory,
      billsDue,
      month: now.toLocaleDateString(undefined, { month: 'long' }),
      year: now.getFullYear()
    };
  }, [expenses, categories, t]);

  const handleShareWhatsApp = () => {
    const message = generateWhatsAppMessage(monthlyStats, currency);
    shareViaWhatsApp(message);
  };

  const sortedCategories = Object.entries(monthlyStats.expensesByCategory)
    .sort(([,a], [,b]) => b - a);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {t('summary')}
        </h1>
        <PieChart size={24} className="text-gray-500" />
      </div>

      {/* Monthly Report Header */}
      <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-lg p-6 text-white">
        <h2 className="text-xl font-semibold mb-2">
          {t('monthlyReport')}
        </h2>
        <p className="text-green-100">
          {monthlyStats.month} {monthlyStats.year}
        </p>
        <div className="mt-4">
          <p className="text-3xl font-bold">
            {currency}{monthlyStats.totalSpent.toFixed(2)}
          </p>
          <p className="text-green-100">
            {t('totalSpent')}
          </p>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t('byCategory')}
        </h3>
        
        {sortedCategories.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No expenses this month
          </p>
        ) : (
          <div className="space-y-3">
            {sortedCategories.map(([categoryName, amount]) => {
              const percentage = ((amount / monthlyStats.totalSpent) * 100).toFixed(1);
              const category = categories.find(c => t(c.id) === categoryName);
              
              return (
                <div key={categoryName} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {category && (
                      <CategoryIcon 
                        icon={category.icon} 
                        color={category.color} 
                        size={20} 
                      />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{categoryName}</p>
                      <p className="text-sm text-gray-600">{percentage}% of total</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {currency}{amount.toFixed(2)}
                    </p>
                    <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Share Button */}
      <button
        onClick={handleShareWhatsApp}
        className="w-full bg-green-600 text-white rounded-lg py-4 px-6 hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 font-medium"
      >
        <Share2 size={20} />
        <span>{t('shareViaWhatsApp')}</span>
      </button>
    </div>
  );
}