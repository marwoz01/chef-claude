export default function IngredientsList(props) {
  const ingredientsListItems = props.ingredients.map((ingredient) => (
    <li key={ingredient}>
      <span>{ingredient}</span>
      <button
        type="button"
        onClick={() => props.removeIngredient(ingredient)}
        aria-label={`Usun ${ingredient}`}
      >
        x
      </button>
    </li>
  ));

  return (
    <section>
      <h2>Skladniki pod reka:</h2>
      <ul className="ingredients-list" aria-live="polite">
        {ingredientsListItems}
      </ul>
      <div className="get-recipe-container">
        <div>
          <h3>Gotowe do gotowania?</h3>
          <p>Znajde najlepiej dopasowany przepis z TheMealDB.</p>
        </div>
        <button onClick={props.getRecipe} disabled={props.isLoading}>
          {props.isLoading ? "Szukam..." : "Znajdz przepis"}
        </button>
      </div>
    </section>
  );
}
