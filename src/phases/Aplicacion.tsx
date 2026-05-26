import React, { useState, useEffect } from 'react';
import { Phase, AppState } from '../types';
import { ArrowLeft, PenTool, CheckCircle2, Bot, Sparkles, AlertCircle, Smile } from 'lucide-react';
import { getIdeaAdvice } from '../services/ai';
import ReactMarkdown from 'react-markdown';
import { motion } from 'motion/react';
import { soundTap, soundTransition, soundSuccess, soundCheck } from '../utils/sounds';

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
      <div className="flex flex-col items-center justify-center text-center space-y-6 mt-12 px-4 pb-24">
        <div className="w-16 h-16 bg-calm-duckegg/20 dark:bg-teal-950/45 rounded-full flex items-center justify-center border border-calm-duckegg/40 dark:border-teal-950 text-calm-emeraldsea animate-float">
          <AlertCircle size={32} />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-calm-olive dark:text-white serif-title">Faltan Ideas para el Plan</h3>
          <p className="text-sm text-calm-olive/60 dark:text-[#EBECEB]/60 max-w-xs leading-relaxed">
            Para diseñar un plan de implementación, primero ingresa ideas en el paso de Eureka.
          </p>
        </div>
        <button
          onClick={() => { soundTap(); setPhase('eureka'); }}
          className="py-3 px-6 bg-calm-sage-500 hover:bg-calm-sage-600 text-white font-bold text-sm rounded-xl transition-colors shadow-md shadow-calm-sage-200/50 dark:shadow-none cursor-pointer"
        >
          Generar Ideas en Eureka
        </button>
      </div>
    );
  }

  const handleFinalize = () => {
    if (!state.selectedIdea || !state.plan.trim()) return;
    soundSuccess();

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
      <div className="flex flex-col items-center justify-center text-center space-y-6 px-4 mt-12 pb-24">
        <div className="w-24 h-24 bg-gradient-to-tr from-calm-duckegg/30 to-calm-cream dark:from-teal-950 dark:to-[#17221D] border border-calm-duckegg text-calm-emeraldsea rounded-full flex items-center justify-center shadow-lg animate-float">
          <CheckCircle2 size={48} className="stroke-[2.5]" />
        </div>
        <div className="space-y-3">
          <span className="text-[10px] bg-calm-sage-50 dark:bg-[#1E2B25] text-calm-sage-700 dark:text-calm-duckegg px-3 py-1 rounded-full uppercase tracking-widest font-extrabold border border-calm-sage-100/60 dark:border-teal-900">Incubación Exitosa</span>
          <h2 className="text-4xl font-bold text-calm-olive dark:text-[#EBECEB] serif-title">¡Bloqueo Superado!</h2>
          <p className="text-sm text-calm-olive/90 dark:text-slate-300 max-w-sm leading-relaxed font-medium">
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
          className="w-full max-w-xs py-4 bg-calm-sage-500 hover:bg-calm-sage-600 focus:ring-4 focus:ring-calm-emeraldsea/25 text-white rounded-2xl font-bold text-base transition-all shadow-lg active:scale-[0.99] cursor-pointer shadow-calm-sage-200/50"
        >
          Volver a Empezar / Reset
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-y-auto pb-4 px-1">
      {/* Header compacto */}
      <div className="flex items-center space-x-3 pt-3 mb-4">
        <div className="p-2.5 bg-calm-emeraldsea/15 border border-calm-emeraldsea/35 dark:bg-calm-emeraldsea/20 text-calm-emeraldsea rounded-xl shadow-sm animate-float shrink-0">
          <PenTool size={20} />
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-widest text-calm-emeraldsea dark:text-calm-duckegg font-extrabold leading-none">Paso 4 de 4</span>
          <h2 className="text-2xl font-bold text-calm-olive dark:text-[#EBECEB] serif-title leading-tight">Aplicar y Planificar</h2>
        </div>
      </div>

      <div className="flex-1 space-y-5">
        
        {/* Visual interactive idea selector */}
        <div className="space-y-3">
          <label className="block text-sm font-bold text-calm-sage-800 dark:text-[#EBECEB] uppercase tracking-wider flex items-center justify-between">
            <span>Selecciona tu mejor chispazo:</span>
            <span className="text-[11px] text-calm-olive/80 dark:text-[#EBECEB]/80 font-semibold lowercase">Selecciona una tarjeta</span>
          </label>
          
          <div className="flex flex-col gap-3">
            {state.ideas.map((idea, idx) => {
              const isSelected = state.selectedIdea === idea;
              const isSketch = idea.startsWith('data:image/');
              
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => updateState({ selectedIdea: idea })}
                  className={`p-4 border rounded-2xl text-left transition-all relative flex items-center gap-3 select-none cursor-pointer group ${
                    isSelected
                      ? 'bg-calm-duckegg/25 border-calm-emeraldsea ring-2 ring-calm-emeraldsea/25 dark:bg-[#1E2E27]/50 dark:border-calm-duckegg'
                      : 'bg-calm-cream dark:bg-[#1C2621]/90 border-calm-sage-200 dark:border-teal-950/80 hover:border-calm-sage-400 dark:hover:border-teal-900 hover:bg-white dark:hover:bg-[#1E2822]'
                  }`}
                >
                  {/* Selected check circle */}
                  <span className={`absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                    isSelected 
                      ? 'bg-calm-emeraldsea text-white scale-100' 
                      : 'border border-calm-sage-200 dark:border-[#1C2621] group-hover:bg-calm-duckegg/15 dark:group-hover:bg-[#1C2621] scale-95 opacity-60'
                  }`}>
                    {isSelected && <span className="text-xs font-bold">✓</span>}
                  </span>
 
                  <div className="flex-1 overflow-hidden min-w-0">
                    {isSketch ? (
                      <div className="flex items-center gap-2.5">
                        <img 
                          src={idea} 
                          alt="Boceto" 
                          className="w-14 h-14 object-contain bg-calm-cream dark:bg-[#141C18] border border-calm-sage-200 dark:border-teal-900/60 p-0.5 rounded-lg shrink-0 shadow" 
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0">
                          <span className="text-xs uppercase font-bold text-calm-emeraldsea dark:text-calm-duckegg block tracking-wider">
                            Idea Visual
                          </span>
                          <span className="text-[10px] text-calm-olive/80 dark:text-[#EBECEB]/80 block font-medium">
                            Boceto #{state.ideas.length - idx}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm font-bold text-calm-olive dark:text-white leading-relaxed break-words">
                        {idea}
                      </p>
                    )}
                  </div>
 
                  <span className="text-[10px] uppercase font-bold text-calm-sage-600 dark:text-[#EBECEB]/60 tracking-wider shrink-0">
                    #{state.ideas.length - idx}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
 
         {/* AI Insight Advisory Box */}
         {isGeneratingAdvice && (
           <div className="bg-calm-duckegg/15 dark:bg-[#1E2E27]/30 border border-calm-duckegg/35 dark:border-teal-900/40 p-6 rounded-2xl flex items-center space-x-4 animate-pulse shadow-sm">
             <Sparkles className="text-calm-emeraldsea shrink-0 text-calm-emeraldsea dark:text-calm-duckegg animate-bounce" size={26} />
             <p className="text-base text-calm-sage-800 dark:text-calm-duckegg font-extrabold m-0">Estructurando un plan inteligente para consolidar esta idea...</p>
           </div>
         )}
 
         {advice && !isGeneratingAdvice && (
           <motion.div 
             initial={{ opacity: 0, y: 15 }}
             animate={{ opacity: 1, y: 0 }}
             className="bg-gradient-to-tr from-calm-duckegg/20 to-calm-cream/15 dark:from-[#1E2E27]/40 dark:to-teal-950/30 border border-calm-duckegg/50 dark:border-teal-900/60 p-6 sm:p-8 rounded-3xl shadow-md space-y-4 prose max-w-none prose-neutral dark:prose-invert"
           >
             <div className="flex items-center space-x-3 text-calm-emeraldsea dark:text-calm-duckegg border-b border-calm-sage-150 dark:border-teal-900/30 pb-3">
               <Bot size={26} className="text-calm-emeraldsea dark:text-calm-duckegg animate-float shrink-0" />
               <h4 className="font-extrabold text-sm sm:text-base uppercase tracking-wider text-calm-sage-800 dark:text-calm-duckegg m-0">Inspiración del Mentor Calm</h4>
             </div>
             <div className="text-base sm:text-lg text-calm-olive/95 dark:text-slate-200 leading-relaxed space-y-3 m-0">
               <ReactMarkdown>{advice}</ReactMarkdown>
             </div>
           </motion.div>
         )}
 
         {/* Implementation Draft Textarea - MUCH MORE READABLE */}
         <div className="space-y-3">
           <label className="block text-base font-bold text-calm-sage-800 dark:text-[#EBECEB] uppercase tracking-wider">
             Boceto / Plan de Acción Inmediato:
           </label>
           <textarea
             value={state.plan}
             onChange={(e) => updateState({ plan: e.target.value })}
             placeholder="Escribe los primeros 3 pasos mínimos viables para hacer esta idea realidad..."
             className="w-full p-6 rounded-3xl border border-calm-sage-200 dark:border-teal-900/40 bg-calm-cream dark:bg-[#1C2621]/90 focus:bg-white dark:focus:bg-[#1E2822] focus:ring-4 focus:ring-calm-emeraldsea/25 focus:border-calm-emeraldsea outline-none resize-none h-48 text-base sm:text-lg font-semibold leading-relaxed transition-all placeholder:text-calm-olive/60 dark:placeholder:text-[#EBECEB]/50 text-calm-olive dark:text-white shadow-inner"
           />
         </div>
 
         {/* Quality list check boxes - BOOSTED LEGIBILITY */}
         <div className="bg-calm-cream/85 dark:bg-[#1C2621]/80 border border-calm-sage-200/90 dark:border-teal-900/50 p-6 sm:p-7 rounded-3xl space-y-5 shadow-sm">
           <h4 className="text-base font-extrabold text-calm-olive dark:text-calm-duckegg uppercase tracking-wider border-b border-calm-sage-150 dark:border-teal-950/40 pb-2">Filtro de Viabilidad</h4>
           <div className="space-y-4">
             <label className="flex items-start space-x-4 text-base text-calm-olive dark:text-[#EBECEB] font-semibold cursor-pointer select-none group transition-colors hover:text-calm-emeraldsea dark:hover:text-calm-duckegg">
               <input 
                 type="checkbox" 
                 checked={checks.solve}
                 onChange={() => { soundCheck(); setChecks(p => ({ ...p, solve: !p.solve })); }}
                 className="w-6 h-6 rounded-lg text-calm-emeraldsea dark:text-calm-duckegg focus:ring-calm-emeraldsea border-calm-sage-300 dark:border-teal-900 cursor-pointer mt-0.5 shrink-0 scale-110 accent-calm-emeraldsea" 
               />
               <span className="leading-snug">¿Resuelve genuinamente el problema original planteado?</span>
             </label>
             <label className="flex items-start space-x-4 text-base text-calm-olive dark:text-[#EBECEB] font-semibold cursor-pointer select-none group transition-colors hover:text-calm-emeraldsea dark:hover:text-calm-duckegg">
               <input 
                 type="checkbox" 
                 checked={checks.restrictions}
                 onChange={() => { soundCheck(); setChecks(p => ({ ...p, restrictions: !p.restrictions })); }}
                 className="w-6 h-6 rounded-lg text-calm-emeraldsea dark:text-calm-duckegg focus:ring-calm-emeraldsea border-calm-sage-300 dark:border-teal-900 cursor-pointer mt-0.5 shrink-0 scale-110 accent-calm-emeraldsea" 
               />
               <span className="leading-snug">¿Cumple y respeta las restricciones de tiempo de incubación o de estilo?</span>
             </label>
             <label className="flex items-start space-x-4 text-base text-calm-olive dark:text-[#EBECEB] font-semibold cursor-pointer select-none group transition-colors hover:text-calm-emeraldsea dark:hover:text-calm-duckegg">
               <input 
                 type="checkbox" 
                 checked={checks.feasible}
                 onChange={() => { soundCheck(); setChecks(p => ({ ...p, feasible: !p.feasible })); }}
                 className="w-6 h-6 rounded-lg text-calm-emeraldsea dark:text-calm-duckegg focus:ring-calm-emeraldsea border-calm-sage-300 dark:border-teal-900 cursor-pointer mt-0.5 shrink-0 scale-110 accent-calm-emeraldsea" 
               />
               <span className="leading-snug">¿Es factible tomar el primer paso hoy mismo?</span>
             </label>
           </div>
         </div>
 
       </div>
 
       {/* Button actions */}
       <div className="pt-6 flex space-x-3.5">
         <button
           type="button"
           onClick={() => { soundTap(); setPhase('eureka'); }}
           className="p-4 rounded-2xl border border-calm-sage-200 dark:border-teal-900 bg-calm-cream dark:bg-[#1C2621]/80 hover:bg-white dark:hover:bg-calm-sage-950 text-calm-olive dark:text-[#EBECEB] transition-colors flex items-center justify-center shadow-sm cursor-pointer"
           title="Regresar"
         >
           <ArrowLeft size={20} />
         </button>
         <button
           type="button"
           onClick={handleFinalize}
           disabled={!state.selectedIdea || !state.plan.trim()}
           className="flex-1 py-4 bg-calm-sage-500 hover:bg-calm-sage-600 disabled:bg-calm-sage-100 dark:disabled:bg-teal-950/40 disabled:text-calm-olive/30 dark:disabled:text-[#EBECEB]/25 disabled:cursor-not-allowed disabled:shadow-none dark:shadow-none text-white rounded-2xl font-bold text-base flex items-center justify-center space-x-2.5 transition-all shadow-lg shadow-calm-sage-200/50 cursor-pointer"
         >
           <CheckCircle2 size={20} />
           <span>Finalizar e Incubar</span>
         </button>
       </div>
     </div>
  );
}