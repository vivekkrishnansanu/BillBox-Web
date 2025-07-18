import { useState, useEffect } from 'react';
import { Expense, Category } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { aiService } from '../services/aiService';
import { CategoryIcon } from './CategoryIcon';
import { X, Calendar, IndianRupee, FileText, Tag, RotateCcw, Brain, CheckCircle, Sparkles } from 'lucide-react';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  categories: Category[];
  editingExpense?: Expense;
  darkMode?: boolean;
  resetFlag?: boolean;
}

export function AddExpenseModal({ 
  isOpen, 
  onClose, 
  onSave, 
  categories,
  editingExpense,
  darkMode = false,
  resetFlag = false
}: AddExpenseModalProps) {
  const { t } = useTranslation();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isRecurring, setIsRecurring] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<any>(null);
  const [showAiSuggestion, setShowAiSuggestion] = useState(false);
  const [amountSuggestion, setAmountSuggestion] = useState<any>(null);
  const [showAmountSuggestion, setShowAmountSuggestion] = useState(false);

  useEffect(() => {
    if (resetFlag) {
      setAmount('0');
      setDescription('');
      setCategory('');
      setDate(new Date().toISOString().split('T')[0]);
      setIsRecurring(false);
      setAiSuggestion(null);
      setShowAiSuggestion(false);
      setAmountSuggestion(null);
      setShowAmountSuggestion(false);
    }
  }, [resetFlag]);

  useEffect(() => {
    if (editingExpense) {
      setAmount(editingExpense.amount.toString());
      setDescription(editingExpense.description);
      setCategory(editingExpense.category);
      setDate(editingExpense.date.split('T')[0]);
      setIsRecurring(editingExpense.isRecurring);
    } else {
      setAmount('');
      setDescription('');
      setCategory('');
      setDate(new Date().toISOString().split('T')[0]);
      setIsRecurring(false);
    }
    setAiSuggestion(null);
    setShowAiSuggestion(false);
    setAmountSuggestion(null);
    setShowAmountSuggestion(false);
  }, [editingExpense, isOpen]);

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    
    // Clear category when description is cleared
    if (value.trim().length === 0) {
      setCategory('');
      setAiSuggestion(null);
      setShowAiSuggestion(false);
      setAmountSuggestion(null);
      setShowAmountSuggestion(false);
      return;
    }
    
    if (value.trim().length > 2) {
      // Generate AI suggestion
      const prediction = aiService.predictCategory(value, parseFloat(amount) || undefined);
      
      if (prediction.confidence > 0.6) {
        setAiSuggestion(prediction);
        setShowAiSuggestion(true);
        
        // Auto-select category if confidence is very high
        if (prediction.confidence > 0.85) {
          setCategory(prediction.category);
        }
      } else {
        setShowAiSuggestion(false);
      }
      
      // Generate amount suggestion
      const amountPrediction = aiService.predictAmount(value);
      if (amountPrediction && amountPrediction.confidence > 0.7 && (!amount || amount === '')) {
        setAmountSuggestion(amountPrediction);
        setShowAmountSuggestion(true);
        
        // Auto-fill if confidence is very high
        if (amountPrediction.confidence > 0.85) {
          setAmount(amountPrediction.amount.toString());
        }
      }
    } else {
      setShowAiSuggestion(false);
      setShowAmountSuggestion(false);
    }
  };

  const handleAmountChange = (value: string) => {
    setAmount(value);
    
    // Re-run AI prediction with amount context
    if (description.trim().length > 2) {
      const prediction = aiService.predictCategory(description, parseFloat(value) || undefined);
      if (prediction.confidence > 0.6) {
        setAiSuggestion(prediction);
        setShowAiSuggestion(true);
      }
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    if (category === categoryId) {
      // Deselect if already selected
      setCategory('');
    } else {
      // Select the category
      setCategory(categoryId);
      setShowAiSuggestion(false); // Hide AI suggestion when user manually selects
    }
  };

  const acceptAiSuggestion = () => {
    if (aiSuggestion) {
      setCategory(aiSuggestion.category);
      setShowAiSuggestion(false);
      
      // Learn from user acceptance
      aiService.learnFromUser(description, aiSuggestion.category, parseFloat(amount) || undefined);
    }
  };

  const acceptAmountSuggestion = () => {
    if (amountSuggestion) {
      setAmount(amountSuggestion.amount.toString());
      setShowAmountSuggestion(false);
    }
  };

  const dismissAmountSuggestion = () => {
    setShowAmountSuggestion(false);
  };

  const dismissAiSuggestion = () => {
    setShowAiSuggestion(false);
    // Track that user dismissed the suggestion
    if (aiSuggestion) {
      aiService.trackUserInteraction(description, 'category', aiSuggestion.category, false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !description || !category) return;
    
    // Learn from user's final choice
    aiService.learnFromUser(description, category, parseFloat(amount));
    
    const expenseData: Omit<Expense, 'id' | 'createdAt'> = {
      amount: parseFloat(amount),
      description: description.trim(),
      category,
      date,
      isRecurring,
      nextDueDate: isRecurring ? new Date(date).toISOString() : undefined,
    };
    
    onSave(expenseData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className={`w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl rounded-3xl border ${
        darkMode 
          ? 'bg-slate-800/95 backdrop-blur-xl border-slate-700' 
          : 'bg-white/95 backdrop-blur-xl border-white/20'
      }`}>
        {/* Header */}
        <div className={`sticky top-0 border-b p-6 ${
          darkMode 
            ? 'bg-slate-800/95 backdrop-blur-xl border-slate-700' 
            : 'bg-white/95 backdrop-blur-xl border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-3 shadow-lg">
                <Sparkles size={24} className="text-white" />
              </div>
              <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {editingExpense ? t('edit') : t('addExpenseTitle')}
              </h2>
            </div>
            <button
              onClick={onClose}
              className={`p-3 rounded-2xl transition-all duration-200 hover:scale-105 ${
                darkMode ? 'hover:bg-slate-700/50' : 'hover:bg-slate-100'
              }`}
            >
              <X size={24} />
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Amount */}
          <div>
            <label className={`block text-sm font-medium mb-3 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              <div className="flex items-center space-x-2">
                <IndianRupee size={16} className="text-emerald-500" />
                <span>{t('amount')}</span>
              </div>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-500 font-semibold text-lg">
                ₹
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="0.00"
                className={`w-full pl-10 pr-4 py-4 border rounded-2xl focus:ring-2 focus:ring-emerald-500 text-lg font-medium transition-all duration-200 ${
                  darkMode
                    ? 'bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-emerald-400'
                    : 'bg-white border-slate-300 text-gray-900 placeholder-slate-500 focus:border-emerald-500'
                }`}
                required
                min="0"
                step="0.01"
              />
            </div>
            
            {/* Amount AI Suggestion */}
            {showAmountSuggestion && amountSuggestion && (
              <div className={`absolute top-full left-0 right-0 mt-2 p-4 rounded-2xl border shadow-xl z-10 backdrop-blur-xl ${
                darkMode 
                  ? 'bg-emerald-900/90 border-emerald-700' 
                  : 'bg-emerald-50/90 border-emerald-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sparkles size={16} className="text-emerald-600" />
                    <span className="text-sm font-medium text-emerald-900 dark:text-emerald-200">
                      Suggested: <strong>₹{amountSuggestion.amount}</strong>
                    </span>
                    <span className="text-xs bg-emerald-100 dark:bg-emerald-800 text-emerald-600 dark:text-emerald-300 px-2 py-1 rounded-full">
                      {Math.round(amountSuggestion.confidence * 100)}%
                    </span>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      type="button"
                      onClick={acceptAmountSuggestion}
                      className="p-1 text-emerald-600 hover:text-emerald-700 transition-colors"
                      title="Use this amount"
                    >
                      <CheckCircle size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={dismissAmountSuggestion}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Dismiss suggestion"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">
                  {amountSuggestion.reasoning}
                </p>
              </div>
            )}
          </div>

          {/* Description with inline AI suggestion */}
          <div>
            <label className={`block text-sm font-medium mb-3 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              <div className="flex items-center space-x-2">
                <FileText size={16} className="text-blue-500" />
                <span>{t('description')}</span>
              </div>
            </label>
            <div className="relative">
              <input
                type="text"
                value={description}
                onChange={(e) => handleDescriptionChange(e.target.value)}
                placeholder="e.g., Biryani from Swiggy"
                className={`w-full px-4 py-4 border rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all duration-200 ${
                  darkMode
                    ? 'bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-emerald-400'
                    : 'bg-white border-slate-300 text-gray-900 placeholder-slate-500 focus:border-emerald-500'
                }`}
                required
              />
              
              {/* Inline AI Suggestion */}
              {showAiSuggestion && aiSuggestion && (
                <div className={`absolute top-full left-0 right-0 mt-2 p-4 rounded-2xl border shadow-xl z-10 backdrop-blur-xl ${
                  darkMode 
                    ? 'bg-indigo-900/90 border-indigo-700' 
                    : 'bg-indigo-50/90 border-indigo-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Brain size={16} className="text-indigo-600" />
                      <span className="text-sm font-medium text-indigo-900 dark:text-indigo-200">
                        AI suggests: <strong>{t(aiSuggestion.category)}</strong>
                      </span>
                      <span className="text-xs bg-indigo-100 dark:bg-indigo-800 text-indigo-600 dark:text-indigo-300 px-2 py-1 rounded-full">
                        {Math.round(aiSuggestion.confidence * 100)}%
                      </span>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        type="button"
                        onClick={acceptAiSuggestion}
                        className="p-1 text-green-600 hover:text-green-700 transition-colors"
                        title="Accept suggestion"
                      >
                        <CheckCircle size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={dismissAiSuggestion}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Dismiss suggestion"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                  {aiSuggestion.reasoning && (
                    <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-1">
                      {aiSuggestion.reasoning}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className={`block text-sm font-medium mb-3 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              <div className="flex items-center space-x-2">
                <Tag size={16} className="text-indigo-500" />
                <span>{t('category')}</span>
              </div>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`flex items-center space-x-3 p-4 rounded-2xl border transition-all duration-200 ${
                    category === cat.id
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 shadow-lg'
                      : aiSuggestion?.category === cat.id && showAiSuggestion
                      ? 'border-indigo-300 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                      : darkMode
                      ? 'border-slate-600 hover:border-slate-500 hover:bg-slate-700/30'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <CategoryIcon icon={cat.icon} color={cat.color} size={16} />
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{t(cat.id)}</span>
                    {aiSuggestion?.category === cat.id && showAiSuggestion && (
                      <Brain size={12} className="text-indigo-500" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div>
            <label className={`block text-sm font-medium mb-3 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              <div className="flex items-center space-x-2">
                <Calendar size={16} className="text-orange-500" />
                <span>{t('date')}</span>
              </div>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={`w-full px-4 py-4 border rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all duration-200 ${
                darkMode
                  ? 'bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-emerald-400'
                  : 'bg-white border-slate-300 text-gray-900 placeholder-slate-500 focus:border-emerald-500'
              }`}
              required
            />
          </div>

          {/* Recurring */}
          <div className={`flex items-center space-x-3 p-4 rounded-2xl border ${
            darkMode ? 'border-slate-600 bg-slate-700/30' : 'border-slate-200 bg-slate-50'
          }`}>
            <input
              type="checkbox"
              id="recurring"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
            />
            <label htmlFor="recurring" className="flex items-center space-x-2 text-sm font-medium">
              <RotateCcw size={16} className="text-blue-500" />
              <span>{t('monthlyBill')}</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex space-x-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 px-6 py-4 rounded-2xl font-medium transition-all duration-200 ${
                darkMode 
                  ? 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
            >
              {t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}