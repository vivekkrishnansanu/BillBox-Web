import { useState, useMemo } from 'react';
import { Expense, Category, Income, EMI, Savings } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { aiService } from '../services/aiService';
import { isToday, isThisMonth, formatDateRelative, getDaysUntilDue } from '../utils/dateUtils';
import { CategoryIcon } from './CategoryIcon';
import { 
  Calendar, 
  TrendingUp, 
  AlertCircle, 
  Brain, 
  Share2,
  Eye,
  EyeOff,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  CreditCard,
  Target,
  Zap,
  Sparkles
} from 'lucide-react';
import { generateMonthlyReport, generateWhatsAppFinancialReport, shareFinancialReportViaWhatsApp } from '../utils/reportUtils';

interface CredLikeDashboardProps {
  expenses: Expense[];
  categories: Category[];
  income?: Income[];
  emis?: EMI[];
  savings?: Savings[];
  currency: string;
  darkMode?: boolean;
}

export function CredLikeDashboard({ 
  expenses, 
  categories, 
  income = [], 
  emis = [], 
  savings = [], 
  currency, 
  darkMode = false 
}: CredLikeDashboardProps) {
  const { t } = useTranslation();
  const [showAmounts, setShowAmounts] = useState(true);
  
  const stats = useMemo(() => {
    const todayExpenses = expenses.filter(e => isToday(e.date));
    const monthExpenses = expenses.filter(e => isThisMonth(e.date));
    
    const todayTotal = todayExpenses.reduce((sum, e) => sum + e.amount, 0);
    const monthTotal = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
    
    const currentMonth = new Date().toISOString().slice(0, 7);
    const currentIncome = income.find(inc => inc.month === currentMonth);
    const totalIncome = currentIncome ? currentIncome.monthlyIncome + currentIncome.extraIncome : 0;
    
    const activeEMIs = emis.filter(emi => {
      return currentMonth >= emi.startMonth && currentMonth <= emi.endMonth && emi.isActive;
    });
    const totalEMI = activeEMIs.reduce((sum, emi) => sum + emi.monthlyAmount, 0);
    
    const activeSavings = savings.filter(s => s.isActive && !s.isMatured);
    const monthlySavings = activeSavings.reduce((sum, s) => {
      if (s.type === 'rd') return sum + (s.monthlyDeposit || 0);
      if (s.type === 'sip') return sum + (s.monthlyInvestment || 0);
      if (s.type === 'custom' && s.frequency === 'monthly') return sum + s.amount;
      return sum;
    }, 0);
    
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
    const availableBalance = totalIncome - monthTotal - totalEMI - monthlySavings;
    
    return { 
      todayTotal, 
      monthTotal, 
      totalIncome,
      totalEMI,
      monthlySavings,
      availableBalance,
      upcomingBills, 
      aiInsights 
    };
  }, [expenses, categories, income, emis, savings]);

  const handleQuickReport = () => {
    const report = generateMonthlyReport(income, expenses, emis, savings);
    const message = generateWhatsAppFinancialReport(report, currency);
    shareFinancialReportViaWhatsApp(message);
  };

  const formatAmount = (amount: number) => {
    if (!showAmounts) return '••••••';
    return `${currency}${amount.toLocaleString()}`;
  };

  const baseClasses = darkMode 
    ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white min-h-screen' 
    : 'bg-gradient-to-br from-slate-50 via-white to-slate-50 text-gray-900 min-h-screen';

  if (expenses.length === 0 && income.length === 0) {
    return (
      <div className={baseClasses}>
        <div className="px-6 pt-12">
          {/* Welcome Header */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl">
              <Wallet size={40} className="text-white" />
            </div>
            <h1 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Welcome to BillBox
            </h1>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Your smart financial companion
            </p>
          </div>

          {/* Getting Started Cards */}
          <div className="space-y-4">
            <div className={`rounded-3xl shadow-lg p-6 border ${
              darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl p-3 shadow-lg">
                  <TrendingUp size={24} className="text-white" />
                </div>
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Track Your Expenses
                </h3>
              </div>
              <p className={`text-sm mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Start by adding your daily expenses to get insights
              </p>
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('openAddExpense'))}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl py-3 font-medium shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Add First Expense
              </button>
            </div>

            <div className={`rounded-3xl shadow-lg p-6 border ${
              darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl p-3 shadow-lg">
                  <Wallet size={24} className="text-white" />
                </div>
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Set Up Income
                </h3>
              </div>
              <p className={`text-sm mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Add your monthly income for better financial planning
              </p>
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('navigateToFinancial'))}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-2xl py-3 font-medium shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Add Income
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={baseClasses}>
              <div className="px-6 pt-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Financial Overview
            </h1>
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {new Date().toLocaleDateString(undefined, { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <button
            onClick={() => setShowAmounts(!showAmounts)}
            className={`p-3 rounded-2xl transition-all duration-300 hover:scale-105 ${
              darkMode ? 'bg-slate-800/50 border border-slate-700' : 'bg-white/80 border border-slate-200'
            }`}
          >
            {showAmounts ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {/* Balance Card */}
        <div className={`rounded-xl shadow-xl overflow-hidden border ${
          darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'
        }`}>
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Available Balance</h2>
                <Wallet size={24} />
              </div>
              <p className="text-3xl font-bold mb-2">
                {formatAmount(stats.availableBalance)}
              </p>
              <p className="text-blue-100 text-sm">
                After expenses, EMIs & savings
              </p>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <ArrowDownRight size={16} className="text-red-500" />
                  <span className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Today's Spending
                  </span>
                </div>
                <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {formatAmount(stats.todayTotal)}
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <ArrowUpRight size={16} className="text-green-500" />
                  <span className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Monthly Income
                  </span>
                </div>
                <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {formatAmount(stats.totalIncome)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`rounded-xl shadow-lg p-4 border ${
            darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center space-x-3 mb-3">
              <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-xl p-2 shadow-lg">
                <TrendingUp size={16} className="text-white" />
              </div>
              <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Month Spent
              </span>
            </div>
            <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {formatAmount(stats.monthTotal)}
            </p>
          </div>

          <div className={`rounded-xl shadow-lg p-4 border ${
            darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center space-x-3 mb-3">
              <div className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl p-2 shadow-lg">
                <CreditCard size={16} className="text-white" />
              </div>
              <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                EMI Burden
              </span>
            </div>
            <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {formatAmount(stats.totalEMI)}
            </p>
          </div>

          <div className={`rounded-xl shadow-lg p-4 border ${
            darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center space-x-3 mb-3">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-2 shadow-lg">
                <Target size={16} className="text-white" />
              </div>
              <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Monthly Savings
              </span>
            </div>
            <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {formatAmount(stats.monthlySavings)}
            </p>
          </div>

          <div className={`rounded-xl shadow-lg p-4 border ${
            darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center space-x-3 mb-3">
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl p-2 shadow-lg">
                <Zap size={16} className="text-white" />
              </div>
              <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Bills Due
              </span>
            </div>
            <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {stats.upcomingBills.length}
            </p>
          </div>
        </div>

        {/* Quick Report */}
        {(income.length > 0 || emis.length > 0 || savings.length > 0) && (
          <div className={`rounded-xl shadow-lg p-6 border ${
            darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`text-lg font-semibold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Monthly Report
                </h3>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Share your complete financial summary
                </p>
              </div>
              <button
                onClick={handleQuickReport}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl px-6 py-3 hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 font-medium flex items-center space-x-2 shadow-lg hover:shadow-xl"
              >
                <Share2 size={16} />
                <span>Share</span>
              </button>
            </div>
          </div>
        )}

        {/* Upcoming Bills */}
        {stats.upcomingBills.length > 0 && (
          <div className={`rounded-xl shadow-lg p-6 border ${
            darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-2 shadow-lg">
                <AlertCircle size={20} className="text-white" />
              </div>
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Upcoming Bills
              </h3>
            </div>
            
            <div className="space-y-3">
              {stats.upcomingBills.slice(0, 3).map((bill) => (
                <div key={bill.id} className={`flex items-center justify-between p-4 rounded-2xl ${
                  darkMode ? 'bg-slate-700/30' : 'bg-slate-50'
                }`}>
                  <div className="flex items-center space-x-3">
                    <CategoryIcon 
                      icon={bill.category.icon} 
                      color={bill.category.color} 
                      size={20} 
                    />
                    <div>
                      <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {bill.description}
                      </p>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {bill.daysUntil === 0 ? 'Due today' : `Due in ${bill.daysUntil} days`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatAmount(bill.amount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Insights */}
        {stats.aiInsights.length > 0 && (
          <div className={`rounded-xl shadow-lg p-6 border ${
            darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl p-2 shadow-lg">
                <Brain size={20} className="text-white" />
              </div>
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                AI Insights
              </h3>
            </div>
            
            <div className="space-y-3">
              {stats.aiInsights.slice(0, 2).map((insight) => (
                <div key={insight.id} className={`p-4 rounded-xl border-l-4 ${
                  darkMode ? 'bg-slate-700/30' : 'bg-slate-50'
                } ${
                  insight.priority === 'high' 
                    ? 'border-red-500' 
                    : insight.priority === 'medium'
                    ? 'border-yellow-500'
                    : 'border-green-500'
                }`}>
                  <h4 className={`font-medium text-sm mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {insight.title}
                  </h4>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {insight.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}