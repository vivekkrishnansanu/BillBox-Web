import { useMemo } from 'react';
import { Expense, Category, Income, EMI, Savings } from '../types';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar,
  PieChart,
  DollarSign,
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface AnalyticsProps {
  expenses: Expense[];
  categories: Category[];
  income: Income[];
  emis: EMI[];
  savings: Savings[];
  currency: string;
  darkMode?: boolean;
  resetFlag?: boolean;
}

export function Analytics({ 
  expenses, 
  categories, 
  income, 
  emis, 
  savings, 
  currency, 
  darkMode = false,
  resetFlag = false
}: AnalyticsProps) {
  const analytics = useMemo(() => {
    if (resetFlag) {
      return {
        currentTotal: 0,
        lastTotal: 0,
        change: 0,
        changePercent: 0,
        dailyExpenses: {},
        categoryBreakdown: {},
        weeklyData: [],
        avgDaily: 0,
        topSpendingDays: [],
      };
    }
    const currentMonth = new Date().toISOString().slice(0, 7);
    const lastMonth = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 7);
    
    // Current month expenses
    const currentMonthExpenses = expenses.filter(e => e.date.slice(0, 7) === currentMonth);
    const lastMonthExpenses = expenses.filter(e => e.date.slice(0, 7) === lastMonth);
    
    const currentTotal = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
    const lastTotal = lastMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
    
    // Daily expenses for current month
    const dailyExpenses = currentMonthExpenses.reduce((acc, expense) => {
      const day = new Date(expense.date).getDate();
      acc[day] = (acc[day] || 0) + expense.amount;
      return acc;
    }, {} as Record<number, number>);
    
    // Category breakdown
    const categoryBreakdown = currentMonthExpenses.reduce((acc, expense) => {
      const category = categories.find(c => c.id === expense.category);
      const categoryName = category?.name || expense.category;
      acc[categoryName] = (acc[categoryName] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);
    
    // Weekly comparison
    const weeklyData = [];
    for (let week = 0; week < 4; week++) {
      const weekStart = new Date(new Date().getFullYear(), new Date().getMonth(), week * 7 + 1);
      const weekEnd = new Date(new Date().getFullYear(), new Date().getMonth(), (week + 1) * 7);
      
      const weekExpenses = currentMonthExpenses.filter(e => {
        const expenseDate = new Date(e.date);
        return expenseDate >= weekStart && expenseDate <= weekEnd;
      });
      
      weeklyData.push({
        week: `Week ${week + 1}`,
        amount: weekExpenses.reduce((sum, e) => sum + e.amount, 0)
      });
    }
    
    // Top spending days
    const topSpendingDays = Object.entries(dailyExpenses)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
    
    return {
      currentTotal,
      lastTotal,
      change: currentTotal - lastTotal,
      changePercent: lastTotal > 0 ? ((currentTotal - lastTotal) / lastTotal) * 100 : 0,
      dailyExpenses,
      categoryBreakdown,
      weeklyData,
      avgDaily: currentTotal / new Date().getDate(),
      topSpendingDays
    };
  }, [expenses, categories, resetFlag]);

  const baseClasses = darkMode 
    ? 'text-white' 
    : 'text-gray-900';

  const cardClasses = darkMode
    ? 'bg-slate-800/50 border-slate-700'
    : 'bg-white border-slate-200';

  if (expenses.length === 0) {
    return (
      <div className="w-full pt-6 pb-12 space-y-6 text-center">
        <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 ${
          darkMode ? 'bg-slate-800/50' : 'bg-slate-100'
        }`}>
          <BarChart3 size={40} className="sm:w-12 sm:h-12 text-slate-600" />
        </div>
        <h2 className={`text-xl sm:text-2xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          No Data to Analyze
        </h2>
        <p className={`mb-6 text-base sm:text-base ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Start adding expenses to see analytics and insights
        </p>
        <button 
          onClick={() => window.dispatchEvent(new CustomEvent('openAddExpense'))}
          className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl sm:rounded-2xl px-4 sm:px-6 py-2.5 sm:py-3 font-medium shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base"
        >
          Add Your First Expense
        </button>
      </div>
    );
  }

  return (
    <div className={`w-full p-6 space-y-6 pb-12 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className={`rounded-xl border shadow-lg p-4 sm:p-6 md:p-8 ${cardClasses}`}>
          <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg sm:rounded-xl p-2 sm:p-3 shadow-lg">
              <DollarSign size={16} className="sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <p className={`text-xs sm:text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                This Month
              </p>
              <p className={`text-lg sm:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {currency}{analytics.currentTotal.toLocaleString()}
              </p>
            </div>
          </div>
          <div className={`flex items-center space-x-1 ${
            analytics.change >= 0 ? 'text-red-500' : 'text-green-500'
          }`}>
            {analytics.change >= 0 ? <ArrowUpRight size={10} className="sm:w-3 sm:h-3" /> : <ArrowDownRight size={10} className="sm:w-3 sm:h-3" />}
            <span className="text-base font-medium">
              {Math.abs(analytics.changePercent).toFixed(1)}% vs last month
            </span>
          </div>
        </div>

        <div className={`rounded-xl border shadow-lg p-4 sm:p-6 md:p-8 ${cardClasses}`}>
          <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg sm:rounded-xl p-2 sm:p-3 shadow-lg">
              <Calendar size={16} className="sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <p className={`text-xs sm:text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Daily Average
              </p>
              <p className={`text-lg sm:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {currency}{analytics.avgDaily.toFixed(2)}
              </p>
            </div>
          </div>
          <p className={`text-base ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Based on {new Date().getDate()} days
          </p>
        </div>

        <div className={`rounded-xl border shadow-lg p-4 sm:p-6 md:p-8 ${cardClasses}`}>
          <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg sm:rounded-xl p-2 sm:p-3 shadow-lg">
              <TrendingUp size={16} className="sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <p className={`text-xs sm:text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Top Spending Day
              </p>
              <p className={`text-lg sm:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {analytics.topSpendingDays.length > 0 ? analytics.topSpendingDays[0][0] : 'N/A'}
              </p>
            </div>
          </div>
          <p className={`text-base ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {analytics.topSpendingDays.length > 0 ? `${currency}${analytics.topSpendingDays[0][1].toLocaleString()}` : 'No data'}
          </p>
        </div>

        <div className={`rounded-xl border shadow-lg p-6 md:p-8 ${cardClasses}`}>
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-3 shadow-lg">
              <Activity size={20} className="text-white" />
            </div>
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Categories
              </p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {Object.keys(analytics.categoryBreakdown).length}
              </p>
            </div>
          </div>
          <p className={`text-base ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Active spending categories
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Breakdown */}
        <div className={`rounded-xl border shadow-lg p-6 md:p-8 ${cardClasses}`}>
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-3 shadow-lg">
              <PieChart size={24} className="text-white" />
            </div>
            <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Category Breakdown
            </h3>
          </div>
          
          <div className="space-y-4">
            {Object.entries(analytics.categoryBreakdown)
              .sort(([,a], [,b]) => b - a)
              .map(([category, amount]) => {
                const percentage = (amount / analytics.currentTotal) * 100;
                
                return (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {category}
                      </span>
                      <div className="text-right">
                        <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {currency}{amount.toLocaleString()}
                        </p>
                        <p className={`text-base ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {percentage.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    <div className={`rounded-full h-2 ${darkMode ? 'bg-slate-700/50' : 'bg-slate-200'}`}>
                      <div 
                        className="h-2 rounded-full transition-all duration-500 bg-gradient-to-r from-emerald-500 to-teal-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Weekly Trends */}
        <div className={`rounded-xl border shadow-lg p-6 md:p-8 ${cardClasses}`}>
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl p-3 shadow-lg">
              <Activity size={24} className="text-white" />
            </div>
            <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Weekly Trends
            </h3>
          </div>
          
          <div className="space-y-4">
            {analytics.weeklyData.map((week, index) => {
              const maxWeekly = Math.max(...analytics.weeklyData.map(w => w.amount));
              const percentage = maxWeekly > 0 ? (week.amount / maxWeekly) * 100 : 0;
              
              return (
                <div key={week.week} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {week.week}
                    </span>
                    <span className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {currency}{week.amount.toLocaleString()}
                    </span>
                  </div>
                  <div className={`rounded-full h-3 ${darkMode ? 'bg-slate-700/50' : 'bg-slate-200'}`}>
                    <div 
                      className="h-3 rounded-full transition-all duration-500 bg-gradient-to-r from-emerald-500 to-teal-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Spending Days */}
      <div className={`rounded-xl border shadow-lg p-6 md:p-8 ${cardClasses}`}>
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-3 shadow-lg">
            <TrendingUp size={24} className="text-white" />
          </div>
          <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Top Spending Days
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {analytics.topSpendingDays.map(([day, amount], index) => (
            <div key={day} className={`p-4 rounded-lg ${darkMode ? 'bg-slate-700/30' : 'bg-slate-50'}`}>
              <div className="text-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-2 ${
                  darkMode ? 'bg-slate-600 text-slate-200' : 'bg-white text-slate-700 shadow-sm'
                }`}>
                  {day}
                </div>
                <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {currency}{amount.toLocaleString()}
                </p>
                <div className={`mt-2 rounded-full h-1 ${darkMode ? 'bg-slate-600' : 'bg-slate-200'}`}>
                  <div 
                    className="h-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                    style={{ width: `${(amount / analytics.topSpendingDays[0][1]) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Insights */}
      <div className={`rounded-xl border shadow-lg p-6 md:p-8 ${cardClasses}`}>
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-gradient-to-r from-teal-500 to-emerald-500 rounded-xl p-3 shadow-lg">
            <TrendingUp size={24} className="text-white" />
          </div>
          <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Financial Insights
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`p-6 rounded-xl ${darkMode ? 'bg-slate-700/30' : 'bg-slate-50'}`}>
            <h4 className={`text-lg font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Spending Pattern
            </h4>
            <p className={`text-base ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {analytics.change >= 0 
                ? `You've spent ${Math.abs(analytics.changePercent).toFixed(1)}% more than last month. Consider reviewing your budget.`
                : `Great! You've reduced spending by ${Math.abs(analytics.changePercent).toFixed(1)}% this month. Keep it up!`
              }
            </p>
          </div>
          
          <div className={`p-6 rounded-xl ${darkMode ? 'bg-slate-700/30' : 'bg-slate-50'}`}>
            <h4 className={`text-lg font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Daily Average
            </h4>
            <p className={`text-base ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Your daily average is {currency}{analytics.avgDaily.toFixed(2)}. 
              {analytics.avgDaily > 1000 ? ' Consider setting a daily budget to control spending.' : ' You\'re maintaining good spending discipline!'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}