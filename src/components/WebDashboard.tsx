import { useMemo, useState, useRef, useEffect } from 'react';
import { Expense, Category, Income, EMI, Savings, Subscription } from '../types';
import { isToday, isThisMonth } from '../utils/dateUtils';
import { 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  Wallet,
  CreditCard,
  Target,
  Calendar,
  AlertCircle,
  DollarSign,
  PieChart,
  BarChart3,
  Activity
} from 'lucide-react';

interface WebDashboardProps {
  expenses: Expense[];
  categories: Category[];
  income?: Income[];
  emis?: EMI[];
  savings?: Savings[];
  currency: string;
  resetFlag?: boolean;
  subscriptions?: Subscription[];
}

export function WebDashboard({ 
  expenses, 
  categories, 
  income = [], 
  emis = [], 
  savings = [], 
  currency,
  resetFlag = false,
  subscriptions = []
}: WebDashboardProps) {
  const [showExpenseInfo, setShowExpenseInfo] = useState(false);
  const infoBtnRef = useRef<HTMLButtonElement>(null);

  // Close popover on outside click or Escape
  useEffect(() => {
    if (!showExpenseInfo) return;
    function handle(e: MouseEvent | KeyboardEvent) {
      if (
        e instanceof KeyboardEvent && e.key === 'Escape'
      ) {
        setShowExpenseInfo(false);
      } else if (
        e instanceof MouseEvent &&
        infoBtnRef.current &&
        !infoBtnRef.current.contains(e.target as Node)
      ) {
        setShowExpenseInfo(false);
      }
    }
    document.addEventListener('mousedown', handle);
    document.addEventListener('keydown', handle);
    return () => {
      document.removeEventListener('mousedown', handle);
      document.removeEventListener('keydown', handle);
    };
  }, [showExpenseInfo]);

  const stats = useMemo(() => {
    if (resetFlag) {
      return {
        todayTotal: 0,
        monthTotal: 0,
        totalIncome: 0,
        totalEMI: 0,
        monthlySavings: 0,
        availableBalance: 0,
        categoryBreakdown: {},
        dailyMonthTotal: 0,
        totalSubscription: 0,
      };
    }
    const todayExpenses = expenses.filter(e => isToday(e.date));
    const monthExpenses = expenses.filter(e => isThisMonth(e.date));
    
    const todayTotal = todayExpenses.reduce((sum, e) => sum + e.amount, 0);
    const dailyMonthTotal = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
    
    const currentMonth = new Date().toISOString().slice(0, 7);
    const currentIncome = income.find(inc => inc.month === currentMonth);
    const totalIncome = currentIncome ? currentIncome.monthlyIncome + currentIncome.extraIncome : 0;
    
    const activeEMIs = emis.filter(emi => {
      return currentMonth >= emi.startMonth && currentMonth <= emi.endMonth && emi.isActive;
    });
    const totalEMI = activeEMIs.reduce((sum, emi) => sum + emi.monthlyAmount, 0);
    
    const activeSubscriptions = subscriptions.filter(s => s.isActive);
    const totalSubscription = activeSubscriptions.reduce((sum, sub) => {
      switch (sub.frequency) {
        case 'monthly': return sum + sub.amount;
        case 'quarterly': return sum + (sub.amount / 3);
        case 'yearly': return sum + (sub.amount / 12);
        default: return sum;
      }
    }, 0);
    
    const activeSavings = savings.filter(s => s.isActive && !s.isMatured);
    const monthlySavings = activeSavings.reduce((sum, s) => {
      if (s.type === 'rd') return sum + (s.monthlyDeposit || 0);
      if (s.type === 'sip') return sum + (s.monthlyInvestment || 0);
      if (s.type === 'custom' && s.frequency === 'monthly') return sum + s.amount;
      return sum;
    }, 0);
    
    const monthTotal = dailyMonthTotal + totalEMI + totalSubscription + monthlySavings;
    const availableBalance = totalIncome - monthTotal;
    
    // Category breakdown
    const categoryBreakdown = monthExpenses.reduce((acc, expense) => {
      const category = categories.find(c => c.id === expense.category);
      const categoryName = category?.name || expense.category;
      acc[categoryName] = (acc[categoryName] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);
    
    return { 
      todayTotal, 
      monthTotal, 
      totalIncome,
      totalEMI,
      monthlySavings,
      availableBalance,
      categoryBreakdown,
      dailyMonthTotal,
      totalSubscription
    };
  }, [expenses, categories, income, emis, savings, subscriptions, resetFlag]);

  const formatAmount = (amount: number) => {
    return `${currency}${amount.toLocaleString()}`;
  };

  if (expenses.length === 0 && income.length === 0) {
    return (
      <div className="space-y-8 px-6 py-8 md:px-12 md:py-10">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-8 text-white">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-bold mb-4">Welcome to BillBox</h1>
            <p className="text-emerald-100 text-lg mb-6">
              Your comprehensive financial management platform. Track expenses, manage subscriptions, 
              monitor investments, and get AI-powered insights to make better financial decisions.
            </p>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('openAddExpense'))}
                className="bg-white text-emerald-600 px-6 py-3 rounded-lg font-medium hover:bg-emerald-50 transition-colors"
              >
                Add First Expense
              </button>
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('navigateToFinancial'))}
                className="border border-white/30 text-white px-6 py-3 rounded-lg font-medium hover:bg-white/10 transition-colors"
              >
                Set Up Income
              </button>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="bg-blue-100 rounded-lg p-3 w-fit mb-4">
              <BarChart3 size={24} className="text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Analytics</h3>
            <p className="text-gray-600">Get detailed insights into your spending patterns with AI-powered analytics.</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="bg-green-100 rounded-lg p-3 w-fit mb-4">
              <Target size={24} className="text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Goal Tracking</h3>
            <p className="text-gray-600">Set and track your savings goals with automated investment tracking.</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="bg-purple-100 rounded-lg p-3 w-fit mb-4">
              <AlertCircle size={24} className="text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Bill Reminders</h3>
            <p className="text-gray-600">Never miss a payment with intelligent bill reminders and notifications.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 px-6 py-8 md:px-12 md:py-10">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="relative bg-gradient-to-br from-emerald-500 via-emerald-400 to-teal-500 rounded-2xl p-7 shadow-2xl border-2 border-emerald-400 ring-2 ring-emerald-300/40 mb-2 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 rounded-lg p-3 shadow-lg">
              <Wallet size={28} className="text-white drop-shadow" />
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-base font-semibold text-white tracking-wide drop-shadow">Available Balance</p>
              </div>
              <p className="text-3xl font-extrabold text-white drop-shadow-lg tracking-tight">{formatAmount(stats.availableBalance)}</p>
            </div>
          </div>
          <div className="flex items-center text-sm mt-2">
            {stats.availableBalance >= 0 ? (
              <ArrowUpRight size={18} className="text-white mr-1 drop-shadow" />
            ) : (
              <ArrowDownRight size={18} className="text-red-200 mr-1 drop-shadow" />
            )}
            <span className="text-white/90 font-medium">After all expenses & savings</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 rounded-lg p-3">
              <TrendingUp size={24} className="text-blue-600" />
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Monthly Income</p>
              <p className="text-2xl font-bold text-gray-900">{formatAmount(stats.totalIncome)}</p>
            </div>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Calendar size={16} className="mr-1" />
            <span>Total earnings this month</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-red-100 rounded-lg p-3">
              <ArrowDownRight size={24} className="text-red-600" />
            </div>
            <div className="text-right flex items-center gap-2">
              <p className="text-sm text-gray-500 flex items-center gap-1">
                Monthly Expenses
                <button
                  ref={infoBtnRef}
                  type="button"
                  aria-label="Show expense breakdown"
                  className="ml-1 rounded-full bg-slate-800/80 hover:bg-slate-700/90 text-slate-200 w-5 h-5 flex items-center justify-center border border-slate-600 shadow-sm transition-colors duration-150"
                  onClick={() => setShowExpenseInfo(v => !v)}
                  style={{ fontSize: '12px', fontWeight: 700 }}
                >
                  i
                </button>
              </p>
              {showExpenseInfo && infoBtnRef.current && (
                <div
                  className="z-50 min-w-[220px] absolute animate-fade-in"
                  style={{
                    left: infoBtnRef.current.offsetLeft + infoBtnRef.current.offsetWidth + 8,
                    top: infoBtnRef.current.offsetTop - 12,
                  }}
                >
                  <div className="relative">
                    <div className="rounded-2xl shadow-2xl border border-slate-700 bg-slate-900/95 text-slate-100 p-4 backdrop-blur-md">
                      <div className="flex flex-col gap-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span>Daily</span>
                          <span>{formatAmount(stats.dailyMonthTotal)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>EMI</span>
                          <span>{formatAmount(stats.totalEMI)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Subs</span>
                          <span>{formatAmount(stats.totalSubscription)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Savings</span>
                          <span>{formatAmount(stats.monthlySavings)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Activity size={16} className="mr-1" />
            <span>Today: {formatAmount(stats.todayTotal)}</span>
          </div>
        </div>

        <div className="bg-purple-50 rounded-xl p-6 shadow-lg border border-purple-100">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 rounded-lg p-3">
              <Target size={24} className="text-purple-400" />
            </div>
            <div className="text-right">
              <p className="text-sm text-purple-500">Monthly Savings</p>
              <p className="text-2xl font-bold text-purple-900">{formatAmount(stats.monthlySavings)}</p>
            </div>
          </div>
          <div className="flex items-center text-sm text-purple-400">
            <CreditCard size={16} className="mr-1" />
            <span>EMI: {formatAmount(stats.totalEMI)}</span>
          </div>
        </div>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Spending by Category */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Spending by Category</h3>
            <PieChart size={20} className="text-gray-500" />
          </div>
          
          <div className="space-y-4">
            {Object.entries(stats.categoryBreakdown)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 6)
              .map(([category, amount]) => {
                const percentage = (amount / stats.monthTotal) * 100;
                
                return (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">{category}</span>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">{formatAmount(amount)}</p>
                        <p className="text-xs text-gray-500">{percentage.toFixed(1)}%</p>
                      </div>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Financial Health */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Financial Health</h3>
            <Activity size={20} className="text-gray-500" />
          </div>
          
          <div className="space-y-6">
            {/* Savings Rate */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Savings Rate</span>
                <span className="text-sm font-semibold text-gray-900">
                  {stats.totalIncome > 0 ? ((stats.availableBalance / stats.totalIncome) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div className="bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                  style={{ width: `${stats.totalIncome > 0 ? Math.min(((stats.availableBalance / stats.totalIncome) * 100), 100) : 0}%` }}
                />
              </div>
            </div>

            {/* EMI Burden */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">EMI Burden</span>
                <span className="text-sm font-semibold text-gray-900">
                  {stats.totalIncome > 0 ? ((stats.totalEMI / stats.totalIncome) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div className="bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full"
                  style={{ width: `${stats.totalIncome > 0 ? Math.min(((stats.totalEMI / stats.totalIncome) * 100), 100) : 0}%` }}
                />
              </div>
            </div>

            {/* Expense Ratio */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Expense Ratio</span>
                <span className="text-sm font-semibold text-gray-900">
                  {stats.totalIncome > 0 ? ((stats.monthTotal / stats.totalIncome) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div className="bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                  style={{ width: `${stats.totalIncome > 0 ? Math.min(((stats.monthTotal / stats.totalIncome) * 100), 100) : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
          <button className="text-emerald-600 hover:text-emerald-700 font-medium text-sm">
            View All
          </button>
        </div>
        
        <div className="space-y-4">
          {expenses.slice(0, 5).map((expense) => {
            const category = categories.find(c => c.id === expense.category);
            
            return (
              <div key={expense.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
                    <DollarSign size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{expense.description}</p>
                    <p className="text-sm text-gray-500">{category?.name || expense.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{formatAmount(expense.amount)}</p>
                  <p className="text-sm text-gray-500">{new Date(expense.date).toLocaleDateString()}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}