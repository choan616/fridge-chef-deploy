"use client";

import { useState } from "react";
import IngredientInput from "./IngredientInput";
import RecipeCard from "./RecipeCard";
import CookingLoader from "./CookingLoader";
import { suggestRecipesAction } from "@/app/actions";
import { Recipe } from "@/types";
import styles from "./ChatRecipeFinder.module.css";

type ChatMessage = {
  role: "ai" | "user";
  content: string;
  ingredientList?: string[];
  recipes?: Recipe[];
};

export default function ChatRecipeFinder() {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "ai", content: "안녕하세요! 🍳 오늘은 냉장고에 어떤 재료들이 있나요?" }
  ]);
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState<'input' | 'searching' | 'results'>('input');

  const handleIngredientsConfirm = async () => {
    if (ingredients.length === 0) return;

    setMessages(prev => [...prev, { 
      role: "user", 
      content: ingredients.join(", ") + " 있어요",
      ingredientList: [...ingredients]
    }]);
    
    setStage('searching');
    setMessages(prev => [...prev, { 
      role: "ai", 
      content: `${ingredients.join(", ")}가 있군요! 뭘 만들면 좋을지 생각해볼게요...` 
    }]);

    setLoading(true);
    try {
      const results = await suggestRecipesAction(ingredients);
      setMessages(prev => [...prev, { 
        role: "ai", 
        content: "이런 요리들은 어때요?",
        recipes: results
      }]);
      setStage('results');
    } catch (error) {
      console.error("Error fetching recipes:", error);
      setMessages(prev => [...prev, { 
        role: "ai", 
        content: "레시피를 찾는 데 문제가 생겼어요. 다시 시도해볼까요?" 
      }]);
      setStage('input');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setIngredients([]);
    setMessages([{ role: "ai", content: "또 다른 재료로 찾아볼까요? 🍳" }]);
    setStage('input');
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>냉장고 셰프</h1>
        <p className={styles.subtitle}>AI 셰프와 대화하듯 레시피를 찾아보세요</p>
      </header>

      <div className={styles.chatContainer}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`${styles.message} ${styles[msg.role]}`}>
            {msg.role === 'ai' && <span className={styles.avatar}>👨‍🍳</span>}
            <div className={styles.bubble}>
              <p>{msg.content}</p>
              {msg.ingredientList && (
                <div className={styles.ingredientTags}>
                  {msg.ingredientList.map((ing, i) => (
                    <span key={i} className={styles.tag}>{ing}</span>
                  ))}
                </div>
              )}
              {msg.recipes && msg.recipes.length > 0 && (
                <div className={styles.recipeGrid}>
                  {msg.recipes.map((recipe) => (
                    <RecipeCard key={recipe.id} recipe={recipe} />
                  ))}
                </div>
              )}
              {msg.recipes && msg.recipes.length === 0 && (
                <p className={styles.noResults}>레시피를 찾을 수 없네요. 다른 재료로 시도해볼까요?</p>
              )}
            </div>
            {msg.role === 'user' && <span className={styles.avatar}>👤</span>}
          </div>
        ))}

        {loading && (
          <div className={`${styles.message} ${styles.ai}`}>
            <span className={styles.avatar}>👨‍🍳</span>
            <div className={styles.bubble}>
              <CookingLoader />
            </div>
          </div>
        )}
      </div>

      {stage === 'input' && !loading && (
        <div className={styles.inputArea}>
          <IngredientInput ingredients={ingredients} onChange={setIngredients} />
          <button 
            className={styles.sendBtn}
            onClick={handleIngredientsConfirm}
            disabled={ingredients.length === 0}
          >
            재료 알려주기
          </button>
        </div>
      )}

      {stage === 'results' && (
        <div className={styles.resetArea}>
          <button className={styles.resetBtn} onClick={handleReset}>
            다른 재료로 찾아보기
          </button>
        </div>
      )}
    </div>
  );
}
