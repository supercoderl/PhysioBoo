import { Component, Input } from '@angular/core';
import { SharedModule } from '../../../../shared/shared-imports';
import { PublicService } from '../../../../shared/types/public-service.types';

/**
 * Public service card (design: ServiceCard.dc.html).
 * Appointment requests are made per doctor: the service's doctor page with the service preselected, else the doctor
 * listing filtered to its clinic. With neither, only "View Service" is shown.
 */
@Component({
  selector: 'service-card',
  standalone: true,
  imports: [SharedModule],
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
      <article *ngIf="service as s" class="h-full flex flex-col border border-gray-200 rounded-2xl overflow-hidden bg-surface hover:shadow-[0_12px_32px_rgba(38,20,26,.08)] transition-shadow">
        <div class="relative aspect-[16/10] bg-[#FAF5F7]">
          <img
            *ngIf="s.coverImageUrl && !imageFailed"
            [src]="s.coverImageUrl"
            alt=""
            loading="lazy"
            class="absolute inset-0 w-full h-full object-cover"
            (error)="imageFailed = true"
          />
          <span *ngIf="!s.coverImageUrl || imageFailed" class="absolute inset-0 flex items-center justify-center text-[#C9B9C0]" aria-hidden="true">
            <physio-icon name="activity" [size]="40" />
          </span>
        </div>

        <div class="p-5 flex flex-col flex-1">
          <h3 class="text-[19px] leading-[26px] font-semibold text-gray-900 mb-2 text-balance">{{ s.name }}</h3>
          <p *ngIf="s.hospitalName" class="text-sm leading-[21px] text-gray-700 flex gap-2 items-center mb-2.5">
            <physio-icon name="building-2" [size]="15" class="text-gray-600 flex-none" />{{ s.hospitalName }}
          </p>
          <p *ngIf="s.description" class="text-sm leading-[21px] text-gray-700 mb-[18px] line-clamp-3">{{ s.description }}</p>

          <div class="mt-auto pt-1 grid gap-2" [ngClass]="s.doctorId || s.hospitalId ? 'grid-cols-2' : 'grid-cols-1'">
            <a
              [routerLink]="['/services', s.id]"
              [attr.aria-label]="'View service ' + s.name"
              class="h-11 rounded-[10px] bg-primary text-white text-sm font-semibold flex items-center justify-center hover:bg-primaryHover hover:text-white"
            >View Service</a>
            <a
              *ngIf="s.doctorId"
              [routerLink]="['/doctor', s.doctorId]"
              [queryParams]="{ service: s.id, facility: s.hospitalId }"
              fragment="request"
              [attr.aria-label]="'Request appointment for ' + s.name"
              class="h-11 rounded-[10px] border border-gray-300 bg-surface text-gray-900 text-sm font-semibold flex items-center justify-center text-center leading-tight px-2 hover:border-primary hover:text-primaryDeep"
            >Request Appointment</a>
            <a
              *ngIf="!s.doctorId && s.hospitalId"
              routerLink="/doctor"
              [queryParams]="{ facility: s.hospitalId }"
              [attr.aria-label]="'Find a doctor for ' + s.name + ' at ' + s.hospitalName"
              class="h-11 rounded-[10px] border border-gray-300 bg-surface text-gray-900 text-sm font-semibold flex items-center justify-center text-center leading-tight px-2 hover:border-primary hover:text-primaryDeep"
            >Request Appointment</a>
          </div>
        </div>
      </article>
    </ng-template>
  `
})
export class ServiceCardComponent {
  @Input() service: PublicService | null = null;
  @Input() skeleton = false;

  imageFailed = false;
}
