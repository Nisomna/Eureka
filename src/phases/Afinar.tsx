import React, { useState } from 'react';
import { Phase, AppState } from '../types';
import { ArrowRight, ArrowLeft, Target, AlertCircle, Sparkles } from 'lucide-react';
import { validateProblem } from '../services/ai';
import { soundTap, soundTransition, soundError } from '../utils/sounds';

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
    soundTap();
    setLoading(true);
    setFeedback(null);
    try {
      const result = await validateProblem(state.problem, state.definition, state.options);
      if (result.isValid) {
        soundTransition();
        setPhase('despeje');
      } else {
        soundError();
        setFeedback(result.feedback);
      }
    } catch {
      soundError();
      setFeedback('Ocurrió un error. Continúa si ya estás listo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col pb-6 px-1">

      {/* Header compacto */}
      <div className="flex items-center space-x-3 pt-3 mb-5">
        <div className="p-2.5 bg-calm-butterscotch/20 border border-calm-butterscotch/40 text-amber-700 dark:text-calm-butterscotch rounded-xl shadow-sm animate-float shrink-0">
          <Target size={20} />
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-widest text-calm-sage-600 dark:text-calm-butterscotch font-extrabold leading-none">Paso 1 de 4</span>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] serif-title leading-tight">Afinar el Enfoque</h2>
        </div>
      </div>

      <div className="flex-1 space-y-4">

        {/* Tip */}
        <div className="p-3 bg-amber-50 dark:bg-calm-butterscotch/10 border border-amber-200 dark:border-calm-butterscotch/20 rounded-xl text-xs text-amber-900 dark:text-calm-butterscotch/90 leading-relaxed flex items-start space-x-2">
          <Sparkles size={14} className="text-amber-600 dark:text-calm-butterscotch mt-0.5 shrink-0" />
          <span><strong>Consejo:</strong> Al escribir tu reto con detalle, tu subconsciente trabajará en él durante el descanso.</span>
        </div>

        {/* Campo 1 */}
        <div className="space-y-1.5">
          <label className="flex items-center justify-between text-xs font-bold text-calm-sage-700 dark:text-calm-duckegg uppercase tracking-wider">
            <span>¿Cuál es el problema creativo exacto?</span>
            <span className="text-[10px] text-calm-sage-600 dark:text-[var(--text-primary)]/50 font-semibold normal-case">Obligatorio</span>
          </label>
          <textarea
            value={state.problem}
            onChange={e => updateState({ problem: e.target.value })}
            placeholder="Ej: Necesito diseñar un logo llamativo para mi cafetería ecológica, pero todos mis bocetos se ven genéricos..."
            className="w-full p-3.5 rounded-xl border border-[var(--border-card)]/80 dark:border-[var(--border-default)] bg-[var(--surface-card)] dark:bg-[var(--surface-card)]/80 focus:bg-[var(--surface-card)] dark:focus:bg-[var(--surface-input)] focus:ring-4 focus:ring-calm-butterscotch/20 focus:border-calm-butterscotch outline-none resize-none h-28 text-sm leading-relaxed transition-all placeholder:text-[var(--text-secondary)] dark:placeholder:text-[#EBECEB]/35 text-[var(--text-primary)]"
          />
        </div>

        {/* Campo 2 */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-calm-sage-700 dark:text-calm-duckegg uppercase tracking-wider">
            ¿Cuáles son las restricciones o requisitos?
          </label>
          <textarea
            value={state.definition}
            onChange={e => updateState({ definition: e.target.value })}
            placeholder="Ej: Monocromático, tonos tierra, minimalista, transmita modernidad y origen orgánico..."
            className="w-full p-3.5 rounded-xl border border-[var(--border-card)]/80 dark:border-[var(--border-default)] bg-[var(--surface-card)] dark:bg-[var(--surface-card)]/80 focus:bg-[var(--surface-card)] dark:focus:bg-[var(--surface-input)] focus:ring-4 focus:ring-calm-butterscotch/20 focus:border-calm-butterscotch outline-none resize-none h-20 text-sm leading-relaxed transition-all placeholder:text-[var(--text-secondary)] dark:placeholder:text-[#EBECEB]/35 text-[var(--text-primary)]"
          />
        </div>

        {/* Campo 3 */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-calm-sage-700 dark:text-calm-duckegg uppercase tracking-wider">
            ¿Qué has intentado hasta ahora?
          </label>
          <textarea
            value={state.options}
            onChange={e => updateState({ options: e.target.value })}
            placeholder="Ej: Probé hojas, tazas flotantes, tipografías serif clásicas, pero todo se ve genérico..."
            className="w-full p-3.5 rounded-xl border border-[var(--border-card)]/80 dark:border-[var(--border-default)] bg-[var(--surface-card)] dark:bg-[var(--surface-card)]/80 focus:bg-[var(--surface-card)] dark:focus:bg-[var(--surface-input)] focus:ring-4 focus:ring-calm-butterscotch/20 focus:border-calm-butterscotch outline-none resize-none h-20 text-sm leading-relaxed transition-all placeholder:text-[var(--text-secondary)] dark:placeholder:text-[#EBECEB]/35 text-[var(--text-primary)]"
          />
        </div>

        {feedback && (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 p-3 rounded-xl flex items-start space-x-2.5 shadow-sm">
            <AlertCircle className="text-red-500 dark:text-red-400 mt-0.5 shrink-0" size={16} />
            <div>
              <h4 className="text-xs font-bold text-red-800 dark:text-red-400 mb-0.5">Sugerencia de Reflexión</h4>
              <p className="text-xs text-red-700 dark:text-red-300 leading-relaxed">{feedback}</p>
            </div>
          </div>
        )}
      </div>

      <div className="pt-5 flex space-x-3">
        <button
          onClick={() => { soundTap(); setPhase('home'); }}
          className="p-3.5 rounded-xl border border-[var(--border-card)]/80 dark:border-[var(--border-default)] bg-[var(--surface-card)] dark:bg-[var(--surface-card)]/80 hover:bg-[var(--surface-card2)] dark:hover:bg-[var(--surface-hover)] text-[var(--text-primary)] dark:text-[var(--text-primary)] transition-colors flex items-center justify-center shadow-sm cursor-pointer"
        >
          <ArrowLeft size={18} />
        </button>
        <button
          onClick={handleNext}
          disabled={!state.problem.trim() || loading}
          className="flex-1 py-3.5 bg-calm-sage-800 hover:bg-calm-sage-900 dark:bg-calm-emeraldsea dark:hover:bg-calm-sage-600 disabled:bg-calm-sage-100 dark:disabled:bg-teal-950/40 disabled:text-[var(--text-secondary)] dark:disabled:text-[#EBECEB]/25 disabled:shadow-none text-white rounded-xl font-bold text-sm flex items-center justify-center space-x-2 transition-all shadow-lg shadow-calm-sage-200/40 dark:shadow-none cursor-pointer"
        >
          <span>{loading ? 'Evaluando claridad...' : 'Siguiente: Despeje mental'}</span>
          {!loading && <ArrowRight size={16} />}
        </button>
      </div>
    </div>
  );
}