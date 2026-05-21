import React, { useState } from 'react';
import { Phase, AppState } from '../types';
import { ArrowRight, ArrowLeft, Target, AlertCircle, Sparkles, HelpCircle } from 'lucide-react';
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
    if (!state.problem.trim()) return;
    setLoading(true);
    setFeedback(null);
    try {
      const result = await validateProblem(state.problem, state.definition, state.options);
      if (result.isValid) {
        setPhase('despeje');
      } else {
        setFeedback(result.feedback);
      }
    } catch (e) {
      console.error(e);
      setFeedback("Ocurrió un error al validar. Por favor continúa a la etapa de despeje si estás listo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-24 px-1">
      {/* Intro Step Banner */}
      <div className="flex items-center space-x-3 mb-6 pt-4">
        <div className="p-3 bg-amber-50 border border-amber-100 text-amber-600 rounded-2xl shadow-sm animate-float">
          <Target size={24} />
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-widest text-amber-600 font-bold">Paso 1 de 4</span>
          <h2 className="text-3xl font-bold text-calm-olive serif-title">Afinar el Enfoque</h2>
          <p className="text-xs text-calm-olive/50">Clarifica el problema antes de ponerlo en reposo</p>
        </div>
      </div>

      <div className="flex-1 space-y-5">
        
        {/* Creative Instruction Alert */}
        <div className="p-4 bg-amber-50/50 border border-amber-100/60 rounded-2xl text-xs text-amber-900 leading-relaxed flex items-start space-x-2">
          <Sparkles size={16} className="text-amber-500 mt-0.5 shrink-0" />
          <span>
            <strong>Consejo Zen:</strong> Al escribir detalladamente tu reto creativo, tu subconsciente guardará estas variables y trabajará en ellas durante la fase de ocio y descanso.
          </span>
        </div>

        {/* Text Area 1: Problem */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-calm-sage-700 uppercase tracking-wider flex items-center justify-between">
            <span>¿Cuál es el problema creativo exacto?</span>
            <span className="text-[10px] text-calm-olive/40 font-normal normal-case">Obligatorio</span>
          </label>
          <textarea
            value={state.problem}
            onChange={(e) => updateState({ problem: e.target.value })}
            placeholder="Ej: Necesito diseñar un logo llamativo para mi cafetería ecológica pero todos los bocetos de tazas y granos me parecen aburridos..."
            className="w-full p-4 rounded-2xl border border-calm-sage-100/80 bg-white/70 focus:bg-white focus:ring-4 focus:ring-amber-400/20 focus:border-amber-400 outline-none resize-none h-32 text-sm leading-relaxed transition-all placeholder:text-calm-olive/30 text-calm-olive"
          />
        </div>

        {/* Text Area 2: Restrictions */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-calm-sage-700 uppercase tracking-wider">
            ¿Cuáles son las restricciones o requisitos?
          </label>
          <textarea
            value={state.definition}
            onChange={(e) => updateState({ definition: e.target.value })}
            placeholder="Ej: Debe ser monocromático o en base a tonos tierra, minimalista y que transmita modernidad pero origen orgánico..."
            className="w-full p-4 rounded-2xl border border-calm-sage-100/80 bg-white/70 focus:bg-white focus:ring-4 focus:ring-amber-400/20 focus:border-amber-400 outline-none resize-none h-24 text-sm leading-relaxed transition-all placeholder:text-calm-olive/30 text-calm-olive"
          />
        </div>

        {/* Text Area 3: Attempted options */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-calm-sage-700 uppercase tracking-wider">
            ¿Qué has intentado hasta ahora?
          </label>
          <textarea
            value={state.options}
            onChange={(e) => updateState({ options: e.target.value })}
            placeholder="Ej: He probado dibujando hojas, tazas flotantes, pero se ve genérico. Intenté también tipografías serif clásicas..."
            className="w-full p-4 rounded-2xl border border-calm-sage-100/80 bg-white/70 focus:bg-white focus:ring-4 focus:ring-amber-400/20 focus:border-amber-400 outline-none resize-none h-24 text-sm leading-relaxed transition-all placeholder:text-calm-olive/30 text-calm-olive"
          />
        </div>
      </div>

      {feedback && (
        <div className="mt-4 bg-red-50 border border-red-100 p-4 rounded-2xl flex items-start space-x-3 shadow-sm animate-shake">
          <AlertCircle className="text-red-500 mt-0.5 shrink-0" size={18} />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-red-800">Sugerencia de Reflexión</h4>
            <p className="text-xs text-red-700 leading-relaxed">{feedback}</p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="pt-6 flex space-x-3">
        <button
          onClick={() => setPhase('home')}
          className="p-4 rounded-2xl border border-calm-sage-100/80 bg-white hover:bg-calm-sage-50 text-calm-olive transition-colors flex items-center justify-center shadow-sm"
          title="Regresar a Inicio"
        >
          <ArrowLeft size={20} />
        </button>
        <button
          onClick={handleNext}
          disabled={!state.problem.trim() || loading}
          className="flex-1 py-4 bg-amber-500 hover:bg-amber-600 disabled:bg-calm-sage-100 disabled:text-calm-olive/30 disabled:cursor-not-allowed text-white rounded-2xl font-bold text-base flex items-center justify-center space-x-2 transition-all shadow-lg shadow-amber-100/50"
        >
          <span>{loading ? "Evaluando claridad..." : "Siguiente: Despejar la mente"}</span>
          {!loading && <ArrowRight size={18} />}
        </button>
      </div>
    </div>
  );
}
