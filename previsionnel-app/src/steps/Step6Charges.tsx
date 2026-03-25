import type { Previsionnel } from '../types';

interface Props {
  data: Previsionnel;
  updateData: (partial: Partial<Previsionnel>) => void;
}

export function Step6Charges({ data: _data, updateData: _updateData }: Props) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Étape 6 — Mes charges</h2>
      <p className="text-gray-500">À venir...</p>
    </div>
  );
}
