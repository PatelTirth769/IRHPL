import React, { useEffect, useState } from 'react';
import { auditService } from '../services/audit.service';
import { Download, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const AuditLog = () => {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [actionFilter, setActionFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [targetIdFilter, setTargetIdFilter] = useState('');

  useEffect(() => {
    fetchLogs();
  }, [actionFilter, targetIdFilter]);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const filters = {};
      if (actionFilter) filters.action = actionFilter;
      if (targetIdFilter) filters.targetId = targetIdFilter;
      
      const res = await auditService.getLogs(filters);
      let data = res.data || [];
      
      // Client side date filtering
      if (dateFilter) {
        data = data.filter(log => log.timestamp && log.timestamp.startsWith(dateFilter));
      }
      
      setLogs(data);
    } catch (error) {
      toast.error('Failed to load audit logs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Re-filter when date filter changes
    fetchLogs();
  }, [dateFilter]);

  const handleExportCSV = () => {
    if (logs.length === 0) {
      toast.error('No logs to export');
      return;
    }

    const headers = ['Timestamp', 'Action', 'Actor ID', 'Target ID', 'Target Type', 'Description'];
    const csvContent = [
      headers.join(','),
      ...logs.map(log => {
        const row = [
          log.timestamp,
          log.action,
          log.actorId,
          log.targetId,
          log.targetType,
          `"${(log.description || '').replace(/"/g, '""')}"`
        ];
        return row.join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>
          <p className="text-sm text-gray-500 mt-1">Track all system activities and record changes.</p>
        </div>
        <button 
          onClick={handleExportCSV}
          className="mt-4 md:mt-0 flex items-center px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium text-sm shadow-sm"
        >
          <Download className="w-4 h-4 mr-2" />
          Export to CSV
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search by Target/Pass ID..." 
              value={targetIdFilter}
              onChange={(e) => setTargetIdFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            />
          </div>
          <div className="w-full md:w-48">
            <select 
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              <option value="">All Actions</option>
              <option value="PASS_CREATED">Pass Created</option>
              <option value="STATUS_UPDATED">Status Updated</option>
              <option value="DOCUMENTS_UPDATED">Documents Updated</option>
              <option value="PASS_CANCELLED">Pass Cancelled</option>
            </select>
          </div>
          <div className="w-full md:w-48">
            <input 
              type="date" 
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            />
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-gray-500 font-medium">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Target ID</th>
                <th className="px-6 py-4">Actor ID</th>
                <th className="px-6 py-4">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">Loading audit logs...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No audit logs found matching criteria.</td>
                </tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-gray-500">
                      {formatDate(log.timestamp)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-md bg-slate-100 text-slate-700">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-600">
                      {log.targetId}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-600">
                      {log.actorId}
                    </td>
                    <td className="px-6 py-4 text-gray-900 truncate max-w-xs" title={log.description}>
                      {log.description}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLog;
