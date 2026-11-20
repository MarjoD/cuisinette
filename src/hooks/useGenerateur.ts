import { useState } from "react";
import type {
  AlimentBase,
  Proteine,
  Feculent,
  Legume,
} from "../types/aliments";
import type { Preferences } from "../types/regimes";
import type { CaseRepas } from "../utils/random";
import type { Brouillon } from "../utils/sauvegarde";
import { filtrerAliments } from "../utils/filtrage";
import { filtrerLegumesDeSaison } from "../utils/saisonnalite";
import { genererGrillePartielle, tirerAleatoire } from "../utils/random";

export const MAX_LEGUMES_BONUS = 3;

type Catalogues = {
  proteines: Proteine[];
  feculents: Feculent[];
  legumes: Legume[];
};

export function useGenerateur(
  catalogues: Catalogues,
  preferences: Preferences,
  modifierPreferences: (p: Preferences) => void,
  brouillon: Brouillon | null,
) {
  const { proteines, feculents, legumes } = catalogues;
  const [recherche, setRecherche] = useState("");
  const [grille, setGrille] = useState<CaseRepas[] | null>(
    brouillon?.grille ?? null,
  );
  const [legumesBonus, setLegumesBonus] = useState<Legume[]>(
    brouillon?.legumesBonus ?? [],
  );
  const [casesVerrouillees, setCasesVerrouillees] = useState<number[]>(
    brouillon?.casesVerrouillees ?? [],
  );

  const categories = [
    { titre: "Protéines", aliments: proteines },
    { titre: "Féculents", aliments: feculents },
    { titre: "Légumes", aliments: legumes },
  ];
  const proteinesFiltrees = filtrerAliments(proteines, preferences);
  const feculentsFiltres = filtrerAliments(feculents, preferences);
  const legumesFiltres = filtrerLegumesDeSaison(
    filtrerAliments(legumes, preferences),
    new Date().getMonth() + 1,
  );
  const legumesGrille = grille
    ? grille
        .filter((c) => c.categorie === "legume")
        .map((c) => c.aliment as Legume)
    : [];
  const legumesSelection = [...legumesGrille, ...legumesBonus];
  const idsSelection = new Set(legumesSelection.map((l) => l.id));
  const legumesBonusDisponibles = legumesFiltres.filter(
    (l) => !idsSelection.has(l.id),
  );
  const idsBonus = new Set(legumesBonus.map((l) => l.id));
  const legumesPourGrille = legumesFiltres.filter((l) => !idsBonus.has(l.id));

  function filtrerRecherche(aliments: AlimentBase[]): AlimentBase[] {
    const terme = recherche.trim().toLocaleLowerCase("fr");
    return aliments.filter((aliment) =>
      !terme
        ? preferences.alimentsExclus.includes(aliment.id)
        : aliment.nom.toLocaleLowerCase("fr").includes(terme),
    );
  }
  const aucunResultat = categories.every(
    (c) => filtrerRecherche(c.aliments).length === 0,
  );

  const generationPossibleAvecVerrous = (
    [
      { nom: "proteine", aliments: proteinesFiltrees },
      { nom: "feculent", aliments: feculentsFiltres },
      { nom: "legume", aliments: legumesPourGrille },
    ] as { nom: CaseRepas["categorie"]; aliments: AlimentBase[] }[]
  ).every(({ nom, aliments }) => {
    const verrouilles = (grille ?? []).filter(
      (c, index) => casesVerrouillees.includes(index) && c.categorie === nom,
    );
    const idsVerrouilles = new Set(verrouilles.map((c) => c.aliment.id));
    return (
      aliments.filter((a) => !idsVerrouilles.has(a.id)).length >=
      3 - verrouilles.length
    );
  });
  const toutesCasesVerrouillees =
    grille !== null && casesVerrouillees.length === 9;

  function lancerGeneration(
    confirmerRemiseAZero: () => boolean,
    viderEtapesSuivantes: () => void,
  ) {
    if (!generationPossibleAvecVerrous || toutesCasesVerrouillees) return;
    if (!confirmerRemiseAZero()) return;
    const nouvelleGrille = genererGrillePartielle(
      proteinesFiltrees,
      feculentsFiltres,
      legumesPourGrille,
      grille,
      casesVerrouillees,
    );
    setGrille(nouvelleGrille);
    viderEtapesSuivantes();
  }
  function basculerVerrou(index: number) {
    setCasesVerrouillees((avant) =>
      avant.includes(index)
        ? avant.filter((i) => i !== index)
        : [...avant, index],
    );
  }

  function modifierIngredient(index: number, alimentId: string): boolean {
    if (!grille || index < 0 || index >= grille.length) return false;

    const caseActuelle = grille[index];

    const disponibles =
      caseActuelle.categorie === "proteine"
        ? proteinesFiltrees
        : caseActuelle.categorie === "feculent"
          ? feculentsFiltres
          : legumesPourGrille;

    const nouvelAliment = disponibles.find(
      (aliment) => aliment.id === alimentId,
    );

    if (!nouvelAliment) return false;

    // Empêche deux fois le même ingrédient dans la grille.
    const dejaPresent = grille.some(
      (c, i) =>
        i !== index &&
        c.categorie === caseActuelle.categorie &&
        c.aliment.id === alimentId,
    );

    if (dejaPresent) return false;

    setGrille((avant) => {
      if (!avant) return avant;

      return avant.map((c, i) =>
        i === index ? { ...c, aliment: nouvelAliment } : c,
      );
    });

    return true;
  }

  function ajouterLegumeBonus() {
    if (legumesBonus.length >= MAX_LEGUMES_BONUS) return;
    const legume = tirerAleatoire(legumesBonusDisponibles);
    if (legume) setLegumesBonus((avant) => [...avant, legume]);
  }
  function ajouterLegumeBonusManuel(id: string) {
    if (legumesBonus.length >= MAX_LEGUMES_BONUS) return;

    const legume = legumesBonusDisponibles.find((l) => l.id === id);
    if (!legume) return;

    setLegumesBonus((avant) => {
      if (avant.length >= MAX_LEGUMES_BONUS || avant.some((l) => l.id === id)) {
        return avant;
      }

      return [...avant, legume];
    });
  }
  function supprimerLegumeBonus(id: string) {
    setLegumesBonus((avant) => avant.filter((l) => l.id !== id));
  }
  function changerRestriction(id: string) {
    modifierPreferences({
      ...preferences,
      restrictions: preferences.restrictions.includes(id)
        ? preferences.restrictions.filter((r) => r !== id)
        : [...preferences.restrictions, id],
    });
  }
  function changerExclusion(id: string) {
    modifierPreferences({
      ...preferences,
      alimentsExclus: preferences.alimentsExclus.includes(id)
        ? preferences.alimentsExclus.filter((a) => a !== id)
        : [...preferences.alimentsExclus, id],
    });
  }
  function reinitialiserGenerateur() {
    setGrille(null);
    setLegumesBonus([]);
    setCasesVerrouillees([]);
    setRecherche("");
  }
  return {
    recherche,
    setRecherche,
    grille,
    legumesBonus,
    casesVerrouillees,
    categories,
    legumesSelection,
    legumesBonusDisponibles,
    aucunResultat,
    generationPossibleAvecVerrous,
    toutesCasesVerrouillees,
    filtrerRecherche,
    changerRestriction,
    changerExclusion,
    basculerVerrou,
    ajouterLegumeBonus,
    supprimerLegumeBonus,
    lancerGeneration,
    reinitialiserGenerateur,
    ajouterLegumeBonusManuel,
    modifierIngredient,
    proteinesFiltrees,
    feculentsFiltres,
    legumesPourGrille,
  };
}
