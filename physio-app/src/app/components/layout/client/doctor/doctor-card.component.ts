import { Component, Input, OnChanges } from '@angular/core';
import { SharedModule } from '../../../../shared/shared-imports';
import { BooButtonComponent } from '@physioboo/ui';
import { PublicDoctor } from '../../../../shared/types/public-doctor.types';

/**
 * Public doctor card (design: DoctorCard.dc.html).
 * Years of experience only show for verified doctors (the API already withholds them otherwise);
 * ratings and fees are intentionally not shown until there is verified review data and a fee policy.
 */
@Component({
  selector: 'doctor-card',
  standalone: true,
  imports: [SharedModule, BooButtonComponent],
  template: `
    <div *ngIf="skeleton; else card" aria-hidden="true" class="h-full border border-gray-200 rounded-2xl overflow-hidden bg-surface">
      <div class="aspect-[4/3] bg-[#F4ECEF] animate-pulse motion-reduce:animate-none"></div>
      <div class="p-5 flex flex-col gap-2.5">
        <span class="h-3 w-2/5 rounded-md bg-[#F4ECEF]"></span>
        <span class="h-[18px] w-[70%] rounded-md bg-gray-200"></span>
        <span class="h-3 w-[55%] rounded-md bg-[#F4ECEF]"></span>
        <span class="h-3 w-full rounded-md bg-[#F7F0F2] mt-1.5"></span>
        <span class="h-3 w-[85%] rounded-md bg-[#F7F0F2]"></span>
        <span class="flex gap-2 mt-2.5">
          <span class="flex-1 h-11 rounded-[10px] bg-gray-200"></span>
          <span class="flex-[1.4] h-11 rounded-[10px] bg-[#F4ECEF]"></span>
        </span>
      </div>
    </div>

    <ng-template #card>
      <article *ngIf="doctor as d" class="h-full flex flex-col border border-gray-200 rounded-2xl overflow-hidden bg-surface motion-card">
        <div class="relative aspect-[4/3] ph-stripes">
          <img
            *ngIf="d.avatarUrl && !imageFailed"
            [src]="d.avatarUrl"
            [alt]="'Photo of ' + d.fullName"
            loading="lazy"
            appImgFade
            class="absolute inset-0 w-full h-full object-cover"
            (error)="imageFailed = true"
          />
          <span *ngIf="!d.avatarUrl || imageFailed" class="absolute inset-0 flex items-center justify-center text-4xl font-semibold text-gray-500" aria-hidden="true">
            {{ initials(d.fullName) }}
          </span>
          <span *ngIf="d.isVerified" class="absolute right-3 bottom-3 text-xs font-semibold text-[#14532D] bg-[#E8F5EC] px-2.5 py-1 rounded-full flex gap-1 items-center">
            <physio-icon name="badge-check" [size]="14" />Verified
          </span>
        </div>

        <div class="p-5 flex flex-col flex-1">
          <p class="text-[13px] font-semibold text-primaryDeep mb-1.5">{{ d.specialty || 'Specialty not listed' }}</p>
          <h3 class="text-[19px] leading-[26px] font-semibold text-gray-900 mb-1.5">{{ d.fullName }}</h3>
          <p class="text-sm text-gray-700 flex gap-1.5 items-center mb-3">
            <physio-icon name="building-2" [size]="15" class="text-gray-600 flex-none" />
            <span class="truncate">{{ facilityLabel(d) }}</span>
          </p>
          <p class="text-sm leading-[21px] text-gray-700 mb-3.5 line-clamp-2">{{ d.bio || 'No introduction provided yet.' }}</p>

          <ul class="flex gap-1.5 flex-wrap mb-[18px] list-none p-0 m-0">
            <li *ngIf="d.isVerified && d.yearsOfExperience" class="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-800">{{ d.yearsOfExperience }} yrs experience</li>
            <li *ngIf="d.isAvailableOnline" class="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-800">Online consultation</li>
            <li *ngIf="d.isAvailableHomeVisit" class="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-800">Home visit</li>
          </ul>

          <!-- Actions share a row when they fit and stack when the card is narrow; labels never wrap. -->
          <div class="mt-auto flex flex-wrap gap-2">
            <a
              boo-button
              variant="primary"
              class="flex-[1_1_auto]"
              [routerLink]="['/doctor', d.id]"
              [attr.aria-label]="'View profile of ' + d.fullName"
            >View profile</a>
            <a
              boo-button
              variant="secondary"
              class="flex-[1_1_auto]"
              [routerLink]="['/doctor', d.id]"
              [queryParams]="requestParams"
              fragment="request"
              [attr.aria-label]="'Request appointment with ' + d.fullName"
            >Request appointment</a>
          </div>
        </div>
      </article>
    </ng-template>
  `,
  styles: `
    .ph-stripes { background: repeating-linear-gradient(135deg, #F3EAED 0 10px, #F9F4F6 10px 20px); }
  `
})
export class DoctorCardComponent implements OnChanges {
  @Input() doctor: PublicDoctor | null = null;
  @Input() skeleton = false;
  /** Set on a clinic page: the request link preselects this clinic in the doctor's request form. */
  @Input() facilityId: string | null = null;
  /** Set on a service page: the request link preselects this service (by id) in the doctor's request form. */
  @Input() serviceId: string | null = null;

  /** Query params of the request link; rebuilt only when the inputs change, so the binding stays stable. */
  requestParams: Record<string, string> | null = null;

  ngOnChanges(): void {
    const params: Record<string, string> = {};
    if (this.facilityId) params['facility'] = this.facilityId;
    if (this.serviceId) params['service'] = this.serviceId;
    this.requestParams = Object.keys(params).length ? params : null;
  }

  imageFailed = false;

  facilityLabel(d: PublicDoctor): string {
    if (!d.facilities.length) return 'Facility not listed';
    const extra = d.facilities.length - 1;
    return extra > 0 ? `${d.facilities[0]} +${extra} more` : d.facilities[0];
  }

  initials(name: string): string {
    const parts = name.trim().split(/\s+/);
    return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
  }
}
