import React from 'react';
import { Plus, Trash2, Check, Receipt, ChevronLeft, Loader2, RotateCcw } from 'lucide-react';

export default function ShoppingPage({
  sessions,
  currentSessionId,
  setView,
  handleCheckoutClick,
  isGeneratingPdf,
  activeItems,
  isCreator,
  isBuyer,
  isCheckedOut,
  handleCheckClick,
  deleteItem,
  currency,
  t,
  boughtItemsDisplay,
  newItemText,
  setNewItemText,
  handleAddItem,
  isCheckoutModalOpen,
  setIsCheckoutModalOpen,
  items,
  unboughtItemStatuses,
  setUnboughtItemStatuses,
  handleConfirmCheckout,
  itemToBuy,
  setItemToBuy,
  inputPrice,
  setInputPrice,
  confirmPrice,
  isCreatePopupOpen,
  setIsCreatePopupOpen,
  tempName,
  setTempName,
  tempMarket,
  setTempMarket,
  tempBuyerEmail,
  setTempBuyerEmail,
  handleCreateNew,
  markets
}) {
  return (
    <>
      <div className="flex flex-col h-full animate-in slide-in-from-right duration-300">
        {isCheckedOut && (
          <div className="bg-green-500 text-white p-3 text-center font-bold text-sm shadow-md">
            ✓ Shopping Complete - Checkout Finished
          </div>
        )}
        <header className={`${isCheckedOut ? 'bg-green-700' : 'bg-indigo-600'} text-white p-4 pt-safe-top shadow-md z-10 transition-colors`}>
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center space-x-2">
              <button onClick={() => setView('home')} className="p-2 -ml-2 hover:bg-white/10 rounded-full"><ChevronLeft size={24} /></button>
              <div className="max-w-[180px]">
                <h1 className="text-lg font-black leading-tight truncate">{sessions.find(s => s.id === currentSessionId)?.name}</h1>
                <p className="text-[10px] text-indigo-200 mt-1 font-bold uppercase tracking-wider">Total: {(sessions.find(s => s.id === currentSessionId)?.total || 0).toLocaleString()} {currency.symbol}</p>
              </div>
            </div>
            <button
              onClick={handleCheckoutClick}
              disabled={isGeneratingPdf || (!isCheckedOut && !isBuyer)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-white text-xs font-bold rounded-full shadow-lg ${(!isBuyer && !isCheckedOut) ? 'hidden' : (isCheckedOut ? 'bg-indigo-500' : 'bg-green-500')}`}>
              {isGeneratingPdf ? <Loader2 size={14} className="animate-spin" /> : <Receipt size={14} />}
              {isCheckedOut ? (t.receipt || 'Receipt') : t.checkout}
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 space-y-4 pb-32">
          <section>
            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">{t.toFind}</h2>
            <div className="space-y-2">
              {activeItems.map(item => (
                <div key={item.id} className={`flex items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm ${isCheckedOut ? 'opacity-60' : ''}`}>
                  {isCreator && !isBuyer ? (
                    <div className="w-7 h-7 rounded-full border-2 border-indigo-200 mr-3 shrink-0 opacity-40" title="Only buyer can mark items bought" />
                  ) : (
                    currentSessionId && (
                      <input type="radio" name={`buyer-select-${currentSessionId}`} onChange={() => handleCheckClick(item)} className="mr-3 w-5 h-5" disabled={isCheckedOut} />
                    )
                  )}
                  <span className="flex-1 text-sm font-bold text-gray-700 truncate">{item.text}</span>
                  <button onClick={() => deleteItem(item.id)} className="p-2 text-gray-300 hover:text-red-500 shrink-0" disabled={isCheckedOut}><Trash2 size={18}/></button>
                </div>
              ))}
            </div>
          </section>
          {boughtItemsDisplay.length > 0 && (
            <section>
              <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">{t.bought}</h2>
              <div className="space-y-2">
                {boughtItemsDisplay.map(item => (
                  <div key={item.id} className="flex items-center bg-gray-50/50 p-4 rounded-xl border border-dashed border-gray-200 opacity-80">
                    {isCreator && !isBuyer ? (
                      <div className="w-7 h-7 rounded-full bg-indigo-500 text-white flex items-center justify-center mr-3 shrink-0 opacity-60"><Check size={16} strokeWidth={3} /></div>
                    ) : (
                      currentSessionId && <div className="w-7 h-7 rounded-full bg-green-500 text-white flex items-center justify-center mr-3 shrink-0"><Check size={16} strokeWidth={3} /></div>
                    )}
                    <span className="flex-1 text-sm font-medium text-gray-400 line-through truncate">{item.text}</span>
                    <div className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg mr-2 shrink-0">{parseFloat(item.price).toLocaleString()} {currency.symbol}</div>
                    {(isBuyer) && currentSessionId && (
                      <button onClick={() => handleCheckClick(item)} className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors shrink-0" title="Move back to To Find" disabled={isCheckedOut}>
                        <RotateCcw size={18} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
        <div className="absolute bottom-0 left-0 right-0 bg-white p-4 border-t border-gray-100 z-20 pb-safe-bottom">
          <form onSubmit={handleAddItem} className="flex gap-2">
            <input
              type="text"
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              placeholder={isCheckedOut ? 'Read-only — checked out' : isCreator ? t.placeholder : 'View only — creator can add items'}
              disabled={!isCreator || isCheckedOut}
              className="flex-1 px-4 py-3.5 bg-gray-100 rounded-2xl text-sm font-bold outline-none border-2 border-transparent focus:border-indigo-500 disabled:opacity-50"
            />
            <button type="submit" disabled={!newItemText.trim() || !isCreator || isCheckedOut} className="bg-indigo-600 text-white p-3.5 rounded-2xl shadow-lg active:scale-95 disabled:opacity-50">
              <Plus size={24} strokeWidth={2.5} />
            </button>
          </form>
        </div>
      </div>

      {isCreatePopupOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 space-y-4">
            <h3 className="text-xl font-black text-indigo-600 mb-2">{t.createList}</h3>
            <input type="text" value={tempName} onChange={(e) => setTempName(e.target.value)} placeholder="Weekly Prep" required className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-bold" />
            <select value={tempMarket} onChange={(e) => { 
              setTempMarket(e.target.value);
              const today = new Date().toISOString().split('T')[0];
              setTempName(`${today} @ ${e.target.value}`);
            }} required className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-bold">
              {markets.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <input type="email" value={tempBuyerEmail} onChange={(e) => setTempBuyerEmail(e.target.value)} placeholder="buyer@example.com" required className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-bold" />
            <div className="flex gap-3 pt-2">
              <button onClick={() => setIsCreatePopupOpen(false)} className="flex-1 py-4 rounded-2xl font-black text-gray-500 bg-gray-100">Cancel</button>
              <button onClick={handleCreateNew} disabled={!tempName.trim() || !tempMarket || !tempBuyerEmail.trim()} className="flex-[2] py-4 rounded-2xl font-black text-white bg-indigo-600 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">Create</button>
            </div>
          </div>
        </div>
      )}

      {itemToBuy && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-xs rounded-2xl p-6 shadow-2xl">
            <h3 className="font-bold text-gray-900 mb-4 text-lg">{itemToBuy.text}</h3>
            <form onSubmit={confirmPrice} className="space-y-4">
              <input autoFocus type="number" placeholder="0" value={inputPrice} onChange={(e) => setInputPrice(e.target.value)} className="w-full px-4 py-4 bg-gray-50 rounded-2xl text-xl font-black outline-none border-2 border-transparent focus:border-indigo-500" />
              <div className="flex gap-3">
                <button type="button" onClick={() => setItemToBuy(null)} className="flex-1 py-3.5 rounded-xl font-bold text-gray-500 bg-gray-100">Cancel</button>
                <button type="submit" className="flex-[2] py-3.5 rounded-xl font-bold text-white bg-indigo-600 shadow-lg">Confirm</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl max-h-[80vh] overflow-y-auto">
            <h3 className="font-bold text-gray-900 mb-4 text-lg">Unbought Items - Set Status</h3>
            <div className="space-y-4 mb-6">
              {items.filter(i => !i.completed).map(item => (
                <div key={item.id} className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">{item.text}</label>
                  <select
                    value={unboughtItemStatuses[item.id] || 'Not Found'}
                    onChange={(e) => setUnboughtItemStatuses({ ...unboughtItemStatuses, [item.id]: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 border-2 border-gray-100 rounded-xl text-sm font-bold outline-none focus:border-indigo-500"
                  >
                    <option value="Not Found">Not Found</option>
                    <option value="Expensive">Expensive</option>
                    <option value="Over Budget">Over Budget</option>
                  </select>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setIsCheckoutModalOpen(false)} className="flex-1 py-3.5 rounded-xl font-bold text-gray-500 bg-gray-100">Cancel</button>
              <button onClick={handleConfirmCheckout} className="flex-[2] py-3.5 rounded-xl font-bold text-white bg-green-600 shadow-lg">Generate PDF</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
