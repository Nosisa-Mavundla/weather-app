// Simple Weather App
// Uses the free Open-Meteo API (no API key required):
//   1. Geocoding API -> turns a city name into latitude/longitude
//   2. Forecast API   -> gets current weather for those coordinates

const form = document.getElementById("search-form");
const cityInput = document.getElementById("city-input");
const resultSection = document.getElementById("result");
const messageEl = document.getElementById("message");

const locationEl = document.getElementById("location");
const temperatureEl = document.getElementById("temperature");
const conditionEl = document.getElementById("condition");
const feelsLikeEl = document.getElementById("feels-like");
const windEl = document.getElementById("wind");
const humidityEl = document.getElementById("humidity");

// Maps Open-Meteo's numeric weather codes to human-readable text.
const WEATHER_CODES = {
  0: "Clear sky",
  1: "Mostly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  71: "Slight snow",
  73: "Moderate snow",
  75: "Heavy snow",
  80: "Rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  95: "Thunderstorm",
  96: "Thunderstorm with hail",
};

function describeWeather(code) {
  return WEATHER_CODES[code] || "Unknown conditions";
}

function showMessage(text) {
  messageEl.textContent = text;
  resultSection.hidden = true;
}

async function geocodeCity(city) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    city
  )}&count=1&language=en&format=json`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Could not reach the geocoding service.");
  }

  const data = await response.json();
  if (!data.results || data.results.length === 0) {
    throw new Error(`No location found for "${city}".`);
  }

  const { latitude, longitude, name, country } = data.results[0];
  return { latitude, longitude, name, country };
}

async function fetchWeather(latitude, longitude) {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}` +
    `&longitude=${longitude}` +
    `&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Could not reach the weather service.");
  }

  const data = await response.json();
  return data.current;
}

function renderWeather(place, current) {
  locationEl.textContent = `${place.name}, ${place.country}`;
  temperatureEl.textContent = `${Math.round(current.temperature_2m)}°C`;
  conditionEl.textContent = describeWeather(current.weather_code);
  feelsLikeEl.textContent = `${Math.round(current.apparent_temperature)}°C`;
  windEl.textContent = `${Math.round(current.wind_speed_10m)} km/h`;
  humidityEl.textContent = `${current.relative_humidity_2m}%`;

  messageEl.textContent = "";
  resultSection.hidden = false;
}

async function handleSearch(city) {
  showMessage("Loading...");

  try {
    const place = await geocodeCity(city);
    const current = await fetchWeather(place.latitude, place.longitude);
    renderWeather(place, current);
  } catch (error) {
    showMessage(error.message || "Something went wrong. Please try again.");
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const city = cityInput.value.trim();
  if (city) {
    handleSearch(city);
  }
});
