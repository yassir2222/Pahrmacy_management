import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.css'],
})
export class TopbarComponent implements OnInit {
  // User data
  userName: string = 'Dr. Sophie Martin'; // Keep for potential tooltips/dropdowns
  userProfileImageUrl: string | null = 'assets/images/avatar-placeholder.png'; // Placeholder

  constructor() {}

  ngOnInit(): void {
    // Fetch user data if needed
  }

  onProfileClick(): void {
    console.log('Profile clicked');
    // Implement profile dropdown menu logic
  }

  onSearch(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value;
    console.log('Search term:', searchTerm);
    // Implement search logic
  }

  onNotificationClick(): void {
    console.log('Notification icon clicked');
    // Implement notification panel logic
  }

  // Added handler for help icon
  onHelpClick(): void {
    console.log('Help icon clicked');
    // Implement help/support logic (e.g., open modal, navigate to help page)
  }
}
