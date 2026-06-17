import { Component, OnInit, inject, signal } from "@angular/core";
import { finalize } from "rxjs";
import { BooIconComponent } from "../../../../../components/icon/boo-icon/boo-icon.component";
import { PreferenceService } from "../../../../../services/common/preference.service";
import { AccentColor, FontSize, ThemeConfig, ThemeConfigService, ThemeMode } from "../../../../../services/common/theme-config.service";
import { ToastService } from "../../../../../services/common/toast.service";
import { SharedModule } from "../../../../../shared/shared-imports";

interface ThemeOption { value: ThemeMode; label: string; icon: string; }
interface FontSizeOption { value: FontSize; label: string; size: string; }
interface AccentOption { value: AccentColor; color: string; name: string; }

@Component({
    selector: 'admin-system-setting-theme',
    standalone: true,
    imports: [SharedModule, BooIconComponent],
    host: { class: 'block h-full min-h-0 overflow-y-auto' },
    template: `
    <main class="flex-1 py-4">
      <div class="max-w-4xl mx-auto">
        <header class="flex items-start justify-between mb-2">
          <div>
            <h1 class="text-2xl font-semibold text-gray-900">Appearance</h1>
            <p class="text-sm text-gray-500 mt-1">Personalize how PhysioBoo looks for your account.</p>
          </div>
          <button type="button" (click)="onReset()" [disabled]="loading() || saving()"
            class="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50">
            Reset to defaults
          </button>
        </header>

        <section class="bg-surface rounded-lg border border-gray-200 mb-6">
          <div class="p-6 pb-3 border-b border-gray-100">
            <h2 class="text-base font-semibold text-gray-900 mb-1">Theme</h2>
            <p class="text-sm text-gray-500 m-0">Choose how the interface looks. Auto follows your operating system.</p>
          </div>
          <div class="p-6 pt-3 grid grid-cols-3 gap-3">
            <button *ngFor="let opt of themes" type="button"
              (click)="pickMode(opt.value)"
              [class.border-primary]="config().mode === opt.value"
              [class.bg-primary]="config().mode === opt.value"
              [class.text-white]="config().mode === opt.value"
              [class.border-gray-200]="config().mode !== opt.value"
              [class.text-gray-700]="config().mode !== opt.value"
              class="relative flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all hover:border-gray-300">
              <boo-icon [name]="opt.icon" [size]="24" [color]="config().mode === opt.value ? 'white' : 'black'" />
              <span class="text-sm font-medium">{{ opt.label }}</span>
              <span *ngIf="config().mode === opt.value"
                class="absolute top-2 right-2 w-2 h-2 bg-white rounded-full"></span>
            </button>
          </div>
        </section>

        <section class="bg-surface rounded-lg border border-gray-200 mb-6">
          <div class="p-6 pb-3 border-b border-gray-100">
            <h2 class="text-base font-semibold text-gray-900 mb-1">Accent color</h2>
            <p class="text-sm text-gray-500 m-0">Highlights, buttons, and links use this color.</p>
          </div>
          <div class="p-6 pt-3 grid grid-cols-6 gap-3">
            <button *ngFor="let c of accentColors" type="button"
              (click)="pickAccent(c.value)"
              [style.background-color]="hexFor(c.value)"
              [class.ring-2]="config().accentColor === c.value"
              [class.ring-offset-2]="config().accentColor === c.value"
              [class.ring-gray-900]="config().accentColor === c.value"
              class="relative aspect-square rounded-lg transition-transform hover:scale-105"
              [title]="c.name">
              <span *ngIf="config().accentColor === c.value"
                class="absolute inset-0 flex items-center justify-center">
                <span class="w-3 h-3 bg-surface rounded-full"></span>
              </span>
            </button>
          </div>
        </section>

        <section class="bg-surface rounded-lg border border-gray-200">
          <div class="p-6 pb-3 border-b border-gray-100">
            <h2 class="text-base font-semibold text-gray-900 mb-1">Font size</h2>
            <p class="text-sm text-gray-500 m-0">Adjust the base font size used across the app.</p>
          </div>
          <div class="p-6 pt-3 space-y-2">
            <label *ngFor="let f of fontSizes"
              [class.border-primary]="config().fontSize === f.value"
              [class.bg-primary]="config().fontSize === f.value"
              [class.text-white]="config().fontSize === f.value"
              [class.border-gray-200]="config().fontSize !== f.value"
              class="flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all hover:border-gray-300">
              <span class="flex items-center gap-3">
                <input type="radio" name="fontSize" [value]="f.value"
                  [checked]="config().fontSize === f.value"
                  (change)="pickFont(f.value)"
                  class="w-4 h-4 accent-primary" />
                <span>
                  <span class="block font-medium"
                    [class.text-white]="config().fontSize === f.value"
                    [class.text-gray-900]="config().fontSize !== f.value">{{ f.label }}</span>
                  <span class="block text-sm"
                    [class.text-white]="config().fontSize === f.value"
                    [class.text-gray-500]="config().fontSize !== f.value">{{ f.size }}</span>
                </span>
              </span>
              <span [style.fontSize]="f.size"
                [class.text-white]="config().fontSize === f.value"
                [class.text-gray-600]="config().fontSize !== f.value">Aa</span>
            </label>
          </div>
        </section>

        <footer class="mt-6 flex justify-end gap-2">
          <button type="button" (click)="onCancel()" [disabled]="saving() || !isDirty()"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50">
            Discard changes
          </button>
          <button type="button" (click)="onSave()" [disabled]="saving() || !isDirty()"
            class="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50">
            <boo-icon *ngIf="saving()" name="loader-circle" iconClass="w-4 h-4 animate-spin" />
            <span>{{ saving() ? 'Saving…' : 'Save preferences' }}</span>
          </button>
        </footer>
      </div>
    </main>
    `
})
export class AdminSystemSettingThemeComponent implements OnInit {
    private themeSrv = inject(ThemeConfigService);
    private prefSrv = inject(PreferenceService);
    private toastSrv = inject(ToastService);

    loading = signal(false);
    saving = signal(false);

    private original = signal<ThemeConfig>({ mode: 'light', fontSize: 'medium', accentColor: 'blue' });
    config = this.themeSrv.config;

    themes: ThemeOption[] = [
        { value: 'light', label: 'Light', icon: 'sun' },
        { value: 'dark', label: 'Dark', icon: 'moon' },
        { value: 'auto', label: 'Auto', icon: 'monitor' },
    ];
    fontSizes: FontSizeOption[] = [
        { value: 'small', label: 'Small', size: '14px' },
        { value: 'medium', label: 'Medium', size: '16px' },
        { value: 'large', label: 'Large', size: '18px' },
    ];
    accentColors: AccentOption[] = [
        { value: 'blue', color: '#1565C0', name: 'Blue' },
        { value: 'green', color: '#16A34A', name: 'Green' },
        { value: 'purple', color: '#9333EA', name: 'Purple' },
        { value: 'orange', color: '#EA580C', name: 'Orange' },
        { value: 'red', color: '#DC2626', name: 'Red' },
        { value: 'pink', color: '#DB2777', name: 'Pink' },
    ];

    ngOnInit(): void {
        this.loading.set(true);
        this.prefSrv.loadAll()
            .pipe(finalize(() => this.loading.set(false)))
            .subscribe({
                next: () => {
                    this.themeSrv.hydrateFromCache();
                    this.original.set({ ...this.themeSrv.config() });
                },
                error: () => this.toastSrv.error('Failed to load preferences')
            });
    }

    pickMode(mode: ThemeMode) { this.themeSrv.preview({ mode }); }
    pickFont(fontSize: FontSize) { this.themeSrv.preview({ fontSize }); }
    pickAccent(accentColor: AccentColor) { this.themeSrv.preview({ accentColor }); }

    isDirty(): boolean {
        const a = this.original(), b = this.config();
        return a.mode !== b.mode || a.fontSize !== b.fontSize || a.accentColor !== b.accentColor;
    }

    onCancel(): void {
        this.themeSrv.preview(this.original());
    }

    onSave(): void {
        if (this.saving()) return;
        this.saving.set(true);
        this.themeSrv.save(this.config())
            .pipe(finalize(() => this.saving.set(false)))
            .subscribe({
                next: () => {
                    this.original.set({ ...this.config() });
                    this.toastSrv.success('Preferences saved');
                },
                error: () => this.toastSrv.error('Failed to save preferences')
            });
    }

    onReset(): void {
        if (!confirm('Reset appearance to defaults?')) return;
        this.saving.set(true);
        this.themeSrv.reset()
            .pipe(finalize(() => this.saving.set(false)))
            .subscribe({
                next: () => {
                    this.original.set({ ...this.config() });
                    this.toastSrv.success('Preferences reset to defaults');
                },
                error: () => this.toastSrv.error('Failed to reset preferences')
            });
    }

    hexFor(c: AccentColor): string {
        return this.accentColors.find(x => x.value === c)?.color ?? '#1565C0';
    }
}
