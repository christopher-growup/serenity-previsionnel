import { describe, it, expect } from 'vitest';
import { calculerAmortissements } from '../../utils/calculs-amortissement';
import { Investissement } from '../../types';

describe('calculerAmortissements', () => {
  it('returns [0, 0, 0] for empty investments', () => {
    expect(calculerAmortissements([])).toEqual([0, 0, 0]);
  });

  it('computes linear depreciation over 3 years (Q1 start = full year)', () => {
    const inv: Investissement[] = [
      { description: 'PC', montant: 3000, trimestre: 1, annee: 1, dureeAmortissement: 3 },
    ];
    const result = calculerAmortissements(inv);
    expect(result[0]).toBe(1000);
    expect(result[1]).toBe(1000);
    expect(result[2]).toBe(1000);
  });

  it('applies prorata temporis for Q3 start', () => {
    const inv: Investissement[] = [
      { description: 'PC', montant: 3600, trimestre: 3, annee: 1, dureeAmortissement: 3 },
    ];
    const result = calculerAmortissements(inv);
    expect(result[0]).toBe(600);  // 3600/3 = 1200/year, Q3 = 6 months = 600
    expect(result[1]).toBe(1200);
    expect(result[2]).toBe(1200);
  });

  it('handles investment starting in year 2', () => {
    const inv: Investissement[] = [
      { description: 'Vehicule', montant: 5000, trimestre: 1, annee: 2, dureeAmortissement: 5 },
    ];
    const result = calculerAmortissements(inv);
    expect(result[0]).toBe(0);
    expect(result[1]).toBe(1000);
    expect(result[2]).toBe(1000);
  });

  it('sums multiple investments', () => {
    const inv: Investissement[] = [
      { description: 'PC', montant: 3000, trimestre: 1, annee: 1, dureeAmortissement: 3 },
      { description: 'Bureau', montant: 6000, trimestre: 1, annee: 1, dureeAmortissement: 6 },
    ];
    const result = calculerAmortissements(inv);
    expect(result[0]).toBe(2000);
    expect(result[1]).toBe(2000);
    expect(result[2]).toBe(2000);
  });
});
