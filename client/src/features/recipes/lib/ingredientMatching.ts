import type { Ingredient } from "@/features/ingredients/types/ingredient.types";

function singularizeToken(token: string) {
  if (token.length <= 3) return token;
  if (token.endsWith("ies") && token.length > 4)
    return `${token.slice(0, -3)}y`;
  if (token.endsWith("es") && token.length > 4) return token.slice(0, -2);
  if (token.endsWith("s") && !token.endsWith("ss")) return token.slice(0, -1);
  return token;
}

export function normalizeIngredientName(name: string) {
  return name
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map(singularizeToken)
    .join(" ");
}

export function findIngredientMatch(
  ingredients: Ingredient[],
  candidateName?: string | null,
) {
  const normalizedCandidate = normalizeIngredientName(candidateName ?? "");
  if (!normalizedCandidate) return undefined;

  return ingredients.find(
    (ingredient) =>
      normalizeIngredientName(ingredient.name) === normalizedCandidate,
  );
}
