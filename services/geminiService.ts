import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ScanResult, Priority } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Define the Schema for structured JSON output
const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING, description: "A brief summary of what is seen in the image." },
    itemsDetected: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          category: { type: Type.STRING },
          confidence: { type: Type.NUMBER },
        }
      }
    },
    tasks: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Actionable task extracted from text" },
          deadline: { type: Type.STRING, description: "YYYY-MM-DD format if available" },
          priority: { type: Type.STRING, enum: ["High", "Medium", "Low"] }
        }
      }
    },
    events: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          date: { type: Type.STRING, description: "YYYY-MM-DD" },
          time: { type: Type.STRING, description: "HH:MM" },
          location: { type: Type.STRING }
        }
      }
    },
    notes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          content: { type: Type.STRING },
          tags: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    },
    studyPlan: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "If academic content is found, suggest a study plan step."
    }
  }
};

export const analyzeImage = async (base64Image: string): Promise<Partial<ScanResult>> => {
  try {
    // Remove header if present (data:image/jpeg;base64,)
    const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, "");

    const modelId = "gemini-2.5-flash"; // Using Flash for speed/reliability with JSON schema

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: cleanBase64
            }
          },
          {
            text: `Analyze this image (which may be a messy desk, a document, a handwritten note, or a screenshot). 
            Act as an expert organizer.
            1. Identify physical objects.
            2. Read all text, including handwriting.
            3. Extract actionable tasks, calendar events, and key notes.
            4. If it looks like study material, suggest a study plan.
            5. Return the result in strictly structured JSON.`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.4, // Lower temperature for more deterministic data extraction
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    const jsonResponse = JSON.parse(text);

    // Map the response to our internal types, adding IDs
    return {
      summary: jsonResponse.summary || "Analysis complete.",
      itemsDetected: jsonResponse.itemsDetected || [],
      tasks: (jsonResponse.tasks || []).map((t: any) => ({
        ...t,
        id: crypto.randomUUID(),
        completed: false,
        priority: t.priority as Priority || Priority.MEDIUM
      })),
      events: (jsonResponse.events || []).map((e: any) => ({
        ...e,
        id: crypto.randomUUID()
      })),
      notes: (jsonResponse.notes || []).map((n: any) => ({
        ...n,
        id: crypto.randomUUID()
      })),
      studyPlan: jsonResponse.studyPlan || []
    };

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};
