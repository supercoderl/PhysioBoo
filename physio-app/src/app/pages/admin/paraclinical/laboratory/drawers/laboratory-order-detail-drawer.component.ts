import { DatePipe, NgFor, NgIf } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { BooButtonComponent, BooStatusBadgeComponent } from '@physioboo/ui';
import { DrawerComponent } from "../../../../../components/drawer/drawer.component";
import { LabOrderRow } from "../../../../../shared/types/laboratory.types";
import { collectionTone, labStatusTone, priorityTone, statusLabel, verificationTone } from "../laboratory-display";
import { LaboratoryDrawerShellComponent } from "./laboratory-drawer-shell.component";

/** Read-only view of one order and the tests it contains. Per-test specimen and result work happens in the other tabs. */
@Component({
  selector: 'laboratory-order-detail-drawer',
  standalone: true,
  imports: [NgIf, NgFor, DatePipe, DrawerComponent, BooButtonComponent, BooStatusBadgeComponent, LaboratoryDrawerShellComponent],
  template: `
    <drawer [isOpen]="isOpen" (close)="close.emit()">
      <laboratory-drawer-shell *ngIf="isOpen && order as o" [title]="o.orderNumber" [subtitle]="o.patientName + ' · ' + o.mrn" (close)="close.emit()">
        <div class="px-6 py-5 flex flex-col gap-5">
          <div class="flex flex-wrap gap-2">
            <boo-status-badge [label]="o.priority" [tone]="priority(o)" />
            <boo-status-badge [label]="label(o.collectionStatus)" [tone]="collection(o)" />
            <boo-status-badge [label]="label(o.labStatus)" [tone]="labStatus(o)" />
            <boo-status-badge [label]="label(o.verificationStatus)" [tone]="verification(o)" />
          </div>

          <dl class="m-0 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <div><dt class="text-gray-500">Ordered</dt><dd class="m-0 font-medium text-gray-800">{{ o.orderTime | date: 'MMM d, y, HH:mm' }}</dd></div>
            <div><dt class="text-gray-500">Ordering doctor</dt><dd class="m-0 font-medium text-gray-800">{{ o.orderingDoctorName || '—' }}</dd></div>
            <div><dt class="text-gray-500">Department</dt><dd class="m-0 font-medium text-gray-800">{{ o.departmentName || '—' }}</dd></div>
            <div><dt class="text-gray-500">Ward</dt><dd class="m-0 font-medium text-gray-800">{{ o.wardName || '—' }}</dd></div>
            <div><dt class="text-gray-500">Visit</dt><dd class="m-0 font-medium text-gray-800">{{ o.visitNumber || '—' }}</dd></div>
          </dl>

          <section>
            <h3 class="m-0 mb-2 text-sm font-semibold text-gray-800">Requested tests ({{ o.tests.length }})</h3>
            <div class="border border-gray-200 rounded-lg overflow-x-auto">
              <table class="w-full text-sm">
                <thead class="bg-gray-100 text-gray-600 text-xs uppercase">
                  <tr>
                    <th scope="col" class="px-3 py-2 text-left">Test</th>
                    <th scope="col" class="px-3 py-2 text-left">Category</th>
                    <th scope="col" class="px-3 py-2 text-left">Specimen</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr *ngFor="let t of o.tests; trackBy: trackById">
                    <td class="px-3 py-2 font-medium text-gray-800">{{ t.testName }}</td>
                    <td class="px-3 py-2 text-gray-500">{{ t.categoryName || '—' }}</td>
                    <td class="px-3 py-2 text-gray-500">{{ t.sampleType }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <ng-container footer>
          <button boo-button variant="secondary" size="sm" type="button" (click)="close.emit()">Close</button>
          <button boo-button variant="primary" size="sm" type="button" (click)="viewPatient.emit(o.mrn)">Patient lab history</button>
        </ng-container>
      </laboratory-drawer-shell>
    </drawer>
  `,
})
export class LaboratoryOrderDetailDrawerComponent {
  @Input() isOpen = false;
  @Input() order: LabOrderRow | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() viewPatient = new EventEmitter<string>();

  readonly label = statusLabel;
  readonly priority = (o: LabOrderRow) => priorityTone(o.priority);
  readonly collection = (o: LabOrderRow) => collectionTone(o.collectionStatus);
  readonly labStatus = (o: LabOrderRow) => labStatusTone(o.labStatus);
  readonly verification = (o: LabOrderRow) => verificationTone(o.verificationStatus);

  trackById(_: number, t: { id: string }): string { return t.id; }
}
