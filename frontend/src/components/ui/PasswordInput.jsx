import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const PasswordInput = forwardRef(({ label, error, rightElement, showStrength, value, ...props }, ref) => {
  const [show, setShow] = useState(false);

  const calculateStrength = (pwd) => {
    if (!pwd) return { text: '', color: 'bg-gray-200' };
    if (pwd.length < 8) return { text: 'Weak', color: 'bg-red-500 w-1/3' };
    if (!/[0-9]/.test(pwd) || !/[a-zA-Z]/.test(pwd)) return { text: 'Medium', color: 'bg-yellow-500 w-2/3' };
    return { text: 'Strong', color: 'bg-green-500 w-full' };
  };

  const strength = calculateStrength(value);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1.5">
        {label && <label className="block text-sm font-semibold text-gray-900">{label}</label>}
        {rightElement}
      </div>
      <div className="relative">
        <input
          ref={ref}
          type={show ? 'text' : 'password'}
          className={`w-full h-11 px-4 pr-10 bg-white border rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all ${
            error ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-blue-500'
          }`}
          value={value}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
        >
          {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
      {error && <p className="mt-1.5 text-sm text-red-500">{error.message}</p>}
      
      {showStrength && value && !error && (
        <div className="mt-2">
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="text-gray-500">Password strength</span>
            <span className={`font-medium ${strength.text === 'Weak' ? 'text-red-500' : strength.text === 'Medium' ? 'text-yellow-600' : 'text-green-600'}`}>{strength.text}</span>
          </div>
          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full transition-all duration-300 ${strength.color}`} />
          </div>
        </div>
      )}
    </div>
  );
});
PasswordInput.displayName = 'PasswordInput';
export default PasswordInput;
