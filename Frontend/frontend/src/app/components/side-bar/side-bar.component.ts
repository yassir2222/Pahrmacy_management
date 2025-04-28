import { Component, ViewChild } from '@angular/core';
import { SidebarModule } from 'primeng/sidebar';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { AvatarModule } from 'primeng/avatar';
import { StyleClassModule } from 'primeng/styleclass';
import { Sidebar } from 'primeng/sidebar';
@Component({
  selector: 'app-side-bar',
  imports: [SidebarModule, ButtonModule, RippleModule, AvatarModule, StyleClassModule],
  standalone: true,
  templateUrl: './side-bar.component.html',
  styleUrl: './side-bar.component.css'
})
export class SideBarComponent {
    // Boolean flag to control the sidebar visibility
    sidebarVisible: boolean = false;

    // You can add methods here if needed, e.g., for navigation logic
    onLinkClick() {
      console.log('Sidebar link clicked!');
      // Potentially close the sidebar after clicking a link
      // this.sidebarVisible = false;
    }
  
}
