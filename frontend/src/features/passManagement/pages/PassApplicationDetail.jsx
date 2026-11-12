import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { passService } from '../services/pass.service';
import { CheckCircle, Clock, AlertTriangle, ArrowLeft, X } from 'lucide-react';
import toast from 'react-hot-toast';
import FileUpload from '@/components/ui/FileUpload';
import { storage } from '@/config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuthStore } from '@/store/authStore';
import { storageService } from '@/services/storage.service';
import ProceduralChecklist from '@/features/checklist/components/ProceduralChecklist';

const PIPELINES = {
  '4-hour': ['documents_submitted', 'commercial_signoff', 'issued'],
  '1-3-day': ['documents_submitted', 'commercial_signoff', 'issued'],
  'taep-fresh-30': ['documents_submitted', 'avsec_training_applied', 'ca_applied', 'commercial_signoff', 'ca_approved_bcas', 'issued'],
  'taep-forwarding-60': ['documents_submitted', 'avsec_verified', 'ca_verified', 'commercial_signoff', 'forwarded_to_dial_bcas', 'issued'],
  'baep': ['avsec_ca_complete', 'applied_reference_generated', 'under_scrutiny', 'approved', 'committee_approval', 'biometric_scheduled', 'issued']
};

const STATUS_LABELS = {
  'documents_submitted': 'Docs Submitted',
  'commercial_signoff': 'Commercial Signoff',
  'issued': 'Issued',
  'avsec_training_applied': 'AVSEC Applied',
  'ca_applied': 'C&A Applied',
  'ca_approved_bcas': 'BCAS Approved',
  'avsec_verified': 'AVSEC Verified',
  'ca_verified': 'C&A Verified',
  'forwarded_to_dial_bcas': 'Forwarded',
  'avsec_ca_complete': 'Prereqs Complete',
  'applied_reference_generated': 'Ref Generated',
  'under_scrutiny': 'Under Scrutiny',
  'reverted': 'Reverted',
  'approved': 'Approved',
  'committee_approval': 'Committee Approval',
  'biometric_scheduled': 'Biometrics',
  'cancelled': 'Cancelled'
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const PassApplicationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pass, setPass] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const user = useAuthStore(state => state.firebaseUser);
  
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelDetails, setCancelDetails] = useState('');
  const [cancelDate, setCancelDate] = useState(new Date().toISOString().split('T')[0]);
  const [cancelFile, setCancelFile] = useState(null);

  useEffect(() => {
    fetchPass();
  }, [id]);

  const fetchPass = async () => {
    try {
      setIsLoading(true);
      const res = await passService.getPassById(id);
      setPass(res.data);
    } catch (error) {
      toast.error('Failed to load pass application');
      navigate('/dashboard/pass-management');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      setIsUpdating(true);
      await passService.updatePassStatus(id, newStatus);
      toast.success('Status updated successfully');
      fetchPass();
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRevert = async () => {
    const remarks = prompt("Enter reason for revert:");
    if (!remarks) return;
    try {
      setIsUpdating(true);
      await passService.updatePassStatus(id, 'reverted', remarks);
      toast.success('Application reverted');
      fetchPass();
    } catch (error) {
      toast.error('Failed to revert application');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDocumentUpload = async (docIndex, file) => {
    try {
      setIsUpdating(true);
      const newDocs = [...pass.documents];
      const doc = newDocs[docIndex];
      
      if (!file) {
        newDocs[docIndex] = {
          ...doc,
          status: 'pending_upload',
          uploadedDate: null,
          expiryDate: null,
          fileUrl: null,
          fileName: null
        };
        await passService.updatePassDocuments(id, newDocs);
        toast.success('Document removed successfully');
        fetchPass();
        return;
      }

      const uploadedDate = new Date();
      let expiryDate = null;

      // Calculate expiry dynamically based on document type
      if (doc.type.toLowerCase().includes('avsec')) {
        expiryDate = new Date(uploadedDate);
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      } else if (doc.type.toLowerCase().includes('c&a')) {
        expiryDate = new Date(uploadedDate);
        expiryDate.setFullYear(expiryDate.getFullYear() + 3);
      }

      // Upload via backend API to S3
      const orgId = user?.uid || 'default-org';
      const cleanDocType = doc.type.replace(/[^a-zA-Z0-9]/g, '_');
      const folderPath = `organizations/${orgId}/pass-applications/${id}/${cleanDocType}`;
      const fileUrl = await storageService.uploadFile(file, folderPath);

      newDocs[docIndex] = {
        ...doc,
        status: 'uploaded',
        uploadedDate: uploadedDate.toISOString(),
        expiryDate: expiryDate ? expiryDate.toISOString() : null,
        fileUrl,
        fileName: file.name
      };

      await passService.updatePassDocuments(id, newDocs);
      toast.success('Document uploaded successfully');
      fetchPass();
    } catch (error) {
      console.error(error);
      const errorMessage = error.message || 'Unknown error occurred';
      toast.error(`Failed to update document: ${errorMessage}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelPass = async () => {
    if (!cancelReason) {
      toast.error('Please select a cancellation reason');
      return;
    }
    
    const finalReason = cancelReason === 'Other' ? `Other: ${cancelDetails}` : cancelReason;

    try {
      setIsUpdating(true);
      
      // Upload pass surrender copy if provided
      let documents = [...(pass.documents || [])];
      if (cancelFile) {
        const orgId = user?.uid || 'default-org';
        const folderPath = `organizations/${orgId}/pass-applications/${id}/Pass_Surrender_Copy`;
        const fileUrl = await storageService.uploadFile(cancelFile, folderPath);
        
        // Check if Pass Surrender Copy is already in documents list, update it, else add it
        const existingIndex = documents.findIndex(d => d.type === 'Pass Surrender Copy' || d.type === 'Pass Surrender Copy (if TAEP held)');
        const docEntry = {
          type: 'Pass Surrender Copy',
          status: 'uploaded',
          uploadedDate: new Date().toISOString(),
          expiryDate: null,
          fileUrl,
          fileName: cancelFile.name
        };
        
        if (existingIndex >= 0) {
          documents[existingIndex] = docEntry;
        } else {
          documents.push(docEntry);
        }
        await passService.updatePassDocuments(id, documents);
      }

      await passService.cancelPass(id, finalReason, new Date(cancelDate).toISOString());
      toast.success('Pass application cancelled successfully');
      setShowCancelModal(false);
      fetchPass();
    } catch (error) {
      console.error(error);
      const errorMessage = error.message || 'Unknown error occurred';
      toast.error(`Failed to cancel application: ${errorMessage}`);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading || !pass) {
    return <div className="p-6 text-center text-gray-500">Loading details...</div>;
  }

  const pipeline = PIPELINES[pass.passType] || [];
  
  // Custom pipeline index logic to handle "reverted" state seamlessly for BAEP
  let currentIndex = pipeline.indexOf(pass.status);
  const isReverted = pass.status === 'reverted';
  if (isReverted && pass.passType === 'baep') {
     // Reverted happens during scrutiny
     currentIndex = pipeline.indexOf('under_scrutiny');
  }

  const nextStatus = currentIndex >= 0 && currentIndex < pipeline.length - 1 ? pipeline[currentIndex + 1] : null;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={() => navigate('/dashboard/pass-management')}
          className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to List
        </button>
        {pass.status !== 'cancelled' && (
          <button
            onClick={() => setShowCancelModal(true)}
            className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
          >
            Cancel Application
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
        <div className="p-6 border-b border-slate-100 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{pass.applicantName}</h1>
            <p className="text-sm text-gray-500 mt-1">{pass.applicantType} • {pass.passType}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Expected Completion</div>
            <div className="font-semibold text-gray-900">{formatDate(pass.expectedCompletionDate)}</div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-b border-slate-100">
          <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Status Tracker</h3>
          
          <div className="flex flex-col md:flex-row gap-4 items-center w-full justify-between px-4">
            {pipeline.map((step, idx) => {
              const isActive = idx === currentIndex && !isReverted;
              const isPast = idx < currentIndex || (idx === currentIndex && isReverted);
              
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

          {isReverted && (
            <div className="mt-6 p-4 bg-red-50 rounded-lg flex items-start border border-red-100">
              <AlertTriangle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-red-900">Application Reverted</h4>
                <p className="text-sm text-red-700 mt-1">This application was reverted. Re-submitting will reset the TAT timer.</p>
                <button 
                  onClick={() => handleStatusUpdate('under_scrutiny')}
                  disabled={isUpdating}
                  className="mt-3 px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded shadow-sm hover:bg-red-700 disabled:opacity-50"
                >
                  Mark as Resubmitted
                </button>
              </div>
            </div>
          )}

          {!isReverted && nextStatus && (
            <div className="mt-8 flex justify-center">
              <div className="flex gap-3">
                {pass.passType === 'baep' && pass.status === 'under_scrutiny' && (
                  <button 
                    onClick={handleRevert}
                    disabled={isUpdating}
                    className="px-4 py-2 bg-red-100 text-red-700 text-sm font-medium rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                  >
                    Revert File
                  </button>
                )}
                <button 
                  onClick={() => handleStatusUpdate(nextStatus)}
                  disabled={isUpdating}
                  className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
                >
                  {isUpdating ? 'Updating...' : `Advance to: ${STATUS_LABELS[nextStatus]}`}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <h3 className="font-semibold text-gray-900">Application Details</h3>
          </div>
          <div className="p-4 space-y-4 text-sm">
            <div>
              <span className="text-gray-500 block text-xs uppercase tracking-wider mb-1">Address</span>
              <span className="text-gray-900">{pass.applicantAddress}</span>
            </div>
            <div>
              <span className="text-gray-500 block text-xs uppercase tracking-wider mb-1">Applied Date</span>
              <span className="text-gray-900">{formatDate(pass.appliedDate)}</span>
            </div>
            <div>
              <span className="text-gray-500 block text-xs uppercase tracking-wider mb-1">Worked at Airport Before</span>
              <span className="text-gray-900">{pass.hasWorkedAtAirportBefore ? 'Yes' : 'No'}</span>
            </div>
            {pass.hasWorkedAtAirportBefore && (
              <div>
                <span className="text-gray-500 block text-xs uppercase tracking-wider mb-1">Previous TAEP Days Consumed</span>
                <span className="text-gray-900">{pass.taepDaysConsumedPreviously} Days</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <h3 className="font-semibold text-gray-900">Status History</h3>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              {pass.statusHistory?.map((h, i) => (
                <div key={i} className="flex items-start text-sm">
                  <div className="w-2 h-2 mt-1.5 rounded-full bg-slate-300 mr-3 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900">{STATUS_LABELS[h.status] || h.status}</div>
                    <div className="text-gray-500 text-xs mt-0.5">{formatDate(h.date)}</div>
                    {h.remarks && <div className="text-gray-600 mt-1 italic">"{h.remarks}"</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <h3 className="font-semibold text-gray-900">Required Documents</h3>
          </div>
          <div className="p-4 space-y-3">
            {pass.documents?.map((doc, i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                <div>
                  <div className="text-sm font-medium text-gray-900">{doc.type}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {doc.status === 'uploaded' ? (
                      <span className="text-emerald-600 font-medium">Uploaded on {formatDate(doc.uploadedDate)}</span>
                    ) : (
                      <span className="text-amber-600 font-medium">Pending Upload</span>
                    )}
                  </div>
                  {doc.expiryDate && (
                    <div className="text-xs text-red-600 mt-0.5">Expires: {formatDate(doc.expiryDate)}</div>
                  )}
                </div>
                <div className="mt-2 sm:mt-0 sm:w-1/2">
                  <FileUpload 
                    value={doc.status === 'uploaded' && doc.fileUrl ? { name: doc.fileName || doc.type, fileUrl: doc.fileUrl } : null}
                    onChange={(file) => handleDocumentUpload(i, file)}
                    accept="image/*,.pdf"
                    className="w-full"
                  />
                </div>
              </div>
            ))}
            {(!pass.documents || pass.documents.length === 0) && (
              <div className="text-sm text-gray-500 italic">No document checklist generated for this pass type.</div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center">
            <h3 className="font-semibold text-gray-900">Active Alerts & Reminders</h3>
          </div>
          <div className="p-4 space-y-3">
            {pass.dueDate && pass.status === 'ca_applied' && new Date() > new Date(pass.dueDate) && (
              <div className="flex items-start p-3 bg-red-50 text-red-800 rounded-lg border border-red-100 text-sm">
                <AlertTriangle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Overdue:</strong> C&A Postal Receipt was due on {formatDate(pass.dueDate)}. Please submit to Pass Office immediately.
                </div>
              </div>
            )}
            
            {pass.status === 'avsec_training_applied' && pass.statusHistory?.find(h => h.status === 'avsec_training_applied') && (
               (() => {
                 const appliedEntry = pass.statusHistory.find(h => h.status === 'avsec_training_applied');
                 const daysSince = (new Date() - new Date(appliedEntry.date)) / (1000 * 60 * 60 * 24);
                 if (daysSince > 3) {
                   return (
                    <div className="flex items-start p-3 bg-amber-50 text-amber-800 rounded-lg border border-amber-100 text-sm">
                      <Clock className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong>Action Required:</strong> AVSEC applied {Math.floor(daysSince)} days ago. Please visit Pass Office for manual link regeneration.
                      </div>
                    </div>
                   );
                 }
                 return null;
               })()
            )}

            {pass.documents?.map((doc, i) => {
              if (!doc.expiryDate) return null;
              const daysToExpiry = (new Date(doc.expiryDate) - new Date()) / (1000 * 60 * 60 * 24);
              if (daysToExpiry > 0 && daysToExpiry <= 30) {
                return (
                  <div key={i} className="flex items-start p-3 bg-orange-50 text-orange-800 rounded-lg border border-orange-100 text-sm">
                    <AlertTriangle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>Expiring Soon:</strong> {doc.type} expires in {Math.floor(daysToExpiry)} days ({formatDate(doc.expiryDate)}).
                    </div>
                  </div>
                );
              }
              return null;
            })}

            <div className="text-sm text-gray-500 mt-2 italic">
              * Automated email reminders are sent daily for active alerts shown above.
            </div>
          </div>
        </div>
        <ProceduralChecklist passId={id} />
      </div>
    </div>

      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-gray-900">Cancel Application</h3>
              <button 
                onClick={() => setShowCancelModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cancellation Reason *</label>
                <select 
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                >
                  <option value="">Select a reason...</option>
                  <option value="Employee exit">Employee exit</option>
                  <option value="Pass misuse">Pass misuse</option>
                  <option value="Expired without renewal">Expired without renewal</option>
                  <option value="Issued in error">Issued in error</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {cancelReason === 'Other' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Details *</label>
                  <textarea 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                    placeholder="Provide cancellation details..."
                    value={cancelDetails}
                    onChange={(e) => setCancelDetails(e.target.value)}
                    rows={3}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cancellation Date *</label>
                <input 
                  type="date"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                  value={cancelDate}
                  onChange={(e) => setCancelDate(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pass Surrender Copy (Optional)</label>
                <div className="border border-slate-200 p-3 rounded-lg bg-slate-50">
                  <FileUpload 
                    value={cancelFile}
                    onChange={(file) => setCancelFile(file)}
                    accept="image/*,.pdf"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Required for future TAEP applications.</p>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end space-x-3">
              <button 
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
                disabled={isUpdating}
              >
                Go Back
              </button>
              <button 
                onClick={handleCancelPass}
                disabled={isUpdating || !cancelReason || (cancelReason === 'Other' && !cancelDetails)}
                className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isUpdating ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PassApplicationDetail;
