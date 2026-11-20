import type { Legume } from "../types/aliments";
import type { JourPlanifie, RepasSelectionne } from "../types/planning";

export function calculerListeCourses(
  repas: RepasSelectionne[],
  planning: JourPlanifie[],
  legumes: Legume[],
): [string, string][] {
  const parId = new Map(repas.map((r) => [r.combinaison.id, r]));
  const legumesParId = new Map(legumes.map((l) => [l.id, l]));
  const ingredients = new Map<string, string>();
  for (const jour of planning) {
    for (const id of jour) {
      if (!id) continue;
      const repas = parId.get(id);
      if (!repas) continue;
      for (const aliment of [repas.combinaison.proteine, repas.combinaison.feculent, repas.combinaison.legume]) {
        ingredients.set(aliment.id, aliment.nom);
      }
      for (const legumeId of repas.legumesAjoutes) {
        const legume = legumesParId.get(legumeId);
        if (legume) ingredients.set(legume.id, legume.nom);
      }
    }
  }
  return [...ingredients.entries()].sort((a, b) => a[1].localeCompare(b[1], "fr"));
}
