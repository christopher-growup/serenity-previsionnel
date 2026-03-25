import { Emprunt } from '../types';

export interface MensualiteEmprunt {
  mois: number;
  mensualite: number;
  capital: number;
  interets: number;
  capitalRestantDu: number;
}

export function calculerTableauEmprunt(emprunt: Emprunt): MensualiteEmprunt[] {
  if (emprunt.montant === 0) return [];

  const { montant, dureeMois, tauxAnnuel } = emprunt;
  const tauxMensuel = tauxAnnuel / 12;

  let mensualite: number;
  if (tauxMensuel === 0) {
    mensualite = montant / dureeMois;
  } else {
    mensualite = montant * (tauxMensuel * Math.pow(1 + tauxMensuel, dureeMois)) /
      (Math.pow(1 + tauxMensuel, dureeMois) - 1);
  }

  const tableau: MensualiteEmprunt[] = [];
  let capitalRestant = montant;

  for (let i = 0; i < dureeMois; i++) {
    const interets = capitalRestant * tauxMensuel;
    const capital = mensualite - interets;
    capitalRestant -= capital;
    tableau.push({
      mois: i,
      mensualite: Math.round(mensualite * 100) / 100,
      capital: Math.round(capital * 100) / 100,
      interets: Math.round(interets * 100) / 100,
      capitalRestantDu: Math.max(0, Math.round(capitalRestant * 100) / 100),
    });
  }
  return tableau;
}
