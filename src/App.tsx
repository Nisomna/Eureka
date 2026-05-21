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
import { LogOut, Compass, Target, Wind, Lightbulb, PenTool, Sparkles, Check, Smile, Sun, Moon, Bell, Trash2, History, X } from 'lucide-react';
import { InstallPrompt } from './components/InstallPrompt';

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
};

export default function App() {
  const [phase, setPhase] = useState<Phase>('login');
  const [state, setState] = useState<AppState>(initialState);
  const [loading, setLoading] = useState(true);
  const [showBreathingModal, setShowBreathingModal] = useState(false);
  const [breathState, setBreathState] = useState<'Inhala' | 'Retén' | 'Exhala'>('Inhala');
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark';
  });
  const [showNotificationsDrawer, setShowNotificationsDrawer] = useState(false);
  const [selectedHistoricalTask, setSelectedHistoricalTask] = useState<any | null>(null);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

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
        setPhase('login');
        setState(initialState);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loadUserData = async (uid: string) => {
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
      handleFirestoreError(e, OperationType.WRITE, `users/${uid}`);
    }
  };

  const syncInterests = async (newInterests: string[]) => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const userRef = doc(db, 'users', uid);
    try {
      await updateDoc(userRef, {
        interests: newInterests,
        updatedAt: serverTimestamp()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `users/${uid}`);
    }
  };

  const syncHistoricalTasks = async (newTasks: any[]) => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const userRef = doc(db, 'users', uid);
    try {
      await updateDoc(userRef, {
        historicalTasks: newTasks,
        updatedAt: serverTimestamp()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `users/${uid}`);
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
    { id: 'home' as Phase, label: 'Inicio', icon: Compass, colorClass: 'text-emerald-500' },
    { id: 'afinar' as Phase, label: '1. Afinar', icon: Target, colorClass: 'text-amber-500' },
    { id: 'despeje' as Phase, label: '2. Despejar', icon: Wind, colorClass: 'text-indigo-500' },
    { id: 'eureka' as Phase, label: '3. Eureka', icon: Lightbulb, colorClass: 'text-teal-500' },
    { id: 'aplicacion' as Phase, label: '4. Aplicar', icon: PenTool, colorClass: 'text-purple-500' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fbfaf7] dark:bg-[#111A16] flex flex-col items-center justify-center space-y-4">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-calm-sage-200 dark:border-teal-900 border-t-calm-sage-500 rounded-full animate-spin"></div>
          <div className="absolute w-8 h-8 rounded-full bg-calm-sage-200 dark:bg-teal-900/40 animate-breath"></div>
        </div>
        <p className="text-calm-olive/60 dark:text-[#EBECEB]/60 font-medium tracking-wide">Cargando calma creativa...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen creative-calm-backdrop text-calm-olive dark:text-[#E6EAE7] font-sans overflow-hidden flex flex-col relative">
      {/* Decorative Orbs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-emerald-100/35 filter blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-amber-100/35 filter blur-3xl pointer-events-none"></div>

      {/* Header */}
      <header className="py-4 md:py-6 flex items-center justify-between border-b border-calm-sage-100/60 dark:border-teal-950 px-6 max-w-5xl mx-auto w-full z-10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-teal-50 dark:bg-teal-950 border border-teal-100/80 dark:border-teal-900 flex items-center justify-center shadow-sm">
            <Sparkles className="text-teal-600 dark:text-teal-400 w-5 h-5 animate-float" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-teal-700 to-emerald-700 dark:from-teal-400 dark:to-emerald-450 bg-clip-text text-transparent serif-title">
              Incubapp
            </h1>
            <p className="text-[10px] tracking-widest text-calm-sage-600/80 dark:text-[#EBECEB]/40 uppercase font-semibold">Creative Calm Nest</p>
          </div>
        </div>

        {/* Floating Controls (Breathing Workspace, Theme Light/Dark, Notifications Bell, Log Out) */}
        {auth.currentUser && phase !== 'login' && (
          <div className="flex items-center space-x-2.5">
            <button
              onClick={() => setShowBreathingModal(true)}
              className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full border border-calm-sage-200 dark:border-teal-900 bg-white/60 dark:bg-[#1C2621]/60 hover:bg-white dark:hover:bg-[#1C2621] text-xs text-calm-sage-700 dark:text-[#EBECEB] transition-all shadow-sm cursor-pointer"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse"></div>
              <span className="font-semibold">Espacio de Alivio</span>
            </button>

            {/* Dark/Light mode toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2.5 text-calm-sage-600 dark:text-[#EBECEB]/65 hover:text-teal-600 dark:hover:text-teal-400 rounded-full bg-white/50 dark:bg-[#18221D]/55 hover:bg-white dark:hover:bg-[#1C2621] border border-transparent hover:border-calm-sage-100 dark:hover:border-teal-900 transition-all shadow-sm cursor-pointer"
              title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            >
              {isDark ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {/* Notification Bell with Badge */}
            <button
              onClick={() => setShowNotificationsDrawer(true)}
              className="p-2.5 text-calm-sage-600 dark:text-[#EBECEB]/65 hover:text-teal-650 dark:hover:text-[#90C2A0] rounded-full bg-white/50 dark:bg-[#18221D]/55 hover:bg-white dark:hover:bg-[#1C2621] border border-transparent hover:border-calm-sage-100 dark:hover:border-teal-900 transition-all shadow-sm relative cursor-pointer"
              title="Centro de Notificaciones / Planes Pendientes"
            >
              <Bell size={17} />
              {state.historicalTasks && state.historicalTasks.filter(t => !t.completed).length > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 text-[9px] font-black text-white bg-indigo-500 rounded-full flex items-center justify-center px-1">
                  {state.historicalTasks.filter(t => !t.completed).length}
                </span>
              )}
            </button>

            <button 
              onClick={() => signOut(auth)} 
              className="p-2.5 text-calm-sage-600 dark:text-[#EBECEB]/55 hover:text-red-500 rounded-full bg-white/50 dark:bg-[#18221D]/55 hover:bg-white dark:hover:bg-[#1C2621] border border-transparent hover:border-calm-sage-200 dark:hover:border-teal-900/60 transition-all shadow-sm cursor-pointer"
              title="Cerrar sesión"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden max-w-lg md:max-w-2xl mx-auto w-full px-4 md:px-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={phase}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="absolute inset-x-0 top-0 bottom-24 p-2 md:p-6 overflow-hidden h-full"
          >
            <div className="h-full scroll-smooth">
              {renderPhase()}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating Bottom Navigation (Menu Interactivo por Iconos) */}
      {auth.currentUser && phase !== 'login' && (
        <div className="fixed bottom-6 inset-x-0 mx-auto max-w-md w-11/12 z-40">
          <div className="bg-white/80 dark:bg-[#1E2B25]/85 backdrop-blur-xl border border-calm-sage-100 dark:border-teal-950 rounded-full p-2 flex items-center justify-around shadow-xl shadow-calm-sage-200/40 dark:shadow-black/50">
            {navigationSteps.map((step) => {
              const Icon = step.icon;
              const isActive = phase === step.id;
              const isDone = stepCompletes[step.id];

              return (
                <button
                  key={step.id}
                  onClick={() => setPhase(step.id)}
                  className={`relative flex flex-col items-center justify-center p-3 rounded-full transition-all group cursor-pointer ${
                    isActive
                      ? `scale-110 bg-calm-sage-100 dark:bg-teal-950 text-calm-sage-700 dark:text-teal-300 shadow-md`
                      : 'text-calm-sage-600/70 dark:text-[#EBECEB]/65 hover:text-calm-olive dark:hover:text-white hover:bg-calm-sage-50/50 dark:hover:bg-teal-950/40'
                  }`}
                >
                  {/* Glowing line indicators */}
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute -top-1 w-6 h-1 rounded-full bg-teal-600 dark:bg-teal-450"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}

                  {/* Icon */}
                  <Icon size={20} className="transition-transform group-hover:scale-110" />

                  {/* Micro-dot for step complete configuration */}
                  {isDone && (
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#1E2B25]"></span>
                  )}

                  {/* Subtle Tooltip Label */}
                  <span className="absolute -bottom-7 scale-0 group-hover:scale-100 transition-all text-[10px] bg-calm-olive dark:bg-[#131d18] text-white px-2 py-0.5 rounded-full whitespace-nowrap opacity-90 font-medium">
                    {step.label}
                  </span>
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
              className="bg-[#fbfaf7] dark:bg-[#17221D] p-8 rounded-[32px] border border-calm-sage-100 dark:border-teal-900/60 shadow-2xl max-w-sm w-full text-center space-y-8 relative"
            >
              <div className="space-y-2">
                <span className="text-2xl font-serif text-calm-sage-600 dark:text-teal-400 italic">Pausa Consciente</span>
                <h3 className="text-xl font-bold text-calm-olive dark:text-white">
                  Sincroniza tu Respiración
                </h3>
                <p className="text-xs text-calm-olive/60 dark:text-[#EBECEB]/60">
                  Despeja el estrés de tu dia antes de crear o tomar acción.
                </p>
              </div>

              {/* Breathing Animation Orb */}
              <div className="flex items-center justify-center py-6">
                <div className="relative w-40 h-40 flex items-center justify-center">
                  <div className={`absolute inset-0 rounded-full bg-teal-100 dark:bg-teal-950 border border-teal-200/50 dark:border-teal-900/45 transition-all duration-[2000ms] ${
                    breathState === 'Inhala' ? 'scale-110 opacity-70' :
                    breathState === 'Retén' ? 'scale-115 opacity-80' : 'scale-90 opacity-40'
                  }`}></div>
                  <div className={`absolute w-28 h-28 rounded-full bg-teal-300/40 dark:bg-teal-900/30 transition-all duration-[2000ms] ${
                    breathState === 'Inhala' ? 'scale-105' :
                    breathState === 'Retén' ? 'scale-110' : 'scale-95'
                  }`}></div>
                  <div className="absolute flex flex-col items-center justify-center text-teal-800 dark:text-teal-250 font-bold tracking-wider capitalize text-sm">
                    <Smile className="w-5 h-5 mb-1 text-teal-600 dark:text-teal-450" />
                    {breathState}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowBreathingModal(false)}
                className="w-full py-3.5 bg-calm-sage-500 hover:bg-calm-sage-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm transition-colors shadow-lg shadow-calm-sage-200 dark:shadow-emerald-950/20"
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
              className="bg-[#fbfaf7] dark:bg-[#151E1A] h-full w-full sm:max-w-md shadow-2xl relative z-10 flex flex-col sm:rounded-[32px] border-l sm:border border-calm-sage-100 dark:border-teal-900/60 overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 border-b border-calm-sage-100/60 dark:border-teal-950 flex items-center justify-between shrink-0">
                <div className="flex items-center space-x-2.5">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <History size={18} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-calm-olive dark:text-white serif-title leading-tight">Planes Guardados</h3>
                    <p className="text-[10px] text-calm-sage-600 dark:text-[#EBECEB]/40 uppercase tracking-widest font-semibold">Tus tareas de incubación</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowNotificationsDrawer(false)}
                  className="p-2.5 hover:bg-stone-100 dark:hover:bg-[#1C2621] text-calm-sage-600 dark:text-[#EBECEB]/50 rounded-full transition-all cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Tasks List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {!state.historicalTasks || state.historicalTasks.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4 space-y-4">
                    <div className="w-14 h-14 rounded-full bg-stone-100 dark:bg-[#1C2621] text-stone-350 dark:text-teal-900 flex items-center justify-center animate-pulse">
                      <Bell size={24} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-calm-olive dark:text-white">¡Bandeja Despejada!</h4>
                      <p className="text-xs text-calm-olive/50 dark:text-[#EBECEB]/40 max-w-xs leading-relaxed">
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
                            ? 'bg-emerald-50/20 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-950/30 opacity-75'
                            : 'bg-white dark:bg-[#18221D] border-calm-sage-100 dark:border-teal-950/80 shadow-sm'
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
                                ? 'bg-emerald-500 border-emerald-500 text-white'
                                : 'border-stone-250 dark:border-teal-900 bg-white/50 dark:bg-[#1C2621]/45 hover:bg-emerald-50 dark:hover:bg-emerald-950'
                            }`}
                            title={task.completed ? "Marcar como pendiente" : "Marcar como completado/resuelto"}
                          >
                            {task.completed && <Check size={14} className="stroke-[2.5]" />}
                          </button>

                          <div className="flex-1 min-w-0">
                            <h5 className={`text-xs font-bold text-calm-olive dark:text-white leading-relaxed ${task.completed ? 'line-through text-calm-olive/50 dark:text-[#EBECEB]/40' : ''}`}>
                              {task.problem}
                            </h5>
                            <span className="text-[9px] text-calm-olive/40 dark:text-[#EBECEB]/35 block mt-0.5">
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
                            className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                          >
                            <span>{isExpanded ? 'Ocultar Plan' : 'Ver Plan de Acción'}</span>
                          </button>

                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-3 p-3 bg-stone-50 dark:bg-[#141C18] rounded-xl border border-stone-150/40 dark:border-teal-950 text-xs space-y-2.5"
                            >
                              <div className="space-y-1">
                                <span className="text-[9px] uppercase font-bold text-indigo-500 tracking-wider">La Mejor Idea:</span>
                                {isSketch ? (
                                  <div className="p-1 bg-white dark:bg-[#1C2621]/50 border border-stone-200 dark:border-teal-900 rounded-lg inline-block">
                                    <img 
                                      src={task.idea} 
                                      alt="Boceto guardado" 
                                      className="max-h-24 max-w-sm rounded object-contain"
                                      referrerPolicy="no-referrer"
                                    />
                                  </div>
                                ) : (
                                  <p className="font-semibold text-calm-olive dark:text-[#EBECEB] italic">{task.idea}</p>
                                )}
                              </div>
                              <div className="space-y-1">
                                <span className="text-[9px] uppercase font-bold text-indigo-500 tracking-wider font-semibold">Pasos de Acción:</span>
                                <p className="text-calm-olive/80 dark:text-[#EBECEB]/80 font-medium whitespace-pre-wrap leading-relaxed">
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
  );
}

