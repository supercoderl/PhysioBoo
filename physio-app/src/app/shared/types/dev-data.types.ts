export interface DevDataModule {
    key: string;
    label: string;
    description: string;
    dependsOn: string[];
}

export interface DevDataModuleList {
    enabled: boolean;
    maxRows: number;
    modules: DevDataModule[];
}

export interface DevDataGenerateRequest {
    tenantId: string;
    count: number;
}

export interface DevDataGenerateResult {
    batchId: string;
    created: Record<string, number>;
    warnings: string[];
}

export type DevDataModuleStatus = 'idle' | 'generating' | 'done' | 'failed';
