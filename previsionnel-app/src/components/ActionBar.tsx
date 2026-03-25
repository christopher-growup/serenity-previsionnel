interface Props {
  currentStep: number;
  onPrevious: () => void;
  onNext: () => void;
  onSave: () => void;
}

export function ActionBar({ currentStep, onPrevious, onNext, onSave }: Props) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e8e6e1] px-6 py-3 flex justify-between items-center z-10 shadow-md">
      <button
        onClick={onPrevious}
        disabled={currentStep <= 1}
        className="px-4 py-2 text-sm font-medium text-[#082742] bg-white border-2 border-[#082742] rounded-xl hover:bg-[#f8f7f5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        style={{ fontFamily: "'Poppins', sans-serif" }}
      >
        ← Précédent
      </button>
      <button
        onClick={onSave}
        className="px-4 py-2 text-sm font-medium text-white bg-[#be9f56] rounded-xl hover:bg-[#caa253] transition-colors shadow-sm"
        style={{ fontFamily: "'Poppins', sans-serif" }}
      >
        Sauvegarder
      </button>
      <button
        onClick={onNext}
        disabled={currentStep >= 8}
        className="px-4 py-2 text-sm font-medium text-white bg-[#082742] border border-transparent rounded-xl hover:bg-[#0d3a5c] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        style={{ fontFamily: "'Poppins', sans-serif" }}
      >
        Suivant →
      </button>
    </div>
  );
}
