import { describe, it, expect } from 'vitest';
import { calculerSynthese, calculerCAMensuel, calculerChargesAnnuelles } from '../../utils/calculs';
import { createEmptyPrevisionnel } from '../../utils/defaults';
import { Previsionnel } from '../../types';

function makeTestData(): Previsionnel {
  const data = createEmptyPrevisionnel();
  data.projet.typeActivite = 'services_bic';
  data.statut = { statutJuridique: 'sasu' };
  data.offres = [
    { id: 'o1', nom: 'Coaching', prixUnitaireHT: 150, delaiPaiementMois: 0, acomptePourcent: 0, tauxTVA: 0.2 },
  ];
  data.ventes = { o1: Array(36).fill(5) };
  data.chargesFixes = [
    { description: 'Loyer', montantAnnuel: 6000, evolutionAn2: 0.05, evolutionAn3: 0.05 },
  ];
  data.remunerationDirigeant = { salaireBrutAnnuel: 30000, augmentationAnnuelle: 0.05 };
  return data;
}

describe('calculerCAMensuel', () => {
  it('computes monthly CA from ventes and offres', () => {
    const data = makeTestData();
    const caMensuel = calculerCAMensuel(data);
    expect(caMensuel).toHaveLength(36);
    expect(caMensuel[0]).toBe(750);
    expect(caMensuel[11]).toBe(750);
  });
});

describe('calculerChargesAnnuelles', () => {
  it('applies evolution rates for years 2 and 3', () => {
    const data = makeTestData();
    const charges = calculerChargesAnnuelles(data.chargesFixes);
    expect(charges[0]).toBe(6000);
    expect(charges[1]).toBeCloseTo(6300);
    expect(charges[2]).toBeCloseTo(6615);
  });
});

describe('calculerSynthese', () => {
  it('returns 3 annual results', () => {
    const data = makeTestData();
    const synthese = calculerSynthese(data);
    expect(synthese.resultatsAnnuels).toHaveLength(3);
  });

  it('computes positive CA for non-empty sales', () => {
    const data = makeTestData();
    const synthese = calculerSynthese(data);
    expect(synthese.resultatsAnnuels[0].chiffreAffairesHT).toBe(9000);
  });

  it('returns 36 months of tresorerie', () => {
    const data = makeTestData();
    const synthese = calculerSynthese(data);
    expect(synthese.tresorerie).toHaveLength(36);
  });

  it('generates alert for negative tresorerie', () => {
    const data = makeTestData();
    data.ventes = { o1: Array(36).fill(0) };
    data.remunerationDirigeant.salaireBrutAnnuel = 50000;
    const synthese = calculerSynthese(data);
    expect(synthese.alertes.some(a => a.toLowerCase().includes('tresorerie'))).toBe(true);
  });
});
