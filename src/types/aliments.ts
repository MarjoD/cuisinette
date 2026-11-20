export type AlimentBase = {
  id: string;
  nom: string;
  allergenes: string[];
};

export type Proteine = AlimentBase & {
  origine: "animale" | "vegetale";
  type: string;
};

export type Feculent = AlimentBase & {
  type: string;
};

export type Legume = AlimentBase & {
  mois: number[];
};
