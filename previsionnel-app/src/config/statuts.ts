import type { StatutJuridique } from '../types';

export interface StatutInfo {
  id: StatutJuridique;
  nom: string;
  resumeCourt: string;
  description: string;
  avantages: string[];
  inconvenients: string[];
  idealPour: string;
}

export const STATUTS: StatutInfo[] = [
  {
    id: 'micro',
    nom: 'Micro-entreprise',
    resumeCourt: 'Simple et rapide pour démarrer',
    description: "Régime simplifié avec peu de formalités. Cotisations calculées sur le chiffre d'affaires, pas de TVA en dessous des seuils.",
    avantages: ['Comptabilité simplifiée', 'Pas de TVA (sous seuils)', 'Charges proportionnelles au CA'],
    inconvenients: ['Plafond de CA', 'Charges non déductibles', 'Pas de dividendes'],
    idealPour: "Démarrer seul avec peu d'investissements",
  },
  {
    id: 'ei',
    nom: 'Entreprise Individuelle',
    resumeCourt: 'Seul avec charges déductibles',
    description: "Statut individuel avec possibilité de déduire vos charges. Imposition à l'IR sur le bénéfice.",
    avantages: ['Charges déductibles', 'Pas de plafond CA', 'Simplicité de gestion'],
    inconvenients: ['Cotisations sur bénéfice (~45%)', 'IR progressif', 'Pas de dividendes'],
    idealPour: 'Activité individuelle avec des charges significatives',
  },
  {
    id: 'eurl',
    nom: 'EURL',
    resumeCourt: 'Société à associé unique',
    description: 'Société à responsabilité limitée avec un seul associé. Régime IS par défaut, possibilité de dividendes.',
    avantages: ['Responsabilité limitée', 'IS avantageux', 'Dividendes possibles'],
    inconvenients: ['Formalités de création', 'Comptabilité plus complexe'],
    idealPour: 'Entrepreneur seul souhaitant une société',
  },
  {
    id: 'sarl',
    nom: 'SARL',
    resumeCourt: 'Société à plusieurs associés',
    description: 'Société à responsabilité limitée avec plusieurs associés. Régime IS, gérant majoritaire ou minoritaire.',
    avantages: ['Responsabilité limitée', 'Plusieurs associés', 'IS avantageux'],
    inconvenients: ['Formalités de création', 'Rigidité des statuts'],
    idealPour: 'Projet à plusieurs associés avec cadre structuré',
  },
  {
    id: 'sasu',
    nom: 'SASU',
    resumeCourt: 'Société flexible à associé unique',
    description: 'Société par actions simplifiée à associé unique. Le président est assimilé salarié.',
    avantages: ['Grande flexibilité', 'Protection sociale président', 'Dividendes flat tax'],
    inconvenients: ['Charges sociales élevées sur salaire', 'Formalités de création'],
    idealPour: 'Entrepreneur seul qui veut une société flexible',
  },
  {
    id: 'sas',
    nom: 'SAS',
    resumeCourt: 'Société flexible à plusieurs associés',
    description: 'Société par actions simplifiée avec plusieurs associés. Grande liberté statutaire.',
    avantages: ['Grande flexibilité', 'Plusieurs associés', 'Dividendes flat tax'],
    inconvenients: ['Charges sociales élevées', 'Formalités de création'],
    idealPour: 'Projet ambitieux à plusieurs associés',
  },
];
