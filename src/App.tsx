import "./App.css";
import "./planning.css";
import "./onglets.css";

import { useEffect, useState } from "react";
import proteinesData from "./data/proteines.json";
import feculentsData from "./data/feculents.json";
import legumesData from "./data/legumes.json";
import regimesData from "./data/regimes.json";
import type { Proteine, Feculent, Legume } from "./types/aliments";
import type { Preferences } from "./types/regimes";
import Filtres from "./components/Filtres";
import Blacklist from "./components/Blacklist";
import Generation from "./components/Generation";
import SelectionRepas from "./components/SelectionRepas";
import PersonnalisationRepas from "./components/PersonnalisationRepas";
import PlanningSemaine from "./components/PlanningSemaine";
import { useGenerateur, MAX_LEGUMES_BONUS } from "./hooks/useGenerateur";
import { usePlanning } from "./hooks/usePlanning";
import { genererCombinaisons } from "./utils/combinaisons";
import { calculerListeCourses } from "./utils/listeCourses";
import {
  lireBrouillon,
  lirePreferences,
  sauvegarderBrouillon,
} from "./utils/sauvegarde";
import ConfirmDialog from "./components/ConfirmDialog";

const proteines = proteinesData as Proteine[];
const feculents = feculentsData as Feculent[];
const legumes = legumesData as Legume[];
const catalogues = { proteines, feculents, legumes };
const JOURS = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
];
type Onglet = "ingredients" | "repas" | "planning";

export default function App() {
  // Chargement une seule fois, avant la création des états.
  const [brouillon] = useState(() =>
    lireBrouillon(proteines, feculents, legumes),
  );
  const [preferences, setPreferences] = useState<Preferences>(() =>
    lirePreferences(regimesData.regimes),
  );
  const [onglet, setOnglet] = useState<Onglet>("ingredients");

  type Confirmation = {
    titre: string;
    message: string;
    action: () => void;
  };

  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);

  function demanderConfirmation(
    titre: string,
    message: string,
    action: () => void,
  ) {
    setConfirmation({ titre, message, action });
  }

  function confirmerAction() {
    const action = confirmation?.action;
    setConfirmation(null);
    action?.();
  }

  const generateur = useGenerateur(
    catalogues,
    preferences,
    setPreferences,
    brouillon,
  );
  const combinaisons = generateur.grille
    ? genererCombinaisons(generateur.grille)
    : [];
  const planning = usePlanning(
    combinaisons,
    generateur.legumesSelection,
    brouillon,
  );
  const listeCourses = calculerListeCourses(
    planning.repasSelectionnes,
    planning.planningSemaine,
    legumes,
  );

  const accesRepas = generateur.grille !== null;
  const accesPlanning = accesRepas && planning.repasSelectionnes.length > 0;

  // Sauvegarde du brouillon après chaque modification, y compris après « Nouveau planning ».
  useEffect(() => {
    sauvegarderBrouillon({
      grille: generateur.grille,
      casesVerrouillees: generateur.casesVerrouillees,
      legumesBonus: generateur.legumesBonus,
      repasSelectionnes: planning.repasSelectionnes,
      planningSemaine: planning.planningSemaine,
      coursesCochees: planning.coursesCochees,
      coursesManuelles: planning.coursesManuelles,
    });
  }, [
    generateur.grille,
    generateur.casesVerrouillees,
    generateur.legumesBonus,
    planning.repasSelectionnes,
    planning.planningSemaine,
    planning.coursesCochees,
    planning.coursesManuelles,
  ]);

  useEffect(() => {
    try {
      localStorage.setItem("preferences", JSON.stringify(preferences));
    } catch {
      /* stockage indisponible */
    }
  }, [preferences]);

  // L'onglet affiché dépend des étapes accessibles, sans modifier l'état dans un effet.
  const ongletAffiche: Onglet =
    onglet === "planning" && !accesPlanning
      ? accesRepas
        ? "repas"
        : "ingredients"
      : onglet === "repas" && !accesRepas
        ? "ingredients"
        : onglet;

  function regenerer() {
    const occupe =
      planning.repasSelectionnes.length > 0 ||
      planning.planningSemaine.some((jour) => jour.some(Boolean));

    const action = () =>
      generateur.lancerGeneration(() => true, planning.viderRepasEtPlanning);

    if (!occupe) {
      action();
      return;
    }

    demanderConfirmation(
      "On change la recette ?",
      "Régénérer la grille effacera les repas sélectionnés et le planning.",
      action,
    );
  }

  function nouveauPlanning() {
    demanderConfirmation(
      "On recommence ?",
      "La grille, les légumes bonus, les repas et les courses seront effacés. Tes préférences seront conservées.",
      () => {
        generateur.reinitialiserGenerateur();
        planning.viderRepasEtPlanning();
        planning.viderCoursesManuelles();
        changerOnglet("ingredients");
      },
    );
  }

  function remplirPlanningAvecConfirmation() {
    const dejaRempli = planning.planningSemaine.some((jour) =>
      jour.some((id) => id !== null && id !== ""),
    );

    if (!dejaRempli) {
      planning.remplirSemaineAleatoirement();
      return;
    }

    demanderConfirmation(
      "On mélange tout ?",
      "Les repas déjà placés dans la semaine seront remplacés par un nouveau tirage.",
      planning.remplirSemaineAleatoirement,
    );
  }

  function changerOnglet(destination: Onglet) {
    setOnglet(destination);

    window.scrollTo({
      top: 0,
      behavior: "instant",
    });
  }

  function modifierIngredientAvecSynchronisation(
    index: number,
    alimentId: string,
  ): boolean {
    if (!generateur.grille) return false;

    const modifie = generateur.modifierIngredient(index, alimentId);

    if (!modifie) return false;

    const nouvelleGrille = generateur.grille.map((caseRepas, i) => {
      if (i !== index) return caseRepas;

      const aliments =
        caseRepas.categorie === "proteine"
          ? proteines
          : caseRepas.categorie === "feculent"
            ? feculents
            : legumes;

      const nouvelAliment = aliments.find(
        (aliment) => aliment.id === alimentId,
      );

      return nouvelAliment
        ? { ...caseRepas, aliment: nouvelAliment }
        : caseRepas;
    });

    const nouvellesCombinaisons = genererCombinaisons(nouvelleGrille);

    planning.synchroniserAvecCombinaisons(nouvellesCombinaisons);

    return true;
  }

  return (
    <main>
      <header className="header-cuisinette">
        <picture>
          <source
            media="(max-width: 720px)"
            srcSet="/images/header-cuisinette-old.png"
          />
          <img
            src="/images/header-cuisinette.png"
            alt="Cuisinette — Tes repas de la semaine, en toute détente !"
          />
        </picture>
      </header>

      <nav className="onglets" aria-label="Étapes du planning">
        <button
          type="button"
          className={ongletAffiche === "ingredients" ? "actif" : ""}
          aria-current={ongletAffiche === "ingredients" ? "step" : undefined}
          onClick={() => changerOnglet("ingredients")}
        >
          1. Ingrédients
        </button>
        <button
          type="button"
          className={ongletAffiche === "repas" ? "actif" : ""}
          aria-current={ongletAffiche === "repas" ? "step" : undefined}
          disabled={!accesRepas}
          onClick={() => changerOnglet("repas")}
        >
          2. Repas
        </button>
        <button
          type="button"
          className={ongletAffiche === "planning" ? "actif" : ""}
          aria-current={ongletAffiche === "planning" ? "step" : undefined}
          disabled={!accesPlanning}
          onClick={() => changerOnglet("planning")}
        >
          3. Planning & courses
        </button>
      </nav>

      {ongletAffiche === "ingredients" && (
        <section aria-label="Filtres et génération">
          <Filtres
            preferences={preferences}
            regimesData={regimesData}
            modifierPreferences={setPreferences}
            changerRestriction={generateur.changerRestriction}
          />
          <Blacklist
            preferences={preferences}
            recherche={generateur.recherche}
            setRecherche={generateur.setRecherche}
            categories={generateur.categories}
            filtrerRecherche={generateur.filtrerRecherche}
            aucunResultat={generateur.aucunResultat}
            changerExclusion={generateur.changerExclusion}
          />
          <Generation
            grille={generateur.grille}
            casesVerrouillees={generateur.casesVerrouillees}
            generationPossibleAvecVerrous={
              generateur.generationPossibleAvecVerrous
            }
            toutesCasesVerrouillees={generateur.toutesCasesVerrouillees}
            lancerGeneration={regenerer}
            basculerVerrou={generateur.basculerVerrou}
            legumesBonus={generateur.legumesBonus}
            legumesBonusDisponibles={generateur.legumesBonusDisponibles}
            ajouterLegumeBonus={generateur.ajouterLegumeBonus}
            ajouterLegumeBonusManuel={generateur.ajouterLegumeBonusManuel}
            supprimerLegumeBonus={generateur.supprimerLegumeBonus}
            MAX_LEGUMES_BONUS={MAX_LEGUMES_BONUS}
            modifierIngredient={modifierIngredientAvecSynchronisation}
            proteinesDisponibles={generateur.proteinesFiltrees}
            feculentsDisponibles={generateur.feculentsFiltres}
            legumesDisponibles={generateur.legumesPourGrille}
          />
          {accesRepas && (
            <button
              type="button"
              className="onglets-suivant"
              onClick={() => changerOnglet("repas")}
            >
              Passer à la sélection des repas →
            </button>
          )}
        </section>
      )}

      {ongletAffiche === "repas" && accesRepas && (
        <section aria-label="Sélection et personnalisation des repas">
          <SelectionRepas
            combinaisons={combinaisons}
            repasSelectionnes={planning.repasSelectionnes}
            selectionnerAleatoirement={planning.selectionnerAleatoirement}
            toutSelectionner={planning.toutSelectionner}
            toutDeselectionner={planning.toutDeselectionner}
            changerSelection={planning.changerSelection}
          />
          <PersonnalisationRepas
            repasSelectionnes={planning.repasSelectionnes}
            legumesSelection={generateur.legumesSelection}
            legumes={legumes}
            changerSelection={planning.changerSelection}
            ajouterLegumeAuRepas={planning.ajouterLegumeAuRepas}
            retirerLegumeDuRepas={planning.retirerLegumeDuRepas}
          />
          <button
            type="button"
            className="onglets-suivant"
            disabled={!accesPlanning}
            onClick={() => changerOnglet("planning")}
          >
            Passer au planning →
          </button>
        </section>
      )}

      {ongletAffiche === "planning" && accesPlanning && (
        <PlanningSemaine
          JOURS={JOURS}
          planningSemaine={planning.planningSemaine}
          repasSelectionnes={planning.repasSelectionnes}
          listeCourses={listeCourses}
          coursesCochees={planning.coursesCochees}
          setCoursesCochees={planning.setCoursesCochees}
          modifierRepasJour={planning.modifierRepasJour}
          basculerDeuxiemeRepas={planning.basculerDeuxiemeRepas}
          remplirSemaineAleatoirement={remplirPlanningAvecConfirmation}
          coursesManuelles={planning.coursesManuelles}
          ajouterCourseManuelle={planning.ajouterCourseManuelle}
          supprimerCourseManuelle={planning.supprimerCourseManuelle}
        />
      )}

      <div className="nouveau-planning-actions">
        <button type="button" onClick={nouveauPlanning}>
          Nouveau planning
        </button>
      </div>

      {confirmation && (
        <ConfirmDialog
          titre={confirmation.titre}
          message={confirmation.message}
          onAnnuler={() => setConfirmation(null)}
          onConfirmer={confirmerAction}
        />
      )}
    </main>
  );
}
