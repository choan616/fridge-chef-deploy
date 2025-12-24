/* eslint-disable @typescript-eslint/no-explicit-any */
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Recipe, RecipeStep } from "@/types";

// For Vercel deployment, we use the Gemini API directly instead of the MCP server.
const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function suggestRecipes(ingredients: string[]): Promise<Recipe[]> {
  if (!genAI) {
      console.error("GEMINI_API_KEY is missing");
      return [];
  }

  try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const prompt = `
        You are a professional chef. Suggest 3 recipes based on these ingredients: ${ingredients.join(", ")}.
        Return strictly a JSON array of objects. Do not include markdown formatting.
        Each object should have:
        - id: string (a concise slug based on title)
        - title: string (in Korean)
        - description: string (in Korean, brief)
        - ingredients: string[] (list of ingredient names in Korean)
        - cookTime: string (e.g., "15분")
        - thumbnailUrl: string (use empty string "")
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();
      text = text.replace(/```json/g, "").replace(/```/g, "").trim();
      
      return JSON.parse(text);
  } catch (error) {
    console.error("Failed to suggest recipes (Gemini):", error);
    return [];
  }
}

export async function getRecipeSteps(recipeId: string, recipeTitle?: string, servings: number = 2): Promise<RecipeStep[]> {
  if (!genAI) return [];
  
  const title = recipeTitle || recipeId;

  try {
       const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
       const prompt = `
         Create detailed cooking steps for the recipe "${title}".
         Return strictly a JSON array of objects. Do not include markdown formatting.
         Each object should have:
         - step: number
         - instruction: string (in Korean, detailed)
         - tip: string (optional, helpful tip in Korean)
       `;
       
       const result = await model.generateContent(prompt);
       const response = await result.response;
       let text = response.text();
       text = text.replace(/```json/g, "").replace(/```/g, "").trim();

       return JSON.parse(text);
  } catch (error) {
    console.error("Failed to get recipe steps (Gemini):", error);
    return [];
  }
}
