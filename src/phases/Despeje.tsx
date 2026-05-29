import React, { useEffect, useState } from 'react';
import { Phase, AppState, DespejeActivity } from '../types';
import { 
  Lightbulb, Coffee, Headphones, Radio, Footprints, Activity, BookOpen, 
  Globe, Gamepad2, Puzzle, Wind, TreePine, PenTool, Palette, 
  CheckCircle2, Circle, Clock, RefreshCw, ChefHat, 
  Dumbbell, Popcorn, PenLine, Sparkles, Utensils, Tv, Eraser, 
  CalendarDays, Moon, List, LayoutList, Play, Pause, SkipForward, Sunrise, Sunset, Star
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
  eraser: <Eraser size={20} />, sunrise: <Sunrise size={20} />,
  sunset: <Sunset size={20} />, star: <Star size={20} />,
};

// Rutina fija de 10 tareas distribuidas en mañana / tarde / noche
const GUIDED_ROUTINE = [
  { id: 'r1',  title: 'Despertar sin prisa',         desc: 'Quédate 5 minutos en cama respirando profundo antes de mirar el teléfono.', iconId: 'sunrise', stage: 'Mañana' },
  { id: 'r2',  title: 'Desayuno consciente',          desc: 'Prepara y come algo rico sin pantallas. Saborea cada bocado.', iconId: 'coffee', stage: 'Mañana' },
  { id: 'r3',  title: 'Caminar al aire libre',        desc: 'Sal 20 minutos sin auriculares. Observa el entorno, no el suelo.', iconId: 'footprints', stage: 'Mañana' },
  { id: 'r4',  title: 'Música que te mueve',          desc: 'Pon una playlist que te guste y déjate llevar. Sin multitarea.', iconId: 'headphones', stage: 'Mañana' },
  { id: 'r5',  title: 'Actividad con las manos',      desc: 'Cocina algo, dibuja, arma un puzzle. Algo físico y creativo.', iconId: 'palette', stage: 'Tarde' },
  { id: 'r6',  title: 'Almuerzo tranquilo',           desc: 'Come despacio, si puedes en compañía de alguien o con algo que te guste escuchar.', iconId: 'utensils', stage: 'Tarde' },
  { id: 'r7',  title: 'Siesta o descanso breve',      desc: '20 minutos tumbado sin dormir obligatoriamente. Solo deja que la mente divague.', iconId: 'wind', stage: 'Tarde' },
  { id: 'r8',  title: 'Movimiento ligero',            desc: 'Estira, baila, haz yoga o da una vuelta corta. Lo que el cuerpo pida.', iconId: 'dumbbell', stage: 'Tarde' },
  { id: 'r9',  title: 'Ocio sin culpa',               desc: 'Serie, videojuego, película o libro. Una hora de disfrute puro, sin justificarte.', iconId: 'popcorn', stage: 'Noche' },
  { id: 'r10', title: 'Cierre del día',               desc: 'Escribe 3 cosas que pasaron hoy, apaga pantallas 30 min antes de dormir.', iconId: 'star', stage: 'Noche' },
];

type ViewMode = 'activities' | 'plan';

export function Despeje({ setPhase, state, updateState, isDark }: Props) {
  const [now, setNow] = useState(Date.now());
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('activities');
  const [routineActive, setRoutineActive] = useState(false);
  const [routineStep, setRoutineStep] = useState(0);
  const [taskCount, setTaskCount] = useState<number | 'all'>(3);
  const [modeSelected, setModeSelected] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (state.despejeActivities.length === 0) generateActivities();
  }, []);

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

  const activeActivities = taskCount === 'all'
    ? state.despejeActivities
    : state.despejeActivities.slice(0, taskCount as number);

  // Para la rutina guiada usamos GUIDED_ROUTINE con completed tracking local
  const [guidedCompleted, setGuidedCompleted] = useState<Record<string, boolean>>({});
  const guidedActivities = GUIDED_ROUTINE.map(r => ({ ...r, completed: !!guidedCompleted[r.id] }));

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

  const nextRoutineStep = () => {
    soundTap();
    const current = guidedActivities[routineStep];
    setGuidedCompleted(prev => ({ ...prev, [current.id]: true }));
    if (routineStep < guidedActivities.length - 1) {
      setRoutineStep(s => s + 1);
    } else {
      setRoutineActive(false);
      soundSuccess();
    }
  };

  // Etiqueta de etapa para la barra de progreso
  const stageOf = (idx: number) => guidedActivities[idx]?.stage;
  const stageColor = (stage: string) => {
    if (stage === 'Mañana') return 'bg-calm-butterscotch';
    if (stage === 'Tarde') return 'bg-calm-emeraldsea';
    return 'bg-calm-sage-700';
  };

  // ── PANTALLA DE CONFIGURACIÓN ──
  if (!modeSelected && !isGenerating && state.despejeActivities.length > 0) {
    const maxCount = state.despejeActivities.length;
    return (
      <div className="flex flex-col bg-[var(--surface-card)] rounded-3xl">
        <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-5">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-calm-smoke/15 border border-calm-smoke/35 dark:border-calm-smoke/45 text-calm-sage-700 dark:text-calm-duckegg rounded-xl shadow-sm animate-float">
              <Moon size={20} />
            </div>
            <div>
              <span className="block text-[10px] uppercase tracking-widest text-calm-sage-700 dark:text-calm-duckegg font-extrabold">Paso 2 de 4</span>
              <h2 className="text-xl font-bold text-[var(--text-primary)] serif-title">Configura tu Despeje</h2>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-extrabold text-calm-sage-700 dark:text-calm-duckegg uppercase tracking-widest">¿Cómo quieres despejar tu mente?</p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => { soundTap(); setViewMode('activities'); }}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${viewMode === 'activities' ? 'bg-calm-emeraldsea text-white border-calm-emeraldsea shadow-md' : 'bg-[var(--surface-card)] dark:bg-[var(--surface-card)] border-[var(--border-card)] dark:border-[var(--border-default)] text-[var(--text-primary)] hover:border-calm-emeraldsea/50'}`}
              >
                <List size={20} className="mb-2" />
                <p className="font-bold text-sm">Actividades sueltas</p>
                <p className={`text-xs mt-0.5 ${viewMode === 'activities' ? 'text-white/80' : 'text-calm-sage-600 dark:text-[var(--text-primary)]/60'}`}>Marca a tu ritmo</p>
              </button>
              <button onClick={() => { soundTap(); setViewMode('plan'); }}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${viewMode === 'plan' ? 'bg-calm-emeraldsea text-white border-calm-emeraldsea shadow-md' : 'bg-[var(--surface-card)] dark:bg-[var(--surface-card)] border-[var(--border-card)] dark:border-[var(--border-default)] text-[var(--text-primary)] hover:border-calm-emeraldsea/50'}`}
              >
                <CalendarDays size={20} className="mb-2" />
                <p className="font-bold text-sm">Rutina completa</p>
                <p className={`text-xs mt-0.5 ${viewMode === 'plan' ? 'text-white/80' : 'text-calm-sage-600 dark:text-[var(--text-primary)]/60'}`}>10 pasos por el día</p>
              </button>
            </div>
          </div>

          {viewMode === 'activities' && (
            <div className="space-y-2">
              <p className="text-xs font-extrabold text-calm-sage-700 dark:text-calm-duckegg uppercase tracking-widest">¿Cuántas actividades quieres hacer?</p>
              <div className="flex gap-2 flex-wrap">
                {[1, 2, 3, maxCount > 3 ? maxCount : null].filter(Boolean).map(n => (
                  <button key={n}
                    onClick={() => { soundTap(); setTaskCount(n === maxCount ? 'all' : n as number); }}
                    className={`px-4 py-2 rounded-xl border font-bold text-sm transition-all cursor-pointer ${
                      (n === maxCount ? taskCount === 'all' : taskCount === n)
                        ? 'bg-calm-sage-600 text-white border-calm-sage-600'
                        : 'bg-[var(--surface-card)] border-[var(--border-card)] dark:border-[var(--border-default)] text-[var(--text-primary)] dark:text-[var(--text-primary)]'
                    }`}
                  >
                    {n === maxCount ? `Todas (${maxCount})` : `${n}`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {viewMode === 'plan' && (
            <div className="bg-[var(--surface-card)]/60 dark:bg-[var(--surface-card)]/60 border border-[var(--border-card)]/60 dark:border-[var(--border-default)]/60 rounded-2xl p-4 space-y-2">
              <p className="text-[10px] uppercase font-bold text-calm-emeraldsea dark:text-calm-duckegg tracking-widest mb-2">10 actividades del día</p>
              {GUIDED_ROUTINE.map((a, i) => (
                <div key={a.id} className="flex items-center gap-2 text-xs text-[var(--text-secondary)] dark:text-[var(--text-primary)]/70">
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white flex-shrink-0 ${stageColor(a.stage)}`}>{i + 1}</span>
                  <span className="font-medium">{a.title}</span>
                  <span className="text-[var(--text-secondary)] dark:text-[var(--text-primary)]/30 text-[10px] ml-auto flex-shrink-0">{a.stage}</span>
                </div>
              ))}
            </div>
          )}

          {viewMode === 'activities' && (
            <div className="bg-[var(--surface-card)]/60 dark:bg-[var(--surface-card)]/60 border border-[var(--border-card)]/60 dark:border-[var(--border-default)]/60 rounded-2xl p-4 space-y-2">
              <p className="text-[10px] uppercase font-bold text-calm-emeraldsea dark:text-calm-duckegg tracking-widest">Vista previa</p>
              {(taskCount === 'all' ? state.despejeActivities : state.despejeActivities.slice(0, taskCount as number)).map((a, i) => (
                <div key={a.id} className="flex items-center gap-2 text-xs text-[var(--text-secondary)] dark:text-[var(--text-primary)]/70">
                  <span className="w-4 h-4 rounded-full bg-calm-sage-200/60 dark:bg-teal-900/40 flex items-center justify-center text-[9px] font-bold text-calm-emeraldsea">{i + 1}</span>
                  <span>{a.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer siempre visible */}
        <div className="flex-shrink-0 px-5 pb-5 pt-3 border-t border-[var(--border-card)]/40 dark:border-[var(--border-default)]/40 bg-[var(--surface-card)] dark:bg-[var(--surface-card)]">
          <button onClick={() => { soundTransition(); setModeSelected(true); }}
            className="w-full py-3.5 bg-calm-sage-800 hover:bg-calm-sage-900 dark:bg-calm-emeraldsea dark:hover:bg-calm-sage-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer"
          >
            <Play size={16} />
            Comenzar Despeje
          </button>
        </div>
      </div>
    );
  }

  // ── PANTALLA PRINCIPAL ──
  return (
    <div
      className="flex flex-col bg-[var(--surface-card)] dark:bg-[var(--surface-card)] text-[var(--text-primary)] dark:text-[var(--text-primary)] rounded-3xl relative transition-all"
      style={{ height: '100%', overflow: 'hidden' }}
    >
      {/* Starry dots */}
      <div className="absolute top-10 left-10 w-1.5 h-1.5 rounded-full bg-calm-emeraldsea/50 dark:bg-calm-duckegg opacity-60 animate-pulse pointer-events-none" />
      <div className="absolute top-24 right-16 w-1 h-1 rounded-full bg-calm-butterscotch/70 opacity-80 animate-pulse delay-500 pointer-events-none" />

      {/* ── Scrollable content ── */}
      <div className="flex-1 min-h-0 overflow-y-auto p-5 md:p-6 pb-0 flex flex-col space-y-3">

        {/* Header */}
        <div className="flex items-center justify-between mt-1 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 p-2.5 bg-calm-smoke/15 dark:bg-calm-smoke/25 border border-calm-smoke/35 dark:border-calm-smoke/45 text-calm-sage-700 dark:text-calm-duckegg rounded-xl shadow-sm animate-float">
              <Moon size={20} />
            </div>
            <div>
              <span className="block text-[10px] uppercase tracking-widest text-calm-sage-600 dark:text-calm-duckegg font-extrabold leading-none mb-0.5">Paso 2 de 4</span>
              <h2 className="text-xl font-bold text-[var(--text-primary)] serif-title leading-tight">Momento de Despeje</h2>
            </div>
          </div>
          <button
            onClick={() => { soundTap(); setModeSelected(false); setRoutineActive(false); setRoutineStep(0); setGuidedCompleted({}); }}
            className="p-2 bg-[var(--surface-card)] dark:bg-[var(--surface-card2)]/60 border border-[var(--border-card)] dark:border-[var(--border-default)]/60 rounded-xl text-calm-sage-600 dark:text-calm-duckegg hover:bg-[var(--surface-hover)] transition-all cursor-pointer"
            title="Cambiar configuración"
          >
            <LayoutList size={14} />
          </button>
        </div>

        {/* Content area */}
        {isGenerating ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4 py-12">
            <div className="relative flex items-center justify-center">
              <div className="w-14 h-14 border-4 border-calm-emeraldsea border-t-transparent rounded-full animate-spin" />
              <div className="absolute w-8 h-8 rounded-full bg-calm-emeraldsea/20 animate-breath" />
            </div>
            <p className="text-calm-emeraldsea dark:text-calm-duckegg font-bold text-sm tracking-wide">Estructurando tu santuario de descanso...</p>
          </div>

        ) : viewMode === 'plan' ? (
          /* ── RUTINA GUIADA ── */
          <div className="flex-1 flex flex-col space-y-3 min-h-0">
            {!routineActive ? (
              <>
                <div className="flex-1 overflow-y-auto rounded-2xl border bg-[var(--surface-card)] dark:bg-[var(--surface-card2)] border-[var(--border-card)] dark:border-[var(--border-default)]/50 p-4">
                  <div className="flex items-center gap-2 text-calm-emeraldsea dark:text-calm-duckegg mb-3 pb-2 border-b border-[var(--border-card)]/60 dark:border-[var(--border-default)]/30">
                    <CalendarDays size={18} />
                    <h3 className="text-sm font-bold text-[var(--text-primary)]">Tu Día Sin Prisa · 10 actividades</h3>
                  </div>
                  {/* Lista previa de las 10 tareas agrupadas por etapa */}
                  {(['Mañana', 'Tarde', 'Noche'] as const).map(stage => (
                    <div key={stage} className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-2 h-2 rounded-full ${stageColor(stage)}`} />
                        <p className="text-[10px] uppercase font-extrabold tracking-widest text-calm-sage-700 dark:text-calm-duckegg">{stage}</p>
                      </div>
                      {GUIDED_ROUTINE.filter(r => r.stage === stage).map((r, i) => (
                        <div key={r.id} className="flex items-start gap-3 py-2 border-b border-[var(--border-card)]/30 dark:border-[var(--border-default)]/30 last:border-0">
                          <div className="w-8 h-8 rounded-lg bg-[var(--surface-card2)] dark:bg-[var(--surface-card)] border border-calm-duckegg/30 dark:border-[var(--border-default)]/30 flex items-center justify-center text-calm-emeraldsea dark:text-calm-duckegg flex-shrink-0 [&_svg]:w-4 [&_svg]:h-4">
                            {ICON_MAP[r.iconId] || <Coffee size={16} />}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-[var(--text-primary)]">{r.title}</p>
                            <p className="text-[11px] text-calm-sage-600 dark:text-[var(--text-primary)]/55 leading-snug mt-0.5">{r.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                <div className="flex-shrink-0 pb-1">
                  <button
                    onClick={() => { soundTransition(); setRoutineActive(true); setRoutineStep(0); }}
                    className="w-full py-3 bg-calm-sage-800 hover:bg-calm-sage-900 dark:bg-calm-emeraldsea dark:hover:bg-calm-sage-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                  >
                    <Play size={16} /> Iniciar Rutina Guiada
                  </button>
                </div>
              </>
            ) : (
              /* ── PASO A PASO ── */
              <div className="flex-1 flex flex-col min-h-0 pb-1">
                {/* Barra de progreso con colores por etapa */}
                <div className="flex items-center gap-1 mb-1 flex-shrink-0">
                  {guidedActivities.map((a, i) => (
                    <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                      a.completed ? 'bg-calm-emeraldsea' :
                      i === routineStep ? 'bg-calm-butterscotch' :
                      'bg-calm-sage-200/40 dark:bg-teal-950/40'
                    }`} />
                  ))}
                </div>
                {/* Etapa actual */}
                <div className="flex items-center justify-between mb-3 flex-shrink-0">
                  <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full text-white ${stageColor(stageOf(routineStep))}`}>
                    {stageOf(routineStep)}
                  </span>
                  <p className="text-[10px] text-calm-sage-500 dark:text-[var(--text-primary)]/40">
                    {routineStep + 1} / {guidedActivities.length}
                  </p>
                </div>

                {/* Tarjeta de actividad */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={routineStep}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.28 }}
                    className="flex-1 flex flex-col items-center justify-center text-center space-y-4 p-6 bg-[var(--surface-card)] dark:bg-[var(--surface-card)] border border-[var(--border-card)] dark:border-[var(--border-default)] rounded-2xl min-h-0"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-calm-emeraldsea/15 dark:bg-[var(--surface-card2)] border border-calm-emeraldsea/30 flex items-center justify-center text-calm-emeraldsea dark:text-calm-duckegg [&_svg]:w-8 [&_svg]:h-8">
                      {ICON_MAP[guidedActivities[routineStep]?.iconId] || <Coffee size={32} />}
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-bold text-[var(--text-primary)] dark:text-[var(--text-primary)] leading-snug">
                        {guidedActivities[routineStep]?.title}
                      </h3>
                      <p className="text-sm text-calm-sage-700 dark:text-[var(--text-primary)]/70 leading-relaxed max-w-xs">
                        {guidedActivities[routineStep]?.desc}
                      </p>
                    </div>
                    {/* Mini vista de siguientes */}
                    {routineStep < guidedActivities.length - 1 && (
                      <p className="text-[10px] text-[var(--text-secondary)] dark:text-[var(--text-primary)]/30">
                        Después: {guidedActivities[routineStep + 1]?.title}
                      </p>
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Controles */}
                <div className="flex gap-3 mt-3 flex-shrink-0">
                  <button
                    onClick={() => { soundTap(); setRoutineActive(false); }}
                    className="p-3 rounded-xl border border-[var(--border-card)] dark:border-[var(--border-default)] bg-[var(--surface-card)] dark:bg-[var(--surface-card)]/80 text-calm-sage-600 dark:text-[var(--text-primary)]/60 cursor-pointer hover:bg-[var(--surface-hover)] transition-all"
                  >
                    <Pause size={18} />
                  </button>
                  <button
                    onClick={nextRoutineStep}
                    className="flex-1 py-3 bg-calm-sage-800 hover:bg-calm-sage-900 dark:bg-calm-emeraldsea dark:hover:bg-calm-sage-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                  >
                    {routineStep < guidedActivities.length - 1 ? (
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
          <div className="flex-1 flex flex-col min-h-0 space-y-2.5">
            <div className="flex-1 overflow-y-auto pb-2 px-0.5 space-y-2.5">
              {activeActivities.map((rec, idx) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={rec.id}
                  onClick={() => toggleActivity(rec.id)}
                  className={`p-4 border rounded-2xl transition-all duration-200 cursor-pointer group flex items-center space-x-4 select-none active:scale-[0.985] ${
                    rec.completed
                      ? 'bg-calm-duckegg/20 dark:bg-[var(--surface-card2)]/30 border-calm-duckegg/50 dark:border-[var(--border-default)]/50 opacity-75'
                      : 'bg-[var(--surface-card)] dark:bg-[var(--surface-card)] border-[var(--border-card)]/80 dark:border-[var(--border-default)] hover:bg-[var(--surface-hover)] dark:hover:bg-[var(--surface-hover)] hover:border-calm-duckegg/60 hover:shadow-md'
                  }`}
                >
                  <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${rec.completed ? 'bg-calm-emeraldsea text-white shadow-sm' : 'bg-[var(--surface-card2)] dark:bg-[var(--surface-card)] border-2 border-[var(--border-card)] dark:border-[var(--border-default)] text-calm-sage-400 group-hover:border-calm-emeraldsea/60'}`}>
                    {rec.completed ? <CheckCircle2 size={22} className="stroke-[2.5]" /> : <Circle size={20} className="stroke-2" />}
                  </div>
                  <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center [&_svg]:w-5 [&_svg]:h-5 ${rec.completed ? 'bg-calm-duckegg/30 dark:bg-[var(--surface-card2)]/50 text-calm-emeraldsea/60' : 'bg-[var(--surface-base)] dark:bg-[var(--surface-base)] text-calm-emeraldsea dark:text-calm-duckegg border border-calm-duckegg/30 dark:border-[var(--border-default)]/30'}`}>
                    {ICON_MAP[rec.iconId] || <Coffee size={20} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-bold text-sm leading-snug ${rec.completed ? 'line-through text-calm-sage-600/50 dark:text-calm-duckegg/50' : 'text-[var(--text-primary)] dark:text-white'}`}>{rec.title}</h3>
                    <p className={`text-xs mt-0.5 leading-relaxed line-clamp-2 ${rec.completed ? 'text-calm-sage-500/50 dark:text-calm-duckegg/35' : 'text-calm-sage-700 dark:text-[var(--text-primary)]/70'}`}>{rec.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Status bar */}
            <div className="bg-calm-sage-100/40 dark:bg-[var(--surface-base)] px-4 py-2.5 rounded-2xl border border-[var(--border-card)] dark:border-[var(--border-default)]/50 text-center flex-shrink-0 shadow-sm">
              {!allCompleted ? (
                <p className="text-[var(--text-secondary)] dark:text-[var(--text-muted)] text-[11px] font-medium">
                  {activeActivities.filter(a => a.completed).length}/{activeActivities.length} completadas — toca para marcar
                </p>
              ) : !isTimeUp ? (
                <div className="flex items-center justify-center gap-3">
                  <p className="text-calm-sage-700 dark:text-calm-duckegg text-xs font-bold flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="stroke-[2.5]" /> Listas. Deja reposar la mente.
                  </p>
                  <div className="flex items-center gap-1.5 text-calm-emeraldsea dark:text-calm-duckegg font-mono text-sm bg-[var(--surface-card)] dark:bg-[var(--surface-card)]/80 border border-[var(--border-card)] dark:border-[var(--border-default)]/45 px-3 py-1 rounded-full shadow-sm">
                    <Clock size={13} /><span>{formatTime(timeLeft)}</span>
                  </div>
                </div>
              ) : (
                <p className="text-calm-sage-700 dark:text-calm-duckegg text-xs font-bold flex items-center justify-center gap-1.5">
                  <Sparkles size={13} /> ¡Incubación completada! Es hora de las ideas.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── FOOTER FIJO — siempre visible ── */}
      <div className="flex-shrink-0 px-5 pb-5 pt-3 space-y-2 border-t border-[var(--border-card)]/40 dark:border-[var(--border-default)]/40 bg-[var(--surface-card)] dark:bg-[var(--surface-card)]">
        {isTimeUp && !isGenerating && (
          <button type="button" onClick={() => { soundTap(); generateActivities(); setModeSelected(false); setRoutineActive(false); setGuidedCompleted({}); }}
            className="w-full py-2.5 bg-[var(--surface-card)] hover:bg-[var(--surface-card2)] dark:bg-[var(--surface-card2)] dark:hover:bg-[var(--surface-hover)] text-calm-sage-700 dark:text-calm-duckegg border border-[var(--border-card)] dark:border-[var(--border-default)]/40 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-all cursor-pointer">
            <RefreshCw size={13} /><span>Volver a iniciar despeje</span>
          </button>
        )}
        {!canProceed && !isGenerating && (
          <p className="text-[10px] text-center text-[var(--text-secondary)] dark:text-slate-500 leading-snug">
            {!allCompleted
              ? `Completa las actividades (${activeActivities.filter(a => a.completed).length}/${activeActivities.length}) y espera 24 h`
              : 'Espera que transcurra el tiempo de incubación'}
          </p>
        )}
        <button
          type="button"
          onClick={() => { if (canProceed && !isGenerating) { soundTransition(); setPhase('eureka'); } }}
          disabled={!canProceed || isGenerating}
          className={`w-full py-4 rounded-xl font-bold text-base flex items-center justify-center space-x-2.5 transition-all ${
            canProceed && !isGenerating
              ? 'bg-calm-sage-800 hover:bg-calm-sage-900 dark:bg-calm-emeraldsea dark:hover:bg-calm-sage-600 text-white shadow-lg shadow-calm-sage-200/50 dark:shadow-none active:scale-[0.992] cursor-pointer'
              : 'bg-[var(--surface-card2)] dark:bg-[var(--surface-card)]/40 text-[var(--text-secondary)] dark:text-slate-600 border border-calm-sage-150/20 dark:border-[var(--border-default)]/80 cursor-not-allowed'
          }`}
        >
          <Lightbulb size={20} className={canProceed && !isGenerating ? 'text-calm-butterscotch animate-pulse' : 'text-[var(--text-secondary)] dark:text-slate-600'} />
          <span>¡Llegaron las ideas! Eureka</span>
        </button>
      </div>
    </div>
  );
}