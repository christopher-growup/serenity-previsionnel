import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Previsionnel, Synthese } from '../types';
import { getLabelsNomsMois } from './mois';
import { saveFileWithDialog } from './download';

const BRAND_COLOR: [number, number, number] = [41, 98, 136];
const LIGHT_GRAY: [number, number, number] = [245, 245, 245];
const DARK_GRAY: [number, number, number] = [80, 80, 80];

function formatEuros(value: number): string {
  const isNeg = value < 0;
  const abs = Math.abs(Math.round(value));
  const str = abs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return (isNeg ? '-' : '') + str + ' €';
}

function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function addHeaderFooter(doc: jsPDF, nomSociete: string): void {
  const pageCount = (doc as jsPDF & { internal: { getNumberOfPages: () => number } }).internal.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    // Header
    doc.setFillColor(...BRAND_COLOR);
    doc.rect(0, 0, pageWidth, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`Prévisionnel Financier — ${nomSociete}`, 10, 8);

    // Footer
    doc.setFillColor(...LIGHT_GRAY);
    doc.rect(0, pageHeight - 10, pageWidth, 10, 'F');
    doc.setTextColor(...DARK_GRAY);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Page ${i} / ${pageCount}  —  Serenity Institut`, pageWidth / 2, pageHeight - 3, { align: 'center' });
  }
}

function addPageDeGarde(doc: jsPDF, data: Previsionnel): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Background band
  doc.setFillColor(...BRAND_COLOR);
  doc.rect(0, 50, pageWidth, 60, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('Prévisionnel Financier', pageWidth / 2, 78, { align: 'center' });

  // Info block
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(20, 125, pageWidth - 40, 90, 4, 4, 'F');

  doc.setTextColor(...BRAND_COLOR);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Informations du projet', 30, 143);

  const labelX = 30;
  const valueX = 95;
  let y = 158;
  const lineH = 12;

  const rows: [string, string][] = [
    ['Porteur :', data.projet.nomPorteur],
    ['Société :', data.projet.nomSociete],
    ['Statut :', data.statut.statutJuridique.toUpperCase()],
    ['Date :', formatDate(new Date())],
  ];

  doc.setFontSize(11);
  for (const [label, value] of rows) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...BRAND_COLOR);
    doc.text(label, labelX, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...DARK_GRAY);
    doc.text(value, valueX, y);
    y += lineH;
  }

  // Footer mention
  doc.setFontSize(10);
  doc.setTextColor(...DARK_GRAY);
  doc.setFont('helvetica', 'italic');
  doc.text('Document généré par Serenity Institut', pageWidth / 2, pageHeight - 20, { align: 'center' });
}

function addPresentationProjet(doc: jsPDF, data: Previsionnel): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BRAND_COLOR);
  doc.text('Présentation du projet', 10, y);
  y += 8;

  doc.setDrawColor(...BRAND_COLOR);
  doc.setLineWidth(0.5);
  doc.line(10, y, pageWidth - 10, y);
  y += 10;

  const sections: [string, string][] = [
    ["Activité principale", data.projet.activitePrincipale],
    ["Description de l'offre", data.projet.descriptionOffre],
    ["Description du marché", data.projet.descriptionMarche],
    ["Stratégie de développement", data.projet.strategie],
  ];

  for (const [title, content] of sections) {
    if (!content) continue;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...BRAND_COLOR);
    doc.text(title, 10, y);
    y += 6;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...DARK_GRAY);

    const lines = doc.splitTextToSize(content, pageWidth - 20) as string[];
    for (const line of lines) {
      if (y > doc.internal.pageSize.getHeight() - 20) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, 10, y);
      y += 5;
    }
    y += 6;
  }
}

function addPlanFinancement(doc: jsPDF, data: Previsionnel): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BRAND_COLOR);
  doc.text('Plan de financement', 10, y);
  y += 8;

  doc.setDrawColor(...BRAND_COLOR);
  doc.setLineWidth(0.5);
  doc.line(10, y, pageWidth - 10, y);
  y += 8;

  // Investments table
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BRAND_COLOR);
  doc.text('Investissements', 10, y);
  y += 4;

  const investRows = data.investissements.map(inv => [
    inv.description,
    formatEuros(inv.montant),
    `Année ${inv.annee}`,
    `T${inv.trimestre}`,
  ]);

  autoTable(doc, {
    startY: y,
    head: [['Description', 'Montant', 'Année', 'Trimestre']],
    body: investRows.length > 0 ? investRows : [['Aucun investissement', '', '', '']],
    theme: 'grid',
    headStyles: { fillColor: BRAND_COLOR, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 10 },
    bodyStyles: { fontSize: 9, textColor: DARK_GRAY },
    alternateRowStyles: { fillColor: LIGHT_GRAY },
    margin: { left: 10, right: 10 },
  });

  y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  // Financing sources
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BRAND_COLOR);
  doc.text('Sources de financement', 10, y);
  y += 4;

  const { capital, apports, emprunts, subventions } = data.financements;
  const totalEmprunts = emprunts.reduce((sum, e) => sum + e.montant, 0);

  const financingRows: [string, string][] = [
    ['Capital social', formatEuros(capital)],
    ['Apports personnels', formatEuros(apports)],
    ['Emprunts bancaires', formatEuros(totalEmprunts)],
    ['Subventions', formatEuros(subventions)],
    ['TOTAL', formatEuros(capital + apports + totalEmprunts + subventions)],
  ];

  autoTable(doc, {
    startY: y,
    head: [['Source', 'Montant']],
    body: financingRows,
    theme: 'grid',
    headStyles: { fillColor: BRAND_COLOR, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 10 },
    bodyStyles: { fontSize: 9, textColor: DARK_GRAY },
    alternateRowStyles: { fillColor: LIGHT_GRAY },
    margin: { left: 10, right: 10 },
    didParseCell: (data) => {
      if (data.row.index === financingRows.length - 1) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [220, 234, 245];
      }
    },
  });

  // Detail emprunts if any
  if (emprunts.length > 0) {
    y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...BRAND_COLOR);
    doc.text('Détail des emprunts', 10, y);
    y += 4;

    autoTable(doc, {
      startY: y,
      head: [['Description', 'Montant', 'Durée (mois)', 'Taux annuel']],
      body: emprunts.map(e => [
        e.description,
        formatEuros(e.montant),
        `${e.dureeMois} mois`,
        `${e.tauxAnnuel.toFixed(2)} %`,
      ]),
      theme: 'grid',
      headStyles: { fillColor: BRAND_COLOR, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 10 },
      bodyStyles: { fontSize: 9, textColor: DARK_GRAY },
      alternateRowStyles: { fillColor: LIGHT_GRAY },
      margin: { left: 10, right: 10 },
    });
  }
}

function addCompteResultat(doc: jsPDF, synthese: Synthese): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BRAND_COLOR);
  doc.text('Compte de résultat prévisionnel', 10, y);
  y += 8;

  doc.setDrawColor(...BRAND_COLOR);
  doc.setLineWidth(0.5);
  doc.line(10, y, pageWidth - 10, y);
  y += 8;

  const years = synthese.resultatsAnnuels;
  const an = (idx: number) => years[idx] ?? null;

  type RowDef = {
    label: string;
    key: keyof import('../types').ResultatAnnuel;
    bold?: boolean;
    separator?: boolean;
  };

  const rowDefs: RowDef[] = [
    { label: "Chiffre d'affaires HT", key: 'chiffreAffairesHT', bold: true },
    { label: 'Charges variables', key: 'chargesVariablesTotal' },
    { label: 'Marge brute', key: 'margeBrute', bold: true },
    { label: 'Charges externes', key: 'chargesExternesTotal' },
    { label: 'Charges de personnel', key: 'chargesPersonnelTotal' },
    { label: 'EBE', key: 'ebe', bold: true },
    { label: 'Amortissements', key: 'dotationsAmortissements' },
    { label: "Résultat d'exploitation", key: 'resultatExploitation', bold: true },
    { label: 'Charges financières', key: 'chargesFinancieres' },
    { label: "Résultat avant impôt", key: 'resultatAvantImpot', bold: true },
    { label: 'Impôt', key: 'impot' },
    { label: 'Résultat net', key: 'resultatNet', bold: true },
  ];

  const head = [['Description', 'Année 1', 'Année 2', 'Année 3']];
  const body = rowDefs.map(({ label, key }) => [
    label,
    an(0) ? formatEuros(an(0)![key] as number) : '—',
    an(1) ? formatEuros(an(1)![key] as number) : '—',
    an(2) ? formatEuros(an(2)![key] as number) : '—',
  ]);

  const boldRows = new Set(rowDefs.map((r, i) => r.bold ? i : -1).filter(i => i >= 0));

  autoTable(doc, {
    startY: y,
    head,
    body,
    theme: 'grid',
    headStyles: { fillColor: BRAND_COLOR, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 10 },
    bodyStyles: { fontSize: 9, textColor: DARK_GRAY },
    alternateRowStyles: { fillColor: LIGHT_GRAY },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { halign: 'right', overflow: 'linebreak' },
      2: { halign: 'right', overflow: 'linebreak' },
      3: { halign: 'right', overflow: 'linebreak' },
    },
    margin: { left: 10, right: 10 },
    didParseCell: (data) => {
      if (data.section === 'body' && boldRows.has(data.row.index)) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [220, 234, 245];
      }
    },
  });
}

function addPlanTresorerie(doc: jsPDF, synthese: Synthese, data: Previsionnel): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BRAND_COLOR);
  doc.text('Plan de trésorerie — Année 1', 10, y);
  y += 8;

  doc.setDrawColor(...BRAND_COLOR);
  doc.setLineWidth(0.5);
  doc.line(10, y, pageWidth - 10, y);
  y += 8;

  // Only year 1: months 1-12
  const year1 = synthese.tresorerie.filter(t => t.mois >= 1 && t.mois <= 12);

  const allMoisLabels = getLabelsNomsMois(data.projet.dateCreationEnvisagee, 'court');
  const months = allMoisLabels.slice(0, 12);
  const head = [['Description', ...months]];

  function buildRow(label: string, getter: (t: typeof year1[0]) => number): string[] {
    return [label, ...months.map((_, i) => {
      const t = year1.find(m => m.mois === i + 1);
      return t ? formatEuros(getter(t)) : '—';
    })];
  }

  const isMicro = data.statut.statutJuridique === 'micro';

  const body = [
    buildRow('Trésorerie début', t => t.tresorerieDebut),
    buildRow('Financements reçus', t => t.financementsRecus),
    buildRow('Encaissements', t => t.encaissements),
    buildRow('Charges fixes', t => t.decaissementsCharges),
    buildRow('Charges variables', t => t.decaissementsChargesVariables),
    buildRow('Personnel', t => t.decaissementsPersonnel),
    buildRow('Investissements', t => t.decaissementsInvestissements),
    buildRow('Remboursements', t => t.remboursementsEmprunts),
    buildRow('Impôts', t => t.decaissementsImpot),
    ...(!isMicro ? [buildRow('TVA à reverser', t => t.tvaAReverser)] : []),
    buildRow('Trésorerie fin', t => t.tresorerieFin),
  ];

  const boldRows = new Set([0, body.length - 1]);

  // Calculate column width: distribute remaining width after description column
  const descWidth = 30;
  const remaining = pageWidth - 20 - descWidth;
  const colW = remaining / 12;

  autoTable(doc, {
    startY: y,
    head,
    body,
    theme: 'grid',
    headStyles: { fillColor: BRAND_COLOR, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 6 },
    bodyStyles: { fontSize: 5.5, textColor: DARK_GRAY, overflow: 'linebreak' },
    alternateRowStyles: { fillColor: LIGHT_GRAY },
    columnStyles: {
      0: { cellWidth: descWidth },
      ...Object.fromEntries(months.map((_, i) => [i + 1, { cellWidth: colW, halign: 'right' as const, overflow: 'linebreak' as const }])),
    },
    margin: { left: 10, right: 10 },
    didParseCell: (data) => {
      if (data.section === 'body' && boldRows.has(data.row.index)) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [220, 234, 245];
      }
    },
  });
}

function addIndicateurs(doc: jsPDF, synthese: Synthese, data: Previsionnel): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BRAND_COLOR);
  doc.text('Indicateurs clés', 10, y);
  y += 8;

  doc.setDrawColor(...BRAND_COLOR);
  doc.setLineWidth(0.5);
  doc.line(10, y, pageWidth - 10, y);
  y += 10;

  const { indicateurs } = synthese;

  // Point mort par année
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BRAND_COLOR);
  doc.text('Point mort (seuil de rentabilité)', 10, y);
  y += 4;

  const pointMortBody: string[][] = indicateurs.pointMortEuros.map((pm, i) => [
    `Année ${i + 1}`,
    formatEuros(pm),
    synthese.resultatsAnnuels[i]
      ? `CA: ${formatEuros(synthese.resultatsAnnuels[i].chiffreAffairesHT)}`
      : '—',
  ]);

  autoTable(doc, {
    startY: y,
    head: [['Période', 'Point mort', 'CA réalisé']],
    body: pointMortBody.length > 0 ? pointMortBody : [['—', '—', '—']],
    theme: 'grid',
    headStyles: { fillColor: BRAND_COLOR, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 10 },
    bodyStyles: { fontSize: 9, textColor: DARK_GRAY },
    alternateRowStyles: { fillColor: LIGHT_GRAY },
    margin: { left: 10, right: 10 },
  });

  y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

  // Point mort mois
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...DARK_GRAY);
  const moisText = indicateurs.pointMortMois !== null
    ? `Point mort atteint au mois ${indicateurs.pointMortMois} de l'activité.`
    : "Point mort non atteint sur la période prévisionnelle.";
  doc.text(moisText, 10, y);
  y += 12;

  // Ratios
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BRAND_COLOR);
  doc.text('Ratios financiers', 10, y);
  y += 4;

  const ratioBody: string[][] = indicateurs.ratioDetteCapital.map((rdc, i) => [
    `Année ${i + 1}`,
    rdc.toFixed(2),
    indicateurs.ratioDetteResultat[i]?.toFixed(2) ?? '—',
  ]);

  autoTable(doc, {
    startY: y,
    head: [['Période', 'Dette / Capital', 'Dette / Résultat net']],
    body: ratioBody.length > 0 ? ratioBody : [['—', '—', '—']],
    theme: 'grid',
    headStyles: { fillColor: BRAND_COLOR, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 10 },
    bodyStyles: { fontSize: 9, textColor: DARK_GRAY },
    alternateRowStyles: { fillColor: LIGHT_GRAY },
    margin: { left: 10, right: 10 },
  });

  y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  // Alertes
  if (synthese.alertes.length > 0) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(180, 50, 50);
    doc.text('Alertes', 10, y);
    y += 6;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...DARK_GRAY);
    for (const alerte of synthese.alertes) {
      const lines = doc.splitTextToSize(`• ${alerte}`, pageWidth - 20) as string[];
      for (const line of lines) {
        doc.text(line, 10, y);
        y += 5;
      }
    }
  }

  void data; // suppress unused warning — data available for future use
}

export async function generatePDF(data: Previsionnel, synthese: Synthese): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // Page 1: Page de garde
  addPageDeGarde(doc, data);

  // Page 2: Présentation du projet
  doc.addPage();
  addPresentationProjet(doc, data);

  // Page 3: Plan de financement
  doc.addPage();
  addPlanFinancement(doc, data);

  // Page 4: Compte de résultat
  doc.addPage();
  addCompteResultat(doc, synthese);

  // Page 5: Plan de trésorerie
  doc.addPage();
  addPlanTresorerie(doc, synthese, data);

  // Page 6: Indicateurs clés
  doc.addPage();
  addIndicateurs(doc, synthese, data);

  // Add header/footer to all pages
  addHeaderFooter(doc, data.projet.nomSociete);

  // Save with "Save As" dialog
  const filename = `Previsionnel-${(data.projet.nomPorteur || 'SansNom').replace(/\s+/g, '-')}.pdf`;
  const blob = doc.output('blob');
  await saveFileWithDialog(blob, filename, 'Document PDF', { 'application/pdf': ['.pdf'] });
}
