import { Component, OnInit } from '@angular/core';
import { TopbarComponent } from '../../components/topbar/topbar.component';
import { SideBarComponent } from '../../components/side-bar/side-bar.component';
import { StatCardComponent } from '../../components/stat-card/stat-card.component';
import { RecentSalesComponent } from '../../components/recent-sales/recent-sales.component';
import { RecentAlertsComponent } from '../../components/recent-alerts/recent-alerts.component';
import { CommonModule } from '@angular/common';
import { DashboardService, DashboardStats } from '../../service/dashboard.service';

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
export class DashboardComponent implements OnInit {
  stats: DashboardStats = {
    totalProducts: 0,
    todaySales: 0,
    activeAlerts: 0,
    expiringThisWeek: 0,
    salesTrend: 0,
    alertsTrend: 0,
    stockTrend: 0,
    expirationsTrend: 0
  };
  
  loading = true;
  error = false;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadDashboardStats();
  }

  loadDashboardStats(): void {
    this.loading = true;
    this.error = false;
    
    this.dashboardService.getDashboardStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des statistiques du dashboard:', err);
        this.loading = false;
        this.error = true;
      }
    });
  }
}
