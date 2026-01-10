import { Component } from "@angular/core";
import { SharedModule } from "../../../../../shared/shared-imports";

interface ThemeOption {
    value: string;
    label: string;
    icon: string;
}

interface FontSize {
    value: string;
    label: string;
    size: string;
}

interface AccentColor {
    value: string;
    color: string;
    name: string;
}

@Component({
    selector: 'admin-system-setting-theme',
    standalone: true,
    imports: [
        SharedModule
    ],
    template: `
    <main class="flex-1 p-8">
          <div class="max-w-4xl">
            <h1 class="text-2xl font-semibold text-gray-900 mb-8">Appearance</h1>

            <!-- Theme Mode Section -->
            <div class="bg-white rounded-lg border border-gray-200 mb-6">
              <div class="p-6 border-b border-gray-200">
                <h2 class="text-base font-semibold text-gray-900 mb-1">Theme</h2>
                <p class="text-sm text-gray-600">
                  Choose how the interface looks to you. Select a theme or sync with your system.
                </p>
              </div>
              <div class="p-6">
                <div class="grid grid-cols-3 gap-4">
                  <button
                    *ngFor="let themeOption of themes"
                    (click)="theme = themeOption.value"
                    [class.border-blue-500]="theme === themeOption.value"
                    [class.bg-blue-50]="theme === themeOption.value"
                    [class.border-gray-200]="theme !== themeOption.value"
                    class="relative p-4 rounded-lg border-2 transition-all hover:border-gray-300"
                  >
                    <div class="flex flex-col items-center gap-2">
                      <svg 
                        class="w-6 h-6"
                        [class.text-blue-600]="theme === themeOption.value"
                        [class.text-gray-600]="theme !== themeOption.value"
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                        [innerHTML]="themeOption.icon"
                      ></svg>
                      <span 
                        class="text-sm font-medium"
                        [class.text-blue-900]="theme === themeOption.value"
                        [class.text-gray-700]="theme !== themeOption.value"
                      >
                        {{ themeOption.label }}
                      </span>
                    </div>
                    <div 
                      *ngIf="theme === themeOption.value"
                      class="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full"
                    ></div>
                  </button>
                </div>
              </div>
            </div>

            <!-- Accent Color Section -->
            <div class="bg-white rounded-lg border border-gray-200 mb-6">
              <div class="p-6 border-b border-gray-200">
                <h2 class="text-base font-semibold text-gray-900 mb-1">Accent color</h2>
                <p class="text-sm text-gray-600">
                  Choose your accent color to personalize your experience.
                </p>
              </div>
              <div class="p-6">
                <div class="grid grid-cols-6 gap-3">
                  <button
                    *ngFor="let color of accentColors"
                    (click)="accentColor = color.value"
                    [class]="color.color"
                    [class.ring-2]="accentColor === color.value"
                    [class.ring-offset-2]="accentColor === color.value"
                    [class.ring-gray-900]="accentColor === color.value"
                    class="relative aspect-square rounded-lg transition-transform hover:scale-110"
                    [title]="color.name"
                  >
                    <div 
                      *ngIf="accentColor === color.value"
                      class="absolute inset-0 flex items-center justify-center"
                    >
                      <div class="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <!-- Font Size Section -->
            <div class="bg-white rounded-lg border border-gray-200">
              <div class="p-6 border-b border-gray-200">
                <h2 class="text-base font-semibold text-gray-900 mb-1">Font size</h2>
                <p class="text-sm text-gray-600">
                  Adjust the font size throughout the application.
                </p>
              </div>
              <div class="p-6">
                <div class="space-y-3">
                  <label
                    *ngFor="let size of fontSizes"
                    [class.border-blue-500]="fontSize === size.value"
                    [class.bg-blue-50]="fontSize === size.value"
                    [class.border-gray-200]="fontSize !== size.value"
                    class="flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all hover:border-gray-300"
                  >
                    <div class="flex items-center gap-3">
                      <input
                        type="radio"
                        name="fontSize"
                        [value]="size.value"
                        [(ngModel)]="fontSize"
                        class="w-4 h-4 text-blue-600"
                      />
                      <div>
                        <div 
                          class="font-medium"
                          [class.text-blue-900]="fontSize === size.value"
                          [class.text-gray-900]="fontSize !== size.value"
                        >
                          {{ size.label }}
                        </div>
                        <div class="text-sm text-gray-500">{{ size.size }}</div>
                      </div>
                    </div>
                    <div [style.fontSize]="size.size" class="text-gray-600">
                      Aa
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <!-- Save Button -->
            <div class="mt-6 flex justify-end">
              <button 
                (click)="savePreferences()"
                class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md transition-colors"
              >
                Save preferences
              </button>
            </div>
          </div>
        </main>
    `
})

export class AdminSystemSettingThemeComponent {
    theme = 'light';
    fontSize = 'medium';
    accentColor = 'blue';

    themes: ThemeOption[] = [
        {
            value: 'light',
            label: 'Light',
            icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />'
        },
        {
            value: 'dark',
            label: 'Dark',
            icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />'
        },
        {
            value: 'auto',
            label: 'Auto',
            icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />'
        }
    ];

    fontSizes: FontSize[] = [
        { value: 'small', label: 'Small', size: '14px' },
        { value: 'medium', label: 'Medium', size: '16px' },
        { value: 'large', label: 'Large', size: '18px' }
    ];

    accentColors: AccentColor[] = [
        { value: 'blue', color: 'bg-blue-500', name: 'Blue' },
        { value: 'green', color: 'bg-green-500', name: 'Green' },
        { value: 'purple', color: 'bg-purple-500', name: 'Purple' },
        { value: 'orange', color: 'bg-orange-500', name: 'Orange' },
        { value: 'red', color: 'bg-red-500', name: 'Red' },
        { value: 'pink', color: 'bg-pink-500', name: 'Pink' }
    ];

    savePreferences(): void {
        console.log('Preferences saved:', {
            theme: this.theme,
            fontSize: this.fontSize,
            accentColor: this.accentColor
        });
        // Add your save logic here (e.g., call a service to save to backend)
        alert('Preferences saved successfully!');
    }
}