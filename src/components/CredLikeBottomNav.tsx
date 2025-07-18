import { 
  Home, 
  TrendingUp, 
  Target, 
  CreditCard, 
  FileText, 
  User,
  History,
  BarChart3,
  Plus,
  PiggyBank,
  RotateCcw
} from 'lucide-react';

interface CredLikeBottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onAddExpense: () => void;
}

export function CredLikeBottomNav({ activeTab, onTabChange, onAddExpense }: CredLikeBottomNavProps) {
  const tabs = [
    { id: 'dashboard', icon: Home, label: 'Home' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'subscriptions', icon: RotateCcw, label: 'Subscriptions' },
    { id: 'savings', icon: PiggyBank, label: 'Savings' },
    { id: 'emi', icon: CreditCard, label: 'EMI' },
    { id: 'history', icon: History, label: 'History' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <>
      {/* Floating Add Button */}
      <button
        onClick={onAddExpense}
        className="fixed bottom-28 right-6 z-50 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-full p-4 shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 hover:scale-110 active:scale-95 animate-pulse"
        aria-label="Add expense"
      >
        <Plus size={24} />
      </button>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 border-gray-100 backdrop-blur-xl border-t">
        <div className="max-w-screen-sm mx-auto px-2 py-1">
          <div className="flex justify-around items-center">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`relative flex flex-col items-center space-y-1 px-4 py-3 rounded-2xl transition-all duration-300 ${
                    isActive 
                      ? 'text-emerald-600 bg-emerald-50'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className={`transition-all duration-300 ${
                    isActive ? 'transform scale-110' : ''
                  }`}>
                    <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <span className={`text-xs font-medium transition-all duration-300 ${
                    isActive ? 'opacity-100' : 'opacity-70'
                  }`}>
                    {tab.label}
                  </span>
                  
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-8 h-0.5 rounded-full bg-emerald-500" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}