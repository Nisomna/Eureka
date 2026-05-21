import { GoogleGenAI, Type } from "@google/genai";

// En Vite/Vercel se usa import.meta.env.VITE_GEMINI_API_KEY
// En el entorno de AI Studio se usa process.env.GEMINI_API_KEY
const metaEnv = (import.meta as any).env || {};
const apiKey = metaEnv.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("GEMINI_API_KEY no encontrada. La IA no funcionará hasta que se configure la variable de entorno.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || "" });

export async function validateProblem(problem: string, definition: string, options: string) {
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
      model: "gemini-3-flash-preview",
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

    const result = JSON.parse(response.text.trim());
    return result;
  } catch (error) {
    console.error("Error validating problem:", error);
    // Fallback: admit it if the API fails so the user isn't blocked.
    return { isValid: true, feedback: "" };
  }
}

export async function generateDespejeContent(interests: string[], problem: string) {
  const prompt = `El usuario necesita un descanso de incubación (1 día) para despejar su mente y resolver el siguiente bloqueo creativo:
"${problem}"

Sus intereses y gustos específicos para relajarse son: ${interests.join(', ')}.

Genera lo siguiente en formato JSON:
1. "activities": Una lista de 2 a 4 actividades únicas y personalizadas basadas en estos gustos y su problema (para distraerlo activamente).
2. "dayPlan": Un plan del día (mañana, tarde, noche) en texto (Markdown) estructurado sobre cómo podría ser un día de descanso y desconexión total usando estos gustos, en caso de que prefiera no hacer actividades sueltas y decida fluir.

Iconos válidos para iconId: "headphones", "radio", "footprints", "activity", "book", "globe", "gamepad", "puzzle", "wind", "tree", "pen", "palette", "coffee", "chefHat", "dumbbell", "tv", "popcorn", "penLine", "sparkles", "eraser", "utensils"
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
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

    const result = JSON.parse(response.text.trim());
    return result;
  } catch (error) {
    console.error("Error generating despeje:", error);
    return null;
  }
}

export async function getIdeaAdvice(problem: string, definition: string, idea: string) {
  const prompt = `El usuario tiene el siguiente problema creativo:
Problema: ${problem}
Restricciones/Contexto: ${definition}

Ha tenido la siguiente idea para resolverlo:
Idea: "${idea}"

Escribe 2 a 3 párrafos de consejo directo y estructurado sobre cómo podría aterrizar, aplicar o usar esta idea de manera práctica para solucionar su problema original, tomando en cuenta las restricciones y el contexto. Sugiere siguientes pasos accionables. Sé motivador y servicial.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error getting idea advice:", error);
    return "Tuvimos un problema generando tu consejo, pero ¡anímate a darle forma a tu idea aplicando tú mismo las restricciones que anotaste en la primera fase!";
  }
}
