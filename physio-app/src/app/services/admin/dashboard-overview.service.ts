import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { delay } from "rxjs/operators";
import { PagedResponse } from "../../shared/types/common";
import {
    DashboardEvent,
    DashboardOverviewQuery,
    DashboardOverviewSnapshot,
} from "../../shared/types/dashboard-overview.types";

/**
 * Placeholder implementation of the proposed `/api/dashboard/*` endpoints
 * (see docs/dashboard-redesign.md, section 15). Swap the bodies for
 * `HttpClient` calls to `BASE_API.DASHBOARD.*` once the backend exists —
 * the method signatures/return shapes already match the proposed contract.
 */
@Injectable({ providedIn: 'root' })
export class DashboardOverviewService {
    getOverview(_query?: DashboardOverviewQuery): Observable<PagedResponse<DashboardOverviewSnapshot>> {
        return of(this.buildMockSnapshot()).pipe(delay(350));
    }

    dismissAlert(_alertId: string, _resolutionNote?: string): Observable<PagedResponse<{ success: boolean }>> {
        return of({ data: { success: true }, detailedErrors: [], errors: null, success: true }).pipe(delay(200));
    }

    exportReport(_request: { date: string; shift?: string; format: 'pdf' | 'xlsx' }): Observable<PagedResponse<{ fileUrl: string }>> {
        return of({ data: { fileUrl: '' }, detailedErrors: [], errors: null, success: true }).pipe(delay(400));
    }

    private buildMockSnapshot(): PagedResponse<DashboardOverviewSnapshot> {
        const admissionsHourly = [2, 3, 5, 4, 6, 8, 12, 15, 18, 14, 16, 20, 18, 22, 19, 17, 21, 18, 15, 12, 10, 8, 6, 4];
        const dischargesHourly = [0, 0, 1, 2, 3, 5, 7, 9, 12, 10, 11, 14, 16, 18, 20, 17, 15, 13, 11, 9, 7, 5, 3, 2];
        const hourLabels = Array.from({ length: 24 }, (_, i) => `${i}`.padStart(2, '0') + ':00');

        const recentEvents: DashboardEvent[] = [
            { id: 'ev-1', text: 'Patient #8847 admitted to ICU', occurredAt: '11:08', category: 'admission' },
            { id: 'ev-2', text: 'Patient #8801 discharged — Gen Ward B', occurredAt: '11:02', category: 'discharge' },
            { id: 'ev-3', text: 'Insurance claim #2847 flagged for review', occurredAt: '10:55', category: 'billing' },
            { id: 'ev-4', text: 'OR-3 Laparoscopy procedure started', occurredAt: '10:43', category: 'surgery' },
            { id: 'ev-5', text: 'STAT CBC results ready — Dr. Singh notified', occurredAt: '10:30', category: 'lab' },
            { id: 'ev-6', text: 'Low stock alert: Metformin 500mg', occurredAt: '10:22', category: 'pharmacy' },
        ];

        const snapshot: DashboardOverviewSnapshot = {
            status: {
                systemStatus: 'operational',
                erUtilizationPct: 68,
                icuUtilizationPct: 92,
                orActive: 3,
                orTotal: 5,
                criticalAlertCount: 2,
                warningAlertCount: 4,
                staffOnDuty: 204,
                staffTotal: 218,
                revenueToday: 52400,
                revenueTarget: 65000,
                shiftLabel: 'Morning Shift',
            },
            patientFlow: {
                admissionsToday: 108,
                admissionsTrendPct: 8,
                dischargesToday: 94,
                dischargesPending: 14,
                avgLengthOfStayDays: 4.2,
                bedTurnoverRate: 1.8,
                bedTurnoverTrendPct: -3,
                hourly: hourLabels.map((hour, i) => ({ hour, admissions: admissionsHourly[i], discharges: dischargesHourly[i] })),
            },
            departmentLoad: [
                { name: 'ICU', utilizationPct: 92, isCritical: true },
                { name: 'Emergency', utilizationPct: 78, isCritical: false },
                { name: 'Surgery', utilizationPct: 73, isCritical: false },
                { name: 'General A', utilizationPct: 80, isCritical: false },
                { name: 'Pediatrics', utilizationPct: 60, isCritical: false },
                { name: 'Oncology', utilizationPct: 70, isCritical: false },
                { name: 'Maternity', utilizationPct: 75, isCritical: false },
                { name: 'Radiology', utilizationPct: 55, isCritical: false },
            ],
            alerts: {
                critical: [
                    { id: 'al-1', department: 'ICU', message: 'ICU Bed 7 — patient deteriorating, O₂ saturation 82%', occurredAt: '09:14', severity: 'critical' },
                    { id: 'al-2', department: 'General', message: 'Code Blue — Ward 3 Room 312, cardiopulmonary arrest', occurredAt: '08:52', severity: 'critical' },
                ],
                warning: [
                    { id: 'al-3', department: 'Lab', message: 'STAT lab turnaround exceeded 4h threshold', occurredAt: '10:23', severity: 'warning' },
                    { id: 'al-4', department: 'Pharmacy', message: 'Blood bank: Type O– critically low — 2 units remaining', occurredAt: '10:11', severity: 'warning' },
                    { id: 'al-5', department: 'Emergency', message: 'ER wait time exceeds 45 min — 8 patients queued', occurredAt: '09:45', severity: 'warning' },
                    { id: 'al-6', department: 'Radiology', message: 'CT Scanner B preventive maintenance overdue by 3 days', occurredAt: '09:30', severity: 'warning' },
                ],
                info: [
                    { id: 'al-7', department: 'CRM', message: 'Dr. Chen rescheduled 3 patients — next slot Thursday', occurredAt: '11:02', severity: 'info' },
                    { id: 'al-8', department: 'Finance', message: 'Insurance claim #2847 requires additional documentation', occurredAt: '10:55', severity: 'info' },
                    { id: 'al-9', department: 'HR', message: 'Shift change: afternoon team arriving at 14:00', occurredAt: '10:40', severity: 'info' },
                ],
            },
            bedCapacity: [
                { name: 'ICU', occupied: 18, total: 20 },
                { name: 'Emergency', occupied: 24, total: 30 },
                { name: 'Gen Ward A', occupied: 40, total: 50 },
                { name: 'Gen Ward B', occupied: 35, total: 50 },
                { name: 'Pediatrics', occupied: 18, total: 30 },
                { name: 'Surgery', occupied: 22, total: 30 },
                { name: 'Maternity', occupied: 15, total: 20 },
                { name: 'Oncology', occupied: 28, total: 40 },
            ],
            activeOperations: [
                { room: 'OR-1', procedure: 'Appendectomy', surgeon: 'Dr. Williams', startedAt: '08:30', etaMinutes: 90, status: 'ongoing', progressPct: 65 },
                { room: 'OR-2', procedure: 'Hip Replacement', surgeon: 'Dr. Martinez', startedAt: '09:00', etaMinutes: 180, status: 'ongoing', progressPct: 40 },
                { room: 'OR-3', procedure: 'Laparoscopy', surgeon: 'Dr. Chen', startedAt: '10:15', etaMinutes: 45, status: 'closing', progressPct: 88 },
            ],
            financial: {
                revenue: { today: 52400, target: 65000, changePct: 8, trend: [42, 48, 45, 52, 49, 58, 52.4] },
                insuranceClaims: { pending: 234, approvedPct: 72, criticalCount: 12, avgProcessingDays: 4.2 },
                pharmacy: { dispensedToday: 1247, target: 1520, lowStockCount: 3 },
                laboratory: { ordersPending: 89, avgTurnaroundHours: 2.8, statOrdersPending: 4 },
                radiology: { studiesInQueue: 34, avgReadMinutes: 45, urgentReadsPending: 2 },
            },
            appointmentFlow: {
                scheduled: 158,
                confirmed: 112,
                pending: 31,
                noShows: 15,
                slotsRemaining: 42,
                hourly: [
                    { hour: '8AM', bookedPct: 60 }, { hour: '9AM', bookedPct: 90 },
                    { hour: '10AM', bookedPct: 100 }, { hour: '11AM', bookedPct: 100 },
                    { hour: '12PM', bookedPct: 75 }, { hour: '1PM', bookedPct: 50 },
                    { hour: '2PM', bookedPct: 95 }, { hour: '3PM', bookedPct: 100 },
                    { hour: '4PM', bookedPct: 85 }, { hour: '5PM', bookedPct: 70 },
                    { hour: '6PM', bookedPct: 40 }, { hour: '7PM', bookedPct: 15 },
                ],
            },
            staffDuty: {
                shiftLabel: 'Morning shift · 06:00–14:00',
                onDutyPct: 94,
                doctors: { onDuty: 48, total: 52 },
                nurses: { onDuty: 98, total: 104 },
                technicians: { onDuty: 34, total: 38 },
                admin: { onDuty: 24, total: 24 },
            },
            recentEvents,
        };

        return { data: snapshot, detailedErrors: [], errors: null, success: true };
    }
}
