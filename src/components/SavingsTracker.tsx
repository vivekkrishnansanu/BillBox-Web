import { useState, useMemo, useEffect } from 'react';
import { Savings, SavingsOverview } from '../types';
import { 
  Target, 
  PlusCircle, 
  Calendar, 
  TrendingUp,
  DollarSign,
  Edit2,
  Trash2,
  CheckCircle,
  Clock,
  Percent,
  Plus,
  X
} from 'lucide-react';

interface SavingsTrackerProps {
  savings: Savings[];
  onAddSavings: (savings: Omit<Savings, 'id' | 'createdAt'>) => void;
  onUpdateSavings: (id: string, savings: Partial<Savings>) => void;
  onDeleteSavings: (id: string) => void;
  currency: string;
  darkMode?: boolean;
  resetFlag?: boolean;
}

export function SavingsTracker({
  savings,
  onAddSavings,
  onUpdateSavings,
  onDeleteSavings,
  currency,
  darkMode = false,
  resetFlag = false
}: SavingsTrackerProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSavings, setEditingSavings] = useState<Savings | null>(null);
  const [type, setType] = useState<'fd' | 'rd' | 'sip' | 'custom'>('fd');
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [interestRate, setInterestRate] = useState('');
  const [maturityPeriod, setMaturityPeriod] = useState('');
  const [monthlyDeposit, setMonthlyDeposit] = useState('');
  const [tenure, setTenure] = useState('');
  const [fundName, setFundName] = useState('');
  const [monthlyInvestment, setMonthlyInvestment] = useState('');
  const [expectedReturn, setExpectedReturn] = useState('');
  const [duration, setDuration] = useState('');
  const [purpose, setPurpose] = useState('');
  const [frequency, setFrequency] = useState<'one-time' | 'monthly' | 'quarterly' | 'yearly'>('one-time');

  const savingsOverview = useMemo((): SavingsOverview => {
    if (resetFlag) {
      return {
        totalSaved: 0,
        monthlyContribution: 0,
        expectedReturns: 0,
        upcomingMaturity: [],
        savingsByType: {},
        projectedGrowth: []
      };
    }
    const activeSavings = savings.filter(s => s.isActive && !s.isMatured);
    
    const totalSaved = activeSavings.reduce((sum, s) => sum + s.amount, 0);
    
    const monthlyContribution = activeSavings.reduce((sum, s) => {
      if (s.type === 'rd') return sum + (s.monthlyDeposit || 0);
      if (s.type === 'sip') return sum + (s.monthlyInvestment || 0);
      if (s.type === 'custom' && s.frequency === 'monthly') return sum + s.amount;
      return sum;
    }, 0);
    
    const expectedReturns = activeSavings.reduce((sum, s) => {
      if (s.expectedMaturityAmount) return sum + s.expectedMaturityAmount;
      if (s.expectedTotal) return sum + s.expectedTotal;
      if (s.expectedFutureValue) return sum + s.expectedFutureValue;
      return sum + s.amount;
    }, 0);
    
    const upcomingMaturity = activeSavings
      .filter(s => s.maturityDate)
      .sort((a, b) => new Date(a.maturityDate!).getTime() - new Date(b.maturityDate!).getTime())
      .slice(0, 3);
    
    const savingsByType = activeSavings.reduce((acc, s) => {
      acc[s.type] = (acc[s.type] || 0) + s.amount;
      return acc;
    }, {} as Record<string, number>);
    
    // Simple projection for next 12 months
    const projectedGrowth = [];
    for (let i = 1; i <= 12; i++) {
      const monthlyGrowth = monthlyContribution * i;
      const compoundGrowth = totalSaved * Math.pow(1 + 0.08/12, i); // Assuming 8% annual return
      projectedGrowth.push({
        month: new Date(Date.now() + i * 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 7),
        value: compoundGrowth + monthlyGrowth
      });
    }
    
    return {
      totalSaved,
      monthlyContribution,
      expectedReturns,
      upcomingMaturity,
      savingsByType,
      projectedGrowth
    };
  }, [savings, resetFlag]);

  const calculateMaturityAmount = (principal: number, rate: number, time: number): number => {
    return principal * Math.pow(1 + rate/100/12, time);
  };

  const calculateRDMaturity = (monthlyDeposit: number, rate: number, months: number): number => {
    const monthlyRate = rate / 100 / 12;
    return monthlyDeposit * (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate * (1 + monthlyRate);
  };

  const calculateSIPValue = (monthlyInvestment: number, annualReturn: number, months: number): number => {
    const monthlyReturn = annualReturn / 100 / 12;
    return monthlyInvestment * (Math.pow(1 + monthlyReturn, months) - 1) / monthlyReturn * (1 + monthlyReturn);
  };

  const handleAddSavings = () => {
    if (!name || !amount) return;

    let savingsData: Omit<Savings, 'id' | 'createdAt'> = {
      type,
      name: name.trim(),
      amount: parseFloat(amount),
      startDate,
      isActive: true,
      isMatured: false
    };

    // Calculate maturity date and expected amounts based on type
    if (type === 'fd') {
      const months = parseInt(maturityPeriod);
      const rate = parseFloat(interestRate);
      const maturityDate = new Date(startDate);
      maturityDate.setMonth(maturityDate.getMonth() + months);
      
      savingsData = {
        ...savingsData,
        maturityPeriod: months,
        interestRate: rate,
        maturityDate: maturityDate.toISOString().split('T')[0],
        expectedMaturityAmount: calculateMaturityAmount(parseFloat(amount), rate, months)
      };
    } else if (type === 'rd') {
      const months = parseInt(tenure);
      const rate = parseFloat(interestRate);
      const maturityDate = new Date(startDate);
      maturityDate.setMonth(maturityDate.getMonth() + months);
      
      savingsData = {
        ...savingsData,
        monthlyDeposit: parseFloat(monthlyDeposit),
        tenure: months,
        interestRate: rate,
        maturityDate: maturityDate.toISOString().split('T')[0],
        expectedTotal: calculateRDMaturity(parseFloat(monthlyDeposit), rate, months)
      };
    } else if (type === 'sip') {
      const months = parseInt(duration);
      const annualReturn = parseFloat(expectedReturn);
      
      savingsData = {
        ...savingsData,
        fundName: fundName.trim(),
        monthlyInvestment: parseFloat(monthlyInvestment),
        expectedAnnualReturn: annualReturn,
        duration: months,
        expectedFutureValue: calculateSIPValue(parseFloat(monthlyInvestment), annualReturn, months)
      };
    } else if (type === 'custom') {
      savingsData = {
        ...savingsData,
        frequency,
        purpose: purpose.trim() || undefined
      };
    }

    if (editingSavings) {
      onUpdateSavings(editingSavings.id, savingsData);
    } else {
      onAddSavings(savingsData);
    }

    resetForm();
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showAddModal) {
        resetForm();
      }
    };

    if (showAddModal) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showAddModal]);

  const resetForm = () => {
    setShowAddModal(false);
    setEditingSavings(null);
    setType('fd');
    setName('');
    setAmount('');
    setStartDate(new Date().toISOString().split('T')[0]);
    setInterestRate('');
    setMaturityPeriod('');
    setMonthlyDeposit('');
    setTenure('');
    setFundName('');
    setMonthlyInvestment('');
    setExpectedReturn('');
    setDuration('');
    setPurpose('');
    setFrequency('one-time');
  };

  const handleEditSavings = (savingsItem: Savings) => {
    setEditingSavings(savingsItem);
    setType(savingsItem.type);
    setName(savingsItem.name);
    setAmount(savingsItem.amount.toString());
    setStartDate(savingsItem.startDate);
    
    if (savingsItem.type === 'fd') {
      setInterestRate(savingsItem.interestRate?.toString() || '');
      setMaturityPeriod(savingsItem.maturityPeriod?.toString() || '');
    } else if (savingsItem.type === 'rd') {
      setMonthlyDeposit(savingsItem.monthlyDeposit?.toString() || '');
      setTenure(savingsItem.tenure?.toString() || '');
      setInterestRate(savingsItem.interestRate?.toString() || '');
    } else if (savingsItem.type === 'sip') {
      setFundName(savingsItem.fundName || '');
      setMonthlyInvestment(savingsItem.monthlyInvestment?.toString() || '');
      setExpectedReturn(savingsItem.expectedAnnualReturn?.toString() || '');
      setDuration(savingsItem.duration?.toString() || '');
    } else if (savingsItem.type === 'custom') {
      setFrequency(savingsItem.frequency || 'one-time');
      setPurpose(savingsItem.purpose || '');
    }
    
    setShowAddModal(true);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'fd': return '🏦';
      case 'rd': return '💰';
      case 'sip': return '📈';
      case 'custom': return '🎯';
      default: return '💵';
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'fd': return 'Fixed Deposit';
      case 'rd': return 'Recurring Deposit';
      case 'sip': return 'SIP Investment';
      case 'custom': return 'Custom Savings';
      default: return type.toUpperCase();
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
      setShowAddModal(false);
      setEditingSavings(null);
      setType('fd');
      setName('');
      setAmount('');
      setStartDate(new Date().toISOString().split('T')[0]);
      setInterestRate('');
      setMaturityPeriod('');
      setMonthlyDeposit('');
      setTenure('');
      setFundName('');
      setMonthlyInvestment('');
      setExpectedReturn('');
      setDuration('');
      setPurpose('');
      setFrequency('one-time');
    }
  }, [resetFlag]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add your form submission logic here if needed
  };

  return (
    <div className="w-full p-6 space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-xl sm:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Savings & Investments
          </h1>
          <p className={`text-base ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Track your savings goals and investments
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl p-3 hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 shadow-lg"
        >
          <PlusCircle size={20} />
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className={`rounded-xl shadow-lg border p-4 ${cardClasses}`}>
          <div className="flex items-center space-x-2 mb-2">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl p-2 shadow-lg">
              <DollarSign size={16} className="text-white" />
            </div>
            <span className={`text-base font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Total Saved
            </span>
          </div>
          <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {currency}{savingsOverview.totalSaved.toLocaleString()}
          </p>
        </div>

        <div className={`rounded-xl shadow-lg border p-4 ${cardClasses}`}>
          <div className="flex items-center space-x-2 mb-2">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl p-2 shadow-lg">
              <Calendar size={16} className="text-white" />
            </div>
            <span className={`text-base font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Monthly SIP
            </span>
          </div>
          <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {currency}{savingsOverview.monthlyContribution.toLocaleString()}
          </p>
        </div>

        <div className={`rounded-xl shadow-lg border p-4 ${cardClasses}`}>
          <div className="flex items-center space-x-2 mb-2">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-2 shadow-lg">
              <TrendingUp size={16} className="text-white" />
            </div>
            <span className={`text-base font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Expected Returns
            </span>
          </div>
          <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {currency}{savingsOverview.expectedReturns.toLocaleString()}
          </p>
        </div>

        <div className={`rounded-xl shadow-lg border p-4 ${cardClasses}`}>
          <div className="flex items-center space-x-2 mb-2">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-2 shadow-lg">
              <Target size={16} className="text-white" />
            </div>
            <span className={`text-base font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Active Goals
            </span>
          </div>
          <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {savings.filter(s => s.isActive && !s.isMatured).length}
          </p>
        </div>
      </div>

      {/* Upcoming Maturity */}
      {savingsOverview.upcomingMaturity.length > 0 && (
        <div className={`rounded-xl shadow-lg border p-6 ${cardClasses}`}>
          <div className="flex items-center space-x-2 mb-4">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-2 shadow-lg">
              <Clock size={20} className="text-white" />
            </div>
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Upcoming Maturity
            </h3>
          </div>
          
          <div className="space-y-3">
            {savingsOverview.upcomingMaturity.map((savings) => (
              <div key={savings.id} className={`p-3 rounded-lg ${
                darkMode ? 'bg-slate-700/30' : 'bg-slate-50'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getTypeIcon(savings.type)}</span>
                    <div>
                      <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {savings.name}
                      </p>
                      <p className={`text-base ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Matures: {new Date(savings.maturityDate!).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {currency}{(savings.expectedMaturityAmount || savings.expectedTotal || savings.expectedFutureValue || savings.amount).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Savings List */}
      <div className={`rounded-xl shadow-lg border p-6 ${cardClasses}`}>
        <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Your Savings & Investments
        </h3>
        
        {savings.length === 0 ? (
          <div className="text-center py-8">
            <div className={`rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 ${
              darkMode ? 'bg-emerald-900/30' : 'bg-emerald-50'
            }`}>
              <Target size={32} className="text-emerald-600" />
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Start Your Savings Journey
            </h3>
            <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Add your first savings goal or investment
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl px-6 py-3 hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 font-medium shadow-lg"
            >
              Add Savings Goal
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {savings.map((savingsItem) => (
              <div key={savingsItem.id} className={`p-4 rounded-lg border ${
                darkMode ? 'border-slate-600 bg-slate-700/30' : 'border-slate-200 bg-slate-50'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getTypeIcon(savingsItem.type)}</span>
                    <div>
                      <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {savingsItem.name}
                      </h4>
                      <p className={`text-base ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {getTypeName(savingsItem.type)}
                      </p>
                      {savingsItem.purpose && (
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {savingsItem.purpose}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {currency}{savingsItem.amount.toLocaleString()}
                      </p>
                      {savingsItem.maturityDate && (
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Matures: {new Date(savingsItem.maturityDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleEditSavings(savingsItem)}
                        className={`p-1 rounded transition-colors ${
                          darkMode ? 'hover:bg-slate-600' : 'hover:bg-slate-200'
                        }`}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => onDeleteSavings(savingsItem.id)}
                        className={`p-1 rounded transition-colors ${
                          darkMode ? 'hover:bg-red-900/20 text-red-400' : 'hover:bg-red-50 text-red-600'
                        }`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Savings Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <form className="bg-white rounded-2xl w-[90vw] max-w-xs max-h-[80vh] h-auto mx-auto p-4 sm:rounded-2xl sm:w-full sm:max-w-md md:max-w-lg lg:max-w-xl sm:p-6 shadow-2xl overflow-y-auto" autoComplete="off" onSubmit={handleSubmit}>
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 rounded-full p-2">
                    <Plus size={20} className="text-green-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {editingSavings ? 'Edit Savings' : 'Add Savings Goal'}
                  </h2>
                </div>
                <button
                  onClick={resetForm}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {/* Main Form Row */}
              <div className="grid grid-cols-1 gap-y-4 mb-6 sm:grid-cols-2 sm:gap-4">
                <div className="space-y-2">
                  <label className="block text-base font-medium text-gray-700">Savings Type *</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as 'fd' | 'rd' | 'sip' | 'custom')}
                    className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white transition-colors"
                  >
                    <option value="fd">Fixed Deposit (FD)</option>
                    <option value="rd">Recurring Deposit (RD)</option>
                    <option value="sip">SIP Investment</option>
                    <option value="custom">Custom Savings</option>
                  </select>
                </div>
                {type === 'custom' ? (
                  <>
                    <div className="space-y-2">
                      <label className="block text-base font-medium text-gray-700">Name *</label>
                      <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="e.g., Emergency Fund"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white transition-colors"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-base font-medium text-gray-700">Amount *</label>
                      <input
                        type="number"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        placeholder="10000"
                        className="w-full pl-4 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white transition-colors"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-base font-medium text-gray-700">Purpose</label>
                      <input
                        type="text"
                        value={purpose}
                        onChange={e => setPurpose(e.target.value)}
                        placeholder="e.g., Emergency Fund"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-base font-medium text-gray-700">Date *</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white transition-colors"
                        required
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <label className="block text-base font-medium text-gray-700">Name *</label>
                      <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="e.g., Emergency Fund"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white transition-colors"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-base font-medium text-gray-700">Amount *</label>
                      <input
                        type="number"
                        value={type === 'fd' ? amount : type === 'rd' ? monthlyDeposit : monthlyInvestment}
                        onChange={(e) => {
                          if (type === 'fd') setAmount(e.target.value);
                          else if (type === 'rd') setMonthlyDeposit(e.target.value);
                          else setMonthlyInvestment(e.target.value);
                        }}
                        placeholder={type === 'fd' ? '100000' : type === 'rd' ? '5000' : '10000'}
                        className="w-full pl-4 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white transition-colors"
                        required
                      />
                    </div>
                    {/* Interest Rate, Period, Tenure, Duration, etc. fields as before */}
                    {type === 'fd' ? (
                      <>
                        <div className="space-y-2">
                          <label className="block text-base font-medium text-gray-700">Interest Rate (%) *</label>
                          <input
                            type="number"
                            value={interestRate}
                            onChange={(e) => setInterestRate(e.target.value)}
                            placeholder="6.5"
                            step="0.1"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white transition-colors"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-base font-medium text-gray-700">Maturity Period (Months) *</label>
                          <input
                            type="number"
                            value={maturityPeriod}
                            onChange={(e) => setMaturityPeriod(e.target.value)}
                            placeholder="12"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white transition-colors"
                            required
                          />
                        </div>
                      </>
                    ) : type === 'rd' ? (
                      <>
                        <div className="space-y-2">
                          <label className="block text-base font-medium text-gray-700">Interest Rate (%) *</label>
                          <input
                            type="number"
                            value={interestRate}
                            onChange={(e) => setInterestRate(e.target.value)}
                            placeholder="6.5"
                            step="0.1"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white transition-colors"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-base font-medium text-gray-700">Tenure (Months) *</label>
                          <input
                            type="number"
                            value={tenure}
                            onChange={(e) => setTenure(e.target.value)}
                            placeholder="24"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white transition-colors"
                            required
                          />
                        </div>
                      </>
                    ) : type === 'sip' ? (
                      <>
                        <div className="space-y-2">
                          <label className="block text-base font-medium text-gray-700">Interest Rate (%) *</label>
                          <input
                            type="number"
                            value={interestRate}
                            onChange={(e) => setInterestRate(e.target.value)}
                            placeholder="6.5"
                            step="0.1"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white transition-colors"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-base font-medium text-gray-700">Duration (Months) *</label>
                          <input
                            type="number"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            placeholder="60"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white transition-colors"
                            required
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Purpose Field */}
                        <div className="space-y-2">
                          <label className="block text-base font-medium text-gray-700">Purpose</label>
                          <input
                            type="text"
                            value={purpose}
                            onChange={e => setPurpose(e.target.value)}
                            placeholder="e.g., Emergency Fund"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white transition-colors"
                          />
                        </div>
                        {/* Start Date Field */}
                        <div className="space-y-2">
                          <label className="block text-base font-medium text-gray-700">Start Date *</label>
                          <input
                            type="date"
                            value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white transition-colors"
                            required
                          />
                        </div>
                      </>
                    )}
                    {/* Row 3: Purpose & Start Date */}
                    <div className="space-y-2">
                      <label className="block text-base font-medium text-gray-700">
                        {type === 'sip' ? 'Fund Name *' : 'Purpose'}
                      </label>
                      <input
                        type="text"
                        value={type === 'sip' ? fundName : purpose}
                        onChange={(e) => {
                          if (type === 'sip') setFundName(e.target.value);
                          else setPurpose(e.target.value);
                        }}
                        placeholder={type === 'sip' ? 'e.g., HDFC Top 100 Fund' : 'e.g., Emergency Fund'}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white transition-colors"
                        required={type === 'sip'}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-base font-medium text-gray-700">Start Date *</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white transition-colors"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-base font-medium text-gray-700">End Date *</label>
                      <input
                        type="date"
                        value={type === 'fd' ? (maturityPeriod ? (() => { const d = new Date(startDate); d.setMonth(d.getMonth() + parseInt(maturityPeriod)); return d.toISOString().split('T')[0]; })() : '') : type === 'rd' ? (tenure ? (() => { const d = new Date(startDate); d.setMonth(d.getMonth() + parseInt(tenure)); return d.toISOString().split('T')[0]; })() : '') : type === 'sip' ? (duration ? (() => { const d = new Date(startDate); d.setMonth(d.getMonth() + parseInt(duration)); return d.toISOString().split('T')[0]; })() : '') : ''}
                        readOnly
                        className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white transition-colors text-gray-500"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Monthly Checkbox at the bottom for all types */}
              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mt-8 mb-2 w-full">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <input
                    id="monthly-checkbox"
                    type="checkbox"
                    checked={frequency === 'monthly'}
                    onChange={e => setFrequency(e.target.checked ? 'monthly' : 'one-time')}
                    className="form-checkbox h-5 w-5 text-emerald-600 border-gray-300 rounded align-middle"
                  />
                  <label htmlFor="monthly-checkbox" className="text-sm font-medium text-gray-700 select-none align-middle">
                    Monthly
                  </label>
                </div>
                <button
                  type="button"
                  onClick={resetForm}
                  className="w-full sm:w-auto py-3 rounded-lg bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition-colors px-4 sm:px-8"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddSavings}
                  className="w-full sm:w-auto py-3 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 px-4 sm:px-8"
                >
                  {editingSavings ? 'Update Savings' : 'Add Savings Goal'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}