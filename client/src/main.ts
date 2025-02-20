import './styles/jass.css';

/* ------------------------------- 
   🔹 DOM ELEMENTS
------------------------------- */
const searchForm = document.getElementById('search-form') as HTMLFormElement;
const searchInput = document.getElementById('search-input') as HTMLInputElement;
const todayContainer = document.getElementById('today') as HTMLDivElement;
const forecastContainer = document.getElementById('forecast') as HTMLDivElement;
const searchHistoryContainer = document.getElementById('history') as HTMLDivElement;
const heading = document.getElementById('search-title') as HTMLHeadingElement;
const weatherImg = document.getElementById('weather-img') as HTMLImageElement;
const tempEl = document.getElementById('temp') as HTMLParagraphElement;
const windEl = document.getElementById('wind') as HTMLParagraphElement;
const humidityEl = document.getElementById('humidity') as HTMLParagraphElement;

/* ------------------------------- 
   🔹 API CALLS
------------------------------- */
const fetchWeather = async (city: string) => {
  console.log("Fetching weather for:", city);

  try {
    const response = await fetch('/api/weather/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ city }),
    });

    if (!response.ok) throw new Error(`Error: ${response.statusText}`);

    const weatherData = await response.json();
    console.log('Weather Data:', weatherData);

    if (!weatherData || !weatherData.current) throw new Error("Invalid weather data received");

    renderCurrentWeather(weatherData.current);
    renderForecast(weatherData.forecast);
  } catch (error) {
    console.error("Failed to fetch weather:", error);
  }
};

const fetchSearchHistory = async () => {
  try {
    const response = await fetch('/api/weather/history');
    if (!response.ok) throw new Error(`Error: ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch search history:", error);
    return [];
  }
};

const deleteCityFromHistory = async (id: string) => {
  try {
    const response = await fetch(`/api/weather/history/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error(`Error: ${response.statusText}`);
  } catch (error) {
    console.error("Failed to delete city from history:", error);
  }
};

/* ------------------------------- 
   🔹 RENDER FUNCTIONS
------------------------------- */
const renderCurrentWeather = (currentWeather: any): void => {
  if (!currentWeather) {
    console.error("No current weather data available");
    return;
  }

  const { city, date, weatherIcon, description, temperature, windSpeed, humidity } = currentWeather;

  heading.textContent = `${city} (${date})`;
  
  // Check if weatherIcon exists before setting the src
  if (weatherIcon) {
    weatherImg.setAttribute('src', `https://openweathermap.org/img/wn/${weatherIcon}.png`);
    weatherImg.setAttribute('alt', description);
    weatherImg.setAttribute('class', 'weather-img');
  } else {
    console.error("No weather icon found for the current weather data");
  }

  tempEl.textContent = `Temp: ${temperature}°F`;
  windEl.textContent = `Wind: ${windSpeed} MPH`;
  humidityEl.textContent = `Humidity: ${humidity}%`;

  if (todayContainer) {
    todayContainer.innerHTML = '';
    todayContainer.append(heading, weatherImg, tempEl, windEl, humidityEl);
  }
};


const renderForecast = (forecast: any[]): void => {
  forecastContainer.innerHTML = '';

  const headingCol = document.createElement('div');
  const heading = document.createElement('h4');
  headingCol.setAttribute('class', 'col-12');
  heading.textContent = '5-Day Forecast:';
  headingCol.append(heading);
  forecastContainer.append(headingCol);

  forecast.forEach(renderForecastCard);
};

const renderForecastCard = (forecast: any) => {
  const { date, weatherIcon, description, temperature, windSpeed, humidity } = forecast;
  const { col, cardTitle, weatherImg, tempEl, windEl, humidityEl } = createForecastCard();

  cardTitle.textContent = date;
  // Fix the icon URL here for forecast cards as well
  weatherImg.setAttribute('src', `https://openweathermap.org/img/wn/${weatherIcon}@2x.png`);
  weatherImg.setAttribute('alt', description);
  tempEl.textContent = `Temp: ${temperature}°F`;
  windEl.textContent = `Wind: ${windSpeed} MPH`;
  humidityEl.textContent = `Humidity: ${humidity}%`;

  forecastContainer.append(col);
};

const renderSearchHistory = async () => {
  const historyList = await fetchSearchHistory();
  searchHistoryContainer.innerHTML = '';

  if (!historyList.length) {
    searchHistoryContainer.innerHTML = '<p class="text-center">No Previous Search History</p>';
    return;
  }

  historyList.reverse().forEach((city: any) => {
    searchHistoryContainer.append(buildHistoryListItem(city));
  });
};

/* ------------------------------- 
   🔹 HELPER FUNCTIONS
------------------------------- */
const createForecastCard = () => {
  const col = document.createElement('div');
  const card = document.createElement('div');
  const cardBody = document.createElement('div');
  const cardTitle = document.createElement('h5');
  const weatherImg = document.createElement('img');
  const tempEl = document.createElement('p');
  const windEl = document.createElement('p');
  const humidityEl = document.createElement('p');

  col.append(card);
  card.append(cardBody);
  cardBody.append(cardTitle, weatherImg, tempEl, windEl, humidityEl);

  col.classList.add('col-auto');
  card.classList.add('forecast-card', 'card', 'text-white', 'bg-primary', 'h-100');
  cardBody.classList.add('card-body', 'p-2');

  return { col, cardTitle, weatherImg, tempEl, windEl, humidityEl };
};

const createHistoryButton = (city: string) => {
  const btn = document.createElement('button');
  btn.classList.add('history-btn', 'btn', 'btn-secondary', 'col-10');
  btn.textContent = city;
  return btn;
};

const createDeleteButton = () => {
  const btn = document.createElement('button');
  btn.classList.add('fas', 'fa-trash-alt', 'delete-city', 'btn', 'btn-danger', 'col-2');
  btn.addEventListener('click', handleDeleteHistoryClick);
  return btn;
};

const createHistoryDiv = () => {
  const div = document.createElement('div');
  div.classList.add('display-flex', 'gap-2', 'col-12', 'm-1');
  return div;
};

const buildHistoryListItem = (city: any) => {
  const newBtn = createHistoryButton(city.name);
  const deleteBtn = createDeleteButton();
  deleteBtn.dataset.city = JSON.stringify(city);
  const historyDiv = createHistoryDiv();
  historyDiv.append(newBtn, deleteBtn);
  return historyDiv;
};

/* ------------------------------- 
   🔹 EVENT HANDLERS
------------------------------- */
const handleSearchFormSubmit = (event: Event): void => {
  event.preventDefault();

  if (!searchInput.value.trim()) {
    console.error('City cannot be blank');
    return;
  }

  fetchWeather(searchInput.value.trim()).then(getAndRenderHistory);
  searchInput.value = '';
};

const handleSearchHistoryClick = (event: any) => {
  if (event.target.matches('.history-btn')) {
    fetchWeather(event.target.textContent).then(getAndRenderHistory);
  }
};

const handleDeleteHistoryClick = (event: Event) => {
  event.stopPropagation();
  const cityID = JSON.parse((event.target as HTMLElement).dataset.city || '{}').id;
  deleteCityFromHistory(cityID).then(getAndRenderHistory);
};

/* ------------------------------- 
   🔹 INITIALIZATION
------------------------------- */

// ✅ Define getAndRenderHistory before using it
const getAndRenderHistory = () => fetchSearchHistory().then(renderSearchHistory);

// ✅ Now it will work below!
searchForm?.addEventListener('submit', handleSearchFormSubmit);
searchHistoryContainer?.addEventListener('click', handleSearchHistoryClick);

getAndRenderHistory();