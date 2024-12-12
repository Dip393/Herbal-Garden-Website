import { NgFor, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-naturopathy',
  standalone: true,
  imports: [NavbarComponent, FooterComponent, NgIf, NgFor],
  templateUrl: './naturopathy.component.html',
  styleUrl: './naturopathy.component.css'
})
export class NaturopathyComponent {
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
      icon: 'fa-solid fa-person-dots-from-line',
      name: 'Mind-Body Connection',
      description: 'Strengthens mental and physical harmony through yoga postures and breathing exercises.'
    },
    {
      icon: 'fa-solid fa-tree',
      name: 'Natural Healing',
      description: 'Uses therapies like hydrotherapy, mud therapy, and fasting for detoxification.'
    },
    {
      icon: 'fa-solid fa-dumbbell',
      name: 'Fitness & Flexibility',
      description: 'Enhances physical fitness, flexibility, and inner strength through yoga.'
    },
    {
      icon: 'fa-solid fa-seedling',
      name: 'Drug-Free Lifestyle',
      description: 'Emphasizes natural remedies and a non-invasive approach to health.'
    },
    {
      icon: 'fa-solid fa-heart',
      name: 'Holistic Wellness',
      description: 'Combines physical, emotional, and spiritual well-being for a balanced life.'
    },
    {
      icon: 'fa-solid fa-mountain',
      name: 'Stress Relief',
      description: 'Promotes relaxation and stress management through meditation and mindfulness practices.'
    }
  ];



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
  goToSection(section: string) {
    this.router.navigate(['/naturopathy']).then(() => {
      const gallerySection = document.getElementById(section);
      if (gallerySection) {
        gallerySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }
}
