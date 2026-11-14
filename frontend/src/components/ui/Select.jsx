import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

const Select = forwardRef(({ label, error, options = [], className = '', placeholder, ...props }, ref) => {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-sm font-semibold text-gray-700">
          {label} {props.required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          className={`
            w-full h-11 px-3.5 bg-white border rounded-lg text-[15px] appearance-none
            transition-all duration-200 outline-none
            ${error
              ? 'border-red-300 text-red-900 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
              : 'border-slate-200 text-gray-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 hover:border-slate-300'
            }
            ${props.disabled ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : ''}
          `}
          {...props}
        >
          {!options.some(opt => opt.value === '') && (
            <option value="" disabled className="text-gray-400">{placeholder || 'Select an option'}</option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <ChevronDown className={`w-4 h-4 ${error ? 'text-red-400' : 'text-gray-400'}`} />
        </div>
      </div>
      {error && (
        <p className="text-[13px] font-medium text-red-500 mt-0.5">{error?.message}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
