import React, {use, useEffect, useState} from 'react';
import './App.css';

function App() {
  const [data, setData] = useState([]);
  useEffect(() => {
    fetch('/sample_data.json')
    .then(res => res.json())
    .then(json => setData(json))
    .catch(err => console.error('Error fetching:', err))
  },[]);
  
  return (
    <div className='App'>
      <h1>CTI Threat Dashboard</h1>
      <table>
        <thead>
          <tr>
            <th>IP Address </th>
            <th>Country</th>
            <th>Confidence Score </th>
            <th>Last Reported </th>
          </tr>
        </thead>
        <tbody>
          {data.map((entry,idx) =>(
            <tr key={idx}>
              <td>{entry.ip}</td>
              <td> {entry.countryCode} </td>
              <td> {entry.abuseConfidenceScore} </td>
              <td> {entry.lastReportedAt} </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

}

export default App;
