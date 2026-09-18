import { GoogleGenAI } from "@google/genai";

export async function analyzeWithGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      "Missing GEMINI_API_KEY in .env.local — add your key from https://aistudio.google.com/apikey"
    );
  }

  const model = process.env.GEMINI_MODEL?.trim() || "gemini-3.6-flash";
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
  });

  const text = response.text?.trim();
  if (!text) {
    throw new Error("Gemini returned an empty response");
  }
  return text;
}
