import type { Preferences } from "../types/regimes";

type Props = {
  preferences: Preferences;
  regimesData: {
    regimes: { id: string; nom: string }[];
    restrictions: { id: string; nom: string }[];
  };
  modifierPreferences: (p: Preferences) => void;
  changerRestriction: (id: string) => void;
};

export default function Filtres({
  preferences,
  regimesData,
  modifierPreferences,
  changerRestriction,
}: Props) {
  return (
    <>
      {/* FILTRES */}

      <h2>Filtres</h2>

      <section className="filtres">
        <div className="filtre-regime">
          <label htmlFor="regime">Régime alimentaire</label>

          <select
            id="regime"
            value={preferences.regime}
            onChange={(e) =>
              modifierPreferences({
                ...preferences,
                regime: e.target.value,
              })
            }
          >
            {regimesData.regimes.map((regime) => (
              <option key={regime.id} value={regime.id}>
                {regime.nom}
              </option>
            ))}
          </select>
        </div>

        <div className="filtre-restrictions">
          <span>Restrictions</span>

          {regimesData.restrictions.map((restriction) => (
            <label key={restriction.id} className="checkbox-label">
              <input
                type="checkbox"
                checked={preferences.restrictions.includes(restriction.id)}
                onChange={() => changerRestriction(restriction.id)}
              />
              {restriction.nom}
            </label>
          ))}
        </div>
      </section>
    </>
  );
}
