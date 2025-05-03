import { Component } from '@angular/core';
import { TopbarComponent } from '../../components/topbar/topbar.component';
import { SideBarComponent } from '../../components/side-bar/side-bar.component';
import { StatCardComponent } from '../../components/stat-card/stat-card.component';
import { RecentSalesComponent } from '../../components/recent-sales/recent-sales.component';
import { RecentAlertsComponent } from '../../components/recent-alerts/recent-alerts.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    TopbarComponent,
    SideBarComponent,
    StatCardComponent,
    RecentSalesComponent,
    RecentAlertsComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent {}
