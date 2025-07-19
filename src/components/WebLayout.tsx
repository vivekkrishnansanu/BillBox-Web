import { useState, useRef, useEffect } from 'react';
import { 
  Home, 
  BarChart3, 
  PiggyBank, 
  CreditCard, 
  History, 
  User, 
  Plus,
  Menu,
  X,
  Settings,
  FileText,
  RotateCcw,
  Bell,
  Search,
  Folder,
  Layers,
  ListChecks,
  DollarSign,
  MessageCircle
} from 'lucide-react';
import { Income } from '../types';

interface WebLayoutProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onAddExpense: () => void;
  children: React.ReactNode;
  user?: any;
  income?: Income[];
  onUpdateIncome?: (id: string, incomeData: Partial<Income>) => void;
  currency?: string;
}

export function WebLayout({ 
  activeTab, 
  onTabChange, 
  onAddExpense, 
  children, 
  user, 
  income = [],
  onUpdateIncome,
  currency = '₹'
}: WebLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [showPlansMenu, setShowPlansMenu] = useState(false);
  const [showRecordsMenu, setShowRecordsMenu] = useState(false);
  const plansBtnRef = useRef<HTMLButtonElement>(null);
  const recordsBtnRef = useRef<HTMLButtonElement>(null);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 640px)').matches);

  const navigationItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard', color: 'text-blue-600' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics', color: 'text-purple-600' },
    { id: 'subscriptions', icon: RotateCcw, label: 'Subscriptions', color: 'text-orange-600' },
    { id: 'savings', icon: PiggyBank, label: 'Savings', color: 'text-green-600' },
    { id: 'emi', icon: CreditCard, label: 'EMI Manager', color: 'text-red-600' },
    { id: 'income', icon: DollarSign, label: 'My Income', color: 'text-emerald-600' },
    { id: 'history', icon: History, label: 'Transaction History', color: 'text-indigo-600' },
    { id: 'report', icon: FileText, label: 'Reports', color: 'text-teal-600' },
  ];

  const bottomItems = [
    { id: 'settings', icon: Settings, label: 'Settings', color: 'text-gray-600' },
    { id: 'profile', icon: User, label: 'Profile', color: 'text-gray-600' },
  ];

  // Close popovers on outside click or Escape
  useEffect(() => {
    function handle(e: MouseEvent | KeyboardEvent) {
      if (e instanceof KeyboardEvent && e.key === 'Escape') {
        setShowPlansMenu(false);
        setShowRecordsMenu(false);
      } else if (e instanceof MouseEvent) {
        if (
          plansBtnRef.current && !plansBtnRef.current.contains(e.target as Node) &&
          recordsBtnRef.current && !recordsBtnRef.current.contains(e.target as Node)
        ) {
          setShowPlansMenu(false);
          setShowRecordsMenu(false);
        }
      }
    }
    document.addEventListener('mousedown', handle);
    document.addEventListener('keydown', handle);
    return () => {
      document.removeEventListener('mousedown', handle);
      document.removeEventListener('keydown', handle);
    };
  }, []);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.matchMedia('(max-width: 640px)').matches);
    }
    window.addEventListener('resize', handleResize);
    // In case of orientation change or first mount
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex bg-gray-50">
      {/* Sidebar (desktop only) */}
      <aside className={`hidden md:flex flex-col bg-white border-r border-gray-200 h-screen fixed top-0 left-0 z-40 transition-all duration-200 ${sidebarCollapsed ? 'w-20' : 'w-72'} ${isMobile ? 'hidden' : ''}`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl p-2 shadow-lg">
                  <Home size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">BillBox</h1>
                  <p className="text-xs text-gray-500">Smart Financial Tracker</p>
                </div>
              </div>
            )}
            {/* Show menu button only when collapsed, close button only when expanded */}
            {sidebarCollapsed ? (
              <button
                onClick={() => setSidebarCollapsed(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors border-2 border-blue-500"
                aria-label="Expand sidebar"
              >
                <Menu size={28} />
              </button>
            ) : (
              <button
                onClick={() => setSidebarCollapsed(true)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Collapse sidebar"
              >
                <X size={24} />
              </button>
            )}
          </div>
        </div>

        {/* User Info */}
        {user && !sidebarCollapsed && (
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <User size={20} className="text-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user.displayName}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <div key={item.id} className="relative group w-full">
                <button
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
                    isActive 
                      ? 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 shadow-md border border-emerald-200' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon size={22} className={isActive ? 'text-emerald-600' : item.color} />
                  {!sidebarCollapsed && (
                    <span className="font-medium">{item.label}</span>
                  )}
                  {isActive && !sidebarCollapsed && (
                    <div className="ml-auto w-2 h-2 bg-emerald-500 rounded-full"></div>
                  )}
                </button>
                {/* Custom tooltip for collapsed sidebar */}
                {sidebarCollapsed && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200">
                    <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg whitespace-nowrap">
                      {item.label}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Bottom Navigation */}
        <div className={`p-4 border-t border-gray-100 space-y-2 flex flex-col`}>
          {bottomItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <div key={item.id} className="relative group w-full">
                <button
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                    isActive 
                      ? 'bg-gray-100 text-gray-900' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon size={22} />
                  {!sidebarCollapsed && (
                    <span className="font-medium">{item.label}</span>
                  )}
                </button>
                {/* Custom tooltip for collapsed sidebar */}
                {sidebarCollapsed && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200">
                    <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg whitespace-nowrap">
                      {item.label}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </aside>
      {/* Main Content */}
      <div className={`flex-1 ml-0 md:ml-${sidebarCollapsed ? '20' : '72'}`}>
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 shadow-sm flex-shrink-0 fixed top-0 left-0 w-full z-50" style={{ paddingTop: '18.5px', paddingBottom: '18.5px' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 capitalize">
                {activeTab === 'dashboard' ? 'Dashboard' : 
                 activeTab === 'analytics' ? 'Analytics' :
                 activeTab === 'subscriptions' ? 'Subscriptions' :
                 activeTab === 'savings' ? 'Savings & Investments' :
                 activeTab === 'emi' ? 'EMI Manager' :
                 activeTab === 'income' ? 'My Income' :
                 activeTab === 'history' ? 'Transaction History' :
                 activeTab === 'report' ? 'Financial Reports' :
                 activeTab === 'settings' ? 'Settings' :
                 activeTab === 'profile' ? 'Profile' : activeTab}
              </h2>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Search */}
              <div className="relative hidden md:block">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 w-64"
                />
              </div>

              {/* Notifications */}
              <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell size={18} className="sm:w-5 sm:h-5" />
                <span className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full"></span>
              </button>

              {/* Add Expense Button */}
              <button
                onClick={onAddExpense}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-3 sm:px-6 py-2 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-1 sm:space-x-2 text-sm sm:text-base"
              >
                <Plus size={16} className="sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Add Expense</span>
              </button>
            </div>
          </div>
        </header>
        {/* Main Content */}
        <main className={`flex-1 overflow-y-auto bg-gray-50 px-4 sm:px-6 md:px-8 lg:px-16 pt-4 sm:pt-6 md:pt-8 mt-[81px] ${isMobile ? 'text-base' : ''}`} style={{ paddingBottom: isMobile ? '7rem' : '1.5rem' }}>
          {children}
        </main>
        {/* Bottom Navigation (mobile only) */}
        {isMobile && (
          <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 z-50 md:hidden">
            <div className="flex items-center justify-between px-1 py-6">
              {/* Dashboard */}
              <button
                onClick={() => { setShowPlansMenu(false); setShowRecordsMenu(false); onTabChange('dashboard'); }}
                className={`flex flex-col items-center justify-center py-1.5 px-2 transition-all duration-200 flex-1 relative ${
                  activeTab === 'dashboard' 
                    ? 'text-emerald-600' 
                    : 'text-gray-500 hover:text-emerald-600'
                }`}
              >
                <Home size={18} className="mb-0.5" />
                <span className="text-xs font-medium">Dashboard</span>
                {activeTab === 'dashboard' && (
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-emerald-600 rounded-full"></div>
                )}
              </button>

              {/* Analytics */}
              <button
                onClick={() => { setShowPlansMenu(false); setShowRecordsMenu(false); onTabChange('analytics'); }}
                className={`flex flex-col items-center justify-center py-1.5 px-2 transition-all duration-200 flex-1 relative ${
                  activeTab === 'analytics' 
                    ? 'text-emerald-600' 
                    : 'text-gray-500 hover:text-emerald-600'
                }`}
              >
                <BarChart3 size={18} className="mb-0.5" />
                <span className="text-xs font-medium">Analytics</span>
                {activeTab === 'analytics' && (
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-emerald-600 rounded-full"></div>
                )}
              </button>

              {/* Income */}
              <button
                onClick={() => { setShowPlansMenu(false); setShowRecordsMenu(false); onTabChange('income'); }}
                className={`flex flex-col items-center justify-center py-1.5 px-2 transition-all duration-200 flex-1 relative ${
                  activeTab === 'income' 
                    ? 'text-emerald-600' 
                    : 'text-gray-500 hover:text-emerald-600'
                }`}
              >
                <DollarSign size={18} className="mb-0.5" />
                <span className="text-xs font-medium">Income</span>
                {activeTab === 'income' && (
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-emerald-600 rounded-full"></div>
                )}
              </button>

              {/* Plans */}
              <button
                onClick={() => { setShowPlansMenu(v => !v); setShowRecordsMenu(false); }}
                className={`flex flex-col items-center justify-center py-1.5 px-2 transition-all duration-200 flex-1 relative ${
                  ['subscriptions','savings','emi'].includes(activeTab) 
                    ? 'text-emerald-600' 
                    : 'text-gray-500 hover:text-emerald-600'
                }`}
              >
                <Layers size={18} className="mb-0.5" />
                <span className="text-xs font-medium">Plans</span>
                {['subscriptions','savings','emi'].includes(activeTab) && (
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-emerald-600 rounded-full"></div>
                )}
              </button>

              {/* Records */}
              <button
                onClick={() => { setShowRecordsMenu(v => !v); setShowPlansMenu(false); }}
                className={`flex flex-col items-center justify-center py-1.5 px-2 transition-all duration-200 flex-1 relative ${
                  ['history','report'].includes(activeTab) 
                    ? 'text-emerald-600' 
                    : 'text-gray-500 hover:text-emerald-600'
                }`}
              >
                <MessageCircle size={18} className="mb-0.5" />
                <span className="text-xs font-medium">Records</span>
                {['history','report'].includes(activeTab) && (
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-emerald-600 rounded-full"></div>
                )}
              </button>

              {/* Profile */}
              <button
                onClick={() => { setShowPlansMenu(false); setShowRecordsMenu(false); onTabChange('profile'); }}
                className={`flex flex-col items-center justify-center py-1.5 px-2 transition-all duration-200 flex-1 relative ${
                  activeTab === 'profile' 
                    ? 'text-emerald-600' 
                    : 'text-gray-500 hover:text-emerald-600'
                }`}
              >
                {user && user.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-4 h-4 rounded-full object-cover border border-emerald-400 mb-0.5" />
                ) : (
                  <User size={18} className="mb-0.5" />
                )}
                <span className="text-xs font-medium">Profile</span>
                {activeTab === 'profile' && (
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-emerald-600 rounded-full"></div>
                )}
              </button>
            </div>

            {/* Plans Dropdown */}
            {showPlansMenu && (
              <div className="absolute bottom-full left-0 w-full bg-white border-t border-gray-200 shadow-lg">
                <div className="flex flex-col">
                  <button 
                    onClick={() => { setShowPlansMenu(false); onTabChange('subscriptions'); }}
                    className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-50 text-left transition-colors"
                  >
                    <RotateCcw size={18} className="text-emerald-600" />
                    <span className="text-sm font-medium">Subscriptions</span>
                  </button>
                  <button 
                    onClick={() => { setShowPlansMenu(false); onTabChange('savings'); }}
                    className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-50 text-left transition-colors"
                  >
                    <PiggyBank size={18} className="text-emerald-600" />
                    <span className="text-sm font-medium">Savings</span>
                  </button>
                  <button 
                    onClick={() => { setShowPlansMenu(false); onTabChange('emi'); }}
                    className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-50 text-left transition-colors"
                  >
                    <CreditCard size={18} className="text-emerald-600" />
                    <span className="text-sm font-medium">EMI Manager</span>
                  </button>
                </div>
              </div>
            )}

            {/* Records Dropdown */}
            {showRecordsMenu && (
              <div className="absolute bottom-full left-0 w-full bg-white border-t border-gray-200 shadow-lg">
                <div className="flex flex-col">
                  <button 
                    onClick={() => { setShowRecordsMenu(false); onTabChange('history'); }}
                    className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-50 text-left transition-colors"
                  >
                    <FileText size={18} className="text-emerald-600" />
                    <span className="text-sm font-medium">Transactions</span>
                  </button>
                  <button 
                    onClick={() => { setShowRecordsMenu(false); onTabChange('report'); }}
                    className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-50 text-left transition-colors"
                  >
                    <BarChart3 size={18} className="text-emerald-600" />
                    <span className="text-sm font-medium">Reports</span>
                  </button>
                </div>
              </div>
            )}
          </nav>
        )}
      </div>
    </div>
  );
}