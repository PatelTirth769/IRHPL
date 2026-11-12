import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { checklistService } from '../services/checklist.service';
import { Search, ListChecks, ArrowRight, CheckCircle2, Circle } from 'lucide-react';
import toast from 'react-hot-toast';

const ChecklistIndex = () => {
  const [checklists, setChecklists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchChecklists();
  }, []);

  const fetchChecklists = async () => {
    try {
      const response = await checklistService.getChecklists();
      setChecklists(response.data?.data || []);
    } catch (error) {
      toast.error('Failed to load checklists');
    } finally {
      setLoading(false);
    }
  };

  const filteredChecklists = checklists.filter(c => 
    c.applicantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.passType?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Procedural Checklists</h1>
          <p className="text-sm text-gray-500 mt-1">Track manual operational steps for pass applications</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by applicant name or pass type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow text-sm"
            />
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading checklists...</div>
          ) : filteredChecklists.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <ListChecks className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="font-medium text-gray-900">No checklists found</p>
              <p className="text-sm mt-1">Create a pass application to generate its procedural checklist.</p>
            </div>
          ) : (
            filteredChecklists.map((checklist) => (
              <div key={checklist.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{checklist.applicantName}</h3>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full uppercase tracking-wider">
                      {checklist.passType.replace(/-/g, ' ')}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex-1 max-w-xs h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 transition-all duration-500"
                        style={{ width: `${(checklist.progress / checklist.total) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-medium text-gray-600">
                      {checklist.progress} of {checklist.total} steps completed
                    </span>
                  </div>
                </div>

                <div className="ml-4">
                  <button
                    onClick={() => navigate(`/dashboard/pass-management/${checklist.passId}`)}
                    className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    View Application <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ChecklistIndex;
