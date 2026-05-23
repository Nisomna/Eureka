import React, { useState } from 'react';
import { Phase, AppState } from '../types';
import { ArrowRight, ArrowLeft, Lightbulb, Plus, Shuffle, Sparkles, AlertCircle, Edit3, Image as ImageIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { SketchPad } from '../components/SketchPad';

interface Props {
  setPhase: (phase: Phase) => void;
  state: AppState;
  updateState: (updates: Partial<AppState>) => void;
  isDark?: boolean;
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
    "Aplica calor: ¿que pasa si introduces urgencia a la solución?",
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

export function Eureka({ setPhase, state, updateState, isDark }: Props) {
  const [creativeTab, setCreativeTab] = useState<'text' | 'draw'>('text');
  const [newIdea, setNewIdea] = useState('');
  const [perspective, setPerspective] = useState('');

  const addIdea = () => {
    if (newIdea.trim()) {
      updateState({ ideas: [newIdea.trim(), ...state.ideas] });
      setNewIdea('');
    }
  };

  const handleSaveSketch = (dataUrl: string) => {
    updateState({ ideas: [dataUrl, ...state.ideas] });
  };

  const getRandomPerspective = () => {
    let availablePerspectives = [...GLOBAL_PERSPECTIVES];
    
    // Add perspectives based on specific interests
    state.interests.forEach(interest => {
      // Clean matching formatting (since values look like "Meditación", let's make it lowercase & clean)
      const keyword = interest.toLowerCase()
        .replace('meditación', 'meditar')
        .replace('dibujo', 'dibujar')
        .replace('poesía', 'escribir')
        .replace('lector', 'leer')
        .replace('escuchar música', 'musica')
        .replace('caminar', 'caminar')
        .replace('cocinar', 'cocinar')
        .replace('ejercicio', 'ejercicio')
        .replace('yoga', 'ejercicio')
        .replace('videojuegos', 'jugar')
        .replace('películas', 'cine')
        .replace('limpiar', 'limpiar');
      
      const matchedKey = Object.keys(STRATEGIES_BY_INTEREST).find(k => keyword.includes(k));
      if (matchedKey && STRATEGIES_BY_INTEREST[matchedKey]) {
        availablePerspectives = [...availablePerspectives, ...STRATEGIES_BY_INTEREST[matchedKey]];
      }
    });

    const random = availablePerspectives[Math.floor(Math.random() * availablePerspectives.length)];
    setPerspective(random);
  };

  // Gracefully handle if problem is missing when coming directly
  if (!state.problem.trim()) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-center space-y-6 mt-12 px-4 pb-24">
        <div className="w-16 h-16 bg-calm-butterscotch/15 rounded-full flex items-center justify-center border border-calm-butterscotch/35 text-calm-butterscotch animate-float">
          <AlertCircle size={32} />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-calm-olive dark:text-white serif-title">Falta Definir tu Enfoque</h3>
          <p className="text-sm text-calm-olive/60 dark:text-[#EBECEB]/60 max-w-xs leading-relaxed">
            Para cultivar ideas mágicas y perspectivas creativas, primero define tu reto en el primer paso.
          </p>
        </div>
        <button
          onClick={() => setPhase('afinar')}
          className="py-3 px-6 bg-calm-sage-500 hover:bg-calm-sage-600 text-white font-bold text-sm rounded-xl transition-colors shadow-md shadow-calm-sage-200/50 cursor-pointer"
        >
          Afinar Problema Ahora
        </button>
      </div>
    );
  }

  const isDarkModeActive = isDark !== undefined ? isDark : document.documentElement.classList.contains('dark');

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-24 px-1">
      {/* Intro Step Banner */}
      <div className="flex items-center space-x-3 mb-6 pt-4">
        <div className="p-3 bg-calm-coral/15 border border-calm-coral/35 dark:bg-calm-coral/25 dark:border-calm-coral/45 text-calm-coral rounded-2xl shadow-sm animate-float">
          <Lightbulb size={24} />
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-widest text-calm-coral dark:text-calm-blush font-bold">Paso 3 de 4</span>
          <h2 className="text-3xl font-bold text-calm-olive dark:text-[#EBECEB] serif-title">Lluvia de Eureka</h2>
          <p className="text-sm text-calm-olive/95 dark:text-slate-200 font-semibold mt-1">La incubadora mental libera las soluciones</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col space-y-5 overflow-hidden">
        
        {/* Perspectives Block - Styled peacefully */}
        <div className="bg-gradient-to-tr from-calm-blush/25 to-calm-coral/10 dark:from-[#1E2E27] dark:to-teal-950/20 border border-calm-coral/30 dark:border-teal-900/60 p-5 rounded-3xl space-y-3 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-xs font-bold text-calm-sage-700 dark:text-calm-blush uppercase tracking-widest flex items-center space-x-1.5">
              <Sparkles size={14} className="text-calm-coral animate-pulse" />
              <span>Girar Perspectiva</span>
            </h4>
            <button 
              type="button" 
              onClick={getRandomPerspective} 
              className="text-calm-emeraldsea hover:text-white dark:text-calm-duckegg dark:hover:text-white bg-calm-cream hover:bg-calm-emeraldsea border border-calm-duckegg py-1.5 px-3 rounded-xl transition-all flex items-center gap-1 hover:shadow-sm cursor-pointer text-xs"
            >
              <Shuffle size={13} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Generar Reto</span>
            </button>
          </div>
          <p className="text-calm-olive dark:text-calm-duckegg text-xs italic leading-relaxed min-h-[36px] bg-calm-cream/60 dark:bg-[#1C2621]/40 p-3 rounded-xl border border-calm-duckegg/40 dark:border-teal-900/30">
            {perspective || "Usa tus gustos e intereses personales para cambiar la perspectiva de tu problema. ¡Prueba Generar un Reto!"}
          </p>
        </div>

        {/* Tab Selection for Idea modes */}
        <div className="flex bg-stone-100 dark:bg-[#1C2621]/60 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setCreativeTab('text')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              creativeTab === 'text' 
                ? 'bg-white dark:bg-[#25322B] text-calm-olive dark:text-white shadow-sm' 
                : 'text-calm-sage-600 hover:text-calm-olive dark:text-[#EBECEB]/50 dark:hover:text-white'
            }`}
          >
            <Edit3 size={14} />
            <span>Idea Escrita</span>
          </button>
          <button
            type="button"
            onClick={() => setCreativeTab('draw')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              creativeTab === 'draw' 
                ? 'bg-white dark:bg-[#25322B] text-calm-olive dark:text-white shadow-sm' 
                : 'text-calm-sage-600 hover:text-calm-olive dark:text-[#EBECEB]/50 dark:hover:text-white'
            }`}
          >
            <ImageIcon size={14} />
            <span>Dibujar Boceto</span>
          </button>
        </div>

        {/* Input/Draw Workspace */}
        {creativeTab === 'text' ? (
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-calm-sage-700 dark:text-[#EBECEB]/75 uppercase tracking-wider">
              Anota todas tus ideas (sin juicios ni límites)
            </h4>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newIdea}
                onChange={(e) => setNewIdea(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addIdea()}
                placeholder="Tengo una idea de hacer..."
                className="flex-1 p-4 rounded-xl border border-calm-sage-200 dark:border-teal-900/40 bg-calm-cream/90 dark:bg-[#1C2621]/80 focus:bg-calm-cream dark:focus:bg-[#1C2621] focus:ring-4 focus:ring-calm-emeraldsea/20 focus:border-calm-emeraldsea outline-none text-sm transition-all text-calm-olive dark:text-[#EBECEB] placeholder:text-calm-olive/75 dark:placeholder:text-[#EBECEB]/55"
              />
              <button
                type="button"
                onClick={addIdea}
                disabled={!newIdea.trim()}
                className="p-4 bg-calm-sage-500 hover:bg-calm-sage-600 text-white rounded-xl disabled:bg-calm-sage-100 dark:disabled:bg-teal-950/40 disabled:text-calm-olive/30 dark:disabled:text-[#EBECEB]/25 shadow-md shadow-calm-sage-200/40 dark:shadow-none disabled:shadow-none transition-all cursor-pointer flex items-center justify-center shrink-0"
                title="Añadir idea"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-calm-sage-700 dark:text-[#EBECEB]/75 uppercase tracking-wider flex items-center gap-1.5">
              <span>Boceta tu idea visualmente</span>
              <span className="text-[10px] lowercase text-calm-olive/60 dark:text-[#EBECEB]/70 font-normal">Garabatea libremente</span>
            </h4>
            <SketchPad onSave={handleSaveSketch} isDark={isDarkModeActive} />
          </div>
        )}

        {/* Brainstorm Lists */}
        <div className="flex-1 min-h-[140px] overflow-y-auto space-y-2.5 pb-2">
          {state.ideas.length === 0 ? (
            <div className="h-full py-8 flex flex-col items-center justify-center text-center space-y-3 calm-card border border-dashed border-calm-sage-200 dark:border-teal-900/40 bg-calm-cream/40 dark:bg-[#1C2621]/20">
              <Lightbulb size={36} className="text-calm-sage-500 opacity-60 animate-pulse" />
              <div className="space-y-1">
                <p className="text-xs font-bold text-calm-olive/85 dark:text-[#EBECEB]/85">¿Algún chispazo?</p>
                <p className="text-[10px] text-calm-olive/75 dark:text-[#EBECEB]/75 max-w-[180px] leading-relaxed mx-auto">Toca el botón 'Generar Reto' o anota ideas sueltas y absurdas.</p>
              </div>
            </div>
          ) : (
            state.ideas.map((idea, idx) => (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                key={idx}
                className="p-3.5 bg-calm-cream dark:bg-[#18221D] border border-calm-sage-200 dark:border-teal-950 rounded-2xl shadow-sm text-xs flex items-start space-x-2.5 text-calm-olive dark:text-[#EBECEB] leading-relaxed"
              >
                <span className="inline-flex w-5 h-5 items-center justify-center rounded-full bg-calm-duckegg/20 dark:bg-teal-950/40 text-[10px] text-calm-emeraldsea dark:text-calm-duckegg font-bold shrink-0 mt-0.5">
                  {state.ideas.length - idx}
                </span>
                
                {idea.startsWith('data:image/') ? (
                  <div className="flex-1 space-y-2">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-calm-emeraldsea dark:text-calm-duckegg block flex items-center gap-1.5">
                      <ImageIcon size={12} /> Boceto de Idea Visual
                    </span>
                    <img 
                      src={idea} 
                      alt="Visual Sketch" 
                      className="max-w-[200px] max-h-36 rounded-xl border border-calm-sage-200 dark:border-teal-900 bg-calm-cream dark:bg-[#141C18] p-1 shadow-sm object-contain" 
                      referrerPolicy="no-referrer" 
                    />
                  </div>
                ) : (
                  <span className="flex-1 font-medium text-calm-olive dark:text-[#EBECEB]">{idea}</span>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Button actions */}
      <div className="pt-4 flex space-x-3">
        <button
          onClick={() => setPhase('despeje')}
          className="p-4 rounded-2xl border border-calm-sage-200 dark:border-teal-900 bg-calm-cream dark:bg-[#1C2621]/80 hover:bg-calm-sage-100/60 dark:hover:bg-calm-sage-950 text-calm-olive dark:text-[#EBECEB] transition-colors flex items-center justify-center shadow-sm cursor-pointer"
          title="Regresar"
        >
          <ArrowLeft size={18} />
        </button>
        <button
          onClick={() => setPhase('aplicacion')}
          disabled={state.ideas.length === 0}
          className="flex-1 py-4 bg-calm-sage-500 hover:bg-calm-sage-600 disabled:bg-calm-sage-100 dark:disabled:bg-teal-950/40 disabled:text-calm-olive/30 dark:disabled:text-[#EBECEB]/25 disabled:cursor-not-allowed text-white rounded-2xl font-bold text-base flex items-center justify-center space-x-2 transition-all shadow-lg shadow-calm-sage-200/50 dark:shadow-none disabled:shadow-none"
        >
          <span>Siguiente Paso: Aplicar Plan</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}

