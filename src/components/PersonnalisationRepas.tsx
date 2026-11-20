import type { Legume } from "../types/aliments";
import type { Combinaison } from "../utils/combinaisons";
import type { RepasSelectionne } from "../types/planning";

type Props = {
  repasSelectionnes: RepasSelectionne[];
  legumesSelection: Legume[];
  legumes: Legume[];
  changerSelection: (combinaison: Combinaison) => void;
  ajouterLegumeAuRepas: (combinaisonId: string, legumeId: string) => void;
  retirerLegumeDuRepas: (combinaisonId: string, legumeId: string) => void;
};

export default function PersonnalisationRepas({ repasSelectionnes, legumesSelection, legumes, changerSelection, ajouterLegumeAuRepas, retirerLegumeDuRepas }: Props) {
  return (
    <>
            {/* REPAS SÉLECTIONNÉS */}

            <section className="repas-selectionnes">
              <h2>Mes repas sélectionnés ({repasSelectionnes.length})</h2>

              {repasSelectionnes.length === 0 ? (
                <p>
                  Sélectionne des combinaisons ci-dessus pour construire ton
                  planning.
                </p>
              ) : (
                <div className="planning-liste">
                  {repasSelectionnes.map((repas) => {
                    const combinaison = repas.combinaison;

                    const legumesAjoutables = legumesSelection.filter(
                      (legume) =>
                        legume.id !== combinaison.legume.id &&
                        !repas.legumesAjoutes.includes(legume.id),
                    );

                    return (
                      <article key={combinaison.id} className="planning-repas">
                        <div className="planning-entete">
                          <h3>
                            {combinaison.proteine.nom} +{" "}
                            {combinaison.feculent.nom} +{" "}
                            {combinaison.legume.nom}
                          </h3>

                          <button
                            type="button"
                            onClick={() => changerSelection(combinaison)}
                          >
                            Retirer
                          </button>
                        </div>

                        {repas.legumesAjoutes.length > 0 && (
                          <div className="repas-legumes-ajoutes">
                            {repas.legumesAjoutes.map((legumeId) => {
                              const legume = legumes.find(
                                (element) => element.id === legumeId,
                              );

                              if (!legume) return null;

                              return (
                                <span key={legumeId} className="bonus-item">
                                  + {legume.nom}
                                  <button
                                    type="button"
                                    aria-label={`Retirer ${legume.nom} du repas`}
                                    onClick={() =>
                                      retirerLegumeDuRepas(
                                        combinaison.id,
                                        legumeId,
                                      )
                                    }
                                  >
                                    ×
                                  </button>
                                </span>
                              );
                            })}
                          </div>
                        )}

                        {legumesAjoutables.length > 0 && (
                          <div className="planning-ajout">
                            <label htmlFor={`ajout-${combinaison.id}`}>
                              Ajouter un légume
                            </label>

                            <select
                              id={`ajout-${combinaison.id}`}
                              value=""
                              onChange={(e) => {
                                if (e.target.value) {
                                  ajouterLegumeAuRepas(
                                    combinaison.id,
                                    e.target.value,
                                  );
                                }
                              }}
                            >
                              <option value="">Choisir un légume...</option>

                              {legumesAjoutables.map((legume) => (
                                <option key={legume.id} value={legume.id}>
                                  {legume.nom}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
    </>
  );
}
