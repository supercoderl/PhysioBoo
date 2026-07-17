export interface SequenceTracker {
    id: string;
    entityType: string;
    prefix: string;
    useDateFormating: string | null;
    sequenceLength: number;
    currentSequence: number;
    suffix: string | null;
    createdAt: Date;
    createdBy: string;
    updatedAt: Date | null;
    updatedBy: string | null;
}