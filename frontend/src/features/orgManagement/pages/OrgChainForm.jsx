import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { orgService } from '../services/org.service';
import FileUpload from '@/components/ui/FileUpload';
import { storage } from '@/config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storageService } from '@/services/storage.service';

const OrgChainForm = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [docFiles, setDocFiles] = useState({});
  const [licenseCopyFile, setLicenseCopyFile] = useState(null);

  const [formData, setFormData] = useState({
    companyName: '',
    locationName: '',
    locationType: 'Airport',
    zoneName: '',
    zoneType: 'Landside (Pre-Security)',
    storeName: '',
    storeType: 'Confectionery',
    licenseType: 'Airport entry related',
    validityStartDate: '',
    validityEndDate: '',
    renewalDueDate: '',
    info_businessName: '',
    info_applicantName: '',
    info_tradeCategory: '',
    info_storeArea: '',
    info_numEmployees: '',
    info_businessEntityType: '',
    info_taxId: '',
    info_details: '',
    documentsRequired: [],
    licenseCopy: null
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const next = { ...prev, [name]: value };
      if (name === 'validityEndDate' && value) {
        const d = new Date(value);
        d.setDate(d.getDate() - 30);
        next.renewalDueDate = d.toISOString().split('T')[0];
      }
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      
      const payload = { ...formData };
      if (payload.locationType !== 'Airport') {
        payload.zoneName = null;
        payload.zoneType = null;
      }
      
      // Structure informationRequired properly
      if (payload.licenseType === 'Trade license') {
        payload.informationRequired = {
          tradeName: payload.info_businessName || payload.companyName,
          applicantName: payload.info_applicantName,
          tradeCategory: payload.info_tradeCategory,
          storeArea: payload.info_storeArea,
          numEmployees: payload.info_numEmployees,
          businessEntityType: payload.info_businessEntityType,
          taxId: payload.info_taxId
        };
      } else {
        payload.informationRequired = {
          tradeName: payload.companyName,
          details: payload.info_details
        };
      }

      // Upload Documents
      const tempId = Date.now().toString();
      const docsReq = [];
      
      for (const [docType, file] of Object.entries(docFiles)) {
        if (file) {
          const folderPath = `temp_chains/${tempId}/${docType}`;
          const url = await storageService.uploadFile(file, folderPath);
          docsReq.push({
            type: docType,
            fileUrl: url,
            status: 'uploaded',
            uploadedDate: new Date().toISOString()
          });
        }
      }
      if (licenseCopyFile) {
        const folderPath = `temp_chains/${tempId}/licenseCopy`;
        const url = await storageService.uploadFile(licenseCopyFile, folderPath);
        docsReq.push({
          type: 'Final License Copy',
          fileUrl: url,
          status: 'uploaded',
          uploadedDate: new Date().toISOString()
        });
      }
      payload.documentsRequired = docsReq;

      await orgService.createOrgChain(payload);
      toast.success('Organization chain created successfully!');
      navigate('/dashboard/org-management');
    } catch (e) {
      toast.error(e.response?.data?.message || e.message || 'Failed to create organization chain');
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 animate-fade-in">
      <button 
        onClick={() => navigate('/dashboard/org-management')}
        className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Org Management
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50">
          <h2 className="text-xl font-bold text-slate-900">Add Company Chain</h2>
          <p className="text-sm text-slate-500 mt-1">Create a complete organizational chain in a single submission.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Company Section */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">1. Company Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Company Name *</label>
                <input 
                  type="text" 
                  name="companyName" 
                  value={formData.companyName} 
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Location Section */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">2. Location Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Location Name *</label>
                <input 
                  type="text" 
                  name="locationName" 
                  value={formData.locationName} 
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Location Type *</label>
                <select 
                  name="locationType" 
                  value={formData.locationType} 
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                >
                  <option value="Airport">Airport</option>
                  <option value="Metro">Metro</option>
                  <option value="Others">Others</option>
                </select>
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Zone Section (Conditional) */}
          {formData.locationType === 'Airport' && (
            <>
              <div className="animate-fade-in">
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">3. Airport Zone Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Zone Name *</label>
                    <input 
                      type="text" 
                      name="zoneName" 
                      value={formData.zoneName} 
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Zone Type *</label>
                    <select 
                      name="zoneType" 
                      value={formData.zoneType} 
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                    >
                      <option value="Landside (Pre-Security)">Landside (Pre-Security)</option>
                      <option value="Airside - Domestic (Post-Security)">Airside - Domestic (Post-Security)</option>
                      <option value="Airside - International (Duty-Free/Transit)">Airside - International (Duty-Free/Transit)</option>
                    </select>
                  </div>
                </div>
              </div>
              <hr className="border-slate-100" />
            </>
          )}

          {/* Store Section */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
              {formData.locationType === 'Airport' ? '4. Store Details' : '3. Store Details'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Store Name *</label>
                <input 
                  type="text" 
                  name="storeName" 
                  value={formData.storeName} 
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Store Type *</label>
                <select 
                  name="storeType" 
                  value={formData.storeType} 
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                >
                  <option value="Confectionery">Confectionery</option>
                  <option value="Food café">Food café</option>
                  <option value="Liquors">Liquors</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Sport">Sport</option>
                  <option value="Accessories">Accessories</option>
                </select>
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* License Section */}
          <div className="animate-fade-in">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
              {formData.locationType === 'Airport' ? '5. License Details' : '4. License Details'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">License Type *</label>
                <select 
                  name="licenseType" 
                  value={formData.licenseType} 
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                >
                  <option value="Airport entry related">Airport entry related</option>
                  <option value="S&E">S&E</option>
                  <option value="Contract labour">Contract labour</option>
                  <option value="Trade license">Trade license</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Validity Start Date</label>
                <input 
                  type="date" 
                  name="validityStartDate" 
                  value={formData.validityStartDate} 
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Validity End Date</label>
                <input 
                  type="date" 
                  name="validityEndDate" 
                  value={formData.validityEndDate} 
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Renewal / Expiry Date</label>
                <input 
                  type="date" 
                  name="renewalDueDate" 
                  value={formData.renewalDueDate} 
                  readOnly
                  className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed outline-none"
                />
                <p className="text-xs text-slate-500 mt-1">Auto-calculated as 30 days before End Date</p>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-sm font-medium text-slate-800 mb-3">Information Required</h4>
              {formData.licenseType === 'Trade license' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" name="info_businessName" value={formData.info_businessName} onChange={handleChange} placeholder="Business/Trade Name" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  <input type="text" name="info_applicantName" value={formData.info_applicantName} onChange={handleChange} placeholder="Applicant/Authorized Signatory Name" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  <input type="text" name="info_tradeCategory" value={formData.info_tradeCategory} onChange={handleChange} placeholder="Trade Category/Nature of Business" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  <input type="text" name="info_storeArea" value={formData.info_storeArea} onChange={handleChange} placeholder="Store Area/Dimensions" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  <input type="number" name="info_numEmployees" value={formData.info_numEmployees} onChange={handleChange} placeholder="Number of Employees Linked" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  <input type="text" name="info_businessEntityType" value={formData.info_businessEntityType} onChange={handleChange} placeholder="Business Entity Type" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  <input type="text" name="info_taxId" value={formData.info_taxId} onChange={handleChange} placeholder="Tax IDs/GSTIN/PAN" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              ) : (
                <textarea 
                  name="info_details" 
                  value={formData.info_details} 
                  onChange={handleChange}
                  rows="3"
                  placeholder="Enter required information (key-value structure or description)..."
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              )}
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-sm font-medium text-slate-800 mb-3">Documents Required</h4>
                <div className="space-y-3">
                  {['Application Form', 'Address Proof', 'Tax Document'].map((docType) => (
                    <div key={docType} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                      <div className="text-sm font-medium text-gray-900 w-1/3">{docType}</div>
                      <div className="w-2/3 flex justify-end">
                        <FileUpload 
                          value={docFiles[docType]} 
                          onChange={(f) => setDocFiles(prev => ({ ...prev, [docType]: f }))} 
                          accept="image/*,.pdf" 
                          className="w-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-slate-800 mb-3">License Copy Stored</h4>
                <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
                  <div className="flex flex-col gap-2 mb-2">
                    <span className="text-sm font-medium text-gray-900">Final Issued License</span>
                    <FileUpload 
                      value={licenseCopyFile} 
                      onChange={f => setLicenseCopyFile(f)} 
                      accept="image/*,.pdf" 
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Optional. Upload once the license is issued — can also be added later in License Management.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button 
              type="button"
              onClick={() => navigate('/dashboard/org-management')}
              className="px-6 py-2.5 text-slate-600 font-medium rounded-lg hover:bg-slate-100 mr-3 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Chain'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrgChainForm;
