import { useState, useMemo, useEffect } from 'react';
import { Income, EMI, Expense, FinancialForecast, Savings } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { 
  TrendingUp, 
  DollarSign, 
  PlusCircle, 
  Calendar, 
  Target,
  Wallet,
  ArrowUpCircle,
  ArrowDownCircle,
  Edit2,
  Trash2
} from 'lucide-react';

interface FinancialPlanningProps {
  income: Income[];
  expenses: Expense[];
  emis: EMI[];
  savings?: Savings[];
  onAddIncome: (income: Omit<Income, 'id' | 'createdAt'>) => void;
  onUpdateIncome: (id: string, income: Partial<Income>) => void;
  onDeleteIncome: (id: string) => void;
  currency: string;
  darkMode?: boolean;
  resetFlag?: boolean;
  isAddIncomeModalOpen?: boolean;
  setIsAddIncomeModalOpen?: (open: boolean) => void;
}

export function FinancialPlanning({
  income,
  expenses,
  emis,
  savings = [],
  onAddIncome,
  onUpdateIncome,
  onDeleteIncome,
  currency,
  darkMode = false,
  resetFlag = false,
  isAddIncomeModalOpen = false,
  setIsAddIncomeModalOpen
}: FinancialPlanningProps) {
  const { t } = useTranslation();
  const [showAddIncome, _setShowAddIncome] = useState(false);
  const actualShowAddIncome = typeof isAddIncomeModalOpen === 'boolean' ? isAddIncomeModalOpen : showAddIncome;
  const actualSetShowAddIncome = setIsAddIncomeModalOpen || _setShowAddIncome;
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [extraIncome, setExtraIncome] = useState('');
  const [incomeSource, setIncomeSource] = useState('');

  const currentMonth = new Date().toISOString().slice(0, 7);
  
  // Reset form state when modal is closed externally
  useEffect(() => {
    console.log('🔧 Modal state changed:', actualShowAddIncome);
    if (!actualShowAddIncome) {
      setEditingIncome(null);
      setMonthlyIncome('');
      setExtraIncome('');
      setIncomeSource('');
    }
  }, [actualShowAddIncome]);

  // Reset form state when component mounts or income changes
  useEffect(() => {
    if (!actualShowAddIncome) {
      setEditingIncome(null);
      setMonthlyIncome('');
      setExtraIncome('');
      setIncomeSource('');
    }
  }, [income, actualShowAddIncome]);

  // Debug modal rendering
  useEffect(() => {
    console.log('🔧 Modal should render:', actualShowAddIncome, 'editingIncome:', editingIncome);
  }, [actualShowAddIncome, editingIncome]);
  
  const currentIncome = useMemo(() => {
    if (resetFlag) return {
      id: '',
      monthlyIncome: 0,
      extraIncome: 0,
      incomeSource: '',
      month: '',
      createdAt: ''
    };
    return income.find(inc => inc.month === currentMonth) || null;
  }, [income, currentMonth, resetFlag]);

  const monthlyStats = useMemo(() => {
    if (resetFlag) {
      return {
        totalExpenses: 0,
        totalEMI: 0,
        totalIncome: 0,
        monthlySavingsContribution: 0,
        remainingAmount: 0,
        activeEMIs: 0,
        savingsRate: 0
      };
    }
    const monthExpenses = expenses.filter(expense => {
      const expenseMonth = expense.date.slice(0, 7);
      return expenseMonth === currentMonth;
    });

    const activeEMIs = emis.filter(emi => {
      const startMonth = emi.startMonth;
      const endMonth = emi.endMonth;
      return currentMonth >= startMonth && currentMonth <= endMonth && emi.isActive;
    });

    const totalExpenses = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalEMI = activeEMIs.reduce((sum, emi) => sum + emi.monthlyAmount, 0);
    const totalIncome = currentIncome ? currentIncome.monthlyIncome + currentIncome.extraIncome : 0;
    
    // Calculate monthly savings contributions
    const monthlySavingsContribution = savings
      .filter(s => s.isActive && !s.isMatured)
      .reduce((sum, s) => {
        if (s.type === 'rd') return sum + (s.monthlyDeposit || 0);
        if (s.type === 'sip') return sum + (s.monthlyInvestment || 0);
        if (s.type === 'custom' && s.frequency === 'monthly') return sum + s.amount;
        return sum;
      }, 0);
    
    const remainingAmount = totalIncome - totalExpenses - totalEMI;
    const savingsRate = totalIncome > 0 ? ((remainingAmount / totalIncome) * 100) : 0;

    return {
      totalIncome,
      totalExpenses,
      totalEMI,
      monthlySavingsContribution,
      remainingAmount,
      savingsRate,
      activeEMIs: activeEMIs.length
    };
  }, [currentIncome, expenses, emis, savings, currentMonth, resetFlag]);

  const handleAddIncome = () => {
    if (!monthlyIncome) return;

    const incomeData: Omit<Income, 'id' | 'createdAt'> = {
      monthlyIncome: parseFloat(monthlyIncome),
      extraIncome: parseFloat(extraIncome) || 0,
      incomeSource: incomeSource.trim() || undefined,
      month: currentMonth
    };

    if (editingIncome) {
      onUpdateIncome(editingIncome.id, incomeData);
    } else {
      onAddIncome(incomeData);
    }

    actualSetShowAddIncome(false);
    setEditingIncome(null);
    setMonthlyIncome('');
    setExtraIncome('');
    setIncomeSource('');
  };

  const handleEditIncome = (incomeItem: Income) => {
    console.log('🔧 Editing income:', incomeItem);
    setEditingIncome(incomeItem);
    setMonthlyIncome(incomeItem.monthlyIncome.toString());
    setExtraIncome(incomeItem.extraIncome.toString());
    setIncomeSource(incomeItem.incomeSource || '');
    console.log('🔧 Setting modal to open');
    actualSetShowAddIncome(true);
  };

  const handleAddAdditionalIncome = (incomeItem: Income) => {
    setEditingIncome(incomeItem);
    setMonthlyIncome(incomeItem.monthlyIncome.toString());
    setExtraIncome(incomeItem.extraIncome.toString());
    setIncomeSource(incomeItem.incomeSource || '');
    actualSetShowAddIncome(true);
  };

  const baseClasses = darkMode 
    ? 'bg-gray-800 text-white border-gray-700' 
    : 'bg-white text-gray-900 border-gray-200';

  const inputClasses = darkMode
    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-green-400'
    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-green-500';

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && actualShowAddIncome) {
        actualSetShowAddIncome(false);
        setEditingIncome(null);
        setMonthlyIncome('');
        setExtraIncome('');
        setIncomeSource('');
      }
    };

    if (actualShowAddIncome) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [actualShowAddIncome, actualSetShowAddIncome]);

  return (
    <div className={`p-6 space-y-6 pb-12 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-xl sm:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Financial Planning
          </h1>
          <p className={`text-base ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <button
          onClick={() => actualSetShowAddIncome(true)}
          className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg p-3 hover:from-green-600 hover:to-blue-600 transition-all duration-200 shadow-lg"
        >
          <PlusCircle size={20} />
        </button>
      </div>

      {/* Current Income Display */}
      {currentIncome ? (
        <div className={`rounded-xl shadow-lg border p-6 ${baseClasses}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl p-2 shadow-lg">
                <Wallet size={20} className="text-white" />
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Monthly Income
                </h3>
                <p className={`text-base ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {currentIncome.incomeSource || 'Primary income source'}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleEditIncome(currentIncome)}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                  darkMode 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
                title="Edit Income"
              >
                <Edit2 size={14} />
                <span>Edit</span>
              </button>
              <button
                onClick={() => onDeleteIncome(currentIncome.id)}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                  darkMode 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
                title="Delete Income"
              >
                <Trash2 size={14} />
                <span>Delete</span>
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className={`text-base ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Primary Income
              </p>
              <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {currency}{currentIncome.monthlyIncome.toLocaleString()}
              </p>
            </div>
            <div>
              <p className={`text-base ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Extra Income
              </p>
              <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {currency}{currentIncome.extraIncome.toLocaleString()}
              </p>
            </div>
          </div>
          
          <div className={`mt-4 pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <p className={`text-base ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Total Monthly Income
            </p>
            <p className={`text-2xl font-bold text-green-600`}>
              {currency}{(currentIncome.monthlyIncome + currentIncome.extraIncome).toLocaleString()}
            </p>
          </div>

          {/* Additional Income Info */}
          <div className={`mt-4 p-3 rounded-lg ${
            darkMode ? 'bg-blue-900/20 border border-blue-700' : 'bg-blue-50 border border-blue-200'
          }`}>
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <p className={`text-base font-medium ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                Need to add more income?
              </p>
            </div>
            <p className={`text-xs ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
              Click "Edit" to modify your income amounts. You can increase your primary income or add more extra income anytime.
            </p>
          </div>
        </div>
      ) : (
        <div className={`rounded-xl shadow-lg border p-8 text-center ${baseClasses}`}>
          <div className={`rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 ${
            darkMode ? 'bg-emerald-900/30' : 'bg-emerald-50'
          }`}>
            <DollarSign size={32} className="text-emerald-600" />
          </div>
          <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Add Your Income
          </h3>
          <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Start by adding your monthly income to track your finances
          </p>
          <button
            onClick={() => actualSetShowAddIncome(true)}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl px-6 py-3 hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 font-medium shadow-lg"
          >
            Add Income
          </button>
        </div>
      )}

      {/* Financial Overview Cards */}
      {currentIncome && (
        <div className="grid grid-cols-2 gap-4">
          <div className={`rounded-xl shadow-lg border p-4 ${baseClasses}`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className={`text-base font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Monthly Expenses
              </h3>
              <ArrowDownCircle size={16} className="text-red-500" />
            </div>
            <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {currency}{monthlyStats.totalExpenses.toLocaleString()}
            </p>
          </div>

          <div className={`rounded-xl shadow-lg border p-4 ${baseClasses}`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className={`text-base font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                EMI Burden
              </h3>
              <Calendar size={16} className="text-orange-500" />
            </div>
            <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {currency}{monthlyStats.totalEMI.toLocaleString()}
            </p>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {monthlyStats.activeEMIs} active EMIs
            </p>
          </div>

          <div className={`rounded-xl shadow-lg border p-4 ${baseClasses}`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className={`text-base font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Monthly Savings
              </h3>
              <Target size={16} className="text-purple-500" />
            </div>
            <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {currency}{monthlyStats.monthlySavingsContribution.toLocaleString()}
            </p>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              SIP + RD contributions
            </p>
          </div>

          <div className={`rounded-xl shadow-lg border p-4 ${baseClasses}`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className={`text-base font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Available Balance
              </h3>
              <ArrowUpCircle size={16} className={monthlyStats.remainingAmount >= 0 ? 'text-green-500' : 'text-red-500'} />
            </div>
            <p className={`text-xl font-bold ${
              monthlyStats.remainingAmount >= 0 
                ? 'text-green-600' 
                : 'text-red-600'
            }`}>
              {currency}{monthlyStats.remainingAmount.toLocaleString()}
            </p>
          </div>

          <div className={`rounded-xl shadow-lg border p-4 ${baseClasses}`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className={`text-base font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Savings Rate
              </h3>
              <Target size={16} className="text-blue-500" />
            </div>
            <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {monthlyStats.savingsRate.toFixed(1)}%
            </p>
          </div>
        </div>
      )}

      {/* Add Income Modal */}
      {actualShowAddIncome && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`${baseClasses} rounded-xl w-full max-w-md shadow-2xl`}>
            <div className={`border-b p-6 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {editingIncome ? 'Edit Income' : 'Add Monthly Income'}
              </h2>
              {editingIncome && (
                <p className={`text-base mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Update your income amounts. You can increase or decrease any field.
                </p>
              )}
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className={`block text-base font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Primary Monthly Income *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-green-500 font-semibold">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(e.target.value)}
                    placeholder={editingIncome ? "Current: " + editingIncome.monthlyIncome : "50000"}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 ${inputClasses}`}
                    required
                  />
                </div>
                {editingIncome && (
                  <p className={`text-base mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Current: ₹{editingIncome.monthlyIncome.toLocaleString()}
                  </p>
                )}
              </div>

              <div>
                <label className={`block text-base font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Extra Income (Bonuses, Freelance, etc.)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-green-500 font-semibold">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={extraIncome}
                    onChange={(e) => setExtraIncome(e.target.value)}
                    placeholder={editingIncome ? "Current: " + editingIncome.extraIncome : "5000"}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 ${inputClasses}`}
                  />
                </div>
                {editingIncome && (
                  <p className={`text-base mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Current: ₹{editingIncome.extraIncome.toLocaleString()}
                  </p>
                )}
              </div>

              <div>
                <label className={`block text-base font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Income Source
                </label>
                <input
                  type="text"
                  value={incomeSource}
                  onChange={(e) => setIncomeSource(e.target.value)}
                  placeholder="e.g., Salary, Freelance, Business"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 ${inputClasses}`}
                />
              </div>

              {editingIncome && (
                <div className={`p-3 rounded-lg ${
                  darkMode ? 'bg-blue-900/20 border border-blue-700' : 'bg-blue-50 border border-blue-200'
                }`}>
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <p className={`text-base font-medium ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                      Total Income Preview
                    </p>
                  </div>
                  <p className={`text-lg font-bold ${darkMode ? 'text-blue-200' : 'text-blue-800'}`}>
                    ₹{((parseFloat(monthlyIncome) || 0) + (parseFloat(extraIncome) || 0)).toLocaleString()}
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                    Primary: ₹{(parseFloat(monthlyIncome) || 0).toLocaleString()} + Extra: ₹{(parseFloat(extraIncome) || 0).toLocaleString()}
                  </p>
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => {
                    actualSetShowAddIncome(false);
                    setEditingIncome(null);
                    setMonthlyIncome('');
                    setExtraIncome('');
                    setIncomeSource('');
                  }}
                  className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
                    darkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddIncome}
                  disabled={!monthlyIncome}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 font-medium disabled:opacity-50 shadow-lg"
                >
                  {editingIncome ? 'Update Income' : 'Save Income'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}