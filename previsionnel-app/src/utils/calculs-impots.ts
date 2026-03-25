import type { TypeActivite } from '../types';
import { BAREMES } from '../config/baremes';

export function calculerIS(resultatAvantImpot: number): number {
  if (resultatAvantImpot <= 0) return 0;
  if (resultatAvantImpot <= BAREMES.is.seuilReduit) {
    return resultatAvantImpot * BAREMES.is.tauxReduit;
  }
  return BAREMES.is.seuilReduit * BAREMES.is.tauxReduit +
    (resultatAvantImpot - BAREMES.is.seuilReduit) * BAREMES.is.tauxNormal;
}

export function calculerIR(revenuImposable: number): number {
  if (revenuImposable <= 0) return 0;
  let impot = 0;
  let restant = revenuImposable;
  let limitePrec = 0;

  for (const tranche of BAREMES.irTranches) {
    const assiette = Math.min(restant, tranche.limite - limitePrec);
    if (assiette <= 0) break;
    impot += assiette * tranche.taux;
    restant -= assiette;
    limitePrec = tranche.limite;
  }

  return Math.round(impot * 100) / 100;
}

export function calculerImpotMicro(
  ca: number,
  typeActivite: TypeActivite,
  versementLiberatoire: boolean,
): number {
  if (versementLiberatoire) {
    return ca * BAREMES.versementLiberatoire[typeActivite];
  }
  const abattement = BAREMES.abattementMicro[typeActivite];
  const revenuImposable = ca * (1 - abattement);
  return calculerIR(revenuImposable);
}
