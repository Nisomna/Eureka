import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize GenAI on the server side
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("WARNING: GEMINI_API_KEY is not defined in the environment.");
}

const ai = new GoogleGenAI({
  apiKey: apiKey || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Helper function to generate fallback activities and day plan when the API fails or quota is exhausted (429)
function generateFallbackDespeje(interests: string[], problem: string) {
  const defaultActivities = [
    {
      id: "f1",
      title: "Desconexión de Pantallas",
      desc: "Apaga tu teléfono y ordenador durante 2 horas. Dedica este tiempo a contemplar tu entorno.",
      iconId: "wind"
    },
    {
      id: "f2",
      title: "Paseo de Incubación Pasiva",
      desc: "Da un paseo de 20 minutos sin música ni podcasts. Deja que tu mente asocie conceptos en segundo plano.",
      iconId: "footprints"
    },
    {
      id: "f3",
      title: "Ritual de un Té o Café",
      desc: "Prepara una bebida caliente lenta y conscientemente. Saborea su calor sin hacer nada más.",
      iconId: "coffee"
    }
  ];

  const interestMappings: Record<string, { title: string; desc: string; iconId: string }> = {
    'Dibuje/Boceto': {
      title: 'Garabato Libre',
      desc: 'Toma un papel físico y dibuja trazos sin sentido durante 10 minutos. No intentes crear arte, solo fluye.',
      iconId: 'palette'
    },
    'Pintura': {
      title: 'Espacio de Color',
      desc: 'Experimenta con acuarelas o pinturas físicas, mezclando colores sin buscar representar ningún objeto real.',
      iconId: 'palette'
    },
    'Fotografía': {
      title: 'Perspectivas Inusuales',
      desc: 'Camina por tu espacio o por la calle buscando registrar en fotos 5 texturas o sombras que normalmente ignoras.',
      iconId: 'globe'
    },
    'Escribir Poesía/Cuento': {
      title: 'Escritura Automática',
      desc: 'Escribe sin parar en una hoja todo lo que venga a tu mente durante 5 minutos, sin juzgar la sintaxis ni el orden.',
      iconId: 'penLine'
    },
    'Trotar/Caminar al aire libre': {
      title: 'Paseo Sensorial',
      desc: 'Sal a trotar o caminar prestando atención exclusiva al sonido de tus pisadas y el viento en tu rostro.',
      iconId: 'footprints'
    },
    'Yoga/Estiramiento': {
      title: 'Estiramiento Mindful',
      desc: 'Mantén 5 posturas básicas de estiramiento sosteniendo la respiración consciente durante 30 segundos en cada una.',
      iconId: 'activity'
    },
    'Pesas/HIIT': {
      title: 'Descarga de Energía Física',
      desc: 'Haz una serie corta e intensa de ejercicios físicos para redirigir el flujo de sangre lejos del agobio mental.',
      iconId: 'dumbbell'
    },
    'Deportes de equipo': {
      title: 'Interacción Social Ligera',
      desc: 'Conversa o planea un encuentro relajado para reconectar con otros y cambiar de sintonía mental.',
      iconId: 'activity'
    },
    'Ciclismo': {
      title: 'Ruta del Viento',
      desc: 'Da una vuelta corta en bicicleta prestando atención plena a la velocidad y el movimiento de tus piernas.',
      iconId: 'footprints'
    },
    'Leer ficción/cómics': {
      title: 'Inmersión Literaria',
      desc: 'Lee un capítulo entero de una novela de ficción o un cómic divertido, alejando tu mente de tu realidad habitual.',
      iconId: 'book'
    },
    'Leer no ficción/artículos': {
      title: 'Aprendizaje Desconectado',
      desc: 'Lee un artículo sobre un tema totalmente ajeno a tu profesión o campos de estudio del problema.',
      iconId: 'book'
    },
    'Ver Series o Películas': {
      title: 'Cine Contemplativo',
      desc: 'Disfruta de una película o un episodio de serie con atmósfera pausada sin estar atento al teléfono.',
      iconId: 'tv'
    },
    'Jugar Videojuegos (Consola/PC)': {
      title: 'Mundo Virtual Relajante',
      desc: 'Juega un título calmado u offline que promueva la exploración libre o la construcción pausada.',
      iconId: 'gamepad'
    },
    'Juegos de Móvil': {
      title: 'Micro-Rompecabezas',
      desc: 'Juega un nivel de algún juego de lógica o puzzle en tu móvil, de forma relajante y sin prisas competitivas.',
      iconId: 'puzzle'
    },
    'Juegos de mesa/Puzzle': {
      title: 'Enfoque Táctil Plano',
      desc: 'Arma parte de un rompecabezas físico o haz un sudoku o crucigrama en papel para descansar tus ojos.',
      iconId: 'puzzle'
    },
    'Meditación': {
      title: 'Observación de la Respiración',
      desc: 'Siéntate con la espalda erguida y sigue el paso de tu respiración por 10 minutos. Deja marchar el problema.',
      iconId: 'wind'
    },
    'Cocinar algo nuevo/Hornear': {
      title: 'Cocina Alquímica',
      desc: 'Prepara una receta sencilla o postre nuevo, prestando atención plena a los aromas, cortes y texturas.',
      iconId: 'chefHat'
    },
    'Limpiar/Ordenar espacios': {
      title: 'Orden Externo = Claridad Interna',
      desc: 'Ordena un cajón o tu mesa de trabajo. Limpiar físicamente ayuda enormemente a despejar ideas apiladas.',
      iconId: 'eraser'
    },
    'Escuchar música/Descubrir bandas': {
      title: 'Audición Concentrada',
      desc: 'Escucha un álbum completo de música tranquila con los ojos cerrados, identificando los diferentes instrumentos.',
      iconId: 'headphones'
    },
    'Tocar un instrumento': {
      title: 'Improvisación Libre',
      desc: 'Toca acordes libres en tu instrumento sin intentar ensayar un tema específico. Siente la vibración acústica.',
      iconId: 'radio'
    },
    'Escuchar Podcasts': {
      title: 'Historias en el Aire',
      desc: 'Escucha un episodio de podcast sobre historia, naturaleza o anécdotas curiosas, libre de productividad comercial.',
      iconId: 'headphones'
    }
  };

  const selectedMatches = (interests || [])
    .map(interest => interestMappings[interest])
    .filter(Boolean);

  let activities = [];
  if (selectedMatches.length > 0) {
    const shuffled = [...selectedMatches].sort(() => 0.5 - Math.random());
    activities = shuffled.slice(0, 3).map((act, i) => ({
      id: `fallback-${i}`,
      ...act
    }));
  }

  while (activities.length < 3) {
    const nextDefault = defaultActivities.find(def => !activities.some(act => act.title === def.title));
    if (nextDefault) {
      activities.push({
        id: `fallback-def-${activities.length}`,
        title: nextDefault.title,
        desc: nextDefault.desc,
        iconId: nextDefault.iconId
      });
    } else {
      break;
    }
  }

  const dayPlanInterestsText = (interests || []).length > 0 
    ? `sincronizando con tus intereses indicados como **${(interests || []).join(', ')}**`
    : 'centrado en el vacío mental contemplativo';

  const dayPlanMarkdown = `### Tu Itinerario de Incubadora Personalizado (Modo de Calma Autónomo)

*Nota: Ante la saturación temporal de cuota del servidor externo, hemos cargado este plan especialmente estructurado basado en tus preferencias para que sigas tu incubación sin interrupciones.*

Abandona activamente el control consciente de: *"${problem}"*. Tu cerebro trabajará solo en la trastienda de tu mente.

---

#### 🌅 Mañana: El Inicio del Vacío
Prepara tu mente despertándote sin mirar pantallas durante los primeros 45 minutos. Realiza una sesión corta de estiramientos corporales conscientes. Desvía tu foco leyendo un capítulo de un libro físico o preparando un desayuno sin prisas. El objetivo es enfriar tu córtex prefrontal dándole un descanso de metas rígidas.

#### ☀️ Tarde: Fluir en tus Pasiones
Dedica la tarde a interactuar levemente con tus gustos favoritos, ${dayPlanInterestsText}. Alterna las tareas con pausas de 5 minutos sentado mirando el cielo o una pared en blanco, prestando atención a la respiración. Confía en la **red neuronal por defecto (DMN)** de tu cerebro: tus neuronas continuarán asociando conceptos si dejas de forzarlas.

#### 🌌 Noche: Descarga y Entrega
Prepara una infusión tibia a última hora, saboreando el aroma y el calor con total tranquilidad. Guarda los teléfonos móviles en otra habitación. Escribe en una libreta física las ideas sueltas para liberar espacio en memoria de trabajo y duerme sabiendo que la solución se incubará adecuadamente.
`;

  return {
    activities,
    dayPlan: dayPlanMarkdown
  };
}

// API Routes
app.post("/api/validate-problem", async (req, res) => {
  const { problem, definition, options } = req.body;

  const prompt = `Evalúa si el siguiente problema creativo está bien definido antes de pasar a una fase de incubación (Despeje).
Problema: ${problem}
Restricciones/Definición: ${definition}
Opciones intentadas: ${options}

Un problema bien definido debe ser claro, tener un objetivo entendible y conocer las restricciones principales.
Si está bien definido y provee suficiente contexto para buscar una solución, aprueba.
Si es muy vago o le falta foco (ej: "no sé qué hacer", "tengo un problema", "quiero hacer algo cool"), rechaza y da un consejo amable y breve sobre qué detalles o preguntas debería contestarse para afinarlo mejor.

Responde obligatoriamente en JSON usando el esquema definido.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isValid: { type: Type.BOOLEAN, description: "True si el problema está bien definido, False si es vago." },
            feedback: { type: Type.STRING, description: "Si isValid es false, qué aconsejarías para afinarlo." }
          },
          required: ["isValid", "feedback"]
        }
      }
    });

    const text = response.text || "{}";
    const result = JSON.parse(text.trim());
    res.json(result);
  } catch (error: any) {
    const isQuota = error?.message?.includes("quota") || error?.message?.includes("429") || error?.status === 429;
    if (isQuota) {
      console.log("[Server Info] Gemini API quota limit reached during validation (Status 429). Serving graceful offline fallback.");
    } else {
      console.log("[Server Info] Encountered validation API error. Serving graceful offline fallback:", error?.message || error);
    }
    // Graceful validation fallback
    res.json({
      isValid: true,
      feedback: "Operando en Modo Autónomo Local (Cuota Agotada). Hemos validado tu planteamiento para que puedas continuar sin esperas. ¡A por ello!",
      isQuotaExceeded: true,
      isFallback: true
    });
  }
});

app.post("/api/generate-despeje-content", async (req, res) => {
  const { interests, problem } = req.body;

  const prompt = `El usuario necesita un descanso de incubación (1 día) para despejar su mente y resolver el siguiente bloqueo creativo:
"${problem}"

Sus intereses y gustos específicos para relajarse son: ${(interests || []).join(', ')}.

Genera lo siguiente en formato JSON:
1. "activities": Una lista de 2 a 4 actividades únicas y personalizadas basadas en estos gustos y su problema (para distraerlo activamente).
2. "dayPlan": Un plan del día (mañana, tarde, noche) en texto (Markdown) estructurado sobre cómo podría ser un día de descanso y desconexión total usando estos gustos, en caso de que prefiera no hacer actividades sueltas y decida fluir.

Iconos válidos para iconId: "headphones", "radio", "footprints", "activity", "book", "globe", "gamepad", "puzzle", "wind", "tree", "pen", "palette", "coffee", "chefHat", "dumbbell", "tv", "popcorn", "penLine", "sparkles", "eraser", "utensils"
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            activities: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  desc: { type: Type.STRING },
                  iconId: { type: Type.STRING, description: "Must be one of the valid icons string" },
                },
                required: ["id", "title", "desc", "iconId"]
              }
            },
            dayPlan: { type: Type.STRING, description: "Markdown text" }
          },
          required: ["activities", "dayPlan"]
        }
      }
    });

    const text = response.text || "{}";
    const result = JSON.parse(text.trim());
    res.json({
      ...result,
      isQuotaExceeded: false,
      isFallback: false
    });
  } catch (error: any) {
    const isQuota = error?.message?.includes("quota") || error?.message?.includes("429") || error?.status === 429;
    if (isQuota) {
      console.log("[Server Info] Gemini API quota limit reached during despeje generation (Status 429). Serving graceful offline fallback.");
    } else {
      console.log("[Server Info] Encountered despeje API error. Serving graceful offline fallback:", error?.message || error);
    }
    // High-quality local interest match fallback instead of throwing error!
    const fallbackData = generateFallbackDespeje(interests || [], problem || "");
    res.json({
      activities: fallbackData.activities,
      dayPlan: fallbackData.dayPlan,
      isQuotaExceeded: true,
      isFallback: true
    });
  }
});

app.post("/api/get-idea-advice", async (req, res) => {
  const { problem, definition, idea } = req.body;

  const prompt = `El usuario tiene el siguiente problema creativo:
Problema: ${problem}
Restricciones/Contexto: ${definition}

Ha tenido la siguiente idea para resolverlo:
Idea: "${idea}"

Escribe 2 a 3 párrafos de consejo directo y estructurado sobre cómo podría aterrizar, aplicar o usar esta idea de manera práctica para solucionar su problema original, tomando en cuenta las restricciones y el contexto. Sugiere siguientes pasos accionables. Sé motivador y servicial.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });
    const text = response.text || "Tuvimos un problema generando tu consejo, pero ¡anímate a darle forma a tu idea aplicando tú mismo las restricciones que anotaste en la primera fase!";
    res.json({ advice: text, isQuotaExceeded: false, isFallback: false });
  } catch (error: any) {
    const isQuota = error?.message?.includes("quota") || error?.message?.includes("429") || error?.status === 429;
    if (isQuota) {
      console.log("[Server Info] Gemini API quota limit reached during advice generation (Status 429). Serving graceful offline fallback.");
    } else {
      console.log("[Server Info] Encountered advice API error. Serving graceful offline fallback:", error?.message || error);
    }
    const fallbackAdvice = `### Plan de Acción Inmediato (Modo Autónomo Local)
 
Tu idea para solucionar tu bloqueo es un gran punto de partida: **"${idea}"**. Aunque el Mentor Calm de IA se encuentra momentáneamente saturado de cuota de red, este método clásico te ayudará a consolidarla de manera impecable:
 
1. **Aísla la primera micro-acción**: Identifica una sola acción sencilla que puedas ejecutar hoy en un lapso de 15 minutos o menos. No trates de resolver el problema entero, solo da el primer paso demostrable.
2. **Somételo a restricciones**: Vuelve a leer tus restricciones anotadas en la primera fase. Ajusta el alcance de tu idea para que encaje perfectamente dentro de ese marco, limando lo que sea innecesariamente ambicioso.
3. **Equivócate rápido**: Construye una versión sumamente cruda o un boceto tosco de tu idea. La retroalimentación más valiosa de la realidad vendrá cuando toques tierra.
 
¡Confía en tu criterio y atrévete a dar el primer paso hoy mismo!`;
 
    res.json({
      advice: fallbackAdvice,
      isQuotaExceeded: true,
      isFallback: true
    });
  }
});

// Vite middleware integration for live preview / assets routing
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();