import { NzCustomColumn } from "ng-zorro-antd/table";

export interface MenuModel {
    BaseUrl?: string,
    CreatedDate: Date,
    CreatedUserMappingId: number,
    I18n: string,
    Icon: string,
    IsActive: number,
    IsDisplayed: number,
    MenuType: number,
    NodeType: number,
    ParentId: number,
    ParentPath: string,
    PermissionCode: string,
    PermissionId: number,
    PermissionModule: string,
    Priority: number,
    RefPermissionId: number,
    Scope: string,
    Title: string,
    TitleVi: string,
    UpdatedDate: Date,
    UpdatedUserMappingId: number,
    Url: string,
    children: any[]
}

export interface CustomColumn extends NzCustomColumn {
    name: string,
    required?: boolean;
    position?: 'left' | 'right';
}

export interface Status {
    statusCode: number,
    statusName: string,
    statusColor?: string
}

export interface Token {
    accessToken?: string,
    refreshToken?: string
}