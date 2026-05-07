import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const getAgriAdvice = async (crop: string, district: string, language: 'en' | 'te') => {
  const model = "gemini-3-flash-preview";
  const prompt = `You are AgriSight AI Expert. Provide professional agricultural advice for a farmer in ${district}, India growing ${crop}.
  The response should include:
  1. Market outlook (price trends).
  2. Best practices for the current season.
  3. Risk mitigation (weather/pests).
  4. Specific advice for increasing profit.
  
  Please respond in ${language === 'te' ? 'Telugu' : 'English'}. 
  Keep it practical, data-driven, and highly encouraging. Use emojis.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating advice. Please try again later.";
  }
};

export const getCropRecommendation = async (soilType: string, district: string, waterAvailability: string) => {
  const prompt = `Recommend the best 3 crops to grow in ${district}, India with ${soilType} soil and ${waterAvailability} water availability. 
  Justify based on current market demand in India and climate conditions.
  Return as JSON: [{ "crop": "Name", "reason": "Short reason", "profitPotential": "High/Medium", "risk": "Low/Medium/High" }]`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Gemini API Error:", error);
    return [];
  }
};
