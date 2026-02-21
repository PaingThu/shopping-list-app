import React, { useState, useEffect } from 'react';
import { Lock } from 'lucide-react';
import { confirmPasswordReset } from 'firebase/auth';

export default function ResetPassword({ auth, t }) {
  const [oobCode, setOobCode] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let params = new URLSearchParams(window.location.search);
    let code = params.get('oobCode');
    if (!code && window.location.hash && window.location.hash.includes('?')) {
      params = new URLSearchParams(window.location.hash.split('?')[1]);
      code = params.get('oobCode');
    }
    setOobCode(code);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('');
    if (!oobCode) return setStatus(t.resetError || 'Invalid reset link.');
    if (!newPassword || newPassword.length < 6) return setStatus(t.resetError || 'Password must be at least 6 characters.');
    if (newPassword !== confirmPassword) return setStatus(t.passwordMismatch || 'Passwords do not match.');
    setLoading(true);
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setStatus(t.resetSuccess || 'Password has been reset. You can now log in.');
    } catch (err) {
      setStatus(err.message || t.resetError);
    } finally {
      setLoading(false);
    }
  };

  if (!oobCode) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white p-6 rounded-2xl shadow">
          <p className="text-sm text-gray-600">Invalid or missing reset code.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white p-6 rounded-2xl shadow">
        <h2 className="text-lg font-black mb-3">{t.resetPasswordTitle || 'Reset Password'}</h2>
        {status && <div className="p-3 mb-3 rounded bg-gray-50 text-sm text-red-600">{status}</div>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-bold text-gray-600">{t.newPassword || 'New Password'}</label>
            <div className="relative mt-2">
              <Lock className="absolute left-3 top-3 text-gray-400" size={16} />
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full pl-10 pr-3 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl" />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-600">{t.confirmPassword || 'Confirm Password'}</label>
            <div className="relative mt-2">
              <Lock className="absolute left-3 top-3 text-gray-400" size={16} />
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full pl-10 pr-3 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold">{loading ? '...' : (t.resetPasswordButton || 'Set New Password')}</button>
        </form>
      </div>
    </div>
  );
}
