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
    color: 'bg-calm-coral/35 border-calm-coral/50',
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
    color: 'bg-calm-duckegg/40 border-calm-duckegg/50',
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
    color: 'bg-calm-blush/40 border-calm-blush/60',
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
    color: 'bg-calm-smoke/45 border-calm-smoke/60',
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
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-calm-duckegg/40 dark:bg-calm-emeraldsea/25 text-calm-emeraldsea dark:text-calm-duckegg border border-calm-duckegg dark:border-calm-emeraldsea shadow-sm mb-2 animate-float">
            <Compass size={32} />
          </div>
          <h2 className="text-4xl font-bold text-calm-olive dark:text-white serif-title">Libera tu Mente</h2>
          <p className="text-sm text-calm-olive/95 dark:text-slate-200 max-w-sm mx-auto leading-relaxed font-semibold">
            Un proceso guiado en 4 pasos científicos para superar bloqueos creativos, utilizando técnicas de incubación mental.
          </p>
        </div>

        {/* Categories Grid or Stack */}
        <div className="space-y-6 calm-card p-6 border border-calm-sage-200/60 dark:border-teal-950/85 dark:bg-[#17221d]/75 shadow-sm">
          <div className="text-center space-y-1">
            <h3 className="text-lg font-bold text-calm-olive dark:text-white">
              ¿Qué te ayuda a desconectar?
            </h3>
            <p className="text-sm text-calm-olive/95 dark:text-slate-200 font-semibold mt-1">
              Selecciona tus actividades favoritas para que podamos diseñar tu día de descanso ideal.
            </p>
          </div>
          
          <div className="space-y-5">
            {CATEGORIES.map((cat) => (
              <div key={cat.id} className="space-y-2.5">
                <h4 className="text-xs font-bold text-calm-sage-700 dark:text-calm-duckegg uppercase tracking-widest flex items-center gap-1.5 font-extrabold">
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
                            ? 'border-calm-sage-700 bg-calm-sage-600 text-white font-semibold shadow-sm scale-[1.02]'
                            : 'border-calm-sage-200 dark:border-teal-900/65 bg-calm-cream/95 dark:bg-[#202E26]/55 text-calm-olive dark:text-[#EBECEB] hover:border-calm-sage-500 dark:hover:border-teal-800 hover:bg-calm-cream dark:hover:bg-[#25362C]/75 dark:hover:text-white'
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
