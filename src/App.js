import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  onSnapshot, 
  query,
  where,
  getDocs,
  increment,
  addDoc, 
  updateDoc, 
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { 
  X, Loader2
} from 'lucide-react';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import ShoppingPage from './pages/ShoppingPage';
import ResetPassword from './pages/ResetPassword';

/**
 * LOCAL SETUP INSTRUCTIONS:
 * 1. Replace the firebaseConfig object below with the one from your Firebase Console.
 * 2. Ensure "Email/Password" and "Anonymous" auth are enabled in Firebase Console.
 * 3. Set Firestore rules to allow read/write to the 'artifacts' collection.
 */
const firebaseConfig = (typeof window !== 'undefined' && window.__firebase_config) 
  ? JSON.parse(window.__firebase_config) 
  : {
      apiKey: "AIzaSyCVOfj3tGbXHkCmAtpPng0_tTAlO_W8tTw",
      authDomain: "sharegrocery-5dccd.firebaseapp.com",
      databaseURL: "https://sharegrocery-5dccd-default-rtdb.firebaseio.com",
      projectId: "sharegrocery-5dccd",
      storageBucket: "sharegrocery-5dccd.firebasestorage.app",
      messagingSenderId: "197039647565",
      appId: "1:197039647565:web:4bbb7a892d3a95f537e504",
      measurementId: "G-ZZ0G30RQW6"
    };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = (typeof window !== 'undefined' && window.__app_id) ? window.__app_id : 'shopping-collab-app';

const JSPDF_SCRIPT = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
const JSPDF_AUTOTABLE_SCRIPT = "https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.28/jspdf.plugin.autotable.min.js";

const translations = {
  en: {
    title: "Chef & Buyer",
    login: "Login",
    signup: "Sign Up",
    email: "Email Address",
    password: "Password",
    noAccount: "Don't have an account?",
    hasAccount: "Already have an account?",
    createList: "Create New List",
    history: "Recent Shopping Lists",
    checkout: "Checkout",
    send: "Send to Buyer",
    toFind: "To Find",
    bought: "Bought",
    placeholder: "Item name (e.g. Fresh Basil)",
    settings: "Settings",
    pdfTitle: "SHOPPING RECEIPT",
    itemName: "Item Name",
    price: "Price",
    confirm: "Confirm",
    cancel: "Cancel",
    marketName: "Market",
    listName: "List Title",
    startShopping: "Create List",
    buyerEmail: "Buyer Email Address",
    sendSuccess: "List sent successfully!",
    accessCode: "Access Code",
    sending: "Sending...",
    authErrorConfig: "Configuration Error: Please enable 'Email/Password' in Firebase Auth settings."
  },
  ja: {
    title: "シェフ＆バイヤー",
    login: "ログイン",
    signup: "新規登録",
    email: "メールアドレス",
    password: "パスワード",
    noAccount: "アカウントをお持ちでない方",
    hasAccount: "既にアカウントをお持ちの方",
    createList: "新規リスト作成",
    history: "最近の買い物リスト",
    checkout: "お会計",
    send: "バイヤーに送信",
    toFind: "未購入",
    bought: "購入済み",
    placeholder: "商品名（例：バジル）",
    settings: "設定",
    pdfTitle: "お買い物レシート",
    itemName: "商品名",
    price: "価格",
    confirm: "確定",
    cancel: "キャンセル",
    marketName: "店舗",
    listName: "リスト名",
    startShopping: "リストを作成",
    buyerEmail: "バイヤーのメールアドレス",
    sendSuccess: "リストを送信しました！",
    accessCode: "アクセスコード",
    sending: "送信中...",
    authErrorConfig: "設定エラー: Firebaseコンソールで「メール/パスワード」を有効にしてください。"
  }
};

// small i18n additions for password reset
translations.en.forgotPassword = "Forgot password?";
translations.en.forgotPasswordModal = "Reset Password";
translations.en.resetPassword = "Send Reset Link";
translations.en.resetSent = "Password reset email sent. Check your inbox.";
translations.en.resetError = "Enter a valid email to reset password.";
translations.en.resetPasswordTitle = "Reset your password";
translations.en.newPassword = "New Password";
translations.en.confirmPassword = "Confirm Password";
translations.en.passwordMismatch = "Passwords do not match.";
translations.en.resetSuccess = "Password updated. You can now sign in.";
translations.en.resetPasswordButton = "Set New Password";

translations.ja.forgotPassword = "パスワードをお忘れですか？";
translations.ja.forgotPasswordModal = "パスワードのリセット";
translations.ja.resetPassword = "リセットリンクを送信";
translations.ja.resetSent = "パスワードリセットのメールを送信しました。受信トレイを確認してください。";
translations.ja.resetError = "有効なメールアドレスを入力してください。";
translations.ja.resetPasswordTitle = "パスワードのリセット";
translations.ja.newPassword = "新しいパスワード";
translations.ja.confirmPassword = "パスワードの確認";
translations.ja.passwordMismatch = "パスワードが一致しません。";
translations.ja.resetSuccess = "パスワードが更新されました。ログインできます。";
translations.ja.resetPasswordButton = "新しいパスワードを設定";

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authMode, setAuthMode] = useState('login'); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const [view, setView] = useState(() => {
    // Restore view from localStorage
    const savedView = localStorage.getItem('lastView');
    return savedView || 'home';
  });
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(() => {
    // Restore sessionId from localStorage
    return localStorage.getItem('lastSessionId');
  });
  const [items, setItems] = useState([]);
  const [lang, setLang] = useState('en');
  const [currency, setCurrency] = useState({ code: 'JPY', symbol: '¥' });
  
  const currencyOptions = [
    { code: 'JPY', symbol: '¥', name: 'JPY (Yen)' },
    { code: 'USD', symbol: '$', name: 'USD (Dollar)' },
    { code: 'MMK', symbol: 'KS', name: 'MMK (Kyats)' }
  ];
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [newItemText, setNewItemText] = useState('');
  
  const [markets] = useState(['OK Daily Low Price', 'Bellex', 'Tobu', 'Others']);
  const [isCreatePopupOpen, setIsCreatePopupOpen] = useState(false);
  
  const [tempMarket, setTempMarket] = useState(markets[0]);
  const [tempName, setTempName] = useState('');
  const [tempBuyerEmail, setTempBuyerEmail] = useState('');

  const [itemToBuy, setItemToBuy] = useState(null);
  const [inputPrice, setInputPrice] = useState('');

  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [unboughtItemStatuses, setUnboughtItemStatuses] = useState({});
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordStatus, setForgotPasswordStatus] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);

  const t = translations[lang] || translations.en;

  // Save view to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('lastView', view);
  }, [view]);

  // Save sessionId to localStorage whenever it changes
  useEffect(() => {
    if (currentSessionId) {
      localStorage.setItem('lastSessionId', currentSessionId);
    }
  }, [currentSessionId]);

  // Authentication logic - Firebase persists session automatically
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetching Session Data: listen to sessions where the user is the creator OR where
  // the user's email matches the buyerEmail. We merge two listeners and dedupe results.
  useEffect(() => {
    if (!user) return;

    const sessionsMap = new Map();
    const unsubscribes = [];

    const pushSnapshot = (snapshot) => {
      snapshot.docs.forEach(d => {
        sessionsMap.set(d.id, { id: d.id, ...d.data() });
      });
      const merged = Array.from(sessionsMap.values()).sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setSessions(merged);
    };

    try {
      const colRef = collection(db, 'artifacts', appId, 'public', 'data', 'sessions');

      // 1) Sessions created by this user
      const qCreator = query(colRef, where('createdBy', '==', user.uid));
      const unsubCreator = onSnapshot(qCreator, (snap) => pushSnapshot(snap), (err) => console.error('Session (creator) fetch error', err));
      unsubscribes.push(unsubCreator);

      // 2) Sessions where this user is the buyer (email match)
      if (user.email) {
        const qBuyer = query(colRef, where('buyerEmail', '==', user.email));
        const unsubBuyer = onSnapshot(qBuyer, (snap) => pushSnapshot(snap), (err) => console.error('Session (buyer) fetch error', err));
        unsubscribes.push(unsubBuyer);
      }
    } catch (err) {
      console.error('Session listeners setup error', err);
    }

    return () => unsubscribes.forEach(u => u());
  }, [user]);

  // Fetching Items for a specific session
  useEffect(() => {
    if (!user || !currentSessionId) return;
    const itemsCol = collection(db, 'artifacts', appId, 'public', 'data', 'sessions', currentSessionId, 'items');
    const unsubscribe = onSnapshot(itemsCol, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setItems(docs);
    });
    return () => unsubscribe();
  }, [user, currentSessionId]);

  // PDF Libs Loader
  useEffect(() => {
    const loadScript = (src) => {
      return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) return resolve();
        const script = document.createElement('script');
        script.src = src;
        script.async = false;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };
    const initPdfLibs = async () => {
      try {
        await loadScript(JSPDF_SCRIPT);
        await loadScript(JSPDF_AUTOTABLE_SCRIPT);
      } catch (err) { console.error("PDF lib error", err); }
    };
    initPdfLibs();
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      if (authMode === 'signup') {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      if (err.code === 'auth/operation-not-allowed') {
        setAuthError(t.authErrorConfig);
      } else {
        setAuthError(err.message);
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    setForgotPasswordStatus('');
    if (!forgotPasswordEmail || !forgotPasswordEmail.includes('@')) {
      setForgotPasswordStatus(t.resetError);
      return;
    }
    setForgotPasswordLoading(true);
    try {
      // Firebase sendPasswordResetEmail will send if email exists
      await sendPasswordResetEmail(auth, forgotPasswordEmail);
      console.log('Password reset request sent for:', forgotPasswordEmail);
      // Show success message and keep modal open so user can see it
      setForgotPasswordStatus('✓ Reset link sent! Check your email (including spam folder). If you don\'t see it in a few minutes, the email might not be registered.');
    } catch (err) {
      console.error('Password reset error:', err);
      // Show Firebase error or generic message
      setForgotPasswordStatus(err.message || 'Could not send reset email. Please try again.');
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleCreateNew = async () => {
    if (!user) return;
    const sessionRef = await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'sessions'), {
      name: tempName || 'New List',
      market: tempMarket,
      buyerEmail: tempBuyerEmail.trim().toLowerCase() || 'unassigned@example.com',
      date: new Date().toISOString().split('T')[0],
      createdAt: serverTimestamp(),
      createdBy: user.uid,
      accessCode: Math.floor(1000 + Math.random() * 9000).toString(), 
      total: 0
    });
    setCurrentSessionId(sessionRef.id);
    setIsCreatePopupOpen(false);
    setView('shopping');
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItemText.trim() || !currentSessionId) return;
    const session = sessions.find(s => s.id === currentSessionId);
    if (!session) return;
    // Check if session is already checked out
    if (session.isCheckedOut) {
      console.warn('Cannot add items: shopping list has been checked out.');
      return;
    }
    // Only the creator (session.createdBy) can add items
    if (session.createdBy !== user?.uid) {
      console.warn('Add item blocked: only the list creator can add items.');
      return;
    }
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'sessions', currentSessionId, 'items'), {
      text: newItemText.trim(),
      completed: false,
      price: '',
      createdAt: serverTimestamp()
    });
    setNewItemText('');
  };

  const handleCheckClick = async (item) => {
    const session = sessions.find(s => s.id === currentSessionId);
    // Check if session is already checked out
    if (session?.isCheckedOut) {
      console.warn('Cannot modify items: shopping list has been checked out.');
      return;
    }
    const isBuyer = session?.buyerEmail && user?.email && session.buyerEmail === user.email;
    if (!isBuyer) {
      console.warn('Only the designated buyer can mark items as bought/unbought.');
      return;
    }
    if (item.completed) {
      // Moving item back from Bought to To Find - subtract price from total
      const priceToSubtract = parseFloat(item.price || 0);
      
      // Update item to uncompleted and clear price
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'sessions', currentSessionId, 'items', item.id), {
        completed: false, price: ''
      });
      
      // Decrement session total atomically if price is valid
      if (currentSessionId && priceToSubtract > 0) {
        try {
          await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'sessions', currentSessionId), {
            total: increment(-priceToSubtract)
          });
        } catch (err) { console.error('Error decrementing total:', err); }
      }
    } else {
      setItemToBuy(item);
      setInputPrice('');
    }
  };

  const handleDeleteSession = async (sessionId) => {
    if (!sessionId) return;
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;
    // Only creator can delete the session
    if (session.createdBy !== user?.uid) {
      console.warn('Delete session blocked: only the creator can delete this list.');
      return;
    }
    if (!window.confirm('Delete this shopping list and all its items?')) return;
    try {
      // Delete items in subcollection first
      const itemsCol = collection(db, 'artifacts', appId, 'public', 'data', 'sessions', sessionId, 'items');
      const snapshot = await getDocs(itemsCol);
      const deletes = snapshot.docs.map(d => deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'sessions', sessionId, 'items', d.id)));
      await Promise.all(deletes);
      // Delete the session document
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'sessions', sessionId));
      // reset view if the deleted session was open
      if (currentSessionId === sessionId) {
        setCurrentSessionId(null);
        setView('home');
      }
    } catch (err) {
      console.error('Delete session error', err);
    }
  };

  

  const confirmPrice = async (e) => {
    if (e) e.preventDefault();
    if (!inputPrice || inputPrice <= 0) return;
    const session = sessions.find(s => s.id === currentSessionId);
    // Check if session is already checked out
    if (session?.isCheckedOut) {
      console.warn('Cannot modify prices: shopping list has been checked out.');
      return;
    }
    const priceNum = parseFloat(inputPrice);
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'sessions', currentSessionId, 'items', itemToBuy.id), {
      completed: true, price: priceNum
    });
    // increment session total atomically
    try {
      if (currentSessionId && !isNaN(priceNum)) {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'sessions', currentSessionId), {
          total: increment(priceNum)
        });
      }
    } catch (err) { console.error('Update session total error', err); }
    setItemToBuy(null);
    setInputPrice('');
  };

  const deleteItem = async (id) => {
    const session = sessions.find(s => s.id === currentSessionId);
    // Check if session is already checked out
    if (session?.isCheckedOut) {
      console.warn('Cannot delete items: shopping list has been checked out.');
      return;
    }
    await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'sessions', currentSessionId, 'items', id));
  };

  const handleCheckoutClick = () => {
    const activeItems = items.filter(i => !i.completed);
    if (activeItems.length > 0) {
      // Initialize statuses for unbought items if not already set
      const newStatuses = { ...unboughtItemStatuses };
      activeItems.forEach(item => {
        if (!newStatuses[item.id]) {
          newStatuses[item.id] = 'Not Found';
        }
      });
      setUnboughtItemStatuses(newStatuses);
      setIsCheckoutModalOpen(true);
    } else {
      // No unbought items, generate PDF directly
      generateFinalPdf();
    }
  };

  const handleConfirmCheckout = () => {
    setIsCheckoutModalOpen(false);
    generateFinalPdf();
  };

  const generateFinalPdf = async () => {
    if (!window.jspdf) return;
    setIsGeneratingPdf(true);
    const session = sessions.find(s => s.id === currentSessionId);
    try {
      const { jsPDF } = window.jspdf;
      const pdfDoc = new jsPDF();
      
      // Header
      pdfDoc.setFont("helvetica", "bold");
      pdfDoc.setFontSize(20);
      pdfDoc.text(t.pdfTitle, 14, 22);
      
      // Divider line
      pdfDoc.setLineWidth(0.5);
      pdfDoc.line(14, 25, 196, 25);
      
      // Session Details
      pdfDoc.setFontSize(10);
      pdfDoc.setFont("helvetica", "normal");
      pdfDoc.text(`List Name: ${session?.name}`, 14, 32);
      pdfDoc.text(`Market: ${session?.market}`, 14, 37);
      pdfDoc.text(`Buyer: ${session?.buyerEmail}`, 14, 42);
      
      // Date and Time
      const today = new Date();
      const dateStr = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      const timeStr = today.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      pdfDoc.text(`Date: ${dateStr}`, 14, 47);
      pdfDoc.text(`Time: ${timeStr}`, 14, 52);
      
      const boughtItems = items.filter(i => i.completed);
      const unboughtItems = items.filter(i => !i.completed);
      
      let startY = 62;
      
      // Bought items table
      if (boughtItems.length > 0) {
        pdfDoc.setFont("helvetica", "bold");
        pdfDoc.setFontSize(11);
        pdfDoc.text("✓ Bought Items", 14, startY);
        startY += 5;
        pdfDoc.setFontSize(10);
        pdfDoc.autoTable({
          startY: startY,
          head: [[t.itemName, t.price]],
          body: boughtItems.map(i => [i.text, `${parseFloat(i.price || 0).toLocaleString()} ${currency.symbol}`]),
          headStyles: { fillColor: [52, 152, 219], textColor: [255, 255, 255], fontStyle: 'bold' },
          bodyStyles: { textColor: [0, 0, 0] },
          alternateRowStyles: { fillColor: [240, 240, 240] },
          margin: { left: 14, right: 14 }
        });
        startY = pdfDoc.lastAutoTable.finalY + 10;
      }
      
      // Unbought items table
      if (unboughtItems.length > 0) {
        pdfDoc.setFont("helvetica", "bold");
        pdfDoc.setFontSize(11);
        pdfDoc.text("✗ Not Bought Items", 14, startY);
        startY += 5;
        pdfDoc.setFontSize(10);
        pdfDoc.autoTable({
          startY: startY,
          head: [[t.itemName, "Status"]],
          body: unboughtItems.map(i => [i.text, unboughtItemStatuses[i.id] || 'Not Found']),
          headStyles: { fillColor: [231, 76, 60], textColor: [255, 255, 255], fontStyle: 'bold' },
          bodyStyles: { textColor: [0, 0, 0] },
          alternateRowStyles: { fillColor: [255, 240, 240] },
          margin: { left: 14, right: 14 }
        });
        startY = pdfDoc.lastAutoTable.finalY + 10;
      }
      
      // Summary Section
      pdfDoc.setLineWidth(0.3);
      pdfDoc.line(14, startY - 2, 196, startY - 2);
      
      pdfDoc.setFont("helvetica", "bold");
      pdfDoc.setFontSize(12);
      const totalAmount = `TOTAL: ${(session?.total || 0).toLocaleString()} ${currency.symbol}`;
      pdfDoc.text(totalAmount, 14, startY + 8);
      
      // Summary stats
      pdfDoc.setFont("helvetica", "normal");
      pdfDoc.setFontSize(9);
      pdfDoc.text(`Items Bought: ${boughtItems.length}`, 14, startY + 15);
      pdfDoc.text(`Items Not Found: ${unboughtItems.length}`, 14, startY + 20);
      
      pdfDoc.save(`receipt-${currentSessionId}.pdf`);
      
      // Mark session as checked out
      try {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'sessions', currentSessionId), {
          isCheckedOut: true
        });
      } catch (err) { console.error('Error marking session as checked out:', err); }
      
      // Redirect to home page after a short delay to ensure PDF downloads
      setTimeout(() => {
        setView('home');
        setCurrentSessionId(null);
      }, 500);
    } catch (error) { console.error(error); }
    setIsGeneratingPdf(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-indigo-600 text-white p-6">
        <Loader2 className="animate-spin mb-4" size={48} />
        <p className="font-bold tracking-widest uppercase text-xs">Connecting...</p>
      </div>
    );
  }
    if (!user || user.isAnonymous) {
      // If the URL contains a password reset code, show the ResetPassword page.
      const params = new URLSearchParams(window.location.search || window.location.hash.split('?')[1] || '');
      const oobCode = params.get('oobCode');
      const mode = params.get('mode');
      if (oobCode && mode === 'resetPassword') {
        return <ResetPassword auth={auth} t={t} />;
      }

      return (
        <LoginPage
          authMode={authMode}
          setAuthMode={setAuthMode}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          authError={authError}
          setAuthError={setAuthError}
          handleAuth={handleAuth}
          handlePasswordReset={handlePasswordReset}
          authLoading={authLoading}
          isForgotPasswordOpen={isForgotPasswordOpen}
          setIsForgotPasswordOpen={setIsForgotPasswordOpen}
          forgotPasswordEmail={forgotPasswordEmail}
          setForgotPasswordEmail={setForgotPasswordEmail}
          forgotPasswordStatus={forgotPasswordStatus}
          forgotPasswordLoading={forgotPasswordLoading}
          t={t}
        />
      );
    }

  const activeItems = items.filter(i => !i.completed);
  const boughtItemsDisplay = items.filter(i => i.completed);
  const currentSession = sessions.find(s => s.id === currentSessionId);
  const isCreator = currentSession?.createdBy === user?.uid;
  const isBuyer = currentSession?.buyerEmail && user?.email && currentSession.buyerEmail === user.email;
  

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans flex justify-center">
      <div className="w-full max-w-md bg-white shadow-2xl overflow-hidden flex flex-col h-[100dvh] relative">
        {view === 'home' && (
          <HomePage
            user={user}
            sessions={sessions}
            setCurrentSessionId={setCurrentSessionId}
            setView={setView}
            setIsSettingsOpen={setIsSettingsOpen}
            handleDeleteSession={handleDeleteSession}
            setTempName={setTempName}
            setIsCreatePopupOpen={setIsCreatePopupOpen}
            tempMarket={tempMarket}
            t={t}
            onSignOut={() => {
              localStorage.removeItem('lastView');
              localStorage.removeItem('lastSessionId');
              signOut(auth);
            }}
          />
        )}

        {view === 'shopping' && (
          <ShoppingPage
            sessions={sessions}
            currentSessionId={currentSessionId}
            setView={setView}
            handleCheckoutClick={handleCheckoutClick}
            isGeneratingPdf={isGeneratingPdf}
            activeItems={activeItems}
            isCreator={isCreator}
            isBuyer={isBuyer}
            isCheckedOut={currentSession?.isCheckedOut || false}
            handleCheckClick={handleCheckClick}
            deleteItem={deleteItem}
            currency={currency}
            t={t}
            boughtItemsDisplay={boughtItemsDisplay}
            newItemText={newItemText}
            setNewItemText={setNewItemText}
            handleAddItem={handleAddItem}
            isCheckoutModalOpen={isCheckoutModalOpen}
            setIsCheckoutModalOpen={setIsCheckoutModalOpen}
            items={items}
            unboughtItemStatuses={unboughtItemStatuses}
            setUnboughtItemStatuses={setUnboughtItemStatuses}
            handleConfirmCheckout={handleConfirmCheckout}
            itemToBuy={itemToBuy}
            setItemToBuy={setItemToBuy}
            inputPrice={inputPrice}
            setInputPrice={setInputPrice}
            confirmPrice={confirmPrice}
            isCreatePopupOpen={isCreatePopupOpen}
            setIsCreatePopupOpen={setIsCreatePopupOpen}
            tempName={tempName}
            setTempName={setTempName}
            tempMarket={tempMarket}
            setTempMarket={setTempMarket}
            tempBuyerEmail={tempBuyerEmail}
            setTempBuyerEmail={setTempBuyerEmail}
            handleCreateNew={handleCreateNew}
            markets={markets}
          />
        )}

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
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 block mb-2">Currency</label>
                <select value={currency.code} onChange={(e) => {
                  const selected = currencyOptions.find(c => c.code === e.target.value);
                  if (selected) setCurrency({ code: selected.code, symbol: selected.symbol });
                }} className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-bold">
                  {currencyOptions.map(c => <option key={c.code} value={c.code}>{c.symbol} - {c.name}</option>)}
                </select>
              </div>
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

        {isSettingsOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white w-full max-w-sm rounded-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-black text-indigo-900">Settings</h2>
                <button onClick={() => setIsSettingsOpen(false)} className="p-2 bg-gray-100 rounded-full"><X size={16}/></button>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-6">
                <button onClick={() => setLang('en')} className={`py-4 rounded-xl border-2 transition-all font-bold ${lang === 'en' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-500 border-gray-100'}`}>English</button>
                <button onClick={() => setLang('ja')} className={`py-4 rounded-xl border-2 transition-all font-bold ${lang === 'ja' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-500 border-gray-100'}`}>日本語</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}