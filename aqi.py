import os
import random
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS

# This file acts as a simple backend server to provide AQI data.
# It runs a Flask application that serves a JSON API endpoint.

app = Flask(__name__)
CORS(app)  # This allows the frontend to fetch data from this server

@app.route('/')
def index():
    """Serve the model.html page from the model directory."""
    return send_from_directory('model', 'model.html')

@app.route('/logo.png')
def logo():
    """Serve the logo image."""
    return send_from_directory('.', 'logo.png')

# This dictionary holds the city data.
# The AQI and status will be updated dynamically.
CITIES = {
    'delhi': {'name': 'New Delhi'},
    'mumbai': {'name': 'Mumbai'},
    'kolkata': {'name': 'Kolkata'},
    'bangalore': {'name': 'Bangalore'},
    'chennai': {'name': 'Chennai'},
    'hyderabad': {'name': 'Hyderabad'},
    'pune': {'name': 'Pune'},
    'ahmedabad': {'name': 'Ahmedabad'},
}

def get_aqi_status(aqi):
    if aqi <= 50:
        return 'Good'
    elif aqi <= 100:
        return 'Moderate'
    elif aqi <= 150:
        return 'Unhealthy for Sensitive Groups'
    elif aqi <= 200:
        return 'Unhealthy'
    elif aqi <= 300:
        return 'Very Unhealthy'
    else:
        return 'Hazardous'

@app.route('/api/aqi', methods=['GET'])
def get_aqi():
    """
    This endpoint provides a list of cities and their simulated real-time AQI.
    The data is generated randomly each time to mimic real-time updates.
    """
    aqi_data = {}
    for city_key, city_info in CITIES.items():
        # Generate a random AQI value to simulate real-time data
        aqi = random.randint(30, 400)
        aqi_data[city_key] = {
            'name': city_info['name'],
            'aqi': aqi,
            'status': get_aqi_status(aqi)
        }
    return jsonify(aqi_data)

if __name__ == '__main__':
    # Run the Flask application on a different port than Node backend
    app.run(port=5001, debug=True)
