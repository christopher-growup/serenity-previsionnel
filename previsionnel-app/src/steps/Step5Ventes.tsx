import { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from 'recharts';
import type { Previsionnel } from '../types';
import AlertBanner from '../components/AlertBanner';
import { BAREMES } from '../config/baremes';
import { getLabelsNomsMois, getLabelsTrimestre } from '../utils/mois';

interface Props {
  data: Previsionnel;
  updateData: (partial: Partial<Previsionnel>) => void;
}

const ANNEES = [1, 2, 3] as const;

const QUARTER_LABELS = ['T1', 'T2', 'T3', 'T4'] as const;

const updateVente = (
  data: Previsionnel,
  updateData: Props['updateData'],
  offreId: string,
  mois: number,
  value: number
) => {
  const current = data.ventes[offreId] || Array(36).fill(0);
  const updated = [...current];
  updated[mois] = value;
  updateData({ ventes: { ...data.ventes, [offreId]: updated } });
};

const fillQuarter = (
  data: Previsionnel,
  updateData: Props['updateData'],
  offreId: string,
  annee: number,
  trimestre: number,
  totalQuarter: number
) => {
  const perMonth = Math.round(totalQuarter / 3);
  const current = data.ventes[offreId] || Array(36).fill(0);
  const updated = [...current];
  const startMonth = annee * 12 + (trimestre - 1) * 3;
  for (let i = 0; i < 3; i++) {
    updated[startMonth + i] = perMonth;
  }
  updateData({ ventes: { ...data.ventes, [offreId]: updated } });
};

const fillYear = (
  data: Previsionnel,
  updateData: Props['updateData'],
  offreId: string,
  anneeIdx: number,
  totalAnnuel: number
) => {
  const perMonth = Math.round(totalAnnuel / 12);
  const current = data.ventes[offreId] || Array(36).fill(0);
  const updated = [...current];
  const startMonth = anneeIdx * 12;
  for (let i = 0; i < 12; i++) {
    updated[startMonth + i] = perMonth;
  }
  updateData({ ventes: { ...data.ventes, [offreId]: updated } });
};

function formatEur(n: number): string {
  return n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
}

// ─── Bouton ÷3 avec saisie intégrée ─────────────────────────────────────────

interface QuarterFillInputProps {
  label: string;
  onFill: (value: number) => void;
}

function QuarterFillInput({ label, onFill }: QuarterFillInputProps) {
  const [val, setVal] = useState('');

  return (
    <div className="flex items-center gap-1">
      <input
        type="number"
        min={0}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder="Qté"
        className="w-14 border border-dashed border-blue-300 rounded px-1 py-0.5 text-xs text-center focus:outline-none focus:ring-1 focus:ring-blue-400"
        aria-label={`Remplir ${label} par trimestre`}
      />
      <button
        type="button"
        onClick={() => {
          const n = parseInt(val, 10);
          if (!isNaN(n) && n >= 0) {
            onFill(n);
            setVal('');
          }
        }}
        className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 rounded px-1.5 py-0.5 whitespace-nowrap transition-colors"
        title={`Divise la quantité par 3 et renseigne les 3 mois de ${label}`}
      >
        ÷3
      </button>
    </div>
  );
}

// ─── Grille par offre ────────────────────────────────────────────────────────

interface OffreGridProps {
  offreId: string;
  ventes: number[];
  data: Previsionnel;
  updateData: Props['updateData'];
}

function OffreGrid({ offreId, ventes, data, updateData }: OffreGridProps) {
  const [saisieMode, setSaisieMode] = useState<'mensuelle' | 'annuelle'>('mensuelle');
  const [activeAnnee, setActiveAnnee] = useState<1 | 2 | 3>(1);
  const [annualInputs, setAnnualInputs] = useState<Record<number, string>>({});

  const anneeIdx = activeAnnee - 1;
  const startMois = anneeIdx * 12;

  const quarterTotal = (q: number) => {
    const s = startMois + (q - 1) * 3;
    return (ventes[s] || 0) + (ventes[s + 1] || 0) + (ventes[s + 2] || 0);
  };

  const yearTotal = (idx: number) =>
    ventes.slice(idx * 12, idx * 12 + 12).reduce((s, v) => s + (v || 0), 0);

  return (
    <div className="space-y-4">
      {/* Toggle mode de saisie */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 font-medium">Mode de saisie :</span>
        <div className="flex rounded-lg overflow-hidden border border-gray-200 text-xs font-medium">
          <button
            type="button"
            onClick={() => setSaisieMode('mensuelle')}
            className={`px-3 py-1.5 transition-colors ${
              saisieMode === 'mensuelle'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Saisie mensuelle
          </button>
          <button
            type="button"
            onClick={() => setSaisieMode('annuelle')}
            className={`px-3 py-1.5 transition-colors ${
              saisieMode === 'annuelle'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Saisie annuelle
          </button>
        </div>
      </div>

      {/* ── Mode annuel ── */}
      {saisieMode === 'annuelle' && (
        <div className="grid grid-cols-3 gap-4">
          {[0, 1, 2].map((idx) => {
            const total = yearTotal(idx);
            const inputVal = annualInputs[idx] ?? (total > 0 ? String(total) : '');
            return (
              <div
                key={idx}
                className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex flex-col gap-2"
              >
                <div className="text-sm font-semibold text-gray-700">Année {idx + 1}</div>
                <input
                  type="number"
                  min={0}
                  value={inputVal}
                  placeholder="Quantité annuelle"
                  onChange={(e) => {
                    const raw = e.target.value;
                    setAnnualInputs((prev) => ({ ...prev, [idx]: raw }));
                    const n = parseInt(raw, 10);
                    if (!isNaN(n) && n >= 0) {
                      fillYear(data, updateData, offreId, idx, n);
                    }
                  }}
                  className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <div className="text-xs text-gray-400 text-center">
                  ≈ {total > 0 ? Math.round(total / 12) : 0} / mois — total&nbsp;: {total}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Mode mensuel ── */}
      {saisieMode === 'mensuelle' && (
        <div className="space-y-3">
          {/* Onglets années */}
          <div className="flex gap-1">
            {ANNEES.map((a) => {
              const total = yearTotal(a - 1);
              return (
                <button
                  key={a}
                  type="button"
                  onClick={() => setActiveAnnee(a)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    activeAnnee === a
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Année {a}
                  {total > 0 && (
                    <span
                      className={`ml-1.5 text-xs ${
                        activeAnnee === a ? 'text-blue-200' : 'text-gray-400'
                      }`}
                    >
                      ({total})
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* 4 cartes trimestres empilées verticalement */}
          <div className="space-y-2">
            {[1, 2, 3, 4].map((q) => {
              const qTotal = quarterTotal(q);
              return (
                <div
                  key={q}
                  className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 flex flex-wrap items-center gap-3"
                >
                  {/* Label trimestre */}
                  <div className="w-8 shrink-0">
                    <span className="text-xs font-bold text-gray-500">
                      {QUARTER_LABELS[q - 1]}
                    </span>
                  </div>

                  {/* 3 inputs mois */}
                  <div className="flex gap-2 flex-1 min-w-0">
                    {[0, 1, 2].map((offset) => {
                      const mIdx = startMois + (q - 1) * 3 + offset;
                      const label = getLabelsTrimestre(data.projet.dateCreationEnvisagee, anneeIdx, q - 1)[offset];
                      return (
                        <div key={offset} className="flex flex-col items-center gap-0.5">
                          <span className="text-[10px] text-gray-400">{label}</span>
                          <input
                            type="number"
                            min={0}
                            value={ventes[mIdx] || ''}
                            onChange={(e) =>
                              updateVente(
                                data,
                                updateData,
                                offreId,
                                mIdx,
                                parseInt(e.target.value, 10) || 0
                              )
                            }
                            className="w-16 border border-gray-200 rounded px-1 py-1 text-center text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"
                          />
                        </div>
                      );
                    })}
                  </div>

                  {/* Total trimestre */}
                  <div className="flex flex-col items-center shrink-0">
                    <span className="text-[10px] text-gray-400">Total</span>
                    <span className="text-sm font-semibold text-gray-700 w-10 text-center">
                      {qTotal}
                    </span>
                  </div>

                  {/* Bouton ÷3 */}
                  <div className="shrink-0">
                    <QuarterFillInput
                      label={QUARTER_LABELS[q - 1]}
                      onFill={(v) => fillQuarter(data, updateData, offreId, anneeIdx, q, v)}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Total année */}
          <div className="flex justify-end">
            <span className="text-sm text-gray-500">
              Total Année {activeAnnee} :{' '}
              <strong className="text-blue-700">{yearTotal(anneeIdx)}</strong> unités
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Composant principal ─────────────────────────────────────────────────────

export function Step5Ventes({ data, updateData }: Props) {
  // CA annuel total sur 36 mois
  const caParAnnee = [0, 1, 2].map((anneeIdx) => {
    const start = anneeIdx * 12;
    return data.offres.reduce((sum, offre) => {
      const v = data.ventes[offre.id] || [];
      const qty = v.slice(start, start + 12).reduce((s, x) => s + (x || 0), 0);
      return sum + qty * offre.prixUnitaireHT;
    }, 0);
  });

  // Alerte dépassement plafond micro
  const isMicro = data.statut.statutJuridique === 'micro';
  const typeActivite = data.projet.typeActivite;
  const plafondMicro =
    typeActivite === 'vente_bic'
      ? BAREMES.plafondsMicro.vente
      : BAREMES.plafondsMicro.services;

  const anneeDepassement = isMicro
    ? caParAnnee.findIndex((ca) => ca > plafondMicro)
    : -1;

  // Chart data : CA mensuel (quantité × prix)
  const moisLabels = getLabelsNomsMois(data.projet.dateCreationEnvisagee, 'court');
  const chartData = Array.from({ length: 36 }, (_, m) => ({
    mois: moisLabels[m],
    ca: data.offres.reduce((sum, offre) => {
      const v = data.ventes[offre.id]?.[m] || 0;
      return sum + v * offre.prixUnitaireHT;
    }, 0),
  }));

  if (data.offres.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">Étape 5 — Ventes prévisionnelles</h2>
        <AlertBanner
          type="warning"
          message="Veuillez d'abord définir vos offres à l'étape 3."
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Étape 5 — Ventes prévisionnelles</h2>

      <p className="text-gray-600 text-sm">
        Renseignez le nombre d'unités vendues (ou heures prestées) pour chacune de vos offres.
        Choisissez la <strong>saisie annuelle</strong> pour une répartition automatique sur 12 mois,
        ou la <strong>saisie mensuelle</strong> pour un détail par trimestre.
        Le bouton <strong>÷3</strong> répartit une quantité trimestrielle uniformément sur 3 mois.
      </p>

      {/* Alerte plafond micro */}
      {isMicro && anneeDepassement !== -1 && (
        <AlertBanner
          type="warning"
          message={`Attention : votre chiffre d'affaires prévisionnel de l'année ${anneeDepassement + 1} (${formatEur(caParAnnee[anneeDepassement])}) dépasse le plafond micro-entreprise de ${formatEur(plafondMicro)}. Vous devrez peut-être changer de statut.`}
        />
      )}

      {/* Grille par offre */}
      {data.offres.map((offre) => {
        const ventes = data.ventes[offre.id] || Array(36).fill(0);
        return (
          <div key={offre.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-baseline gap-3 mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{offre.nom}</h3>
              <span className="text-sm text-gray-500">
                {formatEur(offre.prixUnitaireHT)} HT / unité
              </span>
            </div>
            <OffreGrid
              offreId={offre.id}
              ventes={ventes}
              data={data}
              updateData={updateData}
            />
          </div>
        );
      })}

      {/* Récapitulatif CA par année */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="text-base font-semibold text-blue-800 mb-3">Récapitulatif CA prévisionnel (HT)</h3>
        <div className="grid grid-cols-3 gap-4">
          {caParAnnee.map((ca, i) => (
            <div key={i} className="text-center">
              <div className="text-xs text-blue-600 mb-1">Année {i + 1}</div>
              <div className="text-xl font-bold text-blue-900">{formatEur(ca)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Graphique évolution CA mensuel */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <h3 className="text-base font-semibold text-gray-800 mb-4">
          Évolution mensuelle du CA (36 mois)
        </h3>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <defs>
              <linearGradient id="caGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="mois"
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              interval={2}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) =>
                v >= 1000 ? `${(v / 1000).toFixed(0)}k€` : `${v}€`
              }
            />
            <RechartsTooltip
              formatter={(value) => [formatEur(Number(value)), 'CA HT']}
              contentStyle={{ fontSize: 12, borderRadius: 8 }}
            />
            <Area
              type="monotone"
              dataKey="ca"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#caGradient)"
              dot={false}
              activeDot={{ r: 4 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
