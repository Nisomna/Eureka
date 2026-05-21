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
    console.error("Error validating problem on server:", error);
    res.status(error.status || 500).json({
      error: error.message || "Unknown error calling Gemini API",
      isValid: true,
      feedback: ""
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
    res.json(result);
  } catch (error: any) {
    console.error("Error generating despeje on server:", error);
    res.status(error.status || 500).json({
      error: error.message || "Unknown error calling Gemini API",
      activities: [],
      dayPlan: ""
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
    res.json({ advice: text });
  } catch (error: any) {
    console.error("Error getting idea advice on server:", error);
    res.status(error.status || 500).json({
      error: error.message || "Unknown error calling Gemini API",
      advice: "Tuvimos un problema generando tu consejo, pero ¡anímate a darle forma a tu idea aplicando tú mismo las restricciones que anotaste en la primera fase!"
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
