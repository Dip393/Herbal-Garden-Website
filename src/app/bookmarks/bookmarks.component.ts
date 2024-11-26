import { Component, inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { NgFor, NgIf } from '@angular/common';
import { NavbarComponent } from "../navbar/navbar.component";
import { FooterComponent } from '../footer/footer.component';
import { Router, RouterLink, RouterModule } from '@angular/router';

@Component({
  selector: 'app-bookmarks',
  standalone: true,
  imports: [NgFor, NgIf, NavbarComponent, FooterComponent, RouterModule],
  templateUrl: './bookmarks.component.html',
  styleUrl: './bookmarks.component.css'
})
export class BookmarksComponent {
  bookmarkedPlants: any[] = []; // Array to hold bookmarked plant details
  loading: boolean = true; // For the spinner during loading
  error: string | null = null; // To handle any error messages

  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    this.fetchBookmarkedPlants();
  }
  fetchBookmarkedPlants(): void {
    const email = localStorage.getItem('email'); // Retrieve the logged-in user's email
    if (!email) {
      this.error = 'You need to log in to view bookmarks!';
      this.loading = false;
      return;
    }

    this.authService.getBookmarkedPlants(email).subscribe(
      (response) => {
        this.bookmarkedPlants = response; // Store bookmarked plant details
        this.loading = false;
      },
      (err) => {
        console.error('Error fetching bookmarked plants:', err);
        this.error = 'Failed to load bookmarks. Please try again later.';
        this.loading = false;
      }
    );
  }
  loadPlantDetails(plantId: string): void {
    this.authService.loadPlantDetails(plantId).subscribe(
      (res) => {
        console.log('Plant details:', res); // Optional: You can use this if additional details are needed
      },
      (err) => {
        console.error('Error fetching plant details:', err);
      }
    );
  }
  removeBookmark(plantId: string): void {
    const email = localStorage.getItem('email'); // Retrieve the logged-in user's email
    if(email){
      this.authService.deleteBookmark(plantId,email).subscribe(
        (res) => {
          this.fetchBookmarkedPlants(); // Refresh the bookmarks list
        },
        (err) => {
          console.error('Error removing bookmark:', err);
        }
      )
    }
  }
  openPlantDetails(plantId: string) {
    this.router.navigate([`/plant-details/${plantId}`]);
  }
}
