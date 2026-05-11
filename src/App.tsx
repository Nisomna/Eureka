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
import { LogOut } from 'lucide-react';
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
      // Use WRITE type since it could be getDoc or setDoc failing
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden flex flex-col">
      {/* Header */}
      <header className="p-4 flex items-center justify-between bg-white shadow-sm z-10 px-6">
        <h1 className="text-xl font-bold bg-gradient-to-r from-teal-500 to-emerald-500 bg-clip-text text-transparent">
          Incubapp
        </h1>
        {auth.currentUser && phase !== 'login' && (
          <button 
            onClick={() => signOut(auth)} 
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          >
            <LogOut size={20} />
          </button>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={phase}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 p-4 md:p-8 max-w-md mx-auto w-full h-full"
          >
            {renderPhase()}
          </motion.div>
        </AnimatePresence>
      </main>
      <InstallPrompt />
    </div>
  );
}

