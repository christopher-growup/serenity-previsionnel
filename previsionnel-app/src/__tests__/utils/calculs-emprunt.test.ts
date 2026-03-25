import { describe, it, expect } from 'vitest';
import { calculerTableauEmprunt } from '../../utils/calculs-emprunt';

describe('calculerTableauEmprunt', () => {
  it('returns empty array for zero amount', () => {
    expect(calculerTableauEmprunt({ description: '', montant: 0, dureeMois: 12, tauxAnnuel: 0.05 })).toEqual([]);
  });

  it('computes correct total repayment', () => {
    const tableau = calculerTableauEmprunt({ description: 'Pret', montant: 6500, dureeMois: 60, tauxAnnuel: 0.05 });
    expect(tableau).toHaveLength(60);
    const totalCapital = tableau.reduce((s, m) => s + m.capital, 0);
    expect(totalCapital).toBeCloseTo(6500, 0);
  });

  it('first payment has more interest than last', () => {
    const tableau = calculerTableauEmprunt({ description: 'Pret', montant: 10000, dureeMois: 36, tauxAnnuel: 0.06 });
    expect(tableau[0].interets).toBeGreaterThan(tableau[35].interets);
  });

  it('monthly payment is constant', () => {
    const tableau = calculerTableauEmprunt({ description: 'Pret', montant: 10000, dureeMois: 24, tauxAnnuel: 0.04 });
    const mensualite = tableau[0].mensualite;
    tableau.forEach(m => expect(m.mensualite).toBeCloseTo(mensualite, 2));
  });
});
