import { NgFor, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-siddha',
  standalone: true,
  imports: [NavbarComponent, FooterComponent, NgFor, NgIf],
  templateUrl: './siddha.component.html',
  styleUrl: './siddha.component.css'
})
export class SiddhaComponent {
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
    {
      icon: 'fa-solid fa-leaf',
      name: 'Herbal Remedies',
      description: 'Uses a variety of herbs and plants for natural healing.'
    },
    {
      icon: 'fa-solid fa-gem',
      name: 'Mineral Medicine',
      description: 'Incorporates minerals and metals in unique formulations.'
    },
    {
      icon: 'fa-solid fa-spa',
      name: 'Spiritual Practices',
      description: 'Focuses on yoga, meditation, and spiritual alignment for healing.'
    },
    {
      icon: 'fa-solid fa-balance-scale',
      name: 'Humoral Balance',
      description: 'Maintains equilibrium between the three humors (Vatham, Pitham, Kapham).'
    },
    {
      icon: 'fa-solid fa-seedling',
      name: 'Holistic Wellness',
      description: 'Promotes a harmonious balance of body, mind, and spirit.'
    },
    {
      icon: 'fa-solid fa-clock',
      name: 'Longevity Science',
      description: 'Aims to enhance lifespan and overall vitality.'
    }
  ];

  goToSection(section: string) {
    this.router.navigate(['/siddha']).then(() => {
      const gallerySection = document.getElementById(section);
      if (gallerySection) {
        gallerySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  // Fetch plants by AYUSHType with pagination
  getPlants() {
    this.authService.getPlantByCategory('Yoga & Naturopathy', this.page).subscribe(
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
