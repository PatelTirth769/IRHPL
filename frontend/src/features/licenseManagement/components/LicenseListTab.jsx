import React, { useEffect, useState, useMemo } from 'react';
import { Eye, Trash2, Store, Search, Filter, ShieldCheck, FileText, Plus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { licenseService } from '../services/license.service';
import toast from 'react-hot-toast';

const StatusBadge = ({ status }) => {
  const map = {
    'Draft': { bg: 'bg-slate-100 text-slate-700 border-slate-200', dot: 'bg-slate-400' },
    'Application Submitted': { bg: 'bg-blue-50 text-blue-700 border-blue-200/60', dot: 'bg-blue-500' },
    'Under Process': { bg: 'bg-amber-50 text-amber-700 border-amber-200/60', dot: 'bg-amber-500 animate-pulse' },
    'Issued/Active': { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/70', dot: 'bg-emerald-500' },
    'Renewal Due': { bg: 'bg-orange-50 text-orange-700 border-orange-200/70', dot: 'bg-orange-500 animate-pulse' },
    'Renewal Submitted': { bg: 'bg-purple-50 text-purple-700 border-purple-200/60', dot: 'bg-purple-500' },
    'Rejected': { bg: 'bg-rose-50 text-rose-700 border-rose-200/60', dot: 'bg-rose-500' },
    'Disputed': { bg: 'bg-red-50 text-red-700 border-red-200/60', dot: 'bg-red-500' },
    'Cancelled': { bg: 'bg-slate-100 text-slate-600 border-slate-200', dot: 'bg-slate-400' },
    'Expired': { bg: 'bg-rose-100 text-rose-800 border-rose-200', dot: 'bg-rose-600' }
  };
  const config = map[status] || { bg: 'bg-slate-100 text-slate-700 border-slate-200', dot: 'bg-slate-400' };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider rounded-lg border whitespace-nowrap ${config.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dot}`} />
      <span className="truncate">{status || 'Unknown'}</span>
    </span>
  );
};

const getLicenseTimestamp = (lic) => {
  if (!lic) return 0;
  const raw = lic.createdAt || lic.updatedAt || lic.validityStartDate;
  if (!raw) return 0;
  if (typeof raw.toDate === 'function') return raw.toDate().getTime();
  if (raw._seconds) return raw._seconds * 1000;
  if (raw.seconds) return raw.seconds * 1000;
  const parsed = new Date(raw).getTime();
  return isNaN(parsed) ? 0 : parsed;
};

const LicenseListTab = () => {
  const [licenses, setLicenses] = useState([]);
  const [stores, setStores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [licRes, storeRes] = await Promise.all([
        licenseService.getCollection('licenses'),
        licenseService.getCollection('stores')
      ]);

      const rawLicenses = licRes.data || [];
      // Sort descending by creation timestamp so newly created licenses appear on top
      const sortedLicenses = [...rawLicenses].sort((a, b) => getLicenseTimestamp(b) - getLicenseTimestamp(a));

      setLicenses(sortedLicenses);
      setStores(storeRes.data || []);
    } catch (error) {
      console.error('Error fetching licenses:', error);
      toast.error('Failed to fetch licenses');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id, tradeName) => {
    const displayName = tradeName ? `"${tradeName}"` : 'this license';
    if (window.confirm(`Are you sure you want to delete ${displayName}? This action cannot be undone.`)) {
      try {
        await licenseService.deleteEntity('licenses', id);
        toast.success('License deleted successfully');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete license');
      }
    }
  };

  const getStoreInfo = (storeId) => {
    if (!storeId) return { name: 'Unassigned Store', type: null, isResolved: false };
    const found = stores.find(s => s.id === storeId);
    if (found?.name) {
      return { name: found.name, type: found.storeType, isResolved: true };
    }
    // If not found in stores list (e.g. test or deleted ID)
    if (storeId.length > 12) {
      return { name: `Store #${storeId.slice(0, 8)}`, type: null, isResolved: false };
    }
    return { name: storeId, type: null, isResolved: false };
  };

  const getLicenseTypeName = (type) => {
    const types = {
      'trade-license': 'Trade License',
      'Trade license': 'Trade License',
      'airport-entry': 'Airport Entry',
      'airport-entry-related': 'Airport Entry Related',
      'Airport entry related': 'Airport Entry Related',
      's-and-e': 'S&E',
      'S&E': 'S&E',
      'contract-labour': 'Contract Labour',
      'Contract labour': 'Contract Labour'
    };
    return types[type] || type || 'General License';
  };

  const getTradeName = (lic, storeInfo) => {
    if (lic.informationRequired?.tradeName) {
      return lic.informationRequired.tradeName;
    }
    if (storeInfo.isResolved) {
      return storeInfo.name;
    }
    if (lic.linkedStore && lic.linkedStore.length > 12) {
      return `License #${lic.id ? lic.id.slice(0, 8) : lic.linkedStore.slice(0, 8)}`;
    }
    return lic.linkedStore || 'Commercial License';
  };

  // Filtered licenses based on search and dropdown filters
  const filteredLicenses = useMemo(() => {
    return licenses.filter(lic => {
      const storeInfo = getStoreInfo(lic.linkedStore);
      const tradeName = getTradeName(lic, storeInfo);
      const applicantName = lic.informationRequired?.applicantName || '';
      const type = getLicenseTypeName(lic.licenseType);
      const status = lic.status || '';

      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || 
        tradeName.toLowerCase().includes(query) ||
        applicantName.toLowerCase().includes(query) ||
        storeInfo.name.toLowerCase().includes(query) ||
        type.toLowerCase().includes(query) ||
        (lic.id && lic.id.toLowerCase().includes(query));

      const matchesType = typeFilter === 'all' || 
        (lic.licenseType && lic.licenseType.toLowerCase() === typeFilter.toLowerCase());

      const matchesStatus = statusFilter === 'all' || 
        (lic.status && lic.status.toLowerCase() === statusFilter.toLowerCase());

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [licenses, stores, searchQuery, typeFilter, statusFilter]);

  // Extract unique types and statuses for filter dropdowns
  const availableTypes = useMemo(() => {
    const set = new Set();
    licenses.forEach(l => {
      if (l.licenseType) set.add(l.licenseType);
    });
    return Array.from(set);
  }, [licenses]);

  const availableStatuses = useMemo(() => {
    const set = new Set();
    licenses.forEach(l => {
      if (l.status) set.add(l.status);
    });
    return Array.from(set);
  }, [licenses]);

  const hasActiveFilters = searchQuery || typeFilter !== 'all' || statusFilter !== 'all';

  const resetFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setStatusFilter('all');
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden mb-6 transition-all">
      {/* Top Controls Toolbar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-white space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-900 text-base">Commercial Licenses</h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                {filteredLicenses.length} {filteredLicenses.length === 1 ? 'License' : 'Licenses'}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Review and monitor permits, certificates, and compliance across stores.
            </p>
          </div>

          <button 
            onClick={() => navigate('/dashboard/org-management/new')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all focus:outline-none"
            title="Create a new store in Org Management to automatically link a license"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Store & License</span>
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 pt-1">
          {/* Search Input */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by trade name, store, license type..."
              className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-800 placeholder:text-gray-400"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Type Filter */}
          <div className="sm:col-span-3">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-700 font-medium cursor-pointer"
            >
              <option value="all">All License Types</option>
              {availableTypes.map(t => (
                <option key={t} value={t}>{getLicenseTypeName(t)}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-700 font-medium cursor-pointer"
            >
              <option value="all">All Statuses</option>
              {availableStatuses.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filters Clear Indicator */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 pt-1 text-xs text-slate-500">
            <span>Filtering active:</span>
            <button 
              onClick={resetFilters}
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold underline underline-offset-2"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Table Container - Strict full width, zero horizontal scroll */}
      <div className="w-full overflow-hidden">
        <table className="w-full text-left text-sm table-fixed">
          <thead className="bg-slate-50/70 border-b border-slate-200/80 text-gray-500 text-[11px] font-semibold uppercase tracking-wider">
            <tr>
              <th className="w-[30%] px-3.5 sm:px-4 py-3">Business / Trade Name</th>
              <th className="w-[22%] px-3 sm:px-3.5 py-3">License Type</th>
              <th className="w-[24%] px-3 sm:px-3.5 py-3">Associated Store</th>
              <th className="w-[14%] px-2.5 sm:px-3 py-3">Status</th>
              <th className="w-[10%] px-3.5 sm:px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {isLoading ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs text-slate-400 font-medium">Loading licenses...</span>
                  </div>
                </td>
              </tr>
            ) : filteredLicenses.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                  <div className="max-w-xs mx-auto flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
                      <FileText className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-semibold text-gray-800">No licenses found</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {hasActiveFilters 
                        ? 'No licenses match your active search or filter criteria.' 
                        : 'No licenses have been created yet. Add a new company & store in Org Management to get started.'}
                    </p>
                    {hasActiveFilters && (
                      <button 
                        onClick={resetFilters}
                        className="mt-3 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        Reset Filters
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filteredLicenses.map((lic) => {
                const storeInfo = getStoreInfo(lic.linkedStore);
                const tradeName = getTradeName(lic, storeInfo);
                const hasApplicant = Boolean(lic.informationRequired?.applicantName);

                return (
                  <tr key={lic.id} className="hover:bg-slate-50/70 transition-colors group">
                    {/* Trade / Business Name */}
                    <td className="px-3.5 sm:px-4 py-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                          {tradeName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div 
                            className="font-semibold text-xs sm:text-sm text-gray-900 group-hover:text-blue-600 transition-colors truncate"
                            title={tradeName}
                          >
                            {tradeName}
                          </div>
                          <div className="text-[11px] text-gray-400 truncate mt-0.5" title={hasApplicant ? `Applicant: ${lic.informationRequired.applicantName}` : `Ref: #${lic.id}`}>
                            {hasApplicant ? `Applicant: ${lic.informationRequired.applicantName}` : `Ref: #${lic.id.slice(0, 8)}`}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* License Type */}
                    <td className="px-3 sm:px-3.5 py-3">
                      <span 
                        className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200/70 truncate max-w-full"
                        title={getLicenseTypeName(lic.licenseType)}
                      >
                        <span className="truncate">{getLicenseTypeName(lic.licenseType)}</span>
                      </span>
                    </td>

                    {/* Associated Store */}
                    <td className="px-3 sm:px-3.5 py-3">
                      <div className="flex items-center gap-1.5 text-gray-700 min-w-0">
                        <Store className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span 
                          className="font-medium text-xs text-gray-900 truncate"
                          title={`${storeInfo.name}${storeInfo.type ? ` (${storeInfo.type})` : ''}`}
                        >
                          {storeInfo.name}
                        </span>
                        {storeInfo.type && (
                          <span className="text-[11px] text-gray-400 shrink-0 hidden sm:inline">
                            ({storeInfo.type})
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-2.5 sm:px-3 py-3">
                      <StatusBadge status={lic.status} />
                    </td>

                    {/* Actions */}
                    <td className="px-3.5 sm:px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => navigate(`/dashboard/license-management/${lic.id}`)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View License Details"
                          aria-label="View License Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(lic.id, tradeName)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete License"
                          aria-label="Delete License"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LicenseListTab;
