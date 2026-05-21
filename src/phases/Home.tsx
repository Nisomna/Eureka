import React from 'react';
import { Phase, AppState } from '../types';
import { ArrowRight, Sparkles, Compass } from 'lucide-react';

interface Props {
  setPhase: (phase: Phase) => void;
  state: AppState;
  updateState: (updates: Partial<AppState>) => void;
}

const CATEGORIES = [
  {
    id: 'arte',
    title: 'Arte y Creatividad',
    icon: '🎨',
    color: 'bg-orange-50/70 border-orange-100',
    subs: [
      { id: 'arte:dibujar', label: 'Dibuje/Boceto' },
      { id: 'arte:pintar', label: 'Pintura' },
      { id: 'arte:fotografia', label: 'Fotografía' },
      { id: 'arte:escribir', label: 'Escribir Poesía/Cuento' },
    ]
  },
  {
    id: 'deporte',
    title: 'Deporte y Movimiento',
    icon: '🏃',
    color: 'bg-emerald-50/70 border-emerald-100',
    subs: [
      { id: 'deporte:correr', label: 'Trotar/Caminar al aire libre' },
      { id: 'deporte:yoga', label: 'Yoga/Estiramiento' },
      { id: 'deporte:pesas', label: 'Pesas/HIIT' },
      { id: 'deporte:equipo', label: 'Deportes de equipo' },
      { id: 'deporte:bici', label: 'Ciclismo' }
    ]
  },
  {
    id: 'entretenimiento',
    title: 'Entretenimiento y Ocio',
    icon: '🍿',
    color: 'bg-rose-50/70 border-rose-100',
    subs: [
      { id: 'ent:leer', label: 'Leer ficción/cómics' },
      { id: 'ent:leer_nf', label: 'Leer no ficción/artículos' },
      { id: 'ent:cine', label: 'Ver Series o Películas' },
      { id: 'ent:videojuegos', label: 'Jugar Videojuegos (Consola/PC)' },
      { id: 'ent:mobile', label: 'Juegos de Móvil' },
      { id: 'ent:mesa', label: 'Juegos de mesa/Puzzle' },
    ]
  },
  {
    id: 'bienestar',
    title: 'Hogar, Bienestar y Música',
    icon: '🧘',
    color: 'bg-indigo-50/70 border-indigo-100',
    subs: [
      { id: 'bien:meditar', label: 'Meditación' },
      { id: 'bien:cocinar', label: 'Cocinar algo nuevo/Hornear' },
      { id: 'bien:limpiar', label: 'Limpiar/Ordenar espacios' },
      { id: 'bien:musica', label: 'Escuchar música/Descubrir bandas' },
      { id: 'bien:instrumento', label: 'Tocar un instrumento' },
      { id: 'bien:podcast', label: 'Escuchar Podcasts' }
    ]
  }
];

export function Home({ setPhase, state, updateState }: Props) {
  const toggleInterest = (id: string) => {
    if (state.interests.includes(id)) {
      updateState({ interests: state.interests.filter((i) => i !== id) });
    } else {
      updateState({ interests: [...state.interests, id] });
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-24 px-1">
      <div className="flex-1 flex flex-col space-y-8">
        
        {/* Intro Banner */}
        <div className="text-center space-y-3 pt-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 border border-teal-100 dark:border-teal-900 shadow-sm mb-2 animate-float">
            <Compass size={32} />
          </div>
          <h2 className="text-4xl font-bold text-calm-olive dark:text-white serif-title">Libera tu Mente</h2>
          <p className="text-sm text-calm-olive/70 dark:text-[#EBECEB]/70 max-w-sm mx-auto leading-relaxed">
            Un proceso guiado en 4 pasos científicos para superar bloqueos creativos, utilizando técnicas de incubación mental.
          </p>
        </div>

        {/* Categories Grid or Stack */}
        <div className="space-y-6 calm-card p-6 border border-calm-sage-100/60 dark:border-teal-950/85 bg-white/70 dark:bg-[#17221d]/75 shadow-sm">
          <div className="text-center space-y-1">
            <h3 className="text-lg font-bold text-calm-olive dark:text-white">
              ¿Qué te ayuda a desconectar?
            </h3>
            <p className="text-xs text-calm-olive/50 dark:text-[#EBECEB]/50">
              Selecciona tus actividades favoritas para que podamos diseñar tu día de descanso ideal.
            </p>
          </div>
          
          <div className="space-y-5">
            {CATEGORIES.map((cat) => (
              <div key={cat.id} className="space-y-2.5">
                <h4 className="text-xs font-bold text-calm-sage-700 dark:text-teal-400 uppercase tracking-widest flex items-center gap-1.5">
                  <span className="text-base">{cat.icon}</span> {cat.title}
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {cat.subs.map((sub) => {
                    const isSelected = state.interests.includes(sub.label);
                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => toggleInterest(sub.label)}
                        className={`px-3.5 py-2 rounded-xl border text-xs transition-all duration-200 text-left cursor-pointer select-none font-medium ${
                          isSelected
                            ? 'border-calm-sage-500 bg-calm-sage-500 text-white font-semibold shadow-sm scale-[1.02]'
                            : 'border-calm-sage-100/60 dark:border-teal-900/65 bg-white/50 dark:bg-[#202E26]/55 text-calm-olive/80 dark:text-[#EBECEB]/85 hover:border-calm-sage-300 dark:hover:border-teal-800 hover:bg-white dark:hover:bg-[#25362C]/75 dark:hover:text-white'
                        }`}
                      >
                        {sub.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Button Action */}
      <div className="pt-6">
        <button
          onClick={() => setPhase('afinar')}
          className="w-full py-4 bg-calm-sage-500 hover:bg-calm-sage-600 active:scale-[0.99] text-white rounded-2xl font-bold text-base flex items-center justify-center space-x-2 transition-all shadow-lg shadow-calm-sage-200/50 dark:shadow-none"
        >
          <span>Empezar con Paso 1: Afinar</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
