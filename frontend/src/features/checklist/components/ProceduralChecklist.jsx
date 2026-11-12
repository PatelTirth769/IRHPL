import { useState, useEffect } from 'react';
import { checklistService } from '../services/checklist.service';
import { CheckCircle2, Circle } from 'lucide-react';
import toast from 'react-hot-toast';

const ProceduralChecklist = ({ passId }) => {
  const [checklist, setChecklist] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (passId) {
      loadChecklist();
    }
  }, [passId]);

  const loadChecklist = async () => {
    try {
      setLoading(true);
      const res = await checklistService.getChecklistByPassId(passId);
      setChecklist(res.data?.data);
    } catch (error) {
      // If 404, it means it doesn't exist yet, which is fine for older passes
      if (error?.response?.status !== 404) {
        console.error('Failed to load checklist', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = async (itemId, currentChecked) => {
    try {
      const newChecked = !currentChecked;
      
      // Optimistic update
      setChecklist(prev => {
        const newItems = prev.items.map(item => 
          item.id === itemId ? { ...item, checked: newChecked } : item
        );
        return {
          ...prev,
          items: newItems,
          progress: newItems.filter(i => i.checked).length
        };
      });

      await checklistService.updateChecklistItem(checklist.id, itemId, newChecked);
    } catch (error) {
      toast.error('Failed to update checklist item');
      loadChecklist(); // Revert on failure
    }
  };

  if (loading) return <div className="text-sm text-gray-500 py-2">Loading procedural checklist...</div>;
  
  if (!checklist) return null; // Only show if checklist exists

  const { items, progress, total } = checklist;
  const isComplete = progress === total;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm mt-6">
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">Procedural Checklist</h3>
          <p className="text-xs text-gray-500 mt-0.5">Mandatory operational checks for this pass type</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${isComplete ? 'bg-green-500' : 'bg-blue-600'}`}
              style={{ width: `${(progress / total) * 100}%` }}
            ></div>
          </div>
          <span className="text-xs font-medium text-gray-600 w-8 text-right">{progress}/{total}</span>
        </div>
      </div>
      <div className="divide-y divide-gray-100">
        {items.map(item => (
          <div 
            key={item.id}
            onClick={() => toggleItem(item.id, item.checked)}
            className="flex items-start gap-3 p-4 hover:bg-gray-50 cursor-pointer transition-colors group"
          >
            <button className="mt-0.5 shrink-0 focus:outline-none">
              {item.checked ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : (
                <Circle className="w-5 h-5 text-gray-300 group-hover:text-blue-400" />
              )}
            </button>
            <div className="flex-1">
              <p className={`text-sm ${item.checked ? 'text-gray-500 line-through' : 'text-gray-700 font-medium'}`}>
                {item.label}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProceduralChecklist;
