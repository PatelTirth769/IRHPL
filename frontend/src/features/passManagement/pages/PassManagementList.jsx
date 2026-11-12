import React, { useEffect, useState } from 'react';
import { Eye, Edit, Plus, FileText, AlertTriangle, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { passService } from '../services/pass.service';
import toast from 'react-hot-toast';

const StatusBadge = ({ status }) => {
  const map = {
    'documents_submitted': { color: 'bg-blue-100 text-blue-700', label: 'Docs Submitted' },
    'commercial_signoff': { color: 'bg-purple-100 text-purple-700', label: 'Signoff Pending' },
    'issued': { color: 'bg-emerald-100 text-emerald-700', label: 'Issued' },
    'avsec_training_applied': { color: 'bg-indigo-100 text-indigo-700', label: 'AVSEC Applied' },
    'ca_applied': { color: 'bg-amber-100 text-amber-700', label: 'C&A Applied' },
    'ca_approved_bcas': { color: 'bg-teal-100 text-teal-700', label: 'BCAS Approved' },
    'avsec_verified': { color: 'bg-indigo-100 text-indigo-700', label: 'AVSEC Verified' },
    'ca_verified': { color: 'bg-amber-100 text-amber-700', label: 'C&A Verified' },
    'forwarded_to_dial_bcas': { color: 'bg-teal-100 text-teal-700', label: 'Forwarded' },
    'avsec_ca_complete': { color: 'bg-green-100 text-green-700', label: 'Prereqs Complete' },
    'applied_reference_generated': { color: 'bg-blue-100 text-blue-700', label: 'Ref Generated' },
    'under_scrutiny': { color: 'bg-orange-100 text-orange-700', label: 'Scrutiny' },
    'reverted': { color: 'bg-red-100 text-red-700', label: 'Reverted' },
    'approved': { color: 'bg-emerald-100 text-emerald-700', label: 'Approved' },
    'committee_approval': { color: 'bg-purple-100 text-purple-700', label: 'Committee' },
    'biometric_scheduled': { color: 'bg-blue-100 text-blue-700', label: 'Biometrics' },
    'cancelled': { color: 'bg-gray-200 text-gray-700', label: 'Cancelled' }
  };
  const config = map[status] || { color: 'bg-gray-100 text-gray-700', label: status };
  return (
    <span className={`px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-md ${config.color}`}>
      {config.label}
    </span>
  );
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const PassManagementList = () => {
  const [passes, setPasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPasses();
  }, []);

  const fetchPasses = async () => {
    try {
      setIsLoading(true);
      const res = await passService.getPasses();
      setPasses(res.data || []);
    } catch (error) {
      console.error('Error fetching passes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete the pass application for ${name}?`)) {
      try {
        await passService.deletePass(id);
        toast.success('Pass application deleted successfully');
        fetchPasses();
      } catch (error) {
        toast.error('Failed to delete pass application');
      }
    }
  };

  const hasOverduePostal = (pass) => {
    if (!pass.dueDate) return false;
    return new Date(pass.dueDate) < new Date() && pass.status === 'ca_applied';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pass Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage all airport pass applications.</p>
        </div>
        <button 
          onClick={() => navigate('/dashboard/pass-management/new')}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Application
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-gray-500 font-medium">
              <tr>
                <th className="px-6 py-4">Applicant</th>
                <th className="px-6 py-4">Pass Type</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Dates</th>
                <th className="px-6 py-4">Alerts</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">Loading passes...</td>
                </tr>
              ) : passes.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">No applications found.</td>
                </tr>
              ) : (
                passes.map(pass => (
                  <tr key={pass.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{pass.applicantName || 'Unknown Applicant'}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{pass.applicantType}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900 font-medium">{pass.passType}</div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={pass.status} />
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-[13px]">
                      <div><span className="text-gray-400">Applied:</span> {formatDate(pass.appliedDate)}</div>
                      <div><span className="text-gray-400">Expected:</span> {formatDate(pass.expectedCompletionDate)}</div>
                    </td>
                    <td className="px-6 py-4">
                      {pass.status === 'reverted' && (
                        <div className="flex items-center text-red-600 text-xs font-medium">
                          <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Reverted
                        </div>
                      )}
                      {hasOverduePostal(pass) && (
                        <div className="flex items-center text-orange-600 text-xs font-medium mt-1">
                          <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Overdue C&A Postal
                        </div>
                      )}
                      {pass.applicantAddress?.toLowerCase().includes('delhi') && (
                        <div className="flex items-center text-blue-600 text-xs font-medium mt-1">
                          <FileText className="w-3.5 h-3.5 mr-1" /> Delhi Address (In-person BCAS)
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => navigate(`/dashboard/pass-management/${pass.id}`)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 rounded hover:bg-blue-50 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(pass.id, pass.applicantName)}
                            className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                            title="Delete Pass"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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

export default PassManagementList;
