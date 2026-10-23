import { BooBadgeTone } from '@physioboo/ui';
import {
  LabAlertSeverity, LabOrderStatus, LabPriority, LabResultFlag, LabVerificationStatus, SampleCollectionStatus
} from '../../../../shared/types/laboratory.types';

/** Badge tones and readable labels shared by the laboratory tabs and drawers. */

export function priorityTone(priority: LabPriority): BooBadgeTone {
  switch (priority) {
    case 'Stat': return 'danger';
    case 'Urgent': return 'warning';
    default: return 'neutral';
  }
}

export function collectionTone(status: SampleCollectionStatus): BooBadgeTone {
  switch (status) {
    case 'Collected': case 'Received': return 'success';
    case 'InTransit': return 'primary';
    case 'Rejected': return 'danger';
    default: return 'neutral';
  }
}

export function labStatusTone(status: LabOrderStatus): BooBadgeTone {
  switch (status) {
    case 'Completed': return 'success';
    case 'Processing': case 'QualityCheck': return 'primary';
    case 'Cancelled': return 'danger';
    default: return 'neutral';
  }
}

export function verificationTone(status: LabVerificationStatus): BooBadgeTone {
  switch (status) {
    case 'Verified': return 'success';
    case 'PendingVerification': return 'warning';
    default: return 'danger';
  }
}

export function flagTone(flag: LabResultFlag): BooBadgeTone {
  switch (flag) {
    case 'N': return 'neutral';
    case 'H': case 'L': return 'warning';
    default: return 'danger';
  }
}

/** Splits a PascalCase status ("PendingVerification") into words. */
export function statusLabel(status: string): string {
  return status.replace(/([a-z])([A-Z])/g, '$1 $2');
}

export const FLAG_LABELS: Record<LabResultFlag, string> = {
  N: 'Normal', H: 'High', L: 'Low', HH: 'Critical high', LL: 'Critical low',
};

export function alertTone(severity: LabAlertSeverity): BooBadgeTone {
  switch (severity) {
    case 'Critical': case 'High': return 'danger';
    case 'Warning': return 'warning';
    default: return 'primary';
  }
}
