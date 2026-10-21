import { BooBadgeTone } from '@physioboo/ui';
import { Bed, BedStatus } from '../../../../shared/types/bed.types';
import { Ward } from '../../../../shared/types/ward.types';

/** The statuses the backend defines (Domain BedStatus), in the order the map presents them. */
export const BED_STATUSES: BedStatus[] = ['Available', 'Occupied', 'Maintenance', 'Reserved'];

export const BED_STATUS: Record<BedStatus, { label: string; tone: BooBadgeTone; border: string }> = {
    Available: { label: 'Available', tone: 'success', border: 'border-emerald-300' },
    Occupied: { label: 'Occupied', tone: 'danger', border: 'border-rose-300' },
    Maintenance: { label: 'Maintenance', tone: 'warning', border: 'border-amber-300' },
    Reserved: { label: 'Reserved', tone: 'primary', border: 'border-primary/40' },
};

export function bedStatus(status: string): { label: string; tone: BooBadgeTone; border: string } {
    return BED_STATUS[status as BedStatus] ?? { label: status, tone: 'neutral', border: 'border-borderGray' };
}

/** A room of one ward; beds without a room number share one unlabelled group. */
export interface BedRoom {
    room: string | null;
    beds: Bed[];
}

export interface WardGroup {
    ward: Ward;
    rooms: BedRoom[];
    bedCount: number;
}

function compareText(a: string, b: string): number {
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

/** Groups a ward's beds by room, rooms and beds in natural order (so "2" sorts before "10"). */
export function groupByRoom(beds: Bed[]): BedRoom[] {
    const rooms = new Map<string, Bed[]>();
    for (const bed of beds) {
        const key = bed.roomNumber?.trim() ?? '';
        const list = rooms.get(key);
        if (list) list.push(bed);
        else rooms.set(key, [bed]);
    }
    return [...rooms.entries()]
        .sort(([a], [b]) => (a === '' ? 1 : b === '' ? -1 : compareText(a, b)))
        .map(([room, list]) => ({ room: room || null, beds: list.sort((a, b) => compareText(a.number, b.number)) }));
}

export function wardOccupancy(ward: Ward): number {
    return ward.totalBeds > 0 ? Math.round((ward.occupiedBeds / ward.totalBeds) * 100) : 0;
}
