import React from 'react';
import { GenericList } from './GenericList';

const GovBodyTab = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <GenericList 
        title="Government Bodies"
        collection="gov-bodies"
        subtitle="Regulatory statutory authorities overseeing airport, labor, security, and municipal trade operations."
        columns={[
          { key: 'name', label: 'Body Name', className: 'w-[30%]' },
          { 
            key: 'licenseTypes', 
            label: 'Governed Licenses', 
            className: 'w-[25%]',
            render: item => (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-teal-50 text-teal-700 border border-teal-200/60 truncate max-w-full">
                {item.licenseTypes || 'All Categories'}
              </span>
            )
          },
          { 
            key: 'contactPerson', 
            label: 'Contact Person', 
            className: 'w-[20%]',
            render: item => <span className="font-medium text-xs text-gray-800">{item.contactPerson || '—'}</span>
          },
          { 
            key: 'email', 
            label: 'Contact Email', 
            className: 'w-[25%]',
            render: item => item.email ? (
              <a href={`mailto:${item.email}`} className="text-blue-600 hover:underline text-xs truncate block" title={item.email}>
                {item.email}
              </a>
            ) : (
              <span className="text-gray-400 italic text-xs">—</span>
            )
          }
        ]}
        extraFormFields={[
          { name: 'name', label: 'Government Body Name', required: true },
          { 
            name: 'licenseTypes', 
            label: 'Governed Licenses', 
            type: 'select', 
            required: true, 
            options: [
              { value: 'airport-entry', label: 'Airport Entry' }, 
              { value: 's-and-e', label: 'S&E' },
              { value: 'contract-labour', label: 'Contract Labour' },
              { value: 'trade-license', label: 'Trade License' }
            ] 
          },
          { name: 'contactPerson', label: 'Contact Person' },
          { name: 'phone', label: 'Phone Number' },
          { name: 'email', label: 'Email Address' },
          { name: 'address', label: 'Office Address / Location' }
        ]}
      />
    </div>
  );
};

export default GovBodyTab;
