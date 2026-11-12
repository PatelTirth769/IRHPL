import React, { useEffect, useState } from 'react';
import { licenseService } from '../services/license.service';
import { Plus, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const GenericList = ({ title, collection, columns, fetchDeps = [], extraFormFields = [], onDataChange, extraActions }) => {
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  
  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const res = await licenseService.getCollection(collection);
      setItems(res.data || []);
    } catch (e) {
      console.error(e);
      toast.error(`Failed to load ${title}`);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, fetchDeps);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.id) {
        await licenseService.updateEntity(collection, formData.id, formData);
        toast.success(`${title} updated`);
      } else {
        await licenseService.createEntity(collection, formData);
        toast.success(`${title} created`);
      }
      setShowForm(false);
      setFormData({});
      fetchItems();
      if (onDataChange) onDataChange();
    } catch (e) {
      toast.error(`Error saving ${title}`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await licenseService.deleteEntity(collection, id);
        toast.success('Deleted successfully');
        fetchItems();
        if (onDataChange) onDataChange();
      } catch (e) {
        toast.error('Delete failed');
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <button 
          onClick={() => { setFormData({}); setShowForm(!showForm); }}
          className="text-sm px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center shadow-sm"
        >
          <Plus className="w-4 h-4 mr-1" /> Add {title}
        </button>
      </div>
      
      {showForm && (
        <div className="p-4 bg-slate-50 border-b border-slate-100">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {extraFormFields.map((field, i) => (
                <div key={i}>
                  <label className="block text-xs font-medium text-gray-700 mb-1">{field.label}</label>
                  {field.type === 'select' ? (
                    <select
                      className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData[field.name] || ''}
                      onChange={(e) => setFormData({...formData, [field.name]: e.target.value})}
                      required={field.required}
                    >
                      <option value="">Select...</option>
                      {field.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  ) : (
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData[field.name] || ''}
                      onChange={(e) => setFormData({...formData, [field.name]: e.target.value})}
                      required={field.required}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-medium text-gray-600 border border-slate-200 rounded-md hover:bg-slate-100 transition-colors">Cancel</button>
              <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 shadow-sm transition-colors">Save</button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-gray-500 font-medium border-b border-slate-100">
            <tr>
              {columns.map((col, i) => <th key={i} className="px-4 py-3">{col.label}</th>)}
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
               <tr><td colSpan={columns.length + 1} className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={columns.length + 1} className="px-4 py-8 text-center text-gray-500">No data found.</td></tr>
            ) : items.map(item => (
              <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                {columns.map((col, i) => (
                  <td key={i} className="px-4 py-3 text-gray-900">{col.render ? col.render(item) : item[col.key]}</td>
                ))}
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    {extraActions && extraActions(item)}
                    <button onClick={() => { setFormData(item); setShowForm(true); }} className="p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600 rounded transition-colors" title="Edit"><Edit className="w-4 h-4"/></button>
                    <button onClick={() => handleDelete(item.id)} className="p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 rounded transition-colors" title="Delete"><Trash2 className="w-4 h-4"/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
