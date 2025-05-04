import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { TabViewModule } from 'primeng/tabview';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { DividerModule } from 'primeng/divider';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import {
  ParametreService,
  UserProfile,
  AppPreferences,
  AlertSettings,
} from '../../service/parametre.service';

@Component({
  selector: 'app-parametre',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    TabViewModule,
    InputTextModule,
    PasswordModule,
    DropdownModule,
    CheckboxModule,
    InputSwitchModule,
    InputNumberModule,
    ButtonModule,
    ToastModule,
    DividerModule,
    ProgressSpinnerModule,
  ],
  providers: [MessageService],
  templateUrl: './parametre.component.html',
  styles: [
    `
      :host ::ng-deep .p-card {
        margin-bottom: 1rem;
      }
      :host ::ng-deep .p-inputtext,
      :host ::ng-deep .p-dropdown,
      :host ::ng-deep .p-inputnumber {
        width: 100%;
      }
      :host ::ng-deep .form-field {
        margin-bottom: 1.5rem;
      }
      .label-text {
        font-weight: 500;
        margin-bottom: 0.5rem;
        display: block;
      }
      .settings-card {
        margin-bottom: 2rem;
      }
      .profile-header {
        display: flex;
        align-items: center;
        margin-bottom: 1.5rem;
      }
      .profile-avatar {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        object-fit: cover;
        margin-right: 1rem;
      }
      .profile-info {
        flex: 1;
      }
      .profile-name {
        font-size: 1.5rem;
        font-weight: 600;
        margin: 0;
      }
      .profile-email {
        color: #6c757d;
        margin: 0;
      }
    `,
  ],
})
export class ParametreComponent implements OnInit {
  // Formulaires réactifs
  profileForm!: FormGroup;
  preferencesForm!: FormGroup;
  alertSettingsForm!: FormGroup;

  // Options pour les dropdowns
  langueOptions = [
    { label: 'Français', value: 'fr' },
    { label: 'English', value: 'en' },
  ];

  // État de chargement
  loading: boolean = false;

  // Paramètres actuels
  currentProfile: UserProfile | null = null;
  currentPreferences: AppPreferences | null = null;
  currentAlertSettings: AlertSettings | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private parametreService: ParametreService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.loadParametres();
  }

  /**
   * Initialise les formulaires réactifs
   */
  initForms(): void {
    // Formulaire de profil
    this.profileForm = this.formBuilder.group({
      id: [null],
      nom: ['', [Validators.required, Validators.minLength(2)]],
      prenom: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.minLength(6)]],
    });

    // Formulaire de préférences
    this.preferencesForm = this.formBuilder.group({
      theme: [false], // false = light, true = dark
      langue: ['fr', Validators.required],
      notifications: [true],
    });

    // Formulaire de paramètres d'alerte
    this.alertSettingsForm = this.formBuilder.group({
      stockMinimumDefaut: [10, [Validators.required, Validators.min(1)]],
      joursAvantExpiration: [30, [Validators.required, Validators.min(1)]],
    });
  }

  /**
   * Charge les paramètres actuels depuis le service
   */
  loadParametres(): void {
    this.loading = true;

    this.parametreService.getParametresUtilisateur().subscribe({
      next: (parametres) => {
        // Mettre à jour les paramètres actuels
        this.currentProfile = parametres.profile;
        this.currentPreferences = parametres.preferences;
        this.currentAlertSettings = parametres.alertSettings;

        // Mettre à jour les formulaires
        this.updateForms();

        this.loading = false;
      },
      error: (err) => {
        this.handleError(err, 'Erreur lors du chargement des paramètres');
        this.loading = false;
      },
    });
  }

  /**
   * Met à jour les formulaires avec les données chargées
   */
  updateForms(): void {
    if (this.currentProfile) {
      this.profileForm.patchValue({
        id: this.currentProfile.id,
        nom: this.currentProfile.nom,
        prenom: this.currentProfile.prenom,
        email: this.currentProfile.email,
        password: '', // On ne charge jamais le mot de passe
      });
    }

    if (this.currentPreferences) {
      this.preferencesForm.patchValue({
        theme: this.currentPreferences.theme === 'dark', // Convertir en boolean pour inputSwitch
        langue: this.currentPreferences.langue,
        notifications: this.currentPreferences.notifications,
      });
    }

    if (this.currentAlertSettings) {
      this.alertSettingsForm.patchValue({
        stockMinimumDefaut: this.currentAlertSettings.stockMinimumDefaut,
        joursAvantExpiration: this.currentAlertSettings.joursAvantExpiration,
      });
    }
  }

  /**
   * Enregistre le profil utilisateur
   */
  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Veuillez corriger les champs du formulaire',
        life: 3000,
      });
      return;
    }

    this.loading = true;

    const profileData: UserProfile = {
      ...this.profileForm.value,
    };

    // Si le mot de passe est vide, on ne l'envoie pas
    if (!profileData.password) {
      delete profileData.password;
    }

    this.parametreService.updateProfile(profileData).subscribe({
      next: (response) => {
        this.currentProfile = response;
        this.loading = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Profil mis à jour avec succès',
          life: 3000,
        });
      },
      error: (err) => {
        this.handleError(err, 'Erreur lors de la mise à jour du profil');
        this.loading = false;
      },
    });
  }

  /**
   * Enregistre les préférences de l'application
   */
  savePreferences(): void {
    if (this.preferencesForm.invalid) {
      this.preferencesForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    const formValue = this.preferencesForm.value;

    // Convertir le boolean en string pour le thème
    const preferencesData: AppPreferences = {
      theme: formValue.theme ? 'dark' : 'light',
      langue: formValue.langue,
      notifications: formValue.notifications,
    };

    this.parametreService.updatePreferences(preferencesData).subscribe({
      next: (response) => {
        this.currentPreferences = response;
        this.loading = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Préférences mises à jour avec succès',
          life: 3000,
        });
      },
      error: (err) => {
        this.handleError(err, 'Erreur lors de la mise à jour des préférences');
        this.loading = false;
      },
    });
  }

  /**
   * Enregistre les paramètres d'alerte
   */
  saveAlertSettings(): void {
    if (this.alertSettingsForm.invalid) {
      this.alertSettingsForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    const alertSettingsData: AlertSettings = {
      ...this.alertSettingsForm.value,
    };

    this.parametreService.updateAlertSettings(alertSettingsData).subscribe({
      next: (response) => {
        this.currentAlertSettings = response;
        this.loading = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: "Paramètres d'alerte mis à jour avec succès",
          life: 3000,
        });
      },
      error: (err) => {
        this.handleError(
          err,
          "Erreur lors de la mise à jour des paramètres d'alerte"
        );
        this.loading = false;
      },
    });
  }

  /**
   * Réinitialise les formulaires aux valeurs actuelles
   */
  resetForms(): void {
    this.updateForms();
    this.messageService.add({
      severity: 'info',
      summary: 'Réinitialisation',
      detail: 'Les formulaires ont été réinitialisés',
      life: 3000,
    });
  }

  /**
   * Gestion des erreurs
   */
  handleError(error: any, message: string): void {
    console.error(error);
    this.messageService.add({
      severity: 'error',
      summary: 'Erreur',
      detail: message,
      life: 5000,
    });
  }
}
