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
            content: "당신은 냉장고 재료를 활용해 최고의 한국 요리를 제안하는 전문 셰프입니다. 사용자의 재료를 바탕으로 한국 식문화에 어울리는 자연스럽고 맛있는 레시피 3가지를 제안하세요. 모든 답변은 처음부터 한국어로 생각하고 작성하며, 번역된 말투가 아닌 한국인이 사용하는 자연스러운 용어를 사용해야 합니다. 결과는 반드시 JSON 배열 형태로 반환하세요."
          },
          {
            role: "user",
            content: `재료: ${ingredients.join(", ")}. 
            한국어로 3가지 레시피를 제안해줘.
            반드시 다음 형식을 따르는 JSON 객체의 배열을 반환해야 해:
            - id: string (영문 소문자와 하이픈으로 된 짧은 식별자, 예: 'kimchi-stew')
            - title: string (자연스러운 한국어 요리명)
            - description: string (요리에 대한 간단하고 매력적인 한국어 설명)
            - ingredients: string[] (필요한 재료 목록, 한국어로)
            - cookTime: string (예: "15분", "30분 내외")
            - thumbnailUrl: string (빈 문자열 "" 사용)`
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
            content: "당신은 친절한 요리 선생님입니다. 레시피 제목과 인원수에 맞춰 상세하고 따라하기 쉬운 요리 단계를 한국어로 작성하세요. 번역체 없이 한국 요리 관습과 자연스러운 표현을 사용해야 합니다. 결과는 반드시 JSON 배열 형태로 반환하세요."
          },
          {
            role: "user",
            content: `레시피 명: "${title}", 인원수: ${servings}인분.
            요리 순서를 상세히 알려줘.
            반드시 다음 형식을 따르는 JSON 객체의 배열을 반환해야 해:
            - step: number (순서 번호)
            - instruction: string (상세한 요리 방법, 자연스러운 한국어로)
            - tip: string (요리에 도움이 되는 팁, 선택 사항, 한국어로)`
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
