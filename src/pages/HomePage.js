import React from 'react';
import { Plus, Trash2, Settings, LogOut, User, Calendar, Receipt, Store, ArrowRight } from 'lucide-react';

export default function HomePage({
  user,
  sessions,
  setCurrentSessionId,
  setView,
  setIsSettingsOpen,
  handleDeleteSession,
  setTempName,
  setIsCreatePopupOpen,
  tempMarket,
  t,
  onSignOut
}) {
  return (
    <div className="flex flex-col h-full animate-in fade-in duration-300">
      <header className="bg-indigo-600 text-white p-6 pt-safe-top shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2.5 rounded-2xl backdrop-blur-md"><User size={24} /></div>
            <div className="overflow-hidden">
              <p className="text-[10px] font-black text-indigo-200 uppercase tracking-tighter">Account</p>
              <p className="text-sm font-bold truncate max-w-[150px]">{user.email || 'Local User'}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setIsSettingsOpen(true)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><Settings size={20} /></button>
            <button onClick={onSignOut} className="p-2 hover:bg-red-500/20 rounded-full text-red-100 transition-colors"><LogOut size={20} /></button>
          </div>
        </div>
        <button onClick={() => { 
          const today = new Date().toISOString().split('T')[0];
          setTempName(`${today} @ ${tempMarket}`); 
          setIsCreatePopupOpen(true); 
        }} className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-black text-lg shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2">
          <Plus size={24} strokeWidth={3} /> {t.createList}
        </button>
      </header>
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
          <Calendar size={14} /> {t.history}
        </h2>
        <div className="space-y-3">
          {sessions.length === 0 ? (
            <div className="text-center py-12 px-6">
              <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300"><Receipt size={32} /></div>
              <p className="text-sm font-bold text-gray-400">No lists yet.</p>
            </div>
          ) : (
            sessions.map(session => {
              const isCreator = session.createdBy === user?.uid;
              const isBuyer = session?.buyerEmail && user?.email && session.buyerEmail === user.email;
              return (
                <div key={session.id} onClick={() => { setCurrentSessionId(session.id); setView('shopping'); }} className="w-full text-left bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md active:scale-[0.98] transition-all flex items-center justify-between group">
                  <div className="flex items-center gap-4 flex-1 overflow-hidden">
                    <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-500 group-hover:bg-indigo-600 group-hover:text-white transition-colors shrink-0"><Store size={22} /></div>
                    <div className="overflow-hidden">
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-gray-800 text-sm truncate">{session.name}</h3>
                      </div>
                      <p className="text-[10px] font-bold text-gray-400 mt-0.5">{session.date} • {session.buyerEmail}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {isCreator && <span className="text-[9px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full shrink-0">Creator</span>}
                        {isBuyer && <span className="text-[9px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full shrink-0">Buyer</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isCreator && (
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteSession(session.id); }} className="p-2 text-red-500 hover:text-red-700">
                        <Trash2 size={18} />
                      </button>
                    )}
                    <ArrowRight size={18} className="text-gray-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
