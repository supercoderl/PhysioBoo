import { inject, Injectable } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import { PaginationData, PaginationDataWithInit } from "../../shared/types/common";
import {
  BatchOption,
  DispenseItemStatus,
  DispenseMedicationItem,
  DispenseMedicineDetail,
  DispenseQueueItem,
  DispenseQueueStats,
  DispenseQueueStatus,
  DispenseSummary,
  DispenseWorkspace,
} from "../../shared/types/dispensing.types";
import { LoadingKeys } from "../../shared/types/loading";
import { HttpService } from "../common/http.service";

@Injectable({ providedIn: 'root' })
export class DispensingService {
  // #region Inject Services
  private readonly httpSrv = inject(HttpService);
  // #endregion

  // Methods
  getQueue(search?: string, status?: DispenseQueueStatus | null) {
    let items = MOCK.queue();
    if (status) items = items.filter(i => i.status === status);
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(i =>
        i.patientName.toLowerCase().includes(q) ||
        i.prescriptionNumber.toLowerCase().includes(q) ||
        i.mrn.toLowerCase().includes(q));
    }
    return this.httpSrv.getOr<PaginationData<DispenseQueueItem>>(BASE_API.DISPENSING.QUEUE, { ...PaginationDataWithInit<DispenseQueueItem>(), items, totalCount: items.length }, LoadingKeys.DISPENSING.QUEUE);
  }

  getStats() {
    return this.httpSrv.getOr<DispenseQueueStats>(BASE_API.DISPENSING.STATS, MOCK.stats(), LoadingKeys.DISPENSING.STATS);
  }

  getWorkspace(queueId: string) {
    return this.httpSrv.getOr<DispenseWorkspace>(BASE_API.DISPENSING.WORKSPACE(queueId), MOCK.workspace(queueId), LoadingKeys.DISPENSING.WORKSPACE);
  }

  acknowledgeAlert(workspaceId: string, alertId: string, note?: string) {
    return this.httpSrv.postOr<{ alertId: string }>(BASE_API.DISPENSING.ALERT_ACKNOWLEDGE(workspaceId, alertId), { note }, { alertId }, LoadingKeys.DISPENSING.ALERT_ACKNOWLEDGE);
  }

  updateItem(workspaceId: string, itemId: string, patch: { qtyToDispense?: number; status?: DispenseItemStatus; batchNo?: string }) {
    return this.httpSrv.patchOr<DispenseMedicationItem | null>(BASE_API.DISPENSING.ITEM_UPDATE(workspaceId, itemId), patch, null, LoadingKeys.DISPENSING.ITEM_UPDATE);
  }

  replaceItem(workspaceId: string, itemId: string, alternativeMedicineId: string, reason: string) {
    return this.httpSrv.postOr<DispenseMedicationItem | null>(BASE_API.DISPENSING.ITEM_REPLACE(workspaceId, itemId), { alternativeMedicineId, reason }, null, LoadingKeys.DISPENSING.ITEM_REPLACE);
  }

  reserveItem(workspaceId: string, itemId: string, note?: string) {
    return this.httpSrv.postOr<DispenseMedicationItem | null>(BASE_API.DISPENSING.ITEM_RESERVE(workspaceId, itemId), { note }, null, LoadingKeys.DISPENSING.ITEM_RESERVE);
  }

  scanItem(workspaceId: string, itemId: string, barcode: string) {
    return this.httpSrv.postOr<{ matched: boolean }>(BASE_API.DISPENSING.ITEM_SCAN(workspaceId, itemId), { barcode }, { matched: true }, LoadingKeys.DISPENSING.ITEM_SCAN);
  }

  getBatches(medicineId: string) {
    return this.httpSrv.getOr<BatchOption[]>(BASE_API.DISPENSING.MEDICINE_BATCHES(medicineId), MOCK.batches(), LoadingKeys.DISPENSING.MEDICINE_BATCHES);
  }

  getMedicineDetail(medicineId: string) {
    return this.httpSrv.getOr<DispenseMedicineDetail>(BASE_API.DISPENSING.MEDICINE_DETAIL(medicineId), MOCK.medicineDetail(medicineId), LoadingKeys.DISPENSING.MEDICINE_DETAIL);
  }

  holdPrescription(workspaceId: string, reason: string) {
    return this.httpSrv.postOr<{ workspaceId: string }>(BASE_API.DISPENSING.HOLD(workspaceId), { reason }, { workspaceId }, LoadingKeys.DISPENSING.HOLD);
  }

  cancelPrescription(workspaceId: string, reason: string) {
    return this.httpSrv.postOr<{ workspaceId: string }>(BASE_API.DISPENSING.CANCEL(workspaceId), { reason }, { workspaceId }, LoadingKeys.DISPENSING.CANCEL);
  }

  completeDispensing(workspaceId: string, pharmacistNotes?: string) {
    return this.httpSrv.postOr<DispenseSummary>(BASE_API.DISPENSING.COMPLETE(workspaceId), { pharmacistNotes }, MOCK.summary(workspaceId), LoadingKeys.DISPENSING.COMPLETE);
  }

  // #endregion
}

// ─────────────────────────────────────────────────────────────────────────────
// Bundled mock data — used until backend endpoints land.
// ─────────────────────────────────────────────────────────────────────────────
const MOCK = {
  queue: (): DispenseQueueItem[] => [
    { queueId: 'q-1', queueNumber: 12, prescriptionNumber: 'RX-2026-00451', patientId: 'p-1', patientName: 'Pham Thi Lan', mrn: 'MRN-009211', wardOrClinic: 'Internal Medicine', priority: 'Critical', prescribingDoctor: 'Dr. Nguyen Van A', medicationCount: 3, createdAt: new Date(Date.now() - 18 * 60_000).toISOString(), status: 'Waiting' },
    { queueId: 'q-2', queueNumber: 13, prescriptionNumber: 'RX-2026-00452', patientId: 'p-2', patientName: 'Tran Van Hung', mrn: 'MRN-009098', wardOrClinic: 'Outpatient Clinic', priority: 'Normal', prescribingDoctor: 'Dr. Le Thi B', medicationCount: 2, createdAt: new Date(Date.now() - 12 * 60_000).toISOString(), status: 'Waiting' },
    { queueId: 'q-3', queueNumber: 14, prescriptionNumber: 'RX-2026-00453', patientId: 'p-3', patientName: 'Le Thi Hoa', mrn: 'MRN-009076', wardOrClinic: 'Pediatrics', priority: 'High', prescribingDoctor: 'Dr. Hoang Van C', medicationCount: 4, createdAt: new Date(Date.now() - 6 * 60_000).toISOString(), status: 'Verifying' },
    { queueId: 'q-4', queueNumber: 15, prescriptionNumber: 'RX-2026-00454', patientId: 'p-4', patientName: 'Vo Thanh Tung', mrn: 'MRN-008991', wardOrClinic: 'Surgery', priority: 'Normal', prescribingDoctor: 'Dr. Nguyen Van A', medicationCount: 1, createdAt: new Date(Date.now() - 40 * 60_000).toISOString(), status: 'OnHold' },
    { queueId: 'q-5', queueNumber: 10, prescriptionNumber: 'RX-2026-00449', patientId: 'p-5', patientName: 'Nguyen Thi Mai Anh', mrn: 'MRN-008870', wardOrClinic: 'Cardiology', priority: 'Normal', prescribingDoctor: 'Dr. Tran Thi D', medicationCount: 2, createdAt: new Date(Date.now() - 90 * 60_000).toISOString(), status: 'Completed' },
  ],

  stats: (): DispenseQueueStats => ({
    pendingCount: 2,
    inProgressCount: 1,
    completedTodayCount: 18,
    averageDispensingMinutes: 6.4,
  }),

  workspace: (queueId: string): DispenseWorkspace => {
    const queueEntry = MOCK.queue().find(q => q.queueId === queueId) ?? MOCK.queue()[0];
    return {
      workspaceId: `ws-${queueEntry.queueId}`,
      queueId: queueEntry.queueId,
      prescriptionNumber: queueEntry.prescriptionNumber,
      status: queueEntry.status === 'Waiting' ? 'Verifying' : queueEntry.status,
      currentStage: 'ClinicalVerification',
      prescribingDoctor: queueEntry.prescribingDoctor,
      createdAt: queueEntry.createdAt,
      dispensingStartedAt: null,
      pharmacistNotes: '',
      patient: {
        patientId: queueEntry.patientId,
        fullName: queueEntry.patientName,
        mrn: queueEntry.mrn,
        gender: 'Female',
        ageYears: 34,
        allergies: ['Penicillin'],
        allergyFreeText: null,
        chronicConditions: ['Hypertension'],
        primaryDiagnosis: 'Acute bacterial sinusitis',
        insuranceProvider: 'VietHealth Insurance',
        insuranceCovered: true,
        isPregnant: false,
        isPediatric: false,
        isElderly: false,
        isHighRisk: queueEntry.priority === 'Critical',
      },
      items: [
        {
          id: 'item-1',
          medicineId: 'm-2',
          name: 'Amoxicillin 250mg',
          genericName: 'Amoxicillin',
          strength: '250mg',
          dosageForm: 'Capsule',
          route: 'Oral',
          dose: '1 capsule',
          frequency: '3 times/day',
          durationDays: 7,
          qtyPrescribed: 21,
          qtyToDispense: 21,
          unit: 'Capsule',
          status: 'NotPicked',
          shelfLocation: 'Shelf A-12',
          batchNo: 'BT2024002',
          expiryDate: '08/2025',
          availableBatches: MOCK.batches(),
          isControlledSubstance: false,
          isHighAlert: false,
          alternatives: [
            { id: 'alt-1', name: 'Amoxicillin (Generic Brand B)', manufacturer: 'GenPharm', stock: 60 },
          ],
          warnings: [
            { id: 'w-1', type: 'AllergyWarning', severity: 'Critical', message: 'Patient has a documented Penicillin allergy. Amoxicillin is a Penicillin-class antibiotic.', recommendation: 'Confirm with prescriber before dispensing or substitute a non-Penicillin antibiotic.', acknowledged: false },
          ],
        },
        {
          id: 'item-2',
          medicineId: 'm-3',
          name: 'Ibuprofen 400mg',
          genericName: 'Ibuprofen',
          strength: '400mg',
          dosageForm: 'Tablet',
          route: 'Oral',
          dose: '1 tablet',
          frequency: '2 times/day',
          durationDays: 5,
          qtyPrescribed: 10,
          qtyToDispense: 10,
          unit: 'Tablet',
          status: 'NotPicked',
          shelfLocation: 'Shelf C-08',
          batchNo: 'BT2024003',
          expiryDate: '03/2026',
          availableBatches: MOCK.batches(),
          isControlledSubstance: false,
          isHighAlert: false,
          alternatives: [],
          warnings: [],
        },
        {
          id: 'item-3',
          medicineId: 'm-5',
          name: 'Insulin Glargine',
          genericName: 'Insulin Glargine',
          strength: '100IU/mL',
          dosageForm: 'Pen',
          route: 'Subcutaneous',
          dose: '10 units',
          frequency: 'Once daily',
          durationDays: 30,
          qtyPrescribed: 1,
          qtyToDispense: 1,
          unit: 'Pen',
          status: 'NotPicked',
          shelfLocation: 'Cold Storage R2',
          batchNo: 'BT2024005',
          expiryDate: '11/2025',
          availableBatches: MOCK.batches(),
          isControlledSubstance: false,
          isHighAlert: true,
          alternatives: [],
          warnings: [
            { id: 'w-2', type: 'HighDose', severity: 'High', message: 'High-alert medication — verify dose and patient identity before dispensing.', recommendation: 'Independent double-check required.', acknowledged: false },
          ],
        },
      ],
    };
  },

  batches: (): BatchOption[] => [
    { batchNo: 'BT2024002', expiryDate: '08/2025', quantityAvailable: 80, location: 'Shelf A-12', isNearExpiry: false, isExpired: false },
    { batchNo: 'BT2023998', expiryDate: '02/2025', quantityAvailable: 12, location: 'Shelf A-13', isNearExpiry: true, isExpired: false },
  ],

  medicineDetail: (medicineId: string): DispenseMedicineDetail => ({
    medicineId,
    name: 'Amoxicillin 250mg',
    genericName: 'Amoxicillin',
    manufacturer: 'MediLife',
    stockByLocation: [
      { location: 'Shelf A-12', quantity: 80 },
      { location: 'Central Warehouse', quantity: 420 },
    ],
    alternatives: [
      { id: 'alt-1', name: 'Amoxicillin (Generic Brand B)', manufacturer: 'GenPharm', stock: 60 },
      { id: 'alt-2', name: 'Cephalexin 250mg', manufacturer: 'CoreMed', stock: 34 },
    ],
    interactionWarnings: ['May reduce efficacy of oral contraceptives.'],
    dispensingHistory: [
      { date: new Date(Date.now() - 30 * 86_400_000).toISOString(), quantity: 21, pharmacist: 'Sarah Johnson' },
    ],
  }),

  summary: (workspaceId: string): DispenseSummary => ({
    workspaceId,
    itemsDispensedCount: 3,
    itemsRemainingCount: 0,
    inventoryChangesCount: 3,
    insuranceCoverageAmount: 18.5,
    patientPaymentAmount: 6.2,
    dispensingTimeSeconds: 312,
    pharmacistName: 'Current Pharmacist',
  }),
};
