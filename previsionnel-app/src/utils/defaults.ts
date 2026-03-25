import { Previsionnel } from '../types';
import { CHARGES_SUGGESTIONS } from '../config/charges-suggestions';

export function createEmptyPrevisionnel(): Previsionnel {
  return {
    version: 1,
    dateCreation: new Date().toISOString(),
    dateDerniereModification: new Date().toISOString(),
    etapeCourante: 1,
    projet: {
      nomPorteur: '',
      nomSociete: '',
      dateCreationEnvisagee: '',
      activitePrincipale: '',
      typeActivite: 'services_bic',
      adresse: '',
      descriptionOffre: '',
      descriptionMarche: '',
      strategie: '',
      experience: '',
      competences: '',
      motivations: '',
    },
    statut: {
      statutJuridique: 'micro',
    },
    offres: [],
    investissements: [],
    financements: {
      capital: 0,
      apports: 0,
      emprunts: [],
      subventions: 0,
    },
    ventes: {},
    chargesFixes: CHARGES_SUGGESTIONS.map(s => ({
      ...s,
      evolutionAn2: 0,
      evolutionAn3: 0,
    })),
    chargesVariables: [],
    remunerationDirigeant: {
      salaireBrutAnnuel: 0,
      augmentationAnnuelle: 0,
      partRevenusRetires: 100,
    },
    salaries: [],
  };
}
