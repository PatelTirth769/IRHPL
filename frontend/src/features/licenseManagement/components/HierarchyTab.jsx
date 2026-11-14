import React, { useEffect, useState, useMemo } from 'react';
import { licenseService } from '../services/license.service';
import { GenericList } from './GenericList';
import { Building2, MapPin, Compass, Store, Eye, X, ChevronRight, Layers } from 'lucide-react';

const HierarchyTab = () => {
  const [companies, setCompanies] = useState([]);
  const [locations, setLocations] = useState([]);
  const [zones, setZones] = useState([]);
  const [stores, setStores] = useState([]);
  const [activeLevel, setActiveLevel] = useState('all'); // 'all', 'companies', 'locations', 'zones', 'stores'
  const [selectedStore, setSelectedStore] = useState(null);

  const fetchRefs = () => {
    licenseService.getCollection('companies').then(res => setCompanies(res.data || []));
    licenseService.getCollection('locations').then(res => setLocations(res.data || []));
    licenseService.getCollection('zones').then(res => setZones(res.data || []));
    licenseService.getCollection('stores').then(res => setStores(res.data || []));
  };

  useEffect(() => {
    fetchRefs();
  }, []);

  const getCompany = id => companies.find(c => c.id === id);
  const getLocation = id => locations.find(l => l.id === id);
  const getZone = id => zones.find(z => z.id === id);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hierarchy Level Switcher Pills */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveLevel('all')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap focus:outline-none ${
            activeLevel === 'all' 
              ? 'bg-slate-900 text-white shadow-sm' 
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>All Levels</span>
        </button>

        <button
          onClick={() => setActiveLevel('companies')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap focus:outline-none ${
            activeLevel === 'companies' 
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20' 
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
          }`}
        >
          <Building2 className="w-3.5 h-3.5 text-blue-400" />
          <span>Companies</span>
          {companies.length > 0 && (
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeLevel === 'companies' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
            }`}>
              {companies.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveLevel('locations')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap focus:outline-none ${
            activeLevel === 'locations' 
              ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20' 
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
          }`}
        >
          <MapPin className="w-3.5 h-3.5 text-emerald-400" />
          <span>Locations</span>
          {locations.length > 0 && (
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeLevel === 'locations' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
            }`}>
              {locations.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveLevel('zones')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap focus:outline-none ${
            activeLevel === 'zones' 
              ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/20' 
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
          }`}
        >
          <Compass className="w-3.5 h-3.5 text-purple-400" />
          <span>Airport Zones</span>
          {zones.length > 0 && (
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeLevel === 'zones' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
            }`}>
              {zones.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveLevel('stores')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap focus:outline-none ${
            activeLevel === 'stores' 
              ? 'bg-amber-600 text-white shadow-sm shadow-amber-600/20' 
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
          }`}
        >
          <Store className="w-3.5 h-3.5 text-amber-400" />
          <span>Stores</span>
          {stores.length > 0 && (
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeLevel === 'stores' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
            }`}>
              {stores.length}
            </span>
          )}
        </button>
      </div>

      {/* 1. Companies */}
      {(activeLevel === 'all' || activeLevel === 'companies') && (
        <GenericList 
          title="Companies"
          collection="companies"
          subtitle="Top-level organizational business entities and registrations."
          onDataChange={fetchRefs}
          columns={[
            { key: 'name', label: 'Company Name', className: 'w-[55%]' },
            { 
              key: 'registrationNumber', 
              label: 'Registration No',
              className: 'w-[35%]',
              render: item => item.registrationNumber ? (
                <span className="font-mono text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200/80">
                  {item.registrationNumber}
                </span>
              ) : (
                <span className="text-slate-400 text-xs italic">Unregistered</span>
              )
            }
          ]}
          extraFormFields={[
            { name: 'name', label: 'Company Name', required: true },
            { name: 'registrationNumber', label: 'Registration Number / Tax ID' }
          ]}
        />
      )}

      {/* 2. Locations */}
      {(activeLevel === 'all' || activeLevel === 'locations') && (
        <GenericList 
          title="Locations"
          collection="locations"
          subtitle="Physical sites, airports, metro transit stations, and retail facilities."
          onDataChange={fetchRefs}
          columns={[
            { key: 'name', label: 'Location Name', className: 'w-[35%]' },
            { 
              key: 'companyId', 
              label: 'Company', 
              className: 'w-[35%]',
              render: item => {
                const comp = getCompany(item.companyId);
                return (
                  <span className="font-medium text-xs text-gray-800">
                    {comp?.name || 'Unassigned'}
                  </span>
                );
              }
            },
            { 
              key: 'type', 
              label: 'Location Type',
              className: 'w-[20%]',
              render: item => (
                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${
                  item.type === 'Airport' 
                    ? 'bg-blue-50 text-blue-700 border-blue-200/60' 
                    : item.type === 'Metro'
                    ? 'bg-purple-50 text-purple-700 border-purple-200/60'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}>
                  {item.type || 'Standard'}
                </span>
              )
            }
          ]}
          extraFormFields={[
            { name: 'name', label: 'Location Name', required: true },
            { 
              name: 'companyId', 
              label: 'Parent Company', 
              type: 'select', 
              required: true, 
              options: companies.map(c => ({ value: c.id, label: c.name })) 
            },
            { 
              name: 'type', 
              label: 'Location Type', 
              type: 'select', 
              required: true, 
              options: [
                { value: 'Airport', label: 'Airport' }, 
                { value: 'Metro', label: 'Metro' }, 
                { value: 'Other', label: 'Other' }
              ] 
            }
          ]}
        />
      )}

      {/* 3. Airport Zones */}
      {(activeLevel === 'all' || activeLevel === 'zones') && (
        <GenericList 
          title="Airport Zones"
          collection="zones"
          subtitle="Specific security tiers, pre-security landside, and post-security airside zones."
          onDataChange={fetchRefs}
          columns={[
            { key: 'name', label: 'Zone Name', className: 'w-[35%]' },
            { 
              key: 'locationId', 
              label: 'Airport Location', 
              className: 'w-[35%]',
              render: item => {
                const loc = getLocation(item.locationId);
                return (
                  <span className="font-medium text-xs text-gray-800">
                    {loc?.name || 'Unassigned'}
                  </span>
                );
              }
            },
            { 
              key: 'type', 
              label: 'Zone Security Classification',
              className: 'w-[20%]',
              render: item => (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-200/60 truncate max-w-full" title={item.type}>
                  {item.type || 'Standard Zone'}
                </span>
              )
            }
          ]}
          extraFormFields={[
            { name: 'name', label: 'Zone Name', required: true },
            { 
              name: 'locationId', 
              label: 'Airport Location', 
              type: 'select', 
              required: true, 
              options: locations.filter(l => l.type === 'Airport').map(l => ({ value: l.id, label: l.name })) 
            },
            { 
              name: 'type', 
              label: 'Zone Type', 
              type: 'select', 
              required: true, 
              options: [
                { value: 'Landside (Pre-Security)', label: 'Landside (Pre-Security)' }, 
                { value: 'Airside Domestic (Post-Security)', label: 'Airside Domestic (Post-Security)' },
                { value: 'Airside International (Duty-Free/Transit)', label: 'Airside International (Duty-Free/Transit)' }
              ] 
            }
          ]}
        />
      )}

      {/* 4. Stores */}
      {(activeLevel === 'all' || activeLevel === 'stores') && (
        <GenericList 
          title="Stores"
          collection="stores"
          subtitle="Retail outlets, confectioneries, duty-free shops, and commercial establishments."
          onDataChange={fetchRefs}
          columns={[
            { key: 'name', label: 'Store Name', className: 'w-[35%]' },
            { 
              key: 'zoneId', 
              label: 'Zone / Location', 
              className: 'w-[35%]',
              render: item => {
                const zone = getZone(item.zoneId);
                const loc = zone ? getLocation(zone.locationId) : getLocation(item.zoneId);
                return (
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-xs text-gray-900">{zone?.name || loc?.name || 'Unassigned'}</span>
                    {loc && zone && <span className="text-[11px] text-gray-400">({loc.name})</span>}
                  </div>
                );
              }
            },
            { 
              key: 'storeType', 
              label: 'Store Category',
              className: 'w-[20%]',
              render: item => (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200/60">
                  {item.storeType || 'Retail'}
                </span>
              )
            }
          ]}
          extraActions={(item) => (
            <button 
              onClick={() => setSelectedStore(item)} 
              className="p-1.5 text-gray-400 hover:bg-amber-50 hover:text-amber-600 rounded-lg transition-colors" 
              title="View Store Hierarchy Details"
              aria-label="View Store Details"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          )}
          extraFormFields={[
            { name: 'name', label: 'Store Name', required: true },
            { 
              name: 'zoneId', 
              label: 'Airport Zone Name', 
              type: 'select', 
              required: true, 
              options: zones.map(z => ({ value: z.id, label: z.name })) 
            },
            { 
              name: 'storeType', 
              label: 'Store Type', 
              type: 'select', 
              required: true, 
              options: [
                { value: 'Confectionery', label: 'Confectionery' }, 
                { value: 'Food café', label: 'Food café' },
                { value: 'Liquors', label: 'Liquors' },
                { value: 'Fashion', label: 'Fashion' },
                { value: 'Sport', label: 'Sport' },
                { value: 'Accessories', label: 'Accessories' }
              ] 
            }
          ]}
        />
      )}

      {/* Store Hierarchy Details Modal */}
      {selectedStore && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                  <Store className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">Store Hierarchy Details</h3>
                  <p className="text-xs text-gray-500">Full organizational pathway for this outlet.</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedStore(null)} 
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-4 text-xs">
              {(() => {
                const zone = getZone(selectedStore.zoneId);
                const loc = zone ? getLocation(zone.locationId) : getLocation(selectedStore.zoneId);
                const comp = loc ? getCompany(loc.companyId) : null;

                return (
                  <div className="space-y-3.5">
                    {/* Visual Hierarchy Pathway Breadcrumb */}
                    <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Hierarchy Breadcrumb</span>
                      <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-slate-700">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md border border-blue-100">
                          {comp?.name || 'Company'}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-100">
                          {loc?.name || 'Location'}
                        </span>
                        {zone && (
                          <>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                            <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded-md border border-purple-100">
                              {zone.name}
                            </span>
                          </>
                        )}
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-md border border-amber-100">
                          {selectedStore.name}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3.5 pt-1">
                      <div className="p-3 bg-white border border-slate-200 rounded-xl">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-1">Store Name</span>
                        <span className="text-slate-900 font-bold text-sm">{selectedStore.name}</span>
                      </div>
                      <div className="p-3 bg-white border border-slate-200 rounded-xl">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-1">Store Type</span>
                        <span className="text-slate-900 font-semibold">{selectedStore.storeType || 'Standard'}</span>
                      </div>
                      <div className="p-3 bg-white border border-slate-200 rounded-xl">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-1">Location</span>
                        <span className="text-slate-900 font-semibold">{loc?.name || '—'} {loc?.type ? `(${loc.type})` : ''}</span>
                      </div>
                      <div className="p-3 bg-white border border-slate-200 rounded-xl">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-1">Parent Company</span>
                        <span className="text-slate-900 font-semibold">{comp?.name || '—'}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="pt-2 flex justify-end">
                <button 
                  onClick={() => setSelectedStore(null)} 
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HierarchyTab;
