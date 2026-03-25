import { useState } from 'react';
import type { Previsionnel, ChargeFix, ChargeVariable } from '../types';
import AlertBanner from '../components/AlertBanner';
import Tooltip from '../components/Tooltip';

interface Props {
  data: Previsionnel;
  updateData: (partial: Partial<Previsionnel>) => void;
}

function formatEur(n: number): string {
  return n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
}

// Suggestions de charges fixes fréquentes
const SUGGESTIONS_CHARGES_FIXES: Omit<ChargeFix, 'evolutionAn2' | 'evolutionAn3'>[] = [
  { description: 'Loyer / sous-location bureau', montantAnnuel: 3600 },
  { description: 'Abonnement téléphone & internet', montantAnnuel: 600 },
  { description: 'Assurance responsabilité civile professionnelle', montantAnnuel: 500 },
  { description: 'Comptabilité / expert-comptable', montantAnnuel: 1500 },
  { description: 'Logiciels & abonnements SaaS', montantAnnuel: 600 },
  { description: 'Frais bancaires professionnels', montantAnnuel: 240 },
  { description: 'Formation professionnelle', montantAnnuel: 500 },
  { description: 'Marketing & communication', montantAnnuel: 1200 },
];

export function Step6Charges({ data, updateData }: Props) {
  const isMicro = data.statut.statutJuridique === 'micro';

  // Toggle global : 'mensuel' | 'annuel'
  const [saisieMode, setSaisieMode] = useState<'mensuel' | 'annuel'>('annuel');

  // --- Charges fixes helpers ---
  const updateCharge = (index: number, field: keyof ChargeFix, value: string | number) => {
    const updated = [...data.chargesFixes];
    updated[index] = { ...updated[index], [field]: value };
    updateData({ chargesFixes: updated });
  };

  const handleMontantChange = (index: number, rawValue: string) => {
    const parsed = parseFloat(rawValue) || 0;
    const annuel = saisieMode === 'mensuel' ? parsed * 12 : parsed;
    updateCharge(index, 'montantAnnuel', annuel);
  };

  const displayMontant = (montantAnnuel: number): number => {
    return saisieMode === 'mensuel' ? Math.round(montantAnnuel / 12) : montantAnnuel;
  };

  const addCharge = () => {
    const newCharge: ChargeFix = {
      description: '',
      montantAnnuel: 0,
      evolutionAn2: 0,
      evolutionAn3: 0,
    };
    updateData({ chargesFixes: [...data.chargesFixes, newCharge] });
  };

  const removeCharge = (index: number) => {
    const updated = data.chargesFixes.filter((_, i) => i !== index);
    updateData({ chargesFixes: updated });
  };

  const addSuggestion = (sug: (typeof SUGGESTIONS_CHARGES_FIXES)[number]) => {
    // Avoid duplicate description
    const alreadyExists = data.chargesFixes.some(
      (c) => c.description.toLowerCase() === sug.description.toLowerCase()
    );
    if (alreadyExists) return;
    const newCharge: ChargeFix = {
      description: sug.description,
      montantAnnuel: sug.montantAnnuel,
      evolutionAn2: 2,
      evolutionAn3: 2,
    };
    updateData({ chargesFixes: [...data.chargesFixes, newCharge] });
  };

  // --- Charges variables helpers ---
  const updateChargeVariable = (index: number, field: keyof ChargeVariable, value: string | number) => {
    const updated = [...data.chargesVariables];
    updated[index] = { ...updated[index], [field]: value };
    updateData({ chargesVariables: updated });
  };

  const addChargeVariable = () => {
    if (data.offres.length === 0) return;
    const newCharge: ChargeVariable = {
      offreId: data.offres[0].id,
      description: '',
      coutUnitaire: 0,
    };
    updateData({ chargesVariables: [...data.chargesVariables, newCharge] });
  };

  const removeChargeVariable = (index: number) => {
    const updated = data.chargesVariables.filter((_, i) => i !== index);
    updateData({ chargesVariables: updated });
  };

  // Totaux charges fixes
  const totalChargesFixes = data.chargesFixes.reduce(
    (sum, c) => sum + (Number(c.montantAnnuel) || 0),
    0
  );

  // Suggestions non encore ajoutées
  const suggestionsDisponibles = SUGGESTIONS_CHARGES_FIXES.filter(
    (sug) =>
      !data.chargesFixes.some(
        (c) => c.description.toLowerCase() === sug.description.toLowerCase()
      )
  );

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Étape 6 — Mes charges</h2>

      {/* Bannière micro */}
      {isMicro && (
        <AlertBanner
          type="info"
          message="Pour votre information, même si ces charges ne sont pas déductibles fiscalement en micro-entreprise, les connaître vous aide à évaluer votre rentabilité réelle."
        />
      )}

      {/* ── Section 1 : Charges fixes ── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Charges fixes</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Charges récurrentes indépendantes de votre volume d'activité.
            </p>
          </div>
          <span className="text-sm font-semibold text-blue-700">
            Total : {formatEur(totalChargesFixes)} / an
          </span>
        </div>

        {/* Toggle saisie mensuelle / annuelle */}
        <div className="flex items-center gap-1 mb-4 bg-gray-100 rounded-lg p-1 w-fit">
          <button
            type="button"
            onClick={() => setSaisieMode('mensuel')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              saisieMode === 'mensuel'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Saisie mensuelle
          </button>
          <button
            type="button"
            onClick={() => setSaisieMode('annuel')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              saisieMode === 'annuel'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Saisie annuelle
          </button>
        </div>

        {/* Tableau charges fixes */}
        {data.chargesFixes.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                <tr>
                  <th className="text-left px-4 py-2 font-medium">Description</th>
                  <th className="text-right px-3 py-2 font-medium w-44">
                    {saisieMode === 'mensuel' ? 'Montant mensuel' : 'Montant annuel'}
                  </th>
                  <th className="px-3 py-2 font-medium w-32">
                    <div className="flex items-center justify-end gap-1">
                      Évol. An 2
                      <Tooltip text="Pourcentage d'évolution prévu entre l'année 1 et 2" />
                    </div>
                  </th>
                  <th className="px-3 py-2 font-medium w-32">
                    <div className="flex items-center justify-end gap-1">
                      Évol. An 3
                      <Tooltip text="Pourcentage d'évolution prévu entre l'année 2 et 3" />
                    </div>
                  </th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.chargesFixes.map((charge, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={charge.description}
                        onChange={(e) => updateCharge(i, 'description', e.target.value)}
                        placeholder="Ex : Loyer bureau..."
                        className="w-full border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-col items-end gap-0.5">
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min={0}
                            value={displayMontant(charge.montantAnnuel) || ''}
                            onChange={(e) => handleMontantChange(i, e.target.value)}
                            className="w-24 border border-gray-200 rounded px-2 py-1 text-sm text-right focus:outline-none focus:ring-1 focus:ring-blue-400"
                          />
                          <span className="text-gray-400 text-xs">€</span>
                        </div>
                        {charge.montantAnnuel > 0 && (
                          <span className="text-xs text-gray-400">
                            {saisieMode === 'mensuel'
                              ? `Soit ${formatEur(charge.montantAnnuel)} / an`
                              : `Soit ${formatEur(Math.round(charge.montantAnnuel / 12))} / mois`}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-end gap-1">
                        <input
                          type="number"
                          value={charge.evolutionAn2 || ''}
                          onChange={(e) =>
                            updateCharge(i, 'evolutionAn2', parseFloat(e.target.value) || 0)
                          }
                          className="w-16 border border-gray-200 rounded px-2 py-1 text-sm text-right focus:outline-none focus:ring-1 focus:ring-blue-400"
                        />
                        <span className="text-gray-400 text-xs">%</span>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-end gap-1">
                        <input
                          type="number"
                          value={charge.evolutionAn3 || ''}
                          onChange={(e) =>
                            updateCharge(i, 'evolutionAn3', parseFloat(e.target.value) || 0)
                          }
                          className="w-16 border border-gray-200 rounded px-2 py-1 text-sm text-right focus:outline-none focus:ring-1 focus:ring-blue-400"
                        />
                        <span className="text-gray-400 text-xs">%</span>
                      </div>
                    </td>
                    <td className="px-2 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => removeCharge(i)}
                        className="text-gray-300 hover:text-red-500 transition-colors"
                        aria-label="Supprimer cette charge"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 border-t border-gray-200">
                <tr>
                  <td className="px-4 py-2 text-sm font-semibold text-gray-700">Total annuel</td>
                  <td className="px-3 py-2 text-right font-bold text-blue-700">
                    {formatEur(totalChargesFixes)}
                  </td>
                  <td colSpan={3} />
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <div className="text-center text-gray-400 text-sm py-6 border border-dashed border-gray-200 rounded-xl">
            Aucune charge fixe renseignée. Ajoutez-en ci-dessous.
          </div>
        )}

        <div className="flex items-center gap-3 mt-3">
          <button
            type="button"
            onClick={addCharge}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Ajouter une charge
          </button>
        </div>

        {/* Suggestions */}
        {suggestionsDisponibles.length > 0 && (
          <div className="mt-4">
            <p className="text-xs text-gray-500 mb-2">
              Suggestions fréquentes — cliquez pour ajouter :
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestionsDisponibles.map((sug) => (
                <button
                  key={sug.description}
                  type="button"
                  onClick={() => addSuggestion(sug)}
                  className="px-3 py-1 rounded-full border border-dashed border-blue-300 text-blue-600 text-xs hover:bg-blue-50 transition-colors"
                >
                  + {sug.description}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ── Section 2 : Charges variables ── */}
      <section>
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Charges variables</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Coûts directement liés à la réalisation d'une prestation ou d'une vente (sous-traitance, matières premières, etc.).
          </p>
        </div>

        {data.offres.length === 0 ? (
          <AlertBanner
            type="warning"
            message="Définissez d'abord vos offres à l'étape 3 pour pouvoir renseigner des charges variables."
          />
        ) : (
          <>
            {data.chargesVariables.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                    <tr>
                      <th className="text-left px-4 py-2 font-medium">Offre liée</th>
                      <th className="text-left px-4 py-2 font-medium">Description</th>
                      <th className="text-right px-3 py-2 font-medium w-36">Coût unitaire</th>
                      <th className="w-10" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.chargesVariables.map((cv, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-2">
                          <select
                            value={cv.offreId}
                            onChange={(e) => updateChargeVariable(i, 'offreId', e.target.value)}
                            className="border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"
                          >
                            {data.offres.map((offre) => (
                              <option key={offre.id} value={offre.id}>
                                {offre.nom}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={cv.description}
                            onChange={(e) => updateChargeVariable(i, 'description', e.target.value)}
                            placeholder="Ex : Sous-traitance, matières premières..."
                            className="w-full border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center justify-end gap-1">
                            <input
                              type="number"
                              min={0}
                              value={cv.coutUnitaire || ''}
                              onChange={(e) =>
                                updateChargeVariable(i, 'coutUnitaire', parseFloat(e.target.value) || 0)
                              }
                              className="w-24 border border-gray-200 rounded px-2 py-1 text-sm text-right focus:outline-none focus:ring-1 focus:ring-blue-400"
                            />
                            <span className="text-gray-400 text-xs">€</span>
                          </div>
                        </td>
                        <td className="px-2 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => removeChargeVariable(i)}
                            className="text-gray-300 hover:text-red-500 transition-colors"
                            aria-label="Supprimer cette charge variable"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center text-gray-400 text-sm py-6 border border-dashed border-gray-200 rounded-xl">
                Aucune charge variable renseignée.
              </div>
            )}

            <button
              type="button"
              onClick={addChargeVariable}
              className="flex items-center gap-2 mt-3 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Ajouter une charge variable
            </button>
          </>
        )}
      </section>
    </div>
  );
}
