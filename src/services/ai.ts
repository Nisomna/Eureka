// Client-side service to communicate with our Express backend APIs

export async function validateProblem(problem: string, definition: string, options: string) {
  try {
    const response = await fetch("/api/validate-problem", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ problem, definition, options })
    });
    
    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error validating problem on client:", error);
    // Fallback: admit it if it fails so the user isn't blocked.
    return { isValid: true, feedback: "" };
  }
}

export async function generateDespejeContent(interests: string[], problem: string) {
  try {
    const response = await fetch("/api/generate-despeje-content", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ interests, problem })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Server returned status ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error("Error generating despeje on client:", error);
    throw error; // Rethrow to let components handle and display error message properly
  }
}

export async function getIdeaAdvice(problem: string, definition: string, idea: string) {
  try {
    const response = await fetch("/api/get-idea-advice", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ problem, definition, idea })
    });

    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}`);
    }

    const result = await response.json();
    return result.advice;
  } catch (error) {
    console.error("Error getting idea advice on client:", error);
    return "Tuvimos un problema generando tu consejo, pero ¡anímate a darle forma a tu idea aplicando tú mismo las restricciones que anotaste en la primera fase!";
  }
}
