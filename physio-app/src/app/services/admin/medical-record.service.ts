import { inject, Injectable } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import { Severity } from "../../shared/enums/severity";
import { PaginationData } from "../../shared/types/common";
import { LoadingKeys } from "../../shared/types/loading";
import {
  BillingSummary,
  ClinicalNoteRow,
  ClinicalSnapshot,
  DiagnosisRow,
  EncounterRow,
  HistoricalSummary,
  ImagingStudyRow,
  LabReportRow,
  LabResultRow,
  PatientAllergy,
  PatientContext,
  PatientDemographics,
  PrescriptionRow,
} from "../../shared/types/medical-record.types";
import { HttpService } from "../common/http.service";

@Injectable({ providedIn: 'root' })
export class MedicalRecordService {
  // #region Inject Services
  private readonly httpSrv = inject(HttpService);
  // #endregion

  // #region Methods
  getContext(patientId: string) { return this.httpSrv.getOr<PatientContext>(BASE_API.MEDICAL_RECORD.CONTEXT(patientId), MOCK.context(patientId), LoadingKeys.MEDICAL_RECORD.CONTEXT); }
  getSnapshot(patientId: string) { return this.httpSrv.getOr<ClinicalSnapshot>(BASE_API.MEDICAL_RECORD.SNAPSHOT(patientId), MOCK.snapshot, LoadingKeys.MEDICAL_RECORD.SNAPSHOT); }
  getDemographics(patientId: string) { return this.httpSrv.getOr<PatientDemographics>(BASE_API.MEDICAL_RECORD.DEMOGRAPHICS(patientId), MOCK.demographics(patientId), LoadingKeys.MEDICAL_RECORD.DEMOGRAPHICS); }
  getHistory(patientId: string) { return this.httpSrv.getOr<HistoricalSummary>(BASE_API.MEDICAL_RECORD.HISTORY(patientId), MOCK.history, LoadingKeys.MEDICAL_RECORD.HISTORY); }
  getAllergies(patientId: string) { return this.httpSrv.getOr<PaginationData<PatientAllergy>>(BASE_API.MEDICAL_RECORD.ALLERGIES(patientId), MOCK.allergies, LoadingKeys.MEDICAL_RECORD.ALLERGIES); }
  getEncounters(patientId: string) { return this.httpSrv.getOr<PaginationData<EncounterRow>>(BASE_API.MEDICAL_RECORD.ENCOUNTERS(patientId), MOCK.encounters, LoadingKeys.MEDICAL_RECORD.ENCOUNTERS); }
  getDiagnoses(patientId: string) { return this.httpSrv.getOr<PaginationData<DiagnosisRow>>(BASE_API.MEDICAL_RECORD.DIAGNOSES(patientId), MOCK.diagnoses, LoadingKeys.MEDICAL_RECORD.DIAGNOSES); }
  getPrescriptions(patientId: string) { return this.httpSrv.getOr<PaginationData<PrescriptionRow>>(BASE_API.MEDICAL_RECORD.PRESCRIPTIONS(patientId), MOCK.prescriptions, LoadingKeys.MEDICAL_RECORD.PRESCRIPTIONS); }
  getLab(patientId: string) { return this.httpSrv.getOr<{ results: LabResultRow[]; reports: LabReportRow[] }>(BASE_API.MEDICAL_RECORD.LAB(patientId), { results: MOCK.labResults, reports: MOCK.labReports }, LoadingKeys.MEDICAL_RECORD.LAB); }
  getImaging(patientId: string) { return this.httpSrv.getOr<PaginationData<ImagingStudyRow>>(BASE_API.MEDICAL_RECORD.IMAGING(patientId), MOCK.imaging, LoadingKeys.MEDICAL_RECORD.IMAGING); }
  getNotes(patientId: string) { return this.httpSrv.getOr<PaginationData<ClinicalNoteRow>>(BASE_API.MEDICAL_RECORD.NOTES(patientId), MOCK.notes, LoadingKeys.MEDICAL_RECORD.NOTES); }
  getBilling(patientId: string) { return this.httpSrv.getOr<BillingSummary>(BASE_API.MEDICAL_RECORD.BILLING(patientId), MOCK.billing, LoadingKeys.MEDICAL_RECORD.BILLING); }
  // #endregion
}

// ─────────────────────────────────────────────────────────────────────────────
// Bundled mock data — realistic seed used until backend endpoints land.
// All shapes match server entity field names so swapping over is a no-op.
// ─────────────────────────────────────────────────────────────────────────────
const today = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString();
};
const dateOnly = (offsetDays = 0) => today(offsetDays).slice(0, 10);

const MOCK = {
  context: (patientId: string): PatientContext => ({
    patientId,
    mrn: 'PAT-2026-000142',
    fullName: 'Nguyen Thi Mai Anh',
    avatarUrl: null,
    gender: 'Female',
    dateOfBirth: '1986-08-14',
    ageYears: 39,
    bloodType: 'O+',
    phone: '+84 912 348 921',
    email: 'mai.anh@example.com',
    insuranceProvider: 'AIA Vietnam',
    insurancePolicyNumber: 'POL-INS-2026-001',
    insuranceExpiryDate: '2027-12-31',
    admissionStatus: 'Outpatient',
    roomNumber: null,
    admittedAt: null,
    primaryDoctor: {
      userId: 'doc-001',
      fullName: 'Dr. Le Hoang Nam',
      role: 'Primary Physician',
      department: 'Internal Medicine',
      phone: '+84 901 222 333',
      avatarUrl: null,
    },
    careTeam: [
      { userId: 'doc-001', fullName: 'Dr. Le Hoang Nam', role: 'Primary Physician', department: 'Internal Medicine' },
      { userId: 'doc-002', fullName: 'Dr. Tran Bich Thuy', role: 'Cardiologist', department: 'Cardiology' },
      { userId: 'nur-001', fullName: 'NS Pham Quynh', role: 'Charge Nurse', department: 'Internal Medicine' },
      { userId: 'pha-001', fullName: 'Pharm. Vu Kim Anh', role: 'Pharmacist', department: 'Pharmacy' },
    ],
    riskFlags: [
      { key: 'allergy', label: 'Penicillin allergy', severity: Severity.Mild, note: 'Anaphylaxis history (Severe)' },
      { key: 'chronic', label: 'Hypertension, T2DM', severity: Severity.Mild, note: 'Chronic disease management' },
      { key: 'fall', label: 'Fall risk: moderate', severity: Severity.Mild, note: 'Reported dizziness on last visit' },
    ],
  }),

  snapshot: <ClinicalSnapshot>{
    activeDiagnosesCount: 5,
    activeMedicationsCount: 4,
    knownAllergiesCount: 2,
    pendingOrdersCount: 3,
    outstandingBalance: 1_250_000,
    currency: 'VND',
    recentLabAlerts: [
      { labOrderItemId: 'lab-i-9', testName: 'Potassium (K+)', resultValue: '5.8', resultUnit: 'mmol/L', abnormalFlag: 'H', isCritical: false, resultedAt: today(-1) },
      { labOrderItemId: 'lab-i-10', testName: 'Hemoglobin A1c', resultValue: '8.9', resultUnit: '%', abnormalFlag: 'HH', isCritical: false, resultedAt: today(-3) },
      { labOrderItemId: 'lab-i-11', testName: 'Troponin I', resultValue: '0.18', resultUnit: 'ng/mL', abnormalFlag: 'H', isCritical: true, resultedAt: today(-7) },
    ],
    upcomingAppointments: [
      { appointmentId: 'apt-200', scheduledAt: today(+3), doctorName: 'Dr. Le Hoang Nam', department: 'Internal Medicine', status: 'Scheduled' },
      { appointmentId: 'apt-201', scheduledAt: today(+14), doctorName: 'Dr. Tran Bich Thuy', department: 'Cardiology', status: 'Confirmed' },
    ],
  },

  demographics: (patientId: string): PatientDemographics => ({
    patientId,
    fullName: 'Nguyen Thi Mai Anh',
    preferredName: 'Mai Anh',
    gender: 'Female',
    dateOfBirth: '1986-08-14',
    maritalStatus: 'Married',
    nationality: 'Vietnamese',
    preferredLanguage: 'Vietnamese',
    occupation: 'Software Engineer',
    phone: '+84 912 348 921',
    email: 'mai.anh@example.com',
    address: '24 Tran Hung Dao, District 1, Ho Chi Minh City',
    emergencyContactName: 'Nguyen Van Tuan',
    emergencyContactPhone: '+84 988 111 222',
    emergencyContactRelationship: 'Spouse',
  }),

  history: <HistoricalSummary>{
    pastMedicalHistory:
      'Type 2 Diabetes Mellitus (2019), Stage 1 Hypertension (2020), Appendectomy (2010). ' +
      'Routine annual physicals; last colonoscopy 2024 (normal).',
    familyHistory:
      'Father — Type 2 Diabetes, Hypertension, MI age 62. Mother — Osteoporosis. ' +
      'Maternal grandmother — Breast cancer (post-menopausal).',
    socialHistory:
      'Non-smoker. Occasional alcohol (1–2 drinks/week). Sedentary office work; walks 30 min/day. ' +
      'Married, lives with spouse and one child. Denies recreational drug use.',
    reviewOfSystems:
      'General: no fever, no recent weight loss. Cardiovascular: occasional palpitations. ' +
      'Respiratory: clear. GI: mild reflux. Neuro: no focal deficits.',
    lastUpdatedAt: today(-2),
    lastUpdatedByName: 'Dr. Le Hoang Nam',
  },

  allergies: <PaginationData<PatientAllergy>>{
    hasNext: false,
    hasPrevious: false,
    pageNumber: 1,
    pageSize: 2,
    items: [
      {
        id: 'alg-1', allergenName: 'Penicillin', allergenType: 'Drug', reactionType: 'Anaphylaxis, hives',
        severity: Severity.Severe, firstOccurrenceDate: '2014-05-12', lastOccurrenceDate: '2018-09-03',
        treatmentGiven: 'IV epinephrine + steroids', notes: 'Cross-reactivity to cephalosporins suspected',
        isActive: true
      },
      {
        id: 'alg-2', allergenName: 'Shellfish', allergenType: 'Food', reactionType: 'Urticaria',
        severity: Severity.Moderate, firstOccurrenceDate: '2010-07-22', lastOccurrenceDate: '2019-08-11',
        treatmentGiven: 'Antihistamine', notes: 'Patient avoids all crustaceans',
        isActive: true
      },
    ],
    totalCount: 2,
    totalPages: 1
  },

  encounters: <PaginationData<EncounterRow>>{
    hasNext: false,
    hasPrevious: false,
    pageNumber: 1,
    pageSize: 2,
    items: [
      {
        appointmentId: 'apt-100', appointmentNumber: 'APT-2026-000142', scheduledAt: today(-1), endedAt: today(-1),
        status: 'Completed', consultationType: 'InPerson', doctorName: 'Dr. Le Hoang Nam', departmentName: 'Internal Medicine',
        appointmentTypeName: 'Follow-up', chiefComplaint: 'Fatigue, occasional headache',
        diagnosis: 'Hypertension, poorly controlled', treatmentPlan: 'Increase lisinopril to 20mg daily; recheck BP in 2 weeks',
        followUpDate: dateOnly(+14), durationMinutes: 25, roomNumber: '203', totalAmount: 850_000
      },
      {
        appointmentId: 'apt-099', appointmentNumber: 'APT-2026-000135', scheduledAt: today(-10), endedAt: today(-10),
        status: 'Completed', consultationType: 'InPerson', doctorName: 'Dr. Tran Bich Thuy', departmentName: 'Cardiology',
        appointmentTypeName: 'Consultation', chiefComplaint: 'Chest discomfort during exertion',
        diagnosis: 'Stable angina pectoris', treatmentPlan: 'ECG, stress test ordered; start aspirin 81mg',
        followUpDate: dateOnly(+30), durationMinutes: 40, roomNumber: 'C-12', totalAmount: 1_500_000
      },
      {
        appointmentId: 'apt-098', appointmentNumber: 'APT-2026-000128', scheduledAt: today(-45), endedAt: today(-45),
        status: 'Completed', consultationType: 'Telehealth', doctorName: 'Dr. Le Hoang Nam', departmentName: 'Internal Medicine',
        appointmentTypeName: 'Telehealth', chiefComplaint: 'Prescription refill',
        diagnosis: 'T2DM, controlled', treatmentPlan: 'Continue metformin 500mg BID; recheck HbA1c in 3 months',
        followUpDate: null, durationMinutes: 15, roomNumber: null, totalAmount: 350_000
      },
    ],
    totalCount: 3,
    totalPages: 1
  },

  diagnoses: <PaginationData<DiagnosisRow>>{
    hasNext: false,
    hasPrevious: false,
    pageNumber: 1,
    pageSize: 2,
    items: [
      {
        id: 'd-1', conditionName: 'Essential (primary) hypertension', conditionCategory: 'Cardiovascular',
        icd10Code: 'I10', diagnosedDate: '2020-03-15', diagnosedByName: 'Dr. Tran Bich Thuy',
        diagnosisHospitalName: 'Boo Central Hospital', severity: Severity.Moderate, currentStatus: 'Active',
        treatmentSummary: 'Lifestyle modification + ACE inhibitor', medicationsPrescribed: 'Lisinopril 20mg QD',
        followUpRequired: true, nextReviewDate: dateOnly(+14), notes: 'BP target <130/80'
      },
      {
        id: 'd-2', conditionName: 'Type 2 diabetes mellitus without complications', conditionCategory: 'Endocrine',
        icd10Code: 'E11.9', diagnosedDate: '2019-11-02', diagnosedByName: 'Dr. Le Hoang Nam',
        diagnosisHospitalName: 'Boo Central Hospital', severity: Severity.Moderate, currentStatus: 'Managed',
        treatmentSummary: 'Metformin + diet', medicationsPrescribed: 'Metformin 500mg BID',
        followUpRequired: true, nextReviewDate: dateOnly(+90), notes: 'HbA1c trending up — consider GLP-1 if >9%'
      },
      {
        id: 'd-3', conditionName: 'Gastroesophageal reflux disease', conditionCategory: 'Gastrointestinal',
        icd10Code: 'K21.9', diagnosedDate: '2022-06-10', diagnosedByName: 'Dr. Le Hoang Nam',
        diagnosisHospitalName: 'Boo Central Hospital', severity: Severity.Mild, currentStatus: 'Managed',
        treatmentSummary: 'PPI as needed', medicationsPrescribed: 'Omeprazole 20mg PRN',
        followUpRequired: false, nextReviewDate: null, notes: null
      },
      {
        id: 'd-4', conditionName: 'Mixed hyperlipidemia', conditionCategory: 'Cardiovascular',
        icd10Code: 'E78.2', diagnosedDate: '2021-04-22', diagnosedByName: 'Dr. Tran Bich Thuy',
        diagnosisHospitalName: 'Boo Central Hospital', severity: Severity.Moderate, currentStatus: 'Active',
        treatmentSummary: 'Statin therapy', medicationsPrescribed: 'Atorvastatin 20mg QHS',
        followUpRequired: true, nextReviewDate: dateOnly(+180), notes: 'LDL target <100'
      },
      {
        id: 'd-5', conditionName: 'Allergic rhinitis, unspecified', conditionCategory: 'Allergic',
        icd10Code: 'J30.9', diagnosedDate: '2017-09-14', diagnosedByName: 'Dr. Le Hoang Nam',
        diagnosisHospitalName: 'Boo Central Hospital', severity: Severity.Mild, currentStatus: 'InRemission',
        treatmentSummary: 'Seasonal antihistamine', medicationsPrescribed: 'Cetirizine PRN',
        followUpRequired: false, nextReviewDate: null, notes: null
      },
    ],
    totalCount: 5,
    totalPages: 1
  },

  prescriptions: <PaginationData<PrescriptionRow>>{
    hasNext: false,
    hasPrevious: false,
    pageNumber: 1,
    pageSize: 2,
    items: [
      {
        id: 'rx-1', prescriptionNumber: 'RX-2026-00432', prescriptionDate: today(-1),
        doctorName: 'Dr. Le Hoang Nam', diagnosis: 'Hypertension', instructions: 'Take in the morning with food',
        status: 'Active', validUntil: dateOnly(+90), refillCount: 0, maxRefills: 3, totalAmount: 450_000,
        items: [
          {
            id: 'ri-1', medicineName: 'Lisinopril', genericName: 'Lisinopril', strength: '20 mg', dosageForm: 'Tablet',
            dosageInstructions: '1 tablet once daily', frequency: 'QD', durationDays: 90,
            routeOfAdministration: 'Oral', quantityPrescribed: 90, quantityDispensed: 90,
            isControlledSubstance: false, specialInstructions: null
          },
          {
            id: 'ri-2', medicineName: 'Atorvastatin', genericName: 'Atorvastatin', strength: '20 mg', dosageForm: 'Tablet',
            dosageInstructions: '1 tablet at bedtime', frequency: 'QHS', durationDays: 90,
            routeOfAdministration: 'Oral', quantityPrescribed: 90, quantityDispensed: 90,
            isControlledSubstance: false, specialInstructions: 'Avoid grapefruit juice'
          },
        ]
      },
      {
        id: 'rx-2', prescriptionNumber: 'RX-2026-00410', prescriptionDate: today(-45),
        doctorName: 'Dr. Le Hoang Nam', diagnosis: 'T2DM', instructions: 'Take with meals to reduce GI upset',
        status: 'Active', validUntil: dateOnly(+45), refillCount: 1, maxRefills: 3, totalAmount: 320_000,
        items: [
          {
            id: 'ri-3', medicineName: 'Metformin', genericName: 'Metformin HCl', strength: '500 mg', dosageForm: 'Tablet',
            dosageInstructions: '1 tablet twice daily with meals', frequency: 'BID', durationDays: 90,
            routeOfAdministration: 'Oral', quantityPrescribed: 180, quantityDispensed: 180,
            isControlledSubstance: false, specialInstructions: null
          },
        ]
      },
      {
        id: 'rx-3', prescriptionNumber: 'RX-2026-00298', prescriptionDate: today(-180),
        doctorName: 'Dr. Tran Bich Thuy', diagnosis: 'Allergic rhinitis', instructions: null,
        status: 'Expired', validUntil: dateOnly(-90), refillCount: 0, maxRefills: 0, totalAmount: 60_000,
        items: [
          {
            id: 'ri-4', medicineName: 'Cetirizine', genericName: 'Cetirizine', strength: '10 mg', dosageForm: 'Tablet',
            dosageInstructions: '1 tablet daily PRN', frequency: 'PRN', durationDays: 30,
            routeOfAdministration: 'Oral', quantityPrescribed: 30, quantityDispensed: 30,
            isControlledSubstance: false, specialInstructions: null
          },
        ]
      },
    ],
    totalCount: 3,
    totalPages: 1
  },

  labResults: <LabResultRow[]>[
    {
      id: 'lab-i-1', labOrderId: 'lo-1', panelName: 'CBC', testName: 'Hemoglobin', resultValue: '13.2', resultUnit: 'g/dL',
      referenceRange: '12.0–15.5', abnormalFlag: 'N', isCritical: false, status: 'Completed',
      collectedAt: today(-3), resultedAt: today(-3), orderingDoctorName: 'Dr. Le Hoang Nam', verifiedByName: 'Pathologist A'
    },
    {
      id: 'lab-i-2', labOrderId: 'lo-1', panelName: 'CBC', testName: 'White Blood Cells', resultValue: '7.8', resultUnit: '×10⁹/L',
      referenceRange: '4.0–11.0', abnormalFlag: 'N', isCritical: false, status: 'Completed',
      collectedAt: today(-3), resultedAt: today(-3), orderingDoctorName: 'Dr. Le Hoang Nam', verifiedByName: 'Pathologist A'
    },
    {
      id: 'lab-i-3', labOrderId: 'lo-1', panelName: 'CBC', testName: 'Platelets', resultValue: '245', resultUnit: '×10⁹/L',
      referenceRange: '150–400', abnormalFlag: 'N', isCritical: false, status: 'Completed',
      collectedAt: today(-3), resultedAt: today(-3), orderingDoctorName: 'Dr. Le Hoang Nam', verifiedByName: 'Pathologist A'
    },
    {
      id: 'lab-i-4', labOrderId: 'lo-2', panelName: 'BMP', testName: 'Sodium (Na+)', resultValue: '139', resultUnit: 'mmol/L',
      referenceRange: '135–145', abnormalFlag: 'N', isCritical: false, status: 'Completed',
      collectedAt: today(-1), resultedAt: today(-1), orderingDoctorName: 'Dr. Le Hoang Nam', verifiedByName: 'Pathologist B'
    },
    {
      id: 'lab-i-5', labOrderId: 'lo-2', panelName: 'BMP', testName: 'Potassium (K+)', resultValue: '5.8', resultUnit: 'mmol/L',
      referenceRange: '3.5–5.0', abnormalFlag: 'H', isCritical: false, status: 'Completed',
      collectedAt: today(-1), resultedAt: today(-1), orderingDoctorName: 'Dr. Le Hoang Nam', verifiedByName: 'Pathologist B'
    },
    {
      id: 'lab-i-6', labOrderId: 'lo-2', panelName: 'BMP', testName: 'Creatinine', resultValue: '0.9', resultUnit: 'mg/dL',
      referenceRange: '0.6–1.2', abnormalFlag: 'N', isCritical: false, status: 'Completed',
      collectedAt: today(-1), resultedAt: today(-1), orderingDoctorName: 'Dr. Le Hoang Nam', verifiedByName: 'Pathologist B'
    },
    {
      id: 'lab-i-7', labOrderId: 'lo-3', panelName: 'Lipid Panel', testName: 'LDL Cholesterol', resultValue: '142', resultUnit: 'mg/dL',
      referenceRange: '<100', abnormalFlag: 'H', isCritical: false, status: 'Completed',
      collectedAt: today(-7), resultedAt: today(-7), orderingDoctorName: 'Dr. Tran Bich Thuy', verifiedByName: 'Pathologist A'
    },
    {
      id: 'lab-i-8', labOrderId: 'lo-3', panelName: 'Diabetes', testName: 'Hemoglobin A1c', resultValue: '8.9', resultUnit: '%',
      referenceRange: '<7.0', abnormalFlag: 'HH', isCritical: false, status: 'Completed',
      collectedAt: today(-3), resultedAt: today(-3), orderingDoctorName: 'Dr. Le Hoang Nam', verifiedByName: 'Pathologist A'
    },
    {
      id: 'lab-i-9', labOrderId: 'lo-4', panelName: 'Cardiac', testName: 'Troponin I', resultValue: '0.18', resultUnit: 'ng/mL',
      referenceRange: '<0.04', abnormalFlag: 'H', isCritical: true, status: 'Completed',
      collectedAt: today(-7), resultedAt: today(-7), orderingDoctorName: 'Dr. Tran Bich Thuy', verifiedByName: 'Pathologist B'
    },
  ],

  labReports: <LabReportRow[]>[
    {
      id: 'lr-1', reportNumber: 'LR-2026-00891', labOrderId: 'lo-2', reportedAt: today(-1),
      pathologistName: 'Dr. Pathologist B',
      overallImpression: 'Mildly elevated potassium. Suggest repeat with non-hemolyzed sample.',
      recommendations: 'Repeat BMP in 1 week.', criticalValues: null, isFinal: true, reportPdfUrl: null
    },
    {
      id: 'lr-2', reportNumber: 'LR-2026-00880', labOrderId: 'lo-3', reportedAt: today(-3),
      pathologistName: 'Dr. Pathologist A',
      overallImpression: 'LDL elevated; HbA1c poorly controlled.',
      recommendations: 'Optimize statin; consider GLP-1.', criticalValues: null, isFinal: true, reportPdfUrl: null
    },
  ],

  imaging: <PaginationData<ImagingStudyRow>>{
    hasNext: false,
    hasPrevious: false,
    pageNumber: 1,
    pageSize: 2,
    items: [
      {
        orderId: 'io-1', reportId: 'ir-1', orderNumber: 'IO-2026-00321', modalityName: 'CT', bodyPart: 'Chest',
        studyDate: today(-10), orderStatus: 'Completed', reportStatus: 'Final',
        radiologistName: 'Dr. Pham Van Hung', technique: 'CT chest with contrast',
        findings: 'No focal consolidation. Cardiac silhouette within normal limits. No mediastinal lymphadenopathy.',
        impression: 'Unremarkable chest CT.', recommendations: 'No follow-up needed.',
        isCritical: false, isNormal: true, imagesCount: 384, dicomStudyUid: '1.2.840.x.x.x.001',
        reportPdfUrl: null, imagesUrl: null
      },
      {
        orderId: 'io-2', reportId: 'ir-2', orderNumber: 'IO-2026-00305', modalityName: 'X-Ray', bodyPart: 'Knee — Left',
        studyDate: today(-30), orderStatus: 'Completed', reportStatus: 'Final',
        radiologistName: 'Dr. Pham Van Hung', technique: 'AP/Lateral views',
        findings: 'Mild medial joint space narrowing. No acute fracture or dislocation.',
        impression: 'Mild medial compartment osteoarthritis.', recommendations: 'Consider weight-bearing exercises.',
        isCritical: false, isNormal: false, imagesCount: 4, dicomStudyUid: null,
        reportPdfUrl: null, imagesUrl: null
      },
      {
        orderId: 'io-3', reportId: null, orderNumber: 'IO-2026-00328', modalityName: 'MRI', bodyPart: 'Brain',
        studyDate: today(+5), orderStatus: 'Scheduled', reportStatus: null,
        radiologistName: null, technique: null, findings: null, impression: null, recommendations: null,
        isCritical: false, isNormal: false, imagesCount: 0, dicomStudyUid: null,
        reportPdfUrl: null, imagesUrl: null
      },
    ],
    totalCount: 3,
    totalPages: 1
  },

  notes: <PaginationData<ClinicalNoteRow>>{
    hasNext: false,
    hasPrevious: false,
    pageNumber: 1,
    pageSize: 2,
    items: [
      {
        id: 'mr-1', recordNumber: 'MR-2026-001142', recordType: 'FollowUp', recordDate: dateOnly(-1),
        doctorName: 'Dr. Le Hoang Nam', appointmentNumber: 'APT-2026-000142',
        chiefComplaint: 'Fatigue, occasional headache. Home BP readings 145–155/92–98 over past 2 weeks.',
        historyOfPresentIllness: '39 y/o female with known HTN and T2DM, presents with persistent elevated BP despite current regimen. ' +
          'Reports occipital headache lasting 1–2 hours, no visual changes, no chest pain. Adherent to medications. No dietary changes.',
        physicalExamination: 'BP 152/96 (right arm, seated). HR 82, regular. Heart S1S2 normal, no murmurs. Lungs clear. No edema.',
        provisionalDiagnosis: 'Hypertension — poorly controlled',
        finalDiagnosis: 'Essential hypertension; T2DM (stable)',
        icd10Codes: ['I10', 'E11.9'],
        treatmentPlan: 'Increase lisinopril from 10mg to 20mg daily. Continue atorvastatin 20mg QHS, metformin 500mg BID. ' +
          'Repeat BMP in 1 week (K+ borderline). HbA1c recheck 3 months. Home BP log to be reviewed.',
        followUpInstructions: 'Return in 2 weeks for BP recheck. Call clinic if HA worsens or SBP >180.',
        doctorNotes: 'Patient counseled on DASH diet and importance of regular exercise.',
        dischargeSummary: null, isConfidential: false, accessLevel: 'Restricted'
      },
      {
        id: 'mr-2', recordNumber: 'MR-2026-001135', recordType: 'Consultation', recordDate: dateOnly(-10),
        doctorName: 'Dr. Tran Bich Thuy', appointmentNumber: 'APT-2026-000135',
        chiefComplaint: 'Chest discomfort with exertion x 2 weeks.',
        historyOfPresentIllness: 'Substernal pressure, exertional, resolves with rest. No radiation. No diaphoresis. ' +
          'Risk factors: HTN, hyperlipidemia, T2DM. Family hx of CAD.',
        physicalExamination: 'Cardiovascular: regular rate, no murmurs, no JVD. Lungs clear.',
        provisionalDiagnosis: 'Stable angina pectoris, rule out CAD',
        finalDiagnosis: 'Stable angina pectoris',
        icd10Codes: ['I20.9'],
        treatmentPlan: 'Start aspirin 81mg daily. ECG today. Order exercise stress test. ' +
          'Continue current HTN and lipid management. Consider beta-blocker if symptoms persist.',
        followUpInstructions: 'Return in 4 weeks with stress test results. ER if chest pain >15 min or with diaphoresis.',
        doctorNotes: 'Patient educated on warning signs of MI.',
        dischargeSummary: null, isConfidential: false, accessLevel: 'Restricted'
      },
    ],
    totalCount: 2,
    totalPages: 1
  },

  billing: <BillingSummary>{
    currency: 'VND',
    totalCharges: 5_750_000,
    totalPayments: 4_500_000,
    insurancePaid: 3_200_000,
    outstandingBalance: 1_250_000,
    bills: [
      {
        id: 'b-1', billNumber: 'BILL-2026-000148', billDate: dateOnly(-1), type: 'Consultation',
        totalAmount: 850_000, paidAmount: 850_000, outstandingAmount: 0, paymentStatus: 'Paid',
        dueDate: dateOnly(+10), currency: 'VND', appointmentNumber: 'APT-2026-000142',
        insuranceClaimNumber: 'ICL-2026-88991', insurancePaidAmount: 600_000, patientCopayAmount: 250_000
      },
      {
        id: 'b-2', billNumber: 'BILL-2026-000135', billDate: dateOnly(-10), type: 'Consultation',
        totalAmount: 1_500_000, paidAmount: 750_000, outstandingAmount: 750_000, paymentStatus: 'Partial',
        dueDate: dateOnly(+5), currency: 'VND', appointmentNumber: 'APT-2026-000135',
        insuranceClaimNumber: 'ICL-2026-88980', insurancePaidAmount: 1_050_000, patientCopayAmount: 450_000
      },
      {
        id: 'b-3', billNumber: 'BILL-2026-000128', billDate: dateOnly(-30), type: 'Laboratory',
        totalAmount: 1_400_000, paidAmount: 900_000, outstandingAmount: 500_000, paymentStatus: 'Partial',
        dueDate: dateOnly(-5), currency: 'VND', appointmentNumber: 'APT-2026-000128',
        insuranceClaimNumber: 'ICL-2026-88955', insurancePaidAmount: 980_000, patientCopayAmount: 420_000
      },
      {
        id: 'b-4', billNumber: 'BILL-2026-000115', billDate: dateOnly(-60), type: 'Pharmacy',
        totalAmount: 2_000_000, paidAmount: 2_000_000, outstandingAmount: 0, paymentStatus: 'Paid',
        dueDate: dateOnly(-30), currency: 'VND', appointmentNumber: null,
        insuranceClaimNumber: null, insurancePaidAmount: 0, patientCopayAmount: 2_000_000
      },
    ],
    recentPayments: [
      {
        id: 'p-1', paymentNumber: 'PAY-2026-00231', billNumber: 'BILL-2026-000148', paymentDate: dateOnly(-1),
        amount: 250_000, method: 'Card', status: 'Paid', transactionId: 'TX-998812', receiptUrl: null
      },
      {
        id: 'p-2', paymentNumber: 'PAY-2026-00220', billNumber: 'BILL-2026-000135', paymentDate: dateOnly(-9),
        amount: 750_000, method: 'BankTransfer', status: 'Paid', transactionId: 'TX-998705', receiptUrl: null
      },
      {
        id: 'p-3', paymentNumber: 'PAY-2026-00210', billNumber: 'BILL-2026-000128', paymentDate: dateOnly(-25),
        amount: 900_000, method: 'Cash', status: 'Paid', transactionId: null, receiptUrl: null
      },
    ],
  },
};
