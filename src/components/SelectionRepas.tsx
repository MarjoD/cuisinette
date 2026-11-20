import type { Combinaison } from "../utils/combinaisons";
import type { RepasSelectionne } from "../types/planning";

type Props = {
  combinaisons: Combinaison[];
  repasSelectionnes: RepasSelectionne[];
  selectionnerAleatoirement: (nombre: number) => void;
  toutSelectionner: () => void;
  toutDeselectionner: () => void;
  changerSelection: (combinaison: Combinaison) => void;
};

export default function SelectionRepas({
  combinaisons,
  repasSelectionnes,
  selectionnerAleatoirement,
  toutSelectionner,
  toutDeselectionner,
  changerSelection,
}: Props) {
  return (
    <>
      {/* 27 COMBINAISONS */}

      <section className="combinaisons">
        <h2>Combinaisons possibles ({combinaisons.length})</h2>

        <p>
          Sélectionne les repas qui t'intéressent. Tu pourras ensuite leur
          ajouter des légumes.
        </p>

        <div className="selection-actions">
          <button type="button" onClick={() => selectionnerAleatoirement(7)}>
            🎲 Sélectionner 7 au hasard
          </button>
          <button type="button" onClick={() => selectionnerAleatoirement(14)}>
            🎲 Sélectionner 14 au hasard
          </button>
          <button type="button" onClick={toutSelectionner}>
            Tout sélectionner
          </button>

          <button
            type="button"
            onClick={toutDeselectionner}
            disabled={repasSelectionnes.length === 0}
          >
            Tout désélectionner
          </button>
        </div>

        <div className="combinaisons-liste">
          {combinaisons.map((combinaison) => {
            const selectionne = repasSelectionnes.some(
              (repas) => repas.combinaison.id === combinaison.id,
            );

            return (
              <label
                key={combinaison.id}
                className={`combinaison-item ${selectionne ? "selectionnee" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={selectionne}
                  onChange={() => changerSelection(combinaison)}
                />

                <span>
                  {combinaison.proteine.nom} + {combinaison.feculent.nom} +{" "}
                  {combinaison.legume.nom}
                </span>
              </label>
            );
          })}
        </div>
      </section>
    </>
  );
}
