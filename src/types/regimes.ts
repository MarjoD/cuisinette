export type Regime = {
  id: string;
  nom: string;
  typesProteinesExclus: string[];
};

export type Restriction = {
  id: string;
  nom: string;
  allergenesExclus: string[];
};

export type Preferences = {
  regime: string;
  restrictions: string[];
  alimentsExclus: string[];
};
