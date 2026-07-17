import { BadgeTone } from "../../../../components/ui/status-badge.component";
import { ClinicalWarningSeverity, RxMedicationItem } from "../../../../shared/types/prescription-rx.types";

export function severityTone(severity: ClinicalWarningSeverity): BadgeTone {
    switch (severity) {
        case 'Critical': return 'danger';
        case 'High': return 'danger';
        case 'Medium': return 'warning';
        case 'Low': return 'primary';
        default: return 'neutral';
    }
}

export function severityRank(severity: ClinicalWarningSeverity): number {
    switch (severity) {
        case 'Critical': return 5;
        case 'High': return 4;
        case 'Medium': return 3;
        case 'Low': return 2;
        default: return 1;
    }
}

export function severityIcon(severity: ClinicalWarningSeverity): string {
    switch (severity) {
        case 'Critical': return 'octagon-alert';
        case 'High': return 'triangle-alert';
        case 'Medium': return 'triangle-alert';
        case 'Low': return 'info';
        default: return 'info';
    }
}

export function calcBmi(heightCm?: number | null, weightKg?: number | null): number | null {
    if (!heightCm || !weightKg) return null;
    const m = heightCm / 100;
    return Math.round((weightKg / (m * m)) * 10) / 10;
}

export function formatCurrency(amount: number, currency: string): string {
    return new Intl.NumberFormat('vi-VN').format(Math.round(amount)) + ' ' + currency;
}

export function totalDailyDosesOf(item: RxMedicationItem): number {
    return Object.values(item.timing).filter(Boolean).length || (item.prn ? 0 : 1);
}

export function hasUnacknowledgedAtOrAbove(items: RxMedicationItem[], minRank: number): boolean {
    return items.some(i => i.warnings.some(w => !w.acknowledged && severityRank(w.severity) >= minRank));
}
