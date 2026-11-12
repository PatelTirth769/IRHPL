import { Crown } from 'lucide-react';

const WelcomeHeader = ({ user }) => {
  const firstName = user?.name ? user.name.split(' ')[0] : (user?.email?.split('@')[0] || 'User');
  
  // Real active user count could go here later if passed in via props
  const onlineCount = 1; 

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-[32px] md:text-[40px] font-bold text-[#1e293b] tracking-tight mb-1">
          Welcome back, {firstName}!
        </h1>
        <p className="text-[#64748b] text-[15px]">
          Here is an overview of your account and recent activity.
        </p>
      </div>

      <div className="flex items-center gap-3 self-start md:self-auto">

        <div className="bg-white border border-slate-200 rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-sm">
          <Crown className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Free Plan</span>
        </div>
      </div>
    </div>
  );
};

export default WelcomeHeader;
