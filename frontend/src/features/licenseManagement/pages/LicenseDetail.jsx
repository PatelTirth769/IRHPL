import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { licenseService } from '../services/license.service';
import { ArrowLeft, CheckCircle, AlertTriangle, Clock, X, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import FileUpload from '@/components/ui/FileUpload';
import { storage } from '@/config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuthStore } from '@/store/authStore';
import { storageService } from '@/services/storage.service';

const TRADE_PIPELINE = [
  'Draft',
  'Application Submitted',
  'Under Process',
  'Issued/Active',
  'Renewal Due',
  'Renewal Submitted'
];

const STATUS_LABELS = {
  'Draft': 'Draft',
  'Application Submitted': 'Submitted',
  'Under Process': 'Under Process',
  'Issued/Active': 'Issued / Active',
  'Renewal Due': 'Renewal Due',
  'Renewal Submitted': 'Renewal Submitted',
  'Rejected': 'Rejected',
  'Disputed': 'Disputed',
  'Cancelled': 'Cancelled',
  'Expired': 'Expired'
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const LicenseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore(state => state.firebaseUser);
  
  const [license, setLicense] = useState(null);
  const [store, setStore] = useState(null);
  const [govBody, setGovBody] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Modals state
  const [showModModal, setShowModModal] = useState(false);
  const [modType, setModType] = useState('Modification'); // Modification, Cancellation, Extension
  const [modDetails, setModDetails] = useState('');
  const [modDate, setModDate] = useState(new Date().toISOString().split('T')[0]);
  const [modFile, setModFile] = useState(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await licenseService.getCollection('licenses');
      const lic = res.data?.find(l => l.id === id);
      if (!lic) throw new Error('License not found');
      
      setLicense(lic);
      setStore({ name: lic.linkedStore || 'Unknown Store' });
      setGovBody({ name: lic.govBody || 'Unknown Body' });
      
    } catch (error) {
      toast.error('Failed to load license details');
      navigate('/dashboard/license-management');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus, remarks = '') => {
    try {
      setIsUpdating(true);
      await licenseService.updateLicenseStatus(id, newStatus, remarks);
      toast.success(`Status updated to ${newStatus}`);
      fetchData();
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDocumentUpload = async (docType, file) => {
    if (!file) return;
    try {
      setIsUpdating(true);
      
      const orgId = user?.uid || 'default-org';
      const folderPath = `organizations/${orgId}/licenses/${id}/${docType}`;
      const fileUrl = await storageService.uploadFile(file, folderPath);
      
      const newDocs = [...(license.documentsRequired || [])];
      const existingIdx = newDocs.findIndex(d => d.type === docType);
      
      const docEntry = {
        type: docType,
        status: 'uploaded',
        uploadedDate: new Date().toISOString(),
        fileUrl,
        fileName: file.name
      };
      
      if (existingIdx >= 0) newDocs[existingIdx] = docEntry;
      else newDocs.push(docEntry);
      
      await licenseService.updateLicenseDocuments(id, newDocs);
      toast.success('Document uploaded');
      fetchData();
    } catch (error) {
      toast.error('Failed to upload document');
    } finally {
      setIsUpdating(false);
    }
  };

  const submitModification = async (e) => {
    e.preventDefault();
    if (!modDetails) {
      toast.error('Please provide details/reason');
      return;
    }
    try {
      setIsUpdating(true);
      
      let fileData = null;
      if (modFile) {
        const orgId = user?.uid || 'default-org';
        const folderPath = `organizations/${orgId}/licenses/${id}/modifications`;
        const fileUrl = await storageService.uploadFile(modFile, folderPath);
        fileData = {
          fileUrl: fileUrl,
          fileName: modFile.name
        };
      }
      
      const payload = {
        type: modType,
        details: modDetails,
        date: new Date(modDate).toISOString(),
        documents: fileData ? [fileData] : []
      };
      
      await licenseService.addLicenseModification(id, payload);
      toast.success(`${modType} recorded successfully`);
      setShowModModal(false);
      setModDetails('');
      setModFile(null);
      fetchData();
    } catch (error) {
      toast.error(`Failed to record ${modType}`);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading || !license) return <div className="p-6 text-center text-gray-500">Loading details...</div>;

  const isTrade = license.licenseType === 'trade-license';
  const pipeline = isTrade ? TRADE_PIPELINE : [];
  let currentIndex = pipeline.indexOf(license.status);
  const isException = ['Rejected', 'Disputed', 'Cancelled', 'Expired'].includes(license.status);
  
  if (isException) {
    // Determine where they were before the exception
    const lastValidStatus = license.statusHistory?.slice().reverse().find(h => pipeline.includes(h.status))?.status;
    if (lastValidStatus) currentIndex = pipeline.indexOf(lastValidStatus);
  }

  const nextStatus = !isException && currentIndex >= 0 && currentIndex < pipeline.length - 1 ? pipeline[currentIndex + 1] : null;

  return (
    <div className="p-6 max-w-5xl mx-auto animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={() => navigate('/dashboard/license-management')}
          className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Licenses
        </button>
        {!isException && (
          <div className="flex gap-2">
            <button onClick={() => { setModType('Modification'); setModDate(license.validityEndDate ? new Date(license.validityEndDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]); setShowModModal(true); }} className="px-3 py-1.5 text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-md">Modify</button>
            <button onClick={() => { setModType('Extension'); setModDate(license.validityEndDate ? new Date(license.validityEndDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]); setShowModModal(true); }} className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md">Extend</button>
            <button onClick={() => { setModType('Cancellation'); setModDate(new Date().toISOString().split('T')[0]); setShowModModal(true); }} className="px-3 py-1.5 text-sm bg-red-50 text-red-600 hover:bg-red-100 rounded-md">Cancel</button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
        <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{license.informationRequired?.tradeName || 'Unnamed License'}</h1>
            <p className="text-sm text-gray-500 mt-1">
              {license.licenseType === 'trade-license' ? 'Trade License' : license.licenseType} • Store: {store?.name || 'Unknown'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Validity Ends</div>
            <div className="font-semibold text-gray-900">{formatDate(license.validityEndDate)}</div>
          </div>
        </div>

        {isTrade && (
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Status Tracker</h3>
            
            <div className="flex flex-col md:flex-row gap-4 items-center w-full justify-between px-4">
              {pipeline.map((step, idx) => {
                const isActive = idx === currentIndex && !isException;
                const isPast = idx < currentIndex || (idx === currentIndex && isException);
                
                return (
                  <div key={step} className="flex flex-col items-center relative z-10 flex-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 mb-2 bg-white
                      ${isActive ? 'border-blue-600 text-blue-600' : 
                        isPast ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 text-slate-300'}`}
                    >
                      {isPast ? <CheckCircle className="w-4 h-4" /> : <span className="text-xs font-bold">{idx + 1}</span>}
                    </div>
                    <div className={`text-xs font-medium text-center ${isActive ? 'text-blue-700' : isPast ? 'text-gray-900' : 'text-gray-400'}`}>
                      {STATUS_LABELS[step]}
                    </div>
                  </div>
                );
              })}
            </div>

            {isException && (
              <div className="mt-6 p-4 bg-red-50 rounded-lg flex items-start border border-red-100">
                <AlertTriangle className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-red-900">License {license.status}</h4>
                  <p className="text-sm text-red-700 mt-1">This application was moved to {license.status}. You may resume processing by reverting to the previous state or submitting an appeal.</p>
                  {(license.status === 'Rejected' || license.status === 'Disputed') && (
                    <button 
                      onClick={() => handleStatusUpdate('Under Process', 'Resumed processing')}
                      disabled={isUpdating}
                      className="mt-3 px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded shadow-sm hover:bg-red-700 disabled:opacity-50"
                    >
                      Resume Processing
                    </button>
                  )}
                </div>
              </div>
            )}

            {!isException && nextStatus && (
              <div className="mt-8 flex justify-center">
                <div className="flex gap-3">
                  {(license.status === 'Under Process' || license.status === 'Renewal Submitted') && (
                    <>
                      <button 
                        onClick={() => handleStatusUpdate('Rejected', prompt('Reason for rejection?'))}
                        className="px-4 py-2 bg-red-100 text-red-700 text-sm font-medium rounded-lg hover:bg-red-200 transition-colors"
                      >
                        Reject
                      </button>
                      <button 
                        onClick={() => handleStatusUpdate('Disputed', prompt('Reason for dispute?'))}
                        className="px-4 py-2 bg-orange-100 text-orange-700 text-sm font-medium rounded-lg hover:bg-orange-200 transition-colors"
                      >
                        Flag as Disputed
                      </button>
                    </>
                  )}
                  <button 
                    onClick={() => handleStatusUpdate(nextStatus)}
                    disabled={isUpdating}
                    className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 shadow-sm transition-colors disabled:opacity-50"
                  >
                    {isUpdating ? 'Updating...' : `Advance to: ${STATUS_LABELS[nextStatus]}`}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <h3 className="font-semibold text-gray-900">License Information</h3>
          </div>
          <div className="p-4 space-y-4 text-sm">
            {Object.entries(license.informationRequired || {}).map(([k, v]) => (
              <div key={k}>
                <span className="text-gray-500 block text-xs uppercase tracking-wider mb-1">{k.replace(/([A-Z])/g, ' $1').trim()}</span>
                <span className="text-gray-900 font-medium">{v || '-'}</span>
              </div>
            ))}
            <div className="pt-4 border-t border-slate-100">
              <span className="text-gray-500 block text-xs uppercase tracking-wider mb-1">Governing Body</span>
              <span className="text-gray-900 font-medium">{govBody?.name || '-'}</span>
              {govBody && <div className="text-xs text-gray-500 mt-1">{govBody.contactPerson} • {govBody.email}</div>}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center">
              <h3 className="font-semibold text-gray-900">Documents</h3>
            </div>
            <div className="p-4 space-y-3">
              {['Application Form', 'Address Proof', 'Tax Document', 'Final License Copy'].map((docType, i) => {
                const doc = license.documentsRequired?.find(d => d.type === docType);
                return (
                  <div key={i} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{docType}</div>
                      {doc ? (
                        <div className="text-xs text-emerald-600 mt-0.5">Uploaded {formatDate(doc.uploadedDate)}</div>
                      ) : (
                        <div className="text-xs text-amber-600 mt-0.5">Pending Upload</div>
                      )}
                    </div>
                    <div className="w-1/2 flex justify-end">
                      <FileUpload 
                        value={doc?.fileUrl ? { name: doc.fileName || docType, fileUrl: doc.fileUrl } : null}
                        onChange={(f) => handleDocumentUpload(docType, f)} 
                        accept="image/*,.pdf"
                        className="w-full"
                        readOnly={true}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {license.cancellationExtensionModification?.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50">
                <h3 className="font-semibold text-gray-900">Modifications & History</h3>
              </div>
              <div className="p-4 space-y-4">
                {license.cancellationExtensionModification.map((mod, i) => (
                  <div key={i} className="flex items-start text-sm">
                    <div className={`w-2 h-2 mt-1.5 rounded-full mr-3 flex-shrink-0 ${mod.type === 'Cancellation' ? 'bg-red-400' : mod.type === 'Extension' ? 'bg-blue-400' : 'bg-amber-400'}`} />
                    <div>
                      <div className="font-medium text-gray-900">{mod.type}</div>
                      <div className="text-gray-500 text-xs mt-0.5">{formatDate(mod.date)}</div>
                      <div className="text-gray-600 mt-1">"{mod.details}"</div>
                      {mod.documents?.map((d, j) => (
                        <a key={j} href={d.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-xs mt-1 block hover:underline">View Attached Document</a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {showModModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden animate-fade-in">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-gray-900">Record {modType}</h3>
              <button onClick={() => setShowModModal(false)} className="text-gray-400 hover:text-gray-600 p-1"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={submitModification} className="p-6 space-y-4">
              {modType === 'Cancellation' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cancellation Reason *</label>
                  <select 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    value={modDetails}
                    onChange={e => setModDetails(e.target.value)}
                    required
                  >
                    <option value="">Select reason...</option>
                    <option value="Employee separation">Employee separation</option>
                    <option value="Employee Disciplinary">Employee Disciplinary</option>
                    <option value="Store shutdown">Store shutdown</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              ) : modType === 'Modification' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Modification Details *</label>
                  <select 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    value={modDetails}
                    onChange={e => setModDetails(e.target.value)}
                    required
                  >
                    <option value="">Select modification...</option>
                    <option value="Store size">Store size</option>
                    <option value="Line of product added">Line of product added</option>
                    <option value="Store location change">Store location change</option>
                    <option value="Permission for renovation">Permission for renovation</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason / Details *</label>
                  <textarea 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    value={modDetails}
                    onChange={e => setModDetails(e.target.value)}
                    required
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Effective Date *</label>
                <input 
                  type="date" 
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  value={modDate}
                  onChange={e => setModDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supporting Document</label>
                <div className="border border-slate-200 p-3 rounded-lg bg-slate-50">
                  <FileUpload onChange={f => setModFile(f)} accept="image/*,.pdf" />
                  {modFile && <div className="text-xs mt-2 text-gray-600 truncate">{modFile.name}</div>}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModModal(false)} className="px-4 py-2 text-sm text-gray-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" disabled={isUpdating} className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition-colors disabled:opacity-50">
                  {isUpdating ? 'Saving...' : 'Confirm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LicenseDetail;
