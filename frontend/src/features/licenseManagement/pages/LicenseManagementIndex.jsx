import React, { useState, useEffect } from 'react';
import HierarchyTab from '../components/HierarchyTab';
import GovBodyTab from '../components/GovBodyTab';
import LicenseListTab from '../components/LicenseListTab';
import { Building2, FileBadge, Landmark, ShieldCheck, Plus, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { licenseService } from '../services/license.service';

const LicenseManagementIndex = () => {
  const [activeTab, setActiveTab] = useState('licenses');
  const [counts, setCounts] = useState({ licenses: 0, stores: 0, govBodies: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    // Lightweight counts for tab badges
    Promise.all([
      licenseService.getCollection('licenses').catch(() => ({ data: [] })),
      licenseService.getCollection('stores').catch(() => ({ data: [] })),
      licenseService.getCollection('gov-bodies').catch(() => ({ data: [] }))
    ]).then(([licRes, storeRes, govRes]) => {
      setCounts({
        licenses: licRes?.data?.length || 0,
        stores: storeRes?.data?.length || 0,
        govBodies: govRes?.data?.length || 0
      });
    });
  }, [activeTab]);

  return (
    <div className="max-w-7xl mx-auto pb-10 space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-gray-900">License Management</h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
              <ShieldCheck className="w-3.5 h-3.5" /> Compliance Active
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Track commercial permits, airport access permissions, and government regulatory oversight.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button 
            onClick={() => navigate('/dashboard/org-management')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all focus:outline-none"
          >
            <span>Org Hierarchies</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
          </button>
          <button 
            onClick={() => navigate('/dashboard/org-management/new')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-blue-600/20 transition-all focus:outline-none"
          >
            <Plus className="w-4 h-4" />
            <span>Add Store & License</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-2">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {/* Active Licenses Tab */}
          <button
            onClick={() => setActiveTab('licenses')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap focus:outline-none ${
              activeTab === 'licenses' 
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <FileBadge className="w-4 h-4" />
            <span>Active Licenses</span>
            {counts.licenses > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'licenses' ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-700'
              }`}>
                {counts.licenses}
              </span>
            )}
          </button>

          {/* Org Hierarchy Tab */}
          <button
            onClick={() => setActiveTab('hierarchy')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap focus:outline-none ${
              activeTab === 'hierarchy' 
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Org Hierarchy</span>
            {counts.stores > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'hierarchy' ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-700'
              }`}>
                {counts.stores} Stores
              </span>
            )}
          </button>

          {/* Government Bodies Tab */}
          <button
            onClick={() => setActiveTab('gov')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap focus:outline-none ${
              activeTab === 'gov' 
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <Landmark className="w-4 h-4" />
            <span>Government Bodies</span>
            {counts.govBodies > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === 'gov' ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-700'
              }`}>
                {counts.govBodies}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'licenses' && <LicenseListTab />}
        {activeTab === 'hierarchy' && <HierarchyTab />}
        {activeTab === 'gov' && <GovBodyTab />}
      </div>
    </div>
  );
};

export default LicenseManagementIndex;
