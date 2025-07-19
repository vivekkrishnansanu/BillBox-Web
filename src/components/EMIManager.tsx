import { useState, useMemo, useEffect } from 'react';
import { EMI, FinancialForecast, Income, Expense } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { 
  CreditCard, 
  PlusCircle, 
  Calendar, 
  TrendingUp,
  Clock,
  CheckCircle,
  Edit2,
  Trash2,
  Target,
  AlertCircle,
  Plus,
  X
} from 'lucide-react';

interface EMIManagerProps {
  emis: EMI[];
  income: Income[];
  expenses: Expense[];
  onAddEMI: (emi: Omit<EMI, 'id' | 'createdAt' | 'totalAmount' | 'endMonth'>) => void;
  onUpdateEMI: (id: string, emi: Partial<EMI>) => void;
  onDeleteEMI: (id: string) => void;
  currency: string;
  darkMode?: boolean;
  resetFlag?: boolean;
}

export function EMIManager({
  emis,
  income,
  expenses,
  onAddEMI,
  onUpdateEMI,
  onDeleteEMI,
  currency,
  darkMode = false,
  resetFlag = false
}: EMIManagerProps) {
  const { t } = useTranslation();
  const [showAddEMI, setShowAddEMI] = useState(false);
  const [editingEMI, setEditingEMI] = useState<EMI | null>(null);
  const [emiName, setEmiName] = useState('');
  const [monthlyAmount, setMonthlyAmount] = useState('');
  const [tenure, setTenure] = useState('');
  const [category, setCategory] = useState('loan');

  const currentMonth = new Date().toISOString().slice(0, 7);

  const emiCategories = [
    { id: 'home_loan', name: 'Home Loan', icon: '🏠' },
    { id: 'car_loan', name: 'Car Loan', icon: '🚗' },
    { id: 'personal_loan', name: 'Personal Loan', icon: '💰' },
    { id: 'education_loan', name: 'Education Loan', icon: '🎓' },
    { id: 'credit_card', name: 'Credit Card', icon: '💳' },
    { id: 'bike_loan', name: 'Bike Loan', icon: '🏍️' },
    { id: 'other', name: 'Other', icon: '📋' }
  ];

  const emiStats = useMemo(() => {
    const activeEMIs = emis.filter(emi => {
      const startMonth = emi.startMonth;
      const endMonth = emi.endMonth;
      return currentMonth >= startMonth && currentMonth <= endMonth && emi.isActive;
    });

    const completedEMIs = emis.filter(emi => currentMonth > emi.endMonth);
    const upcomingEMIs = emis.filter(emi => currentMonth < emi.startMonth);

    const totalActiveEMI = activeEMIs.reduce((sum, emi) => sum + emi.monthlyAmount, 0);
    const totalEMIValue = emis.reduce((sum, emi) => sum + emi.totalAmount, 0);
    const remainingEMIValue = activeEMIs.reduce((sum, emi) => {
      const remainingMonths = Math.max(0, 
        (new Date(emi.endMonth + '-01').getTime() - new Date(currentMonth + '-01').getTime()) / (1000 * 60 * 60 * 24 * 30)
      );
      return sum + (emi.monthlyAmount * Math.ceil(remainingMonths));
    }, 0);

    return {
      activeEMIs,
      completedEMIs,
      upcomingEMIs,
      totalActiveEMI,
      totalEMIValue,
      remainingEMIValue
    };
  }, [emis, currentMonth]);

  const financialForecast = useMemo(() => {
    const currentIncome = income.find(inc => inc.month === currentMonth);
    if (!currentIncome) return [];

    const forecast: FinancialForecast[] = [];
    const totalIncome = currentIncome.monthlyIncome + currentIncome.extraIncome;
    
    // Calculate average monthly expenses
    const avgExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0) / Math.max(1, expenses.length) * 30;

    for (let i = 0; i < 24; i++) { // 2 years forecast
      const forecastDate = new Date();
      forecastDate.setMonth(forecastDate.getMonth() + i);
      const forecastMonth = forecastDate.toISOString().slice(0, 7);

      const activeEMIsForMonth = emis.filter(emi => 
        forecastMonth >= emi.startMonth && forecastMonth <= emi.endMonth && emi.isActive
      );

      const totalEMIForMonth = activeEMIsForMonth.reduce((sum, emi) => sum + emi.monthlyAmount, 0);
      const remainingAmount = totalIncome - avgExpenses - totalEMIForMonth;

      forecast.push({
        month: forecastMonth,
        income: totalIncome,
        expenses: avgExpenses,
        activeEMIs: activeEMIsForMonth.length,
        totalEMIAmount: totalEMIForMonth,
        remainingAmount,
        savings: Math.max(0, remainingAmount),
        completedEMIs: emis.filter(emi => forecastMonth > emi.endMonth).map(emi => emi.name)
      });
    }

    return forecast;
  }, [emis, income, expenses, currentMonth]);

  const addMonthsToDate = (dateStr: string, months: number): string => {
    const date = new Date(dateStr + '-01');
    date.setMonth(date.getMonth() + months);
    return date.toISOString().slice(0, 7);
  };

  const handleMarkEMICompleted = (id: string) => {
    const completedEMI = emis.find(emi => emi.id === id);
    if (completedEMI && confirm(`Mark ${completedEMI.name} as completed? This will add the EMI amount to your available savings.`)) {
      onUpdateEMI(id, { isActive: false });
      
      // Optionally, you could trigger a callback to add this to savings
      // This would require passing a callback from the parent component
    }
  };

  const handleMarkEMICompleted_old = (id: string) => {
    onUpdateEMI(id, { isActive: false });
  };

  const handleAddEMI = () => {
    if (!emiName || !monthlyAmount || !tenure) return;

    const startMonth = currentMonth;
    const endMonth = addMonthsToDate(startMonth, parseInt(tenure) - 1);
    const totalAmount = parseFloat(monthlyAmount) * parseInt(tenure);

    const emiData = {
      name: emiName.trim(),
      monthlyAmount: parseFloat(monthlyAmount),
      tenure: parseInt(tenure),
      startMonth,
      category,
      isActive: true
    };

    if (editingEMI) {
      onUpdateEMI(editingEMI.id, emiData);
    } else {
      onAddEMI(emiData);
    }

    setShowAddEMI(false);
    setEditingEMI(null);
    setEmiName('');
    setMonthlyAmount('');
    setTenure('');
    setCategory('loan');
  };

  const handleEditEMI = (emi: EMI) => {
    setEditingEMI(emi);
    setEmiName(emi.name);
    setMonthlyAmount(emi.monthlyAmount.toString());
    setTenure(emi.tenure.toString());
    setCategory(emi.category);
    setShowAddEMI(true);
  };

  const getEMIStatus = (emi: EMI) => {
    if (currentMonth > emi.endMonth) return 'completed';
    if (currentMonth < emi.startMonth) return 'upcoming';
    return 'active';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'upcoming': return 'text-blue-600 bg-blue-50';
      case 'active': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const baseClasses = darkMode 
    ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white min-h-screen' 
    : 'bg-gradient-to-br from-slate-50 via-white to-slate-50 text-gray-900 min-h-screen';

  const cardClasses = darkMode
    ? 'bg-slate-800/50 border-slate-700'
    : 'bg-white border-slate-200';

  const inputClasses = darkMode
    ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-emerald-400'
    : 'bg-white border-slate-300 text-gray-900 placeholder-slate-500 focus:border-emerald-500';

  useEffect(() => {
    if (resetFlag) {
      setShowAddEMI(false);
      setEditingEMI(null);
      setEmiName('');
      setMonthlyAmount('');
      setTenure('');
      setCategory('loan');
    }
  }, [resetFlag]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showAddEMI) {
        setShowAddEMI(false);
        setEditingEMI(null);
        setEmiName('');
        setMonthlyAmount('');
        setTenure('');
        setCategory('loan');
      }
    };

    if (showAddEMI) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showAddEMI]);

  return (
    <div className="w-full p-6 space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-xl sm:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            EMI Manager
          </h1>
          <p className={`text-base ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Track and manage your loan EMIs
          </p>
        </div>
        <button
          onClick={() => setShowAddEMI(true)}
          className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl p-3 hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 shadow-lg"
        >
          <PlusCircle size={20} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className={`rounded-xl shadow-lg border p-4 ${cardClasses}`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Active EMIs
            </h3>
            <Clock size={16} className="text-orange-500" />
          </div>
          <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {emiStats.activeEMIs.length}
          </p>
          <p className={`text-base ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {currency}{emiStats.totalActiveEMI.toLocaleString()}/month
          </p>
        </div>

        <div className={`rounded-xl shadow-lg border p-4 ${cardClasses}`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Completed EMIs
            </h3>
            <CheckCircle size={16} className="text-green-500" />
          </div>
          <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {emiStats.completedEMIs.length}
          </p>
        </div>

        <div className={`rounded-xl shadow-lg border p-4 ${cardClasses}`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Total EMI Value
            </h3>
            <Target size={16} className="text-blue-500" />
          </div>
          <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {currency}{emiStats.totalEMIValue.toLocaleString()}
          </p>
        </div>

        <div className={`rounded-xl shadow-lg border p-4 ${cardClasses}`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Remaining Amount
            </h3>
            <AlertCircle size={16} className="text-red-500" />
          </div>
          <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {currency}{emiStats.remainingEMIValue.toLocaleString()}
          </p>
        </div>
      </div>

      <div className={`rounded-xl shadow-lg border p-6 ${cardClasses}`}>
        <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Your EMIs
        </h3>
        
        {emis.length === 0 ? (
          <div className="text-center py-8">
            <div className={`rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 ${
              darkMode ? 'bg-emerald-900/30' : 'bg-emerald-50'
            }`}>
              <CreditCard size={32} className="text-emerald-600" />
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              No EMIs Added
            </h3>
            <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Add your first EMI to start tracking your loan payments
            </p>
            <button
              onClick={() => setShowAddEMI(true)}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl px-6 py-3 hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 font-medium shadow-lg"
            >
              Add EMI
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {emis.map((emi) => {
              const status = getEMIStatus(emi);
              const categoryInfo = emiCategories.find(cat => cat.id === emi.category) || emiCategories[6];
              
              return (
                <div key={emi.id} className={`p-4 rounded-lg border ${
                  darkMode ? 'border-slate-600 bg-slate-700/30' : 'border-slate-200 bg-slate-50'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{categoryInfo.icon}</div>
                      <div>
                        <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {emi.name}
                        </h4>
                        <p className={`text-base ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {categoryInfo.name}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {currency}{emi.monthlyAmount.toLocaleString()}/month
                        </p>
                        <p className={`text-base ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {emi.tenure} months
                        </p>
                      </div>
                      
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                        {status}
                      </span>
                      
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleEditEMI(emi)}
                          className={`p-1 rounded transition-colors ${
                            darkMode ? 'hover:bg-slate-600' : 'hover:bg-slate-200'
                          }`}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => onDeleteEMI(emi.id)}
                          className={`p-1 rounded transition-colors ${
                            darkMode ? 'hover:bg-red-900/20 text-red-400' : 'hover:bg-red-50 text-red-600'
                          }`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`mt-3 pt-3 border-t ${darkMode ? 'border-slate-600' : 'border-slate-200'}`}>
                    <div className="flex justify-between text-base">
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                        Start: {new Date(emi.startMonth + '-01').toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                      </span>
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                        End: {new Date(emi.endMonth + '-01').toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                      </span>
                      <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Total: {currency}{emi.totalAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {financialForecast.length > 0 && (
        <div className={`rounded-xl shadow-lg border p-6 ${cardClasses}`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Savings Forecast
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {financialForecast.slice(0, 12).map((forecast) => (
              <div key={forecast.month} className={`flex items-center justify-between p-3 rounded-lg ${
                darkMode ? 'bg-slate-700/30' : 'bg-slate-50'
              }`}>
                <div>
                  <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {new Date(forecast.month + '-01').toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                  </p>
                  <p className={`text-base ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {forecast.activeEMIs} active EMIs
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    forecast.savings > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {currency}{forecast.savings.toLocaleString()}
                  </p>
                  <p className={`text-base ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    EMI: {currency}{forecast.totalEMIAmount.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showAddEMI && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-[90vw] max-w-xs max-h-[80vh] h-auto mx-auto p-4 sm:rounded-2xl sm:w-full sm:max-w-md md:max-w-lg lg:max-w-xl sm:p-6 shadow-2xl overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 rounded-full p-2">
                    <Plus size={20} className="text-green-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {editingEMI ? 'Edit EMI' : 'Add New EMI'}
                  </h2>
                </div>
                <button
                  onClick={() => {
                    setShowAddEMI(false);
                    setEditingEMI(null);
                    setEmiName('');
                    setMonthlyAmount('');
                    setTenure('');
                    setCategory('loan');
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 gap-y-4 mb-6 sm:grid-cols-2 sm:gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    EMI Name *
                  </label>
                  <input
                    type="text"
                    value={emiName}
                    onChange={(e) => setEmiName(e.target.value)}
                    placeholder="e.g., Home Loan"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white transition-colors"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Monthly EMI Amount *
                  </label>
                  <input
                    type="number"
                    value={monthlyAmount}
                    onChange={(e) => setMonthlyAmount(e.target.value)}
                    placeholder="15000"
                    className="w-full pl-4 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white transition-colors"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Tenure (Months) *
                  </label>
                  <input
                    type="number"
                    value={tenure}
                    onChange={(e) => setTenure(e.target.value)}
                    placeholder="24"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white transition-colors"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white transition-colors"
                  >
                    {emiCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {monthlyAmount && tenure && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-base text-gray-600">
                    Total EMI Amount: <span className="font-semibold text-gray-900">
                      {currency}{(parseFloat(monthlyAmount) * parseInt(tenure)).toLocaleString()}
                    </span>
                  </p>
                </div>
              )}

              <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setShowAddEMI(false)}
                  className="w-full py-3 rounded-lg bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddEMI}
                  className="w-full py-3 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                >
                  {editingEMI ? 'Update EMI' : 'Add EMI'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}