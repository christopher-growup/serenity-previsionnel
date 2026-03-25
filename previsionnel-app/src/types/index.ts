export type TypeActivite = 'vente_bic' | 'services_bic' | 'liberale_cipav' | 'liberale_bnc_ssi';
export type StatutJuridique = 'micro' | 'ei' | 'eurl' | 'sarl' | 'sasu' | 'sas';
export type TypeGerance = 'majoritaire' | 'minoritaire';

export interface Projet {
  nomPorteur: string;
  nomSociete: string;
  dateCreationEnvisagee: string;
  activitePrincipale: string;
  typeActivite: TypeActivite;
  adresse: string;
  descriptionOffre: string;
  descriptionMarche: string;
  strategie: string;
  experience: string;
  competences: string;
  motivations: string;
}

export interface Statut {
  statutJuridique: StatutJuridique;
  typeGerance?: TypeGerance;
  versementLiberatoire?: boolean;
}

export interface Offre {
  id: string;
  nom: string;
  prixUnitaireHT: number;
  delaiPaiementMois: number;
  acomptePourcent: number;
  tauxTVA: number;
}

export interface Investissement {
  description: string;
  montant: number;
  trimestre: number;
  annee: number;
  dureeAmortissement: number;
}

export interface Emprunt {
  description: string;
  montant: number;
  dureeMois: number;
  tauxAnnuel: number;
}

export interface Financements {
  capital: number;
  apports: number;
  emprunts: Emprunt[];
  subventions: number;
}

export interface ChargeFix {
  description: string;
  montantAnnuel: number;
  evolutionAn2: number;
  evolutionAn3: number;
}

export interface ChargeVariable {
  offreId: string;
  description: string;
  coutUnitaire: number;
}

export interface RemunerationDirigeant {
  salaireBrutAnnuel: number;
  augmentationAnnuelle: number;
  partRevenusRetires?: number;
}

export interface Salarie {
  poste: string;
  salaireBrutAnnuel: number;
  dateEmbauche: { trimestre: number; annee: number };
  augmentationAnnuelle: number;
}

export interface Previsionnel {
  version: number;
  dateCreation: string;
  dateDerniereModification: string;
  etapeCourante: number;
  projet: Projet;
  statut: Statut;
  offres: Offre[];
  investissements: Investissement[];
  financements: Financements;
  ventes: Record<string, number[]>;
  chargesFixes: ChargeFix[];
  chargesVariables: ChargeVariable[];
  remunerationDirigeant: RemunerationDirigeant;
  salaries: Salarie[];
}

export interface ResultatAnnuel {
  annee: number;
  chiffreAffairesHT: number;
  chargesVariablesTotal: number;
  margeBrute: number;
  chargesExternesTotal: number;
  chargesPersonnelTotal: number;
  cotisationsDirigeant: number;
  ebe: number;
  dotationsAmortissements: number;
  resultatExploitation: number;
  chargesFinancieres: number;
  resultatAvantImpot: number;
  impot: number;
  resultatNet: number;
}

export interface TresorerieMensuelle {
  mois: number;
  tresorerieDebut: number;
  encaissements: number;
  decaissementsCharges: number;
  decaissementsPersonnel: number;
  decaissementsInvestissements: number;
  remboursementsEmprunts: number;
  financementsRecus: number;
  tresorerieFin: number;
}

export interface IndicateursClés {
  pointMortEuros: number[];
  pointMortMois: number | null;
  ratioDetteCapital: number[];
  ratioDetteResultat: number[];
}

export interface Synthese {
  resultatsAnnuels: ResultatAnnuel[];
  tresorerie: TresorerieMensuelle[];
  indicateurs: IndicateursClés;
  alertes: string[];
}
