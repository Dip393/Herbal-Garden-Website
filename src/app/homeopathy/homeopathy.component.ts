import { Component, inject } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { AuthService } from '../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-homeopathy',
  standalone: true,
  imports: [NavbarComponent, FooterComponent, RouterModule, NgIf, NgFor],
  templateUrl: './homeopathy.component.html',
  styleUrls: ['./homeopathy.component.css'],
})
export class HomeopathyComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = localStorage.getItem('email');
  plants: any[] = [];
  page = 0; // Current page
  showLoadMore = true; // Whether to show the "Load More" button
  totalPlants = 0; // Total number of plants

  ngOnInit(): void {
    this.getPlants();
  }
  //Features Array
  features = [
    { icon: 'fa-solid fa-leaf', name: 'Natural Remedies', description: 'Derived from plants, minerals, and natural substances.' },
    { icon: 'fa-solid fa-user-md', name: 'Personalized Care', description: 'Treatment tailored to individual needs and symptoms.' },
    { icon: 'fa-solid fa-flask', name: 'Dilution Process', description: 'Uses highly diluted substances to stimulate healing.' },
    { icon: 'fa-solid fa-heart', name: 'Holistic Approach', description: 'Focuses on treating the whole person, not just symptoms.' },
    { icon: 'fa-solid fa-shield-alt', name: 'Safe for All Ages', description: 'Gentle and suitable for children, pregnant women, and the elderly.' },
    { icon: 'fa-solid fa-sync-alt', name: 'Chronic & Acute Care', description: 'Effective for managing long-term and short-term conditions.' }
  ];

  // Fetch plants by AYUSHType with pagination
  getPlants() {
    this.authService.getPlantByCategory('Homeopathy', this.page).subscribe(
      (res) => {
        // Append new plants to the current list
        this.plants = [...this.plants, ...res.plants];

        // Update total plants and check if "Load More" button is needed
        this.totalPlants = res.total;
        this.showLoadMore = this.plants.length < this.totalPlants;

        console.log('Fetched plants:', this.plants);
      },
      (error) => {
        console.error('Error fetching plants:', error);
      }
    );
  }

  // Load the next set of plants
  loadMorePlants() {
    this.page++;
    this.getPlants();
  }

  // Trim description to a specific length
  trimDescription(description: string, maxLength: number): string {
    return description.length > maxLength ? description.slice(0, maxLength) + '...' : description;
  }

  // Open plant details page by plant ID
  openPlantDetails(plantId: string) {
    if (this.email) {
      this.authService.clickedPlant(plantId, this.email).subscribe(
        () => {
          console.log('Plant clicked.');
        },
        (error) => {
          console.error('Error sending click event:', error);
        }
      );
    }
    this.router.navigate([`/plant-details/${plantId}`]);
  }
}
