import React from "react";
import IngredientsList from "./components/IngredientsList";
import ClaudeRecipe from "./components/ClaudeRecipe";
import { getRecipeFromChefClaude } from "./ai";

export default function Main() {
  const [ingredients, setIngredients] = React.useState([]);
  const [recipe, setRecipe] = React.useState(null);
  const [error, setError] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const recipeSection = React.useRef(null);

  React.useEffect(() => {
    if (recipe !== null && recipeSection.current !== null) {
      recipeSection.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [recipe]);

  async function getRecipe() {
    setIsLoading(true);
    setError("");
    setRecipe(null);

    try {
      const nextRecipe = await getRecipeFromChefClaude(ingredients);

      if (nextRecipe === null) {
        setError(
          "Nie znalazlem przepisu dla tych skladnikow. Sprobuj dodac bardziej podstawowe nazwy, np. chicken, pasta albo tomato."
        );
        return;
      }

      setRecipe(nextRecipe);
    } catch (requestError) {
      console.error(requestError);
      setError(
        "Nie udalo sie pobrac przepisu. Sprawdz polaczenie i sprobuj ponownie."
      );
    } finally {
      setIsLoading(false);
    }
  }

  function addIngredient(formData) {
    const newIngredient = formData.get("ingredient")?.trim();

    if (!newIngredient) {
      return;
    }

    setIngredients((prevIngredients) => {
      const alreadyAdded = prevIngredients.some(
        (ingredient) =>
          ingredient.toLowerCase() === newIngredient.toLowerCase()
      );

      return alreadyAdded ? prevIngredients : [...prevIngredients, newIngredient];
    });
    setRecipe(null);
    setError("");
  }

  function removeIngredient(ingredientToRemove) {
    setIngredients((prevIngredients) =>
      prevIngredients.filter((ingredient) => ingredient !== ingredientToRemove)
    );
    setRecipe(null);
    setError("");
  }

  return (
    <main>
      <form action={addIngredient} className="add-ingredient-form">
        <input
          type="text"
          placeholder="np. chicken, pasta, tomato"
          aria-label="Dodaj skladnik"
          name="ingredient"
        />
        <button>Dodaj</button>
      </form>

      {ingredients.length > 0 && (
        <IngredientsList
          ingredients={ingredients}
          getRecipe={getRecipe}
          removeIngredient={removeIngredient}
          isLoading={isLoading}
        />
      )}

      {error && (
        <p className="recipe-error" role="alert">
          {error}
        </p>
      )}

      {recipe && (
        <div ref={recipeSection}>
          <ClaudeRecipe recipe={recipe} />
        </div>
      )}
    </main>
  );
}
