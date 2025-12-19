export interface AnalyticItem {
    icon: string;
    color: string;
    current: number;
    percent: string;
    trend: number[];
}


export type AnalyticKey =
    | "patients"
    | "appointments"
    | "doctors"
    | "transactions";

export type AnalyticObjects = Record<AnalyticKey, AnalyticItem>;