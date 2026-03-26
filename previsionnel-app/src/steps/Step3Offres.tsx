import FormField from '../components/FormField';
import AlertBanner from '../components/AlertBanner';
import type { Previsionnel, Offre } from '../types';

interface Props {
  data: Previsionnel;
  updateData: (partial: Partial<Previsionnel>) => void;
}

export function Step3Offres({ data, updateData }: Props) {
  const isMicro = data.statut.statutJuridique === 'micro';

  const addOffre = () => {
    if (data.offres.length >= 10) return;
    const newOffre: Offre = {
      id: Math.random().toString(36).slice(2) + Date.now().toString(36),
      nom: '',
      prixUnitaireHT: 0,
      delaiPaiementMois: 0,
      acomptePourcent: 0,
      tauxTVA: isMicro ? 0 : 0.2,
    };
    updateData({ offres: [...data.offres, newOffre] });
  };

  const updateOffre = (id: string, field: keyof Offre, value: string | number) => {
    updateData({
      offres: data.offres.map((o) => (o.id === id ? { ...o, [field]: value } : o)),
    });
  };

  const removeOffre = (id: string) => {
    updateData({ offres: data.offres.filter((o) => o.id !== id) });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Étape 3 — Mes offres</h2>
        <p className="text-sm text-gray-500">
          Décrivez les produits ou services que vous proposez. Vous pouvez ajouter jusqu'à 10 offres.
        </p>
      </div>

      {isMicro && (
        <AlertBanner
          type="info"
          message="En micro-entreprise, vous n'êtes pas soumis à la TVA (franchise en base). Le taux de TVA est automatiquement fixé à 0 %."
        />
      )}

      {data.offres.length === 0 && (
        <div className="rounded-lg border-2 border-dashed border-gray-200 py-12 text-center">
          <p className="text-gray-400 text-sm mb-4">Aucune offre ajoutée pour le moment.</p>
          <button
            type="button"
            onClick={addOffre}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Ajouter une offre
          </button>
        </div>
      )}

      {data.offres.length > 0 && (
        <div className="space-y-4">
          {data.offres.map((offre, index) => (
            <div
              key={offre.id}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              {/* Card header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-700">
                  Offre {index + 1}
                  {offre.nom ? ` — ${offre.nom}` : ''}
                </h3>
                <button
                  type="button"
                  onClick={() => removeOffre(offre.id)}
                  aria-label="Supprimer cette offre"
                  className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Supprimer
                </button>
              </div>

              {/* Fields grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nom */}
                <div className="sm:col-span-2">
                  <FormField
                    label="Nom de l'offre"
                    type="text"
                    value={offre.nom}
                    onChange={(v) => updateOffre(offre.id, 'nom', v)}
                    placeholder="ex : Consultation 1h, Pack mensuel, Produit A…"
                  />
                </div>

                {/* Prix unitaire HT */}
                <FormField
                  label="Prix unitaire HT"
                  type="number"
                  value={offre.prixUnitaireHT}
                  onChange={(v) => updateOffre(offre.id, 'prixUnitaireHT', parseFloat(v) || 0)}
                  placeholder="ex : 150"
                  suffix="€"
                />

                {/* Taux TVA — masqué pour micro */}
                {!isMicro && (
                  <FormField
                    label="Taux de TVA"
                    type="number"
                    value={offre.tauxTVA * 100}
                    onChange={(v) =>
                      updateOffre(offre.id, 'tauxTVA', (parseFloat(v) || 0) / 100)
                    }
                    placeholder="ex : 20"
                    suffix="%"
                  />
                )}

                {/* Délai de paiement */}
                <FormField
                  label="Délai de paiement"
                  tooltip="Nombre de mois entre la réalisation et l'encaissement. Ex : 0 = paiement immédiat, 1 = paiement le mois suivant."
                  type="number"
                  value={offre.delaiPaiementMois}
                  onChange={(v) =>
                    updateOffre(offre.id, 'delaiPaiementMois', parseInt(v, 10) || 0)
                  }
                  placeholder="0"
                  suffix="mois"
                />

                {/* Acompte */}
                <FormField
                  label="Acompte"
                  tooltip="Pourcentage encaissé à la commande avant réalisation de la prestation. Ex : 30 % d'acompte à la signature."
                  type="number"
                  value={offre.acomptePourcent}
                  onChange={(v) =>
                    updateOffre(offre.id, 'acomptePourcent', parseFloat(v) || 0)
                  }
                  placeholder="0"
                  suffix="%"
                />
              </div>
            </div>
          ))}

          {/* Add button below cards */}
          {data.offres.length < 10 && (
            <button
              type="button"
              onClick={addOffre}
              className="inline-flex items-center gap-2 rounded-lg border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Ajouter une offre
            </button>
          )}

          {data.offres.length >= 10 && (
            <AlertBanner type="warning" message="Vous avez atteint le maximum de 10 offres." />
          )}
        </div>
      )}
    </div>
  );
}
