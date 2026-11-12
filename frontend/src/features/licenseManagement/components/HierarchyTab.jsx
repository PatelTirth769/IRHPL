import React, { useEffect, useState } from 'react';
import { licenseService } from '../services/license.service';
import { GenericList } from './GenericList';
import { Eye, X } from 'lucide-react';

const HierarchyTab = () => {
  const [companies, setCompanies] = useState([]);
  const [locations, setLocations] = useState([]);
  const [zones, setZones] = useState([]);
  
  const [selectedStore, setSelectedStore] = useState(null);
  
  const fetchRefs = () => {
    licenseService.getCollection('companies').then(res => setCompanies(res.data || []));
    licenseService.getCollection('locations').then(res => setLocations(res.data || []));
    licenseService.getCollection('zones').then(res => setZones(res.data || []));
  };

  useEffect(() => {
    fetchRefs();
  }, []);

  const getCompany = id => companies.find(c => c.id === id);
  const getLocation = id => locations.find(l => l.id === id);
  const getZone = id => zones.find(z => z.id === id);

  return (
    <div className="space-y-6">
      <GenericList 
        title="Companies"
        collection="companies"
        onDataChange={fetchRefs}
        columns={[{ key: 'name', label: 'Company Name' }, { key: 'registrationNumber', label: 'Registration No' }]}
        extraFormFields={[
          { name: 'name', label: 'Company Name', required: true },
          { name: 'registrationNumber', label: 'Registration No' }
        ]}
      />

      <GenericList 
        title="Locations"
        collection="locations"
        onDataChange={fetchRefs}
        columns={[
          { key: 'name', label: 'Location Name' },
          { key: 'companyId', label: 'Company', render: item => getCompany(item.companyId)?.name || 'Unknown' },
          { key: 'type', label: 'Type' }
        ]}
        extraFormFields={[
          { name: 'name', label: 'Location Name', required: true },
          { name: 'companyId', label: 'Company Name', type: 'select', required: true, options: companies.map(c => ({ value: c.id, label: c.name })) },
          { name: 'type', label: 'Type', type: 'select', required: true, options: [{value:'Airport', label:'Airport'}, {value:'Metro', label:'Metro'}, {value:'Other', label:'Other'}] }
        ]}
      />

      <GenericList 
        title="Airport Zones"
        collection="zones"
        onDataChange={fetchRefs}
        columns={[
          { key: 'name', label: 'Zone Name' },
          { key: 'locationId', label: 'Location', render: item => getLocation(item.locationId)?.name || 'Unknown' },
          { key: 'type', label: 'Zone Type' }
        ]}
        extraFormFields={[
          { name: 'name', label: 'Zone Name', required: true },
          { name: 'locationId', label: 'Location Name', type: 'select', required: true, options: locations.filter(l => l.type === 'Airport').map(l => ({ value: l.id, label: l.name })) },
          { name: 'type', label: 'Zone Type', type: 'select', required: true, options: [
            {value:'Landside (Pre-Security)', label:'Landside (Pre-Security)'}, 
            {value:'Airside Domestic (Post-Security)', label:'Airside Domestic (Post-Security)'},
            {value:'Airside International (Duty-Free/Transit)', label:'Airside International (Duty-Free/Transit)'}
          ] }
        ]}
      />

      <GenericList 
        title="Stores"
        collection="stores"
        onDataChange={fetchRefs}
        columns={[
          { key: 'name', label: 'Store Name' },
          { key: 'zoneId', label: 'Airport Zone', render: item => getZone(item.zoneId)?.name || 'Unknown' },
          { key: 'storeType', label: 'Store Type' }
        ]}
        extraActions={(item) => (
          <button onClick={() => setSelectedStore(item)} className="p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 rounded transition-colors" title="View Details">
            <Eye className="w-4 h-4" />
          </button>
        )}
        extraFormFields={[
          { name: 'name', label: 'Store Name', required: true },
          { name: 'zoneId', label: 'Airport Zone Name', type: 'select', required: true, options: zones.map(z => ({ value: z.id, label: z.name })) },
          { name: 'storeType', label: 'Store Type', type: 'select', required: true, options: [
            {value:'Confectionery', label:'Confectionery'}, 
            {value:'Food café', label:'Food café'},
            {value:'Liquors', label:'Liquors'},
            {value:'Fashion', label:'Fashion'},
            {value:'Sport', label:'Sport'},
            {value:'Accessories', label:'Accessories'}
          ] }
        ]}
      />

      {selectedStore && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-semibold text-gray-900">Store Details</h3>
              <button onClick={() => setSelectedStore(null)} className="text-gray-400 hover:text-gray-600 p-1"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4 text-sm">
              <div><span className="text-gray-500 block text-xs uppercase tracking-wider mb-1">Store Name</span><span className="text-gray-900 font-medium">{selectedStore.name}</span></div>
              <div><span className="text-gray-500 block text-xs uppercase tracking-wider mb-1">Store Type</span><span className="text-gray-900 font-medium">{selectedStore.storeType}</span></div>
              
              {(() => {
                const zone = getZone(selectedStore.zoneId);
                const loc = zone ? getLocation(zone.locationId) : null;
                const comp = loc ? getCompany(loc.companyId) : null;
                return (
                  <>
                    <div><span className="text-gray-500 block text-xs uppercase tracking-wider mb-1">Airport Zone</span><span className="text-gray-900 font-medium">{zone?.name || '-'} ({zone?.type || '-'})</span></div>
                    <div><span className="text-gray-500 block text-xs uppercase tracking-wider mb-1">Location</span><span className="text-gray-900 font-medium">{loc?.name || '-'}</span></div>
                    <div><span className="text-gray-500 block text-xs uppercase tracking-wider mb-1">Company</span><span className="text-gray-900 font-medium">{comp?.name || '-'}</span></div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HierarchyTab;
