/* eslint-disable @typescript-eslint/no-explicit-any */
import Groq from "groq-sdk";
import { Recipe, RecipeStep } from "@/types";

// For Vercel deployment, we use the Groq API directly instead of the MCP server.
const apiKey = process.env.GROQ_API_KEY;
const groq = apiKey ? new Groq({ apiKey }) : null;

// Log API key status (without exposing the actual key)
console.log('[mcpClient] Groq API Key present:', !!apiKey);
console.log('[mcpClient] Groq API Key length:', apiKey?.length || 0);

export async function suggestRecipes(ingredients: string[]): Promise<Recipe[]> {
  console.log('[suggestRecipes] Called with ingredients:', ingredients);
  
  if (!groq) {
      console.error("[suggestRecipes] GROQ_API_KEY is missing - groq is null");
      return [];
  }

  try {
      console.log('[suggestRecipes] Sending request to Groq API...');
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a professional chef. Suggest 3 recipes based on user ingredients. Return strictly a JSON array."
          },
          {
            role: "user",
            content: `Ingredients: ${ingredients.join(", ")}. 
            Return strictly a JSON array of objects. 
            Each object should have:
            - id: string (concise slug)
            - title: string (in Korean)
            - description: string (in Korean, brief)
            - ingredients: string[] (in Korean)
            - cookTime: string (e.g., "15분")
            - thumbnailUrl: string (empty string "")`
          }
        ],
        model: "llama-3.3-70b-versatile",
        response_format: { type: "json_object" }
      });

      let text = completion.choices[0]?.message?.content || "[]";
      console.log('[suggestRecipes] Received response, length:', text.length);
      
      const parsed = JSON.parse(text);
      // Handle potential wrapped response from Groq
      const recipes = Array.isArray(parsed) ? parsed : (parsed.recipes || parsed.suggestions || Object.values(parsed)[0]);
      
      console.log('[suggestRecipes] Successfully parsed recipes:', Array.isArray(recipes) ? recipes.length : 'error');
      
      return recipes;
  } catch (error: any) {
    console.error("[suggestRecipes] Failed to suggest recipes:", error);
    return [];
  }
}

export async function getRecipeSteps(recipeId: string, recipeTitle?: string, servings: number = 2): Promise<RecipeStep[]> {
  console.log('[getRecipeSteps] Called with:', { recipeId, recipeTitle, servings });
  
  if (!groq) {
    const errorMsg = `[getRecipeSteps] GROQ_API_KEY is missing - groq is null.`;
    console.error(errorMsg);
    return [{
      stepNumber: 1,
      instruction: `디버깅 정보: Groq API 키가 없습니다. Vercel 환경 변수를 확인해주세요.`,
      tip: "GROQ_API_KEY를 설정해야 합니다."
    }];
  }
  
  const title = recipeTitle || recipeId;

  try {
       console.log('[getRecipeSteps] Sending request to Groq API...');
       const completion = await groq.chat.completions.create({
         messages: [
           {
             role: "system",
             content: "You are a professional chef. Create detailed cooking steps. Return strictly a JSON array."
           },
           {
             role: "user",
             content: `Recipe: "${title}" for ${servings} servings.
             Return strictly a JSON array of objects.
             Each object should have:
             - step: number
             - instruction: string (in Korean, detailed)
             - tip: string (optional, helpful tip in Korean)`
           }
         ],
         model: "llama-3.3-70b-versatile",
         response_format: { type: "json_object" }
       });

       let text = completion.choices[0]?.message?.content || "[]";
       console.log('[getRecipeSteps] Received response, length:', text.length);
       
       const parsed = JSON.parse(text);
       const steps = Array.isArray(parsed) ? parsed : (parsed.steps || parsed.instructions || Object.values(parsed)[0]);
       
       console.log('[getRecipeSteps] Successfully parsed steps:', Array.isArray(steps) ? steps.length : 'error');

       // Map field names if they differ from what the UI expects (e.g., step vs stepNumber)
       return steps.map((s: any) => ({
         stepNumber: s.step || s.stepNumber,
         instruction: s.instruction,
         tip: s.tip
       }));
  } catch (error: any) {
    console.error("[getRecipeSteps] Failed to get recipe steps:", error);
    return [{
      stepNumber: 1,
      instruction: `디버깅 정보: API 호출 실패 - ${error?.message || '알 수 없는 오류'}`,
      tip: `에러: ${error?.name || 'Unknown'}`
    }];
  }
}
