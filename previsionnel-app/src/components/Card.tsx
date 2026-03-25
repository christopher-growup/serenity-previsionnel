import React from 'react';

interface CardProps {
  selected: boolean;
  onClick: () => void;
  title: string;
  description: string;
  badge?: string;
}

const Card: React.FC<CardProps> = ({ selected, onClick, title, description, badge }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full text-left rounded-2xl border-2 p-4 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#be9f56]/50
        ${selected
          ? 'border-[#be9f56] bg-[#f5f0e4] shadow-md'
          : 'border-[#e8e6e1] bg-white hover:bg-[#f8f7f5] hover:border-[#e8e6e1] hover:shadow-sm'
        }
      `}
      aria-pressed={selected}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3
              className={`font-semibold text-sm ${selected ? 'text-[#082742]' : 'text-[#082742]'}`}
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              {title}
            </h3>
            {badge && (
              <span className="inline-block text-xs font-medium bg-[#f5f0e4] text-[#be9f56] px-2 py-0.5 rounded-full border border-[#be9f56]/30">
                {badge}
              </span>
            )}
          </div>
          <p className={`text-xs leading-relaxed ${selected ? 'text-[#082742]' : 'text-gray-500'}`}>
            {description}
          </p>
        </div>

        {/* Selection indicator */}
        <div
          className={`
            mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center
            ${selected ? 'border-[#be9f56] bg-[#be9f56]' : 'border-gray-300'}
          `}
        >
          {selected && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>
    </button>
  );
};

export default Card;
