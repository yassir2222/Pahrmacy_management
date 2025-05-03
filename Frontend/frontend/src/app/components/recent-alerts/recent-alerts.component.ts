import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Define an interface for the alert structure
export interface Alert {
  id: number;
  type: 'critical' | 'warning' | 'info'; // Add more types as needed
  icon: string; // Boxicon class name (e.g., 'bx-error-circle')
  title: string;
  description: string;
  actionText?: string; // Optional action button text (e.g., 'Commander')
  actionClass?: string; // Optional class for action button (e.g., 'btn-red')
  actionLink?: string; // Optional link for action button
}

@Component({
  selector: 'app-recent-alerts',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './recent-alerts.component.html',
  styleUrl: './recent-alerts.component.css',
})
export class RecentAlertsComponent implements OnInit {
  alerts: Alert[] = [];

  ngOnInit(): void {
    // Sample data - replace with actual data fetching logic
    this.alerts = [
      {
        id: 1,
        type: 'critical',
        icon: 'bx-error-circle',
        title: 'Stock critique',
        description: 'Paracétamol 500mg - Seulement 5 unités restantes',
        actionText: 'Commander',
        actionClass: 'btn-red',
        actionLink: '/stocks/reorder/123', // Example link
      },
      {
        id: 2,
        type: 'warning',
        icon: 'bx-error-alt', // Changed icon for warning
        title: 'Expiration proche',
        description: 'Ibuprofène 400mg - Expire dans 7 jours',
        actionText: 'Vérifier',
        actionClass: 'btn-yellow',
        actionLink: '/stocks/check/456', // Example link
      },
      {
        id: 3,
        type: 'critical',
        icon: 'bx-error-circle',
        title: 'Stock critique',
        description: 'Vitamine C 500mg - Seulement 3 unités restantes',
        actionText: 'Commander',
        actionClass: 'btn-red',
        actionLink: '/stocks/reorder/789', // Example link
      },
    ];
  }

  markAsRead(alertId: number): void {
    console.log(`Marking alert ${alertId} as read`);
    // Add logic to handle marking as read (e.g., remove from list or update status)
    this.alerts = this.alerts.filter((alert) => alert.id !== alertId);
  }

  performAction(alert: Alert): void {
    console.log(`Performing action for alert ${alert.id}: ${alert.actionText}`);
    // Add logic to navigate or perform the action
    // Example: this.router.navigate([alert.actionLink]);
  }

  markAllAsRead(): void {
    console.log('Marking all alerts as read');
    this.alerts = []; // Example: Clear all alerts
  }
}
