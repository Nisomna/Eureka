import React, { useState } from 'react';
import { Phase, AppState } from '../types';
import { ArrowRight, ArrowLeft, Lightbulb, Plus, Shuffle } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  setPhase: (phase: Phase) => void;
  state: AppState;
  updateState: (updates: Partial<AppState>) => void;
}

const GLOBAL_PERSPECTIVES = [
  "¿Cómo lo resolvería un niño de 5 años?",
  "¿Qué pasaría si hicieras exactamente lo contrario?",
  "Si tuvieras presupuesto infinito, ¿qué harías?",
  "Elimina la parte más importante. ¿Qué queda?",
  "Combina tu problema con un objeto aleatorio de la habitación.",
  "¿Cómo podrías resolver esto sin usar tecnología?",
  "Imagina que tienes que explicar la solución en un tweet."
];

const STRATEGIES_BY_INTEREST: Record<string, string[]> = {
  musica: [
    "¿Qué ritmo tendría la solución a este problema? ¿Rápido, lento, caótico?",
    "Imagina que tu problema es una canción. ¿Cómo sería el estribillo de la solución?",
    "¿Qué pasaría si trataras los diferentes elementos del problema como instrumentos musicales?"
  ],
  caminar: [
    "Imagina que la solución es un sendero. ¿Cuáles son los pasos, obstáculos y cómo es el destino?",
    "Si caminaras alrededor del problema físicamente, ¿qué verías desde atrás?",
    "Avanza un paso a la vez: ¿cuál es literalmente la acción más pequeña que puedes tomar hoy?"
  ],
  leer: [
    "Escribe la solución como si fuera el título de un libro best-seller.",
    "Si tu problema fuera una novela de misterio, ¿quién sería el culpable y cómo se resuelve?",
    "Resume la solución usando solo 3 palabras clave, como el índice de un libro."
  ],
  jugar: [
    "Dale 'Game Over' al problema: ¿cómo sería la pantalla de victoria?",
    "¿Qué 'poderes especiales' (herramientas/habilidades) necesitas para vencer el nivel de este problema?",
    "Si este problema fuera juego de mesa, ¿cuáles serían las reglas para ganar?"
  ],
  meditar: [
    "Respira: Si dejas ir la necesidad de control, ¿cuál es la solución más simple que queda?",
    "Observa el problema desde lejos, sin juzgar. ¿Qué es lo que realmente importa?",
    "Enfócate en el vacío: ¿qué es lo que NO está sucediendo y debería suceder?"
  ],
  dibujar: [
    "Boceta la solución en un papel sin usar letras, solo formas.",
    "Dibuja el peor escenario posible. Ahora agrégale colores para hacerlo ridículo.",
    "¿Qué colores representan la solución? Intenta pensar en términos visuales."
  ],
  cocinar: [
    "¿Cuáles son los 'ingredientes' necesarios para resolver este problema?",
    "Aplica calor: ¿qué pasa si introduces urgencia a la solución?",
    "Mezcla dos ideas que normalmente no van juntas, como dulce y salado."
  ],
  ejercicio: [
    "Visualiza el esfuerzo: ¿qué músculo metafórico necesitas ejercitar para resolver esto?",
    "Divide el problema en 'series' y 'repeticiones'. ¿Cuál es tu primera serie?",
    "Construye resistencia: ¿qué harás si la primera solución falla?"
  ],
  cine: [
    "Si este problema fuera el clímax de una película, ¿cómo lo resolvería el protagonista?",
    "Haz un 'corte de director': elimina escenas innecesarias de tu planteamiento.",
    "Visualiza la escena post-créditos de tu problema ya resuelto. ¿Qué se ve?"
  ],
  escribir: [
    "Redacta una carta de renuncia a tu problema.",
    "Escribe un poema malo sobre cómo vas a solucionarlo.",
    "Si tuvieras que usar metáforas para solucionar el problema, ¿cuáles serían?"
  ],
  limpiar: [
    "Limpia el desorden: ¿qué partes del problema son basura y puedes ignorar?",
    "Organiza las piezas del problema por orden de importancia, como un armario.",
    "Pule lo que ya tienes: en lugar de una idea nueva, ¿puedes mejorar algo existente?"
  ]
};

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
    let availablePerspectives = [...GLOBAL_PERSPECTIVES];
    
    // Agrega perspectivas basadas en los gustos del usuario
    state.interests.forEach(interest => {
      if (STRATEGIES_BY_INTEREST[interest]) {
        availablePerspectives = [...availablePerspectives, ...STRATEGIES_BY_INTEREST[interest]];
      }
    });

    const random = availablePerspectives[Math.floor(Math.random() * availablePerspectives.length)];
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
            <button onClick={getRandomPerspective} className="text-green-600 p-2 hover:bg-green-200 rounded-lg transition-colors flex items-center gap-1">
              <Shuffle size={16} />
              <span className="text-xs font-semibold">Generar</span>
            </button>
          </div>
          <p className="text-green-800 text-sm italic min-h-[40px] leading-relaxed">
            {perspective || "Usa tus gustos para generar estrategias creativas. ¡Toca Generar!"}
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
