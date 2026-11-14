import { Eye, Edit, Trash2 } from 'lucide-react';

const StatusBadge = ({ status }) => {
  const map = {
    'Active': { color: 'bg-emerald-100 text-emerald-700' },
    'Expired': { color: 'bg-red-100 text-red-700' },
    'Under Process': { color: 'bg-amber-100 text-amber-700' },
    'Reverted': { color: 'bg-purple-100 text-purple-700' },
  };
  const { color } = map[status] || { color: 'bg-gray-100 text-gray-700' };
  return (
    <span className={`px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-md ${color}`}>
      {status || 'Unknown'}
    </span>
  );
};

const ExpiringBadge = ({ dateStr }) => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  const now = new Date();
  const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  if (d < now) {
    return <span className="ml-1.5 inline-flex items-center w-2 h-2 rounded-full bg-red-500 shrink-0" title="Expired" />;
  } else if (d <= thirtyDays) {
    return <span className="ml-1.5 inline-flex items-center w-2 h-2 rounded-full bg-amber-500 shrink-0" title="Expiring soon" />;
  }
  return null;
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const EmployeeTable = ({ employees, onView, onEdit, onDelete }) => {
  return (
    <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200">
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead className="bg-slate-50 border-b border-slate-200 text-gray-500 font-medium">
          <tr>
            <th className="px-4 py-3.5">Employee</th>
            <th className="px-4 py-3.5">Department</th>
            <th className="px-4 py-3.5">Airport Name</th>
            <th className="px-4 py-3.5">Pass Type</th>
            <th className="px-4 py-3.5">Status</th>
            <th className="px-4 py-3.5 min-w-[175px]">Expiries</th>
            <th className="px-4 py-3.5 text-right min-w-[100px]">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {employees.map(emp => (
            <tr key={emp.id} className="hover:bg-slate-50/60 transition-colors">
              <td className="px-4 py-3.5">
                <div className="font-semibold text-gray-900">{emp.fullName}</div>
                <div className="text-xs mt-0.5 flex items-center gap-1">
                  <span className="text-gray-400 font-medium">ID:</span>
                  <span className="text-gray-600 font-medium">{emp.employeeId || '-'}</span>
                </div>
              </td>
              <td className="px-4 py-3.5 text-gray-600">{emp.department || '-'}</td>
              <td className="px-4 py-3.5 text-gray-600">{emp.airportName || '-'}</td>
              <td className="px-4 py-3.5 text-gray-600 font-medium">{emp.passType || '-'}</td>
              <td className="px-4 py-3.5">
                <StatusBadge status={emp.passStatus} />
              </td>
              <td className="px-4 py-3.5 min-w-[175px]">
                <div className="flex flex-col gap-1 text-[13px]">
                  <div className="flex items-center">
                    <span className="w-12 text-gray-400">Pass:</span>
                    <span className="font-medium text-gray-700">{formatDate(emp.passExpiryDate)}</span>
                    <ExpiringBadge dateStr={emp.passExpiryDate} />
                  </div>
                  <div className="flex items-center">
                    <span className="w-12 text-gray-400">AVSEC:</span>
                    <span className="font-medium text-gray-700">{formatDate(emp.avsecExpiry)}</span>
                    <ExpiringBadge dateStr={emp.avsecExpiry} />
                  </div>
                  <div className="flex items-center">
                    <span className="w-12 text-gray-400">C&A:</span>
                    <span className="font-medium text-gray-700">{formatDate(emp.caExpiry)}</span>
                    <ExpiringBadge dateStr={emp.caExpiry} />
                  </div>
                </div>
              </td>
              <td className="px-4 py-3.5 text-right min-w-[100px]">
                <div className="flex items-center justify-end gap-1.5">
                  <button
                    onClick={() => onView(emp)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    title="View Details"
                    aria-label="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onEdit(emp)}
                    className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                    title="Edit Employee"
                    aria-label="Edit Employee"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(emp)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Delete Employee"
                    aria-label="Delete Employee"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeeTable;
