import { Component } from '@angular/core';
import { MenubarModule } from 'primeng/menubar';
import { CommonModule } from '@angular/common';
import { RippleModule } from 'primeng/ripple';
import { BadgeModule } from 'primeng/badge';
import { InputTextModule } from 'primeng/inputtext';
import { AvatarModule } from 'primeng/avatar';
import { MenuItem } from 'primeng/api';
import { SideBarComponent } from '../../components/side-bar/side-bar.component';
@Component({
  selector: 'app-dashboard',
  imports: [MenubarModule,CommonModule,
    MenubarModule,
    RippleModule,
    BadgeModule,
    InputTextModule,
    AvatarModule,
    SideBarComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  items: MenuItem[] = [
    {
      label: 'Home',
      icon: 'pi pi-home',
      badge: '3',
      items: [
        { label: 'Sub Item 1', shortcut: 'Ctrl+S' },
        { label: 'Sub Item 2' }
      ]
    },
    {
      label: 'Settings',
      icon: 'pi pi-cog',
      
      command: () => {
        // Optional: Add navigation or logic
        console.log('Settings clicked');
      }
    },
    {
      label: 'Dashboard',
      icon: 'pi pi-chart-bar',
      routerLink: ['/dashboard'] // Example navigation
    }
  ];
}
