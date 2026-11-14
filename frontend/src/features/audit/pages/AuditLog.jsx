import React, { useEffect, useState, useMemo } from 'react';
import { auditService } from '../services/audit.service';
import { 
  Download, 
  Search, 
  Copy, 
  Check, 
  Eye, 
  X, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight,
  ShieldAlert,
  Clock,
  PlusCircle,
  RefreshCw,
  Trash2,
  Layers
} from 'lucide-react';
import toast from 'react-hot-toast';

const KNOWN_SPECIFIC_ACTIONS = [
  { value: 'ORG_CHAIN_CREATED', label: 'Org Chain Created', category: 'CREATION' },
  { value: 'ORG_CHAIN_DELETED', label: 'Org Chain Deleted', category: 'DELETION' },
  { value: 'PASS_CREATED', label: 'Pass Created', category: 'CREATION' },
  { value: 'STATUS_UPDATED', label: 'Status Updated', category: 'UPDATION' },
  { value: 'DOCUMENTS_UPDATED', label: 'Documents Updated', category: 'UPDATION' },
  { value: 'PASS_CANCELLED', label: 'Pass Cancelled', category: 'DELETION' },
  { value: 'TRADE_LICENSE_CREATED', label: 'Trade License Created', category: 'CREATION' },
  { value: 'FACTORY_LICENSE_CREATED', label: 'Factory License Created', category: 'CREATION' },
  { value: 'POLLUTION_LICENSE_CREATED', label: 'Pollution License Created', category: 'CREATION' },
  { value: 'LICENSE_RENEWED', label: 'License Renewed', category: 'UPDATION' },
  { value: 'LICENSE_DELETED', label: 'License Deleted', category: 'DELETION' },
  { value: 'CHECKLIST_UPDATED', label: 'Checklist Updated', category: 'UPDATION' },
  { value: 'EMPLOYEE_CREATED', label: 'Employee Created', category: 'CREATION' },
  { value: 'EMPLOYEE_UPDATED', label: 'Employee Updated', category: 'UPDATION' },
  { value: 'EMPLOYEE_DELETED', label: 'Employee Deleted', category: 'DELETION' }
];

const TARGET_TYPES = [
  { value: 'ORG_CHAIN', label: 'Org Chain' },
  { value: 'PASS', label: 'Pass' },
  { value: 'LICENSE', label: 'License' },
  { value: 'CHECKLIST', label: 'Checklist' },
  { value: 'EMPLOYEE', label: 'Employee' },
  { value: 'USER', label: 'User' }
];

const getActionCategory = (action) => {
  const act = String(action || '').toUpperCase();
  if (act.includes('DELETE') || act.includes('CANCEL')) {
    return 'DELETION';
  }
  if (act.includes('CREATE') || act.includes('SUBMIT') || act.includes('ADD')) {
    return 'CREATION';
  }
  if (act.includes('UPDATE') || act.includes('RENEW') || act.includes('EDIT') || act.includes('CHANGE')) {
    return 'UPDATION';
  }
  return 'OTHER';
};

const formatActionName = (action) => {
  if (!action) return '-';
  const found = KNOWN_SPECIFIC_ACTIONS.find(a => a.value === action);
  if (found) return found.label;
  return action
    .toLowerCase()
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
};

const getCategoryBadgeStyle = (category) => {
  switch (category) {
    case 'CREATION':
      return 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-1 ring-emerald-200/50';
    case 'UPDATION':
      return 'bg-blue-50 text-blue-700 border-blue-300 ring-1 ring-blue-200/50';
    case 'DELETION':
      return 'bg-rose-50 text-rose-700 border-rose-300 ring-1 ring-rose-200/50';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-300';
  }
};

const formatTimestamp = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return String(dateStr);
  return d.toLocaleString('en-GB', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

const getLocalDateString = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-CA');
};

const formatShortId = (id) => {
  if (!id) return '-';
  const str = String(id);
  if (str.length <= 10) return str;
  return `${str.slice(0, 5)}...${str.slice(-4)}`;
};

const AuditLog = () => {
  const [allLogs, setAllLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState(''); // '', 'CREATION', 'UPDATION', 'DELETION', or specific action
  const [targetTypeFilter, setTargetTypeFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Detail Modal
  const [selectedLog, setSelectedLog] = useState(null);
  const [copiedKey, setCopiedKey] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const res = await auditService.getLogs();
      const data = res.data || [];
      setAllLogs(data);
    } catch (error) {
      toast.error('Failed to load audit logs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(String(text));
    setCopiedKey(key);
    toast.success('Copied to clipboard', { duration: 1500 });
    setTimeout(() => setCopiedKey(''), 2000);
  };

  // Build list of all specific actions including any dynamically discovered ones
  const dynamicActionOptions = useMemo(() => {
    const existingValues = new Set(KNOWN_SPECIFIC_ACTIONS.map(a => a.value));
    const extra = [];
    allLogs.forEach(log => {
      if (log.action && !existingValues.has(log.action)) {
        existingValues.add(log.action);
        extra.push({
          value: log.action,
          label: formatActionName(log.action),
          category: getActionCategory(log.action)
        });
      }
    });
    return [...KNOWN_SPECIFIC_ACTIONS, ...extra];
  }, [allLogs]);

  // Counts by main category
  const categoryCounts = useMemo(() => {
    const counts = { ALL: allLogs.length, CREATION: 0, UPDATION: 0, DELETION: 0 };
    allLogs.forEach(log => {
      const cat = getActionCategory(log.action);
      if (counts[cat] !== undefined) {
        counts[cat] += 1;
      }
    });
    return counts;
  }, [allLogs]);

  // Client-side filtering supporting broad categories (CREATION, UPDATION, DELETION) + specific actions
  const filteredLogs = useMemo(() => {
    return allLogs.filter(log => {
      const logCategory = getActionCategory(log.action);

      // Action Filter: Broad category OR exact action match
      if (actionFilter) {
        if (actionFilter === 'CREATION') {
          if (logCategory !== 'CREATION') return false;
        } else if (actionFilter === 'UPDATION') {
          if (logCategory !== 'UPDATION') return false;
        } else if (actionFilter === 'DELETION') {
          if (logCategory !== 'DELETION') return false;
        } else if (log.action !== actionFilter) {
          return false;
        }
      }

      // Target Type filter
      if (targetTypeFilter && log.targetType !== targetTypeFilter) {
        return false;
      }

      // Date filter (handles local timezone accurately)
      if (dateFilter) {
        const localDate = getLocalDateString(log.timestamp);
        if (localDate !== dateFilter) {
          return false;
        }
      }

      // Search term filter
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase().trim();
        const matchesTargetId = log.targetId && String(log.targetId).toLowerCase().includes(term);
        const matchesActorId = log.actorId && String(log.actorId).toLowerCase().includes(term);
        const matchesDescription = log.description && String(log.description).toLowerCase().includes(term);
        const matchesAction = log.action && String(log.action).toLowerCase().includes(term);
        const matchesType = log.targetType && String(log.targetType).toLowerCase().includes(term);
        const matchesCategory = logCategory.toLowerCase().includes(term);

        if (!matchesTargetId && !matchesActorId && !matchesDescription && !matchesAction && !matchesType && !matchesCategory) {
          return false;
        }
      }

      return true;
    });
  }, [allLogs, actionFilter, targetTypeFilter, dateFilter, searchTerm]);

  // Pagination slice
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));
  const currentLogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLogs.slice(start, start + pageSize);
  }, [filteredLogs, currentPage, pageSize]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, actionFilter, targetTypeFilter, dateFilter, pageSize]);

  const hasActiveFilters = Boolean(searchTerm || actionFilter || targetTypeFilter || dateFilter);

  const resetFilters = () => {
    setSearchTerm('');
    setActionFilter('');
    setTargetTypeFilter('');
    setDateFilter('');
  };

  const handleExportCSV = () => {
    if (filteredLogs.length === 0) {
      toast.error('No logs to export');
      return;
    }

    const headers = ['Timestamp', 'Category', 'Action', 'Target Type', 'Target ID', 'Actor ID', 'Description'];
    const csvContent = [
      headers.join(','),
      ...filteredLogs.map(log => {
        const cat = getActionCategory(log.action);
        const row = [
          `"${log.timestamp || ''}"`,
          `"${cat}"`,
          `"${log.action || ''}"`,
          `"${log.targetType || ''}"`,
          `"${log.targetId || ''}"`,
          `"${log.actorId || ''}"`,
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
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Audit Log</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track all system activities, creations, updates, and deletions across the application.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchLogs}
            disabled={isLoading}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
            title="Refresh logs"
          >
            <RotateCcw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button 
            onClick={handleExportCSV}
            className="inline-flex items-center px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium text-sm shadow-sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Export to CSV
          </button>
        </div>
      </div>

      {/* Quick Category Action Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActionFilter('')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm border ${
            actionFilter === ''
              ? 'bg-slate-900 text-white border-slate-900 shadow'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>All Actions</span>
          <span className={`ml-1 px-1.5 py-0.2 rounded text-[10px] font-bold ${actionFilter === '' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-600'}`}>
            {categoryCounts.ALL}
          </span>
        </button>

        <button
          onClick={() => setActionFilter('CREATION')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm border ${
            actionFilter === 'CREATION'
              ? 'bg-emerald-700 text-white border-emerald-700 shadow'
              : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'
          }`}
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Creation</span>
          <span className={`ml-1 px-1.5 py-0.2 rounded text-[10px] font-bold ${actionFilter === 'CREATION' ? 'bg-emerald-900 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
            {categoryCounts.CREATION}
          </span>
        </button>

        <button
          onClick={() => setActionFilter('UPDATION')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm border ${
            actionFilter === 'UPDATION'
              ? 'bg-blue-700 text-white border-blue-700 shadow'
              : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50'
          }`}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Updation</span>
          <span className={`ml-1 px-1.5 py-0.2 rounded text-[10px] font-bold ${actionFilter === 'UPDATION' ? 'bg-blue-900 text-white' : 'bg-blue-100 text-blue-800'}`}>
            {categoryCounts.UPDATION}
          </span>
        </button>

        <button
          onClick={() => setActionFilter('DELETION')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm border ${
            actionFilter === 'DELETION'
              ? 'bg-rose-700 text-white border-rose-700 shadow'
              : 'bg-white text-rose-700 border-rose-200 hover:bg-rose-50'
          }`}
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Deletion</span>
          <span className={`ml-1 px-1.5 py-0.2 rounded text-[10px] font-bold ${actionFilter === 'DELETION' ? 'bg-rose-900 text-white' : 'bg-rose-100 text-rose-800'}`}>
            {categoryCounts.DELETION}
          </span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search by ID, action, description..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white transition-all"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Action Filter with Primary Categories and Specific Actions */}
          <div>
            <select 
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white transition-all font-medium text-slate-700"
            >
              <option value="">All Actions</option>
              
              <optgroup label="── Action Types ──">
                <option value="CREATION">Creation (All Creates)</option>
                <option value="UPDATION">Updation (All Updates)</option>
                <option value="DELETION">Deletion (All Deletes)</option>
              </optgroup>

              <optgroup label="── Specific Actions ──">
                {dynamicActionOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label} ({opt.category})
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Target Type Filter */}
          <div>
            <select 
              value={targetTypeFilter}
              onChange={(e) => setTargetTypeFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white transition-all"
            >
              <option value="">All Target Types</option>
              {TARGET_TYPES.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          <div className="relative">
            <input 
              type="date" 
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white transition-all"
            />
            {dateFilter && (
              <button 
                onClick={() => setDateFilter('')}
                className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                title="Clear date"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Summary & Clear Action */}
        {hasActiveFilters && (
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing <strong>{filteredLogs.length}</strong> matching results of {allLogs.length} total entries
            </span>
            <button
              onClick={resetFilters}
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse min-w-[950px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                <th className="px-4 py-3.5 w-44">Timestamp</th>
                <th className="px-4 py-3.5 w-48">Action Type</th>
                <th className="px-4 py-3.5 w-44">Target</th>
                <th className="px-4 py-3.5 w-40">Actor</th>
                <th className="px-4 py-3.5">Description</th>
                <th className="px-4 py-3.5 w-20 text-center">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                    <div className="inline-flex items-center gap-2">
                      <RotateCcw className="w-4 h-4 animate-spin text-blue-500" />
                      Loading audit logs...
                    </div>
                  </td>
                </tr>
              ) : currentLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                    <ShieldAlert className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-medium text-slate-700">No audit logs found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {hasActiveFilters ? 'Try adjusting or clearing your filters.' : 'System activities will appear here as they occur.'}
                    </p>
                  </td>
                </tr>
              ) : (
                currentLogs.map(log => {
                  const category = getActionCategory(log.action);
                  const actionName = formatActionName(log.action);

                  return (
                    <tr 
                      key={log.id} 
                      className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                      onClick={() => setSelectedLog(log)}
                    >
                      {/* Timestamp */}
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap text-xs font-medium">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span>{formatTimestamp(log.timestamp)}</span>
                        </div>
                      </td>

                      {/* Action Category & Name (Prominently displaying CREATION / UPDATION / DELETION) */}
                      <td className="px-4 py-3">
                        <div className="flex flex-col items-start gap-1">
                          <span className={`inline-flex items-center px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded-md border ${getCategoryBadgeStyle(category)}`}>
                            {category}
                          </span>
                          <span className="text-[11px] text-slate-600 font-medium">
                            {actionName}
                          </span>
                        </div>
                      </td>

                      {/* Target (Type & Short ID with Copy) */}
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col gap-0.5">
                          {log.targetType && (
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                              {log.targetType}
                            </span>
                          )}
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                              {formatShortId(log.targetId)}
                            </span>
                            {log.targetId && (
                              <button
                                onClick={() => handleCopy(log.targetId, `target-${log.id}`)}
                                className="text-slate-400 hover:text-slate-700 transition-colors p-0.5 rounded hover:bg-slate-200/60"
                                title="Copy full Target ID"
                              >
                                {copiedKey === `target-${log.id}` ? (
                                  <Check className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Actor ID with Copy */}
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs text-slate-600 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded">
                            {formatShortId(log.actorId)}
                          </span>
                          {log.actorId && (
                            <button
                              onClick={() => handleCopy(log.actorId, `actor-${log.id}`)}
                              className="text-slate-400 hover:text-slate-700 transition-colors p-0.5 rounded hover:bg-slate-200/60"
                              title="Copy full Actor ID"
                            >
                              {copiedKey === `actor-${log.id}` ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Description */}
                      <td className="px-4 py-3 text-slate-800 text-xs leading-relaxed max-w-md">
                        <p className="line-clamp-2" title={log.description}>
                          {log.description || '-'}
                        </p>
                      </td>

                      {/* View Details Button */}
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLog(log);
                          }}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination & Footer */}
        <div className="px-4 py-3 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="px-2 py-1 border border-slate-300 rounded bg-white text-xs font-medium focus:ring-1 focus:ring-blue-500 outline-none"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span className="text-slate-400">|</span>
            <span>
              Showing <strong>{filteredLogs.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</strong> to{' '}
              <strong>{Math.min(currentPage * pageSize, filteredLogs.length)}</strong> of{' '}
              <strong>{filteredLogs.length}</strong> logs
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1.5 border border-slate-300 rounded-md bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium inline-flex items-center gap-1 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Prev
            </button>
            <span className="px-3 py-1 font-medium text-slate-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1.5 border border-slate-300 rounded-md bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium inline-flex items-center gap-1 transition-colors"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Details Slide-Over / Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 text-xs font-bold uppercase rounded-md border ${getCategoryBadgeStyle(getActionCategory(selectedLog.action))}`}>
                  {getActionCategory(selectedLog.action)}
                </span>
                <span className="text-xs font-semibold text-slate-700">
                  {formatActionName(selectedLog.action)}
                </span>
                {selectedLog.targetType && (
                  <span className="px-2 py-0.5 text-xs font-medium text-slate-600 bg-slate-200/70 rounded">
                    {selectedLog.targetType}
                  </span>
                )}
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4 text-sm">
              {/* Description */}
              <div>
                <label className="text-xs font-semibold uppercase text-slate-400 block mb-1">
                  Description
                </label>
                <div className="p-3 bg-slate-50 rounded-lg text-slate-800 text-sm font-medium border border-slate-100">
                  {selectedLog.description || 'No description provided'}
                </div>
              </div>

              {/* Timestamp */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold uppercase text-slate-400 block mb-1">
                    Timestamp
                  </label>
                  <p className="text-slate-800 font-mono text-xs">
                    {formatTimestamp(selectedLog.timestamp)}
                  </p>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    {selectedLog.timestamp}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-slate-400 block mb-1">
                    Log Entry ID
                  </label>
                  <p className="text-slate-800 font-mono text-xs break-all">
                    {selectedLog.id}
                  </p>
                </div>
              </div>

              {/* Target & Actor IDs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="text-xs font-semibold uppercase text-slate-400 block mb-1">
                    Target ID
                  </label>
                  <div className="flex items-center gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="font-mono text-xs text-slate-700 break-all flex-1">
                      {selectedLog.targetId || '-'}
                    </span>
                    {selectedLog.targetId && (
                      <button
                        onClick={() => handleCopy(selectedLog.targetId, 'modal-target')}
                        className="text-slate-400 hover:text-slate-700 p-1"
                        title="Copy"
                      >
                        {copiedKey === 'modal-target' ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase text-slate-400 block mb-1">
                    Actor ID (User)
                  </label>
                  <div className="flex items-center gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="font-mono text-xs text-slate-700 break-all flex-1">
                      {selectedLog.actorId || '-'}
                    </span>
                    {selectedLog.actorId && (
                      <button
                        onClick={() => handleCopy(selectedLog.actorId, 'modal-actor')}
                        className="text-slate-400 hover:text-slate-700 p-1"
                        title="Copy"
                      >
                        {copiedKey === 'modal-actor' ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Metadata if present */}
              {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                <div className="pt-2 border-t border-slate-100">
                  <label className="text-xs font-semibold uppercase text-slate-400 block mb-1">
                    Additional Metadata
                  </label>
                  <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg text-xs overflow-x-auto font-mono max-h-48">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 text-sm font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLog;
