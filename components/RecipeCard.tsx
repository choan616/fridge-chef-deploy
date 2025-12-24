import Link from "next/link";
import { Recipe } from "@/types";
import styles from "./RecipeCard.module.css";

interface Props {
  recipe: Recipe;
}

export default function RecipeCard({ recipe }: Props) {
  return (
    <Link href={`/cook/${recipe.id}?title=${encodeURIComponent(recipe.title)}`} className={styles.card}>
      {recipe.thumbnailUrl && (
        <div
          className={styles.image}
          style={{ backgroundImage: `url(${recipe.thumbnailUrl})` }}
        />
      )}
      <div className={styles.content}>
        <h3 className={styles.title}>{recipe.title}</h3>
        <p className={styles.description}>{recipe.description}</p>
        <div className={styles.meta}>
          {recipe.cookTime && <span className={styles.badge}>{recipe.cookTime}</span>}
          <span className={styles.badge}>{recipe.ingredients.length} 재료</span>
        </div>
      </div>
    </Link>
  );
}
