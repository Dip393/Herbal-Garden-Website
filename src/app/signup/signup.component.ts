import { Component } from '@angular/core';
import { FormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { NotificationService } from '../services/notification.service';
import { ElementRef } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { NgClass, NgIf } from '@angular/common';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [NavbarComponent, NgIf, NgClass, ReactiveFormsModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
  loading = false;
  otpSent = false;
  signupForm!: FormGroup;
  showPasswordRules: boolean = false;

  constructor(
    private fb: FormBuilder, 
    private authService: AuthService, 
    private router: Router,
    private notification: NotificationService,
  ){
    this.signupForm = this.fb.group({
      userName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required, 
        Validators.minLength(8), 
        Validators.maxLength(16),
        Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[#@$!%*?&])[A-Za-z\\d#@$!%*?&].{8,16}$')
      ]],
      confirmPassword: ['', [Validators.required]],
      otp: ['']
    }, { validator: this.passwordMatchValidator });
  }

  // Password match validation
  passwordMatchValidator(formGroup: FormGroup) {
    return formGroup.get('password')?.value === formGroup.get('confirmPassword')?.value ? null : { mismatch: true };
  }

  onSubmit() {
  // Initial signup: If OTP hasn't been sent yet
  if (!this.otpSent) {
    // Check if the signup form is valid
    if (this.signupForm.invalid) return;

    console.log(this.signupForm.value)
    // Set loading to true before API call
    this.loading = true;
    // Call the signup method from the AuthService
    this.authService.signup(this.signupForm.value).subscribe(
      (res) => {
        // Handle errors returned by the server (e.g., user already exists)
        if (res.error) {
          this.loading = false;
          this.notification.showNotification(res.msg, 'error');
          return;
        }

        // OTP sent successfully
        this.loading = false;
        this.otpSent = true;
        this.notification.showNotification(res.msg, 'success');
      },
      (err) => {
        // Handle API errors (e.g., server or network issues)
        this.loading = false;
        this.notification.showNotification(err.error?.msg || 'Signup failed. Please try again.', 'error');
      }
    );
  } else {
    // OTP verification phase
    this.loading = true;

    // Call the verifyOtp method from the AuthService
    this.authService.verifyOtp(this.signupForm.value).subscribe(
      (res) => {
        // OTP verified successfully, navigate to login
        this.loading = false;
        this.router.navigate(['/login']);
        this.notification.showNotification(res.msg, 'success');
      },
      (err) => {
        // Handle OTP verification errors (e.g., invalid OTP)
        this.loading = false;
        this.notification.showNotification(err.error?.msg || 'OTP verification failed. Please try again.', 'error');
      }
    );
  }
}

  // Helper functions to check password validity
  isValidPasswordLength(): boolean {
    const password = this.signupForm.get('password')?.value;
    return password && password.length >= 8 && password.length <= 16;
  }

  containsNumber(): boolean {
    const password = this.signupForm.get('password')?.value;
    return /\d/.test(password);
  }

  containsUpperCase(): boolean {
    const password = this.signupForm.get('password')?.value;
    return /[A-Z]/.test(password);
  }

  containsLowerCase(): boolean {
    const password = this.signupForm.get('password')?.value;
    return /[a-z]/.test(password);
  }

  containsSpecialCharacter(): boolean {
    const password = this.signupForm.get('password')?.value;
    return /[#@$!%*?&]/.test(password);
  }
  
  togglePasswordRules(): boolean {
    return (this.containsLowerCase() && this.containsSpecialCharacter() && this.containsUpperCase() && this.containsNumber());
  }
}
