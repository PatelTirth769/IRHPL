import React, { useEffect, useState } from 'react';
import { Eye, Plus, FileText, AlertTriangle, Trash2 } from 'lucide-react';
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
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const getPassTimestamp = (pass) => {
  if (!pass) return 0;
  const raw = pass.createdAt || pass.appliedDate || pass.updatedAt;
  if (!raw) return 0;
  if (typeof raw.toDate === 'function') {
    return raw.toDate().getTime();
  }
  if (raw._seconds) {
    return raw._seconds * 1000;
  }
  if (raw.seconds) {
    return raw.seconds * 1000;
  }
  const parsed = new Date(raw).getTime();
  return isNaN(parsed) ? 0 : parsed;
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
      const rawList = res.data || [];
      // Sort descending by creation/applied date so newly created passes appear on top
      const sortedList = [...rawList].sort((a, b) => getPassTimestamp(b) - getPassTimestamp(a));
      setPasses(sortedList);
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
    <div className="max-w-7xl mx-auto pb-10">
      <div className="flex items-center justify-between mb-6">
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
        <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-gray-500 font-medium">
              <tr>
                <th className="px-4 py-3.5">Applicant</th>
                <th className="px-4 py-3.5">Pass Type</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Dates</th>
                <th className="px-4 py-3.5 text-right min-w-[90px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">Loading passes...</td>
                </tr>
              ) : passes.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No applications found.</td>
                </tr>
              ) : (
                passes.map(pass => (
                  <tr key={pass.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-gray-900">{pass.applicantName || 'Unknown Applicant'}</div>
                      <div className="text-xs text-gray-500 mt-0.5 capitalize">{pass.applicantType || 'Employee'}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/70">
                        {pass.passType}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col items-start gap-1">
                        <StatusBadge status={pass.status} />
                        {hasOverduePostal(pass) && (
                          <div className="flex items-center text-orange-600 text-[11px] font-semibold bg-orange-50 px-2 py-0.5 rounded border border-orange-200/60">
                            <AlertTriangle className="w-3 h-3 mr-1 shrink-0" /> Overdue C&A Postal
                          </div>
                        )}
                        {pass.applicantAddress?.toLowerCase().includes('delhi') && (
                          <div className="flex items-center text-blue-600 text-[11px] font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-200/60">
                            <FileText className="w-3 h-3 mr-1 shrink-0" /> In-person BCAS
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-gray-600 text-[13px]">
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-400 font-medium">Applied:</span>
                        <span className="text-gray-700 font-medium">{formatDate(pass.appliedDate)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-gray-400 font-medium">Expected:</span>
                        <span className="text-gray-700 font-medium">{formatDate(pass.expectedCompletionDate)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right min-w-[90px]">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => navigate(`/dashboard/pass-management/${pass.id}`)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="View Details"
                          aria-label="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(pass.id, pass.applicantName)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete Pass"
                          aria-label="Delete Pass"
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

export default PassManagementList;
