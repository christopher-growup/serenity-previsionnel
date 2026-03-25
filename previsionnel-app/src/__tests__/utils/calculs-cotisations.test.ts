import { describe, it, expect } from 'vitest';
import { calculerCotisationsDirigeant, calculerCoutEmployeur } from '../../utils/calculs-cotisations';
import { Statut, TypeActivite } from '../../types';

describe('calculerCotisationsDirigeant', () => {
  it('micro vente_bic: 12.3% of CA', () => {
    const statut: Statut = { statutJuridique: 'micro' };
    expect(calculerCotisationsDirigeant(statut, 'vente_bic', 100000, 0)).toBeCloseTo(12300);
  });

  it('micro services_bic: 21.2% of CA', () => {
    const statut: Statut = { statutJuridique: 'micro' };
    expect(calculerCotisationsDirigeant(statut, 'services_bic', 50000, 0)).toBeCloseTo(10600);
  });

  it('micro liberale_bnc_ssi: 25.6% of CA', () => {
    const statut: Statut = { statutJuridique: 'micro' };
    expect(calculerCotisationsDirigeant(statut, 'liberale_bnc_ssi', 40000, 0)).toBeCloseTo(10240);
  });

  it('EI: 45% of benefice', () => {
    const statut: Statut = { statutJuridique: 'ei' };
    expect(calculerCotisationsDirigeant(statut, 'services_bic', 30000, 0)).toBeCloseTo(13500);
  });

  it('SASU: patronal + salarial on brut', () => {
    const statut: Statut = { statutJuridique: 'sasu' };
    const result = calculerCotisationsDirigeant(statut, 'services_bic', 0, 45000);
    expect(result).toBeCloseTo(45000 * 0.82, -1);
  });

  it('SARL gerant majoritaire: 45%', () => {
    const statut: Statut = { statutJuridique: 'sarl', typeGerance: 'majoritaire' };
    expect(calculerCotisationsDirigeant(statut, 'services_bic', 0, 40000)).toBeCloseTo(18000);
  });

  it('SARL gerant minoritaire: 65%', () => {
    const statut: Statut = { statutJuridique: 'sarl', typeGerance: 'minoritaire' };
    expect(calculerCotisationsDirigeant(statut, 'services_bic', 0, 40000)).toBeCloseTo(26000);
  });
});

describe('calculerCoutEmployeur', () => {
  it('adds 45% patronal charges', () => {
    expect(calculerCoutEmployeur(30000)).toBeCloseTo(43500);
  });
});
