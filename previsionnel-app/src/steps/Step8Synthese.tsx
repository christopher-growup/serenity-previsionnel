import type { Previsionnel, Synthese, ResultatAnnuel } from '../types';
import AlertBanner from '../components/AlertBanner';
import { generatePDF } from '../utils/export-pdf';
import { generateExcel } from '../utils/export-excel';
import { getLabelsNomsMois } from '../utils/mois';
import {
  AreaChart, Area,
  BarChart, Bar,
  LineChart, Line,
  XAxis, YAxis, CartesianGrid,
  Tooltip as RechartTooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface Props {
  data: Previsionnel;
  synthese: Synthese | null;
  onSave: () => void;
}

function formatEur(n: number): string {
  return n.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';
}

function formatPct(n: number): string {
  return (n * 100).toFixed(1) + ' %';
}

function alertType(msg: string): 'warning' | 'info' {
  const lower = msg.toLowerCase();
  if (lower.includes('attention') || lower.includes('négatif') || lower.includes('negatif')) {
    return 'warning';
  }
  return 'info';
}

/* ── Compte de résultat ─────────────────────────────────── */
interface LigneResultat {
  label: string;
  key: keyof ResultatAnnuel;
  bold?: boolean;
  isNeg?: boolean;
}

const LIGNES_RESULTAT: LigneResultat[] = [
  { label: "Chiffre d'affaires HT", key: 'chiffreAffairesHT' },
  { label: 'Charges variables', key: 'chargesVariablesTotal', isNeg: true },
  { label: 'Marge brute', key: 'margeBrute', bold: true },
  { label: 'Charges externes', key: 'chargesExternesTotal', isNeg: true },
  { label: 'Charges de personnel', key: 'chargesPersonnelTotal', isNeg: true },
  { label: 'EBE', key: 'ebe', bold: true },
  { label: 'Dotations aux amortissements', key: 'dotationsAmortissements', isNeg: true },
  { label: "Résultat d'exploitation", key: 'resultatExploitation', bold: true },
  { label: 'Charges financières', key: 'chargesFinancieres', isNeg: true },
  { label: "Résultat avant impôt", key: 'resultatAvantImpot' },
  { label: 'Impôt', key: 'impot', isNeg: true },
  { label: 'Résultat net', key: 'resultatNet', bold: true },
];

/* ── Trésorerie helpers (kept for potential future use) ── */

export function Step8Synthese({ data, synthese, onSave }: Props) {
  if (!synthese) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Étape 8 — Synthèse</h2>
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center text-gray-500">
          Complétez les étapes précédentes pour voir votre synthèse.
        </div>
      </div>
    );
  }

  const { resultatsAnnuels, tresorerie, indicateurs, alertes } = synthese;

  /* ── Month labels ── */
  const moisLabels = getLabelsNomsMois(data.projet.dateCreationEnvisagee, 'court');

  /* ── Chart data ── */
  const caData = tresorerie.map((t, i) => ({
    mois: moisLabels[i] ?? `M${i + 1}`,
    encaissements: Math.round(t.encaissements),
  }));

  const resultatData = resultatsAnnuels.map((r) => ({
    annee: `Année ${r.annee}`,
    resultatNet: Math.round(r.resultatNet),
  }));

  const tresoData = tresorerie.map((t, i) => ({
    mois: moisLabels[i] ?? `M${i + 1}`,
    tresorerieFin: Math.round(t.tresorerieFin),
  }));

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Étape 8 — Synthèse</h2>
        <p className="text-sm text-gray-500">Vue d'ensemble de votre prévisionnel sur 3 ans</p>
      </div>

      {/* ── 1. Alertes ─────────────────────────────────────── */}
      {alertes.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-800">Alertes</h3>
          {alertes.map((msg, i) => (
            <AlertBanner key={i} type={alertType(msg)} message={msg} />
          ))}
        </section>
      )}

      {/* ── 2. Compte de résultat ──────────────────────────── */}
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">Compte de résultat prévisionnel</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Poste</th>
                {resultatsAnnuels.map((r) => (
                  <th key={r.annee} className="px-4 py-3 text-right font-semibold text-gray-700 min-w-[120px]">
                    Année {r.annee}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {LIGNES_RESULTAT.map(({ label, key, bold, isNeg }) => (
                <tr key={key} className={`border-b border-gray-100 ${bold ? 'bg-gray-50' : 'hover:bg-gray-50'}`}>
                  <td className={`px-4 py-3 ${bold ? 'font-semibold text-gray-800' : 'text-gray-600'}`}>
                    {isNeg && !bold && <span className="text-gray-400 mr-1">–</span>}
                    {label}
                  </td>
                  {resultatsAnnuels.map((r) => {
                    const val = r[key] as number;
                    const isResultatNet = key === 'resultatNet';
                    let colorClass = bold ? 'font-semibold text-gray-900' : 'text-gray-700';
                    if (isResultatNet) {
                      colorClass = val >= 0
                        ? 'font-bold text-green-600'
                        : 'font-bold text-red-600';
                    }
                    return (
                      <td key={r.annee} className={`px-4 py-3 text-right ${colorClass}`}>
                        {formatEur(val)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── 3. Indicateurs clés ────────────────────────────── */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Indicateurs clés</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Point mort */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-2">
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Point mort (seuil de rentabilité)</h4>
            {indicateurs.pointMortEuros.map((pm, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-500">Année {i + 1}</span>
                <span className="font-medium text-gray-900">{formatEur(pm)}</span>
              </div>
            ))}
            {indicateurs.pointMortMois !== null && (
              <p className="text-sm text-blue-600 font-medium mt-1">
                Atteint au mois {indicateurs.pointMortMois}
              </p>
            )}
          </div>

          {/* Ratios */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-2">
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Ratios financiers</h4>
            {resultatsAnnuels.map((_, i) => (
              <div key={i} className="space-y-1">
                <p className="text-xs font-medium text-gray-600">Année {i + 1}</p>
                <div className="flex justify-between text-sm pl-2">
                  <span className="text-gray-500">Dette / Capital</span>
                  <span className="font-medium text-gray-900">
                    {indicateurs.ratioDetteCapital[i] !== undefined
                      ? formatPct(indicateurs.ratioDetteCapital[i])
                      : '—'}
                  </span>
                </div>
                <div className="flex justify-between text-sm pl-2">
                  <span className="text-gray-500">Dette / Résultat</span>
                  <span className="font-medium text-gray-900">
                    {indicateurs.ratioDetteResultat[i] !== undefined
                      ? formatPct(indicateurs.ratioDetteResultat[i])
                      : '—'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Graphiques ──────────────────────────────────── */}
      <section className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-800">Graphiques</h3>

        {/* CA évolution */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-4">Évolution du CA mensuel (36 mois)</h4>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={caData} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradCA" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="mois" tick={{ fontSize: 11 }} interval={5} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <RechartTooltip formatter={(v) => formatEur(Number(v ?? 0))} labelFormatter={(l) => `Mois ${l}`} />
              <Area type="monotone" dataKey="encaissements" stroke="#3b82f6" fill="url(#gradCA)" name="CA" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Résultat net par année */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-4">Résultat net par année</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={resultatData} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="annee" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <RechartTooltip formatter={(v) => formatEur(Number(v ?? 0))} />
              <Bar
                dataKey="resultatNet"
                name="Résultat net"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Trésorerie fin de mois */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-4">Trésorerie fin de mois (36 mois)</h4>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={tresoData} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="mois" tick={{ fontSize: 11 }} interval={5} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <RechartTooltip formatter={(v) => formatEur(Number(v ?? 0))} />
              <Legend />
              <Line
                type="monotone"
                dataKey="tresorerieFin"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={false}
                name="Trésorerie fin"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* ── 5. Boutons export ──────────────────────────────── */}
      <section className="flex flex-col sm:flex-row gap-4">
        <button
          type="button"
          onClick={() => generatePDF(data, synthese)}
          disabled={!synthese}
          className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white text-base font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Télécharger le PDF
        </button>
        <button
          type="button"
          onClick={() => generateExcel(data, synthese)}
          disabled={!synthese}
          className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 bg-green-600 text-white text-base font-semibold rounded-xl hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Télécharger le fichier Excel
        </button>
      </section>

      {/* ── 6. Tableau de trésorerie — mensuel, mois en colonnes ── */}
      <section className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-800">Plan de trésorerie mensuel</h3>

        {[
          { label: 'Année 1', start: 0 },
          { label: 'Année 2', start: 12 },
          { label: 'Année 3', start: 24 },
        ].map(({ label, start }) => {
          const moisData = tresorerie.slice(start, start + 12);
          const labels = moisLabels.slice(start, start + 12);

          const isMicro = data.statut.statutJuridique === 'micro';
          const rows: { label: string; values: number[]; bold?: boolean; colorFn?: (v: number) => string }[] = [
            { label: 'Tréso. début', values: moisData.map(t => t.tresorerieDebut) },
            { label: 'Financements', values: moisData.map(t => t.financementsRecus) },
            { label: 'Encaissements', values: moisData.map(t => t.encaissements) },
            { label: 'Charges', values: moisData.map(t => -(t.decaissementsCharges + t.decaissementsChargesVariables)) },
            { label: 'Personnel', values: moisData.map(t => -t.decaissementsPersonnel) },
            { label: 'Invest.', values: moisData.map(t => -t.decaissementsInvestissements) },
            { label: 'Emprunts', values: moisData.map(t => -t.remboursementsEmprunts) },
            { label: 'Impôts', values: moisData.map(t => -t.decaissementsImpot) },
            ...(!isMicro ? [{ label: 'TVA à reverser', values: moisData.map(t => -t.tvaAReverser) }] : []),
            { label: 'Variation', values: moisData.map(t => t.tresorerieFin - t.tresorerieDebut), colorFn: (v: number) => v >= 0 ? 'text-green-600' : 'text-red-500' },
            { label: 'Tréso. fin', values: moisData.map(t => t.tresorerieFin), bold: true, colorFn: (v) => v >= 0 ? 'text-green-700' : 'text-red-600' },
          ];

          return (
            <div key={label} className="bg-white border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-3 py-2 border-b border-gray-100 bg-gray-50">
                <h4 className="text-sm font-semibold text-gray-700">{label}</h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-3 py-2 text-left font-semibold text-gray-500 whitespace-nowrap">Poste</th>
                      {labels.map((l, i) => (
                        <th key={i} className="px-2 py-2 text-right font-semibold text-gray-500 whitespace-nowrap">{l}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, ri) => (
                      <tr key={ri} className={`border-b border-gray-50 ${row.bold ? 'bg-gray-50' : ri % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                        <td className={`px-3 py-2 text-gray-600 whitespace-nowrap ${row.bold ? 'font-semibold' : ''}`}>{row.label}</td>
                        {row.values.map((v, ci) => (
                          <td key={ci} className={`px-2 py-2 text-right tabular-nums whitespace-nowrap ${row.bold ? 'font-semibold' : ''} ${row.colorFn ? row.colorFn(v) : v === 0 ? 'text-gray-300' : v < 0 ? 'text-red-400' : 'text-gray-700'}`}>
                            {v === 0 ? '–' : formatEur(v)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </section>

      {/* Bouton Enregistrer */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onSave}
          className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
        >
          Enregistrer
        </button>
      </div>
    </div>
  );
}

