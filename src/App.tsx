import { useState, useEffect } from 'react';
import { Expense, Category, Settings as SettingsType, Income, EMI, Savings, Subscription } from './types';
import type { UserProfile as UserProfileType } from './types';
import { useLocalStorage } from './hooks/useLocalStorage'; 
import { authService } from './services/authService';
import { aiService } from './services/aiService';
import { reminderService } from './services/reminderService';
import { DEFAULT_CATEGORIES } from './constants/categories';
import { addMonths } from './utils/dateUtils';
import { LoginScreen } from './components/LoginScreen';
import { WebLayout } from './components/WebLayout';
import { WebDashboard } from './components/WebDashboard';
import { UserProfile } from './components/UserProfile';
import { AddExpenseModal } from './components/AddExpenseModal';
import { Analytics } from './components/Analytics';
import { FinancialPlanning } from './components/FinancialPlanning';
import { EMIManager } from './components/EMIManager';
import { SavingsTracker } from './components/SavingsTracker';
import { Subscriptions } from './components/Subscriptions';
import { FinancialReport } from './components/FinancialReport';
import { History } from './components/History';
import { Settings } from './components/Settings';
import { TransactionCard } from './components/TransactionCard';
import { MyIncome } from './components/MyIncome';
import { supabase } from './lib/supabase';
import type { User } from '@supabase/supabase-js';

function App() {
  const [user, setUser] = useState<UserProfileType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard'); 
  const [expenses, setExpenses] = useLocalStorage<Expense[]>('expenses', []);
  const [income, setIncome] = useLocalStorage<Income[]>('income', []);
  const [emis, setEmis] = useLocalStorage<EMI[]>('emis', []);
  const [savings, setSavings] = useLocalStorage<Savings[]>('savings', []);
  const [subscriptions, setSubscriptions] = useLocalStorage<Subscription[]>('subscriptions', []);
  const [categories, setCategories] = useLocalStorage<Category[]>('categories', DEFAULT_CATEGORIES);
  const [settings, setSettings] = useLocalStorage<SettingsType>('settings', {
    language: 'en',
    currency: 'INR',
    reminderDays: 3,
    reminderTypes: ['in-app'],
    pinEnabled: false,
    aiEnabled: true,
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddIncomeModalOpen, setIsAddIncomeModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>();
  const [resetFlag, setResetFlag] = useState(false);

  // Handle custom events for navigation
  useEffect(() => {
    const handleOpenAddExpense = () => setIsAddModalOpen(true);
    const handleNavigateToFinancial = () => setActiveTab('financial');
    
    window.addEventListener('openAddExpense', handleOpenAddExpense);
    window.addEventListener('navigateToFinancial', handleNavigateToFinancial);
    
    return () => {
      window.removeEventListener('openAddExpense', handleOpenAddExpense);
      window.removeEventListener('navigateToFinancial', handleNavigateToFinancial);
    };
  }, []);

  // Helper to map Supabase User to UserProfile
  function mapSupabaseUserToUserProfile(user: User | undefined | null): UserProfileType | null {
    if (!user) return null;
    return {
      uid: user.id,
      email: user.email || '',
      displayName: user.user_metadata?.full_name || user.email || '',
      photoURL: user.user_metadata?.avatar_url || '',
      preferences: {
        currency: 'INR',
        language: 'en',
        reminderDays: 3,
        reminderTypes: ['in-app'],
        categories: [],
      },
      createdAt: user.created_at || new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };
  }

  // Replace custom authService.onAuthStateChange with official Supabase logic
  useEffect(() => {
    // Get the current session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(mapSupabaseUserToUserProfile(session?.user ?? null));
      setIsLoading(false);
    });

    // Listen for changes to the auth state
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(mapSupabaseUserToUserProfile(session?.user ?? null));
      setIsLoading(false);
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  // Initialize AI service
  useEffect(() => {
    if (settings.aiEnabled) {
      aiService.loadUserLearningData();
    }
  }, [settings.aiEnabled]);

  // Process reminders
  useEffect(() => {
    if (user && expenses.length > 0) {
      reminderService.processReminders(expenses, settings);
    }
  }, [user, expenses, settings]);

  // Update recurring bills' next due dates
  useEffect(() => {
    const updateRecurringBills = () => {
      const now = new Date();
      const updatedExpenses = expenses.map(expense => {
        if (expense.isRecurring && expense.nextDueDate) {
          const nextDue = new Date(expense.nextDueDate);
          if (nextDue <= now) {
            // Move to next month
            const newNextDue = addMonths(nextDue, 1);
            return { ...expense, nextDueDate: newNextDue.toISOString() };
          }
        }
        return expense;
      });
      
      if (JSON.stringify(updatedExpenses) !== JSON.stringify(expenses)) {
        setExpenses(updatedExpenses);
      }
    };

    updateRecurringBills();
    const interval = setInterval(updateRecurringBills, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [expenses, setExpenses]);

  // Fetch all user data from Supabase on login
  useEffect(() => {
    if (user) {
      (async () => {
        const [expensesRes, incomeRes, emisRes, savingsRes, subscriptionsRes] = await Promise.all([
          supabase.from('expenses').select('*').eq('user_id', user.uid).order('createdAt', { ascending: false }),
          supabase.from('income').select('*').eq('user_id', user.uid).order('createdAt', { ascending: false }),
          supabase.from('emis').select('*').eq('user_id', user.uid).order('createdAt', { ascending: false }),
          supabase.from('savings').select('*').eq('user_id', user.uid).order('createdAt', { ascending: false }),
          supabase.from('subscriptions').select('*').eq('user_id', user.uid).order('createdAt', { ascending: false }),
        ]);
        if (!expensesRes.error && expensesRes.data) setExpenses(expensesRes.data);
        if (!incomeRes.error && incomeRes.data) setIncome(incomeRes.data);
        if (!emisRes.error && emisRes.data) setEmis(emisRes.data);
        if (!savingsRes.error && savingsRes.data) setSavings(savingsRes.data);
        if (!subscriptionsRes.error && subscriptionsRes.data) setSubscriptions(subscriptionsRes.data);
      })();
    }
  }, [user]);

  // Update handleSaveExpense to persist to Supabase
  const handleSaveExpense = async (expenseData: Omit<Expense, 'id' | 'createdAt'>) => {
    if (!user) return;
    if (editingExpense) {
      // Update existing expense in Supabase
      const updatedExpense = { ...editingExpense, ...expenseData };
      await supabase
        .from('expenses')
        .update(updatedExpense)
        .eq('id', editingExpense.id)
        .eq('user_id', user.uid);
      setExpenses(expenses.map(expense =>
        expense.id === editingExpense.id ? updatedExpense : expense
      ));
      setEditingExpense(undefined);
    } else {
      // Add new expense to Supabase
      const newExpense: Expense = {
        id: Date.now().toString(),
        ...expenseData,
        createdAt: new Date().toISOString(),
        user_id: user.uid,
      };
      await supabase.from('expenses').insert([newExpense]);
      setExpenses([newExpense, ...expenses]);
    }
  };

  // Update handleDeleteExpense to persist to Supabase
  const handleDeleteExpense = async (id: string) => {
    if (!user) return;
    if (confirm('Are you sure you want to delete this expense?')) {
      await supabase.from('expenses').delete().eq('id', id).eq('user_id', user.uid);
      setExpenses(expenses.filter(expense => expense.id !== id));
    }
  };

  const handleMarkPaid = (id: string) => {
    const updatedExpenses = expenses.map(expense => {
      if (expense.id === id && expense.isRecurring) {
        const nextDue = expense.nextDueDate ? addMonths(new Date(expense.nextDueDate), 1) : new Date();
        return { ...expense, nextDueDate: nextDue.toISOString() };
      }
      return expense;
    });
    setExpenses(updatedExpenses);
  };

  // Update add/update/delete for income
  const handleAddIncome = async (incomeData: Omit<Income, 'id' | 'createdAt'>) => {
    if (!user) return;
    const newIncome: Income = {
      id: Date.now().toString(),
      ...incomeData,
      createdAt: new Date().toISOString(),
      user_id: user.uid,
    };
    await supabase.from('income').insert([newIncome]);
    setIncome([newIncome, ...income]);
  };
  const handleUpdateIncome = async (id: string, incomeData: Partial<Income>) => {
    if (!user) return;
    await supabase.from('income').update(incomeData).eq('id', id).eq('user_id', user.uid);
    setIncome(income.map(inc => inc.id === id ? { ...inc, ...incomeData } : inc));
  };
  const handleDeleteIncome = async (id: string) => {
    if (!user) return;
    if (confirm('Are you sure you want to delete this income entry?')) {
      await supabase.from('income').delete().eq('id', id).eq('user_id', user.uid);
      setIncome(income.filter(inc => inc.id !== id));
    }
  };

  const addMonthsToDate = (dateStr: string, months: number): string => {
    const date = new Date(dateStr + '-01');
    date.setMonth(date.getMonth() + months);
    return date.toISOString().slice(0, 7);
  };

  // Update add/update/delete for emis
  const handleAddEMI = async (emiData: Omit<EMI, 'id' | 'createdAt' | 'totalAmount' | 'endMonth'>) => {
    if (!user) return;
    const totalAmount = emiData.monthlyAmount * emiData.tenure;
    const endMonth = addMonthsToDate(emiData.startMonth, emiData.tenure - 1);
    const newEMI: EMI = {
      id: Date.now().toString(),
      ...emiData,
      totalAmount,
      endMonth,
      createdAt: new Date().toISOString(),
      user_id: user.uid,
    };
    await supabase.from('emis').insert([newEMI]);
    setEmis([newEMI, ...emis]);
  };
  const handleUpdateEMI = async (id: string, emiData: Partial<EMI>) => {
    if (!user) return;
    await supabase.from('emis').update(emiData).eq('id', id).eq('user_id', user.uid);
    setEmis(emis.map(emi => emi.id === id ? { ...emi, ...emiData } : emi));
  };
  const handleDeleteEMI = async (id: string) => {
    if (!user) return;
    if (confirm('Are you sure you want to delete this EMI?')) {
      await supabase.from('emis').delete().eq('id', id).eq('user_id', user.uid);
      setEmis(emis.filter(emi => emi.id !== id));
    }
  };

  // Update add/update/delete for savings
  const handleAddSavings = async (savingsData: Omit<Savings, 'id' | 'createdAt'>) => {
    if (!user) return;
    const newSavings: Savings = {
      id: Date.now().toString(),
      ...savingsData,
      createdAt: new Date().toISOString(),
      user_id: user.uid,
    };
    await supabase.from('savings').insert([newSavings]);
    setSavings([newSavings, ...savings]);
  };
  const handleUpdateSavings = async (id: string, savingsData: Partial<Savings>) => {
    if (!user) return;
    await supabase.from('savings').update(savingsData).eq('id', id).eq('user_id', user.uid);
    setSavings(savings.map(saving => saving.id === id ? { ...saving, ...savingsData } : saving));
  };
  const handleDeleteSavings = async (id: string) => {
    if (!user) return;
    if (confirm('Are you sure you want to delete this savings entry?')) {
      await supabase.from('savings').delete().eq('id', id).eq('user_id', user.uid);
      setSavings(savings.filter(saving => saving.id !== id));
    }
  };

  // Update add/update/delete for subscriptions
  const handleAddSubscription = async (subscriptionData: Omit<Subscription, 'id' | 'createdAt'>) => {
    if (!user) return;
    const newSubscription: Subscription = {
      id: Date.now().toString(),
      ...subscriptionData,
      createdAt: new Date().toISOString(),
      user_id: user.uid,
    };
    await supabase.from('subscriptions').insert([newSubscription]);
    setSubscriptions([newSubscription, ...subscriptions]);
  };
  const handleUpdateSubscription = async (id: string, subscriptionData: Partial<Subscription>) => {
    if (!user) return;
    await supabase.from('subscriptions').update(subscriptionData).eq('id', id).eq('user_id', user.uid);
    setSubscriptions(subscriptions.map(sub => sub.id === id ? { ...sub, ...subscriptionData } : sub));
  };
  const handleDeleteSubscription = async (id: string) => {
    if (!user) return;
    if (confirm('Are you sure you want to delete this subscription?')) {
      await supabase.from('subscriptions').delete().eq('id', id).eq('user_id', user.uid);
      setSubscriptions(subscriptions.filter(sub => sub.id !== id));
    }
  };

  const handleUpdateSettings = (newSettings: Partial<SettingsType>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    
    // Save to user profile if logged in
    if (user) {
      const updatedProfile = {
        ...user,
        preferences: { ...user.preferences, ...newSettings }
      };
      authService.saveUserProfile(updatedProfile);
      setUser(updatedProfile);
    }
  };

  const handleLogin = (userProfile: UserProfileType) => {
    console.log('🔄 App: Handling login for:', userProfile.displayName);
    const createdAt = new Date(userProfile.createdAt).getTime();
    const lastLogin = new Date(userProfile.lastLogin).getTime();
    const isNewUser = Math.abs(lastLogin - createdAt) < 5000; // 5 seconds threshold

    if (isNewUser) {
      console.log('🆕 New user detected. Resetting all data to fresh start.');
      setExpenses([]);
      setIncome([]);
      setEmis([]);
      setSavings([]);
      setSubscriptions([]);
      setCategories(DEFAULT_CATEGORIES);
      setSettings({
        language: 'en',
        currency: 'INR',
        reminderDays: 3,
        reminderTypes: ['in-app'],
        pinEnabled: false,
        aiEnabled: true,
      });
      setResetFlag(true);
    } else {
      console.log('👤 Existing user detected. Loading previous data.');
      setResetFlag(false);
    }
    setUser(userProfile);
    setSettings(prev => ({ ...prev, ...userProfile.preferences }));
    console.log('✅ App: Login handling completed');
  };

  const handleSignOut = () => {
    authService.signOut();
    setUser(null);
    setActiveTab('dashboard');
  };

  const handleResetAllData = async () => {
    if (confirm('🔄 This will reset all demo data and create a fresh new account. Continue?')) {
      console.log('🔄 App: Manual reset initiated...');
      await authService.resetAllUserData();
      // CRITICAL: Reset ALL state and storage immediately
      console.log('🔄 App: Resetting all state, storage, and indexedDB manually...');
      setExpenses([]);
      setIncome([]);
      setEmis([]);
      setSavings([]);
      setSubscriptions([]);
      setCategories(DEFAULT_CATEGORIES);
      setSettings({
        language: 'en',
        currency: 'INR',
        reminderDays: 3,
        reminderTypes: ['in-app'],
        pinEnabled: false,
        aiEnabled: true,
      });
      setResetFlag(true);
      setActiveTab('dashboard');
      setIsAddModalOpen(true);
      setIsAddIncomeModalOpen(true);
      // Forcefully clear all localStorage and sessionStorage
      localStorage.clear();
      sessionStorage.clear();
      // Clear all IndexedDB databases, then reload
      if (window.indexedDB && indexedDB.databases) {
        indexedDB.databases().then((dbs) => {
          if (dbs && dbs.length > 0) {
            Promise.all(dbs
              .filter(db => typeof db.name === 'string')
              .map(db => indexedDB.deleteDatabase(db.name!))
            );
          }
        }).finally(() => {
          window.location.replace(window.location.origin);
        });
      } else {
        window.location.replace(window.location.origin);
      }
    }
  };

  const currencySymbol = '₹'; // Fixed to Indian Rupee only

  useEffect(() => {
    if (categories.length === 0) {
      setCategories(DEFAULT_CATEGORIES);
    }
  }, [categories, setCategories]);

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setIsAddModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }
  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <WebDashboard
            expenses={expenses}
            categories={categories}
            income={income}
            emis={emis}
            savings={savings}
            subscriptions={subscriptions}
            currency={currencySymbol}
            resetFlag={resetFlag}
          />
        );
      case 'analytics':
        return (
          <Analytics
            expenses={expenses}
            categories={categories}
            income={income}
            emis={emis}
            savings={savings}
            currency={currencySymbol}
            resetFlag={resetFlag}
          />
        );
      case 'profile':
        return (
          <UserProfile
            user={user}
            onSignOut={handleSignOut}
          />
        );
      case 'history':
        return (
          <History
            expenses={expenses}
            categories={categories}
            onEditExpense={handleEditExpense}
            onDeleteExpense={handleDeleteExpense}
            currency={currencySymbol}
          />
        );
      case 'financial':
        return (
          <FinancialPlanning
            income={income}
            expenses={expenses}
            emis={emis}
            savings={savings}
            onAddIncome={handleAddIncome}
            onUpdateIncome={handleUpdateIncome}
            onDeleteIncome={handleDeleteIncome}
            currency={currencySymbol}
            resetFlag={resetFlag}
            isAddIncomeModalOpen={isAddIncomeModalOpen}
            setIsAddIncomeModalOpen={setIsAddIncomeModalOpen}
          />
        );
      case 'savings':
        return (
          <SavingsTracker
            savings={savings}
            onAddSavings={handleAddSavings}
            onUpdateSavings={handleUpdateSavings}
            onDeleteSavings={handleDeleteSavings}
            currency={currencySymbol}
            resetFlag={resetFlag}
          />
        );
      case 'subscriptions':
        return (
          <Subscriptions
            subscriptions={subscriptions}
            onAddSubscription={handleAddSubscription}
            onUpdateSubscription={handleUpdateSubscription}
            onDeleteSubscription={handleDeleteSubscription}
            currency={currencySymbol}
          />
        );
      case 'emi':
        return (
          <EMIManager
            emis={emis}
            income={income}
            expenses={expenses}
            onAddEMI={handleAddEMI}
            onUpdateEMI={handleUpdateEMI}
            onDeleteEMI={handleDeleteEMI}
            currency={currencySymbol}
            resetFlag={resetFlag}
          />
        );
      case 'report':
        return (
          <FinancialReport
            income={income}
            expenses={expenses}
            emis={emis}
            savings={savings}
            currency={currencySymbol}
          />
        );
      case 'settings':
        return (
          <Settings
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            userProfile={user}
            onSignOut={handleSignOut}
            onResetData={handleResetAllData}
          />
        );
      case 'income':
        return (
          <MyIncome
            income={income}
            onAddIncome={handleAddIncome}
            onUpdateIncome={handleUpdateIncome}
            onDeleteIncome={handleDeleteIncome}
            currency={currencySymbol}
            resetFlag={resetFlag}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <WebLayout
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onAddExpense={() => setIsAddModalOpen(true)}
        user={user}
        income={income}
        onUpdateIncome={handleUpdateIncome}
        currency={currencySymbol}
      >
        {renderActiveTab()}
        <AddExpenseModal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingExpense(undefined);
          }}
          categories={categories}
          onSave={handleSaveExpense}
          editingExpense={editingExpense}
          resetFlag={resetFlag}
        />
      </WebLayout>
    </div>
  );
}

export default App;