import { useState, useMemo, useEffect } from 'react';
import { Subscription } from '../types';
import { 
  RotateCcw, 
  PlusCircle, 
  Calendar, 
  DollarSign,
  Edit2,
  Trash2,
  Play,
  Pause,
  AlertCircle,
  Plus,
  X
} from 'lucide-react';

interface SubscriptionsProps {
  subscriptions: Subscription[];
  onAddSubscription: (subscription: Omit<Subscription, 'id' | 'createdAt'>) => void;
  onUpdateSubscription: (id: string, subscription: Partial<Subscription>) => void;
  onDeleteSubscription: (id: string) => void;
  currency: string;
  darkMode?: boolean;
}

export function Subscriptions({
  subscriptions,
  onAddSubscription,
  onUpdateSubscription,
  onDeleteSubscription,
  currency,
  darkMode = false
}: SubscriptionsProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [category, setCategory] = useState('entertainment');
  const [description, setDescription] = useState('');

  const subscriptionCategories = [
    { id: 'entertainment', name: 'Entertainment', icon: '🎬' },
    { id: 'productivity', name: 'Productivity', icon: '💼' },
    { id: 'education', name: 'Education', icon: '📚' },
    { id: 'health', name: 'Health & Fitness', icon: '💪' },
    { id: 'news', name: 'News & Media', icon: '📰' },
    { id: 'music', name: 'Music', icon: '🎵' },
    { id: 'cloud', name: 'Cloud Storage', icon: '☁️' },
    { id: 'other', name: 'Other', icon: '📋' }
  ];

  const stats = useMemo(() => {
    const activeSubscriptions = subscriptions.filter(s => s.isActive);
    
    const monthlyTotal = activeSubscriptions.reduce((sum, sub) => {
      switch (sub.frequency) {
        case 'monthly': return sum + sub.amount;
        case 'quarterly': return sum + (sub.amount / 3);
        case 'yearly': return sum + (sub.amount / 12);
        default: return sum;
      }
    }, 0);

    const yearlyTotal = monthlyTotal * 12;
    
    const upcomingRenewals = activeSubscriptions
      .filter(sub => {
        const nextBilling = new Date(sub.nextBillingDate);
        const today = new Date();
        const diffDays = Math.ceil((nextBilling.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays <= 7 && diffDays >= 0;
      })
      .sort((a, b) => new Date(a.nextBillingDate).getTime() - new Date(b.nextBillingDate).getTime());

    return {
      activeCount: activeSubscriptions.length,
      monthlyTotal,
      yearlyTotal,
      upcomingRenewals
    };
  }, [subscriptions]);

  const calculateNextBillingDate = (startDate: string, freq: 'monthly' | 'quarterly' | 'yearly'): string => {
    const start = new Date(startDate);
    const today = new Date();
    
    let nextBilling = new Date(start);
    
    while (nextBilling <= today) {
      switch (freq) {
        case 'monthly':
          nextBilling.setMonth(nextBilling.getMonth() + 1);
          break;
        case 'quarterly':
          nextBilling.setMonth(nextBilling.getMonth() + 3);
          break;
        case 'yearly':
          nextBilling.setFullYear(nextBilling.getFullYear() + 1);
          break;
      }
    }
    
    return nextBilling.toISOString().split('T')[0];
  };

  const handleAddSubscription = () => {
    if (!name || !amount) return;

    const startDate = new Date().toISOString().split('T')[0];
    const nextBillingDate = calculateNextBillingDate(startDate, frequency);

    const subscriptionData: Omit<Subscription, 'id' | 'createdAt'> = {
      name: name.trim(),
      amount: parseFloat(amount),
      frequency,
      category,
      startDate,
      nextBillingDate,
      isActive: true,
      autoRenewal: true,
      description: description.trim() || undefined
    };

    if (editingSubscription) {
      onUpdateSubscription(editingSubscription.id, subscriptionData);
    } else {
      onAddSubscription(subscriptionData);
    }

    resetForm();
  };

  const resetForm = () => {
    setShowAddModal(false);
    setEditingSubscription(null);
    setName('');
    setAmount('');
    setFrequency('monthly');
    setCategory('entertainment');
    setDescription('');
  };

  const handleEditSubscription = (subscription: Subscription) => {
    setEditingSubscription(subscription);
    setName(subscription.name);
    setAmount(subscription.amount.toString());
    setFrequency(subscription.frequency);
    setCategory(subscription.category);
    setDescription(subscription.description || '');
    setShowAddModal(true);
  };

  const toggleSubscriptionStatus = (id: string, isActive: boolean) => {
    onUpdateSubscription(id, { isActive: !isActive });
  };

  const getDaysUntilRenewal = (nextBillingDate: string): number => {
    const next = new Date(nextBillingDate);
    const today = new Date();
    return Math.ceil((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const baseClasses = darkMode 
    ? 'bg-gray-900 text-white' 
    : 'bg-gray-50 text-gray-900';

  const cardClasses = darkMode
    ? 'bg-gray-800 border-gray-700'
    : 'bg-white border-gray-200';

  const inputClasses = darkMode
    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-400'
    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500';

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

  return (
    <div className={`min-h-screen ${baseClasses}`}>
      <div className="px-6 pt-8 space-y-6 pb-12">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Subscriptions
            </h1>
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Manage your recurring subscriptions
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg p-3 hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 shadow-lg"
          >
            <PlusCircle size={20} />
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`rounded-2xl border shadow-lg p-4 ${cardClasses}`}>
            <div className="flex items-center space-x-2 mb-2">
              <RotateCcw size={16} className="text-blue-500" />
              <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Active
              </span>
            </div>
            <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {stats.activeCount}
            </p>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              subscriptions
            </p>
          </div>

          <div className={`rounded-2xl border shadow-lg p-4 ${cardClasses}`}>
            <div className="flex items-center space-x-2 mb-2">
              <DollarSign size={16} className="text-green-500" />
              <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Monthly Cost
              </span>
            </div>
            <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {currency}{stats.monthlyTotal.toFixed(0)}
            </p>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {currency}{stats.yearlyTotal.toFixed(0)}/year
            </p>
          </div>
        </div>

        {/* Upcoming Renewals */}
        {stats.upcomingRenewals.length > 0 && (
          <div className={`rounded-2xl border shadow-lg p-6 ${cardClasses}`}>
            <div className="flex items-center space-x-2 mb-4">
              <AlertCircle size={20} className="text-orange-500" />
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Upcoming Renewals
              </h3>
            </div>
            
            <div className="space-y-3">
              {stats.upcomingRenewals.map((subscription) => {
                const daysUntil = getDaysUntilRenewal(subscription.nextBillingDate);
                const categoryInfo = subscriptionCategories.find(cat => cat.id === subscription.category);
                
                return (
                  <div key={subscription.id} className={`p-3 rounded-lg ${
                    darkMode ? 'bg-gray-700' : 'bg-gray-50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{categoryInfo?.icon || '📋'}</span>
                        <div>
                          <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {subscription.name}
                          </p>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {daysUntil === 0 ? 'Renews today' : `Renews in ${daysUntil} days`}
                          </p>
                        </div>
                      </div>
                      <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {currency}{subscription.amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Subscriptions List */}
        <div className={`rounded-2xl border shadow-lg p-6 ${cardClasses}`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            All Subscriptions
          </h3>
          
          {subscriptions.length === 0 ? (
            <div className="text-center py-8">
              <div className={`rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 ${
                darkMode ? 'bg-blue-900/30' : 'bg-blue-50'
              }`}>
                <RotateCcw size={32} className="text-blue-600" />
              </div>
              <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                No Subscriptions
              </h3>
              <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Add your first subscription to start tracking
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg px-6 py-3 hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 font-medium"
              >
                Add Subscription
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {subscriptions.map((subscription) => {
                const categoryInfo = subscriptionCategories.find(cat => cat.id === subscription.category);
                const daysUntil = getDaysUntilRenewal(subscription.nextBillingDate);
                
                return (
                  <div key={subscription.id} className={`p-4 rounded-lg border ${
                    darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{categoryInfo?.icon || '📋'}</span>
                        <div>
                          <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {subscription.name}
                          </h4>
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {categoryInfo?.name} • {subscription.frequency}
                          </p>
                          {subscription.description && (
                            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {subscription.description}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {currency}{subscription.amount.toLocaleString()}
                          </p>
                          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Next: {new Date(subscription.nextBillingDate).toLocaleDateString()}
                          </p>
                        </div>
                        
                        <div className="flex space-x-1">
                          <button
                            onClick={() => toggleSubscriptionStatus(subscription.id, subscription.isActive)}
                            className={`p-1 rounded transition-colors ${
                              subscription.isActive
                                ? darkMode ? 'text-green-400 hover:bg-green-900/20' : 'text-green-600 hover:bg-green-50'
                                : darkMode ? 'text-gray-400 hover:bg-gray-600' : 'text-gray-400 hover:bg-gray-200'
                            }`}
                            title={subscription.isActive ? 'Pause subscription' : 'Resume subscription'}
                          >
                            {subscription.isActive ? <Pause size={14} /> : <Play size={14} />}
                          </button>
                          <button
                            onClick={() => handleEditSubscription(subscription)}
                            className={`p-1 rounded transition-colors ${
                              darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                            }`}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => onDeleteSubscription(subscription.id)}
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
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Subscription Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 rounded-full p-2">
                    <Plus size={20} className="text-green-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {editingSubscription ? 'Edit Subscription' : 'Add Subscription'}
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
              <div className="grid grid-cols-4 gap-4 mb-6">
                {/* Subscription Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Subscription Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Netflix"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white transition-colors"
                    required
                  />
                </div>

                {/* Amount */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Amount *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="199"
                      className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white transition-colors"
                      required
                    />
                  </div>
                </div>

                {/* Billing Frequency */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Billing Frequency *
                  </label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as 'monthly' | 'quarterly' | 'yearly')}
                    className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white transition-colors"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
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
                  >
                    {subscriptionCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Second Row */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                {/* Description */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Additional notes"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white transition-colors"
                  />
                </div>

                {/* Empty spaces for alignment */}
                <div></div>
                <div></div>
                <div></div>
              </div>

              {/* Bottom Row */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div></div>
                <div className="flex space-x-3">
                  <button
                    onClick={resetForm}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddSubscription}
                    disabled={!name || !amount}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {editingSubscription ? 'Update' : 'Add'} Subscription
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}