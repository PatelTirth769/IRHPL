import { Construction } from 'lucide-react';

const ComingSoon = ({ title = 'Coming Soon' }) => {
  return (
    <div className="animate-fade-in max-w-7xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-500 mt-1">This feature is currently under development.</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl flex flex-col items-center justify-center h-[500px] text-center p-6">
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
          <Construction className="w-10 h-10 text-blue-500" />
        </div>
        <h2 className="text-[17px] font-bold text-gray-900 mb-2">Coming Soon</h2>
        <p className="text-[14px] text-gray-500 max-w-sm">
          We're working hard to bring you this feature. Check back later!
        </p>
      </div>
    </div>
  );
};

export default ComingSoon;
