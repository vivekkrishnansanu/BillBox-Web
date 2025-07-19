import { useState, useMemo } from 'react';
import { Expense, Category } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { aiService } from '../services/aiService';
import { isToday, isThisMonth, formatDateRelative, getDaysUntilDue } from '../utils/dateUtils';
import { CategoryIcon } from './CategoryIcon';
import { AIInsights } from './AIInsights';
import { Calendar, TrendingUp, AlertCircle, Brain, Share2 } from 'lucide-react';
import { generateMonthlyReport, generateWhatsAppFinancialReport, shareFinancialReportViaWhatsApp } from '../utils/reportUtils';
import { Income, EMI, Savings } from '../types';

interface DashboardProps {
  expenses: Expense[];
  categories: Category[];
  income?: Income[];
  emis?: EMI[];
  savings?: Savings[];
  currency: string;
  darkMode?: boolean;
}

export function Dashboard({ 
  expenses, 
  categories, 
  income = [], 
  emis = [], 
  savings = [], 
  currency, 
  darkMode = false 
}: DashboardProps) {
  const { t } = useTranslation();
  
  const stats = useMemo(() => {
    const todayExpenses = expenses.filter(e => isToday(e.date));
    const monthExpenses = expenses.filter(e => isThisMonth(e.date));
    
    const todayTotal = todayExpenses.reduce((sum, e) => sum + e.amount, 0);
    const monthTotal = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
    
    const upcomingBills = expenses
      .filter(e => e.isRecurring && e.nextDueDate)
      .map(e => ({
        ...e,
        daysUntil: getDaysUntilDue(e.nextDueDate!),
        category: categories.find(c => c.id === e.category)!
      }))
      .filter(e => e.daysUntil >= 0 && e.daysUntil <= 7)
      .sort((a, b) => a.daysUntil - b.daysUntil);
    
    const aiInsights = aiService.generateInsights(expenses);
    
    return { todayTotal, monthTotal, upcomingBills, aiInsights };
  }, [expenses, categories]);

  const handleQuickReport = () => {
    const report = generateMonthlyReport(income, expenses, emis, savings);
    const message = generateWhatsAppFinancialReport(report, currency);
    shareFinancialReportViaWhatsApp(message);
  };

  if (expenses.length === 0) {
    return (
      <div className={`p-4 sm:p-6 text-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className={`rounded-full w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center mx-auto mb-4 ${
          darkMode ? 'bg-green-900/30' : 'bg-green-50'
        }`}>
          <TrendingUp size={40} className="sm:w-12 sm:h-12 text-green-600" />
        </div>
        <h2 className={`text-lg sm:text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          {t('addFirstExpense')}
        </h2>
        <p className={`mb-6 text-sm sm:text-base ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {t('getStarted')}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 space-y-6 pb-12">
      {/* Header */}
      <div className="text-center">
        <h1 className={`text-xl sm:text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          {t('dashboard')}
        </h1>
        <p className={`text-sm sm:text-base ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {new Date().toLocaleDateString(undefined, { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className={`rounded-lg shadow-sm border p-3 sm:p-4 ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className={`text-xs sm:text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {t('todaySpent')}
            </h3>
            <div className={`rounded-full p-1 ${darkMode ? 'bg-green-900/30' : 'bg-green-50'}`}>
              <Calendar size={14} className="sm:w-4 sm:h-4 text-green-600" />
            </div>
          </div>
          <p className={`text-lg sm:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {currency}{stats.todayTotal.toFixed(2)}
          </p>
        </div>

        <div className={`rounded-lg shadow-sm border p-3 sm:p-4 ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className={`text-xs sm:text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {t('monthSpent')}
            </h3>
            <div className={`rounded-full p-1 ${darkMode ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
              <TrendingUp size={14} className="sm:w-4 sm:h-4 text-blue-600" />
            </div>
          </div>
          <p className={`text-lg sm:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {currency}{stats.monthTotal.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Quick Report Button */}
      {(income.length > 0 || emis.length > 0 || savings.length > 0) && (
        <div className={`rounded-lg shadow-sm border p-3 sm:p-4 ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
            <div>
              <h3 className={`text-base sm:text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Monthly Financial Report
              </h3>
              <p className={`text-xs sm:text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Share your complete financial summary
              </p>
            </div>
            <button
              onClick={handleQuickReport}
              className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg px-3 sm:px-4 py-2 hover:from-green-600 hover:to-blue-600 transition-all duration-200 font-medium flex items-center justify-center space-x-2 text-sm sm:text-base"
            >
              <Share2 size={14} className="sm:w-4 sm:h-4" />
              <span>Quick Report</span>
            </button>
          </div>
        </div>
      )}

      {/* AI Insights */}
      <AIInsights insights={stats.aiInsights} darkMode={darkMode} />

      {/* Upcoming Bills */}
      <div className={`rounded-lg shadow-sm border p-3 sm:p-4 mb-8 ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className={`text-base sm:text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {t('upcomingBills')}
          </h3>
          <AlertCircle size={18} className="sm:w-5 sm:h-5 text-orange-500" />
        </div>
        
        {stats.upcomingBills.length === 0 ? (
          <p className={`text-center py-4 text-sm sm:text-base ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {t('noBillsDue')}
          </p>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {stats.upcomingBills.map((bill) => (
              <div key={bill.id} className={`flex items-center justify-between p-2 sm:p-3 rounded-lg ${
                darkMode ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <CategoryIcon 
                    icon={bill.category.icon} 
                    color={bill.category.color} 
                    size={18} 
                  />
                  <div>
                    <p className={`font-medium text-sm sm:text-base ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {bill.description}
                    </p>
                    <p className={`text-xs sm:text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {bill.daysUntil === 0 ? t('dueToday') : `${t('dueIn')} ${bill.daysUntil} ${t('days')}`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold text-sm sm:text-base ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {currency}{bill.amount.toFixed(2)}
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {formatDateRelative(bill.nextDueDate!)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}