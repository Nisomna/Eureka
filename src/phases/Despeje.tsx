import React, { useEffect, useState } from 'react';
import { Phase, AppState, DespejeActivity } from '../types';
import { Lightbulb, Coffee, Headphones, Radio, Footprints, Activity, BookOpen, Globe, Gamepad2, Puzzle, Wind, TreePine, PenTool, Palette, CheckCircle2, Circle, Clock, FastForward, RefreshCw, ChefHat, Dumbbell, Popcorn, PenLine, Sparkles, Utensils, Tv, Eraser, CalendarDays, BellPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateDespejeContent } from '../services/ai';
import ReactMarkdown from 'react-markdown';
import { scheduleViaSW } from '../lib/notificationUtils';
import { ScheduledNotification } from '../lib/notificationTypes';

interface Props {
  setPhase: (phase: Phase) => void;
  state: AppState;
  updateState: (updates: Partial<AppState>) => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  headphones: <Headphones size={24} />,
  radio: <Radio size={24} />,
  footprints: <Footprints size={24} />,
  activity: <Activity size={24} />,
  book: <BookOpen size={24} />,
  globe: <Globe size={24} />,
  gamepad: <Gamepad2 size={24} />,
  puzzle: <Puzzle size={24} />,
  wind: <Wind size={24} />,
  tree: <TreePine size={24} />,
  pen: <PenTool size={24} />,
  palette: <Palette size={24} />,
  coffee: <Coffee size={24} />,
  chefHat: <ChefHat size={24} />,
  utensils: <Utensils size={24} />,
  dumbbell: <Dumbbell size={24} />,
  tv: <Tv size={24} />,
  popcorn: <Popcorn size={24} />,
  penLine: <PenLine size={24} />,
  sparkles: <Sparkles size={24} />,
  eraser: <Eraser size={24} />
};

export function Despeje({ setPhase, state, updateState }: Props) {
  const [now, setNow] = useState(Date.now());
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPlan, setShowPlan] = useState(false);
  const [notified, setNotified] = useState(false);

  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  const timeElapsed = state.despejeStartTime ? (now - state.despejeStartTime) : 0;
  const timeLeft = Math.max(0, ONE_DAY_MS - timeElapsed);
  const isTimeUp = timeLeft === 0;

  useEffect(() => {
    if (isTimeUp && !notified && state.despejeStartTime) {
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        new Notification("¡Tiempo de Incubación Completo!", { 
          body: "Tu mente ha tenido tiempo para despejarse. Es el momento de buscar ese Eureka.",
          icon: "/icon-192.svg"
        });
        setNotified(true);
      }
    }
  }, [isTimeUp, notified, state.despejeStartTime]);

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
      setNotified(false);
    } else {
      // Fallback
      updateState({ 
        despejeActivities: [
          { id: 'f1', title: 'Tomar un descanso general', desc: 'Desconecta tu mente.', iconId: 'coffee', completed: false }
        ],
        despejeDayPlan: 'Disfruta de un día tranquilo escuchando a tu mente, come sano y relájate.',
        despejeStartTime: Date.now() 
      });
    }
    setIsGenerating(false);
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
  const canProceed = allCompleted && isTimeUp;

  const formatTime = (ms: number) => {
    const h = Math.floor(ms / (1000 * 60 * 60));
    const m = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((ms % (1000 * 60)) / 1000);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-white -m-4 md:-m-8 p-4 md:p-8 rounded-none md:rounded-3xl relative">
      <div className="flex-1 flex flex-col space-y-6 overflow-hidden">
        
        <div className="text-center space-y-2 mt-4 relative">
          <h2 className="text-2xl font-bold text-blue-400">Momento de Despeje</h2>
          <p className="text-slate-400 text-sm max-w-xs mx-auto">
            Descansa un día entero para que tu cerebro procese la información. Sigue tu plan o elige actividades sueltas.
          </p>
          
          {/* Dev button to skip time */}
          {!isTimeUp && !isGenerating && (
            <button 
              onClick={devSkipTime}
              className="absolute top-0 right-0 p-2 bg-slate-800 text-slate-400 hover:text-white rounded-full text-xs flex items-center shadow-lg"
              title="Dev: Adelantar 24 horas"
            >
              <FastForward size={14} />
            </button>
          )}
        </div>

        {isGenerating ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-blue-400 font-medium">Diseñando tu descanso...</p>
          </div>
        ) : (
          <>
            <div className="flex justify-center border-b border-slate-800 mb-2">
              <button
                className={`py-2 px-4 border-b-2 font-medium text-sm transition-colors ${showPlan ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                onClick={() => setShowPlan(true)}
              >
                Plan del Día
              </button>
              <button
                className={`py-2 px-4 border-b-2 font-medium text-sm transition-colors ${!showPlan ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                onClick={() => setShowPlan(false)}
              >
                Actividades
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pb-4 px-1">
              {showPlan && state.despejeDayPlan ? (
                <div className="bg-slate-800 border border-slate-700 p-5 rounded-2xl prose prose-invert prose-sm max-w-none prose-p:text-slate-300">
                  <div className="flex items-center space-x-2 text-blue-400 mb-4 border-b border-slate-700 pb-3">
                    <CalendarDays size={20} />
                    <h3 className="text-lg font-semibold m-0 text-white">Tu Plan Relajado</h3>
                  </div>
                  <ReactMarkdown>{state.despejeDayPlan}</ReactMarkdown>
                </div>
              ) : (
                <div className="space-y-3">
                  {state.despejeActivities.map((rec, idx) => (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      key={rec.id}
                      onClick={() => toggleActivity(rec.id)}
                      className={`p-4 border rounded-2xl transition-colors cursor-pointer group flex items-start space-x-4 ${
                        rec.completed 
                          ? 'bg-blue-900/20 border-blue-800/50' 
                          : 'bg-slate-800 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      <div className={`mt-1 ${rec.completed ? 'text-blue-400' : 'text-slate-500'}`}>
                        {rec.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-semibold ${rec.completed ? 'text-blue-300 line-through opacity-70' : 'text-slate-200'}`}>
                          {rec.title}
                        </h3>
                        <p className={`text-sm mt-1 ${rec.completed ? 'text-blue-400/50 line-through' : 'text-slate-400'}`}>
                          {rec.desc}
                        </p>
                        {!rec.completed && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              const notif: ScheduledNotification = {
                                id: Math.random().toString(36).substr(2, 9),
                                title: `Rutina: ${rec.title}`,
                                message: rec.desc,
                                scheduledAt: Date.now() + 60 * 60 * 1000, // +1 hour by default
                                repeat: 'none',
                                repeatMinutes: null,
                                sound: true,
                                soundRepeat: 3,
                                fired: false,
                                createdAt: Date.now()
                              };
                              scheduleViaSW(notif);
                              alert("Recordatorio programado para dentro de 1 hora");
                            }}
                            className="mt-2 text-[10px] bg-slate-700 hover:bg-slate-600 text-slate-300 px-2 py-1 rounded-lg flex items-center gap-1"
                          >
                            <BellPlus size={10} /> Programar alarma
                          </button>
                        )}
                      </div>
                      <div className={`p-2 rounded-xl flex-shrink-0 ${rec.completed ? 'bg-blue-900/30 text-blue-400/50' : 'bg-slate-900 text-blue-400'}`}>
                        {ICON_MAP[rec.iconId] || <Coffee size={24} />}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Status & Timer */}
            <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 text-center space-y-2 flex-shrink-0">
              {!allCompleted ? (
                <p className="text-slate-300 text-sm">Marca todas las actividades (o sigue tu Plan del Día) para avanzar más rápido.</p>
              ) : !isTimeUp ? (
                <div className="flex flex-col items-center space-y-1">
                  <p className="text-green-400 text-sm font-semibold flex items-center justify-center gap-2">
                    <CheckCircle2 size={16} /> Actividades listas. Ahora, a descansar.
                  </p>
                  <div className="flex items-center space-x-2 text-slate-300 font-mono text-lg">
                    <Clock size={18} />
                    <span>{formatTime(timeLeft)}</span>
                  </div>
                </div>
              ) : (
                <p className="text-blue-400 text-sm font-semibold">¡Día de descanso completado!</p>
              )}
            </div>
          </>
        )}
      </div>

      <div className="pt-4 pb-2 space-y-3 flex-shrink-0">
        {isTimeUp && !isGenerating && (
          <button
            onClick={generateActivities}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium text-sm flex items-center justify-center space-x-2 transition-all"
          >
            <RefreshCw size={16} />
            <span>Necesito otro día de despeje</span>
          </button>
        )}
        
        <button
          onClick={() => setPhase('eureka')}
          disabled={!canProceed || isGenerating}
          className={`w-full py-5 rounded-2xl font-bold text-xl flex items-center justify-center space-x-3 transition-all shadow-lg ${
            canProceed && !isGenerating
              ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/50 transform hover:scale-[1.02]' 
              : 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'
          }`}
        >
          <Lightbulb size={28} className={canProceed && !isGenerating ? "text-yellow-300" : "text-slate-600"} />
          <span>¡Llegó la idea!</span>
        </button>
      </div>
    </div>
  );
}
