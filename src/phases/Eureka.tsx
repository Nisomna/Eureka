import React, { useState } from 'react';
import { Phase, AppState } from '../types';
import { ArrowRight, ArrowLeft, Lightbulb, Plus, Shuffle } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  setPhase: (phase: Phase) => void;
  state: AppState;
  updateState: (updates: Partial<AppState>) => void;
}

const PERSPECTIVES = [
  "¿Cómo lo resolvería un niño de 5 años?",
  "¿Qué pasaría si hicieras exactamente lo contrario?",
  "Si tuvieras presupuesto infinito, ¿qué harías?",
  "¿Cómo se relaciona esto con la naturaleza?",
  "Elimina la parte más importante. ¿Qué queda?",
  "Combina tu problema con un objeto aleatorio de la habitación.",
];

export function Eureka({ setPhase, state, updateState }: Props) {
  const [newIdea, setNewIdea] = useState('');
  const [perspective, setPerspective] = useState('');

  const addIdea = () => {
    if (newIdea.trim()) {
      updateState({ ideas: [newIdea.trim(), ...state.ideas] });
      setNewIdea('');
    }
  };

  const getRandomPerspective = () => {
    const random = PERSPECTIVES[Math.floor(Math.random() * PERSPECTIVES.length)];
    setPerspective(random);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-green-100 text-green-600 rounded-lg">
          <Lightbulb size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">3. Eureka</h2>
          <p className="text-sm text-slate-500">Anota todo lo que se te ocurra</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col space-y-6 overflow-hidden">
        
        {/* Input Area */}
        <div className="flex space-x-2">
          <input
            type="text"
            value={newIdea}
            onChange={(e) => setNewIdea(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addIdea()}
            placeholder="Escribe una idea..."
            className="flex-1 p-4 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-green-400 focus:border-transparent outline-none"
          />
          <button
            onClick={addIdea}
            disabled={!newIdea.trim()}
            className="p-4 bg-green-500 text-white rounded-xl disabled:bg-slate-300 transition-colors"
          >
            <Plus size={24} />
          </button>
        </div>

        {/* Perspectives Tool */}
        <div className="bg-green-50 p-4 rounded-2xl border border-green-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-green-800">Cambiar Perspectiva</h3>
            <button onClick={getRandomPerspective} className="text-green-600 p-1 hover:bg-green-100 rounded-md">
              <Shuffle size={16} />
            </button>
          </div>
          <p className="text-green-700 text-sm italic min-h-[40px]">
            {perspective || "Toca el botón para ver el problema desde otro ángulo."}
          </p>
        </div>

        {/* Ideas List */}
        <div className="flex-1 overflow-y-auto space-y-3 pb-4">
          {state.ideas.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
              <Lightbulb size={48} className="opacity-20" />
              <p>Aún no hay ideas. ¡Anota la primera!</p>
            </div>
          ) : (
            state.ideas.map((idea, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={idx}
                className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm"
              >
                {idea}
              </motion.div>
            ))
          )}
        </div>
      </div>

      <div className="pt-4 flex space-x-4 bg-slate-50">
        <button
          onClick={() => setPhase('despeje')}
          className="p-4 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <button
          onClick={() => setPhase('aplicacion')}
          disabled={state.ideas.length === 0}
          className="flex-1 py-4 bg-green-500 hover:bg-green-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-2xl font-bold text-lg flex items-center justify-center space-x-2 transition-colors shadow-lg shadow-green-200"
        >
          <span>Siguiente: Aplicar</span>
          <ArrowRight size={24} />
        </button>
      </div>
    </div>
  );
}
