const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// A simple root route to confirm the server is running
app.get('/', (req, res) => {
    res.send('Server is running!');
});

// Main route for current AQI data
app.get('/api/aqi/current', async (req, res) => {
    const lat = 17.3850; // Latitude for Hyderabad
    const lon = 78.4867; // Longitude for Hyderabad
    const waqiApiKey = process.env.WAQI_API_KEY;

    if (!waqiApiKey) {
        return res.status(500).json({ error: 'API key not configured' });
    }

    try {
        const url = `https://api.waqi.info/feed/geo:${lat};${lon}/?token=${waqiApiKey}`;
        const response = await axios.get(url);

        // Check for a valid response status from the API
        if (response.data.status !== 'ok') {
            return res.status(500).json({ error: 'Failed to fetch AQI data from WAQI API', details: response.data.data });
        }

        const aqiData = {
            aqi: response.data.data.aqi,
            pollutants: response.data.data.iaqi,
            station: response.data.data.city.name
        };

        res.json(aqiData);
    } catch (error) {
        console.error('Error fetching AQI data:', error.message);
        res.status(500).json({ error: 'Failed to fetch AQI data from WAQI API' });
    }
});

// Route to get a list of AQI stations for the map
app.get('/api/aqi/stations', async (req, res) => {
    const waqiApiKey = process.env.WAQI_API_KEY;

    const stations = [
        { name: 'Banjara Hills', lat: 17.4126, lng: 78.4482 },
        { name: 'Secunderabad', lat: 17.4399, lng: 78.4983 },
        { name: 'Jubilee Hills', lat: 17.4239, lng: 78.4738 },
        { name: 'Old City', lat: 17.3616, lng: 78.4747 },
        { name: 'Gachibowli', lat: 17.4435, lng: 78.3479 },
        { name: 'Hitech City', lat: 17.4475, lng: 78.3563 },
        { name: 'Kondapur', lat: 17.4647, lng: 78.3671 },
        { name: 'Madhapur', lat: 17.4483, lng: 78.3915 }
    ];

    if (!waqiApiKey) {
        return res.status(500).json({ error: 'API key not configured' });
    }

    try {
        const promises = stations.map(station =>
            axios.get(`https://api.waqi.info/feed/geo:${station.lat};${station.lng}/?token=${waqiApiKey}`)
                .then(response => {
                    if (response.data.status === 'ok') {
                        return {
                            name: station.name,
                            lat: station.lat,
                            lng: station.lng,
                            aqi: response.data.data.aqi
                        };
                    } else {
                        // Handle cases where a station might not have data
                        return {
                            name: station.name,
                            aqi: 'N/A',
                            lat: station.lat,
                            lng: station.lng
                        };
                    }
                })
                .catch(error => {
                    console.error(`Error fetching data for ${station.name}:`, error.message);
                    return { name: station.name, aqi: 'N/A', lat: station.lat, lng: station.lng, error: true };
                })
        );

        const results = await Promise.all(promises);
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch station data.' });
    }
});

// Route for the 24-hour forecast (simulated)
app.get('/api/aqi/forecast', async (req, res) => {
    const forecastData = {
        labels: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'],
        aqi: [45, 42, 38, 55, 60, 58, 52, 48]
    };
    res.json(forecastData);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
