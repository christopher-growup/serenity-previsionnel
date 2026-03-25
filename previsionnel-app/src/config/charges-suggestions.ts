import { ChargeFix } from '../types';

export const CHARGES_SUGGESTIONS: Omit<ChargeFix, 'evolutionAn2' | 'evolutionAn3'>[] = [
  { description: 'Loyer et charges locatives', montantAnnuel: 0 },
  { description: 'Eau et électricité', montantAnnuel: 0 },
  { description: 'Assurance professionnelle', montantAnnuel: 0 },
  { description: 'Téléphonie et internet', montantAnnuel: 0 },
  { description: 'Logiciels et abonnements', montantAnnuel: 0 },
  { description: 'Marketing et publicité', montantAnnuel: 0 },
  { description: 'Honoraires (comptable, avocat)', montantAnnuel: 0 },
  { description: 'Frais bancaires', montantAnnuel: 0 },
  { description: 'Frais de déplacement', montantAnnuel: 0 },
  { description: 'Fournitures et petit matériel', montantAnnuel: 0 },
];
