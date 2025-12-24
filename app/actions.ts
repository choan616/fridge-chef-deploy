"use server";

import { suggestRecipes as mcpSuggest, getRecipeSteps as mcpGetSteps } from "@/lib/mcpClient";

export async function suggestRecipesAction(ingredients: string[]) {
  if (ingredients.length === 0) return [];
  return await mcpSuggest(ingredients);
}

export async function getRecipeStepsAction(recipeId: string, recipeTitle?: string) {
  return await mcpGetSteps(recipeId, recipeTitle);
}
