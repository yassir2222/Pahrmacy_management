import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms'; 
import { Router } from '@angular/router'; // Import Router
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule], 
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginObj : any = {
    username: '',
    password: '',
    role: 'ROLE_USER'
  }
  http = inject(HttpClient);
  router = inject(Router); 
  onLogin() {
    debugger;
    this.http.post('http://localhost:8083/api/auth/login', this.loginObj).subscribe((res:any) => {
      if (res) {
        console.log(res);
        localStorage.setItem('token', res.token);
       this.router.navigateByUrl('dashboard');
      }
    });
  }

}
