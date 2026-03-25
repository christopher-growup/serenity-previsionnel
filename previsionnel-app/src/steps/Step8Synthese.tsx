import type { Previsionnel, Synthese } from '../types';

interface Props {
  data: Previsionnel;
  synthese: Synthese | null;
  onSave: () => void;
}

export function Step8Synthese({ data: _data, synthese: _synthese, onSave: _onSave }: Props) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Étape 8 — Synthèse</h2>
      <p className="text-gray-500">À venir...</p>
    </div>
  );
}
