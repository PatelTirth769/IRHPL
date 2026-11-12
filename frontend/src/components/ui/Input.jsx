import { forwardRef } from 'react';

const Input = forwardRef(({ label, error, ...props }, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-gray-900 mb-1.5">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        ref={ref}
        className={`w-full h-11 px-4 bg-white border rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all ${
          error ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-blue-500'
        }`}
        {...props}
      />
      {error && <p className="mt-1.5 text-sm text-red-500">{error.message}</p>}
    </div>
  );
});
Input.displayName = 'Input';
export default Input;
