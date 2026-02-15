export type FilterType = 'select' | 'range-number' | 'boolean' | 'color';

export interface FilterOption {
    label: string;
    value: any;
    colorCode?: string;
}

export interface FilterConfig {
    key: string;
    label: string;
    type: FilterType;
    trueLabel?: string;
    falseLabel?: string;
    options?: FilterOption[];
    min?: number;
    max?: number;
    step?: number;
    value?: any;
}

export interface MedicalSpecialtyFilter {
    start: string,
    end: string,
    isSurgical?: boolean
}
