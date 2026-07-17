import { inject, Injectable } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import { LoadingKeys } from "../../shared/types/loading";
import {
  ClinicalWarning,
  FavoriteMedication,
  MedicineCatalogItem,
  PrescriptionDraft,
  PrescriptionSummaryTotals,
  PrescriptionTemplate,
  RecentPrescriptionSummary,
  RxMedicationItem,
} from "../../shared/types/prescription-rx.types";
import { HttpService } from "../common/http.service";

@Injectable({ providedIn: 'root' })
export class PrescriptionService {
  // #region Inject Services
  private readonly httpSrv = inject(HttpService);
  // #endregion

  // #region Methods
  getDraft(prescriptionId: string) {
    return this.httpSrv.getOr<PrescriptionDraft>(BASE_API.PRESCRIPTION_RX.DRAFT(prescriptionId), MOCK.draft(prescriptionId), LoadingKeys.PRESCRIPTION.GET_DRAFT);
  }

  saveDraft(draft: PrescriptionDraft) {
    return this.httpSrv.postOr<PrescriptionDraft>(BASE_API.PRESCRIPTION_RX.UPDATE(draft.id), draft, draft, LoadingKeys.PRESCRIPTION.SAVE_DRAFT);
  }

  issue(draft: PrescriptionDraft) {
    return this.httpSrv.postOr<PrescriptionDraft>(BASE_API.PRESCRIPTION_RX.ISSUE(draft.id), draft, { ...draft, status: 'Issued' }, LoadingKeys.PRESCRIPTION.ISSUE);
  }

  cancel(draft: PrescriptionDraft, reason: string) {
    return this.httpSrv.postOr<PrescriptionDraft>(BASE_API.PRESCRIPTION_RX.CANCEL(draft.id), { reason }, { ...draft, status: 'Cancelled' }, LoadingKeys.PRESCRIPTION.CANCEL);
  }

  searchMedicines(query: string) {
    const url = `${BASE_API.PRESCRIPTION_RX.MEDICINE_SEARCH}?query=${encodeURIComponent(query)}`;
    const fallback = MOCK.catalog.filter(m =>
      !query || m.name.toLowerCase().includes(query.toLowerCase()) || m.genericName.toLowerCase().includes(query.toLowerCase())
    );
    return this.httpSrv.getOr<MedicineCatalogItem[]>(url, fallback, LoadingKeys.MEDICINE.SEARCH);
  }

  checkClinicalWarnings(patientId: string, items: RxMedicationItem[]) {
    return this.httpSrv.postOr<Record<string, ClinicalWarning[]>>(
      BASE_API.PRESCRIPTION_RX.CDS_CHECK,
      { patientId, items },
      MOCK.cdsCheck(items),
      LoadingKeys.PRESCRIPTION.CDS_CHECK
    );
  }

  getCostEstimate(prescriptionId: string, items: RxMedicationItem[]) {
    return this.httpSrv.postOr<PrescriptionSummaryTotals>(
      BASE_API.PRESCRIPTION_RX.COST_ESTIMATE(prescriptionId),
      { items },
      MOCK.costEstimate(items),
      LoadingKeys.PRESCRIPTION.COST_ESTIMATE
    );
  }

  getRecentPrescriptions(patientId: string) {
    return this.httpSrv.getOr<RecentPrescriptionSummary[]>(BASE_API.PRESCRIPTION_RX.RECENT(patientId), MOCK.recent, LoadingKeys.PRESCRIPTION.RECENT);
  }

  getFavorites(doctorId: string) {
    return this.httpSrv.getOr<FavoriteMedication[]>(BASE_API.PRESCRIPTION_RX.FAVORITES(doctorId), MOCK.favorites, LoadingKeys.PRESCRIPTION.FAVORITES);
  }

  getTemplates(doctorId: string) {
    return this.httpSrv.getOr<PrescriptionTemplate[]>(BASE_API.PRESCRIPTION_RX.TEMPLATES(doctorId), MOCK.templates, LoadingKeys.PRESCRIPTION.TEMPLATES);
  }

  // #endregion
}

// ─────────────────────────────────────────────────────────────────────────────
// Bundled mock data — used until backend endpoints land.
// ─────────────────────────────────────────────────────────────────────────────
const MOCK = {
  catalog: <MedicineCatalogItem[]>[
    { id: 'mc-1', name: 'Amoxicillin', genericName: 'Amoxicillin', brandName: 'Amoxil', strength: '500 mg', dosageForm: 'Capsule', route: 'Oral', stock: 240, stockStatus: 'InStock', insuranceCovered: true, unitPrice: 2500, isControlledSubstance: false, isAntibiotic: true, isHighAlert: false, isOtc: false, isPrescriptionOnly: true },
    { id: 'mc-2', name: 'Lisinopril', genericName: 'Lisinopril', brandName: 'Zestril', strength: '20 mg', dosageForm: 'Tablet', route: 'Oral', stock: 180, stockStatus: 'InStock', insuranceCovered: true, unitPrice: 1800, isControlledSubstance: false, isAntibiotic: false, isHighAlert: false, isOtc: false, isPrescriptionOnly: true },
    { id: 'mc-3', name: 'Atorvastatin', genericName: 'Atorvastatin', brandName: 'Lipitor', strength: '20 mg', dosageForm: 'Tablet', route: 'Oral', stock: 12, stockStatus: 'Low', insuranceCovered: true, unitPrice: 2100, isControlledSubstance: false, isAntibiotic: false, isHighAlert: false, isOtc: false, isPrescriptionOnly: true },
    { id: 'mc-4', name: 'Metformin', genericName: 'Metformin HCl', brandName: 'Glucophage', strength: '500 mg', dosageForm: 'Tablet', route: 'Oral', stock: 320, stockStatus: 'InStock', insuranceCovered: true, unitPrice: 1200, isControlledSubstance: false, isAntibiotic: false, isHighAlert: false, isOtc: false, isPrescriptionOnly: true },
    { id: 'mc-5', name: 'Tramadol', genericName: 'Tramadol HCl', brandName: 'Ultram', strength: '50 mg', dosageForm: 'Tablet', route: 'Oral', stock: 0, stockStatus: 'OutOfStock', insuranceCovered: false, unitPrice: 3200, isControlledSubstance: true, isAntibiotic: false, isHighAlert: true, isOtc: false, isPrescriptionOnly: true },
    { id: 'mc-6', name: 'Paracetamol', genericName: 'Acetaminophen', brandName: 'Panadol', strength: '500 mg', dosageForm: 'Tablet', route: 'Oral', stock: 500, stockStatus: 'InStock', insuranceCovered: true, unitPrice: 500, isControlledSubstance: false, isAntibiotic: false, isHighAlert: false, isOtc: true, isPrescriptionOnly: false },
    { id: 'mc-7', name: 'Cetirizine', genericName: 'Cetirizine HCl', brandName: 'Zyrtec', strength: '10 mg', dosageForm: 'Tablet', route: 'Oral', stock: 150, stockStatus: 'InStock', insuranceCovered: false, unitPrice: 900, isControlledSubstance: false, isAntibiotic: false, isHighAlert: false, isOtc: true, isPrescriptionOnly: false },
    { id: 'mc-8', name: 'Warfarin', genericName: 'Warfarin Sodium', brandName: 'Coumadin', strength: '5 mg', dosageForm: 'Tablet', route: 'Oral', stock: 60, stockStatus: 'InStock', insuranceCovered: true, unitPrice: 1500, isControlledSubstance: false, isAntibiotic: false, isHighAlert: true, isOtc: false, isPrescriptionOnly: true },
  ],

  draft: (id: string): PrescriptionDraft => ({
    id,
    prescriptionNumber: 'RX-2026-00891',
    status: 'Draft',
    createdAt: new Date().toISOString(),
    visitId: 'APT-2026-000142',
    queueNumber: 'A-014',
    doctor: {
      doctorId: 'doc-001',
      fullName: 'Dr. Le Hoang Nam',
      department: 'Internal Medicine',
      licenseNumber: 'VN-MD-88421',
      avatarUrl: null,
    },
    patient: {
      patientId: 'pat-142',
      avatarUrl: null,
      fullName: 'Nguyen Thi Mai Anh',
      gender: 'Female',
      ageYears: 39,
      dateOfBirth: '1986-08-14',
      heightCm: 162,
      weightKg: 68,
      bloodType: 'O+',
      phone: '+84 912 348 921',
      insuranceProvider: 'AIA Vietnam',
      insuranceCovered: true,
      allergies: ['Penicillin (anaphylaxis)', 'Shellfish'],
      chronicConditions: ['Hypertension', 'Type 2 Diabetes'],
      primaryDiagnosis: 'Essential hypertension, poorly controlled',
      flags: {
        drugAllergy: true,
        pregnancy: false,
        pediatric: false,
        elderly: false,
        highRisk: false,
        controlledRestricted: false,
      },
    },
    primaryDiagnosis: { code: 'I10', description: 'Essential (primary) hypertension' },
    secondaryDiagnoses: [{ code: 'E11.9', description: 'Type 2 diabetes mellitus without complications' }],
    clinicalNotes: 'Patient reports persistent headache and elevated home BP readings (145-155/92-98) over the past two weeks despite adherence to current regimen.',
    symptoms: 'Occipital headache, fatigue, no visual changes, no chest pain.',
    doctorNotes: '',
    items: [],
  }),

  cdsCheck: (items: RxMedicationItem[]): Record<string, ClinicalWarning[]> => {
    const out: Record<string, ClinicalWarning[]> = {};
    for (const item of items) {
      const warnings: ClinicalWarning[] = [];
      if (item.name.toLowerCase().includes('amoxicillin')) {
        warnings.push({
          id: `w-${item.id}-allergy`, type: 'AllergyWarning', severity: 'Critical',
          message: 'Patient has a documented Penicillin allergy (anaphylaxis history).',
          recommendation: 'Consider a non-penicillin alternative (e.g. Azithromycin).',
          acknowledged: false,
        });
      }
      if (item.name.toLowerCase().includes('warfarin')) {
        warnings.push({
          id: `w-${item.id}-interaction`, type: 'DrugInteraction', severity: 'High',
          message: 'Interacts with Aspirin — increased bleeding risk.',
          recommendation: 'Monitor INR closely or adjust dose.',
          acknowledged: false,
        });
      }
      if (item.isControlledSubstance) {
        warnings.push({
          id: `w-${item.id}-controlled`, type: 'HighDose', severity: 'Medium',
          message: 'Controlled substance — verify dose against maximum daily limit.',
          recommendation: null,
          acknowledged: false,
        });
      }
      if (warnings.length) out[item.id] = warnings;
    }
    return out;
  },

  costEstimate: (items: RxMedicationItem[]): PrescriptionSummaryTotals => {
    const totalQuantity = items.reduce((s, i) => s + i.quantity, 0);
    const totalDailyDoses = items.reduce((s, i) => s + Object.values(i.timing).filter(Boolean).length, 0);
    const estimatedCost = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
    const insuranceCoverageAmount = items.filter(i => i.insuranceCovered).reduce((s, i) => s + i.quantity * i.unitPrice * 0.8, 0);
    return {
      totalMedications: items.length,
      totalQuantity,
      totalDailyDoses,
      estimatedCost,
      insuranceCoverageAmount,
      insuranceCoveragePercent: estimatedCost ? Math.round((insuranceCoverageAmount / estimatedCost) * 100) : 0,
      patientPayment: estimatedCost - insuranceCoverageAmount,
      currency: 'VND',
    };
  },

  recent: <RecentPrescriptionSummary[]>[
    { id: 'rx-1', prescriptionNumber: 'RX-2026-00432', date: new Date(Date.now() - 86400000).toISOString(), status: 'Issued', medicationNames: ['Lisinopril', 'Atorvastatin'] },
    { id: 'rx-2', prescriptionNumber: 'RX-2026-00410', date: new Date(Date.now() - 45 * 86400000).toISOString(), status: 'Issued', medicationNames: ['Metformin'] },
    { id: 'rx-3', prescriptionNumber: 'RX-2026-00298', date: new Date(Date.now() - 180 * 86400000).toISOString(), status: 'Expired', medicationNames: ['Cetirizine'] },
  ],

  favorites: <FavoriteMedication[]>[
    { id: 'fav-1', medicineId: 'mc-2', name: 'Lisinopril', strength: '20 mg', dose: '1 tablet', frequency: 'QD', durationDays: 90, quantity: 90, unit: 'tablet' },
    { id: 'fav-2', medicineId: 'mc-4', name: 'Metformin', strength: '500 mg', dose: '1 tablet', frequency: 'BID', durationDays: 90, quantity: 180, unit: 'tablet' },
    { id: 'fav-3', medicineId: 'mc-6', name: 'Paracetamol', strength: '500 mg', dose: '1 tablet', frequency: 'PRN', durationDays: 7, quantity: 20, unit: 'tablet' },
  ],

  templates: <PrescriptionTemplate[]>[
    {
      id: 'tpl-1', name: 'Hypertension Starter', description: 'First-line antihypertensive + statin', itemCount: 2,
      items: [
        { medicineId: 'mc-2', name: 'Lisinopril', genericName: 'Lisinopril', brandName: 'Zestril', strength: '20 mg', dosageForm: 'Tablet', route: 'Oral', dose: '1 tablet', frequency: 'QD', timing: { morning: true }, beforeMeal: false, afterMeal: false, prn: false, durationDays: 90, quantity: 90, unit: 'tablet', refillCount: 2, instructions: 'Take in the morning', pharmacyNotes: null, insuranceCovered: true, stockStatus: 'InStock', isControlledSubstance: false, isAntibiotic: false, isHighAlert: false, isOtc: false, isPrescriptionOnly: true, isCustomMedication: false, status: 'Active', unitPrice: 1800 },
        { medicineId: 'mc-3', name: 'Atorvastatin', genericName: 'Atorvastatin', brandName: 'Lipitor', strength: '20 mg', dosageForm: 'Tablet', route: 'Oral', dose: '1 tablet', frequency: 'QHS', timing: { evening: true }, beforeMeal: false, afterMeal: false, prn: false, durationDays: 90, quantity: 90, unit: 'tablet', refillCount: 2, instructions: 'Take at bedtime, avoid grapefruit juice', pharmacyNotes: null, insuranceCovered: true, stockStatus: 'Low', isControlledSubstance: false, isAntibiotic: false, isHighAlert: false, isOtc: false, isPrescriptionOnly: true, isCustomMedication: false, status: 'Active', unitPrice: 2100 },
      ],
    },
    {
      id: 'tpl-2', name: 'T2DM Maintenance', description: 'Metformin maintenance dosing', itemCount: 1,
      items: [
        { medicineId: 'mc-4', name: 'Metformin', genericName: 'Metformin HCl', brandName: 'Glucophage', strength: '500 mg', dosageForm: 'Tablet', route: 'Oral', dose: '1 tablet', frequency: 'BID', timing: { morning: true, evening: true }, beforeMeal: false, afterMeal: true, prn: false, durationDays: 90, quantity: 180, unit: 'tablet', refillCount: 2, instructions: 'Take with meals to reduce GI upset', pharmacyNotes: null, insuranceCovered: true, stockStatus: 'InStock', isControlledSubstance: false, isAntibiotic: false, isHighAlert: false, isOtc: false, isPrescriptionOnly: true, isCustomMedication: false, status: 'Active', unitPrice: 1200 },
      ],
    },
  ],
};
