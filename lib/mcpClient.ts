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
            content: "당신은 한국 요리에 정통한 전문 셰프입니다. 사용자의 재료를 바탕으로 한국인이 선호하고 매일 먹어도 질리지 않는 자연스러운 한국 레시피 3가지를 제안하세요. \n\n[규칙]\n1. 절대로 한자, 러시아어, 중국어, 영어 등 외국어를 사용하지 마세요. 100% 한글만 사용합니다.\n2. 영어를 직역한 듯한 말투(예: '당신은 ~할 수 있습니다')를 쓰지 마세요. 한국인이 요리할 때 쓰는 자연스러운 표현(~해주세요, ~합니다)을 사용하세요.\n3. 식재료 이름은 반드시 한국 표준 명칭(예: 숙주나물, 시금치 등)을 사용하세요. '숙주베개' 같은 직역 표현은 절대 금지합니다.\n4. 번역기가 아닌, 한국인 셰프가 처음부터 한국어로 사고하여 제안하는 느낌을 주어야 합니다.\n5. 결과는 반드시 JSON 배열 형태로 반환하세요."
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
        temperature: 0,
        response_format: { type: "json_object" }
      });

      let text = completion.choices[0]?.message?.content || "{}";
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
            content: "당신은 다정하고 명쾌한 한국 요리 선생님입니다. 레시피 제목과 인원수에 맞춰 상세하고 따라하기 쉬운 요리 단계를 한국어로 작성하세요. \n\n[필수 지침]\n1. 한자(等, 等等), 러시아어, 중국어 등 모든 외국어 사용을 엄격히 금지합니다. 오직 한글과 필수적인 숫자(g, ml 등 단위 제외)만 사용하세요.\n2. 영어를 직역한 듯한 말투(예: '당신은 ~할 수 있습니다')를 피하세요. '~해줍니다', '~를 넣고 볶으세요'와 같은 자연스러운 한국어 종결어미를 사용하세요.\n3. 식재료 직역 금지: 'mung bean sprout pillow'를 '숙주베개'로 번역하는 등의 오류를 범하지 마세요. 반드시 '숙주나물'과 같은 정확한 한국어 명칭을 사용하세요.\n4. 결과는 반드시 JSON 배열 형태로 반환해야 합니다."
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
         temperature: 0,
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
