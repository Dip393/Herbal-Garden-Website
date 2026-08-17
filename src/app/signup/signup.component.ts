import { Component } from '@angular/core';
import {
  FormBuilder,
  Validators,
  FormGroup,
  ReactiveFormsModule
} from '@angular/forms';

import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { NotificationService } from '../services/notification.service';

import { NavbarComponent } from '../navbar/navbar.component';
import { NgClass, NgIf } from '@angular/common';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    NavbarComponent,
    NgIf,
    NgClass,
    ReactiveFormsModule
  ],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {

  loading = false;

  signupForm!: FormGroup;

  showPasswordRules = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private notification: NotificationService
  ) {

    this.signupForm = this.fb.group({

      userName: [
        '',
        [Validators.required]
      ],

      email: [
        '',
        [
          Validators.required,
          Validators.email
        ]
      ],

      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(16),
          Validators.pattern(
            '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[#@$!%*?&])[A-Za-z\\d#@$!%*?&].{8,16}$'
          )
        ]
      ],

      confirmPassword: [
        '',
        [Validators.required]
      ]

    }, {
      validators: this.passwordMatchValidator
    });
  }


  // Password match validation
  passwordMatchValidator(
    formGroup: FormGroup
  ) {

    return formGroup.get('password')?.value ===
      formGroup.get('confirmPassword')?.value

      ? null
      : { mismatch: true };
  }


  onSubmit() {

    if (this.signupForm.invalid) {

      this.signupForm.markAllAsTouched();

      return;
    }

    this.loading = true;

    const signupData = {
      userName: this.signupForm.value.userName,
      email: this.signupForm.value.email,
      password: this.signupForm.value.password
    };

    console.log(
      'Signup data:',
      signupData
    );

    this.authService.signup(signupData).subscribe({

      next: (res) => {

        this.loading = false;

        console.log(
          'Signup response:',
          res
        );

        if (res.error) {

          this.notification.showNotification(
            res.msg || 'Signup failed',
            'error'
          );

          return;
        }

        this.notification.showNotification(
          res.msg || 'Account created successfully',
          'success'
        );

        // Go to login page
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 800);
      },

      error: (err) => {

        console.error(
          'Signup error:',
          err
        );

        this.loading = false;

        const message =
          err?.error?.msg ||
          err?.error?.message ||
          'Signup failed. Please try again.';

        this.notification.showNotification(
          message,
          'error'
        );
      }
    });
  }


  // Password helpers

  isValidPasswordLength(): boolean {

    const password =
      this.signupForm.get('password')?.value;

    return !!password &&
      password.length >= 8 &&
      password.length <= 16;
  }


  containsNumber(): boolean {

    const password =
      this.signupForm.get('password')?.value || '';

    return /\d/.test(password);
  }


  containsUpperCase(): boolean {

    const password =
      this.signupForm.get('password')?.value || '';

    return /[A-Z]/.test(password);
  }


  containsLowerCase(): boolean {

    const password =
      this.signupForm.get('password')?.value || '';

    return /[a-z]/.test(password);
  }


  containsSpecialCharacter(): boolean {

    const password =
      this.signupForm.get('password')?.value || '';

    return /[#@$!%*?&]/.test(password);
  }


  togglePasswordRules(): boolean {

    return (
      this.containsLowerCase() &&
      this.containsSpecialCharacter() &&
      this.containsUpperCase() &&
      this.containsNumber()
    );
  }
}