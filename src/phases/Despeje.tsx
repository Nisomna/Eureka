import React, { useEffect, useState } from 'react';
import { Phase, AppState, DespejeActivity } from '../types';
import { 
  Lightbulb, Coffee, Headphones, Radio, Footprints, Activity, BookOpen, 
  Globe, Gamepad2, Puzzle, Wind, TreePine, PenTool, Palette, 
  CheckCircle2, Circle, Clock, FastForward, RefreshCw, ChefHat, 
  Dumbbell, Popcorn, PenLine, Sparkles, Utensils, Tv, Eraser, CalendarDays, Moon, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateDespejeContent } from '../services/ai';
import ReactMarkdown from 'react-markdown';

interface Props {
  setPhase: (phase: Phase) => void;
  state: AppState;
  updateState: (updates: Partial<AppState>) => void;
  isDark?: boolean;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  headphones: <Headphones size={20} />,
  radio: <Radio size={20} />,
  footprints: <Footprints size={20} />,
  activity: <Activity size={20} />,
  book: <BookOpen size={20} />,
  globe: <Globe size={20} />,
  gamepad: <Gamepad2 size={20} />,
  puzzle: <Puzzle size={20} />,
  wind: <Wind size={20} />,
  tree: <TreePine size={20} />,
  pen: <PenTool size={20} />,
  palette: <Palette size={20} />,
  coffee: <Coffee size={20} />,
  chefHat: <ChefHat size={20} />,
  utensils: <Utensils size={20} />,
  dumbbell: <Dumbbell size={20} />,
  tv: <Tv size={20} />,
  popcorn: <Popcorn size={20} />,
  penLine: <PenLine size={20} />,
  sparkles: <Sparkles size={20} />,
  eraser: <Eraser size={20} />
};

export function Despeje({ setPhase, state, updateState, isDark }: Props) {
  const [now, setNow] = useState(Date.now());
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPlan, setShowPlan] = useState(false);
  const isDarkModeActive = isDark !== undefined ? isDark : document.documentElement.classList.contains('dark');

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (state.despejeActivities.length === 0) {
      generateActivities();
    }
  }, []);

  const generateActivities = async () => {
    setIsGenerating(true);
    try {
      const result = await generateDespejeContent(state.interests, state.problem);
      if (result && result.activities && result.dayPlan) {
        const newActivities = result.activities.map((a: any) => ({
          id: a.id,
          title: a.title,
          desc: a.desc,
          iconId: a.iconId || 'coffee',
          completed: false
        }));
        
        updateState({ 
          despejeActivities: newActivities,
          despejeDayPlan: result.dayPlan,
          despejeStartTime: Date.now(),
          isQuotaActive: result.isQuotaExceeded || false
        });
      } else {
        throw new Error("PWA: Empty results");
      }
    } catch (e) {
      console.warn(e);
      // Fallback
      updateState({ 
        despejeActivities: [
          { id: 'f1', title: 'Caminar sin rumbo fijo', desc: 'Sal y camina 15 minutos sin revisar tu teléfono móvil.', iconId: 'footprints', completed: false },
          { id: 'f2', title: 'Preparar una infusión caliente', desc: 'Disfruta cada sorbo enfocándote en el aroma y el calor.', iconId: 'coffee', completed: false },
          { id: 'f3', title: 'Escuchar música ambiental', desc: 'Pon melodías tranquilas que expandan tu foco.', iconId: 'headphones', completed: false }
        ],
        despejeDayPlan: 'Disfruta de un día completamente libre y restaurador. Desconecta de la urgencia del problema de incubación y confía plenamente en tu subconsciente.',
        despejeStartTime: Date.now(),
        isQuotaActive: true
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleActivity = (id: string) => {
    const updated = state.despejeActivities.map(a => 
      a.id === id ? { ...a, completed: !a.completed } : a
    );
    updateState({ despejeActivities: updated });
  };

  const devSkipTime = () => {
    if (state.despejeStartTime) {
      updateState({ despejeStartTime: state.despejeStartTime - (24 * 60 * 60 * 1000) });
    }
  };

  const allCompleted = state.despejeActivities.length > 0 && state.despejeActivities.every(a => a.completed);
  
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  const timeElapsed = state.despejeStartTime ? (now - state.despejeStartTime) : 0;
  const timeLeft = Math.max(0, ONE_DAY_MS - timeElapsed);
  const isTimeUp = timeLeft === 0;

  const canProceed = allCompleted && isTimeUp;

  const formatTime = (ms: number) => {
    const h = Math.floor(ms / (1000 * 60 * 60));
    const m = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((ms % (1000 * 60)) / 1000);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-calm-sand to-calm-duckegg/25 dark:from-[#1C2621] dark:to-[#121915] text-calm-olive dark:text-[#EBECEB] -m-4 md:-m-6 p-5 md:p-6 rounded-3xl relative overflow-hidden shadow-2xl transition-all">
      
      {/* Absolute overlay starry sky look */}
      <div className="absolute top-10 left-10 w-1.5 h-1.5 rounded-full bg-calm-emeraldsea/50 dark:bg-calm-duckegg opacity-60 animate-pulse"></div>
      <div className="absolute top-24 right-16 w-1 h-1 rounded-full bg-calm-butterscotch/50 dark:bg-calm-butterscotch/70 opacity-80 animate-pulse delay-500"></div>
      <div className="absolute bottom-32 left-20 w-1 h-1 rounded-full bg-calm-duckegg dark:bg-calm-duckegg/40 opacity-40 animate-pulse delay-1000"></div>

      <div className="flex-1 flex flex-col space-y-6 overflow-hidden">
        
        {/* Step Header */}
        <div className="text-center space-y-3 mt-2 relative">
          <div className="inline-flex items-center justify-center p-3 bg-calm-smoke/15 dark:bg-calm-smoke/25 border border-calm-smoke/35 dark:border-calm-smoke/45 text-calm-sage-700 dark:text-calm-duckegg rounded-2xl shadow-sm mb-1 animate-float">
            <Moon size={24} />
          </div>
          <span className="block text-[10px] uppercase tracking-widest text-calm-sage-700 dark:text-calm-duckegg font-extrabold">Paso 2 de 4</span>
          <h2 className="text-3xl font-bold text-calm-olive dark:text-white serif-title leading-none">Momento de Despeje</h2>
          <p className="text-calm-olive/95 dark:text-slate-200 text-sm max-w-md mx-auto font-medium">
            Disuelve la atención focalizada para encender la incubación del hemisferio derecho. Sigue tu plan o realiza actividades sugeridas.
          </p>
          
          {/* Dev button to skip time */}
          {!isTimeUp && !isGenerating && (
            <button 
              onClick={devSkipTime}
              className="absolute top-0 right-0 p-2.5 bg-calm-cream hover:bg-white dark:bg-[#1C2621]/90 dark:hover:bg-[#25322B] text-calm-sage-700 dark:text-calm-duckegg border border-calm-sage-200 dark:border-teal-950/60 rounded-xl text-xs flex items-center space-x-1.5 shadow-md transition-all active:scale-95 cursor-pointer font-bold"
              title="Acelerar incubación mental (24 hrs)"
            >
              <FastForward size={14} />
              <span>Simular 24h</span>
            </button>
          )}
        </div>

        {/* Quota Exceeded / Autonomous Calm Mode alert card */}
        {state.isQuotaActive && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-1 p-4 bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/25 dark:border-amber-500/15 rounded-2xl flex items-start space-x-3.5 text-left shadow-sm"
          >
            <div className="text-amber-500 dark:text-amber-400 mt-0.5 flex-shrink-0 animate-pulse">
              <AlertTriangle size={20} className="stroke-[2.5]" />
            </div>
            <div className="flex-1 text-xs">
              <span className="font-bold text-amber-700 dark:text-amber-300 block mb-1 text-sm">Modo de Calma Autónomo Activado</span>
              <span className="text-calm-olive/90 dark:text-slate-200 leading-relaxed block">
                Debido al alto volumen de consultas en el servidor, tu itinerario de descanso se ha configurado localmente basándose en tus hobbys declarados (<strong>{state.interests.join(', ') || 'Desconexión'}</strong>). Esto evita cualquier bloqueo de la API externa y te permite continuar tu incubación con total normalidad.
              </span>
            </div>
          </motion.div>
        )}

        {isGenerating ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4">
            <div className="relative flex items-center justify-center">
              <div className="w-14 h-14 border-4 border-calm-emeraldsea border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute w-8 h-8 rounded-full bg-calm-emeraldsea/20 animate-breath"></div>
            </div>
            <p className="text-calm-emeraldsea dark:text-calm-duckegg font-bold text-sm tracking-wide">Estructurando tu santuario de descanso...</p>
          </div>
        ) : (
          <>
            {/* Custom Tab Bar styled beautifully */}
            <div className="flex justify-center border-b border-calm-sage-100/60 dark:border-teal-900/30 mb-2 flex-shrink-0">
              <button
                type="button"
                className={`flex-1 py-3.5 px-4 border-b-2 font-extrabold text-sm tracking-wider uppercase transition-colors outline-none cursor-pointer ${
                  showPlan 
                    ? 'border-calm-emeraldsea text-calm-sage-800 dark:border-calm-duckegg dark:text-calm-duckegg' 
                    : 'border-transparent text-calm-sage-650 dark:text-slate-400 hover:text-calm-olive dark:hover:text-slate-300'
                }`}
                onClick={() => setShowPlan(true)}
              >
                Plan de Alivio
              </button>
              <button
                type="button"
                className={`flex-1 py-3.5 px-4 border-b-2 font-extrabold text-sm tracking-wider uppercase transition-colors outline-none cursor-pointer ${
                  !showPlan 
                    ? 'border-calm-emeraldsea text-calm-sage-800 dark:border-calm-duckegg dark:text-calm-duckegg' 
                    : 'border-transparent text-calm-sage-650 dark:text-slate-400 hover:text-calm-olive dark:hover:text-slate-300'
                }`}
                onClick={() => setShowPlan(false)}
              >
                Actividades ({state.despejeActivities.filter(a => a.completed).length}/{state.despejeActivities.length})
              </button>
            </div>

            {/* List/Plan view - MUCH MORE SPACIOUS AND HIGHLY LEGIBLE */}
            <div className="flex-1 overflow-y-auto pb-4 px-1 min-h-[180px]">
              {showPlan && state.despejeDayPlan ? (
                <div className={`p-6 sm:p-8 rounded-3xl border prose max-w-none shadow-md ${
                  isDarkModeActive 
                    ? 'bg-[#18201B] border-teal-950/50 text-[#EBECEB] prose-invert' 
                    : 'bg-calm-cream/95 border-calm-sage-200 text-calm-olive font-medium'
                }`}>
                  <div className="flex items-center space-x-3 text-calm-emeraldsea dark:text-calm-duckegg mb-5 border-b border-calm-sage-150 dark:border-teal-900/30 pb-3 flex-shrink-0">
                    <CalendarDays size={24} />
                    <h3 className="text-lg font-bold m-0 text-calm-olive dark:text-white">Tu Día Sin Prisa</h3>
                  </div>
                  <div className="leading-relaxed text-base sm:text-lg space-y-4 text-calm-olive/95 dark:text-slate-200">
                    <ReactMarkdown>{state.despejeDayPlan}</ReactMarkdown>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {state.despejeActivities.map((rec, idx) => (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      key={rec.id}
                      onClick={() => toggleActivity(rec.id)}
                      className={`p-6 sm:p-7 border rounded-3xl transition-all duration-200 cursor-pointer group flex items-start space-x-5 select-none ${
                        rec.completed 
                          ? 'bg-calm-duckegg/25 dark:bg-[#1E2B25]/25 border-calm-duckegg/60 dark:border-teal-900/40 shadow-inner scale-[0.99] opacity-80' 
                          : 'bg-calm-cream dark:bg-[#18201B] border-calm-sage-200/80 dark:border-teal-950 hover:bg-white dark:hover:bg-[#1E2822] hover:shadow-lg hover:scale-[1.008]'
                      }`}
                    >
                      <div className={`mt-1.5 flex-shrink-0 ${rec.completed ? 'text-calm-emeraldsea dark:text-calm-duckegg' : 'text-calm-sage-500 dark:text-slate-400 group-hover:scale-105 transition-transform'}`}>
                        {rec.completed 
                          ? <CheckCircle2 size={28} className="stroke-[2.5]" /> 
                          : <Circle size={28} className="stroke-2" />
                        }
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-bold text-base sm:text-lg tracking-wide ${rec.completed ? 'text-calm-sage-700/60 dark:text-calm-duckegg line-through opacity-60' : 'text-calm-olive dark:text-white'}`}>
                          {rec.title}
                        </h3>
                        <p className={`text-sm sm:text-base mt-2 leading-relaxed ${rec.completed ? 'text-calm-emeraldsea/55 dark:text-calm-duckegg/40 line-through' : 'text-calm-olive/95 dark:text-[#EBECEB]'}`}>
                          {rec.desc}
                        </p>
                      </div>

                      <div className={`p-4 rounded-2xl flex-shrink-0 self-center scale-110 [&_svg]:w-6 [&_svg]:h-6 ${rec.completed ? 'bg-calm-duckegg/30 dark:bg-[#1E2B25]/40 text-calm-emeraldsea' : 'bg-calm-sand dark:bg-[#111613] text-calm-emeraldsea dark:text-calm-duckegg border border-calm-duckegg/30 dark:border-teal-900/20'}`}>
                        {ICON_MAP[rec.iconId] || <Coffee size={24} />}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Status & Timer Card */}
            <div className="bg-calm-sage-100/40 dark:bg-[#151D18] p-4 rounded-2xl border border-calm-sage-200 dark:border-teal-900/50 text-center space-y-2.5 flex-shrink-0 shadow-sm">
              {!allCompleted ? (
                <p className="text-calm-olive dark:text-slate-300 text-[11px] leading-relaxed font-medium">
                  Completa tu plan o marca cada una de tus actividades personalizadas para relajar tu corteza prefrontal.
                </p>
              ) : !isTimeUp ? (
                <div className="flex flex-col items-center space-y-1.5">
                  <p className="text-calm-sage-700 dark:text-calm-duckegg text-xs font-bold flex items-center justify-center gap-1.5">
                    <CheckCircle2 size={14} className="stroke-[2.5]" /> Actividades listas. Deja reposar la mente.
                  </p>
                  <div className="flex items-center space-x-2 text-calm-emeraldsea dark:text-calm-duckegg font-mono text-base bg-calm-cream dark:bg-[#1C2621]/80 border border-calm-sage-200 dark:border-teal-950/45 px-3.5 py-1 rounded-full shadow-sm">
                    <Clock size={16} />
                    <span>{formatTime(timeLeft)}</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-calm-sage-700 dark:text-calm-duckegg text-xs font-bold flex items-center justify-center gap-1.5">
                    <Sparkles size={14} /> ¡Fase de calma e incubación completada!
                  </p>
                  <p className="text-[10px] text-calm-olive/85 dark:text-slate-400 font-medium">Es hora de abrir compuertas para las ideas.</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Button space */}
      <div className="pt-4 pb-1 space-y-2 flex-shrink-0">
        {isTimeUp && !isGenerating && (
          <button
            type="button"
            onClick={generateActivities}
            className="w-full py-2.5 bg-calm-cream/80 hover:bg-calm-cream dark:bg-[#1E2B25] dark:hover:bg-[#25322B] text-calm-sage-700 dark:text-calm-duckegg border border-calm-sage-200 dark:border-teal-950/40 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
          >
            <RefreshCw size={13} />
            <span>Volver a iniciar despeje</span>
          </button>
        )}
        
        <button
          type="button"
          onClick={() => setPhase('eureka')}
          disabled={!canProceed || isGenerating}
          className={`w-full py-4 rounded-xl font-bold text-base flex items-center justify-center space-x-2.5 transition-all cursor-pointer ${
            canProceed && !isGenerating
              ? 'bg-calm-sage-500 hover:bg-calm-sage-600 text-white shadow-lg shadow-calm-sage-200/50 dark:shadow-none active:scale-[0.992]' 
              : 'bg-calm-sage-50 dark:bg-[#1C2621]/40 text-calm-olive/30 dark:text-slate-600 border border-calm-sage-150/20 dark:border-teal-950/80 cursor-not-allowed'
          }`}
        >
          <Lightbulb size={20} className={canProceed && !isGenerating ? "text-calm-butterscotch animate-pulse" : "text-slate-600"} />
          <span>¡Llegaron las ideas! Eureka</span>
        </button>
      </div>
    </div>
  );
}
