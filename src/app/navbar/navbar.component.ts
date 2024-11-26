import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { NotificationService } from '../services/notification.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [NgIf, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  loggedIn = false;
  isAdmin = false;

  constructor(
    private authService: AuthService, 
    public router: Router, 
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.checkLoggedInStatus();
  }

  checkLoggedInStatus() {
    const token = localStorage.getItem('token');
    if (token) {
      this.loggedIn = true;
      this.isAdmin = localStorage.getItem('isAdmin') === 'true';
    } else {
      this.loggedIn = false; // Ensure this sets `loggedIn` to false if no token
    }
  }
  

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
  }

  displayNavMobile(){
    const nav= document.getElementById('navMobile') ;
    if(nav){
      nav.style.display = nav.style.display === "flex"? "none" : "flex";
    }
  }

  closeNav(){
    const nav= document.getElementById('navMobile') ;
    if(nav){
      nav.style.display = "none";
    }
  }
}
