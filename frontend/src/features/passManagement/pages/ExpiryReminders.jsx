import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { passService } from '../services/pass.service';
import Select from '@/components/ui/Select';
import { Clock, Eye, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const ExpiryReminders = () => {
  const navigate = useNavigate();
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [windowFilter, setWindowFilter] = useState('all'); // all, expired, 2days, 10days

  const fetchReminders = async () => {
    try {
      setLoading(true);
      const res = await passService.getExpiryReminders(windowFilter);
      setReminders(res.data);
    } catch (error) {
      toast.error('Failed to load expiry reminders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, [windowFilter]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="animate-fade-in max-w-7xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expiry Reminders</h1>
          <p className="text-sm text-gray-500 mt-1">Track and manage upcoming document expirations for pass applications.</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden min-h-[500px] flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-3 bg-slate-50/50 justify-between items-center">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Clock className="w-4 h-4 text-gray-500" />
            Filter by Expiry Window:
          </div>
          <div className="w-full md:w-64">
            <Select 
              value={windowFilter}
              onChange={(e) => setWindowFilter(e.target.value)}
              className="w-full bg-white"
              options={[
                { label: 'All Upcoming & Expired', value: 'all' },
                { label: 'Already Expired', value: 'expired' },
                { label: 'Expiring in 2 Days', value: '2days' },
                { label: 'Expiring in 10 Days', value: '10days' }
              ]}
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : reminders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center p-6">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-[17px] font-bold text-gray-900 mb-2">No documents found</h3>
              <p className="text-[14px] text-gray-500 max-w-sm mb-6">
                There are no documents matching the selected expiry window.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Applicant</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Pass Type</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Document</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Expiry Date</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {reminders.map((reminder, idx) => (
                  <tr key={`${reminder.passId}-${idx}`} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{reminder.applicantName}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{reminder.applicantType}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        {reminder.passType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                      {reminder.documentType}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {formatDate(reminder.expiryDate)}
                    </td>
                    <td className="px-6 py-4">
                      {reminder.daysRemaining < 0 ? (
                        <span className="inline-flex items-center text-xs font-bold text-red-700 bg-red-100 px-2 py-1 rounded">
                          Expired {Math.abs(reminder.daysRemaining)} days ago
                        </span>
                      ) : reminder.daysRemaining === 0 ? (
                        <span className="inline-flex items-center text-xs font-bold text-orange-700 bg-orange-100 px-2 py-1 rounded">
                          Expires Today
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-xs font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded">
                          {reminder.daysRemaining} days remaining
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {reminder.passId ? (
                        <button 
                          onClick={() => navigate(`/dashboard/pass-management/${reminder.passId}`)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 rounded hover:bg-blue-50 transition-colors"
                          title="View Application Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      ) : (
                        <button 
                          onClick={() => navigate(`/dashboard/employee-master`)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 rounded hover:bg-blue-50 transition-colors"
                          title="Go to Employee Master"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpiryReminders;
