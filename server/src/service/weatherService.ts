import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// Define an interface for the Coordinates object
interface Coordinates {
  lat: number;
  lon: number;
}

// Define a class for the Weather object
class Weather {
  city: string;
  date: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  weatherIcon: string;
  description: string;

  constructor(
    city: string,
    date: string,
    temperature: number,
    humidity: number,
    windSpeed: number,
    weatherIcon: string,
    description: string
  ) {
    this.city = city;
    this.date = date;
    this.temperature = temperature;
    this.humidity = humidity;
    this.windSpeed = windSpeed;
    this.weatherIcon = weatherIcon;
    this.description = description;
  }
}

// Complete the WeatherService class
class WeatherService {
  private baseURL = 'https://api.openweathermap.org/data/2.5';
  private apiKey = process.env.OPENWEATHER_API_KEY || '';

  // Fetch location data using OpenWeather Geocoding API
  private async fetchLocationData(city: string) {
    try {
      console.log("Fetching coordinates for city:", city); // ✅ Debug log
  
      const response = await axios.get(`http://api.openweathermap.org/geo/1.0/direct`, {
        params: {
          q: city,
          limit: 1,
          appid: this.apiKey,
        },
      });
  
      console.log("Raw location API response:", response.data); // ✅ Debug log
  
      if (!response.data || response.data.length === 0) {
        throw new Error(`City not found: ${city}`);
      }
  
      return response.data[0]; // ✅ Return first result
    } catch (error: any) { // Explicitly type `error` as `any` to avoid TypeScript issues
      const errorMessage = error.response && error.response.data 
        ? JSON.stringify(error.response.data)
        : error.message;
  
      console.error("Error fetching location data:", errorMessage); // ✅ Log API error details safely
  
      throw new Error('Error fetching location data');
    }
  }

  // Extract latitude and longitude from the location data
  private destructureLocationData(locationData: any): Coordinates {
    return {
      lat: locationData.lat,
      lon: locationData.lon,
    };
  }

  // Build Geocode API query
  // private buildGeocodeQuery(city: string): string {
  //   return `${this.baseURL}/geo/1.0/direct?q=${city}&limit=1&appid=${this.apiKey}`;
  // }

  // Build Weather API query
  private buildWeatherQuery(coordinates: Coordinates): string {
    return `${this.baseURL}/forecast?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${this.apiKey}&units=imperial`;
  }

  // Fetch location and destructure coordinates
  private async fetchAndDestructureLocationData(city: string): Promise<Coordinates> {
    const locationData = await this.fetchLocationData(city);
    return this.destructureLocationData(locationData);
  }

  // Fetch weather data using the OpenWeather API
  private async fetchWeatherData(coordinates: Coordinates) {
    try {
      const response = await axios.get(this.buildWeatherQuery(coordinates));
      return response.data;
    } catch (error) {
      throw new Error('Error fetching weather data');
    }
  }

  // Parse current weather data
  private parseCurrentWeather(response: any, city: string): Weather {
    const currentWeather = response.list[0];
    const iconCode = currentWeather.weather[0].icon;
    const weatherIconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  
    console.log(`✅ Current Weather Icon URL: ${weatherIconUrl}`); // ✅ Debugging log
  
    return new Weather(
      city,
      new Date(currentWeather.dt * 1000).toLocaleDateString(),
      currentWeather.main.temp,
      currentWeather.main.humidity,
      currentWeather.wind.speed,
      weatherIconUrl,
      currentWeather.weather[0].description
    );
  }

  // Build 5-day forecast array
  private buildForecastArray(weatherData: any, city: string): Weather[] {
    return weatherData.list
      .filter((_entry: any, index: number) => index % 8 === 0) // Skip every 8 entries
      .map((entry: any) => {
        if (!entry || !entry.weather || !entry.weather[0]) {
          console.warn("⚠️ Skipping invalid weather entry:", entry);
          return null;
        }
  
        const iconCode = entry.weather[0].icon;
        const weatherIconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  
        console.log(`✅ Forecast Weather Icon URL: ${weatherIconUrl}`); // ✅ Debugging log
  
        return new Weather(
          city,
          new Date(entry.dt * 1000).toLocaleDateString(),
          entry.main.temp,
          entry.main.humidity,
          entry.wind.speed,
          weatherIconUrl,
          entry.weather[0].description
        );
      })
      .filter((weather: Weather | null): weather is Weather => weather !== null);
  }

  // Main function to get weather for a city
  async getWeatherForCity(city: string) {
    try {
      console.log("Fetching coordinates for:", city); // ✅ Debug log
  
      const coordinates = await this.fetchAndDestructureLocationData(city);
      console.log("Coordinates received:", coordinates); // ✅ Debug log
  
      const weatherData = await this.fetchWeatherData(coordinates);
      console.log("Raw weather data received:", weatherData); // ✅ Debug log
  
      if (!weatherData || !weatherData.list) {
        throw new Error("Invalid weather data structure from API");
      }
  
      const currentWeather = this.parseCurrentWeather(weatherData, city);
      console.log("Parsed current weather:", currentWeather); // ✅ Debug log
  
      const forecast = this.buildForecastArray(weatherData, city);
      console.log("Parsed forecast data:", forecast); // ✅ Debug log
  
      return { current: currentWeather, forecast };
    } catch (error) {
      console.error("WeatherService Error:", error); // ✅ Show exact error message
      throw new Error('Error retrieving weather data');
    }
  }
}

export default new WeatherService();