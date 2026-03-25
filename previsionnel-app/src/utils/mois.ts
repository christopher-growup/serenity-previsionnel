const MOIS_COURTS = [
  'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin',
  'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc',
];

const MOIS_LONGS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

/**
 * Retourne les labels de mois réels pour les 36 mois du prévisionnel,
 * basés sur la date de création envisagée.
 *
 * @param dateCreation - ISO date string (ex: "2026-03-01") ou vide
 * @param format - 'court' pour "Jan 26", 'long' pour "Janvier 2026"
 * @returns tableau de 36 labels
 */
export function getLabelsNomsMois(
  dateCreation: string,
  format: 'court' | 'long' = 'court',
): string[] {
  const parsed = dateCreation ? new Date(dateCreation) : null;
  const startMonth = parsed && !isNaN(parsed.getTime()) ? parsed.getMonth() : 0; // 0 = janvier
  const startYear = parsed && !isNaN(parsed.getTime()) ? parsed.getFullYear() : new Date().getFullYear();

  const noms = format === 'court' ? MOIS_COURTS : MOIS_LONGS;
  const labels: string[] = [];

  for (let i = 0; i < 36; i++) {
    const moisIdx = (startMonth + i) % 12;
    const annee = startYear + Math.floor((startMonth + i) / 12);
    if (format === 'court') {
      labels.push(`${noms[moisIdx]} ${String(annee).slice(-2)}`);
    } else {
      labels.push(`${noms[moisIdx]} ${annee}`);
    }
  }

  return labels;
}

/**
 * Retourne les labels de mois pour un trimestre donné (3 labels).
 */
export function getLabelsTrimestre(
  dateCreation: string,
  anneeIdx: number,
  trimestreIdx: number,
): string[] {
  const all = getLabelsNomsMois(dateCreation, 'court');
  const start = anneeIdx * 12 + trimestreIdx * 3;
  return all.slice(start, start + 3);
}
