export default function ClaudeRecipe(props) {
  const { recipe } = props;
  const meta = [recipe.area, recipe.category].filter(Boolean).join(" / ");
  const matchedIngredients = recipe.matchedIngredients.join(", ");

  return (
    <section className="suggested-recipe-container" aria-live="polite">
      <div className="recipe-summary">
        {recipe.image && (
          <img src={recipe.image} alt={recipe.title} className="recipe-image" />
        )}
        <div>
          {meta && <p className="recipe-meta">{meta}</p>}
          <h2>{recipe.title}</h2>
          {matchedIngredients && (
            <p className="recipe-match">
              Pasuje do: <span>{matchedIngredients}</span>
            </p>
          )}
        </div>
      </div>

      <h3>Skladniki</h3>
      <ul className="recipe-ingredients">
        {recipe.ingredients.map(({ ingredient, measure }) => (
          <li key={`${measure}-${ingredient}`}>
            <span>{ingredient}</span>
            {measure && <small>{measure}</small>}
          </li>
        ))}
      </ul>

      {recipe.instructions.length > 0 && (
        <>
          <h3>Przygotowanie</h3>
          <ol className="recipe-instructions">
            {recipe.instructions.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </>
      )}

      {(recipe.source || recipe.youtube) && (
        <div className="recipe-links">
          {recipe.source && (
            <a href={recipe.source} target="_blank" rel="noreferrer">
              Zrodlo przepisu
            </a>
          )}
          {recipe.youtube && (
            <a href={recipe.youtube} target="_blank" rel="noreferrer">
              Wideo
            </a>
          )}
        </div>
      )}
    </section>
  );
}
