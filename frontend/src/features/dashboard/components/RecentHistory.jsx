import { History, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const RecentHistory = ({ history, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm min-h-[450px] p-6 animate-pulse">
         <div className="h-6 w-48 bg-slate-100 rounded mb-2"></div>
         <div className="h-4 w-32 bg-slate-100 rounded mb-8"></div>
         <div className="space-y-4">
           {[...Array(3)].map((_, i) => (
             <div key={i} className="h-16 bg-slate-50 rounded-lg"></div>
           ))}
         </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] min-h-[450px]">
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center gap-2 mb-1">
          <History className="w-5 h-5 text-gray-600" />
          <h2 className="text-[17px] font-bold text-gray-900">Recent Employee History</h2>
        </div>
        <p className="text-[13px] text-gray-500 ml-7">Your last 5 registered employees</p>
      </div>

      <div className="p-6 flex flex-col items-center justify-center h-full min-h-[300px]">
        {history.length === 0 ? (
          <div className="text-center max-w-md mx-auto">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-[17px] font-bold text-gray-900">No employees added yet</h3>
          </div>
        ) : (
          <div className="w-full space-y-3">
            {history.map((item) => (
               <div key={item.id} className="p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors flex justify-between items-center">
                 <div>
                   <p className="font-semibold text-gray-900">{item.fullName || 'Unnamed Employee'}</p>
                   <p className="text-sm text-gray-500">{item.department || item.employeeId || 'Employee'}</p>
                 </div>
                 <Link to="/dashboard/employee-master" className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100">
                   View
                 </Link>
               </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentHistory;
