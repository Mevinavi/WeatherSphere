// API Key for OpenWeatherMap (replace with your own API key)
const apiKey = '71049cd3b865db3f329a2679dce6c030';

// Get references to the form, input field, weather result container, and loading spinner
const weatherForm = document.getElementById('weatherForm');
const cityInput = document.getElementById('cityInput');
const weatherResult = document.getElementById('weatherResult');
const loadingSpinner = document.getElementById('loadingSpinner');

// Variable to store the Leaflet map instance
let map;

// Add an event listener to the form for the 'submit' event
weatherForm.addEventListener('submit', async (e) => {
  e.preventDefault(); // Prevent the form from submitting and refreshing the page

  // Get the city name from the input field
  const city = cityInput.value;

  // Check if the city input is empty
  if (!city) {
    alert('Please enter a city name'); // Show an alert if the input is empty
    return; // Exit the function
  }

  try {
    // Show the loading spinner while fetching data
    loadingSpinner.style.display = 'block';

    // Fetch current weather data from OpenWeatherMap API
    const weatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
    );
    const weatherData = await weatherResponse.json();

    // Fetch 5-day forecast data from OpenWeatherMap API
    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`
    );
    const forecastData = await forecastResponse.json();

    // Hide the loading spinner after data is fetched
    loadingSpinner.style.display = 'none';

    // Check if the API returned valid data (status code 200)
    if (weatherData.cod === 200) {
      // Destructure the data to get relevant fields
      const { name, main, weather, coord } = weatherData;

      // Construct the URL for the weather icon
      const iconUrl = `http://openweathermap.org/img/wn/${weather[0].icon}@2x.png`;

      // Display the current weather data in the weatherResult container
      weatherResult.innerHTML = `
        <h2>${name}</h2>
        <img class="weather-icon" src="${iconUrl}" alt="${weather[0].description}">
        <p>🌡️ Temperature: ${main.temp}°C</p>
        <p>🌤️ Weather: ${weather[0].description}</p>
        <p>💧 Humidity: ${main.humidity}%</p>
      `;

      // Check if the forecast data is valid
      if (forecastData.cod === '200') {
        // Filter the forecast data to get one entry per day (every 8th entry)
        const forecastHTML = forecastData.list
          .filter((item, index) => index % 8 === 0)
          .map((item) => `
            <div class="forecast-item">
              <p>${new Date(item.dt * 1000).toLocaleDateString()}</p>
              <img src="http://openweathermap.org/img/wn/${item.weather[0].icon}.png" alt="${item.weather[0].description}">
              <p>${item.main.temp}°C</p>
            </div>
          `)
          .join('');

        // Append the forecast HTML to the weatherResult container
        weatherResult.innerHTML += `<div class="forecast">${forecastHTML}</div>`;
      }

      // Update the background color based on the weather condition
      if (weather[0].main === 'Clear') {
        document.body.className = 'sunny';
      } else if (weather[0].main === 'Rain') {
        document.body.className = 'rainy';
      } else if (weather[0].main === 'Snow') {
        document.body.className = 'snowy';
      } else {
        document.body.className = '';
      }

      // Remove the existing map instance if it exists
      if (map) {
        map.remove();
        map = null;
      }

      // Initialize a new map with the city's coordinates
      initMap(coord.lat, coord.lon);
    } else {
      // Display an error message if the city is not found
      weatherResult.innerHTML = `<p>City not found. Please try again.</p>`;
    }
  } catch (error) {
    // Log any errors to the console and display an error message
    console.error('Error fetching weather data:', error);
    weatherResult.innerHTML = `<p>An error occurred. Please try again later.</p>`;
    loadingSpinner.style.display = 'none';
  }
});

// Function to initialize the Leaflet map
function initMap(lat, lon) {
  // Create a new map instance and set its view to the provided coordinates
  map = L.map('map').setView([lat, lon], 10);

  // Add a tile layer (map tiles) from OpenStreetMap
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
  }).addTo(map);

  // Add a marker at the city's coordinates with a popup
  L.marker([lat, lon])
    .addTo(map)
    .bindPopup('City Location')
    .openPopup();
}