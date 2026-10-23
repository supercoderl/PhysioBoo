import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, signal } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { BooButtonComponent, BooErrorStateComponent, BooInputComponent } from '@physioboo/ui';
import { finalize, forkJoin } from "rxjs";
import { BooDatepickerComponent } from "../../../../components/date-picker/boo-date-picker.component";
import { DrawerComponent } from "../../../../components/drawer/drawer.component";
import { BooSelectComponent } from "../../../../components/select/boo-select/boo-select.component";
import { BooTextareaComponent } from "../../../../components/textarea/boo-textarea/boo-textarea.component";
import { DepartmentService } from "../../../../services/admin/department.service";
import { DoctorService } from "../../../../services/admin/doctor.service";
import { PatientService } from "../../../../services/admin/patient.service";
import { SurgeryService } from "../../../../services/admin/surgery.service";
import { ToastService } from "../../../../services/common/toast.service";
import { SharedModule } from "../../../../shared/shared-imports";
import {
  ConsentStatus, CreateSurgeryRequest, CreateSurgeryTeamMemberRequest, OperatingRoom, SurgeryPriority,
} from "../../../../shared/types/surgery.types";

interface Option { label: string; value: string | null; }

const LOOKUP_PAGE_SIZE = 100;

/** Schedules a case through POST /api/surgery/cases. The server owns room-clash and room-usability checks. */
@Component({
  selector: 'surgery-create-drawer',
  standalone: true,
  imports: [
    SharedModule, DrawerComponent, BooDatepickerComponent, BooSelectComponent, BooTextareaComponent, BooInputComponent,
    BooButtonComponent, BooErrorStateComponent,
  ],
  template: `
    <drawer [isOpen]="isOpen" [isShowDialog]="true" (close)="onClose()">
      <div class="flex flex-col h-full bg-surface relative">
        <div class="flex-none px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-surface z-10 sticky top-0">
          <div>
            <h2 class="text-xl font-bold text-primary leading-none mb-1">Schedule Surgery</h2>
            <p class="text-sm text-secondary m-0">The server checks the operating room for conflicts when you submit.</p>
          </div>
          <button boo-button variant="ghost" size="sm" [iconOnly]="true" aria-label="Close" (click)="onClose()">
            <physio-icon name="x" [size]="20"></physio-icon>
          </button>
        </div>

        <div class="flex-1 overflow-y-auto bg-surface" custom-scrollbar>
          <div *ngIf="isLoadingLookups()" class="p-6" role="status">
            <div aria-hidden="true" class="h-64 rounded-xl border border-borderGray bg-surface animate-pulse"></div>
            <span class="sr-only">Loading scheduling options…</span>
          </div>

          <boo-error-state *ngIf="!isLoadingLookups() && lookupError()" class="block p-6" appearance="panel" icon="cloud-off"
            title="We couldn't load the scheduling options" description="Patients, rooms and clinicians are needed to schedule a surgery."
            retryLabel="Try again" (retry)="loadLookups()" />

          <form *ngIf="!isLoadingLookups() && !lookupError()" [formGroup]="form" class="p-6 space-y-4" (ngSubmit)="submit()" id="surgery-create-form" novalidate>
            <boo-select label="Patient" formControlName="patientId" required [options]="patientOptions()" [searchable]="true"></boo-select>
            <boo-input label="Procedure" formControlName="procedure" required [maxlength]="200"></boo-input>
            <boo-input label="Surgery type" formControlName="surgeryType" required [maxlength]="100"></boo-input>
            <boo-select label="Department" formControlName="departmentId" [options]="departmentOptions()"></boo-select>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <boo-select label="Operating room" formControlName="operatingRoomId" required [options]="roomOptions()"></boo-select>
              <boo-select label="Priority" formControlName="priority" required [options]="priorityOptions"></boo-select>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <boo-datepicker label="Date" formControlName="date" required [disablePast]="true"></boo-datepicker>
              <boo-input label="Start time" type="time" formControlName="time" required></boo-input>
              <boo-input label="Duration (min)" type="number" formControlName="duration" required></boo-input>
            </div>

            <boo-select label="Primary surgeon" formControlName="primarySurgeonId" [options]="doctorOptions()" [searchable]="true"></boo-select>
            <boo-select label="Assistant surgeon" formControlName="assistantSurgeonId" [options]="doctorOptions()" [searchable]="true"></boo-select>
            <boo-select label="Anesthesiologist" formControlName="anesthesiologistId" [options]="doctorOptions()" [searchable]="true"></boo-select>

            <boo-textarea label="Diagnosis" formControlName="diagnosis" required [maxlength]="1000"></boo-textarea>
            <boo-select label="Consent status" formControlName="consentStatus" [options]="consentOptions"></boo-select>
            <boo-textarea label="Risk assessment" formControlName="riskAssessment" [maxlength]="1000"></boo-textarea>

            <p *ngIf="teamError()" class="m-0 text-sm text-danger" role="alert">{{ teamError() }}</p>
            <p *ngIf="submitFailed()" class="m-0 text-sm text-danger" role="alert">
              The surgery was not scheduled. Your entries are kept — review the message shown and try again.
            </p>
          </form>
        </div>

        <div class="flex-none px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end z-20 sticky bottom-0">
          <div class="flex gap-3">
            <button type="button" boo-button variant="ghost" size="sm" (click)="onClose()" [disabled]="submitting()">Cancel</button>
            <button type="submit" form="surgery-create-form" boo-button variant="primary" size="sm"
              [disabled]="submitting() || isLoadingLookups() || lookupError()" [loading]="submitting()">
              Schedule surgery
            </button>
          </div>
        </div>
      </div>
    </drawer>
  `,
})
export class SurgeryCreateDrawerComponent implements OnChanges {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  /** The case exists on the server; the parent reloads its lists. */
  @Output() created = new EventEmitter<void>();

  form: FormGroup;
  submitting = signal(false);
  submitFailed = signal(false);
  teamError = signal<string | null>(null);
  isLoadingLookups = signal(false);
  lookupError = signal(false);
  patientOptions = signal<Option[]>([]);
  departmentOptions = signal<Option[]>([]);
  doctorOptions = signal<Option[]>([]);
  roomOptions = signal<Option[]>([]);
  private rooms: OperatingRoom[] = [];

  readonly priorityOptions: { label: string; value: SurgeryPriority }[] = [
    { label: 'Elective', value: 'Elective' }, { label: 'Urgent', value: 'Urgent' }, { label: 'Emergency', value: 'Emergency' },
  ];
  readonly consentOptions: { label: string; value: ConsentStatus }[] = [
    { label: 'Not obtained', value: 'NotObtained' }, { label: 'Pending', value: 'Pending' }, { label: 'Signed', value: 'Signed' },
  ];

  constructor(
    private fb: FormBuilder,
    private srv: SurgeryService,
    private patientSrv: PatientService,
    private departmentSrv: DepartmentService,
    private doctorSrv: DoctorService,
    private toastSrv: ToastService,
  ) {
    this.form = this.fb.group({
      patientId: [null, Validators.required],
      procedure: ['', [Validators.required, Validators.maxLength(200)]],
      surgeryType: ['', [Validators.required, Validators.maxLength(100)]],
      departmentId: [null],
      operatingRoomId: [null, Validators.required],
      priority: ['Elective', Validators.required],
      date: [null, Validators.required],
      time: ['', Validators.required],
      duration: [60, [Validators.required, Validators.min(5), Validators.max(1440)]],
      primarySurgeonId: [null],
      assistantSurgeonId: [null],
      anesthesiologistId: [null],
      diagnosis: ['', [Validators.required, Validators.maxLength(1000)]],
      consentStatus: [null],
      riskAssessment: ['', Validators.maxLength(1000)],
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['isOpen'] || !this.isOpen) return;
    // Entries survive a failed submit; only a fresh opening starts a new form.
    this.form.reset({ priority: 'Elective', duration: 60, procedure: '', surgeryType: '', time: '', diagnosis: '', riskAssessment: '' });
    this.submitFailed.set(false);
    this.teamError.set(null);
    this.loadLookups();
  }

  loadLookups(): void {
    this.isLoadingLookups.set(true);
    this.lookupError.set(false);
    forkJoin({
      patients: this.patientSrv.search({ pageNumber: 1, pageSize: LOOKUP_PAGE_SIZE }),
      departments: this.departmentSrv.search({ pageNumber: 1, pageSize: LOOKUP_PAGE_SIZE }),
      doctors: this.doctorSrv.search({ pageNumber: 1, pageSize: LOOKUP_PAGE_SIZE }),
      rooms: this.srv.getRooms(),
    })
      .pipe(finalize(() => this.isLoadingLookups.set(false)))
      .subscribe({
        next: ({ patients, departments, doctors, rooms }) => {
          if (!patients.success || !departments.success || !doctors.success || !rooms.success) { this.lookupError.set(true); return; }
          this.patientOptions.set(patients.data.items.map(p => ({ label: p.fullName ? `${p.fullName} (${p.patientNumber})` : p.patientNumber, value: p.id })));
          this.departmentOptions.set(departments.data.items.map(d => ({ label: d.name, value: d.id })));
          this.doctorOptions.set(doctors.data.items.map(d => ({ label: d.fullName, value: d.id })));
          this.rooms = rooms.data;
          this.roomOptions.set(this.rooms.map(r => ({ label: this.roomLabel(r), value: r.id })));
        },
        error: () => this.lookupError.set(true),
      });
  }

  submit(): void {
    if (this.submitting()) return;
    this.submitFailed.set(false);
    this.teamError.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toastSrv.error('Complete the required fields');
      return;
    }

    const v = this.form.getRawValue();
    const room = this.rooms.find(r => r.id === v.operatingRoomId);
    if (room && (room.status === 'Maintenance' || room.status === 'Closed')) {
      this.toastSrv.error(`Operating room ${room.roomNumber} is ${room.status} and cannot be booked`);
      return;
    }

    const team = this.buildTeam(v);
    if (!team) return;

    const request: CreateSurgeryRequest = {
      patientId: v.patientId,
      procedure: String(v.procedure).trim(),
      surgeryType: String(v.surgeryType).trim(),
      departmentId: v.departmentId || null,
      operatingRoomId: v.operatingRoomId,
      scheduledStart: `${v.date}T${v.time}:00`,
      estimatedDurationMinutes: Number(v.duration),
      priority: v.priority,
      diagnosis: String(v.diagnosis).trim(),
      consentStatus: v.consentStatus || null,
      riskAssessment: String(v.riskAssessment ?? '').trim() || null,
      team,
    };

    this.submitting.set(true);
    this.srv.createCase(request)
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: res => {
          if (!res.success) { this.submitFailed.set(true); return; }
          this.toastSrv.success('Surgery scheduled');
          this.created.emit();
        },
        error: () => this.submitFailed.set(true),
      });
  }

  onClose(): void {
    if (this.submitting()) return;
    this.close.emit();
  }

  /** One person cannot hold two roles on the same case; null means the team is invalid. */
  private buildTeam(v: Record<string, string | null>): CreateSurgeryTeamMemberRequest[] | null {
    const team: CreateSurgeryTeamMemberRequest[] = [];
    if (v['primarySurgeonId']) team.push({ staffId: v['primarySurgeonId'], role: 'PrimarySurgeon' });
    if (v['assistantSurgeonId']) team.push({ staffId: v['assistantSurgeonId'], role: 'AssistantSurgeon' });
    if (v['anesthesiologistId']) team.push({ staffId: v['anesthesiologistId'], role: 'Anesthesiologist' });

    if (new Set(team.map(m => m.staffId)).size !== team.length) {
      this.teamError.set('The same clinician is selected for more than one role.');
      return null;
    }
    return team;
  }

  private roomLabel(room: OperatingRoom): string {
    return `${room.roomNumber} — ${room.roomType} (${room.status})`;
  }
}
