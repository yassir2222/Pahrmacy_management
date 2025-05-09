import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputSwitchModule } from 'primeng/inputswitch';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../../service/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule, InputSwitchModule, FormsModule],
  template: `
    <div class="theme-toggle">
      <i class="bx bx-sun light-icon"></i>
      <p-inputSwitch [(ngModel)]="darkMode" (onChange)="toggleTheme()"></p-inputSwitch>
      <i class="bx bx-moon dark-icon"></i>
    </div>
  `,
  styles: [`
    .theme-toggle {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .light-icon {
      color: var(--warning-500);
    }
    
    .dark-icon {
      color: var(--primary-500);
    }
  `]
})
export class ThemeToggleComponent {
  private themeService = inject(ThemeService);
  darkMode = this.themeService.isDarkMode;

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}