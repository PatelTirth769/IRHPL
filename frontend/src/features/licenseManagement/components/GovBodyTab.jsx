import React from 'react';
import { GenericList } from './GenericList';

const GovBodyTab = () => {
  return (
    <div className="space-y-6">
      <GenericList 
        title="Government Bodies"
        collection="gov-bodies"
        columns={[
          { key: 'name', label: 'Body Name' },
          { key: 'licenseTypes', label: 'Governed Licenses' },
          { key: 'contactPerson', label: 'Contact Person' },
          { key: 'email', label: 'Email' }
        ]}
        extraFormFields={[
          { name: 'name', label: 'Government Body Name', required: true },
          { name: 'licenseTypes', label: 'Governed Licenses', type: 'select', required: true, options: [
            {value:'airport-entry', label:'Airport Entry'}, 
            {value:'s-and-e', label:'S&E'},
            {value:'contract-labour', label:'Contract Labour'},
            {value:'trade-license', label:'Trade License'}
          ] },
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
