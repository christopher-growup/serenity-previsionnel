import { useState } from 'react';
import type { Previsionnel, Salarie } from '../types';
import FormField from '../components/FormField';
import { calculerCotisationsDirigeant, calculerCoutEmployeur } from '../utils/calculs-cotisations';
import { calculerImpotMicro } from '../utils/calculs-impots';
import { getLabelsNomsMois } from '../utils/mois';

interface Props {
  data: Previsionnel;
  updateData: (partial: Partial<Previsionnel>) => void;
}

function formatEur(n: number): string {
  return n.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';
}

function estMicro(data: Previsionnel): boolean {
  return data.statut.statutJuridique === 'micro';
}

function estimerCAan1(data: Previsionnel): number {
  let total = 0;
  for (const offre of data.offres) {
    const ventes = data.ventes[offre.id] ?? [];
    for (let m = 0; m < 12; m++) {
      total += (ventes[m] ?? 0) * offre.prixUnitaireHT;
    }
  }
  return total;
}

const TRIMESTRES = [1, 2, 3, 4] as const;
const ANNEES = [1, 2, 3] as const;

function newSalarie(): Salarie {
  return {
    poste: '',
    salaireBrutAnnuel: 0,
    dateEmbauche: { trimestre: 1, annee: 1 },
    augmentationAnnuelle: 0,
  };
}

// Composant toggle réutilisable
function ToggleSaisie({
  mode,
  onChange,
}: {
  mode: 'mensuel' | 'annuel';
  onChange: (m: 'mensuel' | 'annuel') => void;
}) {
  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 w-fit">
      <button
        type="button"
        onClick={() => onChange('mensuel')}
        className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
          mode === 'mensuel'
            ? 'bg-white text-blue-700 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        Mensuel
      </button>
      <button
        type="button"
        onClick={() => onChange('annuel')}
        className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
          mode === 'annuel'
            ? 'bg-white text-blue-700 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        Annuel
      </button>
    </div>
  );
}

export function Step7Remuneration({ data, updateData }: Props) {
  const { statut, projet, remunerationDirigeant, salaries } = data;
  const isMicro = estMicro(data);

  // Toggles de saisie
  const [modeDirigeant, setModeDirigeant] = useState<'mensuel' | 'annuel'>('annuel');
  const [modesSalaries, setModesSalaries] = useState<Record<number, 'mensuel' | 'annuel'>>({});

  const acreActif = statut.acre === true;

  /* ── Micro : calculs ── */
  const caAn1 = isMicro ? estimerCAan1(data) : 0;
  const cotisationsMicro = isMicro
    ? calculerCotisationsDirigeant(statut, projet.typeActivite, caAn1, 0, { acre: acreActif, annee: 1 })
    : 0;
  const impotMicro = isMicro
    ? calculerImpotMicro(caAn1, projet.typeActivite, statut.versementLiberatoire ?? false)
    : 0;
  const revenuDisponibleMicro = Math.max(0, caAn1 - cotisationsMicro - impotMicro);
  const partRetires = remunerationDirigeant.partRevenusRetires ?? 100;

  /* ── EI / société : calculs dirigeant ── */
  const salaireBrutAnnuel = remunerationDirigeant.salaireBrutAnnuel ?? 0;
  const cotisationsDirigeant = !isMicro
    ? calculerCotisationsDirigeant(statut, projet.typeActivite, 0, salaireBrutAnnuel, { acre: acreActif, annee: 1 })
    : 0;
  const coutTotalDirigeant = salaireBrutAnnuel + cotisationsDirigeant;

  /* ── Salariés ── */
  const [salarieOuvert, setSalarieOuvert] = useState<number | null>(null);

  function updateRemuneration(partial: Partial<typeof remunerationDirigeant>) {
    updateData({ remunerationDirigeant: { ...remunerationDirigeant, ...partial } });
  }

  function handleDirigeantSalaireChange(rawValue: string) {
    const parsed = parseFloat(rawValue) || 0;
    const annuel = modeDirigeant === 'mensuel' ? parsed * 12 : parsed;
    updateRemuneration({ salaireBrutAnnuel: annuel });
  }

  function addSalarie() {
    const updated = [...salaries, newSalarie()];
    updateData({ salaries: updated });
    setSalarieOuvert(updated.length - 1);
  }

  function updateSalarie(idx: number, partial: Partial<Salarie>) {
    const updated = salaries.map((s, i) => (i === idx ? { ...s, ...partial } : s));
    updateData({ salaries: updated });
  }

  function handleSalarieSalaireChange(idx: number, rawValue: string) {
    const parsed = parseFloat(rawValue) || 0;
    const mode = modesSalaries[idx] ?? 'annuel';
    const annuel = mode === 'mensuel' ? parsed * 12 : parsed;
    updateSalarie(idx, { salaireBrutAnnuel: annuel });
  }

  function removeSalarie(idx: number) {
    const updated = salaries.filter((_, i) => i !== idx);
    updateData({ salaries: updated });
    setSalarieOuvert(null);
  }

  function getSalarieMode(idx: number): 'mensuel' | 'annuel' {
    return modesSalaries[idx] ?? 'annuel';
  }

  function setSalarieMode(idx: number, mode: 'mensuel' | 'annuel') {
    setModesSalaries((prev) => ({ ...prev, [idx]: mode }));
  }

  const labelStatut: Record<string, string> = {
    micro: 'Micro-entreprise',
    ei: 'Entreprise individuelle',
    eurl: 'EURL',
    sarl: 'SARL',
    sasu: 'SASU',
    sas: 'SAS',
  };

  // Valeur affichée selon le mode dirigeant
  const salaireDirigeantDisplay =
    modeDirigeant === 'mensuel'
      ? Math.round(salaireBrutAnnuel / 12)
      : salaireBrutAnnuel;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Étape 7 — Ma rémunération</h2>
        <p className="text-sm text-gray-500">
          Statut : <span className="font-medium text-gray-700">{labelStatut[statut.statutJuridique] ?? statut.statutJuridique}</span>
        </p>
      </div>

      {/* ══ MICRO-ENTREPRISE ══════════════════════════════════════ */}
      {isMicro && (
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
          <h3 className="text-lg font-semibold text-gray-800">Rémunération du dirigeant</h3>

          <p className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
            En micro-entreprise, votre rémunération correspond au chiffre d'affaires diminué des cotisations et de l'impôt.
          </p>

          {acreActif && (
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-800">
              <span className="font-semibold">ACRE active</span> — Vos cotisations sociales sont réduites de 50% la première année.
            </div>
          )}

          {/* Décomposition */}
          <div className="overflow-hidden rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="px-4 py-3 text-gray-600">CA estimé (année 1)</td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">{formatEur(caAn1)}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="px-4 py-3 text-gray-600">– Cotisations sociales</td>
                  <td className="px-4 py-3 text-right text-red-600">−{formatEur(cotisationsMicro)}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="px-4 py-3 text-gray-600">– Impôt sur le revenu</td>
                  <td className="px-4 py-3 text-right text-red-600">−{formatEur(impotMicro)}</td>
                </tr>
                <tr className="bg-green-50">
                  <td className="px-4 py-3 font-semibold text-gray-800">= Revenu disponible</td>
                  <td className="px-4 py-3 text-right font-bold text-green-700">{formatEur(revenuDisponibleMicro)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Part retirée */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Part des revenus retirés pour vous : <span className="text-blue-600 font-semibold">{partRetires} %</span>
            </label>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={partRetires}
              onChange={(e) => updateRemuneration({ partRevenusRetires: Number(e.target.value) })}
              className="w-full accent-blue-500"
            />
            <p className="text-sm text-gray-500">
              Soit environ <span className="font-medium text-gray-800">{formatEur(revenuDisponibleMicro * partRetires / 100)}</span> par an
              ({formatEur(Math.round(revenuDisponibleMicro * partRetires / 100 / 12))} / mois)
            </p>
          </div>
        </section>
      )}

      {/* ══ EI / SOCIÉTÉ ══════════════════════════════════════════ */}
      {!isMicro && (
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
          <h3 className="text-lg font-semibold text-gray-800">Rémunération du dirigeant</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Salaire avec toggle mensuel/annuel */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Salaire brut{' '}
                  <span className="text-gray-400 font-normal">
                    ({modeDirigeant === 'mensuel' ? 'mensuel' : 'annuel'})
                  </span>
                </label>
                <ToggleSaisie mode={modeDirigeant} onChange={setModeDirigeant} />
              </div>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  value={salaireDirigeantDisplay || ''}
                  onChange={(e) => handleDirigeantSalaireChange(e.target.value)}
                  placeholder="0"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">€</span>
              </div>
              {salaireBrutAnnuel > 0 && (
                <p className="text-xs text-gray-400">
                  {modeDirigeant === 'mensuel'
                    ? `Soit ${formatEur(salaireBrutAnnuel)} / an`
                    : `Soit ${formatEur(Math.round(salaireBrutAnnuel / 12))} / mois`}
                </p>
              )}
            </div>

            <FormField
              label="Augmentation annuelle"
              type="number"
              value={remunerationDirigeant.augmentationAnnuelle ?? 0}
              onChange={(v) => updateRemuneration({ augmentationAnnuelle: Number(v) })}
              suffix="%"
              placeholder="0"
            />
          </div>

          {/* Mois de début du salaire */}
          {salaireBrutAnnuel > 0 && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                À partir de quel mois vous versez-vous un salaire ?
              </label>
              <select
                className="w-fit rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={remunerationDirigeant.moisDebutSalaire ?? 1}
                onChange={(e) => updateRemuneration({ moisDebutSalaire: Number(e.target.value) })}
              >
                {getLabelsNomsMois(data.projet.dateCreationEnvisagee, 'long').map((label, i) => (
                  <option key={i + 1} value={i + 1}>
                    {label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-400">
                Votre salaire ne sera comptabilisé qu'à partir de ce mois dans le prévisionnel.
              </p>
            </div>
          )}

          {/* Autres sources de revenus si pas de salaire */}
          {salaireBrutAnnuel === 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
              <p className="text-sm text-amber-800 font-medium">
                Vous ne prévoyez pas de salaire. Comment comptez-vous subvenir à vos besoins ?
              </p>
              <p className="text-xs text-amber-600">
                À titre indicatif, précisez vos autres sources de revenus (emploi salarié, épargne, conjoint, ARE, etc.). Cette information n'impacte pas les calculs mais aide à la crédibilité de votre prévisionnel.
              </p>
              <textarea
                value={remunerationDirigeant.autresRevenus ?? ''}
                onChange={(e) => updateRemuneration({ autresRevenus: e.target.value })}
                placeholder="Ex : Maintien de mon emploi salarié à mi-temps (1 200 € net/mois), épargne personnelle de 15 000 €..."
                rows={3}
                className="w-full rounded-lg border border-amber-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
              />
            </div>
          )}

          {/* ACRE banner */}
          {acreActif && (
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-800">
              <span className="font-semibold">ACRE active</span> — Vos cotisations sociales sont réduites de 50% la première année.
            </div>
          )}

          {/* Tableau de synthèse */}
          {salaireBrutAnnuel > 0 && (
            <div className="overflow-hidden rounded-xl border border-gray-200">
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="px-4 py-3 text-gray-600">Salaire brut annuel</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">{formatEur(salaireBrutAnnuel)}</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="px-4 py-3 text-gray-600">+ Cotisations sociales{acreActif ? ' (ACRE −50%)' : ''}</td>
                    <td className="px-4 py-3 text-right text-orange-600">+{formatEur(cotisationsDirigeant)}</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-4 py-3 font-semibold text-gray-800">= Coût total dirigeant</td>
                    <td className="px-4 py-3 text-right font-bold text-gray-900">{formatEur(coutTotalDirigeant)}</td>
                  </tr>
                  {(remunerationDirigeant.moisDebutSalaire ?? 1) > 1 && (
                    <tr className="border-t border-gray-100">
                      <td className="px-4 py-3 text-gray-500 text-xs" colSpan={2}>
                        Salaire versé à partir de {getLabelsNomsMois(data.projet.dateCreationEnvisagee, 'long')[(remunerationDirigeant.moisDebutSalaire ?? 1) - 1]}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Détail des cotisations */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-600">
            <h4 className="font-semibold text-gray-800 mb-2">Détail des cotisations</h4>
            {statut.statutJuridique === 'ei' && (
              <p>Cotisations ~45% du bénéfice. Comprend : maladie-maternité, retraite de base et complémentaire, allocations familiales, invalidité-décès, CSG-CRDS.</p>
            )}
            {(statut.statutJuridique === 'eurl' || statut.statutJuridique === 'sarl') && statut.typeGerance !== 'minoritaire' && (
              <p>Cotisations ~45% de la rémunération. Comprend : maladie-maternité, retraite de base et complémentaire, allocations familiales, invalidité-décès, CSG-CRDS. Régime TNS (Travailleur Non Salarié).</p>
            )}
            {(statut.statutJuridique === 'eurl' || statut.statutJuridique === 'sarl') && statut.typeGerance === 'minoritaire' && (
              <p>Cotisations ~65% du salaire brut (charges patronales + salariales). Comprend : assurance maladie, retraite, chômage, prévoyance. Régime assimilé salarié.</p>
            )}
            {(statut.statutJuridique === 'sasu' || statut.statutJuridique === 'sas') && (
              <p>Cotisations ~82% du salaire net (~54% patronales + ~28% salariales). Comprend : assurance maladie, retraite, prévoyance, CSG-CRDS. Régime assimilé salarié (pas de cotisation chômage pour le dirigeant).</p>
            )}
            {acreActif && (
              <p className="mt-2 text-green-700 font-medium">Avec l'ACRE, ces cotisations sont réduites de 50% la première année.</p>
            )}
          </div>
        </section>
      )}

      {/* ══ SALARIÉS ══════════════════════════════════════════════ */}
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Salariés</h3>
          <button
            type="button"
            onClick={addSalarie}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Ajouter un salarié
          </button>
        </div>

        {salaries.length === 0 && (
          <p className="text-sm text-gray-400 italic text-center py-4">
            Aucun salarié pour l'instant.
          </p>
        )}

        {salaries.map((sal, idx) => {
          const coutEmployeur = calculerCoutEmployeur(sal.salaireBrutAnnuel);
          const isOpen = salarieOuvert === idx;
          const salMode = getSalarieMode(idx);
          const salaireDisplay =
            salMode === 'mensuel'
              ? Math.round(sal.salaireBrutAnnuel / 12)
              : sal.salaireBrutAnnuel;

          return (
            <div key={idx} className="border border-gray-200 rounded-xl overflow-hidden">
              {/* En-tête salarié */}
              <button
                type="button"
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                onClick={() => setSalarieOuvert(isOpen ? null : idx)}
              >
                <div>
                  <span className="font-medium text-gray-800">
                    {sal.poste || `Salarié ${idx + 1}`}
                  </span>
                  <span className="ml-3 text-sm text-gray-500">
                    {sal.salaireBrutAnnuel > 0 ? `${formatEur(sal.salaireBrutAnnuel)} brut/an` : ''}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    Coût employeur : {formatEur(coutEmployeur)}
                  </span>
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {/* Formulaire salarié */}
              {isOpen && (
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      label="Poste"
                      value={sal.poste}
                      onChange={(v) => updateSalarie(idx, { poste: v })}
                      placeholder="Ex : Responsable commercial"
                    />

                    {/* Salaire avec toggle mensuel/annuel */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">
                          Salaire brut{' '}
                          <span className="text-gray-400 font-normal">
                            ({salMode === 'mensuel' ? 'mensuel' : 'annuel'})
                          </span>
                        </label>
                        <ToggleSaisie
                          mode={salMode}
                          onChange={(m) => setSalarieMode(idx, m)}
                        />
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          min={0}
                          value={salaireDisplay || ''}
                          onChange={(e) => handleSalarieSalaireChange(idx, e.target.value)}
                          placeholder="0"
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">€</span>
                      </div>
                      {sal.salaireBrutAnnuel > 0 && (
                        <p className="text-xs text-gray-400">
                          {salMode === 'mensuel'
                            ? `Soit ${formatEur(sal.salaireBrutAnnuel)} / an`
                            : `Soit ${formatEur(Math.round(sal.salaireBrutAnnuel / 12))} / mois`}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Trimestre d'embauche */}
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-gray-700">Trimestre d'embauche</label>
                      <select
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={sal.dateEmbauche.trimestre}
                        onChange={(e) =>
                          updateSalarie(idx, {
                            dateEmbauche: { ...sal.dateEmbauche, trimestre: Number(e.target.value) },
                          })
                        }
                      >
                        {TRIMESTRES.map((t) => (
                          <option key={t} value={t}>T{t}</option>
                        ))}
                      </select>
                    </div>

                    {/* Année d'embauche */}
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-gray-700">Année</label>
                      <select
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={sal.dateEmbauche.annee}
                        onChange={(e) =>
                          updateSalarie(idx, {
                            dateEmbauche: { ...sal.dateEmbauche, annee: Number(e.target.value) },
                          })
                        }
                      >
                        {ANNEES.map((a) => (
                          <option key={a} value={a}>Année {a}</option>
                        ))}
                      </select>
                    </div>

                    <FormField
                      label="Augmentation annuelle"
                      type="number"
                      value={sal.augmentationAnnuelle}
                      onChange={(v) => updateSalarie(idx, { augmentationAnnuelle: Number(v) })}
                      suffix="%"
                      placeholder="0"
                    />
                  </div>

                  {/* Coût employeur */}
                  <div className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-3 text-sm">
                    <span className="text-orange-700">
                      Coût employeur estimé : <strong>{formatEur(coutEmployeur)}</strong> / an
                      <span className="text-orange-500 ml-1">(charges patronales incluses)</span>
                    </span>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeSalarie(idx)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Supprimer
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </section>
    </div>
  );
}
