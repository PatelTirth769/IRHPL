import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { orgService } from '../services/org.service';

const OrgManagementIndex = () => {
  const [chains, setChains] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchChains = async () => {
    setIsLoading(true);
    try {
      const res = await orgService.getOrgChains();
      setChains(res.data || []);
    } catch (e) {
      toast.error('Failed to fetch org chains');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChains();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this org chain? This will remove the store.')) return;
    try {
      await orgService.deleteOrgChain(id);
      toast.success('Chain deleted');
      fetchChains();
    } catch (e) {
      toast.error('Failed to delete chain');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Org Management</h1>
          <p className="text-slate-500 mt-1">Manage organizational hierarchies across companies.</p>
        </div>
        <button 
          onClick={() => navigate('/dashboard/org-management/new')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm shadow-blue-600/20 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Company
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-medium">Company</th>
                <th className="px-6 py-4 font-medium">Location</th>
                <th className="px-6 py-4 font-medium">Airport Zone</th>
                <th className="px-6 py-4 font-medium">Store Type</th>
                <th className="px-6 py-4 font-medium">License Type</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                      Loading...
                    </div>
                  </td>
                </tr>
              ) : chains.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                    No org chains found. Click "Add Company" to get started.
                  </td>
                </tr>
              ) : (
                chains.map((chain) => (
                  <tr key={chain.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{chain.company?.name || '-'}</td>
                    <td className="px-6 py-4">
                      {chain.location?.name || '-'} 
                      {chain.location?.type && <span className="text-xs text-slate-400 ml-1">({chain.location.type})</span>}
                    </td>
                    <td className="px-6 py-4">{chain.zone?.name || '-'}</td>
                    <td className="px-6 py-4">{chain.store?.storeType || '-'}</td>
                    <td className="px-6 py-4">
                      {chain.store?.licenseType ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium">
                          {chain.store.licenseType}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => navigate(`/dashboard/org-management/${chain.id}`)}
                          className="p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(chain.id)}
                          className="p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded transition-colors"
                          title="Delete Chain"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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

export default OrgManagementIndex;
