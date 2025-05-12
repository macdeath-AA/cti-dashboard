# CTI Threat Dashboard

A simple React-based dashboard for visualizing threat intelligence data from [AbuseIPDB](https://www.abuseipdb.com/) sources. The interactive frontend dashboard is built with React + Recharts and the Python backend is used to fetch, parse, and clean CTI data from AbuseIPDB data source.

## Features

- Table with filters by country and custom time window
- Top countries chart
- Reports over time (half-hourly granularity)
- Handles static dataset as if it were real-time using last timestamp logic

## Installation

### Prerequisites

- Node.js (v16 or later recommended)
- npm
- Python 3.8+

1. Clone the repository:
   ```bash
   git clone https://github.com/macdeath-AA/cti-dashboard.git
   ```

2. Install dependencies:
   ```bash
   cd cti-dashboard/frontend
   npm install
   ```

4. Make sure the `full_data.json` or `sample_data.json` file is in the `public` folder.

### Running Locally

```bash
npm start
```
Open [http://localhost:3000](http://localhost:3000) to view in your browser.

## Generate your Own Data

If you want to generate your own sample data from the AbuseIPBP then navigate to the backend folder and install the dependencies.

```bash
   cd ..
   cd cti-dashboard/backend
   pip install -r requirements.txt
```
Now generate an API key and place it in a `.env` file in the root (`backend`) directory as shown:
 
 ```bash
   ABUSE_API_KEY = your_api_key
 ```
And then run the following:

 ```bash
   cd backend
   python cti_fetcher.py
   ```

### Data Format

The `full_data.json` file should be an array of objects with at least these fields:
```json
[
  {
    "ip": "1.2.3.4",
    "countryCode": "US",
    "lastReportedAt": "2024-05-10T12:34:56Z"
  },
  ...
]
```
You can run the `app.py` script for dynamically fetching the data from the backend but since the AbuseIPDB API key allows only 5 requests per day, it is better to store the data in the static json file and use it directly. 

## Implementation Overview
### Backend 
- Fetch data from CTI source (AbuseIPDB)
- Assign fields like IP address, country, confidence score, and report timestamp.
- Export the cleaned data as a JSON file which is used by the frontend.

### Frontend
1. Table View:
   - Display raw CTI data (IP, Country, Last Reported At
   - Include filters: country dropdown, time range selector (e.g., last 5 mins)
   - Time filtering is anchored on the latest timestamp in the data.
2. Charts:
   - Bar chart showing top reported countries where data is aggregrated using a simple count by country.
   - Line chart plotting number of reports over time (hourly bins).
   - Donut chart displaying the proportion of IP reports by country.

Note: All charts and data views update based on filter selection and are optimized to avoid slow UI updates. 
