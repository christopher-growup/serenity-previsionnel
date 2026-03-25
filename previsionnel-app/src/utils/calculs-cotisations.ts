import type { Statut, TypeActivite } from '../types';
import { BAREMES } from '../config/baremes';

export function calculerCotisationsDirigeant(
  statut: Statut,
  typeActivite: TypeActivite,
  baseCA: number,
  salaireBrut: number,
  options?: { acre?: boolean; annee?: number },
): number {
  let cotisations: number;
  switch (statut.statutJuridique) {
    case 'micro':
      cotisations = baseCA * BAREMES.cotisationsMicro[typeActivite];
      break;
    case 'ei':
      cotisations = baseCA * BAREMES.cotisationsEI;
      break;
    case 'eurl':
    case 'sarl': {
      const taux = statut.typeGerance === 'minoritaire'
        ? BAREMES.cotisationsGerantMinoritaire
        : BAREMES.cotisationsGerantMajoritaire;
      cotisations = salaireBrut * taux;
      break;
    }
    case 'sasu':
    case 'sas':
      cotisations = salaireBrut * (BAREMES.cotisationsSASU_patronal + BAREMES.cotisationsSASU_salarial);
      break;
    default:
      cotisations = 0;
  }
  if (options?.acre && (options?.annee ?? 1) === 1) {
    cotisations *= (1 - BAREMES.acre.tauxReduction);
  }
  return cotisations;
}

export function calculerCoutEmployeur(salaireBrut: number): number {
  return salaireBrut * (1 + BAREMES.cotisationsSalarie_patronal);
}
