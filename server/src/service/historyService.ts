import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';
import path from 'path';

// Convert import.meta.url to a __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class City {
  id: string;
  name: string;

  constructor(name: string) {
    this.id = randomUUID();
    this.name = name;
  }
}

class HistoryService {
  private dbDirectory = path.join(__dirname, '../db'); // ✅ Fix path handling
  private filePath = path.join(this.dbDirectory, 'searchHistory.json');

  private async ensureDbDirectoryExists() {
    if (!existsSync(this.dbDirectory)) {
      console.log(`Creating missing directory: ${this.dbDirectory}`);
      await mkdir(this.dbDirectory, { recursive: true });
    }
  }

  private async read(): Promise<City[]> {
    try {
      const data = await readFile(this.filePath, 'utf-8');
      return JSON.parse(data) as City[];
    } catch (error) {
      console.log("⚠️ No history file found. Returning empty array.");
      return [];
    }
  }

  private async write(cities: City[]) {
    try {
      await this.ensureDbDirectoryExists();

      console.log("Writing to file:", this.filePath);
      console.log("Data being written:", JSON.stringify(cities, null, 2));

      await writeFile(this.filePath, JSON.stringify(cities, null, 2), 'utf-8');
      console.log("✅ Successfully wrote to file!");
    } catch (error) {
      console.error("❌ Error writing search history:", error);
      throw new Error("Error writing to search history file");
    }
  }

  async getCities(): Promise<City[]> {
    return await this.read();
  }

  async addCity(city: string) {
    try {
      console.log("Saving city to history:", city);

      const cities = await this.getCities();
      console.log("Current history:", cities);

      if (cities.some((c) => c.name.toLowerCase() === city.toLowerCase())) {
        console.log("City already exists in history");
        return;
      }

      const newCity = new City(city);
      cities.push(newCity);

      console.log("Updated history:", cities);
      await this.write(cities);
    } catch (error) {
      console.error("Error adding city to search history:", error);
      throw new Error("Error adding city to search history");
    }
  }

  async removeCity(id: string): Promise<void> {
    try {
      let cities = await this.read();
      const updatedCities = cities.filter((city) => city.id !== id);

      if (cities.length === updatedCities.length) {
        throw new Error('City not found in search history');
      }

      await this.write(updatedCities);
    } catch (error) {
      console.error("Error removing city:", error);
      throw new Error('Error removing city from search history');
    }
  }
}

export default new HistoryService();