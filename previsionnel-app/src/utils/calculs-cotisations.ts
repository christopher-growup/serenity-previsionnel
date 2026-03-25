import { Statut, TypeActivite } from '../types';
import { BAREMES } from '../config/baremes';

export function calculerCotisationsDirigeant(
  statut: Statut,
  typeActivite: TypeActivite,
  baseCA: number,
  salaireBrut: number,
): number {
  switch (statut.statutJuridique) {
    case 'micro':
      return baseCA * BAREMES.cotisationsMicro[typeActivite];
    case 'ei':
      return baseCA * BAREMES.cotisationsEI;
    case 'eurl':
    case 'sarl': {
      const taux = statut.typeGerance === 'minoritaire'
        ? BAREMES.cotisationsGerantMinoritaire
        : BAREMES.cotisationsGerantMajoritaire;
      return salaireBrut * taux;
    }
    case 'sasu':
    case 'sas':
      return salaireBrut * (BAREMES.cotisationsSASU_patronal + BAREMES.cotisationsSASU_salarial);
    default:
      return 0;
  }
}

export function calculerCoutEmployeur(salaireBrut: number): number {
  return salaireBrut * (1 + BAREMES.cotisationsSalarie_patronal);
}
