import { melanger } from "../utils/random";
import { useState } from "react";
import type { Combinaison } from "../utils/combinaisons";
import type { JourPlanifie, RepasSelectionne } from "../types/planning";
import type { Brouillon } from "../utils/sauvegarde";
import { planningInitial } from "../utils/sauvegarde";
export type CourseManuelle = {
  id: string;
  nom: string;
};

export function usePlanning(
  combinaisons: Combinaison[],
  legumesSelection: { id: string }[],
  brouillon: Brouillon | null,
) {
  const [repasSelectionnes, setRepasSelectionnes] = useState<
    RepasSelectionne[]
  >(brouillon?.repasSelectionnes ?? []);
  const [planningSemaine, setPlanningSemaine] = useState<JourPlanifie[]>(
    brouillon?.planningSemaine ?? planningInitial(),
  );
  const [coursesCochees, setCoursesCochees] = useState<string[]>(
    brouillon?.coursesCochees ?? [],
  );

  const [coursesManuelles, setCoursesManuelles] = useState<CourseManuelle[]>(
    brouillon?.coursesManuelles ?? [],
  );

  function viderPlanning() {
    setPlanningSemaine(planningInitial());
    setCoursesCochees([]);
  }
  function viderRepasEtPlanning() {
    setRepasSelectionnes([]);
    viderPlanning();
  }
  function viderCoursesManuelles() {
    setCoursesManuelles([]);
  }

  function synchroniserAvecCombinaisons(combinaisonsValides: Combinaison[]) {
    const idsValides = new Set(
      combinaisonsValides.map((combinaison) => combinaison.id),
    );

    setRepasSelectionnes((avant) =>
      avant
        .filter((repas) => idsValides.has(repas.combinaison.id))
        .map((repas) => {
          const combinaisonActualisee = combinaisonsValides.find(
            (combinaison) => combinaison.id === repas.combinaison.id,
          );

          return combinaisonActualisee
            ? { ...repas, combinaison: combinaisonActualisee }
            : repas;
        }),
    );

    setPlanningSemaine((avant) =>
      avant.map(
        (jour): JourPlanifie => [
          jour[0] && !idsValides.has(jour[0]) ? "" : jour[0],
          jour[1] && !idsValides.has(jour[1]) ? "" : jour[1],
        ],
      ),
    );
  }

  function ajouterCourseManuelle(nom: string) {
    const nomNettoye = nom.trim().replace(/\s+/g, " ");

    if (!nomNettoye) return;

    const id = crypto.randomUUID();

    setCoursesManuelles((avant) => [...avant, { id, nom: nomNettoye }]);
  }

  function supprimerCourseManuelle(id: string) {
    setCoursesManuelles((avant) => avant.filter((course) => course.id !== id));

    setCoursesCochees((avant) =>
      avant.filter((courseId) => courseId !== `manuel:${id}`),
    );
  }

  // Boutons de sélection : remplacement intégral, y compris les personnalisations.
  function remplacerSelection(combinaisonsChoisies: Combinaison[]) {
    setRepasSelectionnes(
      combinaisonsChoisies.map((combinaison) => ({
        combinaison,
        legumesAjoutes: [],
      })),
    );
    viderPlanning();
  }
  function selectionnerAleatoirement(nombre: number) {
    const melangees = melanger(combinaisons);
    remplacerSelection(melangees.slice(0, nombre));
  }
  function toutSelectionner() {
    remplacerSelection(combinaisons);
  }
  function toutDeselectionner() {
    viderRepasEtPlanning();
  }

  function changerSelection(combinaison: Combinaison) {
    const dejaSelectionne = repasSelectionnes.some(
      (r) => r.combinaison.id === combinaison.id,
    );
    if (dejaSelectionne) {
      setPlanningSemaine((avant) =>
        avant.map(
          (jour): JourPlanifie => [
            jour[0] === combinaison.id ? "" : jour[0],
            jour[1] === combinaison.id ? "" : jour[1],
          ],
        ),
      );
      setRepasSelectionnes((avant) =>
        avant.filter((r) => r.combinaison.id !== combinaison.id),
      );
    } else {
      setRepasSelectionnes((avant) => [
        ...avant,
        { combinaison, legumesAjoutes: [] },
      ]);
    }
  }
  function ajouterLegumeAuRepas(combinaisonId: string, legumeId: string) {
    setRepasSelectionnes((avant) =>
      avant.map((r) => {
        if (
          r.combinaison.id !== combinaisonId ||
          r.combinaison.legume.id === legumeId ||
          r.legumesAjoutes.includes(legumeId) ||
          !legumesSelection.some((l) => l.id === legumeId)
        )
          return r;
        return { ...r, legumesAjoutes: [...r.legumesAjoutes, legumeId] };
      }),
    );
  }
  function retirerLegumeDuRepas(combinaisonId: string, legumeId: string) {
    setRepasSelectionnes((avant) =>
      avant.map((r) =>
        r.combinaison.id === combinaisonId
          ? {
              ...r,
              legumesAjoutes: r.legumesAjoutes.filter((id) => id !== legumeId),
            }
          : r,
      ),
    );
  }
  function modifierRepasJour(jourIndex: number, position: 0 | 1, id: string) {
    setPlanningSemaine((avant) =>
      avant.map((jour, i): JourPlanifie => {
        if (i !== jourIndex) return jour;
        const copie: JourPlanifie = [...jour];
        copie[position] = id;
        return copie;
      }),
    );
  }
  function basculerDeuxiemeRepas(jourIndex: number) {
    setPlanningSemaine((avant) =>
      avant.map(
        (jour, i): JourPlanifie =>
          i === jourIndex ? [jour[0], jour[1] === null ? "" : null] : jour,
      ),
    );
  }

  function remplirSemaineAleatoirement() {
    const ids = repasSelectionnes.map((repas) => repas.combinaison.id);

    if (ids.length === 0) return;

    let pioche = melanger(ids);
    let precedent: string | null = null;

    function tirerRepas(): string {
      if (pioche.length === 0) {
        pioche = melanger(ids);

        // Évite deux repas identiques à la suite
        // lorsqu'un nouveau cycle commence.
        if (ids.length > 1 && pioche[pioche.length - 1] === precedent) {
          const autreIndex = pioche.findIndex((id) => id !== precedent);
          [pioche[autreIndex], pioche[pioche.length - 1]] = [
            pioche[pioche.length - 1],
            pioche[autreIndex],
          ];
        }
      }

      const id = pioche.pop()!;
      precedent = id;
      return id;
    }

    setPlanningSemaine((avant) =>
      avant.map(
        (jour): JourPlanifie => [
          tirerRepas(),
          jour[1] === null ? null : tirerRepas(),
        ],
      ),
    );
  }

  return {
    repasSelectionnes,
    planningSemaine,
    coursesCochees,
    setCoursesCochees,
    viderRepasEtPlanning,
    selectionnerAleatoirement,
    toutSelectionner,
    toutDeselectionner,
    changerSelection,
    ajouterLegumeAuRepas,
    retirerLegumeDuRepas,
    modifierRepasJour,
    basculerDeuxiemeRepas,
    remplirSemaineAleatoirement,
    synchroniserAvecCombinaisons,
    coursesManuelles,
    ajouterCourseManuelle,
    supprimerCourseManuelle,
    viderCoursesManuelles,
  };
}
