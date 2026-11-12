import { useState } from 'react';
import { z } from 'zod';
import Papa from 'papaparse';
import { Download, UploadCloud, AlertCircle, CheckCircle2, Save, FileSpreadsheet, XCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import FileUpload from '@/components/ui/FileUpload';
import { useAuthStore } from '@/store/authStore';
import { addEmployee, saveSensitiveDoc } from '@/features/employeeMaster/services/employee.firestore';
import toast from 'react-hot-toast';

const rowSchema = z.object({
  fullName: z.string().min(2, 'Name is required'),
  employeeId: z.string().min(1, 'Employee ID is required'),
  department: z.string().min(1, 'Department is required'),
  airportName: z.string().min(1, 'Airport Name is required'),
  companyName: z.string().min(1, 'Company Name is required'),
  mobileNumber: z.string().regex(/^\d{10}$/, 'Must be a 10-digit number'),
  email: z.string().email('Invalid email'),
  passType: z.string().min(1, 'Pass type is required'),
  passStatus: z.string().min(1, 'Pass status is required'),
  // Optional fields
  passportNumber: z.string().optional(),
  aadhaarNumber: z.string().optional(),
  panNumber: z.string().optional(),
  alternateIdType: z.string().optional(),
  alternateIdNumber: z.string().optional(),
  workedBefore: z.string().optional(),
  previousCompany: z.string().optional(),
  previousPassType: z.string().optional(),
  previousTaepDays: z.string().optional(),
  avsecDate: z.string().optional(),
  caDate: z.string().optional(),
  caVerifiedThrough: z.string().optional(),
  passIssueDate: z.string().optional(),
  passExpiryDate: z.string().optional(),
});

const TEMPLATE_HEADERS = Object.keys(rowSchema.shape);

const MasterDataUpload = () => {
  const user = useAuthStore(state => state.firebaseUser);
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const handleDownloadTemplate = () => {
    const csv = Papa.unparse({
      fields: TEMPLATE_HEADERS,
      data: []
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'Employee_Upload_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (selectedFile) => {
    setFile(selectedFile);
    setParsedData(null);
    setImportResult(null);

    if (selectedFile) {
      Papa.parse(selectedFile, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const rows = results.data;
          const validatedRows = rows.map((row, index) => {
            const parsed = rowSchema.safeParse(row);
            if (parsed.success) {
              return { rowNum: index + 2, data: parsed.data, isValid: true, errors: [] };
            } else {
              const errors = parsed.error.issues.map(issue => `${issue.path[0]}: ${issue.message}`);
              return { rowNum: index + 2, data: row, isValid: false, errors };
            }
          });
          setParsedData(validatedRows);
        },
        error: (err) => {
          toast.error('Failed to parse CSV file');
          console.error(err);
        }
      });
    }
  };

  const downloadErrorReport = () => {
    if (!importResult || !importResult.failedRows.length) return;
    const errorData = importResult.failedRows.map(r => ({
      Row: r.rowNum,
      Errors: r.errors.join(' | '),
      ...r.data
    }));
    const csv = Papa.unparse(errorData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'Employee_Upload_Errors.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = async () => {
    if (!parsedData || !user?.uid) return;
    
    const validRows = parsedData.filter(r => r.isValid);
    if (validRows.length === 0) {
      toast.error('No valid rows to import');
      return;
    }

    setLoading(true);
    let successCount = 0;
    const orgId = user.uid;

    try {
      for (const row of validRows) {
        const payload = { ...row.data };
        
        // Auto-calculate expiries if dates exist
        if (payload.avsecDate) {
          const d = new Date(payload.avsecDate);
          d.setFullYear(d.getFullYear() + 1);
          payload.avsecExpiry = d.toISOString().split('T')[0];
        }
        if (payload.caDate) {
          const d = new Date(payload.caDate);
          d.setFullYear(d.getFullYear() + 3);
          payload.caExpiry = d.toISOString().split('T')[0];
        }

        // Handle sensitive masking
        const fullAadhaar = payload.aadhaarNumber;
        const fullPan = payload.panNumber;
        
        if (fullAadhaar && fullAadhaar.length > 4 && !fullAadhaar.includes('XXXX')) {
          payload.aadhaarNumber = `XXXX-XXXX-${fullAadhaar.slice(-4)}`;
        }
        if (fullPan && fullPan.length > 4 && !fullPan.includes('XXXX')) {
          payload.panNumber = `XXXX-${fullPan.slice(-4)}`;
        }

        // Set defaults
        payload.workedBefore = payload.workedBefore || 'No';
        payload.docsChecklist = [];

        // Import
        const empId = await addEmployee(orgId, payload);
        
        // Save sensitive docs
        if (fullAadhaar && !fullAadhaar.includes('XXXX')) {
          await saveSensitiveDoc(orgId, empId, 'aadhaar', fullAadhaar);
        }
        if (fullPan && !fullPan.includes('XXXX')) {
          await saveSensitiveDoc(orgId, empId, 'pan', fullPan);
        }

        successCount++;
      }

      const failedRows = parsedData.filter(r => !r.isValid);
      setImportResult({
        successCount,
        failedRows,
        totalAttempted: parsedData.length
      });
      toast.success(`Successfully imported ${successCount} employees`);
      
    } catch (err) {
      console.error(err);
      toast.error('An error occurred during import');
    } finally {
      setLoading(false);
    }
  };

  const validCount = parsedData?.filter(r => r.isValid).length || 0;
  const invalidCount = parsedData?.filter(r => !r.isValid).length || 0;

  return (
    <div className="animate-fade-in max-w-7xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Master Data Upload</h1>
          <p className="text-sm text-gray-500 mt-1">Bulk import employee records via CSV template</p>
        </div>
        <Button variant="secondary" onClick={handleDownloadTemplate} className="flex items-center gap-2">
          <Download className="w-4 h-4" /> Download CSV Template
        </Button>
      </div>

      {!importResult ? (
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden mb-6">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Step 1: Upload Data</h2>
            <div className="max-w-xl">
              <FileUpload 
                accept=".csv"
                onChange={handleFileChange}
                value={file}
                helperText="Upload the filled CSV template. Only .csv files are supported."
              />
            </div>
          </div>

          {parsedData && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Step 2: Preview & Validate</h2>
                <div className="flex items-center gap-4 text-sm font-medium">
                  <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="w-4 h-4" /> {validCount} Valid
                  </span>
                  {invalidCount > 0 && (
                    <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2.5 py-1 rounded-full">
                      <AlertCircle className="w-4 h-4" /> {invalidCount} Invalid
                    </span>
                  )}
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-x-auto max-h-[400px]">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-3 font-medium text-gray-600">Row</th>
                      <th className="px-4 py-3 font-medium text-gray-600">Status</th>
                      <th className="px-4 py-3 font-medium text-gray-600">Employee Name</th>
                      <th className="px-4 py-3 font-medium text-gray-600">Email</th>
                      <th className="px-4 py-3 font-medium text-gray-600">Errors</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedData.map((row, i) => (
                      <tr key={i} className={row.isValid ? 'hover:bg-slate-50' : 'bg-red-50/50'}>
                        <td className="px-4 py-3 text-gray-500">{row.rowNum}</td>
                        <td className="px-4 py-3">
                          {row.isValid ? (
                            <span className="text-green-600 flex items-center gap-1"><CheckCircle2 className="w-4 h-4"/> Valid</span>
                          ) : (
                            <span className="text-red-600 flex items-center gap-1"><XCircle className="w-4 h-4"/> Error</span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900">{row.data.fullName || '-'}</td>
                        <td className="px-4 py-3 text-gray-600">{row.data.email || '-'}</td>
                        <td className="px-4 py-3">
                          {!row.isValid && (
                            <div className="flex flex-col gap-1">
                              {row.errors.map((err, idx) => (
                                <span key={idx} className="text-xs text-red-600 bg-red-100 px-2 py-0.5 rounded">{err}</span>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-6">
                <Button 
                  variant="primary" 
                  onClick={handleImport} 
                  disabled={validCount === 0 || loading}
                  isLoading={loading}
                  className="flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> 
                  Import {validCount} Valid {validCount === 1 ? 'Row' : 'Rows'}
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-8 text-center max-w-2xl mx-auto mt-10">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-100">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Import Complete</h2>
          <p className="text-gray-500 mb-6">
            Successfully imported {importResult.successCount} out of {importResult.totalAttempted} rows.
          </p>

          {importResult.failedRows.length > 0 && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6 text-left">
              <div className="flex items-center gap-2 mb-2 text-red-800 font-semibold">
                <AlertCircle className="w-5 h-5" />
                {importResult.failedRows.length} rows failed validation and were skipped
              </div>
              <p className="text-sm text-red-600 mb-3">Download the error report, fix the issues, and re-upload the fixed rows.</p>
              <Button variant="secondary" onClick={downloadErrorReport} className="bg-white border-red-200 text-red-700 hover:bg-red-50 text-sm h-9">
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Download Error Report
              </Button>
            </div>
          )}

          <div className="flex justify-center gap-3">
            <Button variant="secondary" onClick={() => { setFile(null); setParsedData(null); setImportResult(null); }}>
              Upload Another File
            </Button>
            <Button onClick={() => window.location.href = '/dashboard/employee-master'}>
              View Employee Master
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterDataUpload;
