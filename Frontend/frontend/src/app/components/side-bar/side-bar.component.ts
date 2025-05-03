import { Component, OnInit, ElementRef } from '@angular/core';

@Component({
  selector: 'app-side-bar',
  standalone: true, // Assuming standalone
  imports: [
    /* Add CommonModule if using *ngIf/*ngFor, RouterModule for routerLink */
  ],
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.css'],
})
export class SideBarComponent implements OnInit {
  userProfileImageUrl: string | null = 'assets/images/avatar-placeholder.png'; // Default or null

  constructor(/* Inject services if needed */) {}

  ngOnInit(): void {
    // Initialization logic can go here if necessary
    // Removed sidebar toggle logic
  }

  // Removed menuBtnChange method
}
