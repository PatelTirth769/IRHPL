import { forwardRef } from 'react';

const Input = forwardRef(({ label, error, icon: Icon, leftElement, className = '', ...props }, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-slate-800 mb-1.5">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {(Icon || leftElement) && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            {Icon ? <Icon className="w-4 h-4" /> : leftElement}
          </div>
        )}
        <input
          ref={ref}
          className={`w-full h-11 ${Icon || leftElement ? 'pl-10 pr-4' : 'px-4'} bg-white border rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all ${
            error ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20' : 'border-slate-300 hover:border-slate-400 focus:border-blue-600'
          } ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1.5 text-xs font-medium text-rose-500">{error.message}</p>}
    </div>
  );
});
Input.displayName = 'Input';
export default Input;
