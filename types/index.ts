export interface Ingredient {
  name: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[]; // List of ingredient names
  thumbnailUrl?: string;
  cookTime?: string;
}

export interface RecipeStep {
  stepNumber: number;
  instruction: string;
  imageUrl?: string;
  tip?: string; // Optional tip or advice
}

export interface CookingSession {
  recipeId: string;
  currentStepIndex: number;
  totalSteps: number;
}
