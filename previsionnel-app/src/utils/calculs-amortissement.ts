import type { Investissement } from '../types';

export function calculerAmortissements(investissements: Investissement[]): [number, number, number] {
  const dotations: [number, number, number] = [0, 0, 0];

  for (const inv of investissements) {
    const dotationAnnuelle = inv.montant / inv.dureeAmortissement;
    const moisRestantsPremAnnee = 12 - (inv.trimestre - 1) * 3;
    const prorataPremiereAnnee = moisRestantsPremAnnee / 12;

    for (let annee = inv.annee; annee <= 3; annee++) {
      const anneesEcoulees = annee - inv.annee;
      if (anneesEcoulees >= inv.dureeAmortissement) continue;

      let dotation = dotationAnnuelle;
      if (annee === inv.annee) {
        dotation = dotationAnnuelle * prorataPremiereAnnee;
      }
      dotations[annee - 1] += Math.round(dotation * 100) / 100;
    }
  }

  return dotations;
}
