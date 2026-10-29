import { DatePipe, NgFor, NgIf } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, ElementRef, HostListener, OnInit, ViewChild, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
    BooButtonComponent,
    BooCheckboxComponent,
    BooErrorStateComponent,
    BooEmptyStateComponent,
    BooIconComponent,
    BooInputComponent,
    BooStatusBadgeComponent,
} from '@physioboo/ui';
import { finalize } from 'rxjs/operators';
import { BooTextareaComponent } from '../../../../components/textarea/boo-textarea/boo-textarea.component';
import { HomeBannerService } from '../../../../services/admin/home-banner.service';
import { HomeFeatureService } from '../../../../services/admin/home-feature.service';
import { HomeSettingsService } from '../../../../services/admin/home-settings.service';
import { HomeTestimonialService } from '../../../../services/admin/home-testimonial.service';
import { AuthService } from '../../../../services/auth/auth.service';
import { DialogService } from '../../../../services/common/dialog.service';
import { ToastService } from '../../../../services/common/toast.service';
import { Permissions } from '../../../../shared/constants/permission.constant';
import { Banner, SaveBannerRequest } from '../../../../shared/types/banner.types';
import { Feature, SaveFeatureRequest } from '../../../../shared/types/feature.types';
import { HomeSettings } from '../../../../shared/types/home-settings.types';
import { SaveTestimonialRequest, Testimonial } from '../../../../shared/types/testimonial.types';
import { HasUnsavedChanges } from '../../pharmacy/stock-take/stock-take-counting.guard';
import { HomeBannerEditDrawerComponent } from './banner-edit-drawer.component';
import { HomeFeatureEditDrawerComponent } from './feature-edit-drawer.component';
import { HomeConfigSectionComponent } from './home-config-section.component';
import { HomeCollection, LIMITS, LoadState, activeSummary } from './home-config.utils';
import { HomeTestimonialEditDrawerComponent } from './testimonial-edit-drawer.component';

type SaveState = 'idle' | 'saving' | 'saved' | 'failed';
type ListKind = 'banner' | 'feature';

interface NavItem {
    id: string;
    label: string;
    meta: string;
    attention: boolean;
}

/**
 * Home page setup: the site details form (GET/PUT /api/home-settings) and the hero banner, feature and testimonial
 * lists (api/home-banners, api/home-features, api/home-testimonials). Site details are saved together with one
 * button; list changes (visibility, order, edits, deletes) are saved as they are made.
 * Reading needs cms:home-settings:read (the route guard); every change needs cms:home-settings:update.
 */
@Component({
    selector: 'admin-home-configuration',
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        DatePipe,
        ReactiveFormsModule,
        BooButtonComponent,
        BooCheckboxComponent,
        BooEmptyStateComponent,
        BooErrorStateComponent,
        BooIconComponent,
        BooInputComponent,
        BooStatusBadgeComponent,
        BooTextareaComponent,
        HomeConfigSectionComponent,
        HomeBannerEditDrawerComponent,
        HomeFeatureEditDrawerComponent,
        HomeTestimonialEditDrawerComponent,
    ],
    templateUrl: './home-configuration.component.html',
    host: { class: 'flex flex-1 min-h-0 min-w-0 flex-col' },
})
export class AdminHomeConfigurationComponent implements OnInit, HasUnsavedChanges {
    // #region Inputs, Outputs, Properties
    private readonly fb = inject(FormBuilder);
    private readonly settingsSrv = inject(HomeSettingsService);
    private readonly bannerSrv = inject(HomeBannerService);
    private readonly featureSrv = inject(HomeFeatureService);
    private readonly testimonialSrv = inject(HomeTestimonialService);
    private readonly authSrv = inject(AuthService);
    private readonly dialogSrv = inject(DialogService);
    private readonly toastSrv = inject(ToastService);
    private readonly destroyRef = inject(DestroyRef);
    private readonly host: HTMLElement = inject(ElementRef).nativeElement;

    @ViewChild(HomeBannerEditDrawerComponent) private bannerDrawer?: HomeBannerEditDrawerComponent;
    @ViewChild(HomeFeatureEditDrawerComponent) private featureDrawer?: HomeFeatureEditDrawerComponent;
    @ViewChild(HomeTestimonialEditDrawerComponent) private testimonialDrawer?: HomeTestimonialEditDrawerComponent;

    readonly max = LIMITS;
    readonly stars = [1, 2, 3, 4, 5];

    // Site details
    readonly form = this.fb.group({
        hospitalName: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(LIMITS.hospitalName)]),
        tagLine: this.fb.nonNullable.control('', Validators.maxLength(LIMITS.tagLine)),
        welcomeMessage: this.fb.nonNullable.control('', Validators.maxLength(LIMITS.welcomeMessage)),
        contactPhone: this.fb.nonNullable.control('', Validators.maxLength(LIMITS.contactPhone)),
        contactEmail: this.fb.nonNullable.control('', [Validators.email, Validators.maxLength(LIMITS.contactEmail)]),
        address: this.fb.nonNullable.control('', Validators.maxLength(LIMITS.address)),
        showEmergencyBanner: this.fb.nonNullable.control(false),
    });
    settingsState: LoadState = 'loading';
    /** What the server last returned, so "Discard changes" can go back to it. */
    private saved: HomeSettings | null = null;
    saveState: SaveState = 'idle';
    savedAt: Date | null = null;

    // Lists
    readonly banners = new HomeCollection<Banner, SaveBannerRequest>({
        search: r => this.bannerSrv.search(r),
        update: (id, body) => this.bannerSrv.update(id, body),
        remove: id => this.bannerSrv.delete(id),
        sort: '+order',
        toggleBody: (_, active) => ({ active }),
        orderBody: (_, order) => ({ order }),
        orderOf: b => b.order,
    }, this.destroyRef);

    readonly features = new HomeCollection<Feature, SaveFeatureRequest>({
        search: r => this.featureSrv.search(r),
        update: (id, body) => this.featureSrv.update(id, body),
        remove: id => this.featureSrv.delete(id),
        sort: '+order',
        toggleBody: (_, active) => ({ active }),
        orderBody: (_, order) => ({ order }),
        orderOf: f => f.order,
    }, this.destroyRef);

    /** Testimonials have no manual order; the server sorts them by date. */
    readonly testimonials = new HomeCollection<Testimonial, SaveTestimonialRequest>({
        search: r => this.testimonialSrv.search(r),
        update: (id, body) => this.testimonialSrv.update(id, body),
        remove: id => this.testimonialSrv.delete(id),
        sort: '-date',
        // The update endpoint always writes the date (and would clear it if left out), so send the whole record.
        toggleBody: (t, active) => ({ patientName: t.patientName, rating: t.rating, comment: t.comment ?? '', date: t.date, active }),
    }, this.destroyRef);

    canUpdate = false;
    /** Screen-reader note for changes that happen without a page change, e.g. a reorder. */
    announcement = '';

    bannerOpen = false;
    editingBanner: Banner | null = null;
    featureOpen = false;
    editingFeature: Feature | null = null;
    testimonialOpen = false;
    editingTestimonial: Testimonial | null = null;
    // #endregion

    // #region Init (Lifecycle + Setup)
    ngOnInit(): void {
        this.authSrv.permissions$
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(perms => this.applyPermissions(perms ?? []));

        this.loadSettings();
        this.banners.load();
        this.features.load();
        this.testimonials.load();
    }
    // #endregion

    // #region Getters
    get configured(): boolean {
        return !!this.saved?.hospitalName;
    }

    get dirty(): boolean {
        return this.canUpdate && this.settingsState === 'ready' && this.form.dirty;
    }

    get saving(): boolean {
        return this.saveState === 'saving';
    }

    get anyDrawerOpen(): boolean {
        return this.bannerOpen || this.featureOpen || this.testimonialOpen;
    }

    get nav(): NavItem[] {
        return [
            { id: 'hc-site', label: 'Site details', meta: this.dirty ? 'Unsaved' : (this.settingsState === 'ready' && !this.configured ? 'Not set up' : ''), attention: this.dirty || (this.settingsState === 'ready' && !this.configured) },
            { id: 'hc-banners', label: 'Hero banners', meta: this.countOf(this.banners), attention: false },
            { id: 'hc-features', label: 'Features', meta: this.countOf(this.features), attention: false },
            { id: 'hc-testimonials', label: 'Testimonials', meta: this.countOf(this.testimonials), attention: false },
        ];
    }

    get bannerSummary(): string {
        return activeSummary(this.banners.activeCount, this.banners.items.length, 'banner', 'banners');
    }

    get featureSummary(): string {
        return activeSummary(this.features.activeCount, this.features.items.length, 'feature', 'features');
    }

    get testimonialSummary(): string {
        return activeSummary(this.testimonials.activeCount, this.testimonials.items.length, 'testimonial', 'testimonials');
    }
    // #endregion

    // #region Methods
    // Leaving the page
    hasUnsavedChanges(): boolean {
        return this.dirty
            || !!this.bannerDrawer?.dirty
            || !!this.featureDrawer?.dirty
            || !!this.testimonialDrawer?.dirty;
    }

    confirmLeave(): Promise<boolean> {
        return new Promise(resolve => {
            this.dialogSrv.confirm(
                'You have changes on this page that haven’t been saved. Leave and lose them?',
                () => resolve(true),
                'Unsaved changes',
                'warning',
                'Leave without saving',
                'Keep editing',
                () => resolve(false),
            );
        });
    }

    @HostListener('window:beforeunload', ['$event'])
    onBeforeUnload(event: BeforeUnloadEvent): void {
        if (this.hasUnsavedChanges()) event.preventDefault();
    }

    /** Ctrl/Cmd+S saves the site details while no drawer is open. */
    @HostListener('document:keydown', ['$event'])
    onKeydown(event: KeyboardEvent): void {
        if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== 's' || this.anyDrawerOpen) return;
        event.preventDefault();
        if (this.dirty) this.saveSettings();
    }

    // Navigation
    goTo(id: string): void {
        const el = this.host.querySelector<HTMLElement>(`#${id}`);
        if (!el) return;
        const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
        el.focus({ preventScroll: true });
    }

    /** Reloads the lists, and the site details too unless they hold unsaved edits. */
    refreshAll(): void {
        if (!this.dirty) this.loadSettings();
        this.banners.load();
        this.features.load();
        this.testimonials.load();
    }

    // Site details
    loadSettings(): void {
        if (!this.saved) this.settingsState = 'loading';
        this.settingsSrv.get()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: res => {
                    if (!res?.success) {
                        if (!this.saved) this.settingsState = 'failed';
                        return;
                    }
                    this.applySaved(res.data);
                    this.settingsState = 'ready';
                },
                error: (err: HttpErrorResponse) => {
                    // Keep a loaded form on screen when only a refresh failed; the global toast says so.
                    if (this.saved) return;
                    this.settingsState = err?.status === 403 ? 'forbidden' : 'failed';
                },
            });
    }

    saveSettings(): void {
        if (!this.canUpdate || this.saving || this.settingsState !== 'ready') return;
        this.form.markAllAsTouched();
        if (this.form.invalid) {
            setTimeout(() => this.host.querySelector<HTMLElement>('#hc-site [aria-invalid="true"]')?.focus());
            return;
        }

        const v = this.form.getRawValue();
        const body: HomeSettings = {
            hospitalName: v.hospitalName.trim(),
            tagLine: v.tagLine.trim() || null,
            welcomeMessage: v.welcomeMessage.trim() || null,
            contactPhone: v.contactPhone.trim() || null,
            contactEmail: v.contactEmail.trim() || null,
            address: v.address.trim() || null,
            showEmergencyBanner: v.showEmergencyBanner,
        };
        const firstSave = !this.configured;

        this.saveState = 'saving';
        this.settingsSrv.update(body)
            .pipe(
                finalize(() => { if (this.saveState === 'saving') this.saveState = 'failed'; }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe({
                next: res => {
                    if (!res?.success) {
                        this.saveState = 'failed';
                        return;
                    }
                    // The response is the stored settings; fall back to what was sent if it is missing.
                    this.applySaved(res.data ?? body);
                    this.saveState = 'saved';
                    this.savedAt = new Date();
                    this.toastSrv.success(firstSave ? 'The home page is set up.' : 'Your changes are saved.', 'Site details saved');
                },
                // The global HTTP error toast gives the reason; the form keeps every value entered.
                error: () => this.saveState = 'failed',
            });
    }

    discardSettings(): void {
        if (!this.dirty || this.saving) return;
        this.dialogSrv.confirm(
            'Put the site details back to how they were last saved?',
            () => {
                this.applySaved(this.saved);
                this.saveState = 'idle';
            },
            'Discard changes',
            'warning',
            'Discard changes',
            'Keep editing',
        );
    }

    // Lists
    toggleBanner(b: Banner): void {
        if (!this.canUpdate) return;
        this.banners.toggle(b, active => this.toastSrv.success(b.title, active ? 'Banner activated' : 'Banner deactivated'));
    }

    toggleFeature(f: Feature): void {
        if (!this.canUpdate) return;
        this.features.toggle(f, active => this.toastSrv.success(f.title, active ? 'Feature activated' : 'Feature deactivated'));
    }

    toggleTestimonial(t: Testimonial): void {
        if (!this.canUpdate) return;
        this.testimonials.toggle(t, active => this.toastSrv.success(t.patientName, active ? 'Testimonial activated' : 'Testimonial deactivated'));
    }

    moveBanner(b: Banner, delta: -1 | 1): void {
        if (!this.canUpdate) return;
        this.refocusAfterMove('banner', b.id, delta, this.banners.move(b, delta, () => this.announceMove('banner', b.id, b.title)));
    }

    moveFeature(f: Feature, delta: -1 | 1): void {
        if (!this.canUpdate) return;
        this.refocusAfterMove('feature', f.id, delta, this.features.move(f, delta, () => this.announceMove('feature', f.id, f.title)));
    }

    confirmDeleteBanner(b: Banner): void {
        if (!this.canUpdate) return;
        this.dialogSrv.confirm(
            `Delete the banner “${b.title}”? This can’t be undone. To keep it for later, deactivate it instead.`,
            () => this.banners.remove(b, () => {
                this.toastSrv.success(b.title, 'Banner deleted');
                if (this.editingBanner?.id === b.id) this.closeBanner(true);
            }),
            'Delete banner', 'danger', 'Delete banner', 'Keep banner',
        );
    }

    confirmDeleteFeature(f: Feature): void {
        if (!this.canUpdate) return;
        this.dialogSrv.confirm(
            `Delete the feature “${f.title}”? This can’t be undone. To keep it for later, deactivate it instead.`,
            () => this.features.remove(f, () => {
                this.toastSrv.success(f.title, 'Feature deleted');
                if (this.editingFeature?.id === f.id) this.closeFeature(true);
            }),
            'Delete feature', 'danger', 'Delete feature', 'Keep feature',
        );
    }

    confirmDeleteTestimonial(t: Testimonial): void {
        if (!this.canUpdate) return;
        this.dialogSrv.confirm(
            `Delete the testimonial from ${t.patientName}? This can’t be undone. To keep it for later, deactivate it instead.`,
            () => this.testimonials.remove(t, () => {
                this.toastSrv.success(t.patientName, 'Testimonial deleted');
                if (this.editingTestimonial?.id === t.id) this.closeTestimonial(true);
            }),
            'Delete testimonial', 'danger', 'Delete testimonial', 'Keep testimonial',
        );
    }

    // Drawers
    openBanner(b: Banner | null): void {
        if (!this.canUpdate) return;
        this.editingBanner = b;
        this.bannerOpen = true;
    }

    closeBanner(force = false): void {
        if (force) this.bannerDrawer?.form.markAsPristine();
        this.bannerOpen = false;
        this.editingBanner = null;
    }

    onBannerSaved({ banner, created }: { banner: Banner | null; created: boolean }): void {
        this.toastSrv.success(banner?.title ?? 'Banner', created ? 'Banner added' : 'Banner updated');
        this.closeBanner();
        this.banners.load();
    }

    openFeature(f: Feature | null): void {
        if (!this.canUpdate) return;
        this.editingFeature = f;
        this.featureOpen = true;
    }

    closeFeature(force = false): void {
        if (force) this.featureDrawer?.form.markAsPristine();
        this.featureOpen = false;
        this.editingFeature = null;
    }

    onFeatureSaved({ feature, created }: { feature: Feature | null; created: boolean }): void {
        this.toastSrv.success(feature?.title ?? 'Feature', created ? 'Feature added' : 'Feature updated');
        this.closeFeature();
        this.features.load();
    }

    openTestimonial(t: Testimonial | null): void {
        if (!this.canUpdate) return;
        this.editingTestimonial = t;
        this.testimonialOpen = true;
    }

    closeTestimonial(force = false): void {
        if (force) this.testimonialDrawer?.form.markAsPristine();
        this.testimonialOpen = false;
        this.editingTestimonial = null;
    }

    onTestimonialSaved({ testimonial, created }: { testimonial: Testimonial | null; created: boolean }): void {
        this.toastSrv.success(testimonial?.patientName ?? 'Testimonial', created ? 'Testimonial added' : 'Testimonial updated');
        this.closeTestimonial();
        this.testimonials.load();
    }

    // Template helpers
    trackById(_: number, item: { id: string }): string {
        return item.id;
    }

    initials(name: string): string {
        return name.trim().split(/\s+/).slice(0, 2).map(p => p[0]?.toUpperCase() ?? '').join('') || '?';
    }

    /** Where a banner button goes, shortened for the list. */
    linkLabel(link: string): string {
        return link.replace(/^https?:\/\//, '').replace(/\/$/, '') || link;
    }
    // #endregion

    // #region Helpers
    private applySaved(s: HomeSettings | null): void {
        this.saved = s;
        this.form.reset({
            hospitalName: s?.hospitalName ?? '',
            tagLine: s?.tagLine ?? '',
            welcomeMessage: s?.welcomeMessage ?? '',
            contactPhone: s?.contactPhone ?? '',
            contactEmail: s?.contactEmail ?? '',
            address: s?.address ?? '',
            showEmergencyBanner: s?.showEmergencyBanner ?? false,
        });
    }

    private refocusAfterMove(kind: ListKind, id: string, delta: -1 | 1, started: boolean): void {
        if (!started) return;
        // The row moved in the DOM; put focus back on the arrow that was pressed, or its partner at the ends.
        setTimeout(() => {
            const same = this.host.querySelector<HTMLButtonElement>(`#hc-${kind}-${id}-${delta < 0 ? 'up' : 'down'}`);
            const other = this.host.querySelector<HTMLButtonElement>(`#hc-${kind}-${id}-${delta < 0 ? 'down' : 'up'}`);
            (same && !same.disabled ? same : other)?.focus();
        });
    }

    private announceMove(kind: ListKind, id: string, title: string): void {
        const list = kind === 'banner' ? this.banners.items : this.features.items;
        const position = list.findIndex(i => i.id === id) + 1;
        this.announcement = `${title} moved to position ${position} of ${list.length}.`;
    }

    private countOf(c: { state: LoadState; activeCount: number; items: readonly unknown[] }): string {
        if (c.state !== 'ready') return '';
        return c.activeCount === c.items.length ? `${c.items.length}` : `${c.activeCount}/${c.items.length}`;
    }

    private applyPermissions(perms: string[]): void {
        // Every home page write (settings and lists) is guarded by the same permission on the server.
        this.canUpdate = perms.includes(Permissions.Cms.HomeSettingsUpdate);
        if (this.canUpdate) this.form.enable({ emitEvent: false });
        else this.form.disable({ emitEvent: false });
    }
    // #endregion
}
