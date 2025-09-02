import React, { useState } from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';

const fetchCompanies = async () => {
   const { data } = await axios.get('/api/companies');
   return data;
};

const fetchLocations = async (companyId) => {
   const { data } = await axios.get(`/api/companies/${companyId}/locations`);
   return data;
};

const fetchAddress = async (locationId) => {
   const { data } = await axios.get(`/api/locations/${locationId}/address`);
   return data;
};

const DynamicForm = () => {
   const [selectedCompany, setSelectedCompany] = useState(null);
   const [selectedLocation, setSelectedLocation] = useState(null);

   const { data: companies } = useQuery('companies', fetchCompanies);
   const { data: locations } = useQuery(['locations', selectedCompany], () => fetchLocations(selectedCompany), { enabled: !!selectedCompany });
   const { data: address } = useQuery(['address', selectedLocation], () => fetchAddress(selectedLocation), { enabled: !!selectedLocation });

   return (
       <div>
           <select onChange={(e) => setSelectedCompany(e.target.value)}>
               <option>Select Company</option>
               {companies && companies.map(company => (
                   <option key={company.id} value={company.id}>{company.name}</option>
               ))}
           </select>

           <select onChange={(e) => setSelectedLocation(e.target.value)} disabled={!selectedCompany}>
               <option>Select Location</option>
               {locations && locations.map(location => (
                   <option key={location.id} value={location.id}>{location.name}</option>
               ))}
           </select>

           <div>
               <label>Address:</label>
               <input type="text" value={address || ''} readOnly />
           </div>
       </div>
   );
};

export default DynamicForm;
