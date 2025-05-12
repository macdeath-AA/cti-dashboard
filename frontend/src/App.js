import React, {useEffect, useState} from 'react';
import './App.css';
import countries from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';
import {BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, LineChart, Legend, PieChart, Pie, Cell} from 'recharts';
countries.registerLocale(enLocale)

function App() {
  const [data, setData] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [selectedTime, setSelectedTime] = useState('All Time');
  const [latestTimestamp, setLatestTimestamp] = useState(null);

  useEffect(() => {
    fetch('/full_data.json')
    .then(res => res.json())
    .then(json => {
      setData(json);
      const maxTimestamp = new Date(Math.max(...json.map(e => new Date(e.lastReportedAt))));
      setLatestTimestamp(maxTimestamp)
    })
    .catch(err => console.error('Error fetching:', err))
  },[]);

  const getCountryName = (code) => {
    return countries.getName(code, 'en') || code;
  };

  const uniqueCountries = [...new Set(data.map(entry => entry.countryCode))].sort(
    (a, b) => getCountryName(a).localeCompare(getCountryName(b))
  );

  const isWithinRange = (dateStr, range) => {
    if (!latestTimestamp) return false;
    const entryDate = new Date(dateStr);
    

    const ranges = {
    'Past 5 Minutes': 5 * 60 * 1000,
    'Past 15 Minutes': 15 * 60 * 1000,
    'Past 30 Minutes': 30 * 60 * 1000,
    'Past Hour': 60 * 60 * 1000,
    'Past 2 Hours': 2 * 60 * 60 * 1000
    };

    if (range ==='All Time') return true;

    return latestTimestamp - entryDate <= ranges[range]
  }

  const filteredData = data.filter(entry => {
    const countryMatch = selectedCountry === 'All' || entry.countryCode === selectedCountry;
    const timeMatch = isWithinRange(entry.lastReportedAt, selectedTime);
    return countryMatch && timeMatch;
  });

  const countryCountMap = {};
  data.forEach(entry => {
    const countryName = getCountryName(entry.countryCode);
    countryCountMap[countryName] = (countryCountMap[countryName] || 0 ) +1;
  });

  const chartData = Object.entries(countryCountMap)
  .map(([name, count]) => ({name, count}))
  .sort((a,b) => b.count - a.count)
  .slice(0,10)

  const binSizeMs = 30*60*1000;
  const bins = {};

  filteredData.forEach(entry => {
    const date = new Date(entry.lastReportedAt);
    const rounded = new Date(Math.floor(date.getTime()/binSizeMs ) * binSizeMs);
    const label = rounded.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
    bins[label] = (bins[label] || 0) + 1;
  });

  const timeSeriesData = Object.entries(bins)
  .map(([time, count]) => ({time, count}))
  .sort((a,b) => new Date(`1970-01-01T${a.time}`) - new Date(`1970-01-01T${b.time}`))

  const selectedCountryCount = filteredData.length;
  const otherCount = data.length - selectedCountryCount;
  const totalCount = data.length;


  const donutData = selectedCountry && selectedCountry !== 'All'
  ? [
      { name: selectedCountry, value: selectedCountryCount },
      { name: 'Others', value: otherCount }
    ] 
  : [
      { name: 'Others', value: totalCount }
    ];


  const countryPercent = selectedCountryCount > 0
  ? ((selectedCountryCount / data.length) * 100).toFixed(1)
  : 0 ;


  return (

    <div className='App'>
      <h1>CTI Threat Dashboard</h1>

      <p style={{ marginLeft: '2rem', marginBottom: '1rem', color:'red' }}>
      All reports have a confidence score of 100.
      </p>

      <div style={{ display: 'flex', padding: '1rem' }}>
        {/* Table */}
      <div style={{ flex: 1.2, marginRight: '1rem' }}> 
      <div style={{  overflowY: 'auto' }}>
        <h2>Abuse IPDB Database </h2>
      <table>
        <thead>
          <tr>
            <th>IP Address </th>
            <th>Country <br/>
            <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            style={{marginTop: '5px', width: 'auto'}}            
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
              {['All Time', 'Past 5 Minutes', 'Past 15 Minutes', 'Past 30 Minutes', 'Past Hour', 'Past 2 Hours'].map(
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

      {/* charts */}
      
      <div style={{flex:1, height: '400px'}}>
        
        <h2>Graphs and Plots </h2>   
      
            <div style={{height:300}}>
            <h3 style={{marginTop: '2rem'}}> Proportion of Reports: {getCountryName(selectedCountry)}</h3>
            <ResponsiveContainer height="100%">
              <PieChart>
                <Pie
                data={donutData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                fill="#8884d8"
                label                
                >
                {donutData.map((entry, index) => (
                  <Cell  key={`cell-${index}`} fill={index === 0 ? '#8884d8' : '#ccc'} />
                ))}               

                </Pie>
                <Tooltip/>
                <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ fontSize: '20px', fontWeight: 'bold' }}
                >
                  {countryPercent}%
                </text>
              </PieChart>


            </ResponsiveContainer>
            </div>
             
        <h3>Top 10 Countries By Report Count</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
          data={chartData}
          layout='vertical'
          margin={{left: 30}}>
            <CartesianGrid strokeDasharray="3 3"/>
            <XAxis type='number'/>
            <YAxis type='category' dataKey="name" width={100}/>
            <Tooltip/> 
            <Bar dataKey="count" fill='#8884d8' />
          </BarChart>
        </ResponsiveContainer>
        
        <h3 style={{marginTop: '2rem'}}> Reports Over Time (30 min bins)</h3>
        <div style={{height:300}}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeSeriesData} >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date"/>
              <YAxis/>
              <Tooltip/>
              <Legend/>
              <Line type="monotone" dataKey="count" stroke='#82ca9d' />
            </LineChart>             
          </ResponsiveContainer>  

          
        </div>
      </div>
    </div>
    </div>
  )
}

export default App;
