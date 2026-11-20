import type { Legume } from "../types/aliments";

export function filtrerLegumesDeSaison(
  legumes: Legume[],
  mois: number,
): Legume[] {
  return legumes.filter((legume) => legume.mois.includes(mois));
}
