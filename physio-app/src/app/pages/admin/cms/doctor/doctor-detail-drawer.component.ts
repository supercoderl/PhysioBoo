import { DatePipe, NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { BooButtonComponent, BooIconComponent, BooStatusBadgeComponent } from '@physioboo/ui';
import { DrawerComponent } from '../../../../components/drawer/drawer.component';
import { CustomScrollbarDirective } from '../../../../shared/directives/scrollbar.directive';
import { Doctor } from '../../../../shared/types/medical-staff.types';
import { consultModes, displayName, gapSummary, initials, languageList, licenceExpired, licenceExpiry, profileGaps, years } from './doctor.utils';

/**
 * Read view of one doctor's public profile: who they are, what they write about themselves, how patients can see
 * them and the licence they practise under. Employment, payroll and tax details are deliberately left out.
 * Edits and deletes are handed to the page, which owns the requests.
 */
@Component({
    selector: 'cms-doctor-detail-drawer',
    standalone: true,
    imports: [NgIf, NgFor, DatePipe, DrawerComponent, BooButtonComponent, BooIconComponent, BooStatusBadgeComponent, CustomScrollbarDirective],
    template: `
        <drawer [isOpen]="!!doctor" (close)="close.emit()">
            <div
                *ngIf="doctor as d"
                class="flex flex-col h-svh bg-surface"
                role="dialog"
                aria-modal="true"
                aria-labelledby="doctor-detail-title"
                [attr.aria-busy]="busy"
            >
                <header class="flex-none px-6 py-4 border-b border-rowDivider flex items-start justify-between gap-3">
                    <div class="min-w-0 flex flex-wrap items-center gap-x-2 gap-y-1">
                        <boo-status-badge dotted [label]="d.isVerified ? 'Verified' : 'Not verified'" [tone]="d.isVerified ? 'success' : 'neutral'" />
                        <boo-status-badge *ngIf="d.isFeature" label="Featured" tone="primary" />
                    </div>
                    <button boo-button variant="ghost" size="sm" [iconOnly]="true" aria-label="Close doctor profile" (click)="close.emit()">
                        <physio-icon name="x" [size]="18" />
                    </button>
                </header>

                <div class="flex-1 min-h-0 overflow-y-auto" custom-scrollbar>
                    <!-- Identity -->
                    <section class="px-6 pt-5 pb-5 flex items-start gap-4" aria-labelledby="doctor-detail-title">
                        <span class="flex-none w-16 h-16 rounded-full overflow-hidden bg-primarySoft text-primaryDeep text-lg font-semibold flex items-center justify-center" aria-hidden="true">
                            <img *ngIf="d.avatar && !photoFailed; else initialsTpl" [src]="d.avatar" alt="" class="w-full h-full object-cover" (error)="photoFailed = true" />
                            <ng-template #initialsTpl>{{ initials(d) }}</ng-template>
                        </span>
                        <div class="min-w-0 flex-1">
                            <h2 id="doctor-detail-title" class="m-0 text-2xl leading-8 font-semibold tracking-tight text-regular break-words">{{ name(d) }}</h2>
                            <p class="m-0 mt-0.5 text-sm" [class.text-regular]="specialtyName" [class.text-placeholder]="!specialtyName">
                                {{ specialtyName || (d.primarySpecialtyId ? 'Specialty unavailable' : 'No specialty set') }}
                            </p>
                            <p *ngIf="d.employeeId" class="m-0 mt-1 font-mono text-xs font-medium text-primaryDeep">{{ d.employeeId }}</p>
                        </div>
                    </section>

                    <!-- What still needs filling in for the public profile -->
                    <div *ngIf="gaps(d) as gap" class="mx-6 mb-5 flex items-start gap-2 px-3 py-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[13px] text-amber-800" role="note">
                        <physio-icon name="circle-alert" [size]="15" class="flex-none mt-0.5" aria-hidden="true" />
                        <span>{{ gap }} on the public profile.<ng-container *ngIf="canUpdate"> Use Edit profile to add {{ gapCount(d) === 1 ? 'it' : 'them' }}.</ng-container></span>
                    </div>

                    <!-- Profile text -->
                    <section aria-labelledby="dd-about" class="mx-6 py-5 border-t border-rowDivider">
                        <h3 id="dd-about" class="m-0 mb-3 text-xs font-semibold uppercase tracking-wide text-secondary">Public profile</h3>
                        <dl class="m-0 flex flex-col gap-4 text-sm">
                            <div>
                                <dt class="text-xs text-secondary">Short bio</dt>
                                <dd class="m-0 mt-0.5 leading-6 whitespace-pre-line break-words" [class.text-regular]="d.bio" [class.text-placeholder]="!d.bio">{{ d.bio || 'Not written yet' }}</dd>
                            </div>
                            <div>
                                <dt class="text-xs text-secondary">About</dt>
                                <dd class="m-0 mt-0.5 leading-6 whitespace-pre-line break-words" [class.text-regular]="d.about" [class.text-placeholder]="!d.about">{{ d.about || 'Not written yet' }}</dd>
                            </div>
                            <div>
                                <dt class="text-xs text-secondary">Languages</dt>
                                <dd class="m-0 mt-1">
                                    <ul *ngIf="languages(d).length; else noLangTpl" class="m-0 p-0 list-none flex flex-wrap gap-1.5">
                                        <li *ngFor="let l of languages(d)" class="px-2.5 py-1 rounded-md bg-body border border-rowDivider text-[13px] text-regular">{{ l }}</li>
                                    </ul>
                                    <ng-template #noLangTpl><span class="text-placeholder">None listed</span></ng-template>
                                </dd>
                            </div>
                        </dl>
                    </section>

                    <!-- Background -->
                    <section aria-labelledby="dd-background" class="mx-6 py-5 border-t border-rowDivider">
                        <h3 id="dd-background" class="m-0 mb-3 text-xs font-semibold uppercase tracking-wide text-secondary">Professional background</h3>
                        <dl class="m-0 grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
                            <div>
                                <dt class="text-xs text-secondary">Experience</dt>
                                <dd class="m-0 mt-0.5 font-medium text-regular tabular-nums">{{ years(d.yearsOfExperience) }}</dd>
                            </div>
                            <div>
                                <dt class="text-xs text-secondary">In practice</dt>
                                <dd class="m-0 mt-0.5 font-medium text-regular tabular-nums">{{ years(d.yearsOfPractice) }}</dd>
                            </div>
                            <div>
                                <dt class="text-xs text-secondary">Publications</dt>
                                <dd class="m-0 mt-0.5 font-medium text-regular tabular-nums">{{ d.publicationsCount || 0 }}</dd>
                            </div>
                            <div>
                                <dt class="text-xs text-secondary">Conference talks</dt>
                                <dd class="m-0 mt-0.5 font-medium text-regular tabular-nums">{{ d.conferencePresentations || 0 }}</dd>
                            </div>
                            <div class="col-span-2">
                                <dt class="text-xs text-secondary">Achievements</dt>
                                <dd class="m-0 mt-0.5 leading-6 whitespace-pre-line break-words" [class.text-regular]="d.archivements" [class.text-placeholder]="!d.archivements">{{ d.archivements || 'None listed' }}</dd>
                            </div>
                            <div class="col-span-2">
                                <dt class="text-xs text-secondary">Research interests</dt>
                                <dd class="m-0 mt-0.5 leading-6 whitespace-pre-line break-words" [class.text-regular]="d.researchInterests" [class.text-placeholder]="!d.researchInterests">{{ d.researchInterests || 'None listed' }}</dd>
                            </div>
                        </dl>
                    </section>

                    <!-- How patients can see them -->
                    <section aria-labelledby="dd-consult" class="mx-6 py-5 border-t border-rowDivider">
                        <h3 id="dd-consult" class="m-0 mb-3 text-xs font-semibold uppercase tracking-wide text-secondary">Consultations</h3>
                        <ul *ngIf="modes(d).length; else noModesTpl" class="m-0 p-0 list-none flex flex-wrap gap-x-4 gap-y-2 text-sm text-regular">
                            <li *ngFor="let m of modes(d)" class="inline-flex items-center gap-1.5">
                                <physio-icon [name]="m.icon" [size]="15" class="text-primaryDeep" aria-hidden="true" />{{ m.label }}
                            </li>
                        </ul>
                        <ng-template #noModesTpl><p class="m-0 text-sm text-placeholder">No online, home or emergency visits offered.</p></ng-template>
                        <p class="m-0 mt-2 text-xs text-secondary">Consultation options and fees are part of the booking setup and aren't changed here.</p>
                    </section>

                    <!-- Licence -->
                    <section aria-labelledby="dd-licence" class="mx-6 py-5 border-t border-rowDivider">
                        <h3 id="dd-licence" class="m-0 mb-3 text-xs font-semibold uppercase tracking-wide text-secondary">Medical licence</h3>
                        <dl class="m-0 grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
                            <div>
                                <dt class="text-xs text-secondary">Licence number</dt>
                                <dd class="m-0 mt-0.5 font-mono font-medium text-regular break-all">{{ d.medicalLicenseNumber || '—' }}</dd>
                            </div>
                            <div>
                                <dt class="text-xs text-secondary">Expires</dt>
                                <dd class="m-0 mt-0.5 font-medium" [class.text-danger]="expired(d)" [class.text-regular]="!expired(d) && expiry(d)" [class.text-placeholder]="!expiry(d)">
                                    {{ (expiry(d) | date: 'd MMM y') || 'Not recorded' }}<ng-container *ngIf="expired(d)"> · expired</ng-container>
                                </dd>
                            </div>
                            <div class="col-span-2">
                                <dt class="text-xs text-secondary">Issued by</dt>
                                <dd class="m-0 mt-0.5 font-medium break-words" [class.text-regular]="d.medicalLicenseIssuingAuthority" [class.text-placeholder]="!d.medicalLicenseIssuingAuthority">{{ d.medicalLicenseIssuingAuthority || 'Not recorded' }}</dd>
                            </div>
                        </dl>
                    </section>

                    <!-- Record -->
                    <section aria-labelledby="dd-record" class="mx-6 py-5 border-t border-rowDivider">
                        <h3 id="dd-record" class="m-0 mb-3 text-xs font-semibold uppercase tracking-wide text-secondary">Record</h3>
                        <dl class="m-0 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                            <div>
                                <dt class="text-xs text-secondary">Added</dt>
                                <dd class="m-0 font-medium text-regular">{{ d.createdAt | date: 'd MMM y, HH:mm' }}</dd>
                            </div>
                            <div>
                                <dt class="text-xs text-secondary">Last updated</dt>
                                <dd class="m-0 font-medium" [class.text-regular]="d.updatedAt" [class.text-placeholder]="!d.updatedAt">{{ (d.updatedAt | date: 'd MMM y, HH:mm') || 'Never edited' }}</dd>
                            </div>
                        </dl>
                    </section>
                </div>

                <footer *ngIf="canUpdate || canDelete" class="flex-none px-6 py-4 border-t border-rowDivider flex flex-wrap items-center justify-end gap-2">
                    <button *ngIf="canDelete" type="button" boo-button variant="ghost" size="sm" class="!text-danger mr-auto" [disabled]="busy" [loading]="busy" (click)="remove.emit(d)">
                        <physio-icon *ngIf="!busy" name="trash" [size]="15" aria-hidden="true" />Delete doctor
                    </button>
                    <button *ngIf="canUpdate" type="button" boo-button variant="primary" size="sm" aria-haspopup="dialog" [disabled]="busy" (click)="edit.emit(d)">
                        <physio-icon name="pencil" [size]="15" aria-hidden="true" />Edit profile
                    </button>
                </footer>
            </div>
        </drawer>
    `,
})
export class CmsDoctorDetailDrawerComponent implements OnChanges {
    @Input() doctor: Doctor | null = null;
    /** The doctor's specialty name, resolved by the page; null when unknown. */
    @Input() specialtyName: string | null = null;
    @Input() canUpdate = false;
    @Input() canDelete = false;
    /** A delete for this doctor is in flight. */
    @Input() busy = false;
    @Output() close = new EventEmitter<void>();
    @Output() edit = new EventEmitter<Doctor>();
    @Output() remove = new EventEmitter<Doctor>();

    readonly name = displayName;
    readonly initials = initials;
    readonly gaps = gapSummary;
    readonly modes = consultModes;
    readonly years = years;
    readonly languages = languageList;
    readonly expiry = licenceExpiry;
    readonly expired = licenceExpired;

    photoFailed = false;

    ngOnChanges(changes: SimpleChanges): void {
        const prev = changes['doctor']?.previousValue as Doctor | null | undefined;
        if (changes['doctor'] && (prev?.id !== this.doctor?.id || prev?.avatar !== this.doctor?.avatar)) this.photoFailed = false;
    }

    @HostListener('document:keydown.escape')
    onEscape(): void {
        if (this.doctor) this.close.emit();
    }

    gapCount(d: Doctor): number {
        return profileGaps(d).length;
    }
}
