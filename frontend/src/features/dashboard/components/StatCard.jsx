import { Calculator, MapPin, Crown, Clock } from 'lucide-react';

const iconMap = {
  calculator: { icon: Calculator, bg: 'bg-blue-50', text: 'text-blue-500' },
  pin: { icon: MapPin, bg: 'bg-emerald-50', text: 'text-emerald-500' },
  crown: { icon: Crown, bg: 'bg-purple-50', text: 'text-purple-500' },
  clock: { icon: Clock, bg: 'bg-amber-50', text: 'text-amber-500' }
};

const StatCard = ({ title, value, type = 'calculator', isLoading, onClick }) => {
  const { icon: Icon, bg, text } = iconMap[type] || iconMap.calculator;

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 shrink-0"></div>
          <div className="space-y-2 w-full">
            <div className="h-4 bg-slate-100 rounded w-1/2"></div>
            <div className="h-8 bg-slate-100 rounded w-1/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`bg-white p-5 lg:p-6 rounded-2xl border border-slate-200 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex items-center gap-4 transition-all ${onClick ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md' : 'hover:shadow-sm'}`}
      onClick={onClick}
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bg} ${text} shrink-0`}>
        <Icon className="w-6 h-6" strokeWidth={2.5} />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 mb-0.5">{title}</p>
        <p className="text-[28px] font-bold text-gray-900 leading-none">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;
