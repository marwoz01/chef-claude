const API_BASE_URL = "https://www.themealdb.com/api/json/v1/1";
const MAX_RECIPES_TO_COMPARE = 8;

const INGREDIENT_ALIASES = {
  "biala fasola": "white beans",
  "bulka tarta": "breadcrumbs",
  cebula: "onion",
  cukinia: "zucchini",
  czosnek: "garlic",
  fasola: "beans",
  groszek: "peas",
  jajka: "egg",
  jajko: "egg",
  jogurt: "yogurt",
  krewetki: "prawns",
  kurczak: "chicken",
  losos: "salmon",
  makaron: "pasta",
  marchew: "carrot",
  marchewka: "carrot",
  maslo: "butter",
  mleko: "milk",
  ogorek: "cucumber",
  papryka: "bell pepper",
  pieczarki: "mushrooms",
  "piers z kurczaka": "chicken breast",
  pomidor: "tomato",
  pomidory: "tomato",
  ryba: "fish",
  ryz: "rice",
  ser: "cheese",
  smietana: "cream",
  szpinak: "spinach",
  tunczyk: "tuna",
  wolowina: "beef",
  ziemniak: "potato",
  ziemniaki: "potato",
};

function normalizeText(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeIngredient(value) {
  const normalized = normalizeText(value);
  return INGREDIENT_ALIASES[normalized] ?? normalized;
}

function toApiIngredient(value) {
  return normalizeIngredient(value).replace(/\s+/g, "_");
}

async function fetchFromMealDb(path, searchParams) {
  const url = new URL(`${API_BASE_URL}/${path}`);

  Object.entries(searchParams).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`TheMealDB request failed with status ${response.status}`);
  }

  return response.json();
}

function extractIngredients(meal) {
  return Array.from({ length: 20 }, (_, index) => {
    const fieldNumber = index + 1;
    const ingredient = meal[`strIngredient${fieldNumber}`]?.trim();
    const measure = meal[`strMeasure${fieldNumber}`]?.trim();

    if (!ingredient) {
      return null;
    }

    return {
      ingredient,
      measure: measure || "",
    };
  }).filter(Boolean);
}

function splitInstructions(instructions) {
  return instructions
    .split(/\r?\n/)
    .map((step) => step.replace(/^\d+[).]\s*/, "").trim())
    .filter(Boolean);
}

function isIngredientMatch(recipeIngredient, requestedIngredient) {
  const recipe = normalizeText(recipeIngredient);
  const requested = normalizeIngredient(requestedIngredient);

  return (
    recipe === requested ||
    recipe.includes(requested) ||
    requested.includes(recipe)
  );
}

function buildRecipe(meal, requestedIngredients, candidate) {
  const ingredients = extractIngredients(meal);
  const matchedIngredients = requestedIngredients.filter((requestedIngredient) =>
    ingredients.some(({ ingredient }) =>
      isIngredientMatch(ingredient, requestedIngredient)
    )
  );

  return {
    id: meal.idMeal,
    title: meal.strMeal,
    image: meal.strMealThumb,
    category: meal.strCategory,
    area: meal.strArea,
    tags: meal.strTags?.split(",").filter(Boolean) ?? [],
    source: meal.strSource,
    youtube: meal.strYoutube,
    ingredients,
    instructions: splitInstructions(meal.strInstructions ?? ""),
    matchedIngredients,
    searchedIngredients: Array.from(candidate.searchedIngredients),
    score: matchedIngredients.length * 10 + candidate.score,
  };
}

export async function getRecipeFromChefClaude(ingredientsArr) {
  const requestedIngredients = Array.from(
    new Set(ingredientsArr.map((ingredient) => ingredient.trim()).filter(Boolean))
  );

  if (requestedIngredients.length === 0) {
    return null;
  }

  const searches = requestedIngredients.map((input) => ({
    input,
    apiIngredient: toApiIngredient(input),
  }));

  const searchResults = await Promise.allSettled(
    searches.map(({ apiIngredient }) =>
      fetchFromMealDb("filter.php", { i: apiIngredient })
    )
  );

  const candidates = new Map();

  searchResults.forEach((result, index) => {
    if (result.status !== "fulfilled" || !Array.isArray(result.value.meals)) {
      return;
    }

    result.value.meals.forEach((meal) => {
      const current = candidates.get(meal.idMeal) ?? {
        id: meal.idMeal,
        title: meal.strMeal,
        score: 0,
        searchedIngredients: new Set(),
      };

      current.score += 1;
      current.searchedIngredients.add(searches[index].input);
      candidates.set(meal.idMeal, current);
    });
  });

  if (candidates.size === 0) {
    return null;
  }

  const topCandidates = Array.from(candidates.values())
    .sort((first, second) => {
      if (second.score !== first.score) {
        return second.score - first.score;
      }

      return first.title.localeCompare(second.title);
    })
    .slice(0, MAX_RECIPES_TO_COMPARE);

  const recipes = await Promise.all(
    topCandidates.map(async (candidate) => {
      const details = await fetchFromMealDb("lookup.php", { i: candidate.id });
      const meal = details.meals?.[0];

      return meal ? buildRecipe(meal, requestedIngredients, candidate) : null;
    })
  );

  return recipes
    .filter(Boolean)
    .sort((first, second) => {
      if (second.score !== first.score) {
        return second.score - first.score;
      }

      return first.title.localeCompare(second.title);
    })[0];
}
