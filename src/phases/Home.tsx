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
  { id: 'arte', title: 'Arte y Creatividad', icon: '🎨', color: 'bg-[var(--accent-action)]/10 border-calm-coral/30', labelColor: 'text-[var(--accent-action)] dark:text-[var(--accent-action)]',
    subs: [{ id: 'arte:dibujar', label: 'Dibuje/Boceto' }, { id: 'arte:pintar', label: 'Pintura' }, { id: 'arte:fotografia', label: 'Fotografía' }, { id: 'arte:escribir', label: 'Poesía/Cuento' }] },
  { id: 'deporte', title: 'Deporte y Movimiento', icon: '🏃', color: 'bg-[var(--accent-mint)]/20 border-[var(--accent-mint)]/30', labelColor: 'text-[var(--text-secondary)] dark:text-[var(--accent-mint)]',
    subs: [{ id: 'deporte:correr', label: 'Trotar/Caminar' }, { id: 'deporte:yoga', label: 'Yoga/Estiramiento' }, { id: 'deporte:pesas', label: 'Pesas/HIIT' }, { id: 'deporte:equipo', label: 'Deportes de equipo' }, { id: 'deporte:bici', label: 'Ciclismo' }] },
  { id: 'entretenimiento', title: 'Entretenimiento y Ocio', icon: '🍿', color: 'bg-calm-blush/20 border-calm-blush/30', labelColor: 'text-[var(--accent-action)] dark:text-[var(--accent-warm)]',
    subs: [{ id: 'ent:leer', label: 'Leer ficción' }, { id: 'ent:leer_nf', label: 'Leer no ficción' }, { id: 'ent:cine', label: 'Series / Películas' }, { id: 'ent:videojuegos', label: 'Videojuegos' }, { id: 'ent:mobile', label: 'Juegos móvil' }, { id: 'ent:mesa', label: 'Juegos de mesa' }] },
  { id: 'bienestar', title: 'Hogar, Bienestar y Música', icon: '🧘', color: 'bg-calm-smoke/15 border-calm-smoke/30', labelColor: 'text-calm-smoke dark:text-calm-smoke',
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
    <div className="flex flex-col pb-6 px-1">
      <div className="flex-1 flex flex-col space-y-5">

        {/* Header compacto horizontal */}
        <div className="flex items-center space-x-3 pt-3">
          <div className="w-12 h-12 rounded-2xl bg-[var(--accent-teal)]/12 text-[var(--accent-teal)] border border-[var(--accent-teal)]/25 flex items-center justify-center shadow-sm animate-float shrink-0">
            <Compass size={24} />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-[var(--text-primary)] serif-title leading-tight">Libera tu Mente</h2>
            <p className="text-xs text-[var(--text-secondary)] dark:text-[var(--accent-mint)] font-medium mt-0.5">4 pasos científicos para superar bloqueos creativos</p>
          </div>
        </div>

        {/* Selector de hobbies */}
        <div className="calm-card p-4 space-y-4">
          <div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">¿Qué te ayuda a desconectar?</h3>
            <p className="text-xs text-[var(--text-secondary)] dark:text-[var(--text-muted)] mt-0.5">Selecciona para personalizar tu día de descanso.</p>
          </div>

          <div className="space-y-4">
            {CATEGORIES.map(cat => (
              <div key={cat.id} className="space-y-2">
                <h4 className={`text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1.5 ${cat.labelColor || 'text-[var(--text-secondary)] dark:text-[var(--accent-mint)]'}`}>
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
                        className={`px-3 py-1.5 text-xs cursor-pointer select-none font-medium ${
                          isSelected
                            ? 'chip-active shadow-sm scale-[1.03]'
                            : 'border-[var(--border-card)] dark:border-[var(--border-default)]/60 bg-[var(--surface-card)] dark:bg-[var(--surface-card2)] text-[var(--text-primary)] dark:text-[var(--text-primary)] hover:border-calm-sage-400 hover:bg-[var(--surface-card)] dark:hover:bg-[var(--surface-hover)]/75'
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
          className="w-full py-4 bg-[#1E3A8A] hover:bg-[#12164A] dark:bg-[var(--accent-teal)] dark:hover:bg-[#2E6DA4] active:scale-[0.99] text-white rounded-2xl font-bold text-sm flex items-center justify-center space-x-2 transition-all shadow-lg shadow-[#1A2E28]/20 dark:shadow-calm-emeraldsea/20"
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