import React from 'react';
import { Phase, AppState } from '../types';
import { ArrowRight, Sparkles } from 'lucide-react';

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
    subs: [
      { id: 'deporte:correr', label: 'Trotar/Caminar al aire libre' },
      { id: 'deporte:yoga', label: 'Yoga/Estiramiento' },
      { id: 'deporte:pesas', label: 'Pesas/HIIT' },
      { id: 'deporte:equipo', label: 'Deportes de equipo (fútbol, basket)' },
      { id: 'deporte:bici', label: 'Ciclismo' }
    ]
  },
  {
    id: 'entretenimiento',
    title: 'Entretenimiento',
    icon: '🍿',
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
    <div className="flex flex-col h-full overflow-y-auto pb-6">
      <div className="flex-1 flex flex-col space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-teal-100 text-teal-500 mb-4 mt-6">
            <Sparkles size={40} />
          </div>
          <h2 className="text-3xl font-bold text-slate-800">Libera tu Mente</h2>
          <p className="text-slate-600 max-w-md mx-auto">
            Un proceso guiado en 4 pasos para superar el bloqueo creativo y encontrar soluciones innovadoras.
          </p>
        </div>

        <div className="space-y-6 px-2">
          <h3 className="text-lg font-bold text-slate-800 text-center">
            ¿Qué te ayuda a relajarte? (Sé específico)
          </h3>
          
          <div className="space-y-6">
            {CATEGORIES.map((cat) => (
              <div key={cat.id} className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-500 flex items-center gap-2">
                  <span>{cat.icon}</span> {cat.title}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {cat.subs.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => toggleInterest(sub.label)}
                      className={`px-3 py-1.5 rounded-full border text-sm transition-all text-left ${
                        state.interests.includes(sub.label)
                          ? 'border-teal-500 bg-teal-50 text-teal-700 font-semibold'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-teal-200'
                      }`}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-8">
        <button
          onClick={() => setPhase('afinar')}
          className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-bold text-lg flex items-center justify-center space-x-2 transition-colors shadow-lg shadow-teal-200"
        >
          <span>Comenzar el Proceso</span>
          <ArrowRight size={24} />
        </button>
      </div>
    </div>
  );
}
