import React, { useState } from 'react';
import { Phase, AppState } from '../types';
import { ArrowRight, ArrowLeft, Target, AlertCircle } from 'lucide-react';
import { validateProblem } from '../services/ai';

interface Props {
  setPhase: (phase: Phase) => void;
  state: AppState;
  updateState: (updates: Partial<AppState>) => void;
}

export function Afinar({ setPhase, state, updateState }: Props) {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleNext = async () => {
    setLoading(true);
    setFeedback(null);
    const result = await validateProblem(state.problem, state.definition, state.options);
    setLoading(false);

    if (result.isValid) {
      setPhase('despeje');
    } else {
      setFeedback(result.feedback);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-yellow-100 text-yellow-600 rounded-lg">
          <Target size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">1. Afinar</h2>
          <p className="text-sm text-slate-500">Aclarar el problema a resolver</p>
        </div>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto pb-20">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">
            Aclarar: ¿Cuál es el problema exacto?
          </label>
          <textarea
            value={state.problem}
            onChange={(e) => updateState({ problem: e.target.value })}
            placeholder="Ej: Necesito un diseño para el logo, pero no sé qué estilo usar..."
            className="w-full p-4 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none resize-none h-32"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">
            Definir: ¿Cuáles son las restricciones o requisitos?
          </label>
          <textarea
            value={state.definition}
            onChange={(e) => updateState({ definition: e.target.value })}
            placeholder="Ej: Debe usar colores pastel, estar listo para el viernes..."
            className="w-full p-4 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none resize-none h-24"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">
            Opciones: ¿Qué has intentado hasta ahora?
          </label>
          <textarea
            value={state.options}
            onChange={(e) => updateState({ options: e.target.value })}
            placeholder="Ej: Hice unos bocetos minimalistas pero no me convencen..."
            className="w-full p-4 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none resize-none h-24"
          />
        </div>
      </div>

      {feedback && (
        <div className="mb-4 bg-red-50 border border-red-200 p-4 rounded-xl flex items-start space-x-3">
          <AlertCircle className="text-red-500 mt-0.5 shrink-0" size={20} />
          <p className="text-sm text-red-800">{feedback}</p>
        </div>
      )}

      <div className="pt-4 flex space-x-4 bg-slate-50">
        <button
          onClick={() => setPhase('home')}
          className="p-4 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <button
          onClick={handleNext}
          disabled={!state.problem.trim() || loading}
          className="flex-1 py-4 bg-yellow-500 hover:bg-yellow-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-2xl font-bold text-lg flex items-center justify-center space-x-2 transition-colors shadow-lg shadow-yellow-200"
        >
          <span>{loading ? "Validando..." : "Siguiente: Despejar"}</span>
          {!loading && <ArrowRight size={24} />}
        </button>
      </div>
    </div>
  );
}
