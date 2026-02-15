import React from 'react';
import { ShoppingCart, Mail, Lock } from 'lucide-react';

export default function LoginPage({
  authMode,
  setAuthMode,
  email,
  setEmail,
  password,
  setPassword,
  authError,
  setAuthError,
  handleAuth,
  authLoading,
  t
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100">
        <div className="p-8 bg-indigo-600 text-white text-center">
          <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
            <ShoppingCart size={32} />
          </div>
          <h1 className="text-2xl font-black mb-1">{t.title}</h1>
          <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest opacity-80">Shared Grocery Sync</p>
        </div>
        <form onSubmit={handleAuth} className="p-8 space-y-4">
          {authError && <div className="p-4 bg-red-50 text-red-700 text-xs font-bold rounded-xl border border-red-200 leading-relaxed shadow-sm">{authError}</div>}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t.email}</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none font-bold text-sm" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t.password}</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none font-bold text-sm" />
            </div>
          </div>
          <button type="submit" disabled={authLoading} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-100 active:scale-95 transition-all mt-4 disabled:opacity-50 disabled:cursor-not-allowed">{authMode === 'login' ? t.login : t.signup}</button>
          <button type="button" onClick={() => { setAuthMode(authMode === 'login' ? 'signup' : 'login'); setAuthError(''); }} className="w-full text-center text-xs font-bold text-gray-400 hover:text-indigo-600 mt-2">
            {authMode === 'login' ? t.noAccount : t.hasAccount}
          </button>
        </form>
      </div>
    </div>
  );
}
