function WeatherApp(apiKey) {
  this.apiKey = apiKey;
  this.apiUrl =
    "https://api.openweathermap.org/data/2.5/weather";
  this.forecastUrl =
    "https://api.openweathermap.org/data/2.5/forecast";
  this.searchBtn = document.getElementById("search-btn");
  this.cityInput = document.getElementById("city-input");
  this.weatherDisplay =
    document.getElementById("weather-display");
  this.init();
}
/* 🔹 Init */
WeatherApp.prototype.init = function () {
  this.searchBtn.addEventListener(
    "click",
    this.handleSearch.bind(this)
  );
  this.cityInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") this.handleSearch();
  });
  this.showWelcome();
};
/* 🔹 Welcome Screen */
WeatherApp.prototype.showWelcome = function () {
  this.weatherDisplay.innerHTML =
    "<p>Enter a city to get weather 🌍</p>";
};
/* 🔹 Handle Search */
WeatherApp.prototype.handleSearch = function () {
  const city = this.cityInput.value.trim();
  if (!city) {
    this.showError("Enter a city name");
    return;
  }
  this.getWeather(city);
  this.cityInput.value = "";
};
/* 🔹 Loading */
WeatherApp.prototype.showLoading = function () {
  this.weatherDisplay.innerHTML = `
    <div class="loading-container">
      <div class="spinner"></div>
      <p>Loading...</p>
    </div>`;
};
/* 🔹 Error */
WeatherApp.prototype.showError = function (msg) {
  this.weatherDisplay.innerHTML =
    `<p class="error-message">❌ ${msg}</p>`;
};
/* 🔹 Display Current Weather */
WeatherApp.prototype.displayWeather = function (data) {
  const icon = data.weather[0].icon;
  this.weatherDisplay.innerHTML = `
    <h2>${data.name}</h2>
    <h1>${Math.round(data.main.temp)} °C</h1>
    <p>${data.weather[0].description}</p>
    <img src="https://openweathermap.org/img/wn/${icon}@2x.png" />
  `;
};
/* 🔹 Get Forecast Data */
WeatherApp.prototype.getForecast = async function (city) {
  const url =
    `${this.forecastUrl}?q=${city}&appid=${this.apiKey}&units=metric`;
  const response = await axios.get(url);
  return response.data;
};
/* 🔹 Process Forecast (1 per day at noon) */
WeatherApp.prototype.processForecastData = function (data) {
  return data.list
    .filter((item) => item.dt_txt.includes("12:00:00"))
    .slice(0, 5);
};
/* 🔹 Display Forecast */
WeatherApp.prototype.displayForecast = function (data) {
  const days = this.processForecastData(data);
  const cards = days.map((day) => {
    const date = new Date(day.dt * 1000);
    const dayName = date.toLocaleDateString("en-US", {
      weekday: "short",
    });
    const icon = day.weather[0].icon;
    return `
      <div class="forecast-card">
        <h4>${dayName}</h4>
        <img src="https://openweathermap.org/img/wn/${icon}@2x.png" />
        <p>${Math.round(day.main.temp)} °C</p>
        <p>${day.weather[0].description}</p>
      </div>`;
  }).join("");
  this.weatherDisplay.innerHTML += `
    <div class="forecast-section">
      <h3>5-Day Forecast</h3>
      <div class="forecast-container">
        ${cards}
      </div>
    </div>`;
};
/* 🔹 Main Fetch */
WeatherApp.prototype.getWeather = async function (city) {
  this.showLoading();
  try {
    const currentUrl =
      `${this.apiUrl}?q=${city}&appid=${this.apiKey}&units=metric`;
    const [current, forecast] = await Promise.all([
      axios.get(currentUrl),
      this.getForecast(city),
    ]);
    this.displayWeather(current.data);
    this.displayForecast(forecast);
  } catch (error) {
    if (error.response?.status === 404) {
      this.showError("City not found");
    } else {
      this.showError("Something went wrong");
    }
  }
};
/* 🔥 Create App Instance */
const app = new WeatherApp("b8ccb6f69b39f97d7f411f3af38d45b5");
