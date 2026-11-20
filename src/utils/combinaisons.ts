import type { AlimentBase } from "../types/aliments";
import type { CaseRepas } from "./random";

export type Combinaison = {
  id: string;
  proteine: AlimentBase;
  feculent: AlimentBase;
  legume: AlimentBase;
};

export function genererCombinaisons(grille: CaseRepas[]): Combinaison[] {
  const proteines = grille
    .filter((caseRepas) => caseRepas.categorie === "proteine")
    .map((caseRepas) => caseRepas.aliment);

  const feculents = grille
    .filter((caseRepas) => caseRepas.categorie === "feculent")
    .map((caseRepas) => caseRepas.aliment);

  const legumes = grille
    .filter((caseRepas) => caseRepas.categorie === "legume")
    .map((caseRepas) => caseRepas.aliment);

  const combinaisons: Combinaison[] = [];

  for (const proteine of proteines) {
    for (const feculent of feculents) {
      for (const legume of legumes) {
        combinaisons.push({
          id: `${proteine.id}-${feculent.id}-${legume.id}`,
          proteine,
          feculent,
          legume,
        });
      }
    }
  }

  return combinaisons;
}
