"use client";

import { useState } from "react";
import IngredientInput from "./IngredientInput";
import RecipeCard from "./RecipeCard";
import CookingLoader from "./CookingLoader";
import { suggestRecipesAction } from "@/app/actions";
import { Recipe } from "@/types";
import styles from "./RecipeFinder.module.css";

export default function RecipeFinder() {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (ingredients.length === 0) return;
    setLoading(true);
    setHasSearched(true);
    try {
      const results = await suggestRecipesAction(ingredients);
      setRecipes(results);
    } catch (error) {
      console.error("Error fetching recipes:", error);
      alert("Failed to fetch recipes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Fridge Chef</h1>
        <p className={styles.subtitle}>재료를 입력하고 요리를 시작해보세요!</p>
      </header>

      <section className={styles.inputSection}>
        <IngredientInput ingredients={ingredients} onChange={setIngredients} />
        <button 
          className={styles.searchButton}
          onClick={handleSearch}
          disabled={ingredients.length === 0 || loading}
        >
          {loading ? "레시피 찾는 중..." : "레시피 찾기"}
        </button>
      </section>

      {loading ? (
        <CookingLoader />
      ) : hasSearched && (
        <section className={styles.resultsSection}>
          <h2 className={styles.resultsTitle}>추천 레시피</h2>
          {recipes.length === 0 ? (
            <p className={styles.noResults}>레시피를 찾을 수 없습니다. 다른 재료로 시도해보세요!</p>
          ) : (
            <div className={styles.grid}>
              {recipes.map((recipe) => (
                <div key={recipe.id} className={styles.cardWrapper}>
                  <RecipeCard recipe={recipe} />
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
