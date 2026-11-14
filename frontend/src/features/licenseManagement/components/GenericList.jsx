import React, { useEffect, useState, useMemo } from 'react';
import { licenseService } from '../services/license.service';
import { Plus, Edit2, Trash2, Search, X, Check, Building2, MapPin, Compass, Store, Landmark, Layers } from 'lucide-react';
import toast from 'react-hot-toast';

const getIcon = (collection) => {
  switch (collection) {
    case 'companies': return Building2;
    case 'locations': return MapPin;
    case 'zones': return Compass;
    case 'stores': return Store;
    case 'gov-bodies': return Landmark;
    default: return Layers;
  }
};

const getColorTheme = (collection) => {
  switch (collection) {
    case 'companies': return { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' };
    case 'locations': return { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' };
    case 'zones': return { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100' };
    case 'stores': return { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' };
    case 'gov-bodies': return { bg: 'bg-teal-50', text: 'text-teal-600', border: 'border-teal-100' };
    default: return { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-100' };
  }
};

export const GenericList = ({ 
  title, 
  collection, 
  columns, 
  fetchDeps = [], 
  extraFormFields = [], 
  onDataChange, 
  extraActions,
  subtitle
}) => {
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const IconComponent = getIcon(collection);
  const theme = getColorTheme(collection);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const res = await licenseService.getCollection(collection);
      setItems(res.data || []);
    } catch (e) {
      console.error(e);
      toast.error(`Failed to load ${title}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, fetchDeps);

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase().trim();
    return items.filter(item => {
      return Object.values(item).some(val => 
        val && typeof val === 'string' && val.toLowerCase().includes(q)
      );
    });
  }, [items, searchQuery]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (formData.id) {
        await licenseService.updateEntity(collection, formData.id, formData);
        toast.success(`${title} updated successfully`);
      } else {
        await licenseService.createEntity(collection, formData);
        toast.success(`${title} created successfully`);
      }
      setShowModal(false);
      setFormData({});
      fetchItems();
      if (onDataChange) onDataChange();
    } catch (e) {
      toast.error(`Error saving ${title}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    const itemLabel = name ? `"${name}"` : `this ${title.toLowerCase()}`;
    if (window.confirm(`Are you sure you want to delete ${itemLabel}?`)) {
      try {
        await licenseService.deleteEntity(collection, id);
        toast.success(`${title} deleted`);
        fetchItems();
        if (onDataChange) onDataChange();
      } catch (e) {
        toast.error('Failed to delete item');
      }
    }
  };

  const openAddModal = () => {
    setFormData({});
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setFormData(item);
    setShowModal(true);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden mb-6 transition-all">
      {/* Card Header & Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3.5 bg-white">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl ${theme.bg} ${theme.text} flex items-center justify-center shrink-0 border ${theme.border}`}>
            <IconComponent className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-900 text-base">{title}</h3>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${theme.bg} ${theme.text}`}>
                {filteredItems.length} {filteredItems.length === 1 ? 'Record' : 'Records'}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {subtitle || `Manage registered ${title.toLowerCase()} and hierarchy configurations.`}
            </p>
          </div>
        </div>

        {/* Toolbar: Search + Add Button */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${title.toLowerCase()}...`}
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-800 placeholder:text-gray-400"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <button 
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all focus:outline-none shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add {title.replace(/s$/, '')}</span>
          </button>
        </div>
      </div>

      {/* Table Display */}
      <div className="w-full overflow-hidden">
        <table className="w-full text-left text-sm table-fixed">
          <thead className="bg-slate-50/70 border-b border-slate-200/80 text-gray-500 text-[11px] font-semibold uppercase tracking-wider">
            <tr>
              {columns.map((col, i) => (
                <th key={i} className={`py-3 px-4 ${col.className || ''}`}>
                  {col.label}
                </th>
              ))}
              <th className="py-3 px-4 text-right w-24">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-6 py-10 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs text-slate-400 font-medium">Loading {title.toLowerCase()}...</span>
                  </div>
                </td>
              </tr>
            ) : filteredItems.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-6 py-10 text-center text-gray-500">
                  <div className="max-w-xs mx-auto flex flex-col items-center">
                    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <p className="text-sm font-semibold text-gray-800">No {title.toLowerCase()} found</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {searchQuery ? 'Try adjusting your search query.' : `Get started by adding your first ${title.toLowerCase().replace(/s$/, '')}.`}
                    </p>
                    {searchQuery ? (
                      <button 
                        onClick={() => setSearchQuery('')}
                        className="mt-2.5 px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        Clear Search
                      </button>
                    ) : (
                      <button 
                        onClick={openAddModal}
                        className="mt-2.5 px-3 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                      >
                        + Add {title.replace(/s$/, '')}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => {
                const displayName = item.name || item.title || 'Record';
                return (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors group">
                    {columns.map((col, i) => {
                      const rendered = col.render ? col.render(item) : item[col.key];
                      const isFirstCol = i === 0;

                      return (
                        <td key={i} className={`py-3 px-4 text-xs ${col.className || ''}`}>
                          {isFirstCol ? (
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className={`w-7 h-7 rounded-lg ${theme.bg} ${theme.text} flex items-center justify-center font-bold text-xs shrink-0`}>
                                {displayName.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0 flex-1">
                                <span className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate block" title={displayName}>
                                  {displayName}
                                </span>
                              </div>
                            </div>
                          ) : (
                            rendered ? (
                              typeof rendered === 'string' ? (
                                <span className="text-gray-700 truncate block" title={rendered}>
                                  {rendered}
                                </span>
                              ) : (
                                rendered
                              )
                            ) : (
                              <span className="text-gray-400 italic font-mono text-[11px]">—</span>
                            )
                          )}
                        </td>
                      );
                    })}
                    <td className="py-3 px-4 text-right w-24">
                      <div className="flex items-center justify-end gap-1">
                        {extraActions && extraActions(item)}
                        <button 
                          onClick={() => openEditModal(item)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                          aria-label="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id, displayName)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                          aria-label="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Slide-in / Centered Modal for Create / Edit Form */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden transform transition-all">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg ${theme.bg} ${theme.text} flex items-center justify-center`}>
                  <IconComponent className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">
                    {formData.id ? `Edit ${title.replace(/s$/, '')}` : `Add New ${title.replace(/s$/, '')}`}
                  </h3>
                  <p className="text-xs text-gray-500">Provide details for this organization entity.</p>
                </div>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
              <div className="space-y-3.5">
                {extraFormFields.map((field, i) => (
                  <div key={i} className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-700">
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    {field.type === 'select' ? (
                      <select
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-gray-900 transition-all"
                        value={formData[field.name] || ''}
                        onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                        required={field.required}
                      >
                        <option value="">Select option...</option>
                        {field.options.map(o => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.inputType || 'text'}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-gray-900 transition-all placeholder:text-gray-400"
                        value={formData[field.name] || ''}
                        onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                        placeholder={`Enter ${field.label.toLowerCase()}...`}
                        required={field.required}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
                >
                  {isSaving ? 'Saving...' : formData.id ? 'Save Changes' : `Create ${title.replace(/s$/, '')}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default GenericList;
