import React, {useEffect, useState} from 'react';
import './App.css';
import countries from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';

countries.registerLocale(enLocale)

function App() {
  const [data, setData] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [selectedTime, setSelectedTime] = useState('All Time');

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

  const isWithinRange = (dateStr, range) => {
    const now = new Date();
    const entryDate = new Date(dateStr);

    const ranges = {
    'Past Hour': 60 * 60 * 1000,
    'Past 12 Hours': 12 * 60 * 60 * 1000,
    'Past Week': 7 * 24 * 60 * 60 * 1000,
    'Past Month': 30 * 24 * 60 * 60 * 1000,
    'Past Year': 365 * 24 * 60 * 60 * 1000,
    'Past 5 Years': 5 * 365 * 24 * 60 * 60 * 1000
    };

    if (range ==='All Time') return true;
    return now - entryDate <= ranges[range]
  }

  const filteredData = data.filter(entry => {
    const countryMatch = selectedCountry === 'All' || entry.countryCode === selectedCountry;
    const timeMatch = isWithinRange(entry.lastReportedAt, selectedTime);
    return countryMatch && timeMatch;
  });
  
  return (

    <div className='App'>
      <h1>CTI Threat Dashboard</h1>

      <p style={{ marginLeft: '2rem', marginBottom: '1rem', color:'red' }}>
      All reports have a confidence score of 100.
      </p>

      <div style={{display: 'flex', gap: '2rem', marginBottom: '1rem', marginLeft: '2rem'}}>
        <div>Total Reports: {data.length}</div>
        <div> Filtered Entries: {filteredData.length}</div>
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
              <option value="All">All</option>
              {uniqueCountries.map((country, idx) => (
                <option key={idx} value={country}>
                  {getCountryName(country)}
                </option>
              ))}              
            </select>
            </th>            
            <th>Last Reported <br/>
              <select
              value={selectedTime}
              onChange={e => setSelectedTime(e.target.value)}
              style={{marginTop: '5px'}}            
              >
              {['All Time', 'Past Hour', 'Past 12 Hours', 'Past Week', 'Past Month', 'Past Year', 'Past 5 Years'].map(
                option => (
                  <option key={option} value={option }>{option} </option>
                ))}
              </select>
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((entry,idx) =>(
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
