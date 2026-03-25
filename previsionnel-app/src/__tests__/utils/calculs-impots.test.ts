import { describe, it, expect } from 'vitest';
import { calculerIS, calculerIR, calculerImpotMicro } from '../../utils/calculs-impots';

describe('calculerIS', () => {
  it('applies 15% up to 42500', () => {
    expect(calculerIS(42500)).toBeCloseTo(6375);
  });

  it('applies 25% above 42500', () => {
    expect(calculerIS(100000)).toBeCloseTo(6375 + (100000 - 42500) * 0.25);
  });

  it('returns 0 for negative result', () => {
    expect(calculerIS(-5000)).toBe(0);
  });
});

describe('calculerIR', () => {
  it('returns 0 below first bracket', () => {
    expect(calculerIR(10000)).toBe(0);
  });

  it('applies progressive brackets', () => {
    // 20000: 0 on first 11294, 11% on 8706 = 957.66
    expect(calculerIR(20000)).toBeCloseTo(957.66, 0);
  });

  it('handles high income with multiple brackets', () => {
    const result = calculerIR(100000);
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThan(100000 * 0.45);
  });
});

describe('calculerImpotMicro', () => {
  it('with versement liberatoire: flat rate on CA', () => {
    expect(calculerImpotMicro(50000, 'services_bic', true)).toBeCloseTo(850);
  });

  it('without versement liberatoire: IR after abattement', () => {
    // CA 50000, services_bic abattement 50% -> revenu imposable 25000
    // IR on 25000: 0 on 11294 + 11% on 13706 = 1507.66
    const result = calculerImpotMicro(50000, 'services_bic', false);
    expect(result).toBeCloseTo(1507.66, 0);
  });

  it('vente_bic with versement liberatoire: 1%', () => {
    expect(calculerImpotMicro(100000, 'vente_bic', true)).toBeCloseTo(1000);
  });
});
