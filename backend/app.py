from flask import Flask, jsonify
from cti_fetcher import fetchAbusedata
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/api/threats', methods=['GET'])

def getThreats():
    data = fetchAbusedata()
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)