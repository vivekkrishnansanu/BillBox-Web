import { Home, Plus, History, Bell, BarChart3, Settings, TrendingUp, CreditCard, Target, FileText } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  const { t } = useTranslation();
  
  const tabs = [
    { id: 'dashboard', icon: Home, label: t('dashboard') },
    { id: 'financial', icon: TrendingUp, label: 'Financial' },
    { id: 'savings', icon: Target, label: 'Savings' },
    { id: 'emi', icon: CreditCard, label: 'EMI' },
    { id: 'report', icon: FileText, label: 'Report' },
    { id: 'history', icon: History, label: t('history') },
    { id: 'settings', icon: Settings, label: t('settings') },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-40">
      <div className="flex justify-around items-center max-w-screen-sm mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors ${
                isActive 
                  ? 'text-green-600 bg-green-50' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon size={20} />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}