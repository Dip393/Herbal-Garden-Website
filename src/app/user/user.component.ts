import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { HttpClient } from '@angular/common/http';
import { Chart } from 'chart.js';
import { AuthService } from '../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { NgFor,NgIf } from '@angular/common';
import { FormsModule, NgModel, ReactiveFormsModule } from '@angular/forms';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [FooterComponent,NgFor, NgIf,FormsModule, RouterLink],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
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
  loggedIn = false;
  isAdmin = false;

  //Get user email from localstorage
  email = localStorage.getItem('email');

  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private router = inject(Router);
  private notification = inject(NotificationService);

  //To store last viewed plants in an array
  lastViewedPlants: any[] = [];
  notes: any[] = [];
  editingNoteId: string | null = null; // Tracks the note being edited

  mostViewedPlant: any = null;

  quizUrl ='https://forms.gle/wforenaBHbgBaGxF6';


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
    this.getViewedPlants();
    this.getSavedNotes();
    this.getMostViewedPlant();
  }
  //Logout User
  logout() {
    const email = localStorage.getItem('email');
    if (email) {

      this.authService.logout(email).subscribe(
        (res) => {
          // Clear localStorage and update component state
          localStorage.clear();
          this.loggedIn = false;
          this.isAdmin = false;

          // Navigate back to the login page
          this.router.navigate(['/login']);
          this.notification.showNotification(`${res.msg}`,'success');  // Show success message
        },
        (err) => {
          this.notification.showNotification(`${err.error.msg}`,'error');
        }
      );
    }
  }
  goToSection(section: string) {
    // Navigate to the home component and scroll to the #about section
    this.router.navigate([''], { fragment: `${section}` });
    if (this.router.url === '/') {
      const gallerySection = document.getElementById(section);
      if (gallerySection) {
        gallerySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      this.router.navigate(['/']).then(() => {
        const gallerySection = document.getElementById(section);
        if (gallerySection) {
          gallerySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }
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
  // Scroll the slider in the desired direction
  scrollSlider(direction: string): void {
    const slider = document.querySelector('.slider-wrapper') as HTMLElement;
    const scrollAmount = 300; // Amount to scroll per click

    if (direction === 'next') {
      slider.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    } else if (direction === 'prev') {
      slider.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
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
  //Implementation of accessing last five viewed plants
  getViewedPlants(){
    if(this.email){
      this.authService.getLastFiveAccessedPlants(this.email).subscribe(
        res => {
          this.lastViewedPlants = res;
        },
        err => {
          console.log(err);
        }
      );
    }
  }
  // Method to trim description to a specific length
  trimDescription(description: string, maxLength: number): string {
    return description.length > maxLength ? description.slice(0, maxLength) + '...' : description;
  }
  // Method to open plant details page by plant ID
  openPlantDetails(plantId: string) {
    if(this.email){
      this.authService.clickedPlant(plantId, this.email).subscribe(
        res => {
          console.log('Plant clicked:');
        },
        error =>{
          console.error('Error sending click event:', error);
        }
      );
    }
    this.router.navigate([`/plant-details/${plantId}`]);
  }
  //To fetch saved notes from server
  getSavedNotes(){
    if(this.email){
      this.authService.getNotes(this.email).subscribe(
        res => {
          this.notes = res;
        },
        err => {
          console.log(err);
        }
      );
    }
  }
  //To delete any notes
  deleteNote(noteId: string){
    if(this.email){
      this.authService.deleteNote(noteId, this.email).subscribe(
        res => {
          console.log('Note deleted:', res);
          this.getSavedNotes();
        },
        err => {
          console.log(err);
        }
      );
    }
  }
  enableEdit(noteId: string): void {
    this.editingNoteId = noteId; // Set the ID of the note being edited
  }

  cancelEdit(): void {
    this.editingNoteId = null; // Exit edit mode without saving
  }
  saveEdit(note: any): void {
    if (note.content.trim() && this.email) {
        // Send the correct payload
        this.authService.editNote(note._id, note.content.trim(), this.email).subscribe(
            (res) => {
                this.getSavedNotes(); // Refresh the notes list
                this.editingNoteId = null; // Exit edit mode
            },
            (err) => {
                console.error('Error updating note:', err);
            }
        );
    } else {
        alert('Note content cannot be empty!');
    }
  }
  //To get the most viewed plant
  getMostViewedPlant(){
    this.authService.getMostViewedPlant().subscribe(
      res => {
        this.mostViewedPlant = res;
      },
      err => {
        console.error('Error fetching most viewed plant:', err);
      }
    )
  }
}
