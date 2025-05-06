import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms'; 
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule, 
    CommonModule,
    ToastModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    CardModule
  ],
  providers: [MessageService],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginObj = {
    username: '',
    password: ''
  };
  
  isLoading = false;
  returnUrl: string = '/app/dashboard';
  
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);
  
  ngOnInit() {
    // Get return URL from route parameters or default to dashboard
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/app/dashboard';
    
    // If already logged in, redirect
    if (this.authService.isAuthenticated) {
      this.router.navigate([this.returnUrl]);
    }
  }
  
  onLogin() {
    this.isLoading = true;
    
    if (!this.loginObj.username || !this.loginObj.password) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Veuillez remplir tous les champs'
      });
      this.isLoading = false;
      return;
    }
    
    this.authService.login(this.loginObj).subscribe({
      next: (user) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: `Bienvenue ${user.username}`
        });
        
        // Redirection immédiate sans délai
        this.router.navigate([this.returnUrl]);
        
        // Mettre à jour l'état de chargement
        this.isLoading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: error.message || 'Identifiants incorrects'
        });
        this.isLoading = false;
      }
    });
  }
}
