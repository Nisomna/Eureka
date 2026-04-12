import React from 'react';
import { Phase, AppState } from '../types';
import { ArrowRight, Sparkles } from 'lucide-react';

interface Props {
  setPhase: (phase: Phase) => void;
  state: AppState;
  updateState: (updates: Partial<AppState>) => void;
}

const INTERESTS = [
  { id: 'musica', label: 'Música', icon: '🎵' },
  { id: 'caminar', label: 'Caminar', icon: '🚶' },
  { id: 'leer', label: 'Leer', icon: '📚' },
  { id: 'jugar', label: 'Jugar', icon: '🎮' },
  { id: 'meditar', label: 'Meditar', icon: '🧘' },
  { id: 'dibujar', label: 'Garabatear', icon: '✏️' },
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
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col justify-center space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-teal-100 text-teal-500 mb-4">
            <Sparkles size={40} />
          </div>
          <h2 className="text-3xl font-bold text-slate-800">Libera tu Mente</h2>
          <p className="text-slate-600">
            Un proceso guiado en 4 pasos para superar el bloqueo creativo y encontrar soluciones innovadoras.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider text-center">
            ¿Qué te ayuda a relajarte?
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            {INTERESTS.map((interest) => (
              <button
                key={interest.id}
                onClick={() => toggleInterest(interest.id)}
                className={`px-4 py-2 rounded-full border-2 transition-all flex items-center space-x-2 ${
                  state.interests.includes(interest.id)
                    ? 'border-teal-500 bg-teal-50 text-teal-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-teal-200'
                }`}
              >
                <span>{interest.icon}</span>
                <span>{interest.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-8 pb-4">
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
