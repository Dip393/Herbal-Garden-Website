import { Component } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { HttpClient } from '@angular/common/http';
import { Chart } from 'chart.js';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [FooterComponent],
  templateUrl: './user.component.html',
  styleUrl: './user.component.css'
})
export class UserComponent {
  location = 'Kolkata, West Bengal, India'; // Default location
  latitude = '';
  longitude = '';
  weather = {
    temperature: 0,
    condition: 'Unknown',
    windSpeed: 0,
    windDirection: 0,
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // Prompt user for location access
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          this.fetchWeather(lat, lon);
        },
        (error) => {
          console.warn('Geolocation permission denied or unavailable:', error);
          this.fetchWeather(22.5726, 88.3639); // Fallback to Kolkata's coordinates
        }
      );
    } else {
      console.warn('Geolocation not supported by the browser.');
      this.fetchWeather(22.5726, 88.3639); // Fallback to Kolkata
    }
    this.fetchWeatherData();
  }

  fetchWeatherData(): void {
    const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=22.5726&longitude=88.3639&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`;

    this.http.get<any>(apiUrl).subscribe((data) => {
      const labels = data.daily.time;
      const maxTemp = data.daily.temperature_2m_max;
      const minTemp = data.daily.temperature_2m_min;

      this.renderChart(labels, maxTemp, minTemp);
    });
  }
  renderChart(labels: string[], maxTemp: number[], minTemp: number[]): void {
    new Chart('weatherChart', {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Max Temperature',
            data: maxTemp,
            borderColor: 'red',
            fill: false,
          },
          {
            label: 'Min Temperature',
            data: minTemp,
            borderColor: 'blue',
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          x: { title: { display: true, text: 'Days' } },
          y: { title: { display: true, text: 'Temperature (°C)' } },
        },
      },
    });
  }

  fetchWeather(lat: number, lon: number): void {
    const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
    // const apiUrl = '';

    this.http.get<any>(apiUrl).subscribe({
      next: (data) => {
        this.weather.temperature = data.current_weather.temperature;
        this.weather.condition = this.mapWeatherCode(data.current_weather.weathercode);
        this.weather.windSpeed = data.current_weather.windspeed;
        this.weather.windDirection = data.current_weather.winddirection;
        this.latitude = `${lat.toFixed(4)}`;
        this.longitude = `${lon.toFixed(4)}`
      },
      error: (err) => {
        console.error('Error fetching weather data:', err);
      },
    });
  }

  // Map weather codes to human-readable descriptions
  private mapWeatherCode(code: number): string {
    const weatherConditions: { [key: number]: string } = {
      0: 'Clear sky',
      1: 'Mainly clear',
      2: 'Partly cloudy',
      3: 'Overcast',
      45: 'Fog',
      48: 'Depositing rime fog',
      51: 'Drizzle: Light',
      53: 'Drizzle: Moderate',
      55: 'Drizzle: Dense intensity',
      61: 'Rain: Slight',
      63: 'Rain: Moderate',
      65: 'Rain: Heavy intensity',
      71: 'Snow fall: Slight',
      73: 'Snow fall: Moderate',
      75: 'Snow fall: Heavy intensity',
      80: 'Rain showers: Slight',
      81: 'Rain showers: Moderate',
      82: 'Rain showers: Violent',
      95: 'Thunderstorm: Slight or moderate',
      96: 'Thunderstorm: Slight hail',
      99: 'Thunderstorm: Heavy hail',
    };

    return weatherConditions[code] || 'Unknown';
  }
}
