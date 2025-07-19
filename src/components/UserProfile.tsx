import { useState, useEffect } from 'react';
import { UserProfile as UserProfileType } from '../types';
import { 
  User, 
  Edit3, 
  Camera, 
  Shield, 
  Bell, 
  CreditCard, 
  ChevronRight,
  Settings,
  LogOut
} from 'lucide-react';

interface UserProfileProps {
  user: UserProfileType;
  onSignOut: () => void;
  darkMode?: boolean;
}

export function UserProfile({ user, onSignOut, darkMode = false }: UserProfileProps) {
  const [showEditProfile, setShowEditProfile] = useState(false);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showEditProfile) {
        setShowEditProfile(false);
      }
    };

    if (showEditProfile) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showEditProfile]);

  const creditScore = 750; // Mock credit score
  const membershipTier = 'Gold';

  const quickActions = [
    { id: 1, title: 'Edit Profile', icon: Edit3, action: () => setShowEditProfile(true) },
    { id: 2, title: 'Security Settings', icon: Shield, action: () => {} },
    { id: 3, title: 'Notifications', icon: Bell, action: () => {} },
    { id: 4, title: 'Linked Accounts', icon: CreditCard, action: () => {} },
  ];

  const baseClasses = darkMode 
    ? 'text-white' 
    : 'text-gray-900';

  const cardClasses = darkMode
    ? 'bg-slate-800/50 border-slate-700'
    : 'bg-white border-slate-200';

  const inputClasses = darkMode
    ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-emerald-400'
    : 'bg-white border-slate-300 text-gray-900 placeholder-slate-500 focus:border-emerald-500';

  return (
    <div className="space-y-8 pb-12">
      {/* Profile Header Card */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
        
        <div className="relative z-10">
          <div className="flex items-center space-x-6 mb-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 p-1 shadow-2xl">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt={user.displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={36} className="text-gray-600" />
                  )}
                </div>
              </div>
              <button className="absolute -bottom-1 -right-1 bg-white rounded-full p-2 shadow-lg hover:scale-110 transition-transform duration-200">
                <Camera size={16} className="text-gray-600" />
              </button>
            </div>
            
            <div className="flex-1">
              <h1 className="text-xl sm:text-3xl font-bold text-white mb-2">
                {user.displayName}
              </h1>
              <p className="text-base text-emerald-100 mb-3">
                {user.email}
              </p>
              <div className="flex items-center space-x-3">
                <span className="bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full text-sm font-bold">
                  {membershipTier} Member
                </span>
                <div className="flex items-center space-x-1">
                  <span className="text-white font-medium">{creditScore}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className={`rounded-xl border shadow-lg ${cardClasses}`}>
            <div className="p-6">
              <h2 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {quickActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={action.action}
                    className={`flex items-center justify-between p-4 rounded-xl transition-all duration-200 ${
                      darkMode 
                        ? 'hover:bg-slate-700/50 bg-slate-700/20' 
                        : 'hover:bg-slate-50 bg-slate-25'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg p-3 shadow-lg">
                        <action.icon size={20} className="text-white" />
                      </div>
                      <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {action.title}
                      </span>
                    </div>
                    <ChevronRight size={20} className={darkMode ? 'text-slate-400' : 'text-slate-500'} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Account Settings */}
          <div className={`rounded-xl border shadow-lg ${cardClasses}`}>
            <div className="p-6">
              <h2 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Account Settings
              </h2>
              <div className="space-y-4">
                <button className={`w-full flex items-center justify-between p-4 rounded-xl transition-all duration-200 ${
                  darkMode ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'
                }`}>
                  <div className="flex items-center space-x-4">
                    <Settings size={24} className={darkMode ? 'text-slate-400' : 'text-slate-600'} />
                    <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Settings & Preferences
                    </span>
                  </div>
                  <ChevronRight size={20} className={darkMode ? 'text-slate-400' : 'text-slate-500'} />
                </button>
                
                <button 
                  onClick={onSignOut}
                  className={`w-full flex items-center justify-between p-4 rounded-xl transition-all duration-200 ${
                    darkMode ? 'hover:bg-red-900/20' : 'hover:bg-red-50'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <LogOut size={24} className="text-red-500" />
                    <span className="font-medium text-red-500">
                      Sign Out
                    </span>
                  </div>
                  <ChevronRight size={20} className="text-red-500" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`w-full max-w-md rounded-xl shadow-2xl ${
            darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
          } border`}>
            <div className="p-6">
              <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Edit Profile
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    Display Name
                  </label>
                  <input
                    type="text"
                    defaultValue={user.displayName}
                    className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${inputClasses}`}
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    Email
                  </label>
                  <input
                    type="email"
                    defaultValue={user.email}
                    disabled
                    className={`w-full px-4 py-3 rounded-xl border ${
                      darkMode 
                        ? 'bg-slate-600 border-slate-600 text-slate-400' 
                        : 'bg-slate-100 border-slate-300 text-slate-500'
                    }`}
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowEditProfile(false)}
                  className={`flex-1 px-6 py-3 rounded-xl font-medium transition-colors ${
                    darkMode 
                      ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowEditProfile(false)}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 font-medium shadow-lg"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}