import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule for ngClass, number pipe etc.

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule], // Add CommonModule to imports
  templateUrl: './stat-card.component.html',
  styleUrl: './stat-card.component.css',
})
export class StatCardComponent {
  @Input() title: string = 'Default Title';
  @Input() value: string | number = 0;
  @Input() percentageChange: number = 0;
  @Input() icon: string = 'bx-question-mark'; // Default Boxicon class
  @Input() bgColor: string = '#ffffff'; // Card background - Default white
  @Input() textColor: string = '#1f2937'; // Text color - Default Gray-800
  @Input() iconBgColor: string = '#e0e7ff'; // Icon background - Default Indigo-100
  @Input() iconColor: string = '#4338ca'; // Icon color - Default Indigo-700

  // Helper to get absolute value for display
  absPercentage(value: number): number {
    return Math.abs(value);
  }
}
