import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> {
    const email = localStorage.getItem('email');
    const isAdmin = localStorage.getItem('isAdmin');
    if(isAdmin){
      return of(true); // Allow access if user type is admin
    }
    this.router.navigate(['/']);
    return of(false); // Allow access if user type is
  }
  //   if (!email) {
  //     this.router.navigate(['']); // Redirect to login if no email is found
  //     return of(false); // Return observable with false
  //   }

  //   return this.authService.userType(email).pipe(
  //     map(response => {
  //       if(response.userType === 'student') {
  //         this.router.navigate(['/user']); // Redirect if not admin
  //         return false;
  //       }
  //       if (response.userType === 'admin') {
  //         return true; // Allow access if user type is admin
  //       }else{
  //         this.router.navigate(['']); // Redirect if not admin
  //         return false; // Deny access if user type is not admin
  //       }
  //     }),
  //     catchError((error) => {
  //       console.error('Error fetching user type:', error);
  //       this.router.navigate(['']); // Redirect if there's an error
  //       return of(false); // Return observable with false on error
  //     })
  //   );
  // }
}
