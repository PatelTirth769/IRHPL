import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Save, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import FileUpload from '@/components/ui/FileUpload';
import Divider from '@/components/ui/Divider';
import { useAuthStore } from '@/store/authStore';
import { addEmployee, updateEmployee, uploadEmployeeFile, saveSensitiveDoc } from '../services/employee.firestore';
import toast from 'react-hot-toast';
import { createPortal } from 'react-dom';

const schema = z.object({
  fullName: z.string().min(2, 'Name is required'),
  employeeId: z.string().min(1, 'Employee ID is required'),
  department: z.string().min(1, 'Department is required'),
  airportName: z.string().min(1, 'Airport Name is required'),
  companyName: z.string().min(1, 'Company Name is required'),
  mobileNumber: z.string().regex(/^\d{10}$/, 'Must be a 10-digit number'),
  email: z.string().email('Invalid email'),
  
  passportNumber: z.string().optional(),
  aadhaarNumber: z.string().optional(),
  panNumber: z.string().optional(),
  alternateIdType: z.string().optional(),
  alternateIdNumber: z.string().optional(),
  
  workedBefore: z.enum(['Yes', 'No']).default('No'),
  previousCompany: z.string().optional(),
  previousPassType: z.string().optional(),
  previousTaepDays: z.string().optional(),
  
  avsecDate: z.string().optional(),
  avsecExpiry: z.string().optional(),
  caDate: z.string().optional(),
  caExpiry: z.string().optional(),
  caVerifiedThrough: z.string().optional(),
  
  passType: z.string().min(1, 'Pass type is required'),
  passIssueDate: z.string().optional(),
  passExpiryDate: z.string().optional(),
  passStatus: z.string().min(1, 'Pass status is required'),
  
  docsChecklist: z.array(z.string()).optional()
});

const EmployeeForm = ({ employee, onClose, onSuccess }) => {
  const user = useAuthStore(state => state.firebaseUser);
  const [loading, setLoading] = useState(false);
  const isEdit = !!employee;

  // File states
  const [files, setFiles] = useState({
    passport: employee?.passportUrl ? { fileUrl: employee.passportUrl, name: 'Passport Document' } : null,
    aadhaar: employee?.aadhaarUrl ? { fileUrl: employee.aadhaarUrl, name: 'Aadhaar Document' } : null,
    pan: employee?.panUrl ? { fileUrl: employee.panUrl, name: 'PAN Document' } : null,
    photo: employee?.photoUrl ? { fileUrl: employee.photoUrl, name: 'Passport Photo' } : null,
    passSurrender: employee?.passSurrenderUrl ? { fileUrl: employee.passSurrenderUrl, name: 'Pass Surrender Copy' } : null,
  });

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: employee || {
      workedBefore: 'No',
      docsChecklist: [],
      email: '',
      passStatus: 'Active',
      passType: '4 Hr Pass'
    }
  });

  const passportNumber = watch('passportNumber');
  const workedBefore = watch('workedBefore');
  const avsecDate = watch('avsecDate');
  const caDate = watch('caDate');

  // Auto-calculate expiries
  useEffect(() => {
    if (avsecDate) {
      const d = new Date(avsecDate);
      d.setFullYear(d.getFullYear() + 1);
      setValue('avsecExpiry', d.toISOString().split('T')[0]);
    }
  }, [avsecDate, setValue]);

  useEffect(() => {
    if (caDate) {
      const d = new Date(caDate);
      d.setFullYear(d.getFullYear() + 3);
      setValue('caExpiry', d.toISOString().split('T')[0]);
    }
  }, [caDate, setValue]);

  const handleFile = (key, file) => setFiles(prev => ({ ...prev, [key]: file }));

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const orgId = user.uid;
      let empId = employee?.id;

      // Extract full sensitive data and mask them for main doc
      const fullAadhaar = data.aadhaarNumber;
      const fullPan = data.panNumber;
      
      const payload = { ...data };
      if (fullAadhaar && fullAadhaar.length > 4 && !fullAadhaar.includes('XXXX')) {
        payload.aadhaarNumber = `XXXX-XXXX-${fullAadhaar.slice(-4)}`;
      }
      if (fullPan && fullPan.length > 4 && !fullPan.includes('XXXX')) {
        payload.panNumber = `XXXX-${fullPan.slice(-4)}`;
      }

      if (isEdit) {
        await updateEmployee(orgId, empId, payload);
      } else {
        empId = await addEmployee(orgId, payload);
      }

      // Save sensitive docs if they are new (not already masked)
      if (fullAadhaar && !fullAadhaar.includes('XXXX')) {
        await saveSensitiveDoc(orgId, empId, 'aadhaar', fullAadhaar);
      }
      if (fullPan && !fullPan.includes('XXXX')) {
        await saveSensitiveDoc(orgId, empId, 'pan', fullPan);
      }

      // Upload files
      const uploadPromises = [];
      for (const [key, file] of Object.entries(files)) {
        if (file && file instanceof File) {
          uploadPromises.push(
            uploadEmployeeFile(orgId, empId, file, key).then(url => {
               return updateEmployee(orgId, empId, { [`${key}Url`]: url });
            })
          );
        }
      }
      if (uploadPromises.length > 0) {
        await Promise.all(uploadPromises);
      }

      toast.success(isEdit ? 'Employee updated' : 'Employee added');
      onSuccess();
    } catch (error) {
      console.error(error);
      toast.error('Failed to save employee');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col">
        <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between shrink-0">
          <h2 className="text-xl font-bold text-gray-900">{isEdit ? 'Edit Employee' : 'Add Employee'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          <form id="emp-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            
            {/* Basic Info */}
            <section>
              <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Basic Info</h3>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Full Name" {...register('fullName')} error={errors.fullName} required />
                <Input label="Employee ID" {...register('employeeId')} error={errors.employeeId} required />
                <Input label="Department" {...register('department')} error={errors.department} required />
                <Input label="Airport Name" {...register('airportName')} error={errors.airportName} required />
                <Input label="Company Name" {...register('companyName')} error={errors.companyName} required />
                <Input label="Mobile Number" {...register('mobileNumber')} error={errors.mobileNumber} required />
                <Input label="Email" {...register('email')} error={errors.email} required />
              </div>
            </section>

            {/* Identity Documents */}
            <section>
              <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Identity Documents</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Input label="Passport Number" {...register('passportNumber')} />
                  <FileUpload onChange={(f) => handleFile('passport', f)} value={files.passport} />
                </div>
                {!passportNumber && (
                  <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <Select 
                      label="Alternate ID Type" 
                      {...register('alternateIdType')}
                      options={[{label: 'Driving License', value: 'DL'}, {label: 'Voter ID', value: 'Voter ID'}]}
                    />
                    <Input label="Alternate ID Number" {...register('alternateIdNumber')} />
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Input label="Aadhaar Number (will be masked)" {...register('aadhaarNumber')} placeholder="12-digit number" />
                  <FileUpload onChange={(f) => handleFile('aadhaar', f)} value={files.aadhaar} />
                </div>
                <div className="space-y-2">
                  <Input label="PAN Number (will be masked)" {...register('panNumber')} />
                  <FileUpload onChange={(f) => handleFile('pan', f)} value={files.pan} />
                </div>
              </div>
              <div className="col-span-2 mt-4">
                 <FileUpload label="Passport Size Photo" helperText="Must have white background" onChange={(f) => handleFile('photo', f)} value={files.photo} accept="image/*" />
              </div>
            </section>

            {/* Employment History */}
            <section>
              <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Employment / Pass History</h3>
              <div className="mb-4">
                <Select label="Has this employee worked at an airport before?" {...register('workedBefore')} options={[{label: 'Yes', value: 'Yes'}, {label: 'No', value: 'No'}]} />
              </div>
              {workedBefore === 'Yes' && (
                <>
                  <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg mb-4 flex gap-2 items-start">
                    <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-800">TAEP is capped at 90 days total (30 fresh + 60 forwarding). Employees who have already used BAEP previously are only eligible to reapply for BAEP, not TAEP forwarding.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <Input label="Previous Company" {...register('previousCompany')} />
                    <Select label="Previous Pass Type" {...register('previousPassType')} options={[{label: 'TAEP', value: 'TAEP'}, {label: 'BAEP', value: 'BAEP'}]} />
                    <Input label="Previous TAEP days consumed" type="number" max="90" {...register('previousTaepDays')} />
                  </div>
                  <FileUpload label="Pass Surrender Copy" onChange={(f) => handleFile('passSurrender', f)} value={files.passSurrender} />
                </>
              )}
            </section>

            {/* Compliance Status */}
            <section>
              <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Compliance Status</h3>
              <div className="grid grid-cols-2 gap-4">
                <Input label="AVSEC Training Date" type="date" {...register('avsecDate')} />
                <Input label="AVSEC Expiry Date (Auto)" type="date" disabled value={watch('avsecExpiry') || ''} className="bg-slate-50" />
                <Input label="C&A Verif. Date" type="date" {...register('caDate')} />
                <Input label="C&A Expiry Date (Auto)" type="date" disabled value={watch('caExpiry') || ''} className="bg-slate-50" />
                <Select label="C&A Verified Through" {...register('caVerifiedThrough')} options={[{label: 'SP Office', value: 'SP Office'}, {label: 'DM Office', value: 'DM Office'}]} />
              </div>
            </section>

            {/* Current Pass */}
            <section>
              <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Current Pass</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <Select label="Pass Type" {...register('passType')} error={errors.passType} required options={[
                  { label: '4 Hr Pass', value: '4 Hr Pass' },
                  { label: 'TAEP 1-3 Day', value: 'TAEP 1-3 Day' },
                  { label: 'Fresh TAEP 30 Days', value: 'Fresh TAEP 30 Days' },
                  { label: 'TAEP Forwarding 60-90 Days', value: 'TAEP Forwarding 60-90 Days' },
                  { label: 'BAEP', value: 'BAEP' },
                ]} />
                <Select label="Pass Status" {...register('passStatus')} error={errors.passStatus} required options={[
                  { label: 'Active', value: 'Active' },
                  { label: 'Expired', value: 'Expired' },
                  { label: 'Under Process', value: 'Under Process' },
                  { label: 'Reverted', value: 'Reverted' },
                ]} />
                <Input label="Pass Issue Date" type="date" {...register('passIssueDate')} />
                <Input label="Pass Expiry Date" type="date" {...register('passExpiryDate')} />
              </div>
            </section>
            
          </form>
        </div>

        <div className="bg-white border-t border-slate-100 p-4 flex justify-end gap-3 shrink-0">
          <Button variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button type="submit" form="emp-form" isLoading={loading} className="flex items-center gap-2">
            <Save className="w-4 h-4" /> Save Employee
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default EmployeeForm;
