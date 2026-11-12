import { Sparkles } from 'lucide-react';

const Badge = ({ children }) => {
  return (
    <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-sm font-semibold mb-8 animate-fade-in backdrop-blur-sm">
      <Sparkles className="w-4 h-4 mr-2 text-brand-amber" />
      {children}
    </div>
  );
};

export default Badge;
