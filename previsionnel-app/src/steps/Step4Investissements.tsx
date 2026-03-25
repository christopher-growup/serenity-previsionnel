import type { Previsionnel } from '../types';

interface Props {
  data: Previsionnel;
  updateData: (partial: Partial<Previsionnel>) => void;
}

export function Step4Investissements({ data: _data, updateData: _updateData }: Props) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Étape 4 — Investissements &amp; Financements</h2>
      <p className="text-gray-500">À venir...</p>
    </div>
  );
}
