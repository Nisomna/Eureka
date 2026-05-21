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
import { LogOut, Compass, Target, Wind, Lightbulb, PenTool, Sparkles, Check, Smile } from 'lucide-react';
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
};

export default function App() {
  const [phase, setPhase] = useState<Phase>('login');
  const [state, setState] = useState<AppState>(initialState);
  const [loading, setLoading] = useState(true);
  const [showBreathingModal, setShowBreathingModal] = useState(false);
  const [breathState, setBreathState] = useState<'Inhala' | 'Retén' | 'Exhala'>('Inhala');

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
        if (data.interests && Array.isArray(data.interests)) {
          setState((prev) => ({ ...prev, interests: data.interests }));
        }
      } else {
        await setDoc(userRef, {
          interests: [],
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

  const updateState = (updates: Partial<AppState>) => {
    setState((prev) => {
      const next = { ...prev, ...updates };
      // Intercept interests update and push to DB
      if (updates.interests) {
        syncInterests(updates.interests);
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
        return <Despeje setPhase={setPhase} state={state} updateState={updateState} />;
      case 'eureka':
        return <Eureka setPhase={setPhase} state={state} updateState={updateState} />;
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
      <div className="min-h-screen bg-[#fbfaf7] flex flex-col items-center justify-center space-y-4">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-calm-sage-200 border-t-calm-sage-500 rounded-full animate-spin"></div>
          <div className="absolute w-8 h-8 rounded-full bg-calm-sage-200 animate-breath"></div>
        </div>
        <p className="text-calm-olive/60 font-medium tracking-wide">Cargando calma creativa...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen creative-calm-backdrop text-calm-olive font-sans overflow-hidden flex flex-col relative">
      {/* Decorative Orbs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-emerald-100/35 filter blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-amber-100/35 filter blur-3xl pointer-events-none"></div>

      {/* Header */}
      <header className="py-4 md:py-6 flex items-center justify-between border-b border-calm-sage-100/60 z-10 px-6 max-w-5xl mx-auto w-full">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-teal-50 border border-teal-100/80 flex items-center justify-center shadow-sm">
            <Sparkles className="text-teal-600 w-5 h-5 animate-float" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-teal-700 to-emerald-700 bg-clip-text text-transparent serif-title">
              Incubapp
            </h1>
            <p className="text-[10px] tracking-widest text-calm-sage-600/80 uppercase font-semibold">Creative Calm Nest</p>
          </div>
        </div>

        {/* Floating Quick Breathing Space Widget */}
        {auth.currentUser && phase !== 'login' && (
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowBreathingModal(true)}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-full border border-calm-sage-200 bg-white/60 hover:bg-white text-xs text-calm-sage-700 hover:text-calm-sage-900 transition-all shadow-sm"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse"></div>
              <span className="font-semibold">Espacio de Alivio</span>
            </button>

            <button 
              onClick={() => signOut(auth)} 
              className="p-2.5 text-calm-sage-600 hover:text-red-500 rounded-full hover:bg-white/80 border border-transparent hover:border-calm-sage-200 transition-all shadow-sm"
              title="Cerrar sesión"
            >
              <LogOut size={18} />
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
          <div className="bg-white/80 backdrop-blur-xl border border-calm-sage-100 rounded-full p-2 flex items-center justify-around shadow-xl shadow-calm-sage-200/40">
            {navigationSteps.map((step) => {
              const Icon = step.icon;
              const isActive = phase === step.id;
              const isDone = stepCompletes[step.id];

              return (
                <button
                  key={step.id}
                  onClick={() => setPhase(step.id)}
                  className={`relative flex flex-col items-center justify-center p-3 rounded-full transition-all group ${
                    isActive
                      ? `scale-110 bg-calm-sage-100 text-calm-sage-700 shadow-md`
                      : 'text-calm-sage-600/70 hover:text-calm-olive hover:bg-calm-sage-50/50'
                  }`}
                >
                  {/* Glowing line indicators */}
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute -top-1 w-6 h-1 rounded-full bg-teal-600"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}

                  {/* Icon */}
                  <Icon size={20} className="transition-transform group-hover:scale-110" />

                  {/* Micro-dot for step complete configuration */}
                  {isDone && (
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white"></span>
                  )}

                  {/* Subtle Tooltip Label */}
                  <span className="absolute -bottom-7 scale-0 group-hover:scale-100 transition-all text-[10px] bg-calm-olive text-white px-2 py-0.5 rounded-full whitespace-nowrap opacity-90 font-medium">
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
            className="fixed inset-0 bg-calm-olive/40 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 15 }}
              className="bg-[#fbfaf7] p-8 rounded-[32px] border border-calm-sage-100 shadow-2xl max-w-sm w-full text-center space-y-8 relative"
            >
              <div className="space-y-2">
                <span className="text-2xl font-serif text-calm-sage-600 italic">Pausa Consciente</span>
                <h3 className="text-xl font-bold text-calm-olive">
                  Sincroniza tu Respiración
                </h3>
                <p className="text-xs text-calm-olive/60">
                  Despeja el estrés de tu dia antes de crear o tomar acción.
                </p>
              </div>

              {/* Breathing Animation Orb */}
              <div className="flex items-center justify-center py-6">
                <div className="relative w-40 h-40 flex items-center justify-center">
                  <div className={`absolute inset-0 rounded-full bg-teal-100 border border-teal-200/50 transition-all duration-[2000ms] ${
                    breathState === 'Inhala' ? 'scale-110 opacity-70' :
                    breathState === 'Retén' ? 'scale-115 opacity-80' : 'scale-90 opacity-40'
                  }`}></div>
                  <div className={`absolute w-28 h-28 rounded-full bg-teal-300/40 transition-all duration-[2000ms] ${
                    breathState === 'Inhala' ? 'scale-105' :
                    breathState === 'Retén' ? 'scale-110' : 'scale-95'
                  }`}></div>
                  <div className="absolute flex flex-col items-center justify-center text-teal-800 font-bold tracking-wider capitalize text-sm">
                    <Smile className="w-5 h-5 mb-1 text-teal-600" />
                    {breathState}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowBreathingModal(false)}
                className="w-full py-3.5 bg-calm-sage-500 hover:bg-calm-sage-600 text-white rounded-2xl font-bold text-sm transition-colors shadow-lg shadow-calm-sage-200"
              >
                Volver a la calma
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <InstallPrompt />
    </div>
  );
}

