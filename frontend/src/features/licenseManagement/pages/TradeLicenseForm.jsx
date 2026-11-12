import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { licenseService } from '../services/license.service';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const TradeLicenseForm = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    targetStore: '',
    type: 'Trade license',
    phase: 'Phase 1',
    validityStart: '',
    validityEnd: '',
    renewalExpiry: '',
    informationRequired: '',
    governmentBody: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      
      const payload = {
        licenseType: formData.type,
        linkedStore: formData.targetStore,
        govBody: formData.governmentBody,
        status: 'Draft',
        phase: formData.phase,
        validityStartDate: formData.validityStart,
        validityEndDate: formData.validityEnd,
        renewalDueDate: formData.renewalExpiry,
        informationRequired: {
          details: formData.informationRequired
        },
        documentsRequired: [],
        statusHistory: [{
          status: 'Draft',
          date: new Date().toISOString(),
          remarks: 'Application drafted'
        }]
      };

      const res = await licenseService.createEntity('licenses', payload);
      toast.success('License drafted successfully!');
      navigate(`/dashboard/license-management/${res.data.id}`);
    } catch (error) {
      toast.error('Failed to draft license');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 animate-fade-in">
      <button 
        onClick={() => navigate('/dashboard/license-management')}
        className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Licenses
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50">
          <h2 className="text-xl font-bold text-gray-900">New License Application</h2>
          <p className="text-sm text-gray-500 mt-1">Fill in the initial details based on the exact structure requested.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Store</label>
              <input 
                type="text" 
                name="targetStore" 
                value={formData.targetStore} 
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Enter store..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Government Body</label>
              <input 
                type="text" 
                name="governmentBody" 
                value={formData.governmentBody} 
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Enter government body..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select 
                name="type" 
                value={formData.type} 
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="Airport entry related">Airport entry related</option>
                <option value="S&E">S&E</option>
                <option value="Contract labour">Contract labour</option>
                <option value="Trade license">Trade license</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phase</label>
              <select 
                name="phase" 
                value={formData.phase} 
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="Phase 1">Phase 1</option>
                <option value="Phase 2">Phase 2</option>
                <option value="Phase 3">Phase 3</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Validity Start</label>
              <input 
                type="date" 
                name="validityStart" 
                value={formData.validityStart} 
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Validity End</label>
              <input 
                type="date" 
                name="validityEnd" 
                value={formData.validityEnd} 
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Renewal / Expiry Date</label>
              <input 
                type="date" 
                name="renewalExpiry" 
                value={formData.renewalExpiry} 
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Information Required</label>
              <textarea 
                name="informationRequired" 
                value={formData.informationRequired} 
                onChange={handleChange}
                rows="3"
                placeholder="Enter all required information here..."
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button 
              type="button"
              onClick={() => navigate('/dashboard/license-management')}
              className="px-6 py-2.5 text-gray-600 font-medium rounded-lg hover:bg-slate-100 mr-3 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Draft'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TradeLicenseForm;
