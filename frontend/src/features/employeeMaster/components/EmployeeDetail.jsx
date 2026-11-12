import { X, Edit, FileText } from 'lucide-react';
import Button from '@/components/ui/Button';

const SectionHeader = ({ title }) => (
  <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">{title}</h3>
);

const DetailRow = ({ label, value }) => (
  <div>
    <p className="text-[13px] text-gray-500 font-medium mb-1">{label}</p>
    <p className="text-[15px] font-semibold text-gray-900">{value || '-'}</p>
  </div>
);

const FileLink = ({ label, url }) => {
  if (!url) return <DetailRow label={label} value="Not Provided" />;
  return (
    <div>
      <p className="text-[13px] text-gray-500 font-medium mb-1">{label}</p>
      <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:underline">
        <FileText className="w-4 h-4" /> View Document
      </a>
    </div>
  );
};

import { createPortal } from 'react-dom';

const EmployeeDetail = ({ employee, onClose, onEdit }) => {
  if (!employee) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col">
        <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between shrink-0">
          <h2 className="text-xl font-bold text-gray-900">Employee Details</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto space-y-8">
          
          <section>
            <SectionHeader title="Basic Info" />
            <div className="grid grid-cols-2 gap-4">
              <DetailRow label="Full Name" value={employee.fullName} />
              <DetailRow label="Employee ID" value={employee.employeeId} />
              <DetailRow label="Department" value={employee.department} />
              <DetailRow label="Airport Name" value={employee.airportName} />
              <DetailRow label="Company Name" value={employee.companyName} />
              <DetailRow label="Mobile Number" value={employee.mobileNumber} />
              <DetailRow label="Email" value={employee.email} />
            </div>
          </section>

          <section>
            <SectionHeader title="Identity Documents" />
            <div className="grid grid-cols-2 gap-4">
              <DetailRow label="Passport Number" value={employee.passportNumber} />
              <FileLink label="Passport File" url={employee.passportUrl} />
              
              {!employee.passportNumber && (
                <>
                  <DetailRow label="Alternate ID Type" value={employee.alternateIdType} />
                  <DetailRow label="Alternate ID Number" value={employee.alternateIdNumber} />
                </>
              )}
              
              <DetailRow label="Aadhaar Number" value={employee.aadhaarNumber} />
              <FileLink label="Aadhaar File" url={employee.aadhaarUrl} />
              
              <DetailRow label="PAN Number" value={employee.panNumber} />
              <FileLink label="PAN File" url={employee.panUrl} />
              
              <FileLink label="Passport Photo" url={employee.photoUrl} />
            </div>
          </section>

          <section>
            <SectionHeader title="Employment / Pass History" />
            <DetailRow label="Worked before?" value={employee.workedBefore} />
            {employee.workedBefore === 'Yes' && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                <DetailRow label="Previous Company" value={employee.previousCompany} />
                <DetailRow label="Previous Pass Type" value={employee.previousPassType} />
                <DetailRow label="Previous TAEP Days" value={employee.previousTaepDays} />
                <FileLink label="Pass Surrender Copy" url={employee.passSurrenderUrl} />
              </div>
            )}
          </section>

          <section>
            <SectionHeader title="Compliance Status" />
            <div className="grid grid-cols-2 gap-4">
              <DetailRow label="AVSEC Training Date" value={employee.avsecDate} />
              <DetailRow label="AVSEC Expiry Date" value={employee.avsecExpiry} />
              <DetailRow label="C&A Verification Date" value={employee.caDate} />
              <DetailRow label="C&A Expiry Date" value={employee.caExpiry} />
              <DetailRow label="C&A Verified Through" value={employee.caVerifiedThrough} />
            </div>
          </section>

          <section>
            <SectionHeader title="Current Pass" />
            <div className="grid grid-cols-2 gap-4">
              <DetailRow label="Pass Type" value={employee.passType} />
              <DetailRow label="Pass Status" value={employee.passStatus} />
              <DetailRow label="Pass Issue Date" value={employee.passIssueDate} />
              <DetailRow label="Pass Expiry Date" value={employee.passExpiryDate} />
            </div>
          </section>
        </div>

        <div className="bg-white border-t border-slate-100 p-4 flex justify-end shrink-0">
          <Button onClick={onEdit} className="flex items-center gap-2">
            <Edit className="w-4 h-4" /> Edit Employee
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default EmployeeDetail;
