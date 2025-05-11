import React, {useEffect, useState} from 'react';
import './App.css';
import countries from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';

countries.registerLocale(enLocale)

function App() {
  const [data, setData] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');

  useEffect(() => {
    fetch('/full_data.json')
    .then(res => res.json())
    .then(json => setData(json))
    .catch(err => console.error('Error fetching:', err))
  },[]);


  const getCountryName = (code) => {
    return countries.getName(code, 'en') || code;
  };

  const uniqueCountries = [...new Set(data.map(entry => entry.countryCode))].sort(
    (a, b) => getCountryName(a).localeCompare(getCountryName(b))
  );

  const filteredData = selectedCountry ? data.filter(
    entry => entry.countryCode === selectedCountry
  ) : data;
  
  return (

    <div className='App'>
      <h1>CTI Threat Dashboard</h1>

      <p style={{ marginLeft: '2rem', marginBottom: '1rem', color:'red' }}>
      All reports have a confidence score of 100.
      </p>

      <div style={{display: 'flex', gap: '2rem', marginBottom: '1rem', marginLeft: '2rem'}}>
        <div>Total Reports: {data.length}</div>
        <div>
          {selectedCountry
          ? `${getCountryName(selectedCountry)} Reports: ${filteredData.length}`
          : 'Showing all countries'
        }
        </div>

      </div>

      
      <div style={{ maxHeight: '410px', overflowY: 'auto' }}>
      <table>
        <thead>
          <tr>
            <th>IP Address </th>
            <th>Country <br/>
            <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            style={{marginTop: '5px'}}            
            >
              <option value="">All</option>
              {uniqueCountries.map((country, idx) => (
                <option key={idx} value={country}>
                  {getCountryName(country)}
                </option>
              ))}              
            </select>
            </th>            
            <th>Last Reported </th>
          </tr>
        </thead>
        <tbody>
          {data
          .filter(entry => {
            const countryMatch = selectedCountry ? entry.countryCode?.toLowerCase().includes(selectedCountry.toLocaleLowerCase()) : true;
            
            return countryMatch;
          })                     
          .map((entry,idx) =>(
            <tr key={idx}>
              <td>{entry.ip}</td>
              <td> {entry.countryCode} </td>
              <td> {new Date(entry.lastReportedAt).toLocaleDateString(
                undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  timeZoneName: 'short'
                }
              )} </td>
            </tr>
          ))}

        </tbody>
      </table>
      </div>
    </div>
  )
}

export default App;
