import type {
  AlimentBase,
  Proteine,
  Feculent,
  Legume,
} from "../types/aliments";

export type CaseRepas = {
  categorie: "proteine" | "feculent" | "legume";
  aliment: AlimentBase;
};

export function tirerAleatoire<T>(elements: T[]): T | null {
  if (elements.length === 0) return null;
  return elements[Math.floor(Math.random() * elements.length)];
}

export function melanger<T>(elements: T[]): T[] {
  const resultat = [...elements];
  for (let i = resultat.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [resultat[i], resultat[j]] = [resultat[j], resultat[i]];
  }
  return resultat;
}

const ordreCategories: CaseRepas["categorie"][] = [
  "proteine",
  "feculent",
  "legume",
  "legume",
  "proteine",
  "feculent",
  "feculent",
  "legume",
  "proteine",
];

/**
 * Entrée : catalogues filtrés, ancienne grille et indices verrouillés.
 * Traitement : conserve les verrous et complète chaque catégorie sans doublons.
 * Sortie : nouvelle grille de neuf cases, dans l'ordre habituel.
 */
export function genererGrillePartielle(
  proteines: Proteine[],
  feculents: Feculent[],
  legumes: Legume[],
  grillePrecedente: CaseRepas[] | null = null,
  indicesVerrouilles: number[] = [],
): CaseRepas[] {
  const catalogues: Record<CaseRepas["categorie"], AlimentBase[]> = {
    proteine: proteines,
    feculent: feculents,
    legume: legumes,
  };
  const nouvelleGrille: (CaseRepas | null)[] = Array(9).fill(null);
  const verrous = new Set(indicesVerrouilles);

  for (let index = 0; index < 9; index++) {
    if (verrous.has(index) && grillePrecedente?.[index]) {
      nouvelleGrille[index] = grillePrecedente[index];
    }
  }

  for (const categorie of ["proteine", "feculent", "legume"] as const) {
    const idsConserves = new Set(
      nouvelleGrille
        .filter((c): c is CaseRepas => c !== null && c.categorie === categorie)
        .map((c) => c.aliment.id),
    );
    const positionsLibres = ordreCategories
      .map((nom, index) => ({ nom, index }))
      .filter(
        ({ nom, index }) => nom === categorie && nouvelleGrille[index] === null,
      )
      .map(({ index }) => index);
    const candidats = melanger(
      catalogues[categorie].filter((aliment) => !idsConserves.has(aliment.id)),
    );

    if (candidats.length < positionsLibres.length) {
      throw new Error(`Pas assez d'ingrédients disponibles : ${categorie}`);
    }
    positionsLibres.forEach((index, position) => {
      nouvelleGrille[index] = { categorie, aliment: candidats[position] };
    });
  }

  return nouvelleGrille as CaseRepas[];
}

// Compatibilité avec les autres appels éventuels.
export function genererGrille(
  proteines: Proteine[],
  feculents: Feculent[],
  legumes: Legume[],
): CaseRepas[] {
  return genererGrillePartielle(proteines, feculents, legumes);
}
