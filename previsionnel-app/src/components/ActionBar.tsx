interface Props {
  currentStep: number;
  onPrevious: () => void;
  onNext: () => void;
  onSave: () => void;
  onHelp: () => void;
}

export function ActionBar({ currentStep, onPrevious, onNext, onSave, onHelp }: Props) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e8e6e1] px-6 py-3 flex justify-between items-center z-10 shadow-md">
      <div className="flex items-center gap-2">
        <button
          onClick={onPrevious}
          disabled={currentStep <= 1}
          className="px-4 py-2 text-sm font-medium text-[#082742] bg-white border-2 border-[#082742] rounded-xl hover:bg-[#f8f7f5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          ← Précédent
        </button>
        <button
          onClick={onHelp}
          className="px-3 py-2 text-sm font-medium text-gray-500 bg-gray-100 rounded-xl hover:bg-gray-200 hover:text-[#082742] transition-colors"
          style={{ fontFamily: "'Poppins', sans-serif" }}
          title="Aide et guide d'utilisation"
        >
          <svg className="w-4 h-4 inline-block mr-1 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Aide
        </button>
      </div>
      <div className="flex flex-col items-center gap-1">
        <button
          onClick={onSave}
          className="px-4 py-2 text-sm font-medium text-white bg-[#be9f56] rounded-xl hover:bg-[#caa253] transition-colors shadow-sm"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          Sauvegarder
        </button>
        <span className="text-[9px] text-gray-400" style={{ fontFamily: "'Lato', sans-serif" }}>
          Conçu par <a href="https://growup-consulting.fr" target="_blank" rel="noopener noreferrer" className="hover:text-[#be9f56] transition-colors">Grow Up Consulting</a>
        </span>
      </div>
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
