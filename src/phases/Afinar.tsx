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

      {/* Header */}
      <div className="flex items-center space-x-3 pt-3 mb-5">
        <div className="p-2.5 bg-[#2E6DA4]/12 border border-[#2E6DA4]/30 text-[#1E3A8A] dark:text-[#2AAFA8] rounded-xl shadow-sm animate-float shrink-0">
          <Target size={20} />
        </div>
        <div>
          {/* Badge paso — teal oscuro en light, mint en dark */}
          <span className="text-[10px] uppercase tracking-widest text-[#1E3A8A] dark:text-[#2AAFA8] font-extrabold leading-none">
            Paso 1 de 4
          </span>
          <h2 className="text-2xl font-bold text-[#1B263B] dark:text-[var(--text-primary)] serif-title leading-tight">
            Afinar el Enfoque
          </h2>
        </div>
      </div>

      <div className="flex-1 space-y-4">

        {/* Tip — fondo aqua claro, texto navy legible */}
        <div className="p-3 bg-[#EEF3FA] dark:bg-[#2E6DA4]/10 border border-[#2AAFA8] dark:border-[#2E6DA4]/25 rounded-xl flex items-start space-x-2">
          <Sparkles size={14} className="text-[#2E6DA4] dark:text-[#2AAFA8] mt-0.5 shrink-0" />
          <span className="text-xs text-[#1B263B] dark:text-[var(--text-secondary)] leading-relaxed">
            <strong className="text-[#1E3A8A] dark:text-[#2AAFA8]">Consejo:</strong> Al escribir tu reto con detalle, tu subconsciente trabajará en él durante el descanso.
          </span>
        </div>

        {/* Campo 1 */}
        <div className="space-y-1.5">
          <label className="flex items-center justify-between text-xs font-bold text-[#1B263B] dark:text-[var(--text-secondary)] uppercase tracking-wider">
            <span>¿Cuál es el problema creativo exacto?</span>
            <span className="text-[10px] text-[#2AAFA8] dark:text-[var(--accent-action)] font-bold normal-case">Obligatorio</span>
          </label>
          <textarea
            value={state.problem}
            onChange={e => updateState({ problem: e.target.value })}
            placeholder="Ej: Necesito diseñar un logo llamativo para mi cafetería ecológica, pero todos mis bocetos se ven genéricos..."
            className="w-full p-3.5 rounded-xl border border-[#E8EEF6] dark:border-[var(--border-default)] bg-white dark:bg-[var(--surface-input)] focus:ring-2 focus:ring-[#2E6DA4]/30 focus:border-[#2E6DA4] outline-none resize-none h-28 text-sm leading-relaxed transition-all placeholder:text-[#A0B4BC] dark:placeholder:text-[var(--text-muted)] text-[#1B263B] dark:text-[var(--text-primary)]"
          />
        </div>

        {/* Campo 2 */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-[#1B263B] dark:text-[var(--text-secondary)] uppercase tracking-wider">
            ¿Cuáles son las restricciones o requisitos?
          </label>
          <textarea
            value={state.definition}
            onChange={e => updateState({ definition: e.target.value })}
            placeholder="Ej: Monocromático, tonos tierra, minimalista, transmita modernidad y origen orgánico..."
            className="w-full p-3.5 rounded-xl border border-[#E8EEF6] dark:border-[var(--border-default)] bg-white dark:bg-[var(--surface-input)] focus:ring-2 focus:ring-[#2E6DA4]/30 focus:border-[#2E6DA4] outline-none resize-none h-20 text-sm leading-relaxed transition-all placeholder:text-[#A0B4BC] dark:placeholder:text-[var(--text-muted)] text-[#1B263B] dark:text-[var(--text-primary)]"
          />
        </div>

        {/* Campo 3 */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-[#1B263B] dark:text-[var(--text-secondary)] uppercase tracking-wider">
            ¿Qué has intentado hasta ahora?
          </label>
          <textarea
            value={state.options}
            onChange={e => updateState({ options: e.target.value })}
            placeholder="Ej: Probé hojas, tazas flotantes, tipografías serif clásicas, pero todo se ve genérico..."
            className="w-full p-3.5 rounded-xl border border-[#E8EEF6] dark:border-[var(--border-default)] bg-white dark:bg-[var(--surface-input)] focus:ring-2 focus:ring-[#2E6DA4]/30 focus:border-[#2E6DA4] outline-none resize-none h-20 text-sm leading-relaxed transition-all placeholder:text-[#A0B4BC] dark:placeholder:text-[var(--text-muted)] text-[#1B263B] dark:text-[var(--text-primary)]"
          />
        </div>

        {feedback && (
          <div className="bg-[#EEF3FA] dark:bg-[#2AAFA8]/10 border border-[#2AAFA8]/30 p-3 rounded-xl flex items-start space-x-2.5">
            <AlertCircle className="text-[#2AAFA8] mt-0.5 shrink-0" size={16} />
            <div>
              <h4 className="text-xs font-bold text-[#1E3A8A] dark:text-[#2AAFA8] mb-0.5">Sugerencia de Reflexión</h4>
              <p className="text-xs text-[#12164A] dark:text-[var(--text-secondary)] leading-relaxed">{feedback}</p>
            </div>
          </div>
        )}
      </div>

      <div className="pt-5 flex space-x-3">
        <button
          onClick={() => { soundTap(); setPhase('home'); }}
          className="p-3.5 rounded-xl border border-[#E8EEF6] dark:border-[var(--border-default)] bg-white dark:bg-[var(--surface-card)] hover:bg-[#EEF3FA] dark:hover:bg-[var(--surface-hover)] text-[#1E3A8A] dark:text-[var(--text-primary)] transition-all flex items-center justify-center shadow-sm cursor-pointer"
        >
          <ArrowLeft size={18} />
        </button>
        <button
          onClick={handleNext}
          disabled={!state.problem.trim() || loading}
          className="flex-1 py-3.5 bg-[#1E3A8A] hover:bg-[#12164A] dark:bg-[#2E6DA4] dark:hover:bg-[#2E6DA4] disabled:bg-[#E8EEF6] dark:disabled:bg-[var(--surface-card2)] disabled:text-[#A0B4BC] dark:disabled:text-[var(--text-muted)] disabled:shadow-none text-white rounded-xl font-bold text-sm flex items-center justify-center space-x-2 transition-all shadow-lg shadow-[#1E3A8A]/20 cursor-pointer"
        >
          <span>{loading ? 'Evaluando claridad...' : 'Siguiente: Despeje mental'}</span>
          {!loading && <ArrowRight size={16} />}
        </button>
      </div>
    </div>
  );
}