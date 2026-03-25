import type { Previsionnel, StatutJuridique, TypeGerance } from '../types';
import Card from '../components/Card';
import Tooltip from '../components/Tooltip';
import { STATUTS } from '../config/statuts';

interface Props {
  data: Previsionnel;
  updateData: (partial: Partial<Previsionnel>) => void;
}

export function Step2Statut({ data, updateData }: Props) {
  const selectStatut = (id: StatutJuridique) => {
    updateData({
      statut: {
        ...data.statut,
        statutJuridique: id,
        typeGerance: undefined,
        versementLiberatoire: undefined,
      },
    });
  };

  const selectTypeGerance = (type: TypeGerance) => {
    updateData({ statut: { ...data.statut, typeGerance: type } });
  };

  const selectVersementLiberatoire = (value: boolean) => {
    updateData({ statut: { ...data.statut, versementLiberatoire: value } });
  };

  const toggleAcre = (value: boolean) => {
    updateData({ statut: { ...data.statut, acre: value } });
  };

  const selectedStatut = STATUTS.find((s) => s.id === data.statut.statutJuridique) ?? null;
  const isEurlOrSarl = data.statut.statutJuridique === 'eurl' || data.statut.statutJuridique === 'sarl';
  const isMicro = data.statut.statutJuridique === 'micro';

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Mon statut juridique</h2>
      <p className="text-gray-500 mb-8">
        Choisissez le statut juridique le mieux adapté à votre situation pour obtenir des calculs précis.
      </p>

      {/* Statut selection */}
      <h3 className="text-lg font-semibold text-gray-800 mb-4 mt-8">Choisissez votre statut juridique</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {STATUTS.map((statut) => (
          <Card
            key={statut.id}
            selected={data.statut.statutJuridique === statut.id}
            onClick={() => selectStatut(statut.id)}
            title={statut.nom}
            description={statut.resumeCourt}
            badge={statut.idealPour}
          />
        ))}
      </div>

      {/* Detail panel for selected statut */}
      {selectedStatut && (
        <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-5">
          <h4 className="font-semibold text-blue-800 mb-3">{selectedStatut.nom} — Détail</h4>
          <p className="text-sm text-blue-700 mb-4">{selectedStatut.description}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2">Avantages</p>
              <ul className="space-y-1">
                {selectedStatut.avantages.map((a, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                    {a}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-2">Inconvénients</p>
              <ul className="space-y-1">
                {selectedStatut.inconvenients.map((inc, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-red-400 mt-0.5 flex-shrink-0">✗</span>
                    {inc}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Sub-question: EURL or SARL — type de gérance */}
      {isEurlOrSarl && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Êtes-vous gérant majoritaire ou minoritaire ?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card
              selected={data.statut.typeGerance === 'majoritaire'}
              onClick={() => selectTypeGerance('majoritaire')}
              title="Gérant majoritaire"
              description="Vous détenez plus de 50% des parts"
            />
            <Card
              selected={data.statut.typeGerance === 'minoritaire'}
              onClick={() => selectTypeGerance('minoritaire')}
              title="Gérant minoritaire"
              description="Vous détenez 50% ou moins des parts"
            />
          </div>
        </div>
      )}

      {/* Sub-question: Micro — versement libératoire */}
      {isMicro && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-1 flex items-center gap-2">
            Optez-vous pour le versement libératoire de l'impôt sur le revenu ?
            <Tooltip text="Le versement libératoire vous permet de payer votre impôt sur le revenu en même temps que vos cotisations, à un taux forfaitaire réduit." />
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Cette option peut être avantageuse si votre taux marginal d'imposition est élevé.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card
              selected={data.statut.versementLiberatoire === true}
              onClick={() => selectVersementLiberatoire(true)}
              title="Oui"
              description="Taux simplifié prélevé directement sur votre CA"
            />
            <Card
              selected={data.statut.versementLiberatoire === false}
              onClick={() => selectVersementLiberatoire(false)}
              title="Non"
              description="Imposition classique au barème progressif"
            />
          </div>
        </div>
      )}

      {/* ACRE */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-1 flex items-center gap-2">
          Bénéficiez-vous de l'ACRE ?
          <Tooltip text="L'Aide à la Création ou Reprise d'Entreprise réduit vos cotisations sociales de 50% pendant la première année." />
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          L'ACRE (Aide à la Création ou Reprise d'Entreprise) réduit vos cotisations sociales de 50% pendant la première année d'activité.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card
            selected={data.statut.acre === true}
            onClick={() => toggleAcre(true)}
            title="Oui, je bénéficie de l'ACRE"
            description="Cotisations sociales réduites de 50% la première année"
          />
          <Card
            selected={data.statut.acre === false || data.statut.acre === undefined}
            onClick={() => toggleAcre(false)}
            title="Non"
            description="Cotisations sociales au taux normal"
          />
        </div>
      </div>
    </div>
  );
}
