import type { AlimentBase } from "../types/aliments";
import type { Preferences } from "../types/regimes";

type Props = {
  preferences: Preferences;
  recherche: string;
  setRecherche: (value: string) => void;
  categories: { titre: string; aliments: AlimentBase[] }[];
  filtrerRecherche: (aliments: AlimentBase[]) => AlimentBase[];
  aucunResultat: boolean;
  changerExclusion: (id: string) => void;
};

export default function Blacklist({ preferences, recherche, setRecherche, categories, filtrerRecherche, aucunResultat, changerExclusion }: Props) {
  return (
    <>
      {/* BLACKLIST */}

      <details className="blacklist">
        <summary>
          Aliments à exclure ({preferences.alimentsExclus.length})
        </summary>

        <div className="blacklist-panel">
          <input
            type="search"
            className="blacklist-search"
            placeholder="Rechercher un aliment..."
            aria-label="Rechercher un aliment à exclure"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
          />

          <div className="blacklist-results">
            {categories.map((categorie) => {
              const alimentsTrouves = filtrerRecherche(categorie.aliments);

              if (alimentsTrouves.length === 0) {
                return null;
              }

              return (
                <section key={categorie.titre} className="blacklist-category">
                  <h3>{categorie.titre}</h3>

                  <div className="blacklist-items">
                    {alimentsTrouves.map((aliment) => (
                      <label key={aliment.id} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={preferences.alimentsExclus.includes(
                            aliment.id,
                          )}
                          onChange={() => changerExclusion(aliment.id)}
                        />
                        {aliment.nom}
                      </label>
                    ))}
                  </div>
                </section>
              );
            })}

            {aucunResultat && (
              <p className="blacklist-hint">
                {recherche.trim()
                  ? "Aucun aliment trouvé."
                  : "Aucun aliment exclu. Utilise la recherche pour en ajouter."}
              </p>
            )}
          </div>
        </div>
      </details>

    </>
  );
}
