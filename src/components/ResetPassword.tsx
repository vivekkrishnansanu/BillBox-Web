import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus('');
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setStatus(error.message);
    } else {
      setStatus('Password updated! Redirecting to login...');
      setTimeout(() => navigate('/'), 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleReset} className="bg-white rounded-xl p-6 w-full max-w-xs shadow-2xl">
        <h2 className="text-lg font-bold mb-4 text-gray-900">Set New Password</h2>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="New password"
          className="w-full mb-3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 text-white rounded-lg py-2 font-medium hover:bg-emerald-700 transition-colors mb-2"
        >
          {loading ? 'Updating...' : 'Update Password'}
        </button>
        {status && <div className="text-sm text-center mb-2 text-emerald-600">{status}</div>}
      </form>
    </div>
  );
} 