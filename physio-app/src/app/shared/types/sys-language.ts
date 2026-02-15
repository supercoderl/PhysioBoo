export interface Language {
    id: string;
    code: string;
    name: string;
    isActive: boolean;
    flagUrl: string | null;
    isDefault: boolean;
    nativeName: string | null;
    index: number;
}