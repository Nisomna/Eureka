import React from 'react';
import { Phase, AppState } from '../types';
import { ArrowRight, Sparkles, Compass } from 'lucide-react';
import { soundTap, soundCheck, soundUncheck } from '../utils/sounds';

interface Props {
  setPhase: (phase: Phase) => void;
  state: AppState;
  updateState: (updates: Partial<AppState>) => void;
}

const CATEGORIES = [
  { id: 'arte', title: 'Arte y Creatividad', icon: '🎨', color: 'bg-calm-coral/20 border-calm-coral/40',
    subs: [{ id: 'arte:dibujar', label: 'Dibuje/Boceto' }, { id: 'arte:pintar', label: 'Pintura' }, { id: 'arte:fotografia', label: 'Fotografía' }, { id: 'arte:escribir', label: 'Poesía/Cuento' }] },
  { id: 'deporte', title: 'Deporte y Movimiento', icon: '🏃', color: 'bg-calm-duckegg/30 border-calm-duckegg/50',
    subs: [{ id: 'deporte:correr', label: 'Trotar/Caminar' }, { id: 'deporte:yoga', label: 'Yoga/Estiramiento' }, { id: 'deporte:pesas', label: 'Pesas/HIIT' }, { id: 'deporte:equipo', label: 'Deportes de equipo' }, { id: 'deporte:bici', label: 'Ciclismo' }] },
  { id: 'entretenimiento', title: 'Entretenimiento y Ocio', icon: '🍿', color: 'bg-calm-blush/30 border-calm-blush/50',
    subs: [{ id: 'ent:leer', label: 'Leer ficción' }, { id: 'ent:leer_nf', label: 'Leer no ficción' }, { id: 'ent:cine', label: 'Series / Películas' }, { id: 'ent:videojuegos', label: 'Videojuegos' }, { id: 'ent:mobile', label: 'Juegos móvil' }, { id: 'ent:mesa', label: 'Juegos de mesa' }] },
  { id: 'bienestar', title: 'Hogar, Bienestar y Música', icon: '🧘', color: 'bg-calm-smoke/30 border-calm-smoke/50',
    subs: [{ id: 'bien:meditar', label: 'Meditación' }, { id: 'bien:cocinar', label: 'Cocinar/Hornear' }, { id: 'bien:limpiar', label: 'Ordenar espacios' }, { id: 'bien:musica', label: 'Escuchar música' }, { id: 'bien:instrumento', label: 'Tocar instrumento' }, { id: 'bien:podcast', label: 'Podcasts' }] },
];

export function Home({ setPhase, state, updateState }: Props) {
  const toggleInterest = (label: string) => {
    const isSelected = state.interests.includes(label);
    if (isSelected) {
      soundUncheck();
      updateState({ interests: state.interests.filter(i => i !== label) });
    } else {
      soundCheck();
      updateState({ interests: [...state.interests, label] });
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-24 px-1">
      <div className="flex-1 flex flex-col space-y-5">

        {/* Header compacto horizontal */}
        <div className="flex items-center space-x-3 pt-3">
          <div className="w-12 h-12 rounded-2xl bg-calm-duckegg/30 dark:bg-calm-emeraldsea/20 text-calm-emeraldsea dark:text-calm-duckegg border border-calm-duckegg/50 dark:border-calm-emeraldsea/40 flex items-center justify-center shadow-sm animate-float shrink-0">
            <Compass size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-calm-olive dark:text-white serif-title leading-tight">Libera tu Mente</h2>
            <p className="text-xs text-calm-olive/70 dark:text-slate-300 font-medium mt-0.5">4 pasos científicos para superar bloqueos creativos</p>
          </div>
        </div>

        {/* Selector de hobbies */}
        <div className="calm-card p-4 border border-calm-sage-200/60 dark:border-teal-950/85 dark:bg-[#17221d]/75 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-calm-olive dark:text-white">¿Qué te ayuda a desconectar?</h3>
            <p className="text-xs text-calm-olive/65 dark:text-slate-400 mt-0.5">Selecciona para personalizar tu día de descanso.</p>
          </div>

          <div className="space-y-4">
            {CATEGORIES.map(cat => (
              <div key={cat.id} className="space-y-2">
                <h4 className="text-[10px] font-extrabold text-calm-sage-700 dark:text-calm-duckegg uppercase tracking-widest flex items-center gap-1.5">
                  <span className="text-sm">{cat.icon}</span> {cat.title}
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {cat.subs.map(sub => {
                    const isSelected = state.interests.includes(sub.label);
                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => toggleInterest(sub.label)}
                        className={`px-3 py-1.5 rounded-xl border text-xs transition-all duration-150 cursor-pointer select-none font-medium ${
                          isSelected
                            ? 'border-calm-sage-600 bg-calm-sage-600 text-white shadow-sm scale-[1.03]'
                            : 'border-calm-sage-200 dark:border-teal-900/60 bg-calm-cream/90 dark:bg-[#202E26]/50 text-calm-olive dark:text-[#EBECEB] hover:border-calm-sage-400 hover:bg-calm-cream dark:hover:bg-[#25362C]/75'
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

      <div className="pt-4">
        <button
          onClick={() => { soundTransition(); setPhase('afinar'); }}
          className="w-full py-3.5 bg-calm-sage-500 hover:bg-calm-sage-600 active:scale-[0.99] text-white rounded-2xl font-bold text-sm flex items-center justify-center space-x-2 transition-all shadow-lg shadow-calm-sage-200/40 dark:shadow-none"
        >
          <span>Empezar: Paso 1 — Afinar</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

function soundTransition() {
  [523, 659, 784, 1047].forEach((f, i) => {
    setTimeout(() => {
      try {
        const ac = new AudioContext();
        const osc = ac.createOscillator();
        const g = ac.createGain();
        osc.connect(g); g.connect(ac.destination);
        osc.frequency.value = f; osc.type = 'sine';
        g.gain.setValueAtTime(0.001, ac.currentTime);
        g.gain.linearRampToValueAtTime(0.07, ac.currentTime + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.35);
        osc.start(); osc.stop(ac.currentTime + 0.4);
      } catch {}
    }, i * 90);
  });
}
