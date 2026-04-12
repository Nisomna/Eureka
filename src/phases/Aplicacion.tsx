import React, { useState } from 'react';
import { Phase, AppState } from '../types';
import { ArrowLeft, PenTool, CheckCircle2 } from 'lucide-react';

interface Props {
  setPhase: (phase: Phase) => void;
  state: AppState;
  updateState: (updates: Partial<AppState>) => void;
}

export function Aplicacion({ setPhase, state, updateState }: Props) {
  const [isDone, setIsDone] = useState(false);

  if (isDone) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-center space-y-6">
        <div className="w-24 h-24 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 size={48} />
        </div>
        <h2 className="text-3xl font-bold text-slate-800">¡Bloqueo Superado!</h2>
        <p className="text-slate-600 max-w-xs">
          Has pasado de tener un problema a tener un plan de acción concreto. ¡Gran trabajo!
        </p>
        <button
          onClick={() => {
            updateState({
              problem: '',
              definition: '',
              options: '',
              ideas: [],
              selectedIdea: null,
              plan: '',
            });
            setPhase('home');
          }}
          className="mt-8 py-4 px-8 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-lg transition-colors"
        >
          Volver al Inicio
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
          <PenTool size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">4. Aplicación</h2>
          <p className="text-sm text-slate-500">Boceta y perfecciona tu idea</p>
        </div>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto pb-20">
        
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">
            Selecciona la mejor idea:
          </label>
          <select
            value={state.selectedIdea || ''}
            onChange={(e) => updateState({ selectedIdea: e.target.value })}
            className="w-full p-4 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-emerald-400 outline-none"
          >
            <option value="" disabled>Elige una idea de tu lista...</option>
            {state.ideas.map((idea, idx) => (
              <option key={idx} value={idea}>{idea}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">
            Boceto / Plan de Acción:
          </label>
          <textarea
            value={state.plan}
            onChange={(e) => updateState({ plan: e.target.value })}
            placeholder="Describe cómo vas a implementar esta idea paso a paso..."
            className="w-full p-4 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none resize-none h-48"
          />
        </div>

        <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
          <h3 className="text-sm font-semibold text-emerald-800 mb-3">Lista de Perfeccionamiento</h3>
          <div className="space-y-2">
            <label className="flex items-center space-x-3 text-emerald-900">
              <input type="checkbox" className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500" />
              <span>¿Resuelve el problema original?</span>
            </label>
            <label className="flex items-center space-x-3 text-emerald-900">
              <input type="checkbox" className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500" />
              <span>¿Cumple con las restricciones?</span>
            </label>
            <label className="flex items-center space-x-3 text-emerald-900">
              <input type="checkbox" className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500" />
              <span>¿Es factible aplicarlo ahora?</span>
            </label>
          </div>
        </div>

      </div>

      <div className="pt-4 flex space-x-4 bg-slate-50">
        <button
          onClick={() => setPhase('eureka')}
          className="p-4 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <button
          onClick={() => setIsDone(true)}
          disabled={!state.selectedIdea || !state.plan.trim()}
          className="flex-1 py-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-2xl font-bold text-lg flex items-center justify-center space-x-2 transition-colors shadow-lg shadow-emerald-200"
        >
          <CheckCircle2 size={24} />
          <span>Finalizar</span>
        </button>
      </div>
    </div>
  );
}
