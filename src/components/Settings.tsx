import { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation'; 
import { Settings as SettingsType, UserProfile } from '../types';
import { authService } from '../services/authService';
import { reminderService } from '../services/reminderService';
import { Globe, DollarSign, Bell, Shield, ChevronRight, LogOut, Smartphone, MessageCircle, Brain, Moon, Sun } from 'lucide-react';

interface SettingsProps {
  settings: SettingsType;
  onUpdateSettings: (settings: Partial<SettingsType>) => void;
  userProfile?: UserProfile;
  onSignOut: () => void;
  onResetData: () => void;
}

export function Settings({ settings, onUpdateSettings, userProfile, onSignOut, onResetData }: SettingsProps) {
  const { t } = useTranslation();
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(settings.phoneNumber || '');
  const [whatsappNumber, setWhatsappNumber] = useState(settings.whatsappNumber || '');
  const [showResetModal, setShowResetModal] = useState(false);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी' },
    { code: 'es', name: 'Español' },
  ];

  const handlePinSetup = () => {
    if (newPin.length >= 4) {
      onUpdateSettings({ pinEnabled: true, pin: newPin });
      setNewPin('');
      setShowPinSetup(false);
    }
  };

  const handleSignOut = async () => {
    if (confirm('Are you sure you want to sign out?')) {
      await authService.signOut();
      onSignOut();
    }
  };

  const requestNotificationPermission = async () => {
    const granted = await reminderService.requestNotificationPermission();
    if (granted) {
      alert('Notifications enabled successfully!');
    } else {
      alert('Please enable notifications in your browser settings.');
    }
  };

  const baseClasses = 'bg-white text-gray-900 border-gray-200';
  const inputClasses = 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-green-500';

  const SettingItem = ({ 
    icon, 
    title, 
    value, 
    onClick 
  }: { 
    icon: React.ReactNode;
    title: string;
    value: string;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between p-4 rounded-lg shadow-sm border transition-colors ${baseClasses} hover:bg-gray-50`}
    >
      <div className="flex items-center space-x-3">
        {icon}
        <span className="font-medium text-gray-900">{title}</span>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-gray-600">{value}</span>
        <ChevronRight size={16} className="text-gray-400" />
      </div>
    </button>
  );

  // Handle escape key for reset modal
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showResetModal) {
        setShowResetModal(false);
      }
    };

    if (showResetModal) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showResetModal]);

  return (
    <div className="p-6 space-y-6 min-h-screen bg-gray-50 text-gray-900">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {t('settings')}
        </h1>
        {userProfile && (
          <div className="flex items-center space-x-3">
            {userProfile.photoURL && (
              <img 
                src={userProfile.photoURL} 
                alt={userProfile.displayName}
                className="w-8 h-8 rounded-full"
              />
            )}
            <span className="text-sm text-gray-600">{userProfile.displayName}</span>
          </div>
        )}
      </div>

      {/* User Profile Section */}
      {userProfile && (
        <div className={`rounded-lg shadow-sm border p-4 ${baseClasses}`}>
          <h3 className="text-lg font-semibold mb-3 text-gray-900">Account</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {userProfile.photoURL && (
                <img 
                  src={userProfile.photoURL} 
                  alt={userProfile.displayName}
                  className="w-12 h-12 rounded-full"
                />
              )}
              <div>
                <p className="font-medium text-gray-900">{userProfile.displayName}</p>
                <p className="text-sm text-gray-600">{userProfile.email}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-2 px-3 py-2 text-red-600 rounded-lg transition-colors hover:bg-red-50"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {/* Language */}
        <SettingItem
          icon={<Globe size={20} className="text-blue-600" />}
          title={t('language')}
          value={languages.find(l => l.code === settings.language)?.name || 'English'}
          onClick={() => {
            const currentIndex = languages.findIndex(l => l.code === settings.language);
            const nextIndex = (currentIndex + 1) % languages.length;
            onUpdateSettings({ language: languages[nextIndex].code });
          }}
        />

        {/* Currency - Fixed to INR */}
        <div className={`rounded-2xl shadow-lg border p-6 ${baseClasses}`}>
          <div className="flex items-center space-x-3">
            <DollarSign size={20} className="text-green-600" />
            <span className="font-medium text-gray-900">{t('currency')}</span>
            <span className="text-gray-600">₹ (Indian Rupee Only)</span>
            <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">Fixed</span>
          </div>
          <p className="text-xs mt-1 text-gray-500">
            BillBox is designed specifically for Indian users
          </p>
        </div>

        {/* AI Features */}
        <div className={`rounded-2xl shadow-lg border p-6 ${baseClasses}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <Brain size={20} className="text-purple-600" />
              <span className="font-medium text-gray-900">AI Features</span>
            </div>
            <button
              onClick={() => onUpdateSettings({ aiEnabled: !settings.aiEnabled })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.aiEnabled ? 'bg-purple-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.aiEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <p className="text-sm text-gray-600">
            Enable AI-powered category prediction and spending insights
          </p>
        </div>

        {/* Reminder Days */}
        <div className={`rounded-lg shadow-sm border p-4 ${baseClasses}`}>
          <div className="flex items-center space-x-3 mb-3">
            <Bell size={20} className="text-orange-600" />
            <span className="font-medium text-gray-900">{t('reminderDays')}</span>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={settings.reminderDays}
              onChange={(e) => onUpdateSettings({ reminderDays: parseInt(e.target.value) || 3 })}
              min="1"
              max="30"
              className="w-16 px-2 py-1 border rounded text-center border-gray-300 bg-white text-gray-900"
            />
            <span className="text-gray-600">{t('daysBefore')}</span>
          </div>
        </div>

        {/* Reminder Types */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3 mb-3">
            <Bell size={20} className="text-purple-600" />
            <span className="font-medium text-gray-900">Reminder Types</span>
          </div>
          <div className="space-y-3">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={settings.reminderTypes?.includes('in-app')}
                onChange={(e) => {
                  const types = settings.reminderTypes || [];
                  if (e.target.checked) {
                    onUpdateSettings({ reminderTypes: [...types, 'in-app'] });
                    requestNotificationPermission();
                  } else {
                    onUpdateSettings({ reminderTypes: types.filter(t => t !== 'in-app') });
                  }
                }}
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
              />
              <Bell size={16} className="text-gray-600" />
              <span className="text-sm">In-App Notifications</span>
            </label>
            
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={settings.reminderTypes?.includes('whatsapp')}
                onChange={(e) => {
                  const types = settings.reminderTypes || [];
                  if (e.target.checked) {
                    onUpdateSettings({ reminderTypes: [...types, 'whatsapp'] });
                  } else {
                    onUpdateSettings({ reminderTypes: types.filter(t => t !== 'whatsapp') });
                  }
                }}
                className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
              />
              <MessageCircle size={16} className="text-green-600" />
              <span className="text-sm">WhatsApp Reminders</span>
            </label>
            
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={settings.reminderTypes?.includes('sms')}
                onChange={(e) => {
                  const types = settings.reminderTypes || [];
                  if (e.target.checked) {
                    onUpdateSettings({ reminderTypes: [...types, 'sms'] });
                  } else {
                    onUpdateSettings({ reminderTypes: types.filter(t => t !== 'sms') });
                  }
                }}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <Smartphone size={16} className="text-blue-600" />
              <span className="text-sm">SMS Reminders</span>
            </label>
          </div>
        </div>

        {/* Contact Information */}
        <div className={`rounded-lg shadow-sm border p-4 ${baseClasses}`}>
          <h3 className="text-lg font-semibold mb-3 text-gray-900">Contact Information</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Phone Number (for SMS)
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                onBlur={() => onUpdateSettings({ phoneNumber })}
                placeholder="+91 9876543210"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 border-gray-300 bg-white text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                WhatsApp Number
              </label>
              <input
                type="tel"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                onBlur={() => onUpdateSettings({ whatsappNumber })}
                placeholder="+91 9876543210"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 border-gray-300 bg-white text-gray-900"
              />
            </div>
          </div>
        </div>

        {/* PIN Security */}
        <div className={`rounded-lg shadow-sm border p-4 ${baseClasses}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <Shield size={20} className="text-red-600" />
              <span className="font-medium text-gray-900">{t('enablePin')}</span>
            </div>
            <button
              onClick={() => {
                if (settings.pinEnabled) {
                  onUpdateSettings({ pinEnabled: false, pin: undefined });
                } else {
                  setShowPinSetup(true);
                }
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.pinEnabled ? 'bg-green-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.pinEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          {showPinSetup && (
            <div className="mt-4 p-4 rounded-lg bg-gray-50">
              <input
                type="password"
                placeholder="Enter 4-digit PIN"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                maxLength={4}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 border-gray-300 bg-white text-gray-900"
              />
              <div className="flex space-x-2 mt-3">
                <button
                  onClick={() => setShowPinSetup(false)}
                  className="px-4 py-2 rounded-lg transition-colors text-gray-600 bg-gray-200 hover:bg-gray-300"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handlePinSetup}
                  disabled={newPin.length < 4}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {t('save')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reset Data Section */}
      <div className="rounded-2xl shadow-lg border p-6 bg-red-50 border-red-200">
        <div className="flex items-center space-x-3 mb-3">
          <Shield size={20} className="text-red-600" />
          <span className="font-medium text-red-700">Danger Zone</span>
        </div>
        <p className="text-sm text-red-600 mb-4">This will permanently delete all your data and reset your account. This action cannot be undone.</p>
        <button
          onClick={() => setShowResetModal(true)}
          className="px-5 py-2 bg-red-600 text-white rounded-lg font-semibold shadow hover:bg-red-700 transition-colors"
        >
          Reset All Data
        </button>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full border border-red-200">
            <h2 className="text-xl font-bold text-red-700 mb-3">Confirm Data Reset</h2>
            <p className="text-gray-700 mb-6">Are you sure you want to <span className='text-red-600 font-semibold'>reset all your data</span>? This action cannot be undone and will permanently delete all your account data.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => { setShowResetModal(false); onResetData(); }}
                className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 shadow"
              >
                Yes, Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* App Info */}
      <div className="rounded-xl p-6 text-center bg-gray-50">
        <h3 className="text-lg font-semibold mb-2 text-gray-900">BillBox</h3>
        <p className="text-sm text-gray-600">
          Smart Daily Expense & Bill Tracker
        </p>
        <p className="text-xs mt-2 text-gray-500">
          Version 1.0.0
        </p>
      </div>
    </div>
  );
}