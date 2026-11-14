import { Users, MapPin, Crown, Clock, ArrowRight } from 'lucide-react';

const typeConfig = {
  calculator: {
    icon: Users,
    accent: 'bg-blue-500',
    iconBg: 'bg-blue-50 text-blue-600 border-blue-100',
    badgeText: 'Employees',
    actionText: 'View list',
  },
  pin: {
    icon: MapPin,
    accent: 'bg-emerald-500',
    iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    badgeText: 'Applications',
    actionText: 'Manage passes',
  },
  crown: {
    icon: Crown,
    accent: 'bg-purple-500',
    iconBg: 'bg-purple-50 text-purple-600 border-purple-100',
    badgeText: 'Current Plan',
    actionText: 'Free Tier',
  },
  clock: {
    icon: Clock,
    accent: 'bg-amber-500',
    iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
    badgeText: 'Attention',
    actionText: 'View expiring',
  }
};

const StatCard = ({ title, value, type = 'calculator', isLoading, onClick }) => {
  const config = typeConfig[type] || typeConfig.calculator;
  const Icon = config.icon;
  const isClickable = !!onClick;

  if (isLoading) {
    return (
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm animate-pulse min-h-[125px]">
        <div className="flex items-center justify-between mb-3">
          <div className="h-3.5 bg-slate-100 rounded w-1/2"></div>
          <div className="w-9 h-9 rounded-xl bg-slate-100"></div>
        </div>
        <div className="h-7 bg-slate-100 rounded w-1/3 mb-2"></div>
        <div className="h-3 bg-slate-100 rounded w-2/5"></div>
      </div>
    );
  }

  return (
    <div
      className={`
        relative overflow-hidden bg-white p-5 rounded-2xl border border-slate-200/90
        shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_20px_-4px_rgba(0,0,0,0.08)]
        transition-all duration-200 flex flex-col justify-between group
        ${isClickable ? 'cursor-pointer hover:-translate-y-1 hover:border-slate-300' : ''}
      `}
      onClick={onClick}
    >
      {/* Top Accent Stripe */}
      <div className={`absolute top-0 left-0 right-0 h-[3px] ${config.accent} opacity-80 group-hover:opacity-100 transition-opacity`} />

      {/* Header: Title and Icon */}
      <div className="flex items-center justify-between gap-3 mb-2">
        <span className="text-[13px] font-semibold text-slate-500 tracking-tight">
          {title}
        </span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 ${config.iconBg}`}>
          <Icon className="w-4 h-4" strokeWidth={2.2} />
        </div>
      </div>

      {/* Main Metric Value */}
      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-3xl font-extrabold text-slate-900 tracking-tight leading-none font-sans">
          {value}
        </span>
      </div>

      {/* Footer / Context Line */}
      <div className="pt-2 border-t border-slate-100/80 flex items-center justify-between text-xs font-medium">
        {isClickable ? (
          <span className="text-slate-400 group-hover:text-blue-600 flex items-center gap-1 transition-colors">
            {config.actionText}
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </span>
        ) : (
          <span className="text-slate-400">
            {config.actionText}
          </span>
        )}
        <span className="text-[11px] text-slate-400/80 uppercase font-semibold">
          {config.badgeText}
        </span>
      </div>
    </div>
  );
};

export default StatCard;
