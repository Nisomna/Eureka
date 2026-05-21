import React, { useState, useEffect } from 'react';
import { Phase, AppState } from '../types';
import { ArrowLeft, PenTool, CheckCircle2, Bot, Sparkles, AlertCircle, Smile } from 'lucide-react';
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
        <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950 rounded-full flex items-center justify-center border border-emerald-100 dark:border-emerald-900 text-emerald-500 animate-float">
          <AlertCircle size={32} />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-calm-olive dark:text-white serif-title">Faltan Ideas para el Plan</h3>
          <p className="text-sm text-calm-olive/60 dark:text-silver/60 max-w-xs leading-relaxed">
            Para diseñar un plan de implementación, primero ingresa ideas en el paso de Eureka.
          </p>
        </div>
        <button
          onClick={() => setPhase('eureka')}
          className="py-3 px-6 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm rounded-xl transition-colors shadow-md shadow-emerald-200 dark:shadow-none"
        >
          Generar Ideas en Eureka
        </button>
      </div>
    );
  }

  const handleFinalize = () => {
    if (!state.selectedIdea || !state.plan.trim()) return;

    const newTask = {
      id: Date.now().toString(),
      problem: state.problem,
      idea: state.selectedIdea,
      plan: state.plan,
      date: new Date().toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      completed: false
    };

    const updatedTasks = [newTask, ...(state.historicalTasks || [])];
    updateState({ historicalTasks: updatedTasks });
    setIsDone(true);
  };

  if (isDone) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-center space-y-6 px-4 mt-12 pb-24">
        <div className="w-24 h-24 bg-gradient-to-tr from-emerald-50 to-teal-100 dark:from-emerald-950 dark:to-teal-900 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center shadow-lg animate-float">
          <CheckCircle2 size={48} className="stroke-[2.5]" />
        </div>
        <div className="space-y-3">
          <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 px-3 py-1 rounded-full uppercase tracking-widest font-bold">Incubación Exitosa</span>
          <h2 className="text-4xl font-bold text-calm-olive dark:text-[#EBECEB] serif-title">¡Bloqueo Superado!</h2>
          <p className="text-sm text-calm-olive/70 dark:text-silver/70 max-w-sm leading-relaxed">
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
          className="w-full max-w-xs py-4 bg-calm-olive hover:bg-calm-sage-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white rounded-2xl font-bold text-base transition-all shadow-lg active:scale-[0.99] cursor-pointer"
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
        <div className="p-3 bg-indigo-50 border border-indigo-100 dark:bg-indigo-950 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-2xl shadow-sm animate-float">
          <PenTool size={24} />
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-widest text-indigo-600 dark:text-indigo-400 font-bold">Paso 4 de 4</span>
          <h2 className="text-3xl font-bold text-calm-olive dark:text-[#EBECEB] serif-title">Aplicar y Planificar</h2>
          <p className="text-xs text-calm-olive/50 dark:text-[#EBECEB]/50">Estructura pasos concretos para manifestar la idea</p>
        </div>
      </div>

      <div className="flex-1 space-y-5">
        
        {/* Visual interactive idea selector */}
        <div className="space-y-2.5">
          <label className="block text-xs font-bold text-calm-sage-700 dark:text-[#EBECEB]/75 uppercase tracking-wider flex items-center justify-between">
            <span>Selecciona tu mejor chispazo:</span>
            <span className="text-[10px] text-calm-olive/45 dark:text-[#EBECEB]/40 font-normal lowercase">Selecciona una tarjeta</span>
          </label>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[220px] overflow-y-auto pr-1 pb-1">
            {state.ideas.map((idea, idx) => {
              const isSelected = state.selectedIdea === idea;
              const isSketch = idea.startsWith('data:image/');
              
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => updateState({ selectedIdea: idea })}
                  className={`p-3.5 border rounded-2xl text-left transition-all relative flex flex-col justify-between h-[110px] select-none cursor-pointer group ${
                    isSelected
                      ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500/20 dark:bg-indigo-950/40 dark:border-indigo-400'
                      : 'bg-white dark:bg-[#1C2621]/80 border-calm-sage-100 dark:border-teal-950/60 hover:border-calm-sage-300 dark:hover:border-teal-900 hover:bg-stone-50/50 dark:hover:bg-[#1C2621]'
                  }`}
                >
                  {/* Selected check circle */}
                  <span className={`absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                    isSelected 
                      ? 'bg-indigo-500 text-white scale-100' 
                      : 'border border-stone-250 dark:border-teal-900 group-hover:bg-indigo-50 dark:group-hover:bg-[#1C2621] scale-95 opacity-60'
                  }`}>
                    {isSelected && <span className="text-[10px] font-bold">✓</span>}
                  </span>

                  <div className="pr-6 overflow-hidden flex-1 flex flex-col justify-center">
                    {isSketch ? (
                      <div className="flex items-center gap-2">
                        <img 
                          src={idea} 
                          alt="Boceto" 
                          className="w-12 h-12 object-contain bg-white dark:bg-[#141C18] border border-stone-200 dark:border-teal-900/60 p-0.5 rounded-lg shrink-0" 
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0">
                          <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 block tracking-wider">
                            Idea Visual
                          </span>
                          <span className="text-[9px] text-calm-olive/50 dark:text-[#EBECEB]/40 block">
                            Boceto #{state.ideas.length - idx}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs font-semibold text-calm-olive dark:text-[#EBECEB] line-clamp-3 leading-relaxed">
                        {idea}
                      </p>
                    )}
                  </div>

                  <span className="text-[9px] uppercase font-bold text-calm-sage-500 dark:text-[#EBECEB]/45 tracking-wider">
                    Opción {state.ideas.length - idx}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* AI Insight Advisory Box */}
        {isGeneratingAdvice && (
          <div className="bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 p-4 rounded-2xl flex items-center space-x-3 animate-pulse">
            <Sparkles className="text-indigo-400 shrink-0" size={20} />
            <p className="text-xs text-indigo-800 dark:text-indigo-300 font-medium">Bocetando un plan inteligente para consolidar esta idea...</p>
          </div>
        )}

        {advice && !isGeneratingAdvice && (
          <div className="bg-gradient-to-tr from-[#ECEBF4] to-indigo-50/50 dark:from-[#181F26] dark:to-indigo-950/10 border border-indigo-150 dark:border-indigo-900/60 p-5 rounded-3xl shadow-sm space-y-2.5">
            <div className="flex items-center space-x-1.5 text-indigo-800 dark:text-indigo-300">
              <Bot size={18} className="text-indigo-600 dark:text-indigo-400 animate-float" />
              <h4 className="font-bold text-xs uppercase tracking-wider">Inspiración del Mentor Calm</h4>
            </div>
            <p className="text-xs text-indigo-950 dark:text-[#EBECEB]/85 leading-relaxed font-semibold whitespace-pre-wrap">
              {advice}
            </p>
          </div>
        )}

        {/* Implementation Draft Textarea */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-calm-sage-700 dark:text-[#EBECEB]/75 uppercase tracking-wider">
            Boceto / Plan de Acción Inmediato:
          </label>
          <textarea
            value={state.plan}
            onChange={(e) => updateState({ plan: e.target.value })}
            placeholder="Escribe los primeros 3 pasos mínimos viables para hacer esta idea realidad..."
            className="w-full p-4 rounded-2xl border border-calm-sage-100/80 dark:border-teal-900/30 bg-white/75 dark:bg-[#1C2621]/60 focus:bg-white dark:focus:bg-[#1C2621] focus:ring-4 focus:ring-indigo-400/20 focus:border-indigo-400 outline-none resize-none h-32 text-sm leading-relaxed transition-all placeholder:text-calm-olive/30 dark:placeholder:text-[#EBECEB]/30 text-calm-olive dark:text-[#EBECEB]"
          />
        </div>

        {/* Quality list check boxes */}
        <div className="bg-indigo-50/30 dark:bg-indigo-950/10 border border-indigo-100/60 dark:border-indigo-900/40 p-5 rounded-3xl space-y-3">
          <h4 className="text-xs font-bold text-indigo-950 dark:text-indigo-300 uppercase tracking-wider">Filtro de Viabilidad</h4>
          <div className="space-y-2.5">
            <label className="flex items-center space-x-3 text-xs text-indigo-900 dark:text-indigo-200 font-medium cursor-pointer">
              <input 
                type="checkbox" 
                checked={checks.solve}
                onChange={() => setChecks(p => ({ ...p, solve: !p.solve }))}
                className="w-4.5 h-4.5 rounded text-indigo-650 dark:text-indigo-400 focus:ring-indigo-500 border-indigo-300 dark:border-teal-900/70" 
              />
              <span>¿Resuelve genuinamente el problema original planteado?</span>
            </label>
            <label className="flex items-center space-x-3 text-xs text-indigo-900 dark:text-indigo-200 font-medium cursor-pointer">
              <input 
                type="checkbox" 
                checked={checks.restrictions}
                onChange={() => setChecks(p => ({ ...p, restrictions: !p.restrictions }))}
                className="w-4.5 h-4.5 rounded text-indigo-650 dark:text-indigo-400 focus:ring-indigo-500 border-indigo-300 dark:border-teal-900/70" 
              />
              <span>¿Cumple y respeta las restricciones de tiempo/estilo?</span>
            </label>
            <label className="flex items-center space-x-3 text-xs text-indigo-900 dark:text-indigo-200 font-medium cursor-pointer">
              <input 
                type="checkbox" 
                checked={checks.feasible}
                onChange={() => setChecks(p => ({ ...p, feasible: !p.feasible }))}
                className="w-4.5 h-4.5 rounded text-indigo-650 dark:text-indigo-400 focus:ring-indigo-500 border-indigo-300 dark:border-teal-900/70" 
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
          className="p-4 rounded-2xl border border-calm-sage-100 dark:border-teal-900 bg-white dark:bg-[#1C2621]/80 hover:bg-calm-sage-50 dark:hover:bg-calm-sage-950 text-calm-olive dark:text-[#EBECEB] transition-colors flex items-center justify-center shadow-sm cursor-pointer"
          title="Regresar"
        >
          <ArrowLeft size={18} />
        </button>
        <button
          onClick={handleFinalize}
          disabled={!state.selectedIdea || !state.plan.trim()}
          className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-calm-sage-100 dark:disabled:bg-teal-950/40 disabled:text-calm-olive/30 dark:disabled:text-[#EBECEB]/25 disabled:cursor-not-allowed disabled:shadow-none dark:shadow-none text-white rounded-2xl font-bold text-base flex items-center justify-center space-x-2 transition-all shadow-lg shadow-indigo-100/55 cursor-pointer"
        >
          <CheckCircle2 size={18} />
          <span>Finalizar e Incubar</span>
        </button>
      </div>
    </div>
  );
}
