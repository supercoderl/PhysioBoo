export type AlertSeverity = 'critical' | 'warning' | 'info';

export type OperationTheatreStatus = 'ongoing' | 'closing' | 'scheduled';

export interface OperationalStatus {
  systemStatus: 'operational' | 'degraded' | 'down';
  erUtilizationPct: number;
  icuUtilizationPct: number;
  orActive: number;
  orTotal: number;
  criticalAlertCount: number;
  warningAlertCount: number;
  staffOnDuty: number;
  staffTotal: number;
  revenueToday: number;
  revenueTarget: number;
  shiftLabel: string;
}

export interface PatientFlowHourlyPoint {
  hour: string;
  admissions: number;
  discharges: number;
}

export interface PatientFlowSummary {
  admissionsToday: number;
  admissionsTrendPct: number;
  dischargesToday: number;
  dischargesPending: number;
  avgLengthOfStayDays: number;
  bedTurnoverRate: number;
  bedTurnoverTrendPct: number;
  hourly: PatientFlowHourlyPoint[];
}

export interface DepartmentLoad {
  name: string;
  utilizationPct: number;
  isCritical: boolean;
}

export interface AlertItem {
  id: string;
  department: string;
  message: string;
  occurredAt: string;
  severity: AlertSeverity;
}

export interface AlertsSnapshot {
  critical: AlertItem[];
  warning: AlertItem[];
  info: AlertItem[];
}

export interface WardOccupancy {
  name: string;
  occupied: number;
  total: number;
}

export interface OperationTheatre {
  room: string;
  procedure: string;
  surgeon: string;
  startedAt: string;
  etaMinutes: number;
  status: OperationTheatreStatus;
  progressPct: number;
}

export interface RevenueSnapshot {
  today: number;
  target: number;
  changePct: number;
  trend: number[];
}

export interface InsuranceClaimsSnapshot {
  pending: number;
  approvedPct: number;
  criticalCount: number;
  avgProcessingDays: number;
}

export interface PharmacySnapshot {
  dispensedToday: number;
  target: number;
  lowStockCount: number;
}

export interface LaboratorySnapshot {
  ordersPending: number;
  avgTurnaroundHours: number;
  statOrdersPending: number;
}

export interface RadiologySnapshot {
  studiesInQueue: number;
  avgReadMinutes: number;
  urgentReadsPending: number;
}

export interface FinancialClinicalSnapshot {
  revenue: RevenueSnapshot;
  insuranceClaims: InsuranceClaimsSnapshot;
  pharmacy: PharmacySnapshot;
  laboratory: LaboratorySnapshot;
  radiology: RadiologySnapshot;
}

export interface AppointmentFlowHourlySlot {
  hour: string;
  bookedPct: number;
}

export interface AppointmentFlowSummary {
  scheduled: number;
  confirmed: number;
  pending: number;
  noShows: number;
  slotsRemaining: number;
  hourly: AppointmentFlowHourlySlot[];
}

export interface StaffGroupDuty {
  onDuty: number;
  total: number;
}

export interface StaffDutySummary {
  shiftLabel: string;
  onDutyPct: number;
  doctors: StaffGroupDuty;
  nurses: StaffGroupDuty;
  technicians: StaffGroupDuty;
  admin: StaffGroupDuty;
}

export type DashboardEventCategory = 'admission' | 'discharge' | 'billing' | 'surgery' | 'lab' | 'pharmacy';

export interface DashboardEvent {
  id: string;
  text: string;
  occurredAt: string;
  category: DashboardEventCategory;
}

export interface DashboardOverviewSnapshot {
  status: OperationalStatus;
  patientFlow: PatientFlowSummary;
  departmentLoad: DepartmentLoad[];
  alerts: AlertsSnapshot;
  bedCapacity: WardOccupancy[];
  activeOperations: OperationTheatre[];
  financial: FinancialClinicalSnapshot;
  appointmentFlow: AppointmentFlowSummary;
  staffDuty: StaffDutySummary;
  recentEvents: DashboardEvent[];
}

export interface DashboardOverviewQuery {
  date?: string;
  shift?: 'morning' | 'afternoon' | 'night';
}
