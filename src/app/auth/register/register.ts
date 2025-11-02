import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './register.html',
  styleUrls: ['./register.scss']
})
export class RegisterComponent {
  hidePassword = true;
  hideConfirm = true;

  form: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });
  }

  submit() {
    if (this.form.invalid) return;
    const { email, password, confirmPassword } = this.form.value;
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    this.authService.register(email!, password!).subscribe({
      next: () => {
        alert('Registered successfully');
      },
      error: (err) => {
        alert(err.error.message || 'Registration failed');
      }
    });
  }

  loadUsers(){
    this.authService.getUsers().subscribe({
      next: (res) => { console.log('REs',res) },
      error: (err) => { console.log(err); }
    });
  }
}
