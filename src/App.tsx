import React, { useState, useEffect, useCallback } from 'react';
import { Phase, AppState } from './types';
import { auth } from './firebase';
import { signOut } from 'firebase/auth';
import { LogOut, Compass, Target, Wind, Lightbulb, PenTool, Sun, Moon, Bell, Trash2, History, X, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Login } from './phases/Login';
import { Home } from './phases/Home';
import { Afinar } from './phases/Afinar';
import { Despeje } from './phases/Despeje';
import { Eureka } from './phases/Eureka';
import { Aplicacion } from './phases/Aplicacion';
import { InstallPrompt } from './components/InstallPrompt';
import { Credits } from './components/Credits';
import { Intro } from './components/Intro';
import { soundTransition, soundTap } from './utils/sounds';

const INITIAL_STATE: AppState = {
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
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const [userId, setUserId] = useState<string | null>(null);
  const [showBreathingModal, setShowBreathingModal] = useState(false);
  const [showNotificationsDrawer, setShowNotificationsDrawer] = useState(false);
  const [selectedHistoricalTask, setSelectedHistoricalTask] = useState<any | null>(null);
  const [showCredits, setShowCredits] = useState(false);
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch { return false; }
  });
  const [showIntro, setShowIntro] = useState(() => {
    try { return !localStorage.getItem('incubapp_intro_seen'); } catch { return false; }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) root.classList.add('dark');
    else root.classList.remove('dark');
    try { localStorage.setItem('theme', isDark ? 'dark' : 'light'); } catch {}
  }, [isDark]);

  const toggleDark = () => { soundTap(); setIsDark(d => !d); };

  const updateState = useCallback((updates: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Load from Firestore
  useEffect(() => {
    if (!userId || userId === 'guest') return;
    const load = async () => {
      try {
        const ref = doc(db, 'users', userId);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data() as Partial<AppState>;
          setState(prev => ({ ...prev, ...data }));
        }
      } catch {}
    };
    load();
  }, [userId]);

  // Save to Firestore
  useEffect(() => {
    if (!userId || userId === 'guest') return;
    const save = async () => {
      try {
        const ref = doc(db, 'users', userId);
        await setDoc(ref, state, { merge: true });
      } catch {}
    };
    const t = setTimeout(save, 1500);
    return () => clearTimeout(t);
  }, [state, userId]);

  const handleLoginSuccess = (uid: string) => {
    setUserId(uid);
    setPhase('home');
  };

  const handleReset = () => {
    // Save current task to history before reset
    if (state.problem && state.selectedIdea) {
      const task = {
        id: Date.now().toString(),
        problem: state.problem,
        idea: state.selectedIdea,
        plan: state.plan,
        date: new Date().toLocaleDateString('es-CO'),
        completed: true,
      };
      updateState({
        ...INITIAL_STATE,
        historicalTasks: [task, ...state.historicalTasks],
      });
    } else {
      updateState(INITIAL_STATE);
    }
    setPhase('home');
  };

  const renderPhase = () => {
    switch (phase) {
      case 'login':
        return <Login setPhase={setPhase} onLoginSuccess={handleLoginSuccess} isDark={isDark} />;
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
        return <Home setPhase={setPhase} state={state} updateState={updateState} />;
    }
  };

  const navigationSteps = [
    { id: 'home' as Phase,       label: 'Inicio',    icon: Compass  },
    { id: 'afinar' as Phase,     label: '1. Afinar', icon: Target   },
    { id: 'despeje' as Phase,    label: '2. Despeje',icon: Wind     },
    { id: 'eureka' as Phase,     label: '3. Eureka', icon: Lightbulb},
    { id: 'aplicacion' as Phase, label: '4. Aplicar',icon: PenTool  },
  ];

  const stepCompletes: Record<string, boolean> = {
    home:       false,
    afinar:     !!state.problem,
    despeje:    state.despejeActivities.some(a => a.completed),
    eureka:     state.ideas.length > 0,
    aplicacion: !!state.selectedIdea,
  };

  const isLoggedIn = !!(auth.currentUser || localStorage.getItem('incubapp_guest_user') === 'true');

  return (
    <>
      {showCredits && <Credits onClose={() => setShowCredits(false)} />}
      {showIntro && <Intro onDone={() => {
        try { localStorage.setItem('incubapp_intro_seen', '1'); } catch {}
        setShowIntro(false);
      }} />}

    <div className="h-screen creative-calm-backdrop font-sans overflow-hidden flex flex-col relative">
      {/* Decorative orbs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[#2AAFA8]/10 filter blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-[#1E3A8A]/8 filter blur-3xl pointer-events-none" />

      {/* Header — hidden on login */}
      {(phase as string) !== 'login' && (
        <header className="app-header py-3 md:py-4 flex items-center justify-between px-5 max-w-5xl mx-auto w-full z-10 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#2AAFA8]/50 shadow-md shrink-0">
              <img src={isDark ? "/logo.svg" : "/logo-light.svg"} alt="Incubapp" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-[#12164A] dark:text-[var(--text-primary)] serif-title">
                Incubapp
              </h1>
              <p className="text-[10px] tracking-widest text-[#2E6DA4] dark:text-[var(--text-muted)] uppercase font-semibold">
                Creative Calm Nest
              </p>
            </div>
          </div>

          {isLoggedIn && (
            <div className="flex items-center space-x-2">
              {/* Dark/Light toggle */}
              <button onClick={toggleDark}
                className="p-2.5 rounded-full bg-[#E8EEF6] dark:bg-[var(--surface-card)]/60 hover:bg-[#D0DFF0] dark:hover:bg-[var(--surface-hover)] border border-[#D0DFF0] dark:border-transparent transition-all shadow-sm cursor-pointer text-[#2E6DA4] dark:text-[#2AAFA8]"
                title={isDark ? 'Modo claro' : 'Modo oscuro'}>
                {isDark ? <Sun size={16} /> : <Moon size={16} />}
              </button>

              {/* Notifications */}
              <button onClick={() => setShowNotificationsDrawer(v => !v)}
                className="p-2.5 rounded-full bg-[#E8EEF6] dark:bg-[var(--surface-card)]/60 hover:bg-[#D0DFF0] dark:hover:bg-[var(--surface-hover)] border border-[#D0DFF0] dark:border-transparent transition-all shadow-sm cursor-pointer text-[#2E6DA4] dark:text-[var(--text-secondary)]"
                title="Historial">
                <History size={16} />
              </button>

              {/* Credits */}
              <button onClick={() => setShowCredits(true)}
                className="p-2.5 rounded-full bg-[#E8EEF6] dark:bg-[var(--surface-card)]/60 hover:bg-[#D0DFF0] dark:hover:bg-[var(--surface-hover)] border border-[#D0DFF0] dark:border-transparent transition-all shadow-sm cursor-pointer text-[#2E6DA4] dark:text-[var(--text-secondary)]"
                title="Créditos">
                <Trophy size={16} />
              </button>

              {/* Logout */}
              <button onClick={async () => {
                  soundTap();
                  try { await signOut(auth); } catch {}
                  localStorage.removeItem('incubapp_guest_user');
                  setState(INITIAL_STATE);
                  setUserId(null);
                  setPhase('login');
                }}
                className="p-2.5 rounded-full bg-[#E8EEF6] dark:bg-[var(--surface-card)]/60 hover:bg-red-50 dark:hover:bg-red-950/30 border border-[#D0DFF0] dark:border-transparent transition-all shadow-sm cursor-pointer text-[#2E6DA4] hover:text-red-500 dark:text-[var(--text-secondary)]"
                title="Cerrar sesión">
                <LogOut size={16} />
              </button>
            </div>
          )}
        </header>
      )}

      {/* Main content */}
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

      {/* Bottom Nav — only when logged in and not on login */}
      {isLoggedIn && (phase as string) !== 'login' && (
        <div className="fixed bottom-5 inset-x-0 mx-auto max-w-md w-11/12 z-40">
          <div className="app-nav rounded-3xl px-2 py-2 flex items-center justify-between gap-1">
            {navigationSteps.map((step) => {
              const Icon = step.icon;
              const isActive = phase === step.id;
              const isDone = stepCompletes[step.id];

              const activeColors: Record<string, string> = {
                home:       'bg-[#12164A]/10 text-[#12164A] dark:bg-[#2AAFA8]/20 dark:text-[#2AAFA8] border-[#12164A]/15 dark:border-[#2AAFA8]/30',
                afinar:     'bg-[#1E3A8A]/10 text-[#1E3A8A] dark:bg-[#2E6DA4]/20 dark:text-[#A0BDD8] border-[#1E3A8A]/20 dark:border-[#2E6DA4]/30',
                despeje:    'bg-[#2E6DA4]/10 text-[#2E6DA4] dark:bg-[#2E6DA4]/20 dark:text-[#A0BDD8] border-[#2E6DA4]/20 dark:border-[#2E6DA4]/30',
                eureka:     'bg-[#2AAFA8]/10 text-[#0D7A76] dark:bg-[#2AAFA8]/20 dark:text-[#2AAFA8] border-[#2AAFA8]/20 dark:border-[#2AAFA8]/30',
                aplicacion: 'bg-[#2AAFA8]/10 text-[#0D7A76] dark:bg-[#2AAFA8]/20 dark:text-[#2AAFA8] border-[#2AAFA8]/20 dark:border-[#2AAFA8]/30',
              };
              const dotColors: Record<string, string> = {
                home: 'bg-[#12164A] dark:bg-[#2AAFA8]',
                afinar: 'bg-[#1E3A8A] dark:bg-[#A0BDD8]',
                despeje: 'bg-[#2E6DA4] dark:bg-[#A0BDD8]',
                eureka: 'bg-[#2AAFA8] dark:bg-[#2AAFA8]',
                aplicacion: 'bg-[#2AAFA8] dark:bg-[#2AAFA8]',
              };

              return (
                <button
                  key={step.id}
                  onClick={() => { soundTransition(); setPhase(step.id); }}
                  className={`relative flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer select-none
                    ${isActive
                      ? `flex-1 px-3 py-2.5 rounded-2xl border font-bold text-sm ${activeColors[step.id]}`
                      : 'w-11 h-11 rounded-xl text-[#5A7A9A] dark:text-[#5A7A9A] hover:text-[#12164A] dark:hover:text-[#2AAFA8] hover:bg-[#E8EEF6] dark:hover:bg-[#1A2568]'
                    }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="navDot"
                      className={`absolute -top-1.5 left-1/2 -translate-x-1/2 w-4 h-1 rounded-full ${dotColors[step.id]}`}
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  <Icon size={isActive ? 17 : 20} className="shrink-0" />
                  {isActive && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      className="text-xs font-bold whitespace-nowrap overflow-hidden"
                    >
                      {step.label}
                    </motion.span>
                  )}
                  {isDone && !isActive && (
                    <span className={`absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full ${dotColors[step.id]}`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Historial drawer */}
      <AnimatePresence>
        {showNotificationsDrawer && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="fixed bottom-24 inset-x-0 mx-auto max-w-md w-11/12 z-50 bg-[var(--surface-card)] dark:bg-[var(--surface-card2)] border border-[var(--border-card)] rounded-3xl shadow-2xl p-5 max-h-[60vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[var(--text-primary)] text-sm">Tareas completadas</h3>
              <button onClick={() => setShowNotificationsDrawer(false)} className="p-1 rounded-full hover:bg-[var(--surface-hover)] cursor-pointer">
                <X size={16} className="text-[var(--text-muted)]" />
              </button>
            </div>
            {state.historicalTasks.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)] text-center py-4">Sin tareas completadas aún.</p>
            ) : (
              <div className="space-y-2">
                {state.historicalTasks.map(task => (
                  <div key={task.id} className="p-3 bg-[var(--surface-base)] dark:bg-[var(--surface-card)] rounded-xl border border-[var(--border-card)]">
                    <p className="text-xs font-bold text-[var(--text-primary)] truncate">{task.problem}</p>
                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{task.date}</p>
                  </div>
                ))}
              </div>
            )}
            <button onClick={handleReset}
              className="mt-4 w-full py-2.5 bg-[#12164A] dark:bg-[#2AAFA8] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer hover:opacity-90 transition-all">
              <Trash2 size={13} /> Nueva sesión creativa
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <InstallPrompt />
    </div>
    </>
  );
}