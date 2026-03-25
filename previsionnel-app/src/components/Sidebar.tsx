import React from 'react';
import type { Previsionnel, Synthese } from '../types';
import { STATUTS } from '../config/statuts';

interface SidebarProps {
  data: Previsionnel;
  synthese: Synthese | null;
}

function formatEuros(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value);
}

const Sidebar: React.FC<SidebarProps> = ({ data, synthese }) => {
  const statutInfo = STATUTS.find((s) => s.id === data.statut.statutJuridique);
  const annee1 = synthese?.resultatsAnnuels[0] ?? null;

  return (
    <aside className="hidden lg:flex flex-col w-72 flex-shrink-0 bg-[#082742] border-l border-[#0d3a5c] p-5 gap-6">
      {/* Statut section */}
      {statutInfo && (
        <div>
          <h2
            className="text-xs font-semibold text-[#be9f56] uppercase tracking-wide mb-2"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            Statut juridique
          </h2>
          <div className="rounded-xl bg-[#0d3a5c] border border-[#0d3a5c] p-4 shadow-sm">
            <p
              className="font-semibold text-[#be9f56] text-sm"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              {statutInfo.nom}
            </p>
            <p className="text-xs text-gray-300 mt-1 leading-relaxed">{statutInfo.resumeCourt}</p>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">{statutInfo.description}</p>
          </div>
        </div>
      )}

      {/* Synthèse chiffrée — année 1 */}
      {annee1 && (
        <div>
          <h2
            className="text-xs font-semibold text-[#be9f56] uppercase tracking-wide mb-2"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            Aperçu année 1
          </h2>
          <div className="rounded-xl bg-[#0d3a5c] border border-[#0d3a5c] p-4 shadow-sm flex flex-col gap-3">
            {/* CA */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-300">Chiffre d'affaires</span>
              <span className="text-sm font-semibold text-white">
                {formatEuros(annee1.chiffreAffairesHT)}
              </span>
            </div>

            <div className="border-t border-[#082742]" />

            {/* Charges totales */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-300">Charges totales</span>
              <span className="text-sm font-semibold text-red-400">
                {formatEuros(
                  annee1.chargesVariablesTotal +
                    annee1.chargesExternesTotal +
                    annee1.chargesPersonnelTotal +
                    annee1.cotisationsDirigeant
                )}
              </span>
            </div>

            <div className="border-t border-[#082742]" />

            {/* Résultat net */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-300">Résultat net</span>
              <span
                className={`text-sm font-bold ${
                  annee1.resultatNet >= 0 ? 'text-[#be9f56]' : 'text-red-400'
                }`}
              >
                {formatEuros(annee1.resultatNet)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Empty state when no synthèse */}
      {!annee1 && (
        <div className="rounded-xl bg-[#0d3a5c] border border-dashed border-[#be9f56]/30 p-4 text-center">
          <p className="text-xs text-gray-400">
            Complétez les étapes pour voir votre synthèse financière.
          </p>
        </div>
      )}
    </aside>
  );
};

export { Sidebar };
export default Sidebar;
