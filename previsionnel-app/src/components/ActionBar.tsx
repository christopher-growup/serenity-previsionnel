interface Props {
  currentStep: number;
  onPrevious: () => void;
  onNext: () => void;
  onSave: () => void;
}

export function ActionBar({ currentStep, onPrevious, onNext, onSave }: Props) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 flex justify-between items-center z-10">
      <button
        onClick={onPrevious}
        disabled={currentStep <= 1}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        ← Précédent
      </button>
      <button
        onClick={onSave}
        className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700"
      >
        Sauvegarder
      </button>
      <button
        onClick={onNext}
        disabled={currentStep >= 8}
        className="px-4 py-2 text-sm font-medium text-white bg-teal-600 border border-transparent rounded-md hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Suivant →
      </button>
    </div>
  );
}
