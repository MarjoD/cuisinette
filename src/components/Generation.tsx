import type { CaseRepas } from "../utils/random";
import { useEffect, useRef, useState } from "react";
import type { Proteine, Feculent, Legume } from "../types/aliments";

type Props = {
  grille: CaseRepas[] | null;
  casesVerrouillees: number[];
  generationPossibleAvecVerrous: boolean;
  toutesCasesVerrouillees: boolean;
  lancerGeneration: () => void;
  basculerVerrou: (index: number) => void;
  legumesBonus: Legume[];
  legumesBonusDisponibles: Legume[];
  ajouterLegumeBonus: () => void;
  ajouterLegumeBonusManuel: (id: string) => void;
  supprimerLegumeBonus: (id: string) => void;
  MAX_LEGUMES_BONUS: number;
  modifierIngredient: (index: number, alimentId: string) => boolean;
  proteinesDisponibles: Proteine[];
  feculentsDisponibles: Feculent[];
  legumesDisponibles: Legume[];
};

export default function Generation({
  grille,
  casesVerrouillees,
  generationPossibleAvecVerrous,
  toutesCasesVerrouillees,
  lancerGeneration,
  basculerVerrou,
  legumesBonus,
  legumesBonusDisponibles,
  ajouterLegumeBonus,
  ajouterLegumeBonusManuel,
  supprimerLegumeBonus,
  MAX_LEGUMES_BONUS,
  modifierIngredient,
  proteinesDisponibles,
  feculentsDisponibles,
  legumesDisponibles,
}: Props) {
  const [legumeChoisi, setLegumeChoisi] = useState("");
  const [menuLegumesOuvert, setMenuLegumesOuvert] = useState(false);
  const menuLegumesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuLegumesOuvert) return;

    function fermerAuClicExterieur(event: PointerEvent) {
      if (!menuLegumesRef.current?.contains(event.target as Node)) {
        setMenuLegumesOuvert(false);
      }
    }

    function fermerAvecEchap(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuLegumesOuvert(false);
      }
    }

    document.addEventListener("pointerdown", fermerAuClicExterieur);
    document.addEventListener("keydown", fermerAvecEchap);

    return () => {
      document.removeEventListener("pointerdown", fermerAuClicExterieur);
      document.removeEventListener("keydown", fermerAvecEchap);
    };
  }, [menuLegumesOuvert]);

  const [caseEnModification, setCaseEnModification] = useState<number | null>(
    null,
  );

  const ingredientsDisponibles =
    caseEnModification === null || !grille
      ? []
      : grille[caseEnModification].categorie === "proteine"
        ? proteinesDisponibles
        : grille[caseEnModification].categorie === "feculent"
          ? feculentsDisponibles
          : legumesDisponibles;

  const ingredientsProposes = ingredientsDisponibles
    .filter(
      (aliment) =>
        !grille?.some(
          (c, index) =>
            index !== caseEnModification && c.aliment.id === aliment.id,
        ),
    )
    .sort((a, b) => a.nom.localeCompare(b.nom, "fr"));

  return (
    <>
      {/* GÉNÉRATEUR */}

      <h2>Ma grille d’ingrédients</h2>

      <div className="generation">
        <button
          type="button"
          className="bouton-generer"
          onClick={lancerGeneration}
          disabled={!generationPossibleAvecVerrous || toutesCasesVerrouillees}
        >
          {grille
            ? "Régénérer les cases déverrouillées"
            : "Générer mes ingrédients"}
        </button>

        {!generationPossibleAvecVerrous && (
          <p className="generation-erreur">
            Pas assez d'ingrédients compatibles pour remplir les cases
            déverrouillées. Tu peux retirer une exclusion ou déverrouiller
            d'autres cases.
          </p>
        )}

        {grille && (
          <>
            <p>
              {casesVerrouillees.length} ingrédient(s) verrouillé(s). Clique sur
              un cadenas pour conserver cet ingrédient lors du prochain tirage.
            </p>
            {toutesCasesVerrouillees && (
              <p>
                Les 9 cases sont verrouillées : déverrouille-en une pour
                régénérer.
              </p>
            )}
            {/* GRILLE 3 × 3 */}

            <div className="grille-repas">
              {grille.map((caseRepas, index) => (
                <div
                  key={index}
                  className={`case-repas ${caseRepas.categorie}`}
                >
                  <span className="case-categorie">
                    {caseRepas.categorie === "proteine"
                      ? "Protéine"
                      : caseRepas.categorie === "feculent"
                        ? "Féculent"
                        : "Légume"}
                  </span>

                  <strong>{caseRepas.aliment.nom}</strong>
                  <div className="case-actions">
                    <button
                      type="button"
                      className="bouton-modifier-ingredient"
                      aria-label={`Modifier ${caseRepas.aliment.nom}`}
                      onClick={() => setCaseEnModification(index)}
                    >
                      ✎
                    </button>
                    <button
                      type="button"
                      className="bouton-verrou"
                      aria-label={`${casesVerrouillees.includes(index) ? "Déverrouiller" : "Verrouiller"} ${caseRepas.aliment.nom}`}
                      aria-pressed={casesVerrouillees.includes(index)}
                      title={
                        casesVerrouillees.includes(index)
                          ? "Déverrouiller"
                          : "Verrouiller"
                      }
                      onClick={() => basculerVerrou(index)}
                    >
                      {casesVerrouillees.includes(index) ? (
                        <svg
                          viewBox="0 0 24 24"
                          width="24"
                          height="24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <rect x="5" y="10" width="14" height="11" rx="2" />
                          <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                        </svg>
                      ) : (
                        <svg
                          viewBox="0 0 24 24"
                          width="24"
                          height="24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <rect x="5" y="10" width="14" height="11" rx="2" />
                          <path d="M8 10V7a4 4 0 0 1 8 0" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* LÉGUMES BONUS */}

            <section className="legumes-bonus">
              <h3>Légumes bonus</h3>

              <p>Ajoute des légumes à ta sélection pour varier tes repas.</p>

              <button
                type="button"
                className="bouton-bonus"
                onClick={ajouterLegumeBonus}
                disabled={
                  legumesBonus.length >= MAX_LEGUMES_BONUS ||
                  legumesBonusDisponibles.length === 0
                }
              >
                🎲 Tirer un légume bonus ({legumesBonus.length}/
                {MAX_LEGUMES_BONUS})
              </button>

              <div className="bonus-choix-manuel">
                <label id="legume-bonus-label">Ou choisis ton légume :</label>

                <div className="bonus-choix-actions">
                  <div className="bonus-menu" ref={menuLegumesRef}>
                    <button
                      type="button"
                      className="bonus-menu-declencheur"
                      aria-labelledby="legume-bonus-label"
                      aria-expanded={menuLegumesOuvert}
                      aria-controls="bonus-menu-options"
                      disabled={
                        legumesBonus.length >= MAX_LEGUMES_BONUS ||
                        legumesBonusDisponibles.length === 0
                      }
                      onClick={() => setMenuLegumesOuvert((ouvert) => !ouvert)}
                    >
                      <span>
                        {legumesBonusDisponibles.find(
                          (legume) => legume.id === legumeChoisi,
                        )?.nom ?? "Choisir un légume…"}
                      </span>
                      <span aria-hidden="true">⌄</span>
                    </button>

                    {menuLegumesOuvert && (
                      <div
                        id="bonus-menu-options"
                        className="bonus-menu-options"
                        aria-label="Légumes disponibles"
                      >
                        {[...legumesBonusDisponibles]
                          .sort((a, b) => a.nom.localeCompare(b.nom, "fr"))
                          .map((legume) => (
                            <button
                              key={legume.id}
                              type="button"
                              className={
                                legumeChoisi === legume.id
                                  ? "bonus-menu-option actif"
                                  : "bonus-menu-option"
                              }
                              onClick={() => {
                                setLegumeChoisi(legume.id);
                                setMenuLegumesOuvert(false);
                              }}
                            >
                              {legume.nom}
                            </button>
                          ))}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    className="bouton-bonus"
                    disabled={
                      !legumeChoisi ||
                      !legumesBonusDisponibles.some(
                        (legume) => legume.id === legumeChoisi,
                      ) ||
                      legumesBonus.length >= MAX_LEGUMES_BONUS
                    }
                    onClick={() => {
                      ajouterLegumeBonusManuel(legumeChoisi);
                      setLegumeChoisi("");
                      setMenuLegumesOuvert(false);
                    }}
                  >
                    Ajouter +
                  </button>
                </div>
              </div>

              {legumesBonus.length > 0 && (
                <div className="bonus-liste">
                  {legumesBonus.map((legume) => (
                    <span key={legume.id} className="bonus-item">
                      {legume.nom}

                      <button
                        type="button"
                        aria-label={`Retirer ${legume.nom}`}
                        onClick={() => supprimerLegumeBonus(legume.id)}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {legumesBonus.length >= MAX_LEGUMES_BONUS ? (
                <p>Tu as atteint la limite de 3 légumes bonus.</p>
              ) : (
                legumesBonusDisponibles.length === 0 && (
                  <p>Aucun autre légume compatible disponible.</p>
                )
              )}
            </section>
          </>
        )}
      </div>

      {caseEnModification !== null && grille && (
        <div
          className="ingredient-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setCaseEnModification(null);
            }
          }}
        >
          <div
            className="ingredient-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ingredient-modal-titre"
          >
            <button
              type="button"
              className="ingredient-modal-fermer"
              aria-label="Fermer"
              onClick={() => setCaseEnModification(null)}
            >
              ×
            </button>

            <span className="ingredient-modal-fleur" aria-hidden="true">
              ✿
            </span>

            <h2 id="ingredient-modal-titre">On change quoi ?</h2>

            <p>
              Remplacer{" "}
              <strong>{grille[caseEnModification].aliment.nom}</strong> par :
            </p>

            <div className="ingredient-modal-liste">
              {ingredientsProposes
                .filter(
                  (aliment) =>
                    aliment.id !== grille[caseEnModification].aliment.id,
                )
                .map((aliment) => (
                  <button
                    key={aliment.id}
                    type="button"
                    onClick={() => {
                      const modifie = modifierIngredient(
                        caseEnModification,
                        aliment.id,
                      );

                      if (modifie) {
                        setCaseEnModification(null);
                      }
                    }}
                  >
                    {aliment.nom}
                  </button>
                ))}
            </div>

            <button
              type="button"
              className="ingredient-modal-annuler"
              onClick={() => setCaseEnModification(null)}
            >
              Finalement, on garde !
            </button>
          </div>
        </div>
      )}
    </>
  );
}
