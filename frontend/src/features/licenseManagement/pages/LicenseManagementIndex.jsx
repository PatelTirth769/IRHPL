import React, { useState } from 'react';
import HierarchyTab from '../components/HierarchyTab';
import GovBodyTab from '../components/GovBodyTab';
import LicenseListTab from '../components/LicenseListTab';
import { Building2, FileBadge, Landmark } from 'lucide-react';

const LicenseManagementIndex = () => {
  const [activeTab, setActiveTab] = useState('licenses');

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">License Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage organizational hierarchy, government bodies, and commercial licenses.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
        <div className="border-b border-slate-200 flex overflow-x-auto">
          <button
            onClick={() => setActiveTab('licenses')}
            className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'licenses' 
                ? 'border-blue-600 text-blue-600 bg-blue-50/50' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-slate-50'
            }`}
          >
            <FileBadge className="w-4 h-4 mr-2" />
            Active Licenses
          </button>
          <button
            onClick={() => setActiveTab('hierarchy')}
            className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'hierarchy' 
                ? 'border-blue-600 text-blue-600 bg-blue-50/50' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-slate-50'
            }`}
          >
            <Building2 className="w-4 h-4 mr-2" />
            Org Hierarchy
          </button>
          <button
            onClick={() => setActiveTab('gov')}
            className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'gov' 
                ? 'border-blue-600 text-blue-600 bg-blue-50/50' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-slate-50'
            }`}
          >
            <Landmark className="w-4 h-4 mr-2" />
            Government Bodies
          </button>
        </div>
      </div>

      <div className="mt-6">
        {activeTab === 'licenses' && <LicenseListTab />}
        {activeTab === 'hierarchy' && <HierarchyTab />}
        {activeTab === 'gov' && <GovBodyTab />}
      </div>
    </div>
  );
};

export default LicenseManagementIndex;
