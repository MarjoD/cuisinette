import type { Combinaison } from "../utils/combinaisons";

export type RepasSelectionne = {
  combinaison: Combinaison;
  legumesAjoutes: string[];
};

// null signifie que le deuxième créneau est désactivé.
export type JourPlanifie = [string, string | null];
