import React from 'react';

interface ProgressBarProps {
  currentStep: number;
  onStepClick: (step: number) => void;
}

const STEPS = [
  'Mon projet',
  'Mon statut',
  'Mes offres',
  'Investissements',
  'Mes ventes',
  'Mes charges',
  'Rémunération',
  'Synthèse',
];

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, onStepClick }) => {
  return (
    <div className="w-full px-4 py-4 bg-[#082742] border-b border-[#0d3a5c]">
      <div className="flex items-center justify-between max-w-5xl mx-auto overflow-x-auto">
        {STEPS.map((label, index) => {
          const step = index + 1;
          const isCompleted = step < currentStep;
          const isActive = step === currentStep;

          return (
            <React.Fragment key={step}>
              <button
                onClick={() => onStepClick(step)}
                className="flex flex-col items-center gap-1 min-w-[64px] group"
                aria-label={`Étape ${step}: ${label}`}
                aria-current={isActive ? 'step' : undefined}
              >
                <div
                  className={`
                    w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold
                    transition-all duration-200
                    ${isCompleted
                      ? 'bg-green-500 text-white'
                      : isActive
                      ? 'bg-[#be9f56] text-white ring-2 ring-[#caa253]'
                      : 'bg-[#0d3a5c] text-gray-400 group-hover:bg-[#0d3a5c]/80'
                    }
                  `}
                >
                  {isCompleted ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step
                  )}
                </div>
                <span
                  className={`
                    text-xs text-center leading-tight max-w-[64px]
                    ${isActive ? 'text-[#be9f56] font-semibold' : isCompleted ? 'text-green-400' : 'text-gray-400'}
                  `}
                >
                  {label}
                </span>
              </button>

              {index < STEPS.length - 1 && (
                <div
                  className={`
                    flex-1 h-0.5 mx-1 mt-[-16px]
                    ${step < currentStep ? 'bg-green-500' : 'bg-[#0d3a5c]'}
                  `}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export { ProgressBar };
export default ProgressBar;
