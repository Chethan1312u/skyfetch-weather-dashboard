// Your OpenWeatherMap API Key
const API_KEY = 'f921e74554d5b5254f05b7206be270ce';
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';

// DOM Elements
const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('searchInput');
const weatherDisplay = document.getElementById('weather-display');

// Function to fetch weather data
function getWeather(city) {

    weatherDisplay.innerHTML = '<p class="loading">Fetching weather data...</p>';

    const url = `${API_URL}?q=${city}&appid=${API_KEY}&units=metric`;

    axios.get(url)
        .then(function(response) {
            displayWeather(response.data);
        })
        .catch(function(error) {
            weatherDisplay.innerHTML =
                '<p class="loading">City not found. Please try again.</p>';
        });
}

// Function to display weather data
function displayWeather(data) {

    const cityName = data.name;
    const temperature = Math.round(data.main.temp);
    const description = data.weather[0].description;
    const icon = data.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;

    const weatherHTML = `
        <div class="weather-info">
            <h2 class="city-name">${cityName}</h2>
            <img src="${iconUrl}" alt="${description}" class="weather-icon">
            <div class="temperature">${temperature}°C</div>
            <p class="description">${description}</p>
        </div>
    `;

    weatherDisplay.innerHTML = weatherHTML;
}

// Search button click
searchBtn.addEventListener('click', function() {
    const city = searchInput.value.trim();
    if (city !== '') {
        getWeather(city);
    }
});

// Enter key support
searchInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        const city = searchInput.value.trim();
        if (city !== '') {
            getWeather(city);
        }
    }
});

// Default city on load
getWeather('London');