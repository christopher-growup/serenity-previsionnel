import XLSX from 'xlsx-js-style';
import type { Previsionnel, Synthese } from '../types';
import { calculerCotisationsDirigeant, calculerCoutEmployeur } from './calculs-cotisations';
import { getLabelsNomsMois } from './mois';

function r(n: number): number {
  return Math.round(n * 100) / 100;
}

function labelStatut(statut: string): string {
  const map: Record<string, string> = {
    micro: 'Micro-entreprise',
    ei: 'Entreprise Individuelle',
    eurl: 'EURL',
    sarl: 'SARL',
    sasu: 'SASU',
    sas: 'SAS',
  };
  return map[statut] ?? statut;
}

function labelTypeActivite(type: string): string {
  const map: Record<string, string> = {
    vente_bic: 'Vente de marchandises (BIC)',
    services_bic: 'Prestations de services (BIC)',
    liberale_cipav: 'Profession libérale (CIPAV)',
    liberale_bnc_ssi: 'Profession libérale (BNC/SSI)',
  };
  return map[type] ?? type;
}

// ─── Style constants ──────────────────────────────────────────────────────────

const BORDER_THIN = {
  top: { style: 'thin' as const, color: { rgb: 'D1D5DB' } },
  bottom: { style: 'thin' as const, color: { rgb: 'D1D5DB' } },
  left: { style: 'thin' as const, color: { rgb: 'D1D5DB' } },
  right: { style: 'thin' as const, color: { rgb: 'D1D5DB' } },
};

const STYLE_HEADER = {
  fill: { fgColor: { rgb: '082742' } },
  font: { color: { rgb: 'FFFFFF' }, bold: true, name: 'Montserrat', sz: 11 },
  border: BORDER_THIN,
  alignment: { horizontal: 'center' as const, vertical: 'center' as const },
};

const STYLE_TOTAL = {
  fill: { fgColor: { rgb: 'F5F0E4' } },
  font: { bold: true, color: { rgb: '082742' }, name: 'Lato', sz: 10 },
  border: BORDER_THIN,
};

const STYLE_TOTAL_MONEY = {
  fill: { fgColor: { rgb: 'F5F0E4' } },
  font: { bold: true, color: { rgb: '082742' }, name: 'Lato', sz: 10 },
  border: BORDER_THIN,
  numFmt: '#,##0 "€"',
  alignment: { horizontal: 'right' as const },
};

const STYLE_CELL = {
  font: { name: 'Lato', sz: 10, color: { rgb: '333333' } },
  border: BORDER_THIN,
};

const STYLE_CELL_ALT = {
  fill: { fgColor: { rgb: 'F9FAFB' } },
  font: { name: 'Lato', sz: 10, color: { rgb: '333333' } },
  border: BORDER_THIN,
};

const STYLE_MONEY = {
  font: { name: 'Lato', sz: 10, color: { rgb: '333333' } },
  border: BORDER_THIN,
  numFmt: '#,##0 "€"',
  alignment: { horizontal: 'right' as const },
};

const STYLE_MONEY_ALT = {
  fill: { fgColor: { rgb: 'F9FAFB' } },
  font: { name: 'Lato', sz: 10, color: { rgb: '333333' } },
  border: BORDER_THIN,
  numFmt: '#,##0 "€"',
  alignment: { horizontal: 'right' as const },
};

const STYLE_PCT = {
  font: { name: 'Lato', sz: 10, color: { rgb: '333333' } },
  border: BORDER_THIN,
  numFmt: '0.0"%"',
  alignment: { horizontal: 'right' as const },
};

const STYLE_SECTION_TITLE = {
  fill: { fgColor: { rgb: 'BE9F56' } },
  font: { color: { rgb: 'FFFFFF' }, bold: true, name: 'Montserrat', sz: 12 },
  border: BORDER_THIN,
};

// ─── Style helpers ────────────────────────────────────────────────────────────

type CellStyle = Record<string, unknown>;

/**
 * Apply a style to every cell in a given row.
 */
function styleRow(ws: XLSX.WorkSheet, rowIdx: number, style: CellStyle): void {
  const range = XLSX.utils.decode_range(ws['!ref']!);
  for (let c = range.s.c; c <= range.e.c; c++) {
    const addr = XLSX.utils.encode_cell({ r: rowIdx, c });
    if (ws[addr]) ws[addr].s = style;
  }
}

/**
 * Apply a style to a single cell, identified by column index.
 */
function styleCell(ws: XLSX.WorkSheet, rowIdx: number, colIdx: number, style: CellStyle): void {
  const addr = XLSX.utils.encode_cell({ r: rowIdx, c: colIdx });
  if (ws[addr]) ws[addr].s = style;
}

/**
 * Detect whether a number value lives in a column that holds money amounts.
 * We use column indices provided by the caller.
 */
function applyDefaultStyles(
  ws: XLSX.WorkSheet,
  moneyColIndices: number[],
  pctColIndices: number[] = [],
  sectionTitleRows: number[] = [],
  totalRows: number[] = [],
  totalMoneyCols: number[] = [],
): void {
  const range = XLSX.utils.decode_range(ws['!ref']!);

  for (let row = range.s.r; row <= range.e.r; row++) {
    // Section title rows
    if (sectionTitleRows.includes(row)) {
      styleRow(ws, row, STYLE_SECTION_TITLE);
      continue;
    }

    // Header row (row 0) — unless it's a section title
    if (row === 0) {
      styleRow(ws, row, STYLE_HEADER);
      continue;
    }

    // Total rows
    if (totalRows.includes(row)) {
      for (let col = range.s.c; col <= range.e.c; col++) {
        if (totalMoneyCols.includes(col)) {
          styleCell(ws, row, col, STYLE_TOTAL_MONEY);
        } else {
          styleCell(ws, row, col, STYLE_TOTAL);
        }
      }
      continue;
    }

    // Regular data rows — alternating background
    const isAlt = row % 2 === 0;

    for (let col = range.s.c; col <= range.e.c; col++) {
      if (pctColIndices.includes(col)) {
        styleCell(ws, row, col, STYLE_PCT);
      } else if (moneyColIndices.includes(col)) {
        styleCell(ws, row, col, isAlt ? STYLE_MONEY_ALT : STYLE_MONEY);
      } else {
        styleCell(ws, row, col, isAlt ? STYLE_CELL_ALT : STYLE_CELL);
      }
    }
  }
}

// ─── Main export function ─────────────────────────────────────────────────────

export function generateExcel(data: Previsionnel, synthese: Synthese): void {
  const wb = XLSX.utils.book_new();
  const moisLabels36 = getLabelsNomsMois(data.projet.dateCreationEnvisagee, 'court');

  // ─── 1. Présentation ──────────────────────────────────────────────────────
  {
    const rows: (string | number)[][] = [
      ['Champ', 'Valeur'],
      ['Porteur de projet', data.projet.nomPorteur],
      ['Société', data.projet.nomSociete],
      ['Date de création envisagée', data.projet.dateCreationEnvisagee],
      ['Activité principale', data.projet.activitePrincipale],
      ['Statut juridique', labelStatut(data.statut.statutJuridique)],
      ['Type d\'activité', labelTypeActivite(data.projet.typeActivite)],
      ['Adresse', data.projet.adresse],
      ['Description de l\'offre', data.projet.descriptionOffre],
      ['Marché cible', data.projet.descriptionMarche],
      ['Stratégie commerciale', data.projet.strategie],
    ];
    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [{ wch: 30 }, { wch: 60 }];
    ws['!rows'] = [{ hpt: 30 }];

    applyDefaultStyles(ws, [], [], [], []);

    XLSX.utils.book_append_sheet(wb, ws, 'Présentation');
  }

  // ─── 2. Investissements ───────────────────────────────────────────────────
  {
    const header = ['Description', 'Montant (€)', 'Trimestre', 'Année', 'Amortissement (ans)'];
    const rows: (string | number)[][] = [header];
    let total = 0;
    for (const inv of data.investissements) {
      rows.push([inv.description, r(inv.montant), inv.trimestre, inv.annee, inv.dureeAmortissement]);
      total += inv.montant;
    }
    const totalRowIdx = rows.length;
    rows.push(['TOTAL', r(total), '', '', '']);

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [{ wch: 35 }, { wch: 15 }, { wch: 12 }, { wch: 10 }, { wch: 20 }];
    ws['!rows'] = [{ hpt: 30 }];

    // Money column: index 1 (Montant)
    applyDefaultStyles(ws, [1], [], [], [totalRowIdx], [1]);

    XLSX.utils.book_append_sheet(wb, ws, 'Investissements');
  }

  // ─── 3. Financement ───────────────────────────────────────────────────────
  {
    const header = ['Source', 'Montant (€)'];
    const rows: (string | number)[][] = [header];
    rows.push(['Capital social', r(data.financements.capital)]);
    rows.push(['Apports personnels', r(data.financements.apports)]);
    for (const emprunt of data.financements.emprunts) {
      const detail = `Emprunt — ${emprunt.description} (${emprunt.dureeMois} mois, ${emprunt.tauxAnnuel.toFixed(2)}%)`;
      rows.push([detail, r(emprunt.montant)]);
    }
    rows.push(['Subventions', r(data.financements.subventions)]);
    const totalFin =
      data.financements.capital +
      data.financements.apports +
      data.financements.emprunts.reduce((s, e) => s + e.montant, 0) +
      data.financements.subventions;
    const totalRowIdx = rows.length;
    rows.push(['TOTAL', r(totalFin)]);

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [{ wch: 50 }, { wch: 15 }];
    ws['!rows'] = [{ hpt: 30 }];

    applyDefaultStyles(ws, [1], [], [], [totalRowIdx], [1]);

    XLSX.utils.book_append_sheet(wb, ws, 'Financement');
  }

  // ─── 4. Chiffre d'affaires ────────────────────────────────────────────────
  {
    const monthHeaders = moisLabels36;
    const header = ['Offre', ...monthHeaders, 'Total'];
    const rows: (string | number)[][] = [header];

    const caTotal = Array(36).fill(0);

    for (const offre of data.offres) {
      const ventes = data.ventes[offre.id] ?? Array(36).fill(0);
      const monthly = ventes.map((v) => r(v * offre.prixUnitaireHT));
      const total = monthly.reduce((s: number, v: number) => s + v, 0);
      monthly.forEach((v: number, i: number) => { caTotal[i] += v; });
      rows.push([offre.nom, ...monthly, r(total)]);
    }

    const grandTotal = caTotal.reduce((s, v) => s + v, 0);
    const totalRowIdx = rows.length;
    rows.push(['TOTAL', ...caTotal.map(r), r(grandTotal)]);

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [{ wch: 30 }, ...Array(37).fill({ wch: 10 })];
    ws['!rows'] = [{ hpt: 30 }];

    // Columns 1..37 are money (month columns + total)
    const moneyCols = Array.from({ length: 37 }, (_, i) => i + 1);
    applyDefaultStyles(ws, moneyCols, [], [], [totalRowIdx], moneyCols);

    XLSX.utils.book_append_sheet(wb, ws, "Chiffre d'affaires");
  }

  // ─── 5. Charges ───────────────────────────────────────────────────────────
  {
    const rows: (string | number)[][] = [];

    // Fixed charges section
    // Row 0: section title
    rows.push(['CHARGES FIXES', '', '', '', '', '']);
    // Row 1: column headers
    rows.push([
      'Description',
      'Annuel Année 1',
      'Évolution An2 (%)',
      'Annuel Année 2',
      'Évolution An3 (%)',
      'Annuel Année 3',
    ]);
    for (const cf of data.chargesFixes) {
      // evolutionAn2/3 are stored as percentages (e.g. 5 means 5%)
      const an2 = cf.montantAnnuel * (1 + cf.evolutionAn2 / 100);
      const an3 = an2 * (1 + cf.evolutionAn3 / 100);
      rows.push([
        cf.description,
        r(cf.montantAnnuel),
        r(cf.evolutionAn2),   // already a percentage value, no * 100
        r(an2),
        r(cf.evolutionAn3),   // already a percentage value, no * 100
        r(an3),
      ]);
    }

    // Totals row for fixed charges
    const totAn1 = data.chargesFixes.reduce((s, c) => s + c.montantAnnuel, 0);
    const totAn2 = data.chargesFixes.reduce((s, c) => s + c.montantAnnuel * (1 + c.evolutionAn2 / 100), 0);
    const totAn3 = data.chargesFixes.reduce(
      (s, c) => s + c.montantAnnuel * (1 + c.evolutionAn2 / 100) * (1 + c.evolutionAn3 / 100),
      0,
    );
    const totalFixesRowIdx = rows.length;
    rows.push(['TOTAL CHARGES FIXES', r(totAn1), '', r(totAn2), '', r(totAn3)]);

    rows.push([]); // blank separator

    // Variable charges section title
    const cvSectionIdx = rows.length;
    rows.push(['CHARGES VARIABLES', '', '', '', '', '']);
    // Variable charges header — treated as row 1 equivalent (STYLE_HEADER applied manually)
    const cvHeaderIdx = rows.length;
    rows.push(['Offre associée', 'Description', 'Coût unitaire (€)', '', '', '']);
    for (const cv of data.chargesVariables) {
      const offre = data.offres.find((o) => o.id === cv.offreId);
      rows.push([offre?.nom ?? cv.offreId, cv.description, r(cv.coutUnitaire), '', '', '']);
    }

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [{ wch: 35 }, { wch: 16 }, { wch: 18 }, { wch: 16 }, { wch: 18 }, { wch: 16 }];
    ws['!rows'] = [{ hpt: 20 }, { hpt: 30 }];

    // The Charges sheet has a complex layout: no single header row 0 rule.
    // Apply manually.
    const range = XLSX.utils.decode_range(ws['!ref']!);
    for (let row = range.s.r; row <= range.e.r; row++) {
      if (row === 0) {
        // "CHARGES FIXES" section title
        styleRow(ws, row, STYLE_SECTION_TITLE);
      } else if (row === 1) {
        // Column headers for fixed charges
        styleRow(ws, row, STYLE_HEADER);
      } else if (row === totalFixesRowIdx) {
        // Total row for fixed charges
        for (let col = range.s.c; col <= range.e.c; col++) {
          if ([1, 3, 5].includes(col)) {
            styleCell(ws, row, col, STYLE_TOTAL_MONEY);
          } else {
            styleCell(ws, row, col, STYLE_TOTAL);
          }
        }
      } else if (row === cvSectionIdx) {
        // "CHARGES VARIABLES" section title
        styleRow(ws, row, STYLE_SECTION_TITLE);
      } else if (row === cvHeaderIdx) {
        // Column headers for variable charges
        styleRow(ws, row, STYLE_HEADER);
      } else {
        // Regular data rows
        const isAlt = row % 2 === 0;
        for (let col = range.s.c; col <= range.e.c; col++) {
          if ([2, 4].includes(col) && row > 1 && row < totalFixesRowIdx) {
            // percentage columns (évolution)
            styleCell(ws, row, col, STYLE_PCT);
          } else if ([1, 3, 5].includes(col)) {
            styleCell(ws, row, col, isAlt ? STYLE_MONEY_ALT : STYLE_MONEY);
          } else {
            styleCell(ws, row, col, isAlt ? STYLE_CELL_ALT : STYLE_CELL);
          }
        }
      }
    }

    XLSX.utils.book_append_sheet(wb, ws, 'Charges');
  }

  // ─── 6. Rémunération ──────────────────────────────────────────────────────
  {
    const rows: (string | number)[][] = [];
    rows.push(['DIRIGEANT', 'Année 1', 'Année 2', 'Année 3']);

    const caAnnuel = [0, 1, 2].map((a) => {
      let ca = 0;
      for (const offre of data.offres) {
        const ventes = data.ventes[offre.id] ?? Array(36).fill(0);
        for (let m = a * 12; m < (a + 1) * 12; m++) {
          ca += (ventes[m] ?? 0) * offre.prixUnitaireHT;
        }
      }
      return ca;
    });

    const salaires = [0, 1, 2].map((a) =>
      r(
        data.remunerationDirigeant.salaireBrutAnnuel *
          Math.pow(1 + data.remunerationDirigeant.augmentationAnnuelle / 100, a),
      ),
    );

    const cotisations = [0, 1, 2].map((a) => {
      const salaire = salaires[a];
      if (data.statut.statutJuridique === 'micro') {
        return r(calculerCotisationsDirigeant(data.statut, data.projet.typeActivite, caAnnuel[a], 0));
      }
      return r(calculerCotisationsDirigeant(data.statut, data.projet.typeActivite, 0, salaire));
    });

    const couts = [0, 1, 2].map((a) => r(salaires[a] + cotisations[a]));

    let totalRowIdx = -1;
    if (data.statut.statutJuridique === 'micro') {
      rows.push(['Cotisations sociales (sur CA)', ...cotisations]);
      totalRowIdx = rows.length;
      rows.push(['Coût total', ...cotisations]);
    } else {
      rows.push(['Salaire brut annuel', ...salaires]);
      rows.push(['Cotisations sociales', ...cotisations]);
      totalRowIdx = rows.length;
      rows.push(['Coût total chargé', ...couts]);
    }

    let salariesSectionIdx = -1;
    let coutSalariesLabelIdx = -1;
    let coutSalariesValueIdx = -1;

    if (data.salaries.length > 0) {
      rows.push([]);
      salariesSectionIdx = rows.length;
      rows.push(['SALARIÉS', 'Poste', 'Salaire brut', 'Date embauche', 'Augm. annuelle', '']);
      for (const sal of data.salaries) {
        rows.push([
          '',
          sal.poste,
          r(sal.salaireBrutAnnuel),
          `T${sal.dateEmbauche.trimestre} An${sal.dateEmbauche.annee}`,
          `${sal.augmentationAnnuelle.toFixed(1)}%`,
          '',
        ]);
      }

      rows.push([]);
      coutSalariesLabelIdx = rows.length;
      rows.push(['Coût employeur annuel (salariés)', 'Année 1', 'Année 2', 'Année 3']);
      const coutSalaries = [0, 1, 2].map((a) => {
        const anneeProjet = a + 1;
        let total = 0;
        for (const sal of data.salaries) {
          if (anneeProjet < sal.dateEmbauche.annee) continue;
          const anneesExp = anneeProjet - sal.dateEmbauche.annee;
          const salaire = sal.salaireBrutAnnuel * Math.pow(1 + sal.augmentationAnnuelle / 100, anneesExp);
          let prorata = 1;
          if (anneeProjet === sal.dateEmbauche.annee) {
            prorata = (5 - sal.dateEmbauche.trimestre) / 4;
          }
          total += calculerCoutEmployeur(salaire) * prorata;
        }
        return r(total);
      });
      coutSalariesValueIdx = rows.length;
      rows.push(['', ...coutSalaries]);
    }

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [{ wch: 35 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 18 }, { wch: 10 }];
    ws['!rows'] = [{ hpt: 30 }];

    const range = XLSX.utils.decode_range(ws['!ref']!);
    const moneyCols = [1, 2, 3];

    for (let row = range.s.r; row <= range.e.r; row++) {
      if (row === 0) {
        styleRow(ws, row, STYLE_HEADER);
      } else if (row === totalRowIdx) {
        for (let col = range.s.c; col <= range.e.c; col++) {
          styleCell(ws, row, col, moneyCols.includes(col) ? STYLE_TOTAL_MONEY : STYLE_TOTAL);
        }
      } else if (row === salariesSectionIdx) {
        styleRow(ws, row, STYLE_SECTION_TITLE);
      } else if (row === coutSalariesLabelIdx) {
        styleRow(ws, row, STYLE_HEADER);
      } else if (row === coutSalariesValueIdx) {
        for (let col = range.s.c; col <= range.e.c; col++) {
          styleCell(ws, row, col, moneyCols.includes(col) ? STYLE_TOTAL_MONEY : STYLE_TOTAL);
        }
      } else {
        const isAlt = row % 2 === 0;
        for (let col = range.s.c; col <= range.e.c; col++) {
          styleCell(ws, row, col, moneyCols.includes(col)
            ? (isAlt ? STYLE_MONEY_ALT : STYLE_MONEY)
            : (isAlt ? STYLE_CELL_ALT : STYLE_CELL));
        }
      }
    }

    XLSX.utils.book_append_sheet(wb, ws, 'Rémunération');
  }

  // ─── 7. Compte de résultat ────────────────────────────────────────────────
  {
    const rows: (string | number)[][] = [];
    rows.push(['Description', 'Année 1', 'Année 2', 'Année 3']);

    const labels: Array<[string, keyof (typeof synthese.resultatsAnnuels)[0], boolean]> = [
      ["Chiffre d'affaires HT", 'chiffreAffairesHT', false],
      ['Charges variables', 'chargesVariablesTotal', false],
      ['Marge brute', 'margeBrute', true],
      ['Charges externes', 'chargesExternesTotal', false],
      ['Charges de personnel', 'chargesPersonnelTotal', false],
      ['EBE (Excédent Brut d\'Exploitation)', 'ebe', true],
      ['Dotations aux amortissements', 'dotationsAmortissements', false],
      ["Résultat d'exploitation", 'resultatExploitation', true],
      ['Charges financières', 'chargesFinancieres', false],
      ['Résultat avant impôt', 'resultatAvantImpot', true],
      ['Impôts et taxes', 'impot', false],
      ['Résultat net', 'resultatNet', true],
    ];

    const totalRowIndices: number[] = [];

    for (const [label, key, isTotal] of labels) {
      if (isTotal) totalRowIndices.push(rows.length);
      const vals = synthese.resultatsAnnuels.map((ra) => r(ra[key] as number));
      rows.push([label, ...vals]);
    }

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [{ wch: 40 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];
    ws['!rows'] = [{ hpt: 30 }];

    const moneyCols = [1, 2, 3];
    applyDefaultStyles(ws, moneyCols, [], [], totalRowIndices, moneyCols);

    XLSX.utils.book_append_sheet(wb, ws, 'Compte de résultat');
  }

  // ─── 8. Trésorerie ────────────────────────────────────────────────────────
  {
    const monthHeaders = moisLabels36;
    const header = ['Description', ...monthHeaders];
    const rows: (string | number)[][] = [header];

    type TKey = keyof (typeof synthese.tresorerie)[0];

    const isMicro = data.statut.statutJuridique === 'micro';

    const tresoLines: Array<[string, TKey, boolean]> = [
      ['Trésorerie début de période', 'tresorerieDebut', false],
      ['Financements reçus', 'financementsRecus', false],
      ['Encaissements', 'encaissements', false],
      ['Décaissements charges fixes', 'decaissementsCharges', false],
      ['Décaissements charges variables', 'decaissementsChargesVariables', false],
      ['Décaissements personnel', 'decaissementsPersonnel', false],
      ['Décaissements investissements', 'decaissementsInvestissements', false],
      ['Remboursements emprunts', 'remboursementsEmprunts', false],
      ['Impôts', 'decaissementsImpot', false],
      ...(!isMicro ? [['TVA à reverser', 'tvaAReverser', false] as [string, TKey, boolean]] : []),
      ['Trésorerie fin de période', 'tresorerieFin', true],
    ];

    const totalRowIndices: number[] = [];

    for (const [label, key, isTotal] of tresoLines) {
      if (isTotal) totalRowIndices.push(rows.length);
      const vals = synthese.tresorerie.map((t) => r(t[key] as number));
      rows.push([label, ...vals]);
    }

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [{ wch: 35 }, ...Array(36).fill({ wch: 11 })];
    ws['!rows'] = [{ hpt: 30 }];

    // Columns 1..36 are money
    const moneyCols = Array.from({ length: 36 }, (_, i) => i + 1);
    applyDefaultStyles(ws, moneyCols, [], [], totalRowIndices, moneyCols);

    XLSX.utils.book_append_sheet(wb, ws, 'Trésorerie');
  }

  // ─── Download ─────────────────────────────────────────────────────────────
  const filename = `Previsionnel-${data.projet.nomPorteur.replace(/\s+/g, '-')}.xlsx`;
  XLSX.writeFile(wb, filename);
}
