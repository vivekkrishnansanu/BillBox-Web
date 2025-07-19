import { useState, useEffect } from 'react';
import { Income } from '../types';
import { DollarSign, Edit2, Save, Calendar, Plus, X, Star } from 'lucide-react';

interface MyIncomeProps {
  income: Income[];
  onAddIncome: (incomeData: Omit<Income, 'id' | 'createdAt'>) => void;
  onUpdateIncome: (id: string, incomeData: Partial<Income>) => void;
  onDeleteIncome: (id: string) => void;
  currency: string;
  resetFlag: boolean;
}

export function MyIncome({ 
  income, 
  onAddIncome, 
  onUpdateIncome, 
  onDeleteIncome, 
  currency, 
  resetFlag 
}: MyIncomeProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [primaryIncome, setPrimaryIncome] = useState('');
  const [extraIncome, setExtraIncome] = useState('');

  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentIncome = income.find(inc => inc.month === currentMonth);

  useEffect(() => {
    if (resetFlag) {
      setIsEditing(false);
      setPrimaryIncome('');
      setExtraIncome('');
    }
  }, [resetFlag]);

  useEffect(() => {
    if (currentIncome) {
      setPrimaryIncome(currentIncome.monthlyIncome.toString());
      setExtraIncome(currentIncome.extraIncome.toString());
    } else {
      setPrimaryIncome('');
      setExtraIncome('');
    }
  }, [currentIncome]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isEditing) {
        handleCancel();
      }
    };

    if (isEditing) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isEditing]);

  const handleSave = () => {
    const primaryValue = parseFloat(primaryIncome) || 0;
    const extraValue = parseFloat(extraIncome) || 0;
    
    if (currentIncome) {
      onUpdateIncome(currentIncome.id, {
        monthlyIncome: primaryValue,
        extraIncome: extraValue,
        month: currentMonth
      });
    } else {
      onAddIncome({
        monthlyIncome: primaryValue,
        extraIncome: extraValue,
        month: currentMonth
      });
    }
    
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (currentIncome) {
      setPrimaryIncome(currentIncome.monthlyIncome.toString());
      setExtraIncome(currentIncome.extraIncome.toString());
    } else {
      setPrimaryIncome('');
      setExtraIncome('');
    }
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const totalIncome = (parseFloat(primaryIncome) || 0) + (parseFloat(extraIncome) || 0);

  return (
    <div className="p-4 sm:p-6 bg-gray-50">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">My Income</h1>
        <p className="text-gray-600 text-sm mt-1">Manage your monthly income sources</p>
      </div>

      {/* Income Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
        {/* Primary Income Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
          <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
            <div className="bg-blue-100 rounded-lg p-1.5 sm:p-2">
              <Calendar size={14} className="sm:w-4 sm:h-4 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-medium text-gray-900">Primary Income</h3>
              <p className="text-xs text-gray-500">Monthly salary</p>
            </div>
          </div>
          <p className="text-lg sm:text-xl font-bold text-gray-900">
            {currency}{currentIncome?.monthlyIncome.toLocaleString() || '0'}
          </p>
        </div>

        {/* Extra Income Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
          <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
            <div className="bg-purple-100 rounded-lg p-1.5 sm:p-2">
              <Plus size={14} className="sm:w-4 sm:h-4 text-purple-600" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-medium text-gray-900">Extra Income</h3>
              <p className="text-xs text-gray-500">Freelance, bonuses</p>
            </div>
          </div>
          <p className="text-lg sm:text-xl font-bold text-gray-900">
            {currency}{currentIncome?.extraIncome.toLocaleString() || '0'}
          </p>
        </div>

        {/* Total Income Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
          <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
            <div className="bg-green-100 rounded-lg p-1.5 sm:p-2">
              <DollarSign size={14} className="sm:w-4 sm:h-4 text-green-600" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-medium text-gray-900">Total Income</h3>
              <p className="text-xs text-gray-500">This month</p>
            </div>
          </div>
          <p className="text-lg sm:text-xl font-bold text-green-600">
            {currency}{currentIncome ? (currentIncome.monthlyIncome + currentIncome.extraIncome).toLocaleString() : '0'}
          </p>
        </div>
      </div>

      {/* Edit Button */}
      <div className="mb-4 sm:mb-6">
        <button
          onClick={handleEdit}
          className="bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
        >
          <Edit2 size={14} className="sm:w-4 sm:h-4" />
          <span>{currentIncome ? 'Edit Income' : 'Set Income'}</span>
        </button>
      </div>

      {/* Info Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
        <div className="flex items-center space-x-2 sm:space-x-3 mb-3">
          <div className="bg-blue-100 rounded-lg p-1.5 sm:p-2">
            <DollarSign size={14} className="sm:w-4 sm:h-4 text-blue-600" />
          </div>
          <h3 className="text-xs sm:text-sm font-semibold text-gray-900">Income Management</h3>
        </div>
        <div className="space-y-1 text-xs text-gray-600">
          <p>• Primary income for your main salary and regular earnings</p>
          <p>• Extra income for freelance work, bonuses, and additional sources</p>
          <p>• Edit anytime to update your current month's income</p>
        </div>
      </div>

      {/* Edit Modal - Correct Structure */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl sm:rounded-2xl w-full max-w-md shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-full p-1.5 sm:p-2">
                    <Star size={18} className="sm:w-5 sm:h-5 text-white" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                    {currentIncome ? 'Edit Income' : 'Add Income'}
                  </h2>
                </div>
                <button
                  onClick={handleCancel}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={18} className="sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>

            {/* Amount Field */}
            <div className="p-4 sm:p-6 pb-4">
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600 text-base sm:text-lg">
                  {currency}
                </span>
                <input
                  type="text"
                  value={totalIncome.toFixed(2)}
                  readOnly
                  className="w-full pl-8 pr-4 py-3 sm:py-4 bg-gray-50 border border-gray-300 rounded-lg text-lg sm:text-xl font-bold text-gray-900"
                  placeholder="0.00"
                />
              </div>
            </div>
            
            {/* Modal Content */}
            <div className="px-4 sm:px-6 space-y-4 sm:space-y-6">
              {/* Primary Income Field */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Primary Income (Monthly Salary)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    {currency}
                  </span>
                  <input
                    type="number"
                    value={primaryIncome}
                    onChange={(e) => setPrimaryIncome(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white transition-colors text-sm sm:text-base"
                    placeholder="50000"
                    autoFocus
                  />
                </div>
              </div>
              
              {/* Extra Income Field */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Extra Income (Freelance, Bonuses, etc.)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    {currency}
                  </span>
                  <input
                    type="number"
                    value={extraIncome}
                    onChange={(e) => setExtraIncome(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white transition-colors text-sm sm:text-base"
                    placeholder="5000"
                  />
                </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="p-4 sm:p-6 border-t border-gray-200 flex space-x-3 mt-4 sm:mt-6">
              <button
                onClick={handleCancel}
                className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 font-medium flex items-center justify-center space-x-2 text-sm sm:text-base"
              >
                <Save size={14} className="sm:w-4 sm:h-4" />
                <span>{currentIncome ? 'Update' : 'Add'} Income</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 