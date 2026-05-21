import React, { useState, useEffect } from 'react';
import { Phase, AppState } from '../types';
import { ArrowLeft, PenTool, CheckCircle2, Bot, Sparkles, AlertCircle, RefreshCw, Smile } from 'lucide-react';
import { getIdeaAdvice } from '../services/ai';

interface Props {
  setPhase: (phase: Phase) => void;
  state: AppState;
  updateState: (updates: Partial<AppState>) => void;
}

export function Aplicacion({ setPhase, state, updateState }: Props) {
  const [isDone, setIsDone] = useState(false);
  const [advice, setAdvice] = useState<string | null>(null);
  const [isGeneratingAdvice, setIsGeneratingAdvice] = useState(false);
  const [checks, setChecks] = useState({
    solve: false,
    restrictions: false,
    feasible: false,
  });

  useEffect(() => {
    if (state.selectedIdea) {
      const fetchAdvice = async () => {
        setIsGeneratingAdvice(true);
        setAdvice(null);
        try {
          const result = await getIdeaAdvice(state.problem, state.definition, state.selectedIdea!);
          setAdvice(result);
        } catch (e) {
          console.error(e);
          setAdvice("¡Tienes una gran idea! Enfócate en planificar tus primeros 3 pasos concretos, simplificando el diseño al máximo.");
        } finally {
          setIsGeneratingAdvice(false);
        }
      };
      fetchAdvice();
    } else {
      setAdvice(null);
    }
  }, [state.selectedIdea, state.problem, state.definition]);

  // Handle direct navigation fallback
  if (state.ideas.length === 0) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-center space-y-6 mt-12 px-4 pb-24">
        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100 text-emerald-500 animate-float">
          <AlertCircle size={32} />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-calm-olive serif-title">Faltan Ideas para el Plan</h3>
          <p className="text-sm text-calm-olive/60 max-w-xs leading-relaxed">
            Para diseñar un plan de implementación, primero ingresa ideas en el paso de Eureka.
          </p>
        </div>
        <button
          onClick={() => setPhase('eureka')}
          className="py-3 px-6 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm rounded-xl transition-colors shadow-md shadow-emerald-200"
        >
          Generar Ideas en Eureka
        </button>
      </div>
    );
  }

  if (isDone) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-center space-y-6 px-4 mt-12 pb-24">
        <div className="w-24 h-24 bg-gradient-to-tr from-emerald-50 to-teal-100 border border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center shadow-lg animate-float">
          <CheckCircle2 size={48} className="stroke-[2.5]" />
        </div>
        <div className="space-y-3">
          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full uppercase tracking-widest font-bold">Incubación Exitosa</span>
          <h2 className="text-4xl font-bold text-calm-olive serif-title">¡Bloqueo Superado!</h2>
          <p className="text-sm text-calm-olive/70 max-w-sm leading-relaxed">
            Has pasado de tener la mente nublada a estructurar un plan de acción concreto e inspirador. ¡Gran trabajo dándote espacio!
          </p>
        </div>
        
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
            setChecks({ solve: false, restrictions: false, feasible: false });
            setPhase('home');
          }}
          className="w-full max-w-xs py-4 bg-calm-olive hover:bg-calm-sage-700 text-white rounded-2xl font-bold text-base transition-all shadow-lg active:scale-[0.99]"
        >
          Volver a Empezar / Reset
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-24 px-1">
      {/* Step Header */}
      <div className="flex items-center space-x-3 mb-6 pt-4">
        <div className="p-3 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-2xl shadow-sm animate-float">
          <PenTool size={24} />
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-widest text-indigo-600 font-bold">Paso 4 de 4</span>
          <h2 className="text-3xl font-bold text-calm-olive serif-title">Aplicar y Planificar</h2>
          <p className="text-xs text-calm-olive/50">Estructura pasos concretos para manifestar la idea</p>
        </div>
      </div>

      <div className="flex-1 space-y-5">
        
        {/* Dropdown idea select */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-calm-sage-700 uppercase tracking-wider">
            Selecciona tu mejor chispazo:
          </label>
          <div className="relative">
            <select
              value={state.selectedIdea || ''}
              onChange={(e) => updateState({ selectedIdea: e.target.value })}
              className="w-full p-4 rounded-xl border border-calm-sage-100 bg-white focus:ring-4 focus:ring-indigo-400/20 focus:border-indigo-400 outline-none text-sm transition-all text-calm-olive font-medium appearance-none"
            >
              <option value="" disabled>Elige la mejor idea de tu lista...</option>
              {state.ideas.map((idea, idx) => (
                <option key={idx} value={idea}>{idea}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-calm-sage-500">
              <Smile size={18} />
            </div>
          </div>
        </div>

        {/* AI Insight Advisory Box */}
        {isGeneratingAdvice && (
          <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-2xl flex items-center space-x-3 animate-pulse">
            <Sparkles className="text-indigo-400 shrink-0" size={20} />
            <p className="text-xs text-indigo-800 font-medium">Bocetando un plan inteligente para consolidar esta idea...</p>
          </div>
        )}

        {advice && !isGeneratingAdvice && (
          <div className="bg-gradient-to-tr from-[#ECEBF4] to-indigo-50/50 border border-indigo-150 p-5 rounded-3xl shadow-sm space-y-2.5">
            <div className="flex items-center space-x-1.5 text-indigo-800">
              <Bot size={18} className="text-indigo-600 animate-float" />
              <h4 className="font-bold text-xs uppercase tracking-wider">Inspiración del Mentor Calm</h4>
            </div>
            <p className="text-xs text-indigo-950 leading-relaxed font-medium whitespace-pre-wrap">
              {advice}
            </p>
          </div>
        )}

        {/* Implementation Draft Textarea */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-calm-sage-700 uppercase tracking-wider">
            Boceto / Plan de Acción Inmediato:
          </label>
          <textarea
            value={state.plan}
            onChange={(e) => updateState({ plan: e.target.value })}
            placeholder="Escribe los primeros 3 pasos mínimos viables para hacer esta idea realidad..."
            className="w-full p-4 rounded-2xl border border-calm-sage-100/80 bg-white/75 focus:bg-white focus:ring-4 focus:ring-indigo-400/20 focus:border-indigo-400 outline-none resize-none h-32 text-sm leading-relaxed transition-all placeholder:text-calm-olive/30 text-calm-olive"
          />
        </div>

        {/* Quality list check boxes */}
        <div className="bg-indigo-50/30 border border-indigo-100/60 p-5 rounded-3xl space-y-3">
          <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">Filtro de Viabilidad</h4>
          <div className="space-y-2.5">
            <label className="flex items-center space-x-3 text-xs text-indigo-900 font-medium cursor-pointer">
              <input 
                type="checkbox" 
                checked={checks.solve}
                onChange={() => setChecks(p => ({ ...p, solve: !p.solve }))}
                className="w-4.5 h-4.5 rounded text-indigo-600 focus:ring-indigo-500 border-indigo-300" 
              />
              <span>¿Resuelve genuinamente el problema original planteado?</span>
            </label>
            <label className="flex items-center space-x-3 text-xs text-indigo-900 font-medium cursor-pointer">
              <input 
                type="checkbox" 
                checked={checks.restrictions}
                onChange={() => setChecks(p => ({ ...p, restrictions: !p.restrictions }))}
                className="w-4.5 h-4.5 rounded text-indigo-600 focus:ring-indigo-500 border-indigo-300" 
              />
              <span>¿Cumple y respeta las restricciones de tiempo/estilo?</span>
            </label>
            <label className="flex items-center space-x-3 text-xs text-indigo-900 font-medium cursor-pointer">
              <input 
                type="checkbox" 
                checked={checks.feasible}
                onChange={() => setChecks(p => ({ ...p, feasible: !p.feasible }))}
                className="w-4.5 h-4.5 rounded text-indigo-600 focus:ring-indigo-500 border-indigo-300" 
              />
              <span>¿Es factible tomar el primer paso hoy mismo?</span>
            </label>
          </div>
        </div>

      </div>

      {/* Button actions */}
      <div className="pt-6 flex space-x-3">
        <button
          onClick={() => setPhase('eureka')}
          className="p-4 rounded-2xl border border-calm-sage-100 bg-white hover:bg-calm-sage-50 text-calm-olive transition-colors flex items-center justify-center shadow-sm"
          title="Regresar"
        >
          <ArrowLeft size={18} />
        </button>
        <button
          onClick={() => setIsDone(true)}
          disabled={!state.selectedIdea || !state.plan.trim()}
          className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-calm-sage-100 disabled:text-calm-olive/30 disabled:cursor-not-allowed text-white rounded-2xl font-bold text-base flex items-center justify-center space-x-2 transition-all shadow-lg shadow-indigo-100/50"
        >
          <CheckCircle2 size={18} />
          <span>Finalizar e Incubar</span>
        </button>
      </div>
    </div>
  );
}
