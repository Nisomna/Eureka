import React, { useEffect, useState } from 'react';
import { Phase, AppState, DespejeActivity } from '../types';
import { Lightbulb, Coffee, Headphones, Radio, Footprints, Activity, BookOpen, Globe, Gamepad2, Puzzle, Wind, TreePine, PenTool, Palette, CheckCircle2, Circle, Clock, FastForward, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';

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
  coffee: <Coffee size={24} />
};

const ACTIVITIES_DB: Record<string, Omit<DespejeActivity, 'completed'>[]> = {
  musica: [
    { id: 'm1', title: 'Playlist Lo-Fi', desc: 'Música relajante sin letras para dejar la mente vagar.', iconId: 'headphones' },
    { id: 'm2', title: 'Exploración Sonora', desc: 'Pon una radio aleatoria de un género que no sueles escuchar.', iconId: 'radio' }
  ],
  caminar: [
    { id: 'c1', title: 'Paseo de 10 min', desc: 'Da una vuelta a la manzana sin mirar el celular.', iconId: 'footprints' },
    { id: 'c2', title: 'Estiramientos Activos', desc: 'Levántate y estira brazos y piernas para que fluya la sangre.', iconId: 'activity' }
  ],
  leer: [
    { id: 'l1', title: 'Artículo Aleatorio', desc: 'Abre Wikipedia y lee sobre un tema completamente nuevo.', iconId: 'globe' },
    { id: 'l2', title: 'Lectura Ligera', desc: 'Lee un cómic, un poema o un capítulo corto de ficción.', iconId: 'book' }
  ],
  jugar: [
    { id: 'j1', title: 'Juego Rápido', desc: 'Juega una partida de tu juego móvil favorito (máximo 15 min).', iconId: 'gamepad' },
    { id: 'j2', title: 'Rompecabezas', desc: 'Haz un Sudoku, un crucigrama o arma un puzzle físico.', iconId: 'puzzle' }
  ],
  meditar: [
    { id: 'me1', title: 'Respiración 4-7-8', desc: 'Inhala en 4s, sostén 7s, exhala en 8s. Repite 4 veces.', iconId: 'wind' },
    { id: 'me2', title: 'Sonidos Naturales', desc: 'Cierra los ojos y escucha sonidos de lluvia o bosque.', iconId: 'tree' }
  ],
  dibujar: [
    { id: 'd1', title: 'Garabatos Libres', desc: 'Toma un papel y dibuja formas sin sentido ni objetivo.', iconId: 'pen' },
    { id: 'd2', title: 'Mandalas', desc: 'Colorea un mandala o dibuja patrones repetitivos.', iconId: 'palette' }
  ],
};

const DEFAULT_ACTIVITIES: Omit<DespejeActivity, 'completed'>[] = [
  { id: 'def1', title: 'Tomar un Café/Té', desc: 'Prepárate una bebida caliente y disfrútala lentamente.', iconId: 'coffee' },
  { id: 'def2', title: 'Mirar por la Ventana', desc: 'Observa el exterior por 5 minutos sin pensar en nada.', iconId: 'globe' },
  { id: 'def3', title: 'Respiración Profunda', desc: 'Toma 10 respiraciones profundas y lentas.', iconId: 'wind' }
];

export function Despeje({ setPhase, state, updateState }: Props) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (state.despejeActivities.length === 0) {
      generateActivities();
    }
  }, []);

  const generateActivities = () => {
    let recs: Omit<DespejeActivity, 'completed'>[] = [];
    if (state.interests.length === 0) {
      recs = DEFAULT_ACTIVITIES;
    } else {
      state.interests.forEach(interest => {
        if (ACTIVITIES_DB[interest]) {
          recs = [...recs, ...ACTIVITIES_DB[interest]];
        }
      });
    }
    
    // Shuffle and pick up to 4
    const shuffled = recs.sort(() => 0.5 - Math.random()).slice(0, 4);
    const newActivities = shuffled.map(a => ({ ...a, completed: false }));
    
    updateState({ 
      despejeActivities: newActivities, 
      despejeStartTime: Date.now() 
    });
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
    <div className="flex flex-col h-full bg-slate-900 text-white -m-4 md:-m-8 p-4 md:p-8 rounded-none md:rounded-3xl">
      <div className="flex-1 flex flex-col space-y-6 overflow-hidden">
        
        <div className="text-center space-y-2 mt-4 relative">
          <h2 className="text-2xl font-bold text-blue-400">Momento de Despeje</h2>
          <p className="text-slate-400 text-sm max-w-xs mx-auto">
            Completa estas actividades y descansa un día entero para que tu cerebro procese la información.
          </p>
          
          {/* Dev button to skip time */}
          {!isTimeUp && (
            <button 
              onClick={devSkipTime}
              className="absolute top-0 right-0 p-2 bg-slate-800 text-slate-400 hover:text-white rounded-full text-xs flex items-center"
              title="Dev: Adelantar 24 horas"
            >
              <FastForward size={14} />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pb-4 px-1">
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
              </div>
              <div className={`p-2 rounded-xl ${rec.completed ? 'bg-blue-900/30 text-blue-400/50' : 'bg-slate-900 text-blue-400'}`}>
                {ICON_MAP[rec.iconId]}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Status & Timer */}
        <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 text-center space-y-2">
          {!allCompleted ? (
            <p className="text-slate-300 text-sm">Marca todas las actividades como completadas.</p>
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

      </div>

      <div className="pt-4 pb-2 space-y-3">
        {isTimeUp && (
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
          disabled={!canProceed}
          className={`w-full py-5 rounded-2xl font-bold text-xl flex items-center justify-center space-x-3 transition-all shadow-lg ${
            canProceed 
              ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/50 transform hover:scale-[1.02]' 
              : 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'
          }`}
        >
          <Lightbulb size={28} className={canProceed ? "text-yellow-300" : "text-slate-600"} />
          <span>¡Llegó la idea!</span>
        </button>
      </div>
    </div>
  );
}
