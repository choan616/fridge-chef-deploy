"use client";

import { useState, useEffect } from "react";
import { Recipe, RecipeStep } from "@/types";
import RecipeCard from "@/components/RecipeCard";
import styles from "./saved.module.css";

interface SavedRecipe {
  id: string;
  title: string;
  steps: RecipeStep[];
  date: string;
}

export default function SavedRecipesPage() {
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('savedRecipes');
    if (saved) {
      setSavedRecipes(JSON.parse(saved));
    }
  }, []);

  const handleDelete = (id: string) => {
    const updated = savedRecipes.filter(r => r.id !== id);
    setSavedRecipes(updated);
    localStorage.setItem('savedRecipes', JSON.stringify(updated));
  };

  if (savedRecipes.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>📖</span>
          <h2>저장된 레시피가 없습니다</h2>
          <p>요리 중 "레시피 저장하기" 버튼을 눌러 나만의 레시피북을 만들어보세요!</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>마이 레시피</h1>
        <p>{savedRecipes.length}개의 레시피</p>
      </header>
      
      <div className={styles.grid}>
        {savedRecipes.map((saved) => {
          const recipe: Recipe = {
            id: saved.id,
            title: saved.title,
            description: `저장일: ${new Date(saved.date).toLocaleDateString('ko-KR')}`,
            ingredients: [],
            cookTime: `${saved.steps.length}단계`,
            thumbnailUrl: ""
          };
          
          return (
            <div key={saved.id} className={styles.recipeWrapper}>
              <RecipeCard recipe={recipe} />
              <button 
                className={styles.deleteBtn}
                onClick={() => handleDelete(saved.id)}
              >
                삭제
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
