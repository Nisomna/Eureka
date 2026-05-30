/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Phase, AppState } from './types';
import { Login } from './phases/Login';
import { Home } from './phases/Home';
import { Afinar } from './phases/Afinar';
import { Despeje } from './phases/Despeje';
import { Eureka } from './phases/Eureka';
import { Aplicacion } from './phases/Aplicacion';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { LogOut, Compass, Target, Wind, Lightbulb, PenTool, Sparkles, Check, Smile, Sun, Moon, Bell, Trash2, History, X, Trophy } from 'lucide-react';
import { InstallPrompt } from './components/InstallPrompt';
import { Intro } from './components/Intro';
import { Credits } from './components/Credits';
import { soundTransition, soundTap } from './utils/sounds';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const initialState: AppState = {
  interests: [],
  problem: '',
  definition: '',
  options: '',
  ideas: [],
  selectedIdea: null,
  plan: '',
  despejeActivities: [],
  despejeStartTime: null,
  despejeDayPlan: null,
  historicalTasks: [],
  isQuotaActive: false,
};

export default function App() {
  const [phase, setPhase] = useState<Phase>('login');
  const [state, setState] = useState<AppState>(initialState);
  const [loading, setLoading] = useState(true);
  const [showBreathingModal, setShowBreathingModal] = useState(false);
  const [breathState, setBreathState] = useState<'Inhala' | 'Retén' | 'Exhala'>('Inhala');
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch { return false; }
  });
  const [showNotificationsDrawer, setShowNotificationsDrawer] = useState(false);
  const [selectedHistoricalTask, setSelectedHistoricalTask] = useState<any | null>(null);
  const [showCredits, setShowCredits] = useState(false);
  const [showIntro, setShowIntro] = useState(() => {
    try { return !localStorage.getItem('incubapp_intro_seen'); } catch { return false; }
  });

  // Apply / remove dark class on html element
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) { root.classList.add('dark'); }
    else { root.classList.remove('dark'); }
    try { localStorage.setItem('theme', isDark ? 'dark' : 'light'); } catch {}
  }, [isDark]);

  const toggleDark = () => { soundTap(); setIsDark(d => !d); };

  useEffect(() => {
    let breathTimer: NodeJS.Timeout;
    if (showBreathingModal) {
      const cycle = () => {
        setBreathState('Inhala');
        breathTimer = setTimeout(() => {
          setBreathState('Retén');
          breathTimer = setTimeout(() => {
            setBreathState('Exhala');
            breathTimer = setTimeout(cycle, 2000);
          }, 2000);
        }, 2000);
      };
      cycle();
    }
    return () => clearTimeout(breathTimer);
  }, [showBreathingModal]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await loadUserData(user.uid);
        setPhase('home');
      } else {
        const isGuestUser = localStorage.getItem('incubapp_guest_user') === 'true';
        if (isGuestUser) {
          await loadUserData('guest');
          setPhase('home');
        } else {
          setPhase('login');
          setState(initialState);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loadUserData = async (uid: string) => {
    if (uid === 'guest') {
      const guestDataStr = localStorage.getItem('incubapp_guest_data');
      if (guestDataStr) {
        try {
          const data = JSON.parse(guestDataStr);
          setState((prev) => ({
            ...prev,
            interests: data.interests && Array.isArray(data.interests) ? data.interests : [],
            historicalTasks: data.historicalTasks && Array.isArray(data.historicalTasks) ? data.historicalTasks : [],
          }));
        } catch (err) {
          console.error("Failed to parse guest data:", err);
        }
      } else {
        setState((prev) => ({
          ...prev,
          interests: [],
          historicalTasks: [],
        }));
      }
      return;
    }
    const userRef = doc(db, 'users', uid);
    try {
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setState((prev) => ({
          ...prev,
          interests: data.interests && Array.isArray(data.interests) ? data.interests : [],
          historicalTasks: data.historicalTasks && Array.isArray(data.historicalTasks) ? data.historicalTasks : [],
        }));
      } else {
        await setDoc(userRef, {
          interests: [],
          historicalTasks: [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
    } catch (e) {
      console.warn("Firestore error, falling back seamlessly directly to local fallback storage as Guest/Offline mode for safety:", e);
      const guestDataStr = localStorage.getItem('incubapp_guest_data') || '{}';
      try {
        const data = JSON.parse(guestDataStr);
        setState((prev) => ({
          ...prev,
          interests: data.interests && Array.isArray(data.interests) ? data.interests : [],
          historicalTasks: data.historicalTasks && Array.isArray(data.historicalTasks) ? data.historicalTasks : [],
        }));
      } catch {
        // ignore
      }
    }
  };

  const syncInterests = async (newInterests: string[]) => {
    const isGuestUser = !auth.currentUser || localStorage.getItem('incubapp_guest_user') === 'true';
    if (isGuestUser) {
      const guestDataStr = localStorage.getItem('incubapp_guest_data') || '{}';
      try {
        const data = JSON.parse(guestDataStr);
        data.interests = newInterests;
        localStorage.setItem('incubapp_guest_data', JSON.stringify(data));
      } catch (err) {
        console.error(err);
      }
      return;
    }
    const uid = auth.currentUser.uid;
    const userRef = doc(db, 'users', uid);
    try {
      await updateDoc(userRef, {
        interests: newInterests,
        updatedAt: serverTimestamp()
      });
    } catch (e) {
      console.warn("Firestore sync error, saving interests locally instead:", e);
      const guestDataStr = localStorage.getItem('incubapp_guest_data') || '{}';
      try {
        const data = JSON.parse(guestDataStr);
        data.interests = newInterests;
        localStorage.setItem('incubapp_guest_data', JSON.stringify(data));
      } catch {}
    }
  };

  const syncHistoricalTasks = async (newTasks: any[]) => {
    const isGuestUser = !auth.currentUser || localStorage.getItem('incubapp_guest_user') === 'true';
    if (isGuestUser) {
      const guestDataStr = localStorage.getItem('incubapp_guest_data') || '{}';
      try {
        const data = JSON.parse(guestDataStr);
        data.historicalTasks = newTasks;
        localStorage.setItem('incubapp_guest_data', JSON.stringify(data));
      } catch (err) {
        console.error(err);
      }
      return;
    }
    const uid = auth.currentUser.uid;
    const userRef = doc(db, 'users', uid);
    try {
      await updateDoc(userRef, {
        historicalTasks: newTasks,
        updatedAt: serverTimestamp()
      });
    } catch (e) {
      console.warn("Firestore sync error, saving historical tasks locally instead:", e);
      const guestDataStr = localStorage.getItem('incubapp_guest_data') || '{}';
      try {
        const data = JSON.parse(guestDataStr);
        data.historicalTasks = newTasks;
        localStorage.setItem('incubapp_guest_data', JSON.stringify(data));
      } catch {}
    }
  };

  const updateState = (updates: Partial<AppState>) => {
    setState((prev) => {
      const next = { ...prev, ...updates };
      // Intercept updates and push to DB
      if (updates.interests) {
        syncInterests(updates.interests);
      }
      if (updates.historicalTasks) {
        syncHistoricalTasks(updates.historicalTasks);
      }
      return next;
    });
  };

  const renderPhase = () => {
    switch (phase) {
      case 'login':
        return <Login setPhase={setPhase} onLoginSuccess={loadUserData} />;
      case 'home':
        return <Home setPhase={setPhase} state={state} updateState={updateState} />;
      case 'afinar':
        return <Afinar setPhase={setPhase} state={state} updateState={updateState} />;
      case 'despeje':
        return <Despeje setPhase={setPhase} state={state} updateState={updateState} isDark={isDark} />;
      case 'eureka':
        return <Eureka setPhase={setPhase} state={state} updateState={updateState} isDark={isDark} />;
      case 'aplicacion':
        return <Aplicacion setPhase={setPhase} state={state} updateState={updateState} />;
      default:
        return <Login setPhase={setPhase} onLoginSuccess={loadUserData} />;
    }
  };

  // Helper properties to check step complete progress
  const stepCompletes = {
    home: state.interests.length > 0,
    afinar: state.problem.trim().length > 0 && state.definition.trim().length > 0,
    despeje: state.despejeActivities.length > 0 && state.despejeActivities.every(a => a.completed),
    eureka: state.ideas.length > 0,
    aplicacion: state.selectedIdea !== null && state.plan.trim().length > 0,
  };

  const navigationSteps = [
    { id: 'home' as Phase, label: 'Inicio', icon: Compass, colorClass: 'text-[var(--accent-teal)]' },
    { id: 'afinar' as Phase, label: '1. Afinar', icon: Target, colorClass: 'text-[var(--accent-gold)]' },
    { id: 'despeje' as Phase, label: '2. Despejar', icon: Wind, colorClass: 'text-calm-smoke' },
    { id: 'eureka' as Phase, label: '3. Eureka', icon: Lightbulb, colorClass: 'text-[var(--accent-action)]' },
    { id: 'aplicacion' as Phase, label: '4. Aplicar', icon: PenTool, colorClass: 'text-[var(--accent-teal)]' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--surface-card)] dark:bg-[var(--surface-base)] flex flex-col items-center justify-center space-y-4">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-[var(--border-card)] dark:border-teal-900 border-t-calm-sage-500 rounded-full animate-spin"></div>
          <div className="absolute w-8 h-8 rounded-full bg-calm-sage-200 dark:bg-teal-900/40 animate-breath"></div>
        </div>
        <p className="text-[var(--text-secondary)] dark:text-[var(--text-primary)]/60 font-medium tracking-wide">Cargando calma creativa...</p>
      </div>
    );
  }

  return (
    <>
      {showCredits && <Credits onClose={() => setShowCredits(false)} />}
      {showIntro && <Intro onDone={() => {
        try { localStorage.setItem('incubapp_intro_seen', '1'); } catch {}
        setShowIntro(false);
      }} />}
    <div className="h-screen creative-calm-backdrop text-[var(--text-primary)] dark:text-[var(--text-primary)] font-sans overflow-hidden flex flex-col relative">
      {/* Decorative Orbs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[var(--accent-mint)]/25 dark:bg-[var(--surface-card2)]/20 filter blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-calm-blush/15 dark:bg-[var(--surface-base)]/10 filter blur-3xl pointer-events-none"></div>

      {/* Header — hidden on login */}
      {(phase as string) !== 'login' && <header className="app-header py-3 md:py-4 flex items-center justify-between px-6 max-w-5xl mx-auto w-full z-10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl overflow-hidden border-2 border-[var(--accent-teal)]/30 shadow-md shrink-0 bg-[var(--accent-teal)]/8">
            <img src="/logo.svg" alt="Incubapp" className="w-full h-full object-cover p-1.5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-calm-emeraldsea to-calm-sage-700 dark:from-calm-duckegg dark:to-calm-emeraldsea bg-clip-text text-transparent serif-title">
              Incubapp
            </h1>
            <p className="text-[10px] tracking-widest text-[var(--text-secondary)]/80 dark:text-[var(--text-primary)]/40 uppercase font-semibold">Creative Calm Nest</p>
          </div>
        </div>

        {/* Floating Controls (Breathing Workspace, Theme Light/Dark, Notifications Bell, Log Out) */}
        {(auth.currentUser || localStorage.getItem('incubapp_guest_user') === 'true') && phase !== 'login' && (
          <div className="flex items-center space-x-2.5">
            <button
               onClick={() => setShowBreathingModal(true)}
               className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full border border-[var(--border-card)] dark:border-teal-900 bg-white/60 dark:bg-[var(--surface-card)]/60 hover:bg-[#D0DFF0] dark:hover:bg-[var(--surface-hover)] text-xs text-[var(--text-secondary)] dark:text-[var(--text-primary)] transition-all shadow-sm cursor-pointer"
            >
               <div className="w-2.5 h-2.5 rounded-full bg-[var(--accent-teal)] animate-pulse"></div>
               <span className="font-semibold">Espacio de Alivio</span>
            </button>

            {/* Notification Bell with Badge */}
            <button
               onClick={() => setShowNotificationsDrawer(true)}
               className="p-2.5 text-[var(--text-secondary)] dark:text-[var(--text-primary)]/65 hover:text-[var(--accent-teal)] dark:hover:text-[#90C2A0] rounded-full bg-white/50 dark:bg-[var(--surface-card)]/55 hover:bg-[#D0DFF0] dark:hover:bg-[var(--surface-hover)] border border-transparent hover:border-calm-sage-100 dark:hover:border-teal-900 transition-all shadow-sm relative cursor-pointer"
               title="Centro de Notificaciones / Planes Pendientes"
            >
               <Bell size={17} />
               {state.historicalTasks && state.historicalTasks.filter(t => !t.completed).length > 0 && (
                 <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 text-[9px] font-black text-white bg-[var(--accent-teal)] rounded-full flex items-center justify-center px-1">
                   {state.historicalTasks.filter(t => !t.completed).length}
                 </span>
               )}
            </button>

            {/* Dark / Light toggle */}
            <button
               onClick={toggleDark}
               className="p-2.5 rounded-full bg-white/50 dark:bg-[var(--surface-card)]/55 hover:bg-[#D0DFF0] dark:hover:bg-[var(--surface-hover)] border border-transparent hover:border-[var(--border-card)] dark:hover:border-teal-900/60 transition-all shadow-sm cursor-pointer text-[var(--accent-gold)] dark:text-[var(--accent-mint)]"
               title={isDark ? 'Modo claro' : 'Modo oscuro'}
            >
               {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <button
               onClick={() => setShowCredits(true)}
               className="p-2.5 text-[var(--text-secondary)] dark:text-[var(--text-primary)]/55 hover:text-[var(--accent-gold)] rounded-full bg-white/50 dark:bg-[var(--surface-card)]/55 hover:bg-[#D0DFF0] dark:hover:bg-[var(--surface-hover)] border border-transparent hover:border-[var(--border-card)] dark:hover:border-teal-900/60 transition-all shadow-sm cursor-pointer"
               title="Créditos"
            >
               <Trophy size={16} />
            </button>
            <button 
               onClick={() => {
                 localStorage.removeItem('incubapp_guest_user');
                 signOut(auth).finally(() => {
                   setPhase('login');
                   setState(initialState);
                 });
               }} 
               className="p-2.5 text-[var(--text-secondary)] dark:text-[var(--text-primary)]/55 hover:text-red-500 rounded-full bg-white/50 dark:bg-[var(--surface-card)]/55 hover:bg-[#D0DFF0] dark:hover:bg-[var(--surface-hover)] border border-transparent hover:border-[var(--border-card)] dark:hover:border-teal-900/60 transition-all shadow-sm cursor-pointer"
               title="Cerrar sesión"
            >
               <LogOut size={16} />
            </button>
          </div>
        )}
      </header>}

      {/* Main Content Area */}
      <main className="flex-1 min-h-0 max-w-lg md:max-w-2xl mx-auto w-full px-4 md:px-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={phase}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="h-full overflow-y-auto overflow-x-hidden pb-28 pt-2 px-2 md:px-6 md:pt-4"
          >
            {renderPhase()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating Bottom Navigation */}
      {(auth.currentUser || localStorage.getItem('incubapp_guest_user') === 'true') && phase !== 'login' && (
        <div className="fixed bottom-6 inset-x-0 mx-auto max-w-md w-11/12 z-40">

          {/* Nav bar: glass pill with icon + label for active, icon-only for rest */}
          <div className="bg-[var(--surface-card)] dark:bg-[var(--surface-base)]/90 backdrop-blur-2xl border border-[var(--border-card)]/70 dark:border-teal-950/80 rounded-3xl px-2 py-2 flex items-center justify-between gap-1 shadow-2xl shadow-calm-sage-300/30 dark:shadow-black/70">
            {navigationSteps.map((step) => {
              const Icon = step.icon;
              const isActive = phase === step.id;
              const isDone = stepCompletes[step.id];

              // Active color per step
              const activeColors: Record<string, string> = {
                home:       'bg-[var(--accent-teal)]/12 text-[var(--accent-teal)] border-[var(--accent-teal)]/25',
                afinar:     'bg-calm-butterscotch/15 text-[var(--accent-gold)] border-calm-butterscotch/30',
                despeje:    'bg-calm-smoke/15 text-[var(--text-secondary)] border-calm-smoke/30',
                eureka:     'bg-[var(--accent-action)]/10 text-[var(--accent-action)] border-calm-coral/25',
                aplicacion: 'bg-[var(--accent-mint)]/25 text-[var(--accent-teal)] border-[var(--accent-mint)]/30',
              };
              const dotColors: Record<string, string> = {
                home: 'bg-[var(--accent-teal)]', afinar: 'bg-calm-butterscotch',
                despeje: 'bg-calm-smoke', eureka: 'bg-calm-coral', aplicacion: 'bg-calm-duckegg',
              };

              return (
                <button
                  key={step.id}
                  onClick={() => { soundTransition(); setPhase(step.id); }}
                  className={`relative flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer select-none
                    ${isActive
                      ? `flex-1 px-3 py-2.5 rounded-2xl border font-bold text-sm ${activeColors[step.id]}`
                      : 'w-11 h-11 rounded-xl text-[var(--accent-teal)]/70 dark:text-[var(--text-primary)]/45 hover:text-[var(--text-primary)] dark:hover:text-white hover:bg-calm-sage-100/50 dark:hover:bg-[var(--surface-hover)]/40'
                    }`}
                >
                  {/* Spring-animated indicator dot on top when active */}
                  {isActive && (
                    <motion.div
                      layoutId="navDot"
                      className={`absolute -top-1.5 left-1/2 -translate-x-1/2 w-4 h-1 rounded-full ${dotColors[step.id]}`}
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}

                  <Icon size={isActive ? 17 : 20} className={`shrink-0 ${isActive ? '' : ''}`} />

                  {isActive && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="text-xs font-bold whitespace-nowrap overflow-hidden"
                    >
                      {step.label}
                    </motion.span>
                  )}

                  {/* Done dot */}
                  {isDone && !isActive && (
                    <span className={`absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full ${dotColors[step.id]}`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Breathing Guide Space Modal */}
      <AnimatePresence>
        {showBreathingModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-calm-olive/40 dark:bg-black/65 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 15 }}
              className="bg-[var(--surface-card)] dark:bg-[var(--surface-base)] p-8 rounded-[32px] border border-[var(--border-card)] dark:border-teal-900/40 shadow-2xl max-w-sm w-full text-center space-y-8 relative"
            >
              <div className="space-y-2">
                <span className="text-2xl font-serif text-[var(--text-secondary)] dark:text-[var(--accent-mint)] font-extrabold italic">Pausa Consciente</span>
                <h3 className="text-xl font-bold text-[var(--text-primary)]">
                  Sincroniza tu Respiración
                </h3>
                <p className="text-xs text-[var(--text-secondary)] dark:text-[var(--text-primary)]/75 font-medium">
                  Despeja el estrés de tu dia antes de crear o tomar acción.
                </p>
              </div>

              {/* Breathing Animation Orb */}
              <div className="flex items-center justify-center py-6">
                <div className="relative w-40 h-40 flex items-center justify-center">
                  <div className={`absolute inset-0 rounded-full bg-calm-duckegg/25 dark:bg-teal-950 border border-[var(--accent-mint)]/50 dark:border-teal-900/45 transition-all duration-[2000ms] ${
                    breathState === 'Inhala' ? 'scale-110 opacity-70' :
                    breathState === 'Retén' ? 'scale-115 opacity-80' : 'scale-90 opacity-40'
                  }`}></div>
                  <div className={`absolute w-28 h-28 rounded-full bg-calm-duckegg/40 dark:bg-teal-900/30 transition-all duration-[2000ms] ${
                    breathState === 'Inhala' ? 'scale-105' :
                    breathState === 'Retén' ? 'scale-110' : 'scale-95'
                  }`}></div>
                  <div className="absolute flex flex-col items-center justify-center text-[var(--text-secondary)] dark:text-[var(--accent-mint)] font-extrabold tracking-wider capitalize text-sm">
                    <Smile className="w-5 h-5 mb-1 text-[var(--accent-teal)] dark:text-[var(--accent-mint)]" />
                    {breathState}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowBreathingModal(false)}
                className="w-full py-3.5 bg-[var(--surface-card2)]0 hover:bg-[#2E6DA4] dark:bg-[var(--surface-card2)]0/95 dark:hover:bg-[#2E6DA4] text-white rounded-2xl font-bold text-sm transition-colors shadow-lg shadow-calm-sage-200/50 dark:shadow-none"
              >
                Volver a la calma
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Notifications Drawer / Centro de Notificaciones */}
      <AnimatePresence>
        {showNotificationsDrawer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-calm-olive/40 dark:bg-black/60 backdrop-blur-md z-50 flex justify-end p-0 sm:p-4"
          >
            {/* Click outside to close */}
            <div className="absolute inset-0" onClick={() => setShowNotificationsDrawer(false)} />

            <motion.div
              initial={{ x: '100%', opacity: 0.9 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0.9 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-[var(--surface-card)] dark:bg-[var(--surface-card)] h-full w-full sm:max-w-md shadow-2xl relative z-10 flex flex-col sm:rounded-[32px] border-l sm:border border-[var(--border-card)] dark:border-teal-900/40 overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 border-b border-calm-sage-100/60 dark:border-teal-950/40 flex items-center justify-between shrink-0">
                <div className="flex items-center space-x-2.5">
                  <div className="w-10 h-10 rounded-full bg-calm-duckegg/25 dark:bg-teal-950/40 text-[var(--accent-teal)] dark:text-[var(--accent-mint)] flex items-center justify-center">
                    <History size={18} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[var(--text-primary)] serif-title leading-tight">Planes Guardados</h3>
                    <p className="text-[10px] text-[var(--text-secondary)] dark:text-[var(--text-primary)]/40 uppercase tracking-widest font-semibold">Tus tareas de incubación</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowNotificationsDrawer(false)}
                  className="p-2.5 hover:bg-stone-100 dark:hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] dark:text-[var(--text-primary)]/75 rounded-full transition-all cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Tasks List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {!state.historicalTasks || state.historicalTasks.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4 space-y-4">
                    <div className="w-14 h-14 rounded-full bg-[var(--accent-mint)]/25 dark:bg-[var(--surface-card)]/95 text-[var(--text-secondary)] dark:text-[var(--accent-mint)] flex items-center justify-center animate-pulse">
                      <Bell size={24} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-[var(--text-primary)]">¡Bandeja Despejada!</h4>
                      <p className="text-xs text-[var(--text-secondary)] dark:text-[var(--text-primary)]/75 max-w-xs leading-relaxed">
                        No hay tareas pendientes en tus incubaciones. Completa una sesión en la fase "4. Aplicar" para almacenar aquí tu plan inteligente.
                      </p>
                    </div>
                  </div>
                ) : (
                  state.historicalTasks.map((task) => {
                    const isExpanded = selectedHistoricalTask === task.id;
                    const isSketch = task.idea.startsWith('data:image/');
                    
                    return (
                      <div
                        key={task.id}
                        className={`p-4 border rounded-2xl transition-all flex flex-col space-y-3 ${
                          task.completed
                            ? 'bg-calm-duckegg/10 dark:bg-[var(--surface-card2)]/30 border-[var(--accent-mint)]/40 dark:border-teal-950/50 opacity-75'
                            : 'bg-[var(--surface-card)] dark:bg-[var(--surface-card)] border-[var(--border-card)] dark:border-teal-950/80 shadow-sm'
                        }`}
                      >
                        {/* Task Header info */}
                        <div className="flex items-start justify-between gap-3">
                          <button
                            onClick={() => {
                              const updated = state.historicalTasks.map(t => 
                                t.id === task.id ? { ...t, completed: !t.completed } : t
                              );
                              updateState({ historicalTasks: updated });
                            }}
                            className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all shrink-0 mt-0.5 cursor-pointer ${
                              task.completed
                                ? 'bg-[var(--accent-teal)] border-[var(--accent-teal)] text-white'
                                : 'border-[var(--border-card)] dark:border-teal-900 bg-white/50 dark:bg-[var(--surface-card)]/45 hover:bg-[var(--accent-mint)]/25 dark:hover:bg-[#1D2E22]'
                            }`}
                            title={task.completed ? "Marcar como pendiente" : "Marcar como completado/resuelto"}
                          >
                            {task.completed && <Check size={14} className="stroke-[2.5]" />}
                          </button>

                          <div className="flex-1 min-w-0">
                            <h5 className={`text-xs font-bold text-[var(--text-primary)] dark:text-[var(--text-primary)] leading-relaxed ${task.completed ? 'line-through text-[var(--text-secondary)] dark:text-[var(--text-primary)]/60' : ''}`}>
                              {task.problem}
                            </h5>
                            <span className="text-[9px] text-[var(--text-secondary)] dark:text-[var(--text-primary)]/60 block mt-0.5">
                              Creado: {task.date}
                            </span>
                          </div>

                          <button
                            onClick={() => {
                              const updated = state.historicalTasks.filter(t => t.id !== task.id);
                              updateState({ historicalTasks: updated });
                            }}
                            className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-stone-400 hover:text-rose-600 rounded-full transition-all cursor-pointer"
                            title="Eliminar registro"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>

                        {/* Interactive plan toggler details */}
                        <div>
                          <button
                            onClick={() => setSelectedHistoricalTask(isExpanded ? null : task.id)}
                            className="text-[10px] font-bold text-[var(--accent-teal)] hover:text-[var(--text-secondary)] dark:text-[var(--accent-mint)] uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                          >
                            <span>{isExpanded ? 'Ocultar Plan' : 'Ver Plan de Acción'}</span>
                          </button>

                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-3 p-3 bg-stone-50 dark:bg-[#141C18] rounded-xl border border-stone-150/40 dark:border-teal-900/30 text-xs space-y-2.5"
                            >
                              <div className="space-y-1">
                                <span className="text-[9px] uppercase font-bold text-[var(--accent-teal)] dark:text-[var(--accent-mint)] tracking-wider">La Mejor Idea:</span>
                                {isSketch ? (
                                  <div className="p-1 bg-white dark:bg-[var(--surface-card)]/50 border border-[var(--border-card)] dark:border-teal-900/40 rounded-lg inline-block">
                                    <img 
                                      src={task.idea} 
                                      alt="Boceto guardado" 
                                      className="max-h-24 max-w-sm rounded object-contain"
                                      referrerPolicy="no-referrer"
                                    />
                                  </div>
                                ) : (
                                  <p className="font-semibold text-[var(--text-primary)] dark:text-[var(--text-primary)] italic">{task.idea}</p>
                                )}
                              </div>
                              <div className="space-y-1">
                                <span className="text-[9px] uppercase font-bold text-[var(--accent-teal)] dark:text-[var(--accent-mint)] tracking-wider font-semibold">Pasos de Acción:</span>
                                <p className="text-[var(--text-secondary)] dark:text-[var(--text-primary)]/80 font-medium whitespace-pre-wrap leading-relaxed">
                                  {task.plan}
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <InstallPrompt />
    </div>
    </>
  );
}