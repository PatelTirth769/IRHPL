import React, { useEffect, useState } from 'react';
import { Eye, Edit, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { licenseService } from '../services/license.service';
import toast from 'react-hot-toast';

const StatusBadge = ({ status }) => {
  const map = {
    'Draft': { color: 'bg-gray-100 text-gray-700' },
    'Application Submitted': { color: 'bg-blue-100 text-blue-700' },
    'Under Process': { color: 'bg-amber-100 text-amber-700' },
    'Issued/Active': { color: 'bg-emerald-100 text-emerald-700' },
    'Renewal Due': { color: 'bg-orange-100 text-orange-700' },
    'Renewal Submitted': { color: 'bg-purple-100 text-purple-700' },
    'Rejected': { color: 'bg-red-100 text-red-700' },
    'Disputed': { color: 'bg-red-100 text-red-700' },
    'Cancelled': { color: 'bg-slate-200 text-slate-700' },
    'Expired': { color: 'bg-red-200 text-red-800' }
  };
  const config = map[status] || { color: 'bg-gray-100 text-gray-700' };
  return (
    <span className={`px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-md ${config.color}`}>
      {status}
    </span>
  );
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const LicenseListTab = () => {
  const [licenses, setLicenses] = useState([]);
  const [stores, setStores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
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
      setLicenses(licRes.data || []);
      setStores(storeRes.data || []);
    } catch (error) {
      console.error('Error fetching licenses:', error);
      toast.error('Failed to fetch licenses');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(`Are you sure you want to delete this license?`)) {
      try {
        await licenseService.deleteEntity('licenses', id);
        toast.success('License deleted successfully');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete license');
      }
    }
  };

  const getStoreName = (storeId) => {
    return storeId || 'Unknown Store';
  };

  const getLicenseTypeName = (type) => {
    const types = {
      'trade-license': 'Trade License',
      'airport-entry': 'Airport Entry',
      's-and-e': 'S&E',
      'contract-labour': 'Contract Labour'
    };
    return types[type] || type;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6 animate-fade-in">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <h3 className="font-semibold text-gray-900">All Licenses</h3>
        <div className="text-sm text-gray-500 italic">
          To create a new license, use Org Management.
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 border-b border-slate-200 text-gray-500 font-medium">
            <tr>
              <th className="px-6 py-4">Business / Trade Name</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Store</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Phase</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">Loading licenses...</td>
              </tr>
            ) : licenses.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">No licenses found.</td>
              </tr>
            ) : (
              licenses.map(lic => (
                <tr key={lic.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">{lic.informationRequired?.tradeName || 'N/A'}</div>
                    <div className="text-xs text-gray-500 mt-0.5">Applicant: {lic.informationRequired?.applicantName || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {getLicenseTypeName(lic.licenseType)}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {getStoreName(lic.linkedStore)}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={lic.status} />
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {lic.phase}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => navigate(`/dashboard/license-management/${lic.id}`)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 rounded hover:bg-blue-50 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(lic.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                        title="Delete License"
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
  );
};

export default LicenseListTab;
