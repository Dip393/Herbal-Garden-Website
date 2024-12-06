import { Component, inject } from '@angular/core';
import { NavbarComponent } from "../navbar/navbar.component";
import { FormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NotificationService } from '../services/notification.service';
import { AuthService } from '../services/auth.service';
import { NgClass, NgIf } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [NavbarComponent, ReactiveFormsModule, NgIf, NgClass],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loading = false;
  otpSent = false;
  loginForm !: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router, private notification: NotificationService) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      otp: ['']  // OTP field to be filled after the email and password are submitted
    });
  }

  onSubmit() {

    if (!this.otpSent) {
      // First step: verify email and password and send OTP
      if (this.loginForm.invalid) return;

      this.loading = true;
      this.authService.login(this.loginForm.value).subscribe(
        res => {
          if(res.error){
            this.notification.showNotification(`${res.msg}`, 'error');
            this.loading = false;
          }
          else{
            this.loading = false;
            this.otpSent = true;
            this.notification.showNotification(`${res.msg}`, 'success');
          }
        },
        err => {
          this.loading = false;
          this.notification.showNotification(`${err.error.msg}`, 'error');
          alert(err.error.message);
        }
      );
    } else {
      // Second step: verify OTP
      this.loading = true;
      this.authService.verifyLoginOtp(this.loginForm.value).subscribe(
        res => {
          if(res.error){
            this.notification.showNotification(`${res.msg}`, 'error');
            this.loading = false;
            return;
          }
          else{
            this.loading = false;

            // Store email in localStorage
            localStorage.setItem('email', this.loginForm.value.email);

            if (res.isAdmin) {
              localStorage.setItem('token', res.token);
              localStorage.setItem('isAdmin', res.isAdmin.toString());
              this.router.navigate(['/']);
            } else {
              localStorage.setItem('token', res.token);
              this.router.navigate(['/']);
            }

            this.notification.showNotification(`${res.msg}`, 'success');
          }
        },
        err => {
          this.loading = false;
          this.notification.showNotification(`${err.error.msg}`, 'error');
        }
      );
    }
  }
}
