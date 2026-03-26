import React from 'react';
import Tooltip from './Tooltip';

interface FormFieldProps {
  label: string;
  tooltip?: string;
  type?: 'text' | 'number' | 'date' | 'textarea';
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  suffix?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  tooltip,
  type = 'text',
  value,
  onChange,
  placeholder,
  suffix,
}) => {
  const inputClasses =
    'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors bg-white';

  return (
    <div className="flex flex-col gap-1">
      {/* Label row */}
      <div className="flex items-center gap-1.5">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        {tooltip && <Tooltip text={tooltip} />}
      </div>

      {/* Input row */}
      <div className="relative flex items-center">
        {type === 'textarea' ? (
          <textarea
            className={`${inputClasses} resize-y min-h-[80px]`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={3}
          />
        ) : (
          <input
            type={type}
            className={`${inputClasses} ${suffix ? 'pr-10' : ''}`}
            value={type === 'number' && (value === 0 || value === '0') ? '' : value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
          />
        )}

        {suffix && type !== 'textarea' && (
          <span className="absolute right-3 text-sm text-gray-400 pointer-events-none select-none">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
};

export default FormField;
