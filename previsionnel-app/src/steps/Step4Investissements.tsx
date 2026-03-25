import FormField from '../components/FormField';
import type { Previsionnel, Investissement, Emprunt } from '../types';

interface Props {
  data: Previsionnel;
  updateData: (partial: Partial<Previsionnel>) => void;
}

export function Step4Investissements({ data, updateData }: Props) {
  /* ── Investissements helpers ─────────────────────────── */

  const addInvestissement = () => {
    const newInv: Investissement = {
      description: '',
      montant: 0,
      trimestre: 1,
      annee: 1,
      dureeAmortissement: 3,
    };
    updateData({ investissements: [...data.investissements, newInv] });
  };

  const updateInvestissement = (
    index: number,
    field: keyof Investissement,
    value: string | number,
  ) => {
    const updated = data.investissements.map((inv, i) =>
      i === index ? { ...inv, [field]: value } : inv,
    );
    updateData({ investissements: updated });
  };

  const removeInvestissement = (index: number) => {
    updateData({ investissements: data.investissements.filter((_, i) => i !== index) });
  };

  /* ── Financements helpers ────────────────────────────── */

  const updateFinancement = (field: keyof typeof data.financements, value: number) => {
    updateData({ financements: { ...data.financements, [field]: value } });
  };

  const addEmprunt = () => {
    const newEmprunt: Emprunt = {
      description: '',
      montant: 0,
      dureeMois: 60,
      tauxAnnuel: 0.03,
    };
    updateData({
      financements: {
        ...data.financements,
        emprunts: [...data.financements.emprunts, newEmprunt],
      },
    });
  };

  const updateEmprunt = (index: number, field: keyof Emprunt, value: string | number) => {
    const updated = data.financements.emprunts.map((e, i) =>
      i === index ? { ...e, [field]: value } : e,
    );
    updateData({ financements: { ...data.financements, emprunts: updated } });
  };

  const removeEmprunt = (index: number) => {
    updateData({
      financements: {
        ...data.financements,
        emprunts: data.financements.emprunts.filter((_, i) => i !== index),
      },
    });
  };

  /* ── Balance computation ─────────────────────────────── */

  const totalInvestissements = data.investissements.reduce((sum, inv) => sum + inv.montant, 0);
  const totalFinancements =
    data.financements.capital +
    data.financements.apports +
    data.financements.subventions +
    data.financements.emprunts.reduce((sum, e) => sum + e.montant, 0);

  const balanced = totalFinancements >= totalInvestissements;

  /* ── Shared styles ───────────────────────────────────── */

  const sectionTitle = 'text-lg font-semibold text-gray-800 mb-1';
  const sectionDesc = 'text-sm text-gray-500 mb-4';
  const deleteBtn =
    'flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400';
  const addBtn =
    'inline-flex items-center gap-2 rounded-lg border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400';

  const PlusIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );

  const TrashIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  );

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">
          Étape 4 — Investissements &amp; Financements
        </h2>
        <p className="text-sm text-gray-500">
          Renseignez vos investissements initiaux et les ressources qui vous permettront de les
          financer.
        </p>
      </div>

      {/* ── Section 1 : Investissements ── */}
      <section className="space-y-4">
        <div>
          <h3 className={sectionTitle}>Investissements</h3>
          <p className={sectionDesc}>
            Matériel, mobilier, logiciels, travaux… Tout achat dont la durée de vie dépasse un an.
          </p>
        </div>

        {data.investissements.length === 0 && (
          <p className="text-sm text-gray-400 italic">
            Aucun investissement pour le moment. Cliquez sur « Ajouter » si vous en avez.
          </p>
        )}

        {data.investissements.map((inv, index) => (
          <div
            key={index}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-gray-700">
                Investissement {index + 1}
                {inv.description ? ` — ${inv.description}` : ''}
              </span>
              <button
                type="button"
                onClick={() => removeInvestissement(index)}
                aria-label="Supprimer cet investissement"
                className={deleteBtn}
              >
                <TrashIcon />
                Supprimer
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <FormField
                  label="Description"
                  type="text"
                  value={inv.description}
                  onChange={(v) => updateInvestissement(index, 'description', v)}
                  placeholder="ex : Ordinateur portable, Véhicule utilitaire…"
                />
              </div>

              <FormField
                label="Montant"
                type="number"
                value={inv.montant}
                onChange={(v) => updateInvestissement(index, 'montant', parseFloat(v) || 0)}
                placeholder="ex : 2000"
                suffix="€"
              />

              <FormField
                label="Durée d'amortissement"
                tooltip="Durée sur laquelle l'investissement est amorti. Ex : matériel informatique 3 ans, mobilier 5-10 ans, véhicule 4-5 ans."
                type="number"
                value={inv.dureeAmortissement}
                onChange={(v) =>
                  updateInvestissement(index, 'dureeAmortissement', parseInt(v, 10) || 1)
                }
                placeholder="ex : 3"
                suffix="ans"
              />

              {/* Trimestre */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Trimestre d'achat</label>
                <select
                  value={inv.trimestre}
                  onChange={(e) =>
                    updateInvestissement(index, 'trimestre', parseInt(e.target.value, 10))
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors"
                >
                  {[1, 2, 3, 4].map((t) => (
                    <option key={t} value={t}>
                      T{t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Année */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Année</label>
                <select
                  value={inv.annee}
                  onChange={(e) =>
                    updateInvestissement(index, 'annee', parseInt(e.target.value, 10))
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors"
                >
                  {[1, 2, 3].map((a) => (
                    <option key={a} value={a}>
                      Année {a}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ))}

        <button type="button" onClick={addInvestissement} className={addBtn}>
          <PlusIcon />
          Ajouter un investissement
        </button>
      </section>

      {/* ── Section 2 : Financements ── */}
      <section className="space-y-6">
        <div>
          <h3 className={sectionTitle}>Financements</h3>
          <p className={sectionDesc}>
            Indiquez les ressources financières qui couvriront vos investissements et votre
            démarrage.
          </p>
        </div>

        {/* Capital, apports, subventions */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h4 className="text-sm font-semibold text-gray-700 mb-4">Fonds propres &amp; aides</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField
              label="Capital social"
              tooltip="Capital social de votre société (apporté par les associés lors de la création)."
              type="number"
              value={data.financements.capital}
              onChange={(v) => updateFinancement('capital', parseFloat(v) || 0)}
              placeholder="ex : 1000"
              suffix="€"
            />
            <FormField
              label="Apports personnels"
              tooltip="Vos apports personnels en dehors du capital social (compte courant d'associé, épargne personnelle…)."
              type="number"
              value={data.financements.apports}
              onChange={(v) => updateFinancement('apports', parseFloat(v) || 0)}
              placeholder="ex : 5000"
              suffix="€"
            />
            <FormField
              label="Subventions &amp; aides"
              tooltip="Subventions ou aides obtenues (NACRE, ARCE, subventions régionales…)."
              type="number"
              value={data.financements.subventions}
              onChange={(v) => updateFinancement('subventions', parseFloat(v) || 0)}
              placeholder="ex : 2000"
              suffix="€"
            />
          </div>
        </div>

        {/* Emprunts */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-700">Emprunts bancaires</h4>

          {data.financements.emprunts.length === 0 && (
            <p className="text-sm text-gray-400 italic">
              Aucun emprunt pour le moment.
            </p>
          )}

          {data.financements.emprunts.map((emprunt, index) => (
            <div
              key={index}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-gray-700">
                  Emprunt {index + 1}
                  {emprunt.description ? ` — ${emprunt.description}` : ''}
                </span>
                <button
                  type="button"
                  onClick={() => removeEmprunt(index)}
                  aria-label="Supprimer cet emprunt"
                  className={deleteBtn}
                >
                  <TrashIcon />
                  Supprimer
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <FormField
                    label="Description"
                    type="text"
                    value={emprunt.description}
                    onChange={(v) => updateEmprunt(index, 'description', v)}
                    placeholder="ex : Prêt bancaire création"
                  />
                </div>

                <FormField
                  label="Montant emprunté"
                  type="number"
                  value={emprunt.montant}
                  onChange={(v) => updateEmprunt(index, 'montant', parseFloat(v) || 0)}
                  placeholder="ex : 15000"
                  suffix="€"
                />

                <FormField
                  label="Durée"
                  type="number"
                  value={emprunt.dureeMois}
                  onChange={(v) => updateEmprunt(index, 'dureeMois', parseInt(v, 10) || 1)}
                  placeholder="ex : 60"
                  suffix="mois"
                />

                <FormField
                  label="Taux annuel"
                  type="number"
                  value={emprunt.tauxAnnuel * 100}
                  onChange={(v) =>
                    updateEmprunt(index, 'tauxAnnuel', (parseFloat(v) || 0) / 100)
                  }
                  placeholder="ex : 3"
                  suffix="%"
                />
              </div>
            </div>
          ))}

          <button type="button" onClick={addEmprunt} className={addBtn}>
            <PlusIcon />
            Ajouter un emprunt
          </button>
        </div>
      </section>

      {/* ── Balance indicator ── */}
      <div
        className={`rounded-xl border px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 ${
          balanced
            ? 'border-green-200 bg-green-50'
            : 'border-amber-200 bg-amber-50'
        }`}
      >
        <div className="flex items-center gap-3">
          {balanced ? (
            <svg
              className="w-5 h-5 text-green-500 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5 text-amber-500 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
              />
            </svg>
          )}
          <p
            className={`text-sm font-medium ${
              balanced ? 'text-green-800' : 'text-amber-800'
            }`}
          >
            {balanced
              ? "Vos financements couvrent l\u2019ensemble de vos investissements."
              : "Attention\u00a0: vos financements ne couvrent pas encore tous vos investissements."}
          </p>
        </div>

        <div
          className={`text-sm font-semibold whitespace-nowrap ${
            balanced ? 'text-green-700' : 'text-amber-700'
          }`}
        >
          Investissements : {totalInvestissements.toLocaleString('fr-FR')} €&nbsp;&nbsp;/&nbsp;&nbsp;Financements : {totalFinancements.toLocaleString('fr-FR')} €
        </div>
      </div>
    </div>
  );
}
