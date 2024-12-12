import { NgFor, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-unani',
  standalone: true,
  imports: [NavbarComponent, FooterComponent, NgFor, NgIf],
  templateUrl: './unani.component.html',
  styleUrl: './unani.component.css'
})
export class UnaniComponent {
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
      name: 'Natural Remedies',
      description: 'Relies on herbs, minerals, and animal-based products for treatment.'
    },
    {
      icon: 'fa-solid fa-hand-holding-heart',
      name: 'Humoral Balance',
      description: 'Focuses on balancing the four humors for optimal health.'
    },
    {
      icon: 'fa-solid fa-seedling',
      name: 'Herbal Formulations',
      description: 'Uses time-tested herbal preparations to treat ailments.'
    },
    {
      icon: 'fa-solid fa-user-nurse',
      name: 'Preventive Care',
      description: 'Emphasizes a healthy lifestyle and diet to prevent diseases.'
    },
    {
      icon: 'fa-solid fa-people-arrows',
      name: 'Personalized Treatment',
      description: 'Offers customized therapies based on individual temperaments (Mizaj).'
    },
    {
      icon: 'fa-solid fa-water',
      name: 'Detoxification Therapies',
      description: 'Incorporates techniques like cupping (Hijama), leech therapy, and purging.'
    }
  ];
  goToSection(section: string) {
    this.router.navigate(['/unani']).then(() => {
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
