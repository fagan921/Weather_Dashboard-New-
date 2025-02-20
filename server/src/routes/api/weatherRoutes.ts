import { Router } from 'express';
import HistoryService from '../../service/historyService.js';
import WeatherService from '../../service/weatherService.js';

const router = Router();

// POST request to fetch weather data and save city to search history
router.post('/', async (req, res) => {
  try {
    const { city } = req.body;
    if (!city) {
      return res.status(400).json({ error: 'City name is required' });
    }

    console.log("Fetching weather for:", city); // ✅ Debug log

    // Fetch weather data
    const weatherData = await WeatherService.getWeatherForCity(city);
    
    console.log("Weather data received:", weatherData); // ✅ Debug log

    // Save city to search history
    await HistoryService.addCity(city);

    return res.json(weatherData);
  } catch (error) {
    console.error("Backend Error:", error); // ✅ Debug log for errors
    return res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

// GET request to retrieve search history
router.get('/history', async (_req, res) => {
  try {
    const history = await HistoryService.getCities();
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve search history' });
  }
});

// DELETE request to remove a city from search history
router.delete('/history/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await HistoryService.removeCity(id);
    res.json({ message: `City with ID ${id} deleted from history` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete city from history' });
  }
});

export default router;