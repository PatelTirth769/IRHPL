import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const PasswordInput = forwardRef(({ label, error, rightElement, showStrength, icon: Icon, value, className = '', ...props }, ref) => {
  const [show, setShow] = useState(false);

  const calculateStrength = (pwd) => {
    if (!pwd) return { text: '', color: 'bg-slate-200', pct: 0, textColor: 'text-slate-400' };
    if (pwd.length < 8) return { text: 'Weak', color: 'bg-rose-500', pct: 33, textColor: 'text-rose-600' };
    if (!/[0-9]/.test(pwd) || !/[a-zA-Z]/.test(pwd)) return { text: 'Medium', color: 'bg-amber-500', pct: 66, textColor: 'text-amber-600' };
    return { text: 'Strong', color: 'bg-emerald-500', pct: 100, textColor: 'text-emerald-600' };
  };

  const strength = calculateStrength(value);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1.5">
        {label && <label className="block text-sm font-semibold text-slate-800">{label}</label>}
        {rightElement}
      </div>
      <div className="relative">
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          ref={ref}
          type={show ? 'text' : 'password'}
          className={`w-full h-11 ${Icon ? 'pl-10 pr-10' : 'px-4 pr-10'} bg-white border rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all ${
            error ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20' : 'border-slate-300 hover:border-slate-400 focus:border-blue-600'
          } ${className}`}
          value={value}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          tabIndex={-1}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {error && <p className="mt-1.5 text-xs font-medium text-rose-500">{error.message}</p>}
      
      {showStrength && value && !error && (
        <div className="mt-2 space-y-1">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-medium">Password strength</span>
            <span className={`font-semibold ${strength.textColor}`}>{strength.text}</span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${strength.color}`}
              style={{ width: `${strength.pct}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
});
PasswordInput.displayName = 'PasswordInput';
export default PasswordInput;
