import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, MapPin, Store, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { orgService } from '../services/org.service';
import { licenseService } from '../../licenseManagement/services/license.service';

const OrgChainDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [chain, setChain] = useState(null);
  const [license, setLicense] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchChain = async () => {
      try {
        const res = await orgService.getOrgChains();
        const found = res.data?.find(c => c.id === id);
        if (!found) throw new Error('Not found');
        setChain(found);

        try {
          const licRes = await licenseService.getCollection('licenses');
          const matchedLic = licRes.data?.find(l => l.linkedStore === found.store.id);
          setLicense(matchedLic || null);
        } catch (err) {
          console.error("Could not load license details", err);
        }
      } catch (e) {
        toast.error('Failed to load org chain details');
        navigate('/dashboard/org-management');
      } finally {
        setIsLoading(false);
      }
    };
    fetchChain();
  }, [id, navigate]);

  if (isLoading) return <div className="p-8 text-center text-slate-500">Loading...</div>;
  if (!chain) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in p-6">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/dashboard/org-management')}
          className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Org Management
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 bg-slate-50 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-slate-900">{chain.store.name}</h1>
              {chain.store.licenseType && (
                <span className="px-2.5 py-1 rounded-md bg-blue-100 text-blue-700 text-xs font-semibold uppercase tracking-wider">
                  {chain.store.licenseType}
                </span>
              )}
            </div>
            <p className="text-slate-500 flex items-center gap-2 text-sm">
              <Building2 className="w-4 h-4" /> {chain.company.name}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Company Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100">
                <Building2 className="w-4 h-4 text-slate-400" /> Company Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-500 block text-xs uppercase tracking-wider mb-1">Company Name</span>
                  <span className="text-slate-900 font-medium">{chain.company.name}</span>
                </div>
              </div>
            </div>

            {/* Location Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100">
                <MapPin className="w-4 h-4 text-slate-400" /> Location Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-500 block text-xs uppercase tracking-wider mb-1">Location Name</span>
                  <span className="text-slate-900 font-medium">{chain.location.name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs uppercase tracking-wider mb-1">Location Type</span>
                  <span className="text-slate-900 font-medium">{chain.location.type}</span>
                </div>
                {chain.zone && (
                  <>
                    <div>
                      <span className="text-slate-500 block text-xs uppercase tracking-wider mb-1">Airport Zone</span>
                      <span className="text-slate-900 font-medium">{chain.zone.name}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-xs uppercase tracking-wider mb-1">Zone Type</span>
                      <span className="text-slate-900 font-medium">{chain.zone.type}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Store Info */}
            <div className="space-y-4 md:col-span-2">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100">
                <Store className="w-4 h-4 text-slate-400" /> Store & License Details
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <span className="text-slate-500 block text-xs uppercase tracking-wider mb-1">Store Name</span>
                  <span className="text-slate-900 font-medium">{chain.store.name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs uppercase tracking-wider mb-1">Store Type</span>
                  <span className="text-slate-900 font-medium">{chain.store.storeType}</span>
                </div>
                <div className="md:col-span-2">
                  <span className="text-slate-500 block text-xs uppercase tracking-wider mb-1">Intended License Type</span>
                  <span className="text-slate-900 font-medium flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-400" />
                    {chain.store.licenseType || 'Not specified'}
                  </span>
                </div>
              </div>

              {/* License Expanded Details */}
              {license && (
                <div className="mt-6 p-5 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">License Record</h4>
                    <button 
                      onClick={() => navigate(`/dashboard/license-management/${license.id}`)}
                      className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
                    >
                      Manage in License Module
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase tracking-wider mb-0.5">Status</span>
                      <span className="text-slate-900 font-medium text-sm">
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-bold">{license.status}</span>
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase tracking-wider mb-0.5">Phase</span>
                      <span className="text-slate-900 font-medium text-sm">{license.phase}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase tracking-wider mb-0.5">Validity Start</span>
                      <span className="text-slate-900 font-medium text-sm">{license.validityStartDate || '-'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase tracking-wider mb-0.5">Validity End</span>
                      <span className="text-slate-900 font-medium text-sm">{license.validityEndDate || '-'}</span>
                    </div>
                  </div>

                  {license.informationRequired && Object.keys(license.informationRequired).length > 0 && (
                    <div className="border-t border-slate-200 pt-4 mt-2">
                      <span className="text-slate-500 block text-[10px] uppercase tracking-wider mb-2">Information Required</span>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        {Object.entries(license.informationRequired).map(([k, v]) => (
                          <div key={k}>
                            <span className="text-slate-500 text-xs block mb-0.5 capitalize">{k.replace(/([A-Z])/g, ' $1').trim()}</span>
                            <span className="text-slate-900 font-medium">{v || '-'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {license.documentsRequired && license.documentsRequired.length > 0 && (
                    <div className="border-t border-slate-200 pt-4 mt-4">
                      <span className="text-slate-500 block text-[10px] uppercase tracking-wider mb-2">Uploaded Documents</span>
                      <div className="flex flex-wrap gap-2 text-sm">
                        {license.documentsRequired.map((doc, idx) => (
                          <a key={idx} href={doc.fileUrl} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-blue-600 hover:underline text-xs font-medium flex items-center">
                            <FileText className="w-3 h-3 mr-1.5" />
                            {doc.type}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default OrgChainDetail;
