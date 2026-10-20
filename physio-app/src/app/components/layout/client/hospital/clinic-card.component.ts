import { Component, Input } from '@angular/core';
import { hospitalTypeLabel } from '../../../../shared/enums/hospital-type';
import { SharedModule } from '../../../../shared/shared-imports';
import { BooButtonComponent } from '@physioboo/ui';
import { PublicHospital } from '../../../../shared/types/public-hospital.types';

/**
 * Public clinic card (design: ClinicCard.dc.html).
 * Appointment requests are made per doctor, so "Request Appointment" opens the doctor listing filtered to this clinic.
 */
@Component({
  selector: 'clinic-card',
  standalone: true,
  imports: [SharedModule, BooButtonComponent],
  template: `
    <div *ngIf="skeleton; else card" aria-hidden="true" class="h-full border border-gray-200 rounded-2xl overflow-hidden bg-surface">
      <div class="aspect-[16/10] bg-[#F4ECEF] animate-pulse motion-reduce:animate-none"></div>
      <div class="p-5 flex flex-col gap-2.5">
        <span class="h-3 w-[35%] rounded-md bg-[#F4ECEF]"></span>
        <span class="h-[18px] w-3/4 rounded-md bg-gray-200"></span>
        <span class="h-3 w-[90%] rounded-md bg-[#F4ECEF]"></span>
        <span class="h-3 w-full rounded-md bg-[#F7F0F2] mt-1.5"></span>
        <span class="h-3 w-4/5 rounded-md bg-[#F7F0F2]"></span>
        <span class="flex gap-2 mt-2.5">
          <span class="flex-1 h-11 rounded-[10px] bg-gray-200"></span>
          <span class="flex-1 h-11 rounded-[10px] bg-[#F4ECEF]"></span>
        </span>
      </div>
    </div>

    <ng-template #card>
      <article *ngIf="hospital as h" class="h-full flex flex-col border border-gray-200 rounded-2xl overflow-hidden bg-surface motion-card">
        <div class="relative aspect-[16/10] bg-[#FAF5F7]">
          <img
            *ngIf="h.imageUrl && !imageFailed"
            [src]="h.imageUrl"
            [alt]="'Photo of ' + h.name"
            loading="lazy"
            appImgFade
            class="absolute inset-0 w-full h-full object-cover"
            (error)="imageFailed = true"
          />
          <span *ngIf="!h.imageUrl || imageFailed" class="absolute inset-0 flex items-center justify-center text-[#B9A8AF]" aria-hidden="true">
            <physio-icon name="building-2" [size]="40" />
          </span>
        </div>

        <div class="p-5 flex flex-col flex-1">
          <p class="text-[13px] font-semibold text-primaryDeep mb-1.5">{{ typeLabel(h) }}</p>
          <h3 class="text-[19px] leading-[26px] font-semibold text-gray-900 mb-2 text-balance">{{ h.name }}</h3>
          <p *ngIf="address(h) as a" class="text-sm leading-[21px] text-gray-700 flex gap-2 mb-1.5">
            <physio-icon name="map-pin" [size]="15" class="text-gray-600 flex-none mt-[3px]" />{{ a }}
          </p>
          <a
            *ngIf="h.phone"
            [href]="tel(h.phone)"
            class="text-sm text-gray-800 flex gap-2 items-center mb-3 self-start min-h-7 hover:text-primaryDeep"
          >
            <physio-icon name="phone" [size]="15" class="text-gray-600 flex-none" />{{ h.phone }}
          </a>
          <p *ngIf="h.description" class="text-sm leading-[21px] text-gray-700 mb-3.5 line-clamp-2">{{ h.description }}</p>

          <ul *ngIf="h.is24Hours || h.languages.length" class="flex gap-1.5 flex-wrap mb-[18px] list-none p-0 m-0">
            <li *ngIf="h.is24Hours" class="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-800">Open 24 hours</li>
            <li *ngFor="let l of h.languages" class="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-800">{{ l }}</li>
          </ul>

          <!-- Actions share a row when they fit and stack when the card is narrow; labels never wrap. -->
          <div class="mt-auto pt-1 flex flex-wrap gap-2">
            <a
              boo-button
              variant="primary"
              class="flex-[1_1_auto]"
              [routerLink]="['/hospitals', h.id]"
              [attr.aria-label]="'View clinic ' + h.name"
            >View clinic</a>
            <a
              boo-button
              variant="secondary"
              class="flex-[1_1_auto]"
              routerLink="/doctor"
              [queryParams]="{ facility: h.id }"
              [attr.aria-label]="'Request appointment at ' + h.name"
            >Request appointment</a>
          </div>
        </div>
      </article>
    </ng-template>
  `
})
export class ClinicCardComponent {
  @Input() hospital: PublicHospital | null = null;
  @Input() skeleton = false;

  imageFailed = false;

  typeLabel(h: PublicHospital): string {
    return hospitalTypeLabel(h.hospitalType);
  }

  address(h: PublicHospital): string {
    return [h.address, h.city, h.stateProvince].filter(Boolean).join(', ');
  }

  tel(phone: string): string {
    return 'tel:' + phone.replace(/[^\d+]/g, '');
  }
}
