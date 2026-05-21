import React, { useEffect, useState } from 'react';
import { Phase, AppState, DespejeActivity } from '../types';
import { 
  Lightbulb, Coffee, Headphones, Radio, Footprints, Activity, BookOpen, 
  Globe, Gamepad2, Puzzle, Wind, TreePine, PenTool, Palette, 
  CheckCircle2, Circle, Clock, FastForward, RefreshCw, ChefHat, 
  Dumbbell, Popcorn, PenLine, Sparkles, Utensils, Tv, Eraser, CalendarDays, Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateDespejeContent } from '../services/ai';
import ReactMarkdown from 'react-markdown';

interface Props {
  setPhase: (phase: Phase) => void;
  state: AppState;
  updateState: (updates: Partial<AppState>) => void;
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

export function Despeje({ setPhase, state, updateState }: Props) {
  const [now, setNow] = useState(Date.now());
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPlan, setShowPlan] = useState(false);

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
          despejeStartTime: Date.now() 
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
        despejeDayPlan: 'Disfruta de un día completamente libre. Desconecta de la urgencia del problema y confía en el proceso.',
        despejeStartTime: Date.now() 
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
    <div className="flex flex-col h-full bg-gradient-to-b from-[#1C2621] to-[#121915] text-[#EBECEB] -m-4 md:-m-6 p-5 md:p-6 rounded-3xl relative overflow-hidden shadow-2xl">
      
      {/* Absolute overlay starry sky look */}
      <div className="absolute top-10 left-10 w-1.5 h-1.5 rounded-full bg-teal-400 opacity-60 animate-pulse"></div>
      <div className="absolute top-24 right-16 w-1 h-1 rounded-full bg-amber-200 opacity-80 animate-pulse delay-500"></div>
      <div className="absolute bottom-32 left-20 w-1 h-1 rounded-full bg-teal-200 opacity-40 animate-pulse delay-1000"></div>

      <div className="flex-1 flex flex-col space-y-5 overflow-hidden">
        
        {/* Step Header */}
        <div className="text-center space-y-2 mt-2 relative">
          <div className="inline-flex items-center justify-center p-2.5 bg-teal-950 border border-teal-800/40 text-teal-400 rounded-2xl shadow-sm mb-1 animate-float">
            <Moon size={22} />
          </div>
          <span className="block text-[9px] uppercase tracking-widest text-teal-400 font-bold">Paso 2 de 4</span>
          <h2 className="text-2xl font-bold text-white serif-title leading-none">Momento de Despeje</h2>
          <p className="text-slate-400 text-xs max-w-xs mx-auto">
            Disuelve la atención focalizada para encender la incubación del hemisferio derecho. Sigue tu plan o haz recreaciones.
          </p>
          
          {/* Dev button to skip time */}
          {!isTimeUp && !isGenerating && (
            <button 
              onClick={devSkipTime}
              className="absolute top-0 right-0 p-2 bg-teal-950/80 hover:bg-teal-900 text-teal-300 border border-teal-800/50 rounded-xl text-[10px] flex items-center space-x-1 shadow-md transition-all active:scale-95"
              title="Acelerar incubación mental (24 hrs)"
            >
              <FastForward size={12} />
              <span className="font-semibold">Simular 24h</span>
            </button>
          )}
        </div>

        {isGenerating ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4">
            <div className="relative flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute w-6 h-6 rounded-full bg-teal-500/20 animate-breath"></div>
            </div>
            <p className="text-teal-400 font-medium text-xs tracking-wide">Estructurando un santuario de descanso...</p>
          </div>
        ) : (
          <>
            {/* Custom Tab Bar styled beautifully */}
            <div className="flex justify-center border-b border-teal-950 mb-1 flex-shrink-0">
              <button
                type="button"
                className={`flex-1 py-2 px-4 border-b-2 font-bold text-xs tracking-wider uppercase transition-colors outline-none cursor-pointer ${
                  showPlan 
                    ? 'border-teal-400 text-teal-300' 
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
                onClick={() => setShowPlan(true)}
              >
                Plan de Alivio
              </button>
              <button
                type="button"
                className={`flex-1 py-2 px-4 border-b-2 font-bold text-xs tracking-wider uppercase transition-colors outline-none cursor-pointer ${
                  !showPlan 
                    ? 'border-teal-400 text-teal-300' 
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
                onClick={() => setShowPlan(false)}
              >
                Actividades ({state.despejeActivities.filter(a => a.completed).length}/{state.despejeActivities.length})
              </button>
            </div>

            {/* List/Plan view */}
            <div className="flex-1 overflow-y-auto pb-4 px-1 min-h-[150px]">
              {showPlan && state.despejeDayPlan ? (
                <div className="bg-[#18201B] border border-teal-900/60 p-5 rounded-2xl prose prose-invert prose-xs max-w-none text-slate-300">
                  <div className="flex items-center space-x-2 text-teal-400 mb-3 border-b border-teal-950 pb-2 flex-shrink-0">
                    <CalendarDays size={18} />
                    <h3 className="text-sm font-semibold m-0 text-white">Tu Día Sin Prisa</h3>
                  </div>
                  <div className="leading-relaxed text-xs">
                    <ReactMarkdown>{state.despejeDayPlan}</ReactMarkdown>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {state.despejeActivities.map((rec, idx) => (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      key={rec.id}
                      onClick={() => toggleActivity(rec.id)}
                      className={`p-3.5 border rounded-2xl transition-all duration-200 cursor-pointer group flex items-start space-x-3.5 select-none ${
                        rec.completed 
                          ? 'bg-teal-950/20 border-teal-800/60' 
                          : 'bg-[#18201B]/80 border-teal-950/80 hover:bg-[#1E2822]'
                      }`}
                    >
                      <div className={`mt-0.5 ${rec.completed ? 'text-teal-400' : 'text-slate-500'}`}>
                        {rec.completed ? <CheckCircle2 size={20} className="stroke-[2.5]" /> : <Circle size={20} />}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-bold text-xs tracking-wide ${rec.completed ? 'text-teal-300 line-through opacity-60' : 'text-slate-100'}`}>
                          {rec.title}
                        </h3>
                        <p className={`text-[11px] mt-0.5 leading-relaxed ${rec.completed ? 'text-teal-600/50 line-through' : 'text-slate-400'}`}>
                          {rec.desc}
                        </p>
                      </div>

                      <div className={`p-1.5 rounded-xl flex-shrink-0 ${rec.completed ? 'bg-teal-950/30 text-teal-600/50' : 'bg-[#111613] text-teal-400 border border-teal-900/30'}`}>
                        {ICON_MAP[rec.iconId] || <Coffee size={18} />}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Status & Timer Card */}
            <div className="bg-[#151D18] p-4 rounded-2xl border border-teal-900/50 text-center space-y-2.5 flex-shrink-0 shadow-inner">
              {!allCompleted ? (
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Completa tu plan o marca cada una de tus actividades personalizadas para relajar tu corteza prefrontal.
                </p>
              ) : !isTimeUp ? (
                <div className="flex flex-col items-center space-y-1.5">
                  <p className="text-emerald-400 text-xs font-semibold flex items-center justify-center gap-1.5">
                    <CheckCircle2 size={14} className="stroke-[2.5]" /> Actividades listas. Deja reposar la mente.
                  </p>
                  <div className="flex items-center space-x-2 text-teal-300 font-mono text-base bg-teal-950/80 border border-teal-900/40 px-3.5 py-1 rounded-full shadow-sm">
                    <Clock size={16} />
                    <span>{formatTime(timeLeft)}</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-emerald-400 text-xs font-semibold flex items-center justify-center gap-1.5">
                    <Sparkles size={14} /> ¡Fase de calma e incubación completada!
                  </p>
                  <p className="text-[10px] text-slate-400">Es hora de abrir compuertas para las ideas.</p>
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
            className="w-full py-2.5 bg-teal-950 hover:bg-teal-900 text-teal-300 border border-teal-900/40 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-all"
          >
            <RefreshCw size={13} />
            <span>Volver a iniciar despeje</span>
          </button>
        )}
        
        <button
          type="button"
          onClick={() => setPhase('eureka')}
          disabled={!canProceed || isGenerating}
          className={`w-full py-4 rounded-xl font-bold text-base flex items-center justify-center space-x-2.5 transition-all ${
            canProceed && !isGenerating
              ? 'bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-950/40 active:scale-[0.99]' 
              : 'bg-teal-950/40 text-slate-600 cursor-not-allowed border border-teal-950/80'
          }`}
        >
          <Lightbulb size={20} className={canProceed && !isGenerating ? "text-amber-300 animate-pulse" : "text-slate-600"} />
          <span>¡Llegaron las ideas! Eureka</span>
        </button>
      </div>
    </div>
  );
}
