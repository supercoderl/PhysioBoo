import { Component, OnDestroy, OnInit, computed, inject, signal } from "@angular/core";
import { BooButtonComponent } from "@physioboo/ui";
import { finalize } from "rxjs";
import { SettingPageComponent } from "../../../../../components/layout/admin/setting/shared/setting-page.component";
import { SettingSectionComponent } from "../../../../../components/layout/admin/setting/shared/setting-section.component";
import { DialogService } from "../../../../../services/common/dialog.service";
import { PreferenceService } from "../../../../../services/common/preference.service";
import { FontSize, ThemeConfig, ThemeConfigService, ThemeMode } from "../../../../../services/common/theme-config.service";
import { ToastService } from "../../../../../services/common/toast.service";
import { SharedModule } from "../../../../../shared/shared-imports";

interface ThemeOption { value: ThemeMode; label: string; icon: string; hint: string; }
interface FontSizeOption { value: FontSize; label: string; size: string; }

const OPTION = 'relative flex items-center gap-3 p-3.5 rounded-xl border text-left transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40';

/**
 * Settings > Theme: colour mode and base text size from ThemeConfigService, saved as user preferences
 * (group `theme`). Picking an option previews it across the app at once; leaving the page without saving puts the
 * saved appearance back, so a preview never outlives the page. The product has a single accent colour, so there is
 * nothing to pick there.
 */
@Component({
  selector: 'admin-system-setting-theme',
  standalone: true,
  imports: [SharedModule, SettingPageComponent, SettingSectionComponent, BooButtonComponent],
  template: `
    <setting-page
      heading="Theme"
      description="Personalize how PhysioBoo looks for your account. Changes preview instantly; save to keep them."
      saveLabel="Save appearance"
      dirtyLabel="You are previewing unsaved appearance changes."
      [loading]="loading()"
      [dirty]="isDirty()"
      [saving]="saving()"
      (save)="onSave()"
      (discard)="onDiscard()"
    >
      <button pageActions type="button" boo-button variant="ghost" size="sm" [disabled]="saving() || isDefault()" (click)="onReset()">
        <physio-icon name="rotate-ccw" [size]="15" aria-hidden="true" />Reset to defaults
      </button>

      <setting-section heading="Color mode" description="Auto follows your device’s light or dark setting.">
        <div class="grid gap-3 sm:grid-cols-3" role="radiogroup" aria-label="Color mode">
          <button
            *ngFor="let opt of themes"
            type="button"
            role="radio"
            [attr.aria-checked]="config().mode === opt.value"
            [class]="optionClass(config().mode === opt.value)"
            [disabled]="saving()"
            (click)="pickMode(opt.value)"
          >
            <span class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
              [class.bg-primary]="config().mode === opt.value" [class.text-white]="config().mode === opt.value"
              [class.bg-gray-100]="config().mode !== opt.value" [class.text-regular]="config().mode !== opt.value" aria-hidden="true">
              <physio-icon [name]="opt.icon" [size]="18" />
            </span>
            <span class="min-w-0">
              <span class="block text-sm font-medium text-regular">{{ opt.label }}</span>
              <span class="block text-xs text-secondary">{{ opt.hint }}</span>
            </span>
            <physio-icon *ngIf="config().mode === opt.value" name="check" [size]="16" class="absolute top-3 right-3 text-primary" aria-hidden="true" />
          </button>
        </div>
      </setting-section>

      <setting-section heading="Text size" description="Scales text and spacing across the app.">
        <div class="grid gap-3 sm:grid-cols-3" role="radiogroup" aria-label="Text size">
          <button
            *ngFor="let f of fontSizes"
            type="button"
            role="radio"
            [attr.aria-checked]="config().fontSize === f.value"
            [class]="optionClass(config().fontSize === f.value) + ' justify-between'"
            [disabled]="saving()"
            (click)="pickFont(f.value)"
          >
            <span class="min-w-0">
              <span class="block text-sm font-medium text-regular">{{ f.label }}</span>
              <span class="block text-xs text-secondary">{{ f.size }} base</span>
            </span>
            <span class="font-semibold text-regular leading-none pr-6" [style.font-size]="f.size" aria-hidden="true">Aa</span>
            <physio-icon *ngIf="config().fontSize === f.value" name="check" [size]="16" class="absolute top-3 right-3 text-primary" aria-hidden="true" />
          </button>
        </div>
      </setting-section>
    </setting-page>
  `
})
export class AdminSystemSettingThemeComponent implements OnInit, OnDestroy {
  private themeSrv = inject(ThemeConfigService);
  private prefSrv = inject(PreferenceService);
  private dialogSrv = inject(DialogService);
  private toastSrv = inject(ToastService);

  readonly loading = signal(true);
  readonly saving = signal(false);

  /** The appearance as last saved; what leaving the page or Discard returns to. */
  private readonly original = signal<ThemeConfig>({ ...this.themeSrv.config() });
  readonly config = this.themeSrv.config;

  readonly isDirty = computed(() => {
    const a = this.original(), b = this.config();
    return a.mode !== b.mode || a.fontSize !== b.fontSize || a.accentColor !== b.accentColor;
  });
  readonly isDefault = computed(() => this.config().mode === 'light' && this.config().fontSize === 'medium');

  readonly themes: ThemeOption[] = [
    { value: 'light', label: 'Light', icon: 'sun', hint: 'Bright background' },
    { value: 'dark', label: 'Dark', icon: 'moon', hint: 'Easier on the eyes at night' },
    { value: 'auto', label: 'Auto', icon: 'monitor', hint: 'Match this device' },
  ];
  readonly fontSizes: FontSizeOption[] = [
    { value: 'small', label: 'Small', size: '14px' },
    { value: 'medium', label: 'Medium', size: '16px' },
    { value: 'large', label: 'Large', size: '18px' },
  ];

  ngOnInit(): void {
    this.prefSrv.loadAll()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.themeSrv.hydrateFromCache();
          this.original.set({ ...this.themeSrv.config() });
        },
        // Keep the appearance already applied at sign-in as the saved state.
        error: () => this.original.set({ ...this.themeSrv.config() })
      });
  }

  ngOnDestroy(): void {
    if (this.isDirty()) this.themeSrv.preview(this.original());
  }

  optionClass(selected: boolean): string {
    return `${OPTION} ${selected ? 'border-primary bg-primary/5' : 'border-borderGray hover:bg-black/[0.02]'}`;
  }

  pickMode(mode: ThemeMode): void { this.themeSrv.preview({ mode }); }
  pickFont(fontSize: FontSize): void { this.themeSrv.preview({ fontSize }); }

  onDiscard(): void {
    this.themeSrv.preview(this.original());
  }

  onSave(): void {
    if (this.saving() || !this.isDirty()) return;
    const next = { ...this.config() };
    this.saving.set(true);
    this.themeSrv.save(next)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.original.set(next);
          this.toastSrv.success('Appearance saved');
        },
        // The preview stays on screen so the save can be retried; the interceptor reports the failure.
        error: () => undefined
      });
  }

  onReset(): void {
    this.dialogSrv.confirm(
      'Light mode and medium text will be applied and saved for your account.',
      () => {
        this.saving.set(true);
        this.themeSrv.reset()
          .pipe(finalize(() => this.saving.set(false)))
          .subscribe({
            next: () => {
              this.original.set({ ...this.config() });
              this.toastSrv.success('Appearance reset to defaults');
            },
            error: () => undefined
          });
      },
      'Reset appearance?',
      'warning',
      'Reset'
    );
  }
}
