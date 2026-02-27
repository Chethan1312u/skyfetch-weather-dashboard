function WeatherApp(apiKey) {
  this.apiKey = 'f921e74554d5b5254f05b7206be270ce';
  this.apiUrl =
    "https://api.openweathermap.org/data/2.5/weather";
  this.forecastUrl =
    "https://api.openweathermap.org/data/2.5/forecast";
  this.searchBtn = document.getElementById("search-btn");
  this.cityInput = document.getElementById("city-input");
  this.weatherDisplay =
    document.getElementById("weather-display");

  // ─── new properties for localStorage feature ───
  this.MAX_RECENT = 7;
  this.recentContainer = null;

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

  this.createRecentSearchesUI();
  this.loadLastCity();
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

/* ────────────────────────────────────────────────
   LOCALSTORAGE + RECENT CITIES FEATURE
───────────────────────────────────────────────── */

/* Create recent searches UI (called once in init) */
WeatherApp.prototype.createRecentSearchesUI = function () {
  const section = document.createElement("div");
  section.className = "recent-searches";
  section.innerHTML = `<p>Recent searches:</p><div class="recent-buttons"></div>`;

  const searchSection = document.querySelector(".search-section");
  searchSection.insertAdjacentElement("afterend", section);

  this.recentContainer = section.querySelector(".recent-buttons");
  this.refreshRecentUI();
};

/* Refresh recent buttons from localStorage */
WeatherApp.prototype.refreshRecentUI = function () {
  if (!this.recentContainer) return;

  const cities = this.getRecentCities();
  this.recentContainer.innerHTML = "";

  cities.forEach(city => {
    const btn = document.createElement("button");
    btn.className = "recent-btn";
    btn.textContent = city;
    btn.addEventListener("click", () => {
      this.cityInput.value = city;
      this.handleSearch();
    });
    this.recentContainer.appendChild(btn);
  });
};

/* Get recent cities array from localStorage */
WeatherApp.prototype.getRecentCities = function () {
  try {
    const json = localStorage.getItem("weatherRecentCities");
    return json ? JSON.parse(json) : [];
  } catch {
    return [];
  }
};

/* Save city to recent list + last city (only on success) */
WeatherApp.prototype.saveCity = function (city) {
  let cities = this.getRecentCities();

  // Remove if already exists (move to front)
  cities = cities.filter(c => c.toLowerCase() !== city.toLowerCase());
  cities.unshift(city);

  // Limit size
  cities = cities.slice(0, this.MAX_RECENT);

  localStorage.setItem("weatherRecentCities", JSON.stringify(cities));
  localStorage.setItem("weatherLastCity", city);

  this.refreshRecentUI();
};

/* Load and auto-search last city on page load */
WeatherApp.prototype.loadLastCity = function () {
  try {
    const last = localStorage.getItem("weatherLastCity");
    if (last) {
      this.cityInput.value = last;
      this.handleSearch();
    }
  } catch {}
};

/* 🔹 Main Fetch – modified to save only on success */
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

    // Success → save to recent & last
    this.saveCity(city);

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
