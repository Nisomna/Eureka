import React, { useEffect, useState } from 'react';
import { Phase, AppState, DespejeActivity } from '../types';
import { 
  Lightbulb, Coffee, Headphones, Radio, Footprints, Activity, BookOpen, 
  Globe, Gamepad2, Puzzle, Wind, TreePine, PenTool, Palette, 
  CheckCircle2, Circle, Clock, RefreshCw, ChefHat, 
  Dumbbell, Popcorn, PenLine, Sparkles, Utensils, Tv, Eraser, 
  CalendarDays, Moon, List, LayoutList, Play, Pause, SkipForward
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateDespejeContent } from '../services/ai';
import ReactMarkdown from 'react-markdown';
import { soundCheck, soundUncheck, soundTap, soundTransition, soundSuccess } from '../utils/sounds';

interface Props {
  setPhase: (phase: Phase) => void;
  state: AppState;
  updateState: (updates: Partial<AppState>) => void;
  isDark?: boolean;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  headphones: <Headphones size={20} />, radio: <Radio size={20} />,
  footprints: <Footprints size={20} />, activity: <Activity size={20} />,
  book: <BookOpen size={20} />, globe: <Globe size={20} />,
  gamepad: <Gamepad2 size={20} />, puzzle: <Puzzle size={20} />,
  wind: <Wind size={20} />, tree: <TreePine size={20} />,
  pen: <PenTool size={20} />, palette: <Palette size={20} />,
  coffee: <Coffee size={20} />, chefHat: <ChefHat size={20} />,
  utensils: <Utensils size={20} />, dumbbell: <Dumbbell size={20} />,
  tv: <Tv size={20} />, popcorn: <Popcorn size={20} />,
  penLine: <PenLine size={20} />, sparkles: <Sparkles size={20} />,
  eraser: <Eraser size={20} />
};

type ViewMode = 'setup' | 'activities' | 'plan';

export function Despeje({ setPhase, state, updateState, isDark }: Props) {
  const [now, setNow] = useState(Date.now());
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('activities');
  // Plan de Alivio: rutina guiada paso a paso
  const [routineActive, setRoutineActive] = useState(false);
  const [routineStep, setRoutineStep] = useState(0);
  const [routinePaused, setRoutinePaused] = useState(false);
  // Selector de cantidad
  const [taskCount, setTaskCount] = useState<number | 'all'>(3);
  const [modeSelected, setModeSelected] = useState(false);

  const isDarkModeActive = isDark !== undefined ? isDark : true;

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (state.despejeActivities.length === 0) generateActivities();
  }, []);

  // Si ya hay actividades, saltar setup
  useEffect(() => {
    if (state.despejeActivities.length > 0) setModeSelected(true);
  }, []);

  const generateActivities = async () => {
    setIsGenerating(true);
    try {
      const result = await generateDespejeContent(state.interests, state.problem);
      if (result?.activities && result?.dayPlan) {
        updateState({
          despejeActivities: result.activities.map((a: any) => ({
            id: a.id, title: a.title, desc: a.desc,
            iconId: a.iconId || 'coffee', completed: false
          })),
          despejeDayPlan: result.dayPlan,
          despejeStartTime: Date.now(),
          isQuotaActive: result.isQuotaExceeded || false
        });
      } else throw new Error('Empty results');
    } catch {
      updateState({
        despejeActivities: [
          { id: 'f1', title: 'Caminar sin rumbo fijo', desc: 'Sal 15 minutos sin teléfono.', iconId: 'footprints', completed: false },
          { id: 'f2', title: 'Preparar una infusión caliente', desc: 'Disfruta cada sorbo en silencio.', iconId: 'coffee', completed: false },
          { id: 'f3', title: 'Escuchar música ambiental', desc: 'Melodías que expanden tu foco.', iconId: 'headphones', completed: false },
          { id: 'f4', title: 'Contemplar el entorno', desc: 'Observa detalles que nunca notas.', iconId: 'wind', completed: false },
          { id: 'f5', title: 'Leer algo ligero', desc: 'Ficción o revista, sin presión.', iconId: 'book', completed: false },
        ],
        despejeDayPlan: '## Mañana\nEmpieza despacio. Un café o té en calma, sin pantallas.\n\n## Tarde\nHaz algo físico y placentero: camina, cocina, escucha música.\n\n## Noche\nLee algo ligero o ve una película. Duerme temprano.',
        despejeStartTime: Date.now(),
        isQuotaActive: true
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Actividades filtradas según selección
  const activeActivities = taskCount === 'all'
    ? state.despejeActivities
    : state.despejeActivities.slice(0, taskCount as number);

  const toggleActivity = (id: string) => {
    const act = state.despejeActivities.find(a => a.id === id);
    if (act?.completed) soundUncheck(); else soundCheck();
    updateState({ despejeActivities: state.despejeActivities.map(a => a.id === id ? { ...a, completed: !a.completed } : a) });
  };

  const allCompleted = activeActivities.length > 0 && activeActivities.every(a => a.completed);
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  const timeLeft = Math.max(0, ONE_DAY_MS - (state.despejeStartTime ? now - state.despejeStartTime : 0));
  const isTimeUp = timeLeft === 0;
  const canProceed = allCompleted && isTimeUp;

  const formatTime = (ms: number) => {
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  };

  // Rutina guiada: avanzar al siguiente paso
  const nextRoutineStep = () => {
    soundTap();
    if (routineStep < activeActivities.length - 1) {
      // Marcar la actual como completada
      toggleActivity(activeActivities[routineStep].id);
      setRoutineStep(s => s + 1);
    } else {
      // Última: completar y salir de rutina
      toggleActivity(activeActivities[routineStep].id);
      setRoutineActive(false);
      soundSuccess();
    }
  };

  // Pantalla de selección de modo
  if (!modeSelected && !isGenerating && state.despejeActivities.length > 0) {
    const maxCount = state.despejeActivities.length;
    return (
      <div className="flex flex-col h-full bg-gradient-to-b from-calm-sand to-calm-duckegg/25 dark:from-[#1C2621] dark:to-[#121915] -m-4 md:-m-6 p-5 md:p-6 rounded-3xl overflow-hidden">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2.5 bg-calm-smoke/15 border border-calm-smoke/35 dark:border-calm-smoke/45 text-calm-sage-700 dark:text-calm-duckegg rounded-xl shadow-sm animate-float">
            <Moon size={20} />
          </div>
          <div>
            <span className="block text-[10px] uppercase tracking-widest text-calm-sage-700 dark:text-calm-duckegg font-extrabold">Paso 2 de 4</span>
            <h2 className="text-xl font-bold text-calm-olive dark:text-white serif-title">Configura tu Despeje</h2>
          </div>
        </div>

        <div className="flex-1 space-y-5">
          {/* Modo */}
          <div className="space-y-2">
            <p className="text-xs font-extrabold text-calm-sage-700 dark:text-calm-duckegg uppercase tracking-widest">¿Cómo quieres despejar tu mente?</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => { soundTap(); setViewMode('activities'); }}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${viewMode === 'activities' ? 'bg-calm-emeraldsea text-white border-calm-emeraldsea shadow-md' : 'bg-calm-cream dark:bg-[#18201B] border-calm-sage-200 dark:border-teal-950 text-calm-olive dark:text-white hover:border-calm-emeraldsea/50'}`}
              >
                <List size={20} className="mb-2" />
                <p className="font-bold text-sm">Actividades sueltas</p>
                <p className={`text-xs mt-0.5 ${viewMode === 'activities' ? 'text-white/80' : 'text-calm-olive/60 dark:text-[#EBECEB]/60'}`}>Marca a tu ritmo</p>
              </button>
              <button
                onClick={() => { soundTap(); setViewMode('plan'); }}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${viewMode === 'plan' ? 'bg-calm-emeraldsea text-white border-calm-emeraldsea shadow-md' : 'bg-calm-cream dark:bg-[#18201B] border-calm-sage-200 dark:border-teal-950 text-calm-olive dark:text-white hover:border-calm-emeraldsea/50'}`}
              >
                <CalendarDays size={20} className="mb-2" />
                <p className="font-bold text-sm">Rutina completa</p>
                <p className={`text-xs mt-0.5 ${viewMode === 'plan' ? 'text-white/80' : 'text-calm-olive/60 dark:text-[#EBECEB]/60'}`}>Plan de día guiado</p>
              </button>
            </div>
          </div>

          {/* Cantidad (solo en modo actividades) */}
          {viewMode === 'activities' && (
            <div className="space-y-2">
              <p className="text-xs font-extrabold text-calm-sage-700 dark:text-calm-duckegg uppercase tracking-widest">¿Cuántas actividades quieres hacer?</p>
              <div className="flex gap-2 flex-wrap">
                {[1, 2, 3, maxCount > 3 ? maxCount : null].filter(Boolean).map(n => (
                  <button
                    key={n}
                    onClick={() => { soundTap(); setTaskCount(n === maxCount ? 'all' : n as number); }}
                    className={`px-4 py-2 rounded-xl border font-bold text-sm transition-all cursor-pointer ${
                      (n === maxCount ? taskCount === 'all' : taskCount === n)
                        ? 'bg-calm-sage-600 text-white border-calm-sage-600'
                        : 'bg-calm-cream dark:bg-[#18201B] border-calm-sage-200 dark:border-teal-950 text-calm-olive dark:text-white'
                    }`}
                  >
                    {n === maxCount ? `Todas (${maxCount})` : `${n}`}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-calm-olive/50 dark:text-[#EBECEB]/50">
                {taskCount === 'all' ? `${maxCount} actividades personalizadas` : `${taskCount} actividad${taskCount !== 1 ? 'es' : ''} seleccionada${taskCount !== 1 ? 's' : ''}`}
              </p>
            </div>
          )}

          {/* Vista previa */}
          <div className="bg-calm-cream/60 dark:bg-[#18201B]/60 border border-calm-sage-200/60 dark:border-teal-950/60 rounded-2xl p-4 space-y-2">
            <p className="text-[10px] uppercase font-bold text-calm-emeraldsea dark:text-calm-duckegg tracking-widest">Vista previa</p>
            {viewMode === 'plan' ? (
              <p className="text-xs text-calm-olive/80 dark:text-[#EBECEB]/70 leading-relaxed">Seguirás un itinerario de mañana, tarde y noche generado para ti. Incluye una rutina guiada paso a paso.</p>
            ) : (
              (taskCount === 'all' ? state.despejeActivities : state.despejeActivities.slice(0, taskCount as number)).map((a, i) => (
                <div key={a.id} className="flex items-center gap-2 text-xs text-calm-olive/80 dark:text-[#EBECEB]/70">
                  <span className="w-4 h-4 rounded-full bg-calm-sage-200/60 dark:bg-teal-900/40 flex items-center justify-center text-[9px] font-bold text-calm-emeraldsea">{i + 1}</span>
                  <span>{a.title}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="pt-4">
          <button
            onClick={() => { soundTransition(); setModeSelected(true); }}
            className="w-full py-3.5 bg-calm-sage-500 hover:bg-calm-sage-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg"
          >
            <Play size={16} />
            Comenzar Despeje
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-gradient-to-b from-calm-sand to-calm-duckegg/25 dark:from-[#1C2621] dark:to-[#121915] text-calm-olive dark:text-[#EBECEB] -m-4 md:-m-6 p-5 md:p-6 rounded-3xl relative overflow-hidden shadow-2xl transition-all" style={{ minHeight: 0, height: '100%' }}>

      {/* Starry dots */}
      <div className="absolute top-10 left-10 w-1.5 h-1.5 rounded-full bg-calm-emeraldsea/50 dark:bg-calm-duckegg opacity-60 animate-pulse pointer-events-none"></div>
      <div className="absolute top-24 right-16 w-1 h-1 rounded-full bg-calm-butterscotch/70 opacity-80 animate-pulse delay-500 pointer-events-none"></div>

      <div className="flex-1 flex flex-col space-y-3 min-h-0 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 p-2.5 bg-calm-smoke/15 dark:bg-calm-smoke/25 border border-calm-smoke/35 dark:border-calm-smoke/45 text-calm-sage-700 dark:text-calm-duckegg rounded-xl shadow-sm animate-float">
              <Moon size={20} />
            </div>
            <div>
              <span className="block text-[10px] uppercase tracking-widest text-calm-sage-700 dark:text-calm-duckegg font-extrabold leading-none mb-0.5">Paso 2 de 4</span>
              <h2 className="text-xl font-bold text-calm-olive dark:text-white serif-title leading-tight">Momento de Despeje</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Reconfigurar modo */}
            <button
              onClick={() => { soundTap(); setModeSelected(false); setRoutineActive(false); setRoutineStep(0); }}
              className="p-2 bg-calm-cream/80 dark:bg-[#1C2621]/60 border border-calm-sage-200 dark:border-teal-950/60 rounded-xl text-calm-sage-600 dark:text-calm-duckegg hover:bg-white transition-all cursor-pointer"
              title="Cambiar configuración"
            >
              <LayoutList size={14} />
            </button>
          </div>
        </div>

        {isGenerating ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4">
            <div className="relative flex items-center justify-center">
              <div className="w-14 h-14 border-4 border-calm-emeraldsea border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute w-8 h-8 rounded-full bg-calm-emeraldsea/20 animate-breath"></div>
            </div>
            <p className="text-calm-emeraldsea dark:text-calm-duckegg font-bold text-sm tracking-wide">Estructurando tu santuario de descanso...</p>
          </div>
        ) : viewMode === 'plan' ? (
          /* ── PLAN DE ALIVIO: Rutina guiada interactiva ── */
          <div className="flex-1 flex flex-col space-y-3 overflow-hidden">
            {!routineActive ? (
              /* Vista del plan en markdown + botón iniciar rutina */
              <>
                <div className={`flex-1 overflow-y-auto rounded-2xl border p-4 prose prose-sm max-w-none ${isDarkModeActive ? 'bg-[#18201B] border-teal-950/50 text-[#EBECEB] prose-invert' : 'bg-calm-cream/95 border-calm-sage-200 text-calm-olive'}`}>
                  <div className="flex items-center gap-2 text-calm-emeraldsea dark:text-calm-duckegg mb-3 pb-2 border-b border-calm-sage-200/60 dark:border-teal-900/30">
                    <CalendarDays size={18} />
                    <h3 className="text-sm font-bold m-0 text-calm-olive dark:text-white">Tu Día Sin Prisa</h3>
                  </div>
                  <div className="text-sm leading-relaxed">
                    <ReactMarkdown>{state.despejeDayPlan || ''}</ReactMarkdown>
                  </div>
                </div>
                <div className="space-y-2 flex-shrink-0">
                  <p className="text-[10px] text-calm-olive/55 dark:text-[#EBECEB]/50 text-center">O sigue las actividades en modo rutina guiada paso a paso:</p>
                  <button
                    onClick={() => { soundTransition(); setRoutineActive(true); setRoutineStep(0); }}
                    className="w-full py-3 bg-calm-emeraldsea hover:bg-calm-sage-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                  >
                    <Play size={16} /> Iniciar Rutina Guiada
                  </button>
                </div>
              </>
            ) : (
              /* Rutina paso a paso */
              <div className="flex-1 flex flex-col justify-between">
                {/* Progreso */}
                <div className="flex items-center gap-1.5 mb-3">
                  {activeActivities.map((_, i) => (
                    <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i < routineStep ? 'bg-calm-emeraldsea' : i === routineStep ? 'bg-calm-butterscotch' : 'bg-calm-sage-200/40 dark:bg-teal-950/40'}`} />
                  ))}
                </div>
                <p className="text-[10px] text-calm-olive/50 dark:text-[#EBECEB]/40 text-center mb-4">Actividad {routineStep + 1} de {activeActivities.length}</p>

                {/* Tarjeta actual */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={routineStep}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.3 }}
                    className="flex-1 flex flex-col items-center justify-center text-center space-y-5 p-6 bg-calm-cream dark:bg-[#18201B] border border-calm-sage-200 dark:border-teal-950 rounded-2xl"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-calm-emeraldsea/15 dark:bg-[#1E2B25] border border-calm-emeraldsea/30 flex items-center justify-center text-calm-emeraldsea dark:text-calm-duckegg [&_svg]:w-8 [&_svg]:h-8">
                      {ICON_MAP[activeActivities[routineStep]?.iconId] || <Coffee size={32} />}
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-bold text-calm-olive dark:text-white">{activeActivities[routineStep]?.title}</h3>
                      <p className="text-sm text-calm-olive/70 dark:text-[#EBECEB]/70 leading-relaxed max-w-xs">{activeActivities[routineStep]?.desc}</p>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Controles rutina */}
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => { soundTap(); setRoutineActive(false); }}
                    className="p-3 rounded-xl border border-calm-sage-200 dark:border-teal-950 bg-calm-cream dark:bg-[#1C2621]/80 text-calm-sage-600 dark:text-[#EBECEB]/60 cursor-pointer hover:bg-white transition-all"
                  >
                    <Pause size={18} />
                  </button>
                  <button
                    onClick={nextRoutineStep}
                    className="flex-1 py-3 bg-calm-sage-500 hover:bg-calm-sage-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                  >
                    {routineStep < activeActivities.length - 1 ? (
                      <><span>Siguiente actividad</span><SkipForward size={16} /></>
                    ) : (
                      <><CheckCircle2 size={16} /><span>Completar rutina</span></>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ── ACTIVIDADES SUELTAS ── */
          <>
            <div className="flex-1 overflow-y-auto pb-2 px-0.5 space-y-2.5 min-h-[180px]">
              {activeActivities.map((rec, idx) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={rec.id}
                  onClick={() => toggleActivity(rec.id)}
                  className={`p-4 border rounded-2xl transition-all duration-200 cursor-pointer group flex items-center space-x-4 select-none active:scale-[0.985] ${
                    rec.completed
                      ? 'bg-calm-duckegg/20 dark:bg-[#1E2B25]/30 border-calm-duckegg/50 dark:border-teal-900/50 opacity-75'
                      : 'bg-calm-cream dark:bg-[#18201B] border-calm-sage-200/80 dark:border-teal-950 hover:bg-white dark:hover:bg-[#1E2822] hover:border-calm-duckegg/60 hover:shadow-md'
                  }`}
                >
                  <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${rec.completed ? 'bg-calm-emeraldsea text-white shadow-sm' : 'bg-calm-sage-100/60 dark:bg-[#1C2621] border-2 border-calm-sage-200 dark:border-teal-900 text-calm-sage-400 group-hover:border-calm-emeraldsea/60'}`}>
                    {rec.completed ? <CheckCircle2 size={22} className="stroke-[2.5]" /> : <Circle size={20} className="stroke-2" />}
                  </div>
                  <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center [&_svg]:w-5 [&_svg]:h-5 ${rec.completed ? 'bg-calm-duckegg/30 dark:bg-[#1E2B25]/50 text-calm-emeraldsea/60' : 'bg-calm-sand dark:bg-[#111613] text-calm-emeraldsea dark:text-calm-duckegg border border-calm-duckegg/30 dark:border-teal-900/30'}`}>
                    {ICON_MAP[rec.iconId] || <Coffee size={20} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-bold text-sm leading-snug ${rec.completed ? 'line-through text-calm-sage-600/50 dark:text-calm-duckegg/50' : 'text-calm-olive dark:text-white'}`}>{rec.title}</h3>
                    <p className={`text-xs mt-0.5 leading-relaxed line-clamp-2 ${rec.completed ? 'text-calm-sage-500/50 dark:text-calm-duckegg/35' : 'text-calm-olive/70 dark:text-[#EBECEB]/70'}`}>{rec.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Status bar */}
            <div className="bg-calm-sage-100/40 dark:bg-[#151D18] px-4 py-2.5 rounded-2xl border border-calm-sage-200 dark:border-teal-900/50 text-center flex-shrink-0 shadow-sm">
              {!allCompleted ? (
                <p className="text-calm-olive/70 dark:text-slate-400 text-[11px] font-medium">
                  {activeActivities.filter(a => a.completed).length}/{activeActivities.length} completadas — toca para marcar
                </p>
              ) : !isTimeUp ? (
                <div className="flex items-center justify-center gap-3">
                  <p className="text-calm-sage-700 dark:text-calm-duckegg text-xs font-bold flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="stroke-[2.5]" /> Listas. Deja reposar la mente.
                  </p>
                  <div className="flex items-center gap-1.5 text-calm-emeraldsea dark:text-calm-duckegg font-mono text-sm bg-calm-cream dark:bg-[#1C2621]/80 border border-calm-sage-200 dark:border-teal-950/45 px-3 py-1 rounded-full shadow-sm">
                    <Clock size={13} /><span>{formatTime(timeLeft)}</span>
                  </div>
                </div>
              ) : (
                <p className="text-calm-sage-700 dark:text-calm-duckegg text-xs font-bold flex items-center justify-center gap-1.5">
                  <Sparkles size={13} /> ¡Incubación completada! Es hora de las ideas.
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Botones footer */}
      <div className="pt-3 pb-1 space-y-2 flex-shrink-0 border-t border-calm-sage-200/40 dark:border-teal-950/40 mt-1">
        {isTimeUp && !isGenerating && (
          <button type="button" onClick={() => { soundTap(); generateActivities(); setModeSelected(false); setRoutineActive(false); }}
            className="w-full py-2.5 bg-calm-cream/80 hover:bg-calm-cream dark:bg-[#1E2B25] dark:hover:bg-[#25322B] text-calm-sage-700 dark:text-calm-duckegg border border-calm-sage-200 dark:border-teal-950/40 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-all cursor-pointer">
            <RefreshCw size={13} /><span>Volver a iniciar despeje</span>
          </button>
        )}
        {/* Tooltip cuando no se puede continuar */}
        {!canProceed && !isGenerating && (
          <p className="text-[10px] text-center text-calm-olive/40 dark:text-slate-500 leading-snug px-2">
            {!allCompleted
              ? `Completa las actividades para continuar (${activeActivities.filter(a => a.completed).length}/${activeActivities.length})`
              : `Espera que transcurra el tiempo de incubación`}
          </p>
        )}
        <button
          type="button"
          onClick={() => { if (canProceed && !isGenerating) { soundTransition(); setPhase('eureka'); } }}
          disabled={!canProceed || isGenerating}
          className={`w-full py-4 rounded-xl font-bold text-base flex items-center justify-center space-x-2.5 transition-all ${
            canProceed && !isGenerating
              ? 'bg-calm-sage-500 hover:bg-calm-sage-600 text-white shadow-lg shadow-calm-sage-200/50 dark:shadow-none active:scale-[0.992] cursor-pointer'
              : 'bg-calm-sage-50 dark:bg-[#1C2621]/40 text-calm-olive/25 dark:text-slate-600 border border-calm-sage-150/20 dark:border-teal-950/80 cursor-not-allowed'
          }`}
        >
          <Lightbulb size={20} className={canProceed && !isGenerating ? 'text-calm-butterscotch animate-pulse' : 'text-calm-olive/20 dark:text-slate-600'} />
          <span>¡Llegaron las ideas! Eureka</span>
        </button>
      </div>
    </div>
  );
}
