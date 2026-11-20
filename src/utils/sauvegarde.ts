import type { Preferences } from "../types/regimes";
import type { CaseRepas } from "./random";
import type { JourPlanifie, RepasSelectionne } from "../types/planning";
import type { Legume, Proteine, Feculent } from "../types/aliments";
import type { Combinaison } from "./combinaisons";
import { genererCombinaisons } from "./combinaisons";
import type { CourseManuelle } from "../hooks/usePlanning";

const CLE = "repas-brouillon-v1";
export type Brouillon = {
  grille: CaseRepas[] | null;
  casesVerrouillees: number[];
  legumesBonus: Legume[];
  repasSelectionnes: RepasSelectionne[];
  planningSemaine: JourPlanifie[];
  coursesCochees: string[];
  coursesManuelles: CourseManuelle[];
};

export const planningInitial = (): JourPlanifie[] =>
  Array.from({ length: 7 }, () => ["", null]);

// Ne jamais faire confiance aveuglément au localStorage : un catalogue peut évoluer.
export function lireBrouillon(
  proteines: Proteine[],
  feculents: Feculent[],
  legumes: Legume[],
): Brouillon | null {
  try {
    const texte = localStorage.getItem(CLE);
    if (!texte) return null;
    const donnees: unknown = JSON.parse(texte);
    if (!donnees || typeof donnees !== "object") return null;
    const d = donnees as Partial<Brouillon>;
    const catalogue = new Map(
      [...proteines, ...feculents, ...legumes].map((a) => [a.id, a]),
    );
    const ordre = [
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
    let grille: CaseRepas[] | null = null;
    if (
      Array.isArray(d.grille) &&
      d.grille.length === 9 &&
      d.grille.every(
        (c, i) =>
          c &&
          c.categorie === ordre[i] &&
          typeof c.aliment?.id === "string" &&
          catalogue.has(c.aliment.id),
      )
    ) {
      const reconstruite: CaseRepas[] = d.grille.map((c) => ({
        categorie: c.categorie,
        aliment: catalogue.get(c.aliment.id)!,
      }));
      if (new Set(reconstruite.map((c) => c.aliment.id)).size === 9)
        grille = reconstruite;
    }
    const bonus = Array.isArray(d.legumesBonus)
      ? d.legumesBonus
          .map((b) => legumes.find((l) => l.id === b?.id))
          .filter((b): b is Legume => Boolean(b))
      : [];
    const idsGrille = new Set(grille?.map((c) => c.aliment.id) ?? []);
    const legumesBonus = [
      ...new Map(
        bonus.filter((b) => !idsGrille.has(b.id)).map((b) => [b.id, b]),
      ).values(),
    ].slice(0, 3);
    const combinaisons = grille ? genererCombinaisons(grille) : [];
    const parId = new Map<string, Combinaison>(
      combinaisons.map((c) => [c.id, c]),
    );
    const repasSelectionnes: RepasSelectionne[] = [];
    if (Array.isArray(d.repasSelectionnes)) {
      for (const r of d.repasSelectionnes) {
        const combinaison = parId.get(r?.combinaison?.id);
        if (
          !combinaison ||
          repasSelectionnes.some((e) => e.combinaison.id === combinaison.id)
        )
          continue;
        const legumesAjoutes = Array.isArray(r.legumesAjoutes)
          ? r.legumesAjoutes.filter(
              (id: unknown): id is string =>
                typeof id === "string" &&
                legumes.some((l) => l.id === id) &&
                id !== combinaison.legume.id,
            )
          : [];
        repasSelectionnes.push({
          combinaison,
          legumesAjoutes: [...new Set(legumesAjoutes)],
        });
      }
    }
    const idsRepas = new Set(repasSelectionnes.map((r) => r.combinaison.id));
    const planningSemaine =
      Array.isArray(d.planningSemaine) && d.planningSemaine.length === 7
        ? d.planningSemaine.map((jour): JourPlanifie => {
            if (!Array.isArray(jour) || jour.length !== 2) return ["", null];
            return [
              typeof jour[0] === "string" && idsRepas.has(jour[0])
                ? jour[0]
                : "",
              jour[1] === null
                ? null
                : typeof jour[1] === "string" && idsRepas.has(jour[1])
                  ? jour[1]
                  : "",
            ];
          })
        : planningInitial();
    return {
      grille,
      casesVerrouillees:
        grille && Array.isArray(d.casesVerrouillees)
          ? [
              ...new Set(
                d.casesVerrouillees.filter(
                  (n): n is number => Number.isInteger(n) && n >= 0 && n < 9,
                ),
              ),
            ]
          : [],
      legumesBonus,
      repasSelectionnes,
      planningSemaine,
      coursesCochees: Array.isArray(d.coursesCochees)
        ? d.coursesCochees.filter((id): id is string => typeof id === "string")
        : [],

      coursesManuelles: Array.isArray(d.coursesManuelles)
        ? d.coursesManuelles.filter(
            (course): course is CourseManuelle =>
              course !== null &&
              typeof course === "object" &&
              typeof course.id === "string" &&
              typeof course.nom === "string" &&
              course.nom.trim().length > 0,
          )
        : [],
    };
  } catch {
    return null;
  }
}

export function sauvegarderBrouillon(brouillon: Brouillon): void {
  try {
    localStorage.setItem(CLE, JSON.stringify(brouillon));
  } catch {
    /* stockage désactivé ou saturé : l'application reste utilisable */
  }
}

export function lirePreferences(regimes: { id: string }[]): Preferences {
  const defaut: Preferences = {
    regime: regimes[0].id,
    restrictions: [],
    alimentsExclus: [],
  };
  try {
    const valeur = localStorage.getItem("preferences");
    if (!valeur) return defaut;
    const p = JSON.parse(valeur) as Preferences;
    if (
      p &&
      Array.isArray(p.restrictions) &&
      p.restrictions.every((id: unknown) => typeof id === "string") &&
      Array.isArray(p.alimentsExclus) &&
      p.alimentsExclus.every((id: unknown) => typeof id === "string") &&
      regimes.some((r) => r.id === p.regime)
    )
      return p;
  } catch {
    /* valeurs par défaut */
  }
  return defaut;
}
