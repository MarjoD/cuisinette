import { useState } from "react";
import legumesData from "../data/legumes.json";
import type { CourseManuelle } from "../hooks/usePlanning";
import type * as React from "react";
import type { RepasSelectionne, JourPlanifie } from "../types/planning";

type Props = {
  JOURS: string[];
  planningSemaine: JourPlanifie[];
  repasSelectionnes: RepasSelectionne[];
  listeCourses: [string, string][];
  coursesCochees: string[];
  setCoursesCochees: React.Dispatch<React.SetStateAction<string[]>>;
  modifierRepasJour: (jourIndex: number, position: 0 | 1, id: string) => void;
  basculerDeuxiemeRepas: (jourIndex: number) => void;
  remplirSemaineAleatoirement: () => void;
  coursesManuelles: CourseManuelle[];
  ajouterCourseManuelle: (nom: string) => void;
  supprimerCourseManuelle: (id: string) => void;
};

// Convertit les identifiants des légumes supplémentaires en noms lisibles.
const nomsLegumesAjoutes = (ids: string[]): string[] =>
  ids.map((id) => legumesData.find((legume) => legume.id === id)?.nom ?? id);

export default function PlanningSemaine({
  JOURS,
  planningSemaine,
  repasSelectionnes,
  listeCourses,
  coursesCochees,
  setCoursesCochees,
  modifierRepasJour,
  basculerDeuxiemeRepas,
  remplirSemaineAleatoirement,
  coursesManuelles,
  ajouterCourseManuelle,
  supprimerCourseManuelle,
}: Props) {
  const [nouvelleCourse, setNouvelleCourse] = useState("");
  return (
    <>
      {/* PLANNING HEBDOMADAIRE ET LISTE DE COURSES */}
      <section className="planning-semaine" aria-labelledby="titre-semaine">
        <h2 id="titre-semaine">Planning de la semaine</h2>
        <p>
          Répartis les plats que tu as sélectionnés. Tu peux prévoir un ou deux
          repas par jour.
        </p>

        <div className="planning-semaine-actions">
          <button
            type="button"
            className="planning-bouton-auto"
            onClick={remplirSemaineAleatoirement}
            disabled={repasSelectionnes.length === 0}
          >
            🎲 Remplir ma semaine au hasard
          </button>

          <button
            type="button"
            className="planning-bouton-imprimer"
            onClick={() => window.print()}
          >
            🖨️ Imprimer / Enregistrer en PDF
          </button>
        </div>

        <div className="planning-semaine-colonnes">
          <div className="planning-semaine-jours">
            {JOURS.map((nomJour, jourIndex) => (
              <div className="planning-semaine-jour" key={nomJour}>
                <div className="planning-semaine-entete">
                  <h3>{nomJour}</h3>
                  <button
                    type="button"
                    onClick={() => basculerDeuxiemeRepas(jourIndex)}
                  >
                    {planningSemaine[jourIndex][1] === null
                      ? "+ 2e repas"
                      : "− 2e repas"}
                  </button>
                </div>
                {([0, 1] as const).map((position) => {
                  const valeur = planningSemaine[jourIndex][position];
                  if (valeur === null) return null;
                  return (
                    <label
                      className="planning-semaine-emplacement"
                      key={position}
                    >
                      <span>{position === 0 ? "Repas 1" : "Repas 2"}</span>
                      <select
                        value={valeur}
                        onChange={(e) =>
                          modifierRepasJour(jourIndex, position, e.target.value)
                        }
                        disabled={repasSelectionnes.length === 0}
                      >
                        <option value="">Choisir un plat…</option>
                        {repasSelectionnes.map((repas) => (
                          <option
                            key={repas.combinaison.id}
                            value={repas.combinaison.id}
                          >
                            {repas.combinaison.proteine.nom} +{" "}
                            {repas.combinaison.feculent.nom} +{" "}
                            {repas.combinaison.legume.nom}
                            {repas.legumesAjoutes.length > 0
                              ? ` + ${nomsLegumesAjoutes(repas.legumesAjoutes).join(" + ")}`
                              : ""}
                          </option>
                        ))}
                      </select>
                    </label>
                  );
                })}
              </div>
            ))}
          </div>
          <aside
            className="planning-semaine-courses"
            aria-labelledby="titre-courses"
          >
            <h3 id="titre-courses">Liste de courses</h3>
            <p>{listeCourses.length} ingrédient(s) différents</p>
            {listeCourses.length === 0 ? (
              <p>
                Place des repas dans la semaine pour afficher les ingrédients.
              </p>
            ) : (
              <ul>
                {listeCourses.map(([id, nom]) => (
                  <li key={id}>
                    <label>
                      <input
                        type="checkbox"
                        checked={coursesCochees.includes(id)}
                        onChange={(e) =>
                          setCoursesCochees((precedent) =>
                            e.target.checked
                              ? [...precedent, id]
                              : precedent.filter((ancienId) => ancienId !== id),
                          )
                        }
                      />
                      <span>{nom}</span>
                    </label>
                  </li>
                ))}
              </ul>
            )}

            <div className="courses-extras">
              <h4>Mes petits extras !</h4>
              <p>Un truc à acheter en plus ? Ajoute-le ici.</p>

              <form
                className="courses-extras-form"
                onSubmit={(event) => {
                  event.preventDefault();

                  if (!nouvelleCourse.trim()) return;

                  ajouterCourseManuelle(nouvelleCourse);
                  setNouvelleCourse("");
                }}
              >
                <input
                  type="text"
                  value={nouvelleCourse}
                  onChange={(event) => setNouvelleCourse(event.target.value)}
                  placeholder="Ex. : chocolat noir…"
                  aria-label="Nouvel article à acheter"
                  maxLength={100}
                />

                <button type="submit" disabled={!nouvelleCourse.trim()}>
                  Ajouter +
                </button>
              </form>

              {coursesManuelles.length > 0 && (
                <ul className="courses-extras-liste">
                  {coursesManuelles.map((course) => {
                    const idCase = `manuel:${course.id}`;

                    return (
                      <li key={course.id}>
                        <label>
                          <input
                            type="checkbox"
                            checked={coursesCochees.includes(idCase)}
                            onChange={(event) =>
                              setCoursesCochees((avant) =>
                                event.target.checked
                                  ? [...avant, idCase]
                                  : avant.filter((id) => id !== idCase),
                              )
                            }
                          />
                          <span>{course.nom}</span>
                        </label>

                        <button
                          type="button"
                          className="courses-extra-supprimer"
                          aria-label={`Supprimer ${course.nom}`}
                          onClick={() => supprimerCourseManuelle(course.id)}
                        >
                          <svg
                            viewBox="0 0 24 24"
                            width="14"
                            height="14"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            aria-hidden="true"
                          >
                            <path d="M6 6L18 18M18 6L6 18" />
                          </svg>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </aside>
        </div>

        <div className="planning-impression">
          <header className="impression-entete">
            <h2>Cuisinette</h2>
            <p>Mon planning de la semaine</p>
          </header>

          <div className="impression-jours">
            {JOURS.map((jour, index) => (
              <section className="impression-jour" key={jour}>
                <h3>{jour}</h3>

                {([0, 1] as const).map((position) => {
                  const id = planningSemaine[index]?.[position];

                  if (id === null) return null;

                  const repas = repasSelectionnes.find(
                    (r) => r.combinaison.id === id,
                  );

                  return (
                    <p key={position}>
                      <strong>Repas {position + 1} : </strong>
                      {repas
                        ? [
                            repas.combinaison.proteine.nom,
                            repas.combinaison.feculent.nom,
                            repas.combinaison.legume.nom,
                            ...nomsLegumesAjoutes(repas.legumesAjoutes),
                          ].join(" + ")
                        : "—"}
                    </p>
                  );
                })}
              </section>
            ))}
          </div>

          <section className="impression-courses">
            <h2>Ma liste de courses</h2>

            <ul>
              {/* Ingrédients générés automatiquement */}
              {listeCourses.map(([id, nom]) => (
                <li key={id}>
                  <span className="impression-case" />
                  <span>{nom}</span>
                </li>
              ))}

              {/* Ingrédients ajoutés manuellement */}
              {coursesManuelles.map((course) => (
                <li key={`manuel:${course.id}`}>
                  <span className="impression-case" />
                  <span>{course.nom}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </section>
    </>
  );
}
