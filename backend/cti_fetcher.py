import requests
import json
from dotenv import load_dotenv
import os

ABUSE_API_KEY = os.getenv('ABUSE_API_KEY')
abuse_ip_url = "https://api.abuseipdb.com/api/v2/blacklist"

def fetchAbusedata():
    headers = {
        'Accept': 'application/json',
        'Key': ABUSE_API_KEY
    }
    params = {
        'confidenceMinimum': 90,
        'limit': 2000,
    }
    response = requests.get(abuse_ip_url, headers=headers, params=params)

    if response.status_code != 200:
        print("Error:", response.status_code, response.text)
        return []
    
    raw_data = response.json()['data']

    normalized = [
        {
            'ip': entry['ipAddress'],
            'countryCode': entry['countryCode'],
            'abuseConfidenceScore': entry['abuseConfidenceScore'],
            'lastReportedAt': entry['lastReportedAt'],
        }
        for entry in raw_data
    ]

    return normalized

if __name__ == "__main__":
    data = fetchAbusedata()
    with open('sample_data.json', 'w') as f:
        json.dump(data, f, indent=2)