import { Component } from '@angular/core';
import { NavbarComponent } from "../navbar/navbar.component";
import {
  FormBuilder,
  Validators,
  FormGroup,
  ReactiveFormsModule
} from '@angular/forms';
import { Router } from '@angular/router';
import { NotificationService } from '../services/notification.service';
import { AuthService } from '../services/auth.service';
import { NgClass, NgIf, NgFor } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    NavbarComponent,
    ReactiveFormsModule,
    NgIf,
    NgClass,
    NgFor
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  loading = false;
  loginForm!: FormGroup;
  userName: string = '';

  roles = [
    { value: 'student', name: 'User' },
    { value: 'admin', name: 'Admin' }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private notification: NotificationService
  ) {

    this.loginForm = this.fb.group({
      email: ['', [
        Validators.required,
        Validators.email
      ]],

      password: ['', [
        Validators.required,
        Validators.minLength(8)
      ]],

      userType: ['', [
        Validators.required
      ]]
    });
  }

  onSubmit() {

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    const loginData = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password,
      userType: this.loginForm.value.userType
    };

    this.authService.login(loginData).subscribe({

      next: (res) => {

        this.loading = false;

        console.log('Login response:', res);

        if (res.error) {

          this.notification.showNotification(
            res.msg || 'Login failed',
            'error'
          );

          return;
        }

        // Save login information
        localStorage.setItem(
          'email',
          loginData.email
        );

        localStorage.setItem(
          'token',
          res.token
        );

        localStorage.setItem(
          'isAdmin',
          res.isAdmin ? 'true' : 'false'
        );

        // Get username
        this.authService.getUserName(loginData.email).subscribe({

          next: (userRes) => {

            this.userName = userRes.name;

            localStorage.setItem(
              'userName',
              this.userName
            );

            this.router.navigate(['/']);
          },

          error: (err) => {

            console.error(
              'Username fetch error:',
              err
            );

            // Even if username fetch fails,
            // login itself was successful.
            this.router.navigate(['/']);
          }
        });

        this.notification.showNotification(
          res.msg || 'Login successful',
          'success'
        );
      },

      error: (err) => {

        console.error(
          'Login error:',
          err
        );

        this.loading = false;

        const message =
          err?.error?.msg ||
          err?.error?.message ||
          'Login failed. Please try again.';

        this.notification.showNotification(
          message,
          'error'
        );
      }
    });
  }
}