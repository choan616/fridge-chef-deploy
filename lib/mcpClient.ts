/* eslint-disable @typescript-eslint/no-explicit-any */
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Recipe, RecipeStep } from "@/types";

// For Vercel deployment, we use the Gemini API directly instead of the MCP server.
const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Log API key status (without exposing the actual key)
console.log('[mcpClient] API Key present:', !!apiKey);
console.log('[mcpClient] API Key length:', apiKey?.length || 0);
console.log('[mcpClient] GenAI initialized:', !!genAI);

export async function suggestRecipes(ingredients: string[]): Promise<Recipe[]> {
  console.log('[suggestRecipes] Called with ingredients:', ingredients);
  
  if (!genAI) {
      console.error("[suggestRecipes] GEMINI_API_KEY is missing - genAI is null");
      return [];
  }

  try {
      console.log('[suggestRecipes] Initializing Gemini model...');
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
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

      console.log('[suggestRecipes] Sending request to Gemini API...');
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();
      console.log('[suggestRecipes] Received response, length:', text.length);
      
      text = text.replace(/```json/g, "").replace(/```/g, "").trim();
      const recipes = JSON.parse(text);
      console.log('[suggestRecipes] Successfully parsed recipes:', recipes.length);
      
      return recipes;
  } catch (error: any) {
    console.error("[suggestRecipes] Failed to suggest recipes:", error);
    console.error("[suggestRecipes] Error name:", error?.name);
    console.error("[suggestRecipes] Error message:", error?.message);
    console.error("[suggestRecipes] Error stack:", error?.stack);
    return [];
  }
}

export async function getRecipeSteps(recipeId: string, recipeTitle?: string, servings: number = 2): Promise<RecipeStep[]> {
  console.log('[getRecipeSteps] Called with:', { recipeId, recipeTitle, servings });
  
  if (!genAI) {
    console.error("[getRecipeSteps] GEMINI_API_KEY is missing - genAI is null");
    return [];
  }
  
  const title = recipeTitle || recipeId;
  console.log('[getRecipeSteps] Using title:', title);

  try {
       console.log('[getRecipeSteps] Initializing Gemini model...');
       const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
       
       const prompt = `
         Create detailed cooking steps for the recipe "${title}".
         Return strictly a JSON array of objects. Do not include markdown formatting.
         Each object should have:
         - step: number
         - instruction: string (in Korean, detailed)
         - tip: string (optional, helpful tip in Korean)
       `;
       
       console.log('[getRecipeSteps] Sending request to Gemini API...');
       const result = await model.generateContent(prompt);
       const response = await result.response;
       let text = response.text();
       console.log('[getRecipeSteps] Received response, length:', text.length);
       
       text = text.replace(/```json/g, "").replace(/```/g, "").trim();
       const steps = JSON.parse(text);
       console.log('[getRecipeSteps] Successfully parsed steps:', steps.length);

       return steps;
  } catch (error: any) {
    console.error("[getRecipeSteps] Failed to get recipe steps:", error);
    console.error("[getRecipeSteps] Error name:", error?.name);
    console.error("[getRecipeSteps] Error message:", error?.message);
    console.error("[getRecipeSteps] Error stack:", error?.stack);
    return [];
  }
}
