let card = document.getElementById("card");
let currentDate = document.getElementById("current-date");
let cardInput = document.getElementById("city-name");
let cardBtn = document.getElementById("search-btn");
let currenCity = document.getElementById("current-city-name");
let currentTemp = document.getElementById("weather-temp");
let weatherImg = document.getElementById("weather-img");
let windSpeed = document.getElementById("wind-speed");
let humidityLevel = document.getElementById("humidity-level");
let suggestionBlock = document.getElementById("sugestions-block");
let currTime = document.getElementById("curr-time");
let errorMessage = document.getElementById("error-message");
let errBtn = document.getElementById("err-btn");

const showDate = () => {
  let date = new Date();
  const day = date.getDate();
  const monthName = date.toLocaleString("en", { month: "long" });
  currentDate.textContent = `Today, ${day} ${monthName}`;
};

async function getWeather(city) {
  city = city.trim();
  if (!city) return;

  try {
    const resp = await fetch(
      `https://weather-app-sever.onrender.com/weather?city=${city}`
    );

    if (!resp.ok) {
      const errorData = await resp.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error: ${resp.status}`);
    }

    const result = await resp.json();
    errorMessage.classList.remove("visible");
    card.classList.add("activee");
    cardInput.value = "";
    if (shouldAutoFocus()) cardInput.focus();

    const currImgUrl = `https://openweathermap.org/img/wn/${result.weather[0].icon}@4x.png`;
    weatherImg.src = currImgUrl;
    currenCity.textContent = result.name;
    currentTemp.textContent = `${Math.round(result.main.temp)}°C`;
    humidityLevel.textContent = `${result.main.humidity}%`;
    windSpeed.textContent = `${result.wind.speed} m/s`;
  } catch (error) {
    if (errorMessage.classList.contains("visible")) flashErrorBorder();
    console.error("Weather API error:", error.message);
    errorMessage.classList.add("visible");
  }
}

function showTime() {
  let date = new Date();
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let seconds = date.getSeconds();

  hours = String(hours).padStart(2, "0");
  minutes = String(minutes).padStart(2, "0");
  seconds = String(seconds).padStart(2, "0");
  currTime.textContent = `${hours}:${minutes}:${seconds}`;
}
showTime();
setInterval(showTime, 1000);

function flashErrorBorder() {
  errorMessage.classList.add("flash");
  setTimeout(() => errorMessage.classList.remove("flash"), 700);
}

function shouldAutoFocus() {
  const isSmallScreen = window.innerWidth <= 768;
  const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;

  return !isSmallScreen && !isTouch;
}

function saveCity(city) {
  let cities = JSON.parse(localStorage.getItem("cities")) || [];

  cities = cities.filter((item) => {
    return item.toLowerCase() !== city.toLowerCase();
  });

  cities.unshift(city);
  let lastfourCities = cities.slice(0, 4);

  localStorage.setItem("cities", JSON.stringify(lastfourCities));
}

function showSuggestions(searchedCity) {
  let cities = JSON.parse(localStorage.getItem("cities")) || [];

  const filteredCities = cities.filter((city) => {
    return city.toLowerCase().includes(searchedCity.toLowerCase());
  });

  if (filteredCities.length === 0 || cardInput.value.length === 0) {
    suggestionBlock.style.display = "none";
    return;
  }

  suggestionBlock.innerHTML = "";

  filteredCities.forEach((city) => {
    const p = document.createElement("p");
    p.classList.add("suggestion-item");
    p.textContent = city;

    p.addEventListener("click", () => {
      cardInput.value = city;
      suggestionBlock.style.display = "none";
      if (shouldAutoFocus()) cardInput.focus();
    });
    suggestionBlock.appendChild(p);
  });

  suggestionBlock.style.display = "block";
}



function checkCity() {
  const city = cardInput.value.trim();
  if (!city) return;
  saveCity(city);
  suggestionBlock.style.display = "none";
}


document.addEventListener("click", (e) => {
  if (card.classList.contains("activee") && !card.contains(e.target)) {
    card.classList.remove("activee");
  }
});


cardInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();

    getWeather(cardInput.value);
    checkCity();

    if (shouldAutoFocus()) cardInput.focus();
    cardInput.blur();
  }
});



cardBtn.addEventListener("click", () => {
  getWeather(cardInput.value);
  checkCity();
});



cardInput.addEventListener("input", (e) => {
  showSuggestions(e.target.value);
});

document.addEventListener("click", (e) => {
  if (e.target.closest(".card__search-input")) {
    suggestionBlock.style.display = "none";
  }
});

errBtn.addEventListener("click", (e) => {
  errorMessage.classList.remove("visible");
  cardInput.focus();
});

showDate();