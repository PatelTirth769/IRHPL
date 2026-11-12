import { useState } from 'react';
import { Clock, Info, Shield, Filter, MapPin } from 'lucide-react';

const WorkingHours = () => {
  const [selectedState, setSelectedState] = useState('Delhi');

  const states = ['Delhi', 'Haryana', 'Uttar Pradesh', 'Maharashtra', 'Karnataka'];

  // Static content based on S&E Act rules typical for retail/airport environments
  const rules = {
    standardLimits: {
      daily: '9 Hours',
      weekly: '48 Hours',
      spreadOver: '10.5 to 12 Hours (varies by state)',
      details: 'As per the Shops & Establishment Act, adult employees cannot be required or allowed to work for more than 9 hours in any day and 48 hours in any week.'
    },
    restAndOvertime: {
      restInterval: '1 Hour after 5 hours of continuous work',
      weeklyOff: '1 Mandatory fully paid rest day per week (typically a fixed day)',
      overtimeRate: 'Twice the ordinary rate of wages (2x)',
      overtimeLimit: 'Total hours including overtime must not exceed 10 hours a day and 54 hours a week.',
      details: 'Overtime wages are strictly calculated at double the basic wage rate.'
    },
    specialCases: {
      womenNightShift: 'Requires special permission, transport facilities, and strict security protocols from 8:00 PM to 6:00 AM.',
      continuousOperations: 'Airport retail outlets may apply for 24x7 operation exemptions, but individual employee limits still strictly apply.',
      youngPersons: 'Prohibited from working between 8:00 PM and 8:00 AM. Maximum 6 hours per day.'
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto pb-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Working Hours Compliance</h1>
        <p className="text-sm text-slate-500 mt-1">Statutory reference guide for maximum working hours and overtime rules.</p>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <MapPin className="w-5 h-5 text-slate-400" />
        <span className="text-sm font-medium text-slate-700">Select Jurisdiction:</span>
        <select 
          className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50"
          value={selectedState}
          onChange={(e) => setSelectedState(e.target.value)}
        >
          {states.map(state => (
            <option key={state} value={state}>{state}</option>
          ))}
        </select>
        <span className="text-xs text-slate-500 italic ml-2">Note: Displaying general guidelines. Specific rules for {selectedState} may have minor variations.</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 1: Standard Limits */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-blue-50 flex items-center gap-3">
            <Clock className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-blue-900">Standard Hour Limits</h3>
          </div>
          <div className="p-5 flex-1 space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-sm font-medium text-slate-600">Max Daily Hours</span>
              <span className="text-sm font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-full">{rules.standardLimits.daily}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-sm font-medium text-slate-600">Max Weekly Hours</span>
              <span className="text-sm font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-full">{rules.standardLimits.weekly}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-sm font-medium text-slate-600">Spread Over (incl. rest)</span>
              <span className="text-sm font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-full">{rules.standardLimits.spreadOver}</span>
            </div>
            <p className="text-xs text-slate-500 mt-4 leading-relaxed flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
              {rules.standardLimits.details}
            </p>
          </div>
        </div>

        {/* Section 2: Rest & Overtime */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-emerald-50 flex items-center gap-3">
            <Filter className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-emerald-900">Rest & Overtime (OT)</h3>
          </div>
          <div className="p-5 flex-1 space-y-4">
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Rest Interval</div>
              <div className="text-sm text-slate-800 font-medium">{rules.restAndOvertime.restInterval}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Weekly Off</div>
              <div className="text-sm text-slate-800 font-medium">{rules.restAndOvertime.weeklyOff}</div>
            </div>
            <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
              <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">Overtime Wage Rate</div>
              <div className="text-sm text-emerald-900 font-bold">{rules.restAndOvertime.overtimeRate}</div>
              <div className="text-xs text-emerald-600 mt-1">{rules.restAndOvertime.overtimeLimit}</div>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed flex items-start gap-2">
              <Info className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              {rules.restAndOvertime.details}
            </p>
          </div>
        </div>
      </div>

      {/* Section 3: Special Cases */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-amber-50 flex items-center gap-3">
          <Shield className="w-5 h-5 text-amber-600" />
          <h3 className="font-bold text-amber-900">Special Cases & Exemptions</h3>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <h4 className="font-bold text-slate-800 mb-2 text-sm">Women working Night Shifts</h4>
            <p className="text-sm text-slate-600 leading-relaxed">{rules.specialCases.womenNightShift}</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <h4 className="font-bold text-slate-800 mb-2 text-sm">Continuous Operations (24x7)</h4>
            <p className="text-sm text-slate-600 leading-relaxed">{rules.specialCases.continuousOperations}</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <h4 className="font-bold text-slate-800 mb-2 text-sm">Young Persons</h4>
            <p className="text-sm text-slate-600 leading-relaxed">{rules.specialCases.youngPersons}</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default WorkingHours;
