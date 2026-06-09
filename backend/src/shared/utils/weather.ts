import axios from 'axios';

export interface WeatherData {
  temperature: number;
  humidity: number;
}

export async function fetchWeather(lat: number, lng: number): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m`;
  const res = await axios.get(url);
  return {
    temperature: res.data.current.temperature_2m,
    humidity: res.data.current.relative_humidity_2m,
  };
}
