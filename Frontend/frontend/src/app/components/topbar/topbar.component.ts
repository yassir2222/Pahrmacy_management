import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AlertesService, AlerteItem } from '../../service/alertes.service';
import { PanelModule } from 'primeng/panel';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';
import { AdvancedSearchComponent } from '../advanced-search/advanced-search.component';

@Component({
  selector: 'app-topbar',
  standalone: true,  imports: [
    CommonModule,
    RouterModule,
    OverlayPanelModule,
    BadgeModule,
    ButtonModule,
    CardModule,
    TagModule,
    DividerModule,
    ToastModule,
    PanelModule,
    ThemeToggleComponent,
    AdvancedSearchComponent,
  ],
  providers: [MessageService],
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.css'],
})
export class TopbarComponent implements OnInit {
  // User data
  userName: string = 'Dr. Sophie Martin'; // Keep for potential tooltips/dropdowns
  userProfileImageUrl: string | null = 'assets/images/avatar-placeholder.png'; // Placeholder

  // Référence à l'overlay panel des notifications
  @ViewChild('notificationPanel') notificationPanel: any;

  // Référence à l'overlay panel d'aide
  @ViewChild('helpPanel') helpPanel: any;

  // Alertes
  alertes: AlerteItem[] = [];
  alertesChargees: boolean = false;

  // Sections d'aide
  helpSections = [
    {
      title: 'Dashboard',
      icon: 'pi pi-chart-bar',
      content:
        "Accédez à une vue d'ensemble de votre activité - visualisez les tendances de vente, les produits populaires et les indicateurs clés de performance.",
    },
    {
      title: 'Notifications',
      icon: 'pi pi-bell',
      content:
        "Restez informé sur les ruptures de stock, les stocks bas et les lots de médicaments qui approchent de leur date d'expiration.",
    },
    {
      title: 'Ventes',
      icon: 'pi pi-shopping-cart',
      content:
        "Enregistrez de nouvelles ventes, consultez l'historique des transactions et générez des factures pour vos clients.",
    },
    {
      title: 'Stock',
      icon: 'pi pi-box',
      content:
        'Gérez votre inventaire, ajoutez des nouveaux produits, mettez à jour les quantités et suivez les lots de médicaments.',
    },
    {
      title: 'Paramètres',
      icon: 'pi pi-cog',
      content:
        "Personnalisez l'application selon vos préférences, gérez votre profil et configurez les seuils d'alerte pour la gestion des stocks.",
    },
  ];

  constructor(
    private alertesService: AlertesService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    // Charger les alertes au démarrage pour afficher le bon compteur
    this.chargerAlertes();
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

  /**
   * Gère le clic sur l'icône de notification
   * @param event L'événement de clic
   */
  onNotificationClick(event: Event): void {
    // Si les alertes n'ont pas été chargées, les charger
    if (!this.alertesChargees) {
      this.chargerAlertes();
    }

    // Afficher le panel des notifications
    this.notificationPanel.toggle(event);
  }

  /**
   * Gère le clic sur l'icône d'aide
   * @param event L'événement de clic
   */
  onHelpClick(event: Event): void {
    // Afficher le panel d'aide
    this.helpPanel.toggle(event);
  }

  /**
   * Ouvre la boîte de dialogue pour contacter le support
   */
  contacterSupport(): void {
    // En situation réelle, cela pourrait ouvrir un formulaire ou rediriger vers une page
    this.messageService.add({
      severity: 'info',
      summary: 'Support technique',
      detail:
        'Formulaire de contact ouvert. Un technicien vous contactera prochainement.',
      life: 3000,
    });

    // Fermer le panel d'aide
    this.helpPanel.hide();
  }

  /**
   * Charge les alertes depuis le service
   */
  chargerAlertes(): void {
    this.alertesService.getAlertesActives().subscribe({
      next: (alertes) => {
        this.alertes = alertes;
        this.alertesChargees = true;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des alertes', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger les alertes',
          life: 3000,
        });
      },
    });
  }

  /**
   * Marque une alerte comme lue et la retire de la liste
   * @param alerteId Identifiant de l'alerte à marquer comme lue
   * @param event Événement à arrêter pour éviter la propagation
   */
  marquerCommeLue(alerteId: number, event: Event): void {
    event.stopPropagation(); // Éviter de fermer le panel ou de naviguer

    this.alertesService.marquerCommeLue(alerteId).subscribe({
      next: () => {
        // Retirer l'alerte de la liste locale
        this.alertes = this.alertes.filter((a) => a.id !== alerteId);

        this.messageService.add({
          severity: 'success',
          summary: 'Alerte traitée',
          detail: "L'alerte a été marquée comme lue",
          life: 2000,
        });
      },
      error: (err) => {
        console.error("Erreur lors du marquage de l'alerte comme lue", err);
      },
    });
  }

  /**
   * Marque toutes les alertes comme lues
   */
  marquerToutesCommeLues(): void {
    this.alertesService.marquerToutesCommeLues().subscribe({
      next: () => {
        // Vider la liste locale des alertes
        this.alertes = [];

        this.messageService.add({
          severity: 'success',
          summary: 'Alertes traitées',
          detail: 'Toutes les alertes ont été marquées comme lues',
          life: 2000,
        });

        // Fermer le panel
        this.notificationPanel.hide();
      },
      error: (err) => {
        console.error(
          'Erreur lors du marquage de toutes les alertes comme lues',
          err
        );
      },
    });
  }

  /**
   * Retourne la classe CSS pour le badge d'alerte selon le type
   * @param type Type d'alerte
   * @returns Classe CSS correspondante
   */
  getBadgeClass(severity: string): string {
    switch (severity) {
      case 'danger':
        return 'p-badge-danger';
      case 'warning':
        return 'p-badge-warning';
      case 'info':
        return 'p-badge-info';
      default:
        return 'p-badge-info';
    }
  }

  /**
   * Détermine l'icône à afficher selon le type d'alerte
   * @param type Type d'alerte
   * @returns Classe CSS de l'icône
   */
  getIconClass(type: string): string {
    switch (type) {
      case 'rupture':
        return 'pi pi-exclamation-circle';
      case 'seuil':
        return 'pi pi-arrow-down';
      case 'expiration':
        return 'pi pi-calendar-times';
      default:
        return 'pi pi-info-circle';
    }
  }

  /**
   * Formate le texte de la valeur selon le type d'alerte
   * @param alerte L'alerte à formatter
   * @returns Texte formatté
   */
  formatValue(alerte: AlerteItem): string {
    switch (alerte.type) {
      case 'rupture':
        return 'Stock épuisé';
      case 'seuil':
        return `${alerte.valeur} unités restantes`;
      case 'expiration':
        return `Expire dans ${alerte.valeur} jour${
          alerte.valeur > 1 ? 's' : ''
        }`;
      default:
        return `${alerte.valeur}`;
    }
  }
}
