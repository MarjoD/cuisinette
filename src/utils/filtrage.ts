import type { AlimentBase } from "../types/aliments";
import type { Preferences } from "../types/regimes";
import regimesData from "../data/regimes.json";

export function filtrerAliments<T extends AlimentBase>(
  aliments: T[],
  preferences: Preferences,
): T[] {
  // Récupérer le régime sélectionné
  const regime = regimesData.regimes.find((r) => r.id === preferences.regime);

  // Récupérer les allergènes à exclure
  const allergenesExclus = regimesData.restrictions
    .filter((r) => preferences.restrictions.includes(r.id))
    .flatMap((r) => r.allergenesExclus);

  return aliments.filter((aliment) => {
    // 1. Exclusions personnelles
    if (preferences.alimentsExclus.includes(aliment.id)) {
      return false;
    }

    // 2. Restrictions alimentaires
    if (
      aliment.allergenes.some((allergene) =>
        allergenesExclus.includes(allergene),
      )
    ) {
      return false;
    }

    // 3. Régime alimentaire (protéines)
    if (regime && "type" in aliment && "origine" in aliment) {
      if (regime.typesProteinesExclus.includes(aliment.type as string)) {
        return false;
      }
    }

    return true;
  });
}
