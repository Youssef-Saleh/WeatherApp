const cityInput = document.getElementById('cityInput');
const suggestionsDiv = document.getElementById('suggestions');
const getWeatherButton = document.getElementById('getWeather');
const weatherDataDiv = document.getElementById('weatherData');
const locationElement = document.getElementById('location');
const tempElement = document.getElementById('temp');
const conditionElement = document.getElementById('condition');
const humidityElement = document.getElementById('humidity');
const windSpeedElement = document.getElementById('wind_speed');

document.getElementById('loading').style.display = 'block'; // Show loading spinner
document.getElementById('loading').style.display = 'none'; // Hide loading spinner after data is fetched

let selectedCity = '';  // Will store the selected city with country code

// Function to get suggestions from backend (this uses the `/api/suggest` endpoint)
async function getCitySuggestions(query) {
  try {
    const response = await fetch(`/api/suggest?city=${query}`);
    const data = await response.json();

    // Clear previous suggestions
    suggestionsDiv.innerHTML = '';

    if (data && data.suggestions && data.suggestions.length > 0) {
      // Show suggestionsDiv
      suggestionsDiv.style.display = 'block';

      data.suggestions.forEach((suggestion) => {
        const suggestionElement = document.createElement('div');
        suggestionElement.textContent = `${suggestion.city}, ${suggestion.country}`;
        suggestionElement.onclick = () => {
          selectedCity = `${suggestion.city},${suggestion.countryCode}`;
          cityInput.value = `${suggestion.city}, ${suggestion.country}`;
          suggestionsDiv.style.display = 'none'; // Hide after selection
        };
        suggestionsDiv.appendChild(suggestionElement);
      });
    } else {
      // Hide suggestionsDiv if no results
      suggestionsDiv.style.display = 'none';
    }
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    suggestionsDiv.style.display = 'none'; // Hide on error
  }
}

// Listen for user input in the search field and show suggestions
cityInput.addEventListener('input', (e) => {
  const query = e.target.value.trim();
  if (query.length > 2) {
    getCitySuggestions(query);
  } else {
    suggestionsDiv.innerHTML = '';  // Clear suggestions when input is too short
  }
});

// Fetch the weather data when the user clicks the button
getWeatherButton.addEventListener('click', async () => {
  if (selectedCity) {
    const [city, countryCode] = selectedCity.split(',');
    try {
      const response = await fetch(`/api/weather?city=${city}&country=${countryCode}`);
      const data = await response.json();

      if (data.error) {
        weatherDataDiv.textContent = `Error: ${data.error}`;
      } else {
        // Display weather data in the styled sections
        weatherDataDiv.style.display = 'grid';
        locationElement.textContent = `${data.location.name}, ${data.location.country}`;
        tempElement.textContent = data.current.temp_c;
        conditionElement.textContent = data.current.condition.text;
        humidityElement.textContent = data.current.humidity;
        windSpeedElement.textContent = data.current.wind_kph;
      }
    } catch (error) {
      weatherDataDiv.textContent = 'Error fetching weather data';
    }
  } else {
    weatherDataDiv.textContent = 'Please select a city first.';
  }
});
