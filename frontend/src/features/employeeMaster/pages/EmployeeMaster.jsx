import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { getEmployees, deleteEmployee } from '../services/employee.firestore';
import EmployeeTable from '../components/EmployeeTable';
import EmployeeForm from '../components/EmployeeForm';
import EmployeeDetail from '../components/EmployeeDetail';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { Plus, Search, AlertCircle, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';

const EmployeeMaster = () => {
  const user = useAuthStore((state) => state.firebaseUser);
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const fetchEmployees = async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const data = await getEmployees(user.uid);
      setEmployees(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [user?.uid]);

  const handleAdd = () => {
    setSelectedEmployee(null);
    setIsFormOpen(true);
  };

  const handleEdit = (employee) => {
    setSelectedEmployee(employee);
    setIsDetailOpen(false);
    setIsFormOpen(true);
  };

  const handleView = (employee) => {
    setSelectedEmployee(employee);
    setIsDetailOpen(true);
  };

  const handleDelete = async (employee) => {
    if (window.confirm(`Are you sure you want to delete ${employee.fullName}?`)) {
      try {
        await deleteEmployee(user.uid, employee.id);
        toast.success('Employee deleted successfully');
        fetchEmployees();
      } catch (error) {
        toast.error('Failed to delete employee');
      }
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    fetchEmployees();
  };

  // Derived state
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = (emp.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (emp.employeeId || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter ? emp.passStatus === statusFilter : true;
    const matchesType = typeFilter ? emp.passType === typeFilter : true;
    return matchesSearch && matchesStatus && matchesType;
  });

  const expiringCount = employees.filter(emp => {
    if (!emp.avsecExpiry && !emp.caExpiry && !emp.passExpiryDate) return false;
    const now = new Date();
    const thirtyDays = new Date(now.setDate(now.getDate() + 30));
    
    const checkExp = (dateStr) => {
      if (!dateStr) return false;
      const d = new Date(dateStr);
      return d <= thirtyDays && d >= new Date();
    };
    return checkExp(emp.avsecExpiry) || checkExp(emp.caExpiry) || checkExp(emp.passExpiryDate);
  }).length;

  return (
    <div className="animate-fade-in max-w-7xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employee Master</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your organization's employees and compliance passes</p>
        </div>
        <Button onClick={handleAdd} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Employee
        </Button>
      </div>

      {expiringCount > 0 && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            <p className="text-sm text-amber-800 font-medium">
              {expiringCount} {expiringCount === 1 ? 'employee has' : 'employees have'} documents expiring within 30 days.
            </p>
          </div>
          <Button variant="secondary" className="text-sm h-8 px-3 text-amber-700 bg-amber-100 hover:bg-amber-200 border-none" onClick={() => {
            navigate('/expiry-reminders');
          }}>
            View Expiring
          </Button>
        </div>
      )}

      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden min-h-[500px] flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-3 bg-slate-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input 
              placeholder="Search by name or ID..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 bg-white"
            />
          </div>
          <div className="flex gap-3">
            <Select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-40"
              options={[
                { label: 'All Statuses', value: '' },
                { label: 'Active', value: 'Active' },
                { label: 'Expired', value: 'Expired' },
                { label: 'Under Process', value: 'Under Process' },
                { label: 'Reverted', value: 'Reverted' },
              ]}
            />
            <Select 
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-40"
              options={[
                { label: 'All Types', value: '' },
                { label: '4 Hr Pass', value: '4 Hr Pass' },
                { label: 'TAEP 1-3 Day', value: 'TAEP 1-3 Day' },
                { label: 'Fresh TAEP 30 Days', value: 'Fresh TAEP 30 Days' },
                { label: 'TAEP Forwarding', value: 'TAEP Forwarding 60-90 Days' },
                { label: 'BAEP', value: 'BAEP' },
              ]}
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 p-0">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : employees.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center p-6">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <Briefcase className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-[17px] font-bold text-gray-900 mb-2">No employees found</h3>
              <p className="text-[14px] text-gray-500 max-w-sm mb-6">
                Get started by adding your first employee to the master list.
              </p>
              <Button onClick={handleAdd} className="flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add Employee
              </Button>
            </div>
          ) : (
            <EmployeeTable 
              employees={filteredEmployees} 
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </div>
      </div>

      {isFormOpen && (
        <EmployeeForm 
          employee={selectedEmployee} 
          onClose={() => setIsFormOpen(false)} 
          onSuccess={handleFormSuccess}
        />
      )}

      {isDetailOpen && selectedEmployee && (
        <EmployeeDetail 
          employee={selectedEmployee}
          onClose={() => setIsDetailOpen(false)}
          onEdit={() => handleEdit(selectedEmployee)}
        />
      )}
    </div>
  );
};

export default EmployeeMaster;
