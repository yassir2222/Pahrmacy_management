import { Inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly STORAGE_KEY = 'pharmacy-theme';
  private readonly DARK_CLASS = 'dark-theme';
  private readonly LIGHT_CLASS = 'light-theme';

  // Use signal for state management
  private _darkMode = signal(false);
  
  // Theme change event for components to subscribe to
  themeChange$ = new Subject<boolean>();
  
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      // Initialize from localStorage if available
      this.loadSavedTheme();
    }
  }
  
  private loadSavedTheme(): void {
    const savedTheme = localStorage.getItem(this.STORAGE_KEY);
    if (savedTheme) {
      const isDark = savedTheme === 'dark';
      this._darkMode.set(isDark);
      this.applyTheme(isDark);
    } else {
      // Check for OS preference if no saved theme
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this._darkMode.set(prefersDark);
      this.applyTheme(prefersDark);
    }
  }
  
  toggleTheme(): void {
    const newValue = !this._darkMode();
    this._darkMode.set(newValue);
    this.saveTheme(newValue);
    this.applyTheme(newValue);
    this.themeChange$.next(newValue);
  }
  
  setTheme(isDark: boolean): void {
    this._darkMode.set(isDark);
    this.saveTheme(isDark);
    this.applyTheme(isDark);
    this.themeChange$.next(isDark);
  }
  
  get isDarkMode(): boolean {
    return this._darkMode();
  }
  
  private saveTheme(isDark: boolean): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.STORAGE_KEY, isDark ? 'dark' : 'light');
    }
  }
  
  private applyTheme(isDark: boolean): void {
    if (isPlatformBrowser(this.platformId)) {
      const bodyElement = document.body;
      
      if (isDark) {
        bodyElement.classList.add(this.DARK_CLASS);
        bodyElement.classList.remove(this.LIGHT_CLASS);
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        bodyElement.classList.add(this.LIGHT_CLASS);
        bodyElement.classList.remove(this.DARK_CLASS);
        document.documentElement.setAttribute('data-theme', 'light');
      }
    }
  }
}
