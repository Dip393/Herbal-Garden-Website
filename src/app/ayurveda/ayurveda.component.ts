import { NgFor, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-ayurveda',
  standalone: true,
  imports: [NgIf, NgFor, NavbarComponent, FooterComponent],
  templateUrl: './ayurveda.component.html',
  styleUrl: './ayurveda.component.css'
})
export class AyurvedaComponent {
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
      icon: 'fa-solid fa-seedling',
      name: 'Natural Ingredients',
      description: 'Utilizes herbs, roots, and other natural substances for healing.'
    },
    {
      icon: 'fa-solid fa-hand-holding-heart',
      name: 'Personalized Treatment',
      description: 'Focuses on customized care based on an individual’s dosha (body constitution).'
    },
    {
      icon: 'fa-solid fa-spa',
      name: 'Therapeutic Practices',
      description: 'Incorporates massage, detoxification, yoga, and meditation for holistic healing.'
    },
    {
      icon: 'fa-solid fa-leaf',
      name: 'Holistic Wellness',
      description: 'Balances mind, body, and spirit to achieve optimal health.'
    },
    {
      icon: 'fa-solid fa-user-shield',
      name: 'Preventive Care',
      description: 'Emphasizes prevention through lifestyle, diet, and natural remedies.'
    },
    {
      icon: 'fa-solid fa-clock',
      name: 'Ancient Wisdom',
      description: 'Backed by over 5,000 years of time-tested practices.'
    }
  ];


  // Fetch plants by AYUSHType with pagination
  getPlants() {
    this.authService.getPlantByCategory('Ayurveda', this.page).subscribe(
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
  goToSection(section: string) {
    // Navigate to the home component and scroll to the #about section
    this.router.navigate(['ayurveda'], { fragment: `${section}` });
    if (this.router.url === '/ayurveda') {
      const gallerySection = document.getElementById(section);
      if (gallerySection) {
        gallerySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      this.router.navigate(['/ayurveda']).then(() => {
        const gallerySection = document.getElementById(section);
        if (gallerySection) {
          gallerySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }
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
