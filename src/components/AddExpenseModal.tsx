import { useState, useEffect } from 'react';
import { Expense, Category } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { aiService } from '../services/aiService';
import { CategoryIcon } from './CategoryIcon';
import { X, Calendar, IndianRupee, FileText, Tag, RotateCcw, Brain, CheckCircle, Sparkles, Plus } from 'lucide-react';

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

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    
    if (value.trim().length === 0) {
      setCategory('');
      setAiSuggestion(null);
      setShowAiSuggestion(false);
      setAmountSuggestion(null);
      setShowAmountSuggestion(false);
      return;
    }
    
    if (value.trim().length > 2) {
      const prediction = aiService.predictCategory(value, parseFloat(amount) || undefined);
      
      if (prediction.confidence > 0.6) {
        setAiSuggestion(prediction);
        setShowAiSuggestion(true);
        
        if (prediction.confidence > 0.85) {
          setCategory(prediction.category);
        }
      } else {
        setShowAiSuggestion(false);
      }
      
      const amountPrediction = aiService.predictAmount(value);
      if (amountPrediction && amountPrediction.confidence > 0.7 && (!amount || amount === '')) {
        setAmountSuggestion(amountPrediction);
        setShowAmountSuggestion(true);
        
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
      setCategory('');
    } else {
      setCategory(categoryId);
      setShowAiSuggestion(false);
    }
  };

  const acceptAiSuggestion = () => {
    if (aiSuggestion) {
      setCategory(aiSuggestion.category);
      setShowAiSuggestion(false);
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
    if (aiSuggestion) {
      aiService.trackUserInteraction(description, 'category', aiSuggestion.category, false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !description || !category) return;
    
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <form
        onSubmit={handleSubmit}
        className={`bg-white rounded-2xl w-[90vw] max-w-xs max-h-[80vh] h-auto mx-auto p-4 sm:rounded-2xl sm:w-full sm:max-w-md md:max-w-lg lg:max-w-xl sm:p-6 shadow-2xl transition-all duration-200 overflow-y-auto ${darkMode ? 'bg-gray-900 text-white' : ''}`}
        autoComplete="off"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 rounded-full p-2">
                <Plus size={20} className="text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                {editingExpense ? t('edit') : t('addExpenseTitle')}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          {/* Main Form Row */}
          <div className="grid grid-cols-1 gap-y-4 mb-6 sm:grid-cols-2 sm:gap-4">
            {/* Amount */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Amount
              </label>
              <div>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-4 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white transition-colors"
                  required
                  min="0"
                  step="0.01"
                  autoFocus
                />
              </div>
              
              {showAmountSuggestion && amountSuggestion && (
                <div className="p-2 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Sparkles size={12} className="text-green-600" />
                      <span className="text-xs text-green-800">
                        ₹{amountSuggestion.amount}
                      </span>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        type="button"
                        onClick={acceptAmountSuggestion}
                        className="p-1 text-green-600 hover:text-green-700"
                      >
                        <CheckCircle size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={dismissAmountSuggestion}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => handleDescriptionChange(e.target.value)}
                placeholder="e.g., Biryani from Swiggy"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white transition-colors"
                required
              />
              
              {showAiSuggestion && aiSuggestion && (
                <div className="p-2 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Brain size={12} className="text-blue-600" />
                      <span className="text-xs text-blue-800">
                        {t(aiSuggestion.category)}
                      </span>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        type="button"
                        onClick={acceptAiSuggestion}
                        className="p-1 text-green-600 hover:text-green-700"
                      >
                        <CheckCircle size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={dismissAiSuggestion}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white transition-colors"
                required
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {t(cat.id)}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white transition-colors"
                required
              />
            </div>
          </div>

          {/* Bottom Row */}
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-end sm:gap-16 mt-6">
            <div className="flex items-center gap-2 mb-2 sm:mb-0 whitespace-nowrap">
              <input
                type="checkbox"
                id="recurring"
                checked={isRecurring}
                onChange={() => setIsRecurring(!isRecurring)}
                className="form-checkbox h-5 w-5 text-green-600 rounded focus:ring-emerald-500 border-gray-300"
              />
              <span className="flex items-center gap-2 whitespace-nowrap">
                <RotateCcw size={18} className="text-gray-400" />
                <label htmlFor="recurring" className="text-base font-medium text-gray-700 select-none cursor-pointer">
                  Monthly bill
                </label>
              </span>
            </div>
            <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="w-full px-6 py-3 rounded-lg bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-full px-6 py-3 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <Plus size={18} />
                {editingExpense ? 'Update Expense' : 'Add Expense'}
              </button>
            </div>
          </div>
        </form>
      </form>
    </div>
  );
}