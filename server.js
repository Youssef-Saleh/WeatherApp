import express from 'express';       // Import express (ES Module syntax)
import fetch from 'node-fetch';      // Import node-fetch (ES Module syntax)
import dotenv from 'dotenv';         // Import dotenv (to load environment variables)
import cors from 'cors';             // Import cors (Cross-Origin Resource Sharing)
import path from 'path';             // Import path (Native Node.js module)

dotenv.config(); // Load environment variables from .env file

const app = express();
const PORT = process.env.PORT || 3000;

// Use CORS middleware to enable cross-origin requests
app.use(cors());

// Define the base URL for the weather API
const BASE_WEATHER_URL = 'https://api.weatherapi.com/v1/current.json';
const BASE_GEOCODING_URL = 'https://api.weatherapi.com/v1/search.json';  // Weather API search endpoint


// Endpoint to get city suggestions
app.get('/api/suggest', async (req, res) => {
  const query = req.query.city;
  console.log(`Received request for city suggestions: ${query}`);

  if (!query) {
    return res.status(400).json({ error: 'City query is required' });
  }

  try {
    const geocodingURL = `${BASE_GEOCODING_URL}?key=${process.env.WEATHER_API_KEY}&q=${encodeURIComponent(query)}`;
    const response = await fetch(geocodingURL);

    if (!response.ok) {
      return res.status(500).json({ error: 'Error fetching city suggestions' });
    }

    const data = await response.json();

    // If there are no suggestions, send a no result message
    if (!data || data.length === 0) {
      return res.status(200).json({ suggestions: [] });
    }

    // Return city suggestions with country codes
    const suggestions = data.map((item) => ({
      city: item.name,
      country: item.country,
      countryCode: item.country_code || item.country,  // Ensure the country code is available
    }));

    res.json({ suggestions });
  } catch (error) {
    console.error('Error fetching city suggestions:', error);
    res.status(500).json({ error: 'Error fetching city suggestions' });
  }
});

// Example weather endpoint
app.get('/api/weather', async (req, res) => {
  const city = req.query.city;
  const country = req.query.country;
  console.log(`Received request for city: ${city}, country: ${country}`);

  if (!city) {
    return res.status(400).json({ error: 'City is required' });
  }

  try {
    const weatherURL = `${BASE_WEATHER_URL}?key=${process.env.WEATHER_API_KEY}&q=${encodeURIComponent(city)},${encodeURIComponent(country)}&aqi=no`;
    const weatherResponse = await fetch(weatherURL);

    if (!weatherResponse.ok) {
      return res.status(500).json({ error: 'Failed to fetch weather data' });
    }

    const weatherData = await weatherResponse.json();
    res.json(weatherData);
  } catch (error) {
    console.error('Error fetching weather data:', error);
    res.status(500).json({ error: 'Error fetching weather data' });
  }
});

// Serve static files (e.g., frontend assets) if needed
app.use(express.static(path.join(process.cwd(), 'public')));

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
