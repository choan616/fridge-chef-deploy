"use client";

import { useState, KeyboardEvent } from "react";
import VoiceInput from "./VoiceInput";
import styles from "./IngredientInput.module.css";

interface Props {
  ingredients: string[];
  onChange: (ingredients: string[]) => void;
}

export default function IngredientInput({ ingredients, onChange }: Props) {
  const [inputValue, setInputValue] = useState("");

  const addIngredient = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !ingredients.includes(trimmed)) {
      onChange([...ingredients, trimmed]);
      setInputValue("");
    }
  };

  const removeIngredient = (ing: string) => {
    onChange(ingredients.filter((i) => i !== ing));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addIngredient();
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.inputGroup}>
        <input
          type="text"
          className={styles.input}
          placeholder="재료를 입력하세요 (예: 계란)"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <VoiceInput onResult={(text) => {
          const newIngs = text.split(/[\s,]+/).filter(ing => ing.trim() && !ingredients.includes(ing.trim()));
          if (newIngs.length > 0) {
            onChange([...ingredients, ...newIngs.map(i => i.trim())]);
          } else {
            setInputValue(text);
          }
        }} />
        <button className={styles.addButton} onClick={addIngredient}>
          추가
        </button>
      </div>
      <div className={styles.tagList}>
        {ingredients.map((ing) => (
          <span key={ing} className={styles.tag}>
            {ing}
            <button
              className={styles.removeButton}
              onClick={() => removeIngredient(ing)}
              aria-label={`Remove ${ing}`}
            >
              &times;
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
